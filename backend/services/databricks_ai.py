"""
Databricks AI Service
Integrates SQL Warehouse AI Functions and Model Serving Endpoints
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Connection details
DATABRICKS_HOST = "fevm-ismailmakhlouf-demo-ws.cloud.databricks.com"
SQL_WAREHOUSE_HTTP_PATH = "/sql/1.0/warehouses/54da90976fc8c514"
MODEL_ENDPOINT = "databricks-gemini-2-5-flash"

# Thomas International context for AskThom
THOMAS_CONTEXT = """
## Thomas International - Psychometric Assessment Products

### Core Products:
1. **PPA (Personal Profile Analysis)** - DISC-based behavioral assessment measuring:
   - Dominance (D): How you respond to problems and challenges
   - Influence (I): How you influence others to your point of view
   - Steadiness (S): How you respond to the pace of the environment
   - Compliance (C): How you respond to rules and procedures set by others
   
2. **GIA (General Intelligence Assessment)** - Fluid intelligence test measuring:
   - Reasoning speed, perceptual speed, number speed/accuracy
   - Word meaning, spatial visualization
   - Overall cognitive ability and trainability
   
3. **HPTI (High Potential Trait Indicator)** - Leadership traits assessment:
   - Conscientiousness: Drive for achievement and attention to detail
   - Adjustment: Emotional stability and stress resilience
   - Curiosity: Openness to new ideas and learning
   - Risk Approach: Tendency toward calculated risk-taking
   - Ambiguity Acceptance: Comfort with uncertainty
   - Competitiveness: Drive to win and be the best

4. **TEIQue (Trait Emotional Intelligence Questionnaire)** - Emotional intelligence measuring:
   - Well-being, self-control, emotionality, sociability
   
5. **Engage** - Employee engagement assessment for organizational health

6. **Thomas Connect** - Platform for team composition and collaboration insights

7. **Chemistry Score** - Psychometric compatibility between team members

8. **Interpersonal Flexibility** - NEW: Measures ability to work effectively with people despite personality differences

### Thomas Assessment Interpretation:
- Scores are typically 0-100 or percentile-based
- Higher is not always better - context matters for role fit
- PPA profiles should match job demands, not a "perfect" score
- GIA predicts trainability and learning speed
- HPTI predicts leadership potential and senior role fit
"""

IFS_CONTEXT = """
## IFS Cloud - Enterprise Software

### About IFS:
IFS is a global enterprise cloud software company headquartered in Linköping, Sweden, serving 6,000+ customers worldwide. IFS Cloud unifies assets, operations, and service with Industrial AI.

### IFS Products:
1. **IFS Cloud** - Unified enterprise platform with Industrial AI
   - ERP (Enterprise Resource Planning)
   - EAM (Enterprise Asset Management)  
   - FSM (Field Service Management)
   - Supply Chain Management
   - Industrial AI capabilities

2. **IFS Industrial AI** - AI that predicts, orchestrates, and acts in the flow of work
   - Predictive maintenance
   - Demand forecasting
   - Resource optimization
   - Intelligent scheduling

### IFS Global Offices:
- Linköping, Sweden (HQ)
- Stockholm, Sweden
- Staines, UK
- Sydney, Australia
- Colombo, Sri Lanka
- Other locations across 80+ countries

### IFS Key Industries:
- Aerospace & Defense
- Energy, Utilities & Resources
- Manufacturing
- Construction & Engineering
- Telecommunications
"""

APPLICATION_CONTEXT = """
## IFS Talent Hub Application - Powered by Thomas International

### Application Purpose:
This is the IFS Talent Hub, an internal talent management application for IFS employees and managers. It provides:

1. **Recruitment Intelligence**:
   - Open roles dashboard with hiring timelines and milestones
   - Candidate pipeline with Thomas assessments (PPA, GIA, HPTI)
   - Ideal candidate profiles based on top performer data
   - Interview stage tracking with benchmarked confidence scores
   - Negotiation coach with personality-based advice
   - Bias pitfall detection for interviewers
   - AI-generated candidate highlights/lowlights

2. **Performance Management**:
   - Manager dashboard with business and people metrics
   - Employee profiles with psychometric assessments
   - Team collaboration and chemistry insights
   - Churn risk analysis and recommendations
   - Leadership potential predictions

