-- ============================================================
-- Unified Talent Management Hub - Delta Table DDL
-- Databricks Unity Catalog Tables
-- ============================================================

-- Set the catalog and schema
USE CATALOG talent_management;
CREATE SCHEMA IF NOT EXISTS unified_hub;
USE SCHEMA unified_hub;

-- ============================================================
-- SECTION 1: EMPLOYEE DATA TABLES
-- ============================================================

-- Employees table (from HRIS - Lakeflow Connect)
CREATE TABLE IF NOT EXISTS employees (
    employee_id STRING NOT NULL COMMENT 'Unique employee identifier',
    name STRING NOT NULL COMMENT 'Employee full name',
    email STRING COMMENT 'Employee email address (PII - masked)',
    title STRING COMMENT 'Job title',
    department STRING COMMENT 'Department name',
    level STRING COMMENT 'Job level (L1-L10, M1-M5)',
    manager_id STRING COMMENT 'Manager employee ID',
    hire_date DATE COMMENT 'Date of hire',
    tenure_months INT COMMENT 'Months of tenure',
    location STRING COMMENT 'Work location',
    salary DECIMAL(12,2) COMMENT 'Annual salary (PII - masked)',
    is_manager BOOLEAN COMMENT 'Is this employee a manager',
    created_at TIMESTAMP DEFAULT current_timestamp(),
    updated_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Employee master data from HRIS system'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- Column-level masking for PII
ALTER TABLE employees ALTER COLUMN email SET MASK mask_pii_email;
ALTER TABLE employees ALTER COLUMN salary SET MASK mask_salary;

-- ============================================================
-- SECTION 2: THOMAS INTERNATIONAL ASSESSMENT DATA
-- ============================================================

-- Thomas Assessments (PPA, GIA, HPTI)
CREATE TABLE IF NOT EXISTS thomas_assessments (
    assessment_id STRING NOT NULL COMMENT 'Unique assessment ID',
    employee_id STRING NOT NULL COMMENT 'Employee ID reference',
    assessment_date DATE COMMENT 'Date assessment was completed',
    
    -- PPA (Personal Profile Analysis) - DISC Based
    ppa_dominance INT COMMENT 'PPA Dominance score (0-100)',
    ppa_influence INT COMMENT 'PPA Influence score (0-100)',
    ppa_steadiness INT COMMENT 'PPA Steadiness score (0-100)',
    ppa_compliance INT COMMENT 'PPA Compliance score (0-100)',
    
    -- GIA (General Intelligence Assessment)
    gia_overall INT COMMENT 'GIA overall score',
    gia_perceptual_speed INT COMMENT 'GIA Perceptual Speed',
    gia_reasoning INT COMMENT 'GIA Reasoning',
    gia_number_speed INT COMMENT 'GIA Number Speed/Accuracy',
    gia_word_meaning INT COMMENT 'GIA Word Meaning',
    gia_spatial INT COMMENT 'GIA Spatial Visualization',
    
    -- HPTI (High Potential Trait Indicator)
    hpti_conscientiousness INT COMMENT 'HPTI Conscientiousness (0-100)',
    hpti_adjustment INT COMMENT 'HPTI Adjustment/Resilience (0-100)',
    hpti_curiosity INT COMMENT 'HPTI Curiosity (0-100)',
    hpti_risk_approach INT COMMENT 'HPTI Risk Approach (0-100)',
    hpti_ambiguity_acceptance INT COMMENT 'HPTI Ambiguity Acceptance (0-100)',
    hpti_competitiveness INT COMMENT 'HPTI Competitiveness (0-100)',
    
    created_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Thomas International psychometric assessment scores'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold',
    'source' = 'Thomas International API'
);

-- ============================================================
-- SECTION 3: RECRUITMENT PIPELINE DATA
-- ============================================================

-- Open Roles / Requisitions (from Greenhouse/Workday)
CREATE TABLE IF NOT EXISTS recruitment_pipeline (
    role_id STRING NOT NULL COMMENT 'Unique requisition ID',
    title STRING NOT NULL COMMENT 'Job title',
    department STRING COMMENT 'Department',
    level STRING COMMENT 'Job level',
    hiring_manager_id STRING COMMENT 'Hiring manager employee ID',
    status STRING COMMENT 'Role status (Open, Closed, On Hold)',
    priority STRING COMMENT 'Priority (Critical, High, Medium, Low)',
    target_hire_date DATE COMMENT 'Target date to fill the role',
    target_offer_date DATE COMMENT 'Target offer date',
    target_final_round DATE COMMENT 'Target final round date',
    target_onsite DATE COMMENT 'Target onsite interview date',
    target_tech_assessment DATE COMMENT 'Target technical assessment date',
    target_phone_interview DATE COMMENT 'Target phone interview date',
    min_salary DECIMAL(12,2) COMMENT 'Minimum salary for role',
    max_salary DECIMAL(12,2) COMMENT 'Maximum salary for role',
    required_interviews_per_week INT COMMENT 'Calculated weekly interview target',
    current_pipeline_count INT COMMENT 'Current candidates in pipeline',
    created_date DATE COMMENT 'Date role was opened',
    closed_date DATE COMMENT 'Date role was filled/closed',
    created_at TIMESTAMP DEFAULT current_timestamp(),
    updated_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Recruitment requisitions and pipeline data'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold',
    'source' = 'Greenhouse/Workday via Lakeflow Connect'
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
    candidate_id STRING NOT NULL COMMENT 'Unique candidate ID',
    name STRING NOT NULL COMMENT 'Candidate full name (PII)',
    email STRING COMMENT 'Candidate email (PII)',
    role_id STRING COMMENT 'Role they applied for',
    role_title STRING COMMENT 'Role title',
    current_stage STRING COMMENT 'Current interview stage',
    stage_order INT COMMENT 'Numeric order of stage',
    stage_benchmark_confidence DECIMAL(5,2) COMMENT 'Expected confidence at this stage',
    candidate_confidence DECIMAL(5,2) COMMENT 'Calculated candidate confidence score',
    confidence_status STRING COMMENT 'On Track, Below Benchmark, etc.',
    match_score DECIMAL(5,2) COMMENT 'Match score vs ideal profile',
    
    -- Thomas Assessment Scores for Candidates
    ppa_dominance INT,
    ppa_influence INT,
    ppa_steadiness INT,
    ppa_compliance INT,
    gia_score INT,
    hpti_conscientiousness INT,
    hpti_adjustment INT,
    hpti_curiosity INT,
    hpti_risk_approach INT,
    hpti_ambiguity_acceptance INT,
    hpti_competitiveness INT,
    
    -- Interview Scores
    screening_score INT,
    phone_interview_score INT,
    technical_score INT,
    onsite_score INT,
    final_round_score INT,
    
    -- Compensation & Negotiation
    expected_salary DECIMAL(12,2),
    negotiation_flexibility STRING COMMENT 'Low, Medium, High',
    source STRING COMMENT 'Recruitment source',
    applied_date DATE,
    
    created_at TIMESTAMP DEFAULT current_timestamp(),
    updated_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Candidate data with assessment scores'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- Column masking for candidate PII
ALTER TABLE candidates ALTER COLUMN email SET MASK mask_pii_email;

-- ============================================================
-- SECTION 4: INTERACTION & ACTIVITY DATA
-- ============================================================

-- Interaction Logs (Interviews, calls, notes)
CREATE TABLE IF NOT EXISTS interaction_logs (
    interaction_id STRING NOT NULL COMMENT 'Unique interaction ID',
    candidate_id STRING COMMENT 'Candidate ID if recruitment',
    employee_id STRING COMMENT 'Employee ID if performance',
    role_id STRING COMMENT 'Role ID if recruitment',
    interaction_type STRING COMMENT 'Interview, Assessment, Zoom Call, etc.',
    stage STRING COMMENT 'Interview stage',
    interviewer_id STRING COMMENT 'Interviewer employee ID',
    date DATE COMMENT 'Interaction date',
    duration_minutes INT COMMENT 'Duration in minutes',
    score INT COMMENT 'Score given (0-100)',
    sentiment STRING COMMENT 'Positive, Neutral, Mixed, Negative',
    notes STRING COMMENT 'Interview notes (GenAI summarized)',
    recommendation STRING COMMENT 'Strong Hire, Hire, No Hire, etc.',
    transcript_summary STRING COMMENT 'LLM-generated transcript summary',
    created_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Interview interactions and feedback logs'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
);

-- ============================================================
-- SECTION 5: PERFORMANCE METRICS
-- ============================================================

-- Performance Metrics (CRM, Jira, Slack sentiment)
CREATE TABLE IF NOT EXISTS performance_metrics (
    metric_id STRING NOT NULL COMMENT 'Unique metric ID',
    employee_id STRING NOT NULL COMMENT 'Employee ID',
    quarter STRING COMMENT 'Quarter (e.g., 2024-Q4)',
    
    -- Core Performance
    performance_score DECIMAL(4,2) COMMENT 'Overall performance score (0-1)',
    goal_completion_rate DECIMAL(4,2) COMMENT 'Goal completion percentage',
    
    -- Sales Metrics (if applicable)
    revenue DECIMAL(14,2) COMMENT 'Revenue generated',
    deals_closed INT COMMENT 'Number of deals closed',
    pipeline_value DECIMAL(14,2) COMMENT 'Sales pipeline value',
    
    -- Engineering Metrics (if applicable)
    jira_velocity INT COMMENT 'Jira story points completed',
    code_reviews INT COMMENT 'Code reviews completed',
    pr_merged INT COMMENT 'Pull requests merged',
    
    -- People Metrics
    morale_score INT COMMENT 'Morale score (0-100)',
    slack_sentiment DECIMAL(4,2) COMMENT 'Slack sentiment score (0-1)',
    manager_rating INT COMMENT 'Manager rating (1-5)',
    peer_feedback_score INT COMMENT 'Peer feedback score (0-100)',
    
    -- Leadership & Risk
    leadership_readiness INT COMMENT 'Leadership readiness score (0-100)',
    churn_risk STRING COMMENT 'Churn risk level (Low, Medium, High)',
    churn_risk_score INT COMMENT 'Numeric churn risk (0-100)',
    
    created_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Employee performance metrics aggregated from CRM, Jira, Slack'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold',
    'source' = 'CRM, Jira, Slack via Lakeflow Connect'
);

-- ============================================================
-- SECTION 6: CONFIGURATION & ANALYTICS
-- ============================================================

-- Analytics Defaults (scoring weights by role)
CREATE TABLE IF NOT EXISTS analytics_defaults (
    role_type STRING NOT NULL COMMENT 'Role type category',
    coding_assessment_weight DECIMAL(4,2) COMMENT 'Weight for coding assessment',
    technical_interview_weight DECIMAL(4,2) COMMENT 'Weight for technical interview',
    ppa_weight DECIMAL(4,2) COMMENT 'Weight for PPA score',
    gia_weight DECIMAL(4,2) COMMENT 'Weight for GIA score',
    hpti_weight DECIMAL(4,2) COMMENT 'Weight for HPTI score',
    created_at TIMESTAMP DEFAULT current_timestamp(),
    updated_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Default scoring weights by role type'
TBLPROPERTIES ('quality' = 'gold');

-- Insert default weights
INSERT INTO analytics_defaults VALUES
    ('Software Engineer', 0.35, 0.25, 0.15, 0.15, 0.10, current_timestamp(), current_timestamp()),
    ('Product Manager', 0.10, 0.20, 0.30, 0.20, 0.20, current_timestamp(), current_timestamp()),
    ('Data Scientist', 0.30, 0.25, 0.15, 0.20, 0.10, current_timestamp(), current_timestamp()),
    ('Sales', 0.00, 0.15, 0.35, 0.20, 0.30, current_timestamp(), current_timestamp()),
    ('Engineering Manager', 0.15, 0.20, 0.25, 0.15, 0.25, current_timestamp(), current_timestamp());

-- Manager Overrides (logged for HR analysis)
CREATE TABLE IF NOT EXISTS manager_overrides (
    override_id STRING NOT NULL COMMENT 'Unique override ID',
    manager_id STRING NOT NULL COMMENT 'Manager who made override',
    role_id STRING COMMENT 'Role this applies to',
    coding_assessment_weight DECIMAL(4,2),
    technical_interview_weight DECIMAL(4,2),
    ppa_weight DECIMAL(4,2),
    gia_weight DECIMAL(4,2),
    hpti_weight DECIMAL(4,2),
    override_date DATE,
    reason STRING COMMENT 'Reason for override',
    created_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Manager weight overrides for HR analysis'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- Ideal Profiles (pre-computed from top performers)
CREATE TABLE IF NOT EXISTS ideal_profiles (
    role_title STRING NOT NULL COMMENT 'Role title',
    department STRING COMMENT 'Department',
    ppa_dominance INT,
    ppa_influence INT,
    ppa_steadiness INT,
    ppa_compliance INT,
    gia_overall INT,
    hpti_conscientiousness INT,
    hpti_adjustment INT,
    hpti_curiosity INT,
    sample_size INT COMMENT 'Number of top performers analyzed',
    last_computed TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Ideal candidate profiles based on top performer analysis'
TBLPROPERTIES ('quality' = 'gold');

-- Employee Events (upcoming critical events)
CREATE TABLE IF NOT EXISTS employee_events (
    event_id STRING NOT NULL COMMENT 'Unique event ID',
    employee_id STRING NOT NULL COMMENT 'Employee ID',
    employee_name STRING COMMENT 'Employee name',
    event_type STRING COMMENT 'Vacation, Medical Leave, etc.',
    description STRING COMMENT 'Event description',
    start_date DATE COMMENT 'Event start date',
    end_date DATE COMMENT 'Event end date',
    is_critical BOOLEAN COMMENT 'Is this a critical event',
    manager_id STRING COMMENT 'Manager to notify',
    created_at TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
COMMENT 'Employee events and absences'
TBLPROPERTIES ('quality' = 'silver');

-- ============================================================
-- SECTION 7: VIEWS FOR COMMON QUERIES
-- ============================================================

-- View: Team Performance Dashboard
CREATE OR REPLACE VIEW v_team_performance AS
SELECT 
    e.manager_id,
    m.name as manager_name,
    COUNT(DISTINCT e.employee_id) as team_size,
    AVG(p.performance_score) as avg_performance,
    AVG(p.morale_score) as avg_morale,
    SUM(CASE WHEN p.churn_risk = 'High' THEN 1 ELSE 0 END) as high_risk_count,
    SUM(p.revenue) as total_revenue,
    AVG(p.leadership_readiness) as avg_leadership_readiness
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id
JOIN performance_metrics p ON e.employee_id = p.employee_id
WHERE p.quarter = date_format(current_date(), 'yyyy') || '-Q' || quarter(current_date())
GROUP BY e.manager_id, m.name;

-- View: Recruitment Pipeline Status
CREATE OR REPLACE VIEW v_recruitment_status AS
SELECT 
    r.role_id,
    r.title,
    r.department,
    r.priority,
    r.target_hire_date,
    datediff(r.target_hire_date, current_date()) as days_until_target,
    COUNT(c.candidate_id) as total_candidates,
    SUM(CASE WHEN c.current_stage = 'Screening' THEN 1 ELSE 0 END) as screening,
    SUM(CASE WHEN c.current_stage = 'Phone Interview' THEN 1 ELSE 0 END) as phone,
    SUM(CASE WHEN c.current_stage = 'Technical Assessment' THEN 1 ELSE 0 END) as tech,
    SUM(CASE WHEN c.current_stage = 'Onsite Interview' THEN 1 ELSE 0 END) as onsite,
    SUM(CASE WHEN c.current_stage = 'Final Round' THEN 1 ELSE 0 END) as final
FROM recruitment_pipeline r
LEFT JOIN candidates c ON r.role_id = c.role_id
WHERE r.status = 'Open'
GROUP BY r.role_id, r.title, r.department, r.priority, r.target_hire_date;

-- ============================================================
-- SECTION 8: AI/ML FUNCTIONS (Mosaic AI)
-- ============================================================

-- Function: Summarize Interview Transcript (calls LLM)
CREATE OR REPLACE FUNCTION summarize_transcript(transcript STRING)
RETURNS STRING
LANGUAGE SQL
RETURN ai_query(
    'databricks-meta-llama-3-1-70b-instruct',
    CONCAT(
        'Summarize this interview transcript in 3-4 sentences, ',
        'highlighting key strengths and any concerns: ',
        transcript
    )
);

-- Function: Calculate Match Score
CREATE OR REPLACE FUNCTION calculate_match_score(
    candidate_ppa_d INT, candidate_ppa_i INT, candidate_ppa_s INT, candidate_ppa_c INT,
    ideal_ppa_d INT, ideal_ppa_i INT, ideal_ppa_s INT, ideal_ppa_c INT
)
RETURNS DECIMAL(5,2)
LANGUAGE SQL
RETURN (
    100 - (
        ABS(candidate_ppa_d - ideal_ppa_d) +
        ABS(candidate_ppa_i - ideal_ppa_i) +
        ABS(candidate_ppa_s - ideal_ppa_s) +
        ABS(candidate_ppa_c - ideal_ppa_c)
    ) / 4.0
);

-- ============================================================
-- SECTION 9: GRANTS & PERMISSIONS
-- ============================================================

-- Grant permissions to HR group
GRANT SELECT ON TABLE employees TO `hr_analysts`;
GRANT SELECT ON TABLE thomas_assessments TO `hr_analysts`;
GRANT SELECT ON TABLE performance_metrics TO `hr_analysts`;
GRANT SELECT, INSERT ON TABLE manager_overrides TO `hr_analysts`;

-- Grant permissions to managers group
GRANT SELECT ON TABLE employees TO `managers`;
GRANT SELECT ON TABLE candidates TO `managers`;
GRANT SELECT ON TABLE recruitment_pipeline TO `managers`;
GRANT SELECT ON TABLE interaction_logs TO `managers`;
GRANT SELECT ON TABLE analytics_defaults TO `managers`;
GRANT INSERT ON TABLE manager_overrides TO `managers`;

-- Grant permissions to app service principal
GRANT SELECT ON SCHEMA unified_hub TO `talent_hub_app`;
GRANT INSERT ON TABLE manager_overrides TO `talent_hub_app`;
GRANT EXECUTE ON FUNCTION summarize_transcript TO `talent_hub_app`;
GRANT EXECUTE ON FUNCTION calculate_match_score TO `talent_hub_app`;