### Key Metrics Explained:
- **Match Score**: How closely a candidate matches the ideal profile for the role (0-100%)
- **Confidence Score**: Reliability of the match score based on data available (increases through interview stages)
- **Chemistry Score**: Thomas-powered compatibility prediction between team members (0-100)
- **Relationship Score**: Actual working relationship quality based on collaboration data (0-100)
- **Interpersonal Flexibility**: Ability to work with people despite personality differences (0-100)
- **Churn Risk**: Predicted likelihood of employee leaving based on engagement signals

### Powered by:
- Thomas Connect (team composition)
- Thomas Insights (psychometric analysis)
- Mosaic AI (Databricks GenAI)
- IFS Cloud Integration (HR/ERP data)
"""

FULL_THOM_CONTEXT = f"""You are Thom, an AI assistant for the IFS Talent Hub application, powered by Thomas International psychometric science and Databricks AI.

{THOMAS_CONTEXT}

{IFS_CONTEXT}

{APPLICATION_CONTEXT}

### Your Personality:
- Professional, helpful, and knowledgeable about HR and talent management
- Expert in Thomas International psychometric assessments
- Familiar with IFS Cloud enterprise software and the IFS organization
- Data-driven but empathetic about people decisions
- Provide specific, actionable advice
- When mentioning Thomas products (PPA, GIA, HPTI, TEIQue, Engage, Chemistry, Interpersonal Flexibility, Thomas Connect, Thomas Insights), these are important
- When mentioning IFS products (IFS Cloud, Industrial AI, ERP, EAM, FSM), these are also important

### Response Guidelines:
- Be concise but thorough
- Reference specific Thomas metrics when relevant
- Explain psychometric concepts in accessible language
- Provide actionable recommendations
- Acknowledge limitations when data is insufficient
"""


@dataclass
class DatabricksAIService:
    """Service for Databricks AI functions via SQL Warehouse and Model Serving"""
    
    host: str = DATABRICKS_HOST
    http_path: str = SQL_WAREHOUSE_HTTP_PATH
    model_endpoint: str = MODEL_ENDPOINT
    token: Optional[str] = None
    _connection = None
    _warmed_up: bool = False
    _workspace_client = None
    
    def __post_init__(self):
        # Get token from environment or use app service principal
        self.token = os.getenv("DATABRICKS_TOKEN", "")
        
        # Override host if set in environment
        env_host = os.getenv("DATABRICKS_HOST", "")
        if env_host:
            self.host = env_host.replace("https://", "").replace("http://", "")
        
        # Override warehouse if set
        warehouse_id = os.getenv("DATABRICKS_WAREHOUSE_ID", "")
        if warehouse_id:
            self.http_path = f"/sql/1.0/warehouses/{warehouse_id}"
        
        # Override model endpoint if set
        env_model = os.getenv("DATABRICKS_MODEL_ENDPOINT", "")
        if env_model:
            self.model_endpoint = env_model
        
        logger.info(f"DatabricksAIService initialized: host={self.host}, model={self.model_endpoint}")
    
    def _get_workspace_client(self):
        """Get or create WorkspaceClient with proper authentication"""
        if self._workspace_client is None:
            try:
                from databricks.sdk import WorkspaceClient
                
                host_url = f"https://{self.host}" if not self.host.startswith("http") else self.host
                
                # When running as Databricks App, use default auth (service principal)
                if self.token:
                    logger.info(f"Creating WorkspaceClient with token for {host_url}")
                    self._workspace_client = WorkspaceClient(
                        host=host_url,
                        token=self.token
                    )
                else:
                    # Use default authentication (works with Databricks Apps service principal)
                    logger.info(f"Creating WorkspaceClient with default auth for {host_url}")
                    self._workspace_client = WorkspaceClient(host=host_url)
                
                # Test the connection by listing endpoints (lightweight call)
                try:
                    endpoints = list(self._workspace_client.serving_endpoints.list())
                    logger.info(f"WorkspaceClient initialized successfully, found {len(endpoints)} serving endpoints")
                except Exception as test_err:
                    logger.warning(f"WorkspaceClient created but test failed: {test_err}")
                    
            except Exception as e:
                logger.error(f"Failed to create WorkspaceClient: {e}")
                import traceback
                logger.error(traceback.format_exc())
                return None
        return self._workspace_client
    
    def get_connection(self):
        """Get or create SQL connection"""
        if self._connection is None:
            try:
                from databricks import sql
                self._connection = sql.connect(
                    server_hostname=self.host,
                    http_path=self.http_path,
                    access_token=self.token,
                )
                logger.info("Connected to Databricks SQL Warehouse")
            except Exception as e:
                logger.warning(f"Could not connect to SQL Warehouse: {e}")
                return None
        return self._connection
    
    def warmup(self) -> bool:
        """Warm up the SQL warehouse with a simple query"""
        try:
            conn = self.get_connection()
            if conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1 as warmup")
                cursor.fetchone()
                cursor.close()
                self._warmed_up = True
                logger.info("SQL Warehouse warmed up successfully")
                return True
        except Exception as e:
            logger.warning(f"Warmup failed: {e}")
        return False
    
    def extract_cv_insights_sql(self, cv_text: str, candidate_name: str) -> Optional[Dict[str, Any]]:
        """Extract CV insights using Model Serving endpoint (faster than SQL AI functions)"""
        try:
            from databricks.sdk.service.serving import ChatMessage, ChatMessageRole
            
            w = self._get_workspace_client()
            if not w:
                logger.warning("No workspace client for CV extraction")
                return None
            
            prompt = f"""Extract professional insights from this CV for {candidate_name}. 
Return a JSON object with these exact keys:
- skills: array of technical skills
- years_experience: number
- education: array of objects with degree, field, institution
- certifications: array of certification names
- languages: array of languages
- summary: 2-3 sentence professional summary

CV Content:
{cv_text[:4000]}

Return ONLY valid JSON, no markdown or explanation."""

            logger.info(f"Extracting CV insights for {candidate_name} via model serving")
            
            messages = [
                ChatMessage(role=ChatMessageRole.USER, content=prompt)
            ]
            
            response = w.serving_endpoints.query(
                name=self.model_endpoint,
                messages=messages,
                max_tokens=800,
            )
            
            result_text = response.choices[0].message.content
            logger.info(f"CV extraction response received: {len(result_text)} chars")
            
            # Try to parse JSON from the response
            # Sometimes models wrap JSON in markdown code blocks
            import re
            json_match = re.search(r'\{[\s\S]*\}', result_text)
            if json_match:
                return json.loads(json_match.group())
            
            return json.loads(result_text)
            
        except Exception as e:
            logger.warning(f"SQL CV extraction failed: {e}")
        
        return None
    
    def ask_thom(self, question: str, context: Optional[str] = None) -> str:
        """Ask Thom a question using the model serving endpoint"""
        try:
            from databricks.sdk.service.serving import ChatMessage, ChatMessageRole
            
            w = self._get_workspace_client()
            if not w:
                logger.warning("No workspace client available, using fallback")
                return self._fallback_response(question, context)
            
            system_prompt = FULL_THOM_CONTEXT
            if context:
                system_prompt += f"\n\n### Current Context:\n{context}"
            
            logger.info(f"Calling model endpoint: {self.model_endpoint}")
            
            # Use ChatMessage objects instead of plain dicts
            messages = [
                ChatMessage(role=ChatMessageRole.SYSTEM, content=system_prompt),
                ChatMessage(role=ChatMessageRole.USER, content=question)
            ]
            
            response = w.serving_endpoints.query(
                name=self.model_endpoint,
                messages=messages,
                max_tokens=1000,
            )
            
            logger.info("Model serving call successful")
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Model serving failed: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return self._fallback_response(question, context)
    
    def _fallback_response(self, question: str, context: Optional[str] = None) -> str:
        """Fallback response when Databricks is unavailable"""
        question_lower = question.lower()
        
        if any(term in question_lower for term in ['ppa', 'disc', 'dominance', 'influence', 'steadiness', 'compliance']):
            return """The PPA (Personal Profile Analysis) is Thomas International's DISC-based behavioral assessment. It measures four dimensions:

• **Dominance (D)**: How you respond to problems and challenges - higher scores indicate assertiveness and directness
• **Influence (I)**: How you persuade others - higher scores show sociability and enthusiasm  
• **Steadiness (S)**: Your response to pace and consistency - higher scores indicate patience and dependability
• **Compliance (C)**: How you respond to rules and procedures - higher scores show attention to detail and accuracy

For role fit, we match candidate PPA profiles against our ideal profiles derived from top performers in similar roles. Would you like me to explain how to interpret a specific candidate's PPA results?"""

        elif any(term in question_lower for term in ['gia', 'intelligence', 'cognitive']):
            return """The GIA (General Intelligence Assessment) measures fluid intelligence and cognitive ability. It predicts:

• **Learning speed**: How quickly someone can acquire new skills
• **Trainability**: Potential for development and growth
• **Problem-solving**: Ability to work with abstract concepts

GIA scores are particularly valuable for roles requiring rapid skill acquisition or complex problem-solving. Higher scores correlate with faster onboarding and greater adaptability to change. Let me know if you'd like specific guidance on interpreting GIA results for a candidate."""

        elif any(term in question_lower for term in ['hpti', 'leadership', 'potential']):
            return """The HPTI (High Potential Trait Indicator) measures six traits that predict leadership success:

• **Conscientiousness**: Drive, reliability, and attention to detail
• **Adjustment**: Emotional resilience and stress management
• **Curiosity**: Openness to learning and new experiences
• **Risk Approach**: Comfort with calculated risk-taking
• **Ambiguity Acceptance**: Tolerance for uncertainty
• **Competitiveness**: Drive to achieve and excel

For senior roles at IFS, we look for balanced HPTI profiles with strong Adjustment and Conscientiousness scores. Want me to analyze a specific candidate's leadership potential?"""

        elif any(term in question_lower for term in ['chemistry', 'team', 'collaboration']):
            return """Chemistry Scores powered by Thomas Connect predict how well team members will work together based on their psychometric profiles. 

Key factors:
• **Complementary strengths**: Different but compatible working styles
• **Communication alignment**: Similar preferences for pace and detail
• **Conflict potential**: Areas where friction may occur

High chemistry (75%+) suggests natural collaboration. Lower chemistry doesn't mean they can't work together - it highlights areas for conscious effort. The Interpersonal Flexibility score shows how well someone adapts to work with people different from themselves."""

        elif any(term in question_lower for term in ['ifs', 'cloud', 'erp', 'eam', 'fsm']):
            return """IFS Cloud is our unified enterprise platform combining:

• **ERP**: Core business processes and financial management
• **EAM**: Enterprise Asset Management for equipment lifecycle
• **FSM**: Field Service Management for mobile workforce
• **Industrial AI**: Predictive capabilities that act in the flow of work

The Talent Hub integrates with IFS Cloud to pull HR data, organizational structure, and performance metrics. This enables us to correlate Thomas assessments with actual business outcomes for better hiring and development decisions."""

        else:
            return f"""I'm Thom, your AI assistant for the IFS Talent Hub. I can help you with:

• **Interpreting Thomas assessments** (PPA, GIA, HPTI) for candidates and employees
• **Understanding team chemistry** and collaboration dynamics
• **Analyzing hiring decisions** and candidate fit
• **Performance insights** and development recommendations

Could you tell me more specifically what you'd like to know? For example:
- "What does a high Dominance score mean for a sales role?"
- "How should I interpret this candidate's HPTI profile?"
- "What factors affect team chemistry scores?"
"""


# Singleton instance
_databricks_ai_service = None


def get_databricks_ai_service() -> DatabricksAIService:
    """Get or create the Databricks AI service singleton"""
    global _databricks_ai_service
    if _databricks_ai_service is None:
        _databricks_ai_service = DatabricksAIService()
    return _databricks_ai_service


# Export context for use elsewhere
def get_thom_context() -> str:
    """Get the full Thom context string"""
    return FULL_THOM_CONTEXT


def get_thomas_keywords() -> List[str]:
    """Get list of Thomas product keywords for highlighting"""
    return [
        "PPA", "Personal Profile Analysis", "DISC",
        "GIA", "General Intelligence Assessment", 
        "HPTI", "High Potential Trait Indicator",
        "TEIQue", "Trait Emotional Intelligence",
        "Engage", "Thomas Connect", "Thomas Insights",
        "Chemistry Score", "Interpersonal Flexibility",
        "Dominance", "Influence", "Steadiness", "Compliance",
        "Conscientiousness", "Adjustment", "Curiosity", 
        "Risk Approach", "Ambiguity Acceptance", "Competitiveness"
    ]


def get_ifs_keywords() -> List[str]:
    """Get list of IFS product keywords for highlighting"""
    return [
        "IFS", "IFS Cloud", "Industrial AI",
        "ERP", "Enterprise Resource Planning",
        "EAM", "Enterprise Asset Management",
        "FSM", "Field Service Management",
        "Supply Chain", "Linköping", "Stockholm"
    ]
