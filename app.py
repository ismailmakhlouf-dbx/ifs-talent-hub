"""
Unified Talent Management Hub
Powered by Databricks + Thomas International

Main Streamlit Application
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.data_access import get_data_access
from ai.llm_service import get_llm_service
from ui.styles import get_custom_css, THOMAS_COLORS
from ui.components import (
    render_metric_card,
    render_progress_bar,
    render_confidence_indicator,
    render_ppa_chart,
    render_hpti_chart,
    render_timeline_chart,
    render_section_header,
    render_info_box,
    render_risk_badge,
    render_candidate_stage_pipeline,
    render_weighted_score_breakdown,
)

# ============================================
# PAGE CONFIGURATION
# ============================================

st.set_page_config(
    page_title="Unified Talent Management Hub | Thomas International",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Inject custom CSS
st.markdown(get_custom_css(), unsafe_allow_html=True)

# ============================================
# INITIALIZE SERVICES
# ============================================

@st.cache_resource
def init_services():
    """Initialize data and AI services"""
    return get_data_access(), get_llm_service()

data_access, llm_service = init_services()

# ============================================
# SIDEBAR
# ============================================

with st.sidebar:
    # Logo and Title
    st.markdown("""
        <div style="text-align: center; padding: 1rem 0 2rem 0;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎯</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: white; letter-spacing: 0.02em;">
                Talent Hub
            </div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">
                Powered by Thomas International
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.divider()
    
    # Navigation
    st.markdown('<p style="color: rgba(255,255,255,0.6); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">Navigation</p>', unsafe_allow_html=True)
    
    page = st.radio(
        "Select View",
        ["🎯 Recruitment Intelligence", "📊 Employee Performance"],
        label_visibility="collapsed"
    )
    
    st.divider()
    
    # Manager selector
    st.markdown('<p style="color: rgba(255,255,255,0.6); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">Your Profile</p>', unsafe_allow_html=True)
    
    employees = data_access.get_employees()
    managers = employees[employees["is_manager"] == True]
    
    selected_manager = st.selectbox(
        "Acting as Manager",
        managers["employee_id"].tolist(),
        format_func=lambda x: managers[managers["employee_id"] == x]["name"].values[0],
        label_visibility="collapsed"
    )
    
    manager_info = managers[managers["employee_id"] == selected_manager].iloc[0]
    st.markdown(f"""
        <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem; margin-top: 0.5rem;">
            <div style="font-size: 0.85rem; color: white; font-weight: 500;">{manager_info['name']}</div>
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">{manager_info['title']}</div>
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-top: 0.25rem;">{manager_info['department']}</div>
        </div>
    """, unsafe_allow_html=True)
    
    st.divider()
    
    # Mode indicator
    from config import is_local_mode
    mode_text = "Local Mode (Mock Data)" if is_local_mode() else "Databricks Connected"
    mode_color = "#F5A623" if is_local_mode() else "#00A878"
    st.markdown(f"""
        <div style="text-align: center; padding: 0.5rem;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.1); border-radius: 20px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: {mode_color};"></div>
                <span style="font-size: 0.75rem; color: rgba(255,255,255,0.8);">{mode_text}</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

# ============================================
# MAIN CONTENT
# ============================================

# Header
st.markdown("""
    <div style="margin-bottom: 2rem;">
        <h1 class="main-title">Unified Talent Management Hub</h1>
        <p class="sub-title">Predictive insights for recruiting and performance management powered by Thomas International psychometric data</p>
    </div>
""", unsafe_allow_html=True)

# ============================================
# RECRUITMENT INTELLIGENCE PANE
# ============================================

if page == "🎯 Recruitment Intelligence":
    
    # Get data
    open_roles = data_access.get_open_roles()
    candidates = data_access.get_candidates()
    ideal_profiles = data_access.get_ideal_profiles()
    analytics_defaults = data_access.get_analytics_defaults()
    
    # Top metrics row
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        render_metric_card("Open Roles", str(len(open_roles)), "↑ 2 from last week", True, "📋")
    
    with col2:
        critical_roles = len(open_roles[open_roles["priority"] == "Critical"])
        render_metric_card("Critical Priority", str(critical_roles), "Need immediate attention", False, "🔴")
    
    with col3:
        render_metric_card("Active Candidates", str(len(candidates)), f"Across {len(open_roles)} roles", True, "👥")
    
    with col4:
        avg_days = int(open_roles["days_until_target"].mean())
        render_metric_card("Avg Days to Target", str(avg_days), "days remaining", True, "📅")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Main content tabs
    tab1, tab2, tab3 = st.tabs(["📋 Open Roles Pipeline", "👤 Candidate Deep Dive", "🤝 Negotiation Coach"])
    
    # ==========================================
    # TAB 1: OPEN ROLES PIPELINE
    # ==========================================
    with tab1:
        render_section_header("Unfilled Roles Dashboard", "📋")
        
        # Roles table with selection
        st.markdown("**Select a role to view detailed pipeline:**")
        
        roles_display = open_roles[["role_id", "title", "department", "priority", "days_until_target", "current_pipeline_count", "required_interviews_per_week"]].copy()
        roles_display.columns = ["Role ID", "Title", "Department", "Priority", "Days to Target", "Pipeline", "Weekly Interviews Needed"]
        
        # Style the dataframe
        def style_priority(val):
            if val == "Critical":
                return f'background-color: rgba(228, 0, 43, 0.15); color: {THOMAS_COLORS["accent"]};'
            elif val == "High":
                return f'background-color: rgba(245, 166, 35, 0.15); color: #D68910;'
            return ''
        
        st.dataframe(
            roles_display.style.applymap(style_priority, subset=['Priority']),
            use_container_width=True,
            hide_index=True,
        )
        
        # Role detail expander
        selected_role_id = st.selectbox("Select role for detailed view:", open_roles["role_id"].tolist(), format_func=lambda x: f"{x} - {open_roles[open_roles['role_id']==x]['title'].values[0]}")
        
        if selected_role_id:
            role = open_roles[open_roles["role_id"] == selected_role_id].iloc[0]
            role_candidates = candidates[candidates["role_id"] == selected_role_id]
            
            st.markdown(f"### {role['title']} - {role['department']}")
            
            # Progress towards target
            col1, col2 = st.columns([2, 1])
            
            with col1:
                st.markdown("**Hiring Timeline Progress**")
                days_elapsed = 60 - role["days_until_target"]  # Assuming 60 day hiring cycle
                progress = min(100, max(0, (days_elapsed / 60) * 100))
                render_progress_bar(progress, f"Target Hire Date: {role['target_hire_date']}", variant="auto")
                
                st.markdown("<br>", unsafe_allow_html=True)
                
                # Milestone timeline
                st.markdown("**Key Milestones:**")
                milestones = [
                    ("Phone Interviews", role['target_phone_interview'], role['target_phone_interview'] < datetime.now().date()),
                    ("Tech Assessments", role['target_tech_assessment'], role['target_tech_assessment'] < datetime.now().date()),
                    ("Onsite Interviews", role['target_onsite'], role['target_onsite'] < datetime.now().date()),
                    ("Final Round", role['target_final_round'], False),
                    ("Target Offer", role['target_offer_date'], False),
                ]
                
                for milestone, date, completed in milestones:
                    icon = "✅" if completed else "⏳"
                    color = THOMAS_COLORS['success'] if completed else THOMAS_COLORS['text_secondary']
                    st.markdown(f"<span style='color: {color};'>{icon} **{milestone}**: {date}</span>", unsafe_allow_html=True)
            
            with col2:
                # Pipeline funnel
                if len(role_candidates) > 0:
                    stage_counts = role_candidates.groupby("current_stage").size().to_dict()
                    ordered_stages = ["Screening", "Phone Interview", "Technical Assessment", "Onsite Interview", "Final Round"]
                    ordered_counts = {s: stage_counts.get(s, 0) for s in ordered_stages if s in stage_counts or stage_counts.get(s, 0) > 0}
                    
                    if ordered_counts:
                        fig = render_candidate_stage_pipeline(ordered_counts)
                        st.plotly_chart(fig, use_container_width=True)
            
            # Ideal profile for role
            st.markdown("---")
            render_section_header("Ideal Candidate Profile", "🎯")
            
            role_title = role["title"]
            ideal = ideal_profiles.get(role_title, {})
            
            if ideal:
                col1, col2 = st.columns(2)
                
                with col1:
                    fig = render_ppa_chart(
                        ideal.get('ppa_dominance', 50),
                        ideal.get('ppa_influence', 50),
                        ideal.get('ppa_steadiness', 50),
                        ideal.get('ppa_compliance', 50),
                        title="Ideal PPA Profile"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    render_info_box(
                        "Profile Insights",
                        f"""Based on analysis of <strong>{ideal.get('sample_size', 10)}+ top performers</strong> in similar roles, 
                        the ideal candidate shows <strong>{'high Dominance' if ideal.get('ppa_dominance', 50) > 70 else 'balanced DISC traits'}</strong> 
                        with an average GIA score of <strong>{ideal.get('gia_overall', 100)}</strong>. 
                        Key HPTI indicators point to strong Conscientiousness ({ideal.get('hpti_conscientiousness', 70)}%) 
                        and Curiosity ({ideal.get('hpti_curiosity', 65)}%)."""
                    )
                    
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown("**Target Interviews This Week:**")
                    st.markdown(f"<div style='font-size: 2.5rem; font-weight: 700; color: {THOMAS_COLORS['primary']};'>{role['required_interviews_per_week']}</div>", unsafe_allow_html=True)
                    st.markdown(f"<span style='color: {THOMAS_COLORS['text_secondary']};'>interviews needed to meet target date</span>", unsafe_allow_html=True)
    
    # ==========================================
    # TAB 2: CANDIDATE DEEP DIVE
    # ==========================================
    with tab2:
        render_section_header("Candidate Analysis", "👤")
        
        # Candidate selector
        col1, col2 = st.columns([1, 2])
        
        with col1:
            selected_candidate_id = st.selectbox(
                "Select Candidate:",
                candidates["candidate_id"].tolist(),
                format_func=lambda x: f"{candidates[candidates['candidate_id']==x]['name'].values[0]} ({candidates[candidates['candidate_id']==x]['role_title'].values[0]})"
            )
        
        if selected_candidate_id:
            candidate = candidates[candidates["candidate_id"] == selected_candidate_id].iloc[0]
            interactions = data_access.get_interaction_logs(selected_candidate_id)
            
            with col2:
                render_confidence_indicator(
                    candidate["candidate_confidence"],
                    candidate["stage_benchmark_confidence"],
                    candidate["current_stage"]
                )
            
            st.markdown("---")
            
            # Candidate profile
            col1, col2, col3 = st.columns([1, 1, 1])
            
            with col1:
                st.markdown(f"### {candidate['name']}")
                st.markdown(f"**Role:** {candidate['role_title']}")
                st.markdown(f"**Stage:** {candidate['current_stage']}")
                st.markdown(f"**Source:** {candidate['source']}")
                st.markdown(f"**Expected Salary:** ${candidate['expected_salary']:,}")
                
                st.markdown("<br>", unsafe_allow_html=True)
                render_progress_bar(
                    candidate["match_score"],
                    "Profile Match Score",
                    variant="auto"
                )
            
            with col2:
                # PPA Chart with ideal comparison
                role_title = candidate["role_title"]
                ideal = ideal_profiles.get(role_title, {})
                
                fig = render_ppa_chart(
                    candidate["ppa_dominance"],
                    candidate["ppa_influence"],
                    candidate["ppa_steadiness"],
                    candidate["ppa_compliance"],
                    title="Candidate vs Ideal PPA",
                    comparison=ideal if ideal else None
                )
                st.plotly_chart(fig, use_container_width=True)
            
            with col3:
                # HPTI Chart
                hpti_scores = {
                    "Conscientiousness": candidate["hpti_conscientiousness"],
                    "Adjustment": candidate["hpti_adjustment"],
                    "Curiosity": candidate["hpti_curiosity"],
                    "Risk Approach": candidate["hpti_risk_approach"],
                    "Ambiguity Accept.": candidate["hpti_ambiguity_acceptance"],
                    "Competitiveness": candidate["hpti_competitiveness"],
                }
                fig = render_hpti_chart(hpti_scores, title="HPTI Leadership Traits")
                st.plotly_chart(fig, use_container_width=True)
            
            # Weight adjustment section
            st.markdown("---")
            render_section_header("Scoring Weight Adjustment", "⚖️")
            
            st.markdown("Adjust the weights for different assessment components to recalculate the candidate's score:")
            
            # Get defaults
            role_type = "Software Engineer" if "Engineer" in candidate["role_title"] else "Product Manager" if "Product" in candidate["role_title"] else "Software Engineer"
            defaults_row = analytics_defaults[analytics_defaults["role_type"] == role_type]
            
            if len(defaults_row) > 0:
                defaults = defaults_row.iloc[0]
            else:
                defaults = {"coding_assessment_weight": 0.25, "technical_interview_weight": 0.25, "ppa_weight": 0.20, "gia_weight": 0.15, "hpti_weight": 0.15}
            
            col1, col2, col3, col4, col5 = st.columns(5)
            
            with col1:
                coding_weight = st.slider("Coding Assessment", 0.0, 1.0, float(defaults.get("coding_assessment_weight", 0.25)), 0.05, key="coding_w")
            with col2:
                tech_weight = st.slider("Technical Interview", 0.0, 1.0, float(defaults.get("technical_interview_weight", 0.25)), 0.05, key="tech_w")
            with col3:
                ppa_weight = st.slider("PPA Score", 0.0, 1.0, float(defaults.get("ppa_weight", 0.20)), 0.05, key="ppa_w")
            with col4:
                gia_weight = st.slider("GIA Score", 0.0, 1.0, float(defaults.get("gia_weight", 0.15)), 0.05, key="gia_w")
            with col5:
                hpti_weight = st.slider("HPTI Score", 0.0, 1.0, float(defaults.get("hpti_weight", 0.15)), 0.05, key="hpti_w")
            
            total_weight = coding_weight + tech_weight + ppa_weight + gia_weight + hpti_weight
            
            if abs(total_weight - 1.0) > 0.01:
                st.warning(f"⚠️ Weights should sum to 100%. Current total: {total_weight*100:.0f}%")
            
            # Calculate weighted score
            coding_score = candidate["technical_score"] if pd.notna(candidate["technical_score"]) else 70
            tech_score = candidate["onsite_score"] if pd.notna(candidate["onsite_score"]) else 70
            ppa_avg = (candidate["ppa_dominance"] + candidate["ppa_influence"] + candidate["ppa_steadiness"] + candidate["ppa_compliance"]) / 4
            hpti_avg = (candidate["hpti_conscientiousness"] + candidate["hpti_adjustment"] + candidate["hpti_curiosity"]) / 3
            
            scores = {
                "Coding": coding_score / 100,
                "Technical": tech_score / 100,
                "PPA": ppa_avg / 100,
                "GIA": candidate["gia_score"] / 130,
                "HPTI": hpti_avg / 100,
            }
            weights = {
                "Coding": coding_weight,
                "Technical": tech_weight,
                "PPA": ppa_weight,
                "GIA": gia_weight,
                "HPTI": hpti_weight,
            }
            
            weighted_total = sum(scores[k] * weights[k] for k in scores) * 100
            
            col1, col2 = st.columns([1, 2])
            
            with col1:
                st.markdown(f"""
                    <div class="metric-card" style="text-align: center;">
                        <div class="metric-card-header">Weighted Total Score</div>
                        <div class="metric-card-value" style="font-size: 3rem;">{weighted_total:.1f}</div>
                        <div style="color: {THOMAS_COLORS['text_secondary']}; margin-top: 0.5rem;">out of 100</div>
                    </div>
                """, unsafe_allow_html=True)
                
                if st.button("💾 Save Weight Override", use_container_width=True):
                    override_data = {
                        "override_id": f"OVR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                        "manager_id": selected_manager,
                        "role_id": candidate["role_id"],
                        "coding_assessment_weight": coding_weight,
                        "technical_interview_weight": tech_weight,
                        "ppa_weight": ppa_weight,
                        "gia_weight": gia_weight,
                        "hpti_weight": hpti_weight,
                    }
                    data_access.save_manager_override(override_data)
                    st.success("Weight override saved for HR analysis!")
            
            with col2:
                fig = render_weighted_score_breakdown(scores, weights)
                st.plotly_chart(fig, use_container_width=True)
            
            # Interaction Summary
            st.markdown("---")
            render_section_header("Interview Interactions Summary", "💬")
            
            if len(interactions) > 0:
                # Generate AI summary
                summary = llm_service.summarize_interactions(interactions.to_dict('records'), candidate["name"])
                render_info_box("AI-Generated Summary", summary)
                
                st.markdown("<br>", unsafe_allow_html=True)
                
                # Interactions table
                interactions_display = interactions[["stage", "interaction_type", "date", "score", "recommendation", "notes"]].copy()
                interactions_display.columns = ["Stage", "Type", "Date", "Score", "Recommendation", "Notes"]
                st.dataframe(interactions_display, use_container_width=True, hide_index=True)
            else:
                st.info("No interaction logs recorded yet for this candidate.")
    
    # ==========================================
    # TAB 3: NEGOTIATION COACH
    # ==========================================
    with tab3:
        render_section_header("Negotiation Coach", "🤝")
        
        st.markdown("Use the salary slider to predict offer acceptance likelihood based on the candidate's psychometric profile.")
        
        # Candidate selector for negotiation
        final_stage_candidates = candidates[candidates["current_stage"].isin(["Final Round", "Onsite Interview"])]
        
        if len(final_stage_candidates) == 0:
            st.info("No candidates in final stages for negotiation coaching. Showing all candidates.")
            final_stage_candidates = candidates
        
        selected_neg_candidate = st.selectbox(
            "Select Candidate for Negotiation:",
            final_stage_candidates["candidate_id"].tolist(),
            format_func=lambda x: f"{final_stage_candidates[final_stage_candidates['candidate_id']==x]['name'].values[0]} - {final_stage_candidates[final_stage_candidates['candidate_id']==x]['role_title'].values[0]}",
            key="neg_candidate"
        )
        
        if selected_neg_candidate:
            neg_candidate = final_stage_candidates[final_stage_candidates["candidate_id"] == selected_neg_candidate].iloc[0]
            role = open_roles[open_roles["role_id"] == neg_candidate["role_id"]].iloc[0]
            
            col1, col2 = st.columns([1, 1])
            
            with col1:
                st.markdown(f"### {neg_candidate['name']}")
                st.markdown(f"**Role:** {neg_candidate['role_title']}")
                st.markdown(f"**Expected Salary:** ${neg_candidate['expected_salary']:,}")
                st.markdown(f"**Negotiation Flexibility:** {neg_candidate['negotiation_flexibility']}")
                
                st.markdown("---")
                
                # Salary slider
                min_sal = int(role["min_salary"])
                max_sal = int(role["max_salary"])
                mid_sal = (min_sal + max_sal) // 2
                
                proposed_tc = st.slider(
                    "Proposed Total Compensation",
                    min_sal,
                    max_sal,
                    value=mid_sal,
                    step=5000,
                    format="$%d"
                )
                
                st.markdown(f"""
                    <div style="display: flex; justify-content: space-between; margin-top: -0.5rem; margin-bottom: 1rem;">
                        <span style="font-size: 0.8rem; color: {THOMAS_COLORS['text_secondary']};">Min: ${min_sal:,}</span>
                        <span style="font-size: 0.8rem; color: {THOMAS_COLORS['text_secondary']};">Mid: ${mid_sal:,}</span>
                        <span style="font-size: 0.8rem; color: {THOMAS_COLORS['text_secondary']};">Max: ${max_sal:,}</span>
                    </div>
                """, unsafe_allow_html=True)
                
                # Get negotiation advice
                candidate_profile = {
                    "ppa_dominance": neg_candidate["ppa_dominance"],
                    "ppa_influence": neg_candidate["ppa_influence"],
                    "ppa_steadiness": neg_candidate["ppa_steadiness"],
                    "ppa_compliance": neg_candidate["ppa_compliance"],
                    "hpti_competitiveness": neg_candidate["hpti_competitiveness"],
                    "hpti_risk_approach": neg_candidate["hpti_risk_approach"],
                }
                
                advice = llm_service.generate_negotiation_advice(
                    candidate_profile,
                    proposed_tc,
                    (min_sal, max_sal),
                    neg_candidate["role_title"]
                )
                
                # Likelihood gauge
                likelihood = advice.get("likelihood", 70)
                
                gauge_color = THOMAS_COLORS['success'] if likelihood >= 70 else THOMAS_COLORS['warning'] if likelihood >= 50 else THOMAS_COLORS['accent']
                
                st.markdown(f"""
                    <div class="metric-card" style="text-align: center; margin-top: 1rem;">
                        <div class="metric-card-header">Predicted Acceptance Likelihood</div>
                        <div style="font-size: 4rem; font-weight: 700; color: {gauge_color};">{likelihood}%</div>
                        <div style="color: {THOMAS_COLORS['text_secondary']}; margin-top: 0.5rem;">at ${proposed_tc:,} TC</div>
                    </div>
                """, unsafe_allow_html=True)
            
            with col2:
                # Candidate personality profile
                fig = render_ppa_chart(
                    neg_candidate["ppa_dominance"],
                    neg_candidate["ppa_influence"],
                    neg_candidate["ppa_steadiness"],
                    neg_candidate["ppa_compliance"],
                    title="Candidate Negotiation Profile"
                )
                st.plotly_chart(fig, use_container_width=True)
            
            # Negotiation recommendations
            st.markdown("---")
            render_section_header("Negotiation Strategy", "💡")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown("**🎯 Levers to Pull:**")
                for lever in advice.get("levers", []):
                    st.markdown(f"• {lever}")
            
            with col2:
                st.markdown("**✅ Emphasize:**")
                st.markdown(advice.get("emphasize", "Growth opportunities and team culture"))
            
            with col3:
                st.markdown("**❌ Avoid:**")
                st.markdown(advice.get("avoid", "High-pressure tactics"))
            
            st.markdown("---")
            
            render_info_box("AI Negotiation Coach", advice.get("approach", "Consider the candidate's profile when framing the offer."))

# ============================================
# EMPLOYEE PERFORMANCE PANE
# ============================================

elif page == "📊 Employee Performance":
    
    # Get data
    direct_reports = data_access.get_direct_reports(selected_manager)
    team_metrics = data_access.get_team_metrics(selected_manager)
    upcoming_events = data_access.get_upcoming_events(selected_manager)
    performance_data = data_access.get_performance_metrics()
    
    # Top metrics row - Manager Dashboard
    render_section_header("Team Overview", "👥")
    
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        render_metric_card("Team Size", str(team_metrics.get("team_size", 0)), "", True, "👥")
    
    with col2:
        avg_perf = team_metrics.get("avg_performance", 0) * 100
        render_metric_card("Avg Performance", f"{avg_perf:.0f}%", "vs 78% company avg", avg_perf > 78, "📈")
    
    with col3:
        avg_morale = team_metrics.get("avg_morale", 0)
        render_metric_card("Team Morale", f"{avg_morale:.0f}", "out of 100", avg_morale > 70, "😊")
    
    with col4:
        high_risk = team_metrics.get("high_risk_count", 0)
        render_metric_card("High Risk", str(high_risk), "employees flagged", high_risk == 0, "⚠️")
    
    with col5:
        leadership_ready = team_metrics.get("avg_leadership_readiness", 0)
        render_metric_card("Leadership Ready", f"{leadership_ready:.0f}%", "avg readiness", leadership_ready > 60, "🌟")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Main tabs
    tab1, tab2, tab3 = st.tabs(["📊 Business & People Metrics", "⚠️ At-Risk Snapshot", "👤 Individual View"])
    
    # ==========================================
    # TAB 1: BUSINESS & PEOPLE METRICS
    # ==========================================
    with tab1:
        col1, col2 = st.columns(2)
        
        with col1:
            render_section_header("Business Metrics", "💰")
            
            # Revenue trend (for sales teams)
            if team_metrics.get("total_revenue", 0) > 0:
                st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-card-header">Total Revenue (Q4)</div>
                        <div class="metric-card-value">${team_metrics.get('total_revenue', 0):,.0f}</div>
                    </div>
                """, unsafe_allow_html=True)
            
            # Performance distribution
            if len(direct_reports) > 0:
                team_performance = performance_data[
                    (performance_data["employee_id"].isin(direct_reports["employee_id"])) &
                    (performance_data["quarter"] == "2024-Q4")
                ]
                
                if len(team_performance) > 0:
                    fig = px.histogram(
                        team_performance,
                        x="performance_score",
                        nbins=10,
                        title="Team Performance Distribution",
                        color_discrete_sequence=[THOMAS_COLORS['secondary']]
                    )
                    fig.update_layout(
                        xaxis_title="Performance Score",
                        yaxis_title="Count",
                        paper_bgcolor='white',
                        plot_bgcolor='white',
                        font=dict(family='IBM Plex Sans'),
                    )
                    st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            render_section_header("People Metrics", "💚")
            
            if len(direct_reports) > 0:
                team_performance = performance_data[
                    (performance_data["employee_id"].isin(direct_reports["employee_id"])) &
                    (performance_data["quarter"] == "2024-Q4")
                ]
                
                if len(team_performance) > 0:
                    # Morale distribution
                    fig = px.box(
                        team_performance,
                        y="morale_score",
                        title="Team Morale Distribution",
                        color_discrete_sequence=[THOMAS_COLORS['success']]
                    )
                    fig.add_hline(y=70, line_dash="dash", line_color=THOMAS_COLORS['warning'], annotation_text="Target")
                    fig.update_layout(
                        yaxis_title="Morale Score",
                        paper_bgcolor='white',
                        plot_bgcolor='white',
                        font=dict(family='IBM Plex Sans'),
                        showlegend=False,
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Sentiment trend
                    avg_sentiment = team_performance["slack_sentiment"].mean()
                    sentiment_text = "Positive" if avg_sentiment > 0.6 else "Neutral" if avg_sentiment > 0.4 else "Concerning"
                    sentiment_color = THOMAS_COLORS['success'] if avg_sentiment > 0.6 else THOMAS_COLORS['warning'] if avg_sentiment > 0.4 else THOMAS_COLORS['accent']
                    
                    st.markdown(f"""
                        <div class="metric-card" style="margin-top: 1rem;">
                            <div class="metric-card-header">Team Slack Sentiment</div>
                            <div class="metric-card-value" style="color: {sentiment_color};">{sentiment_text}</div>
                            <div style="color: {THOMAS_COLORS['text_secondary']}; margin-top: 0.5rem;">
                                Average: {avg_sentiment:.2f} (0-1 scale)
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
    
    # ==========================================
    # TAB 2: AT-RISK SNAPSHOT
    # ==========================================
    with tab2:
        render_section_header("High-Risk Items & Upcoming Events", "⚠️")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**🚨 At-Risk Employees**")
            
            if len(direct_reports) > 0:
                team_performance = performance_data[
                    (performance_data["employee_id"].isin(direct_reports["employee_id"])) &
                    (performance_data["quarter"] == "2024-Q4")
                ]
                
                high_risk_employees = team_performance[team_performance["churn_risk"] == "High"].merge(
                    direct_reports[["employee_id", "name", "title"]],
                    on="employee_id"
                )
                
                if len(high_risk_employees) > 0:
                    for _, emp in high_risk_employees.iterrows():
                        st.markdown(f"""
                            <div class="metric-card" style="margin-bottom: 1rem; border-left: 4px solid {THOMAS_COLORS['accent']};">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; color: {THOMAS_COLORS['primary']};">{emp['name']}</div>
                                        <div style="font-size: 0.85rem; color: {THOMAS_COLORS['text_secondary']};">{emp['title']}</div>
                                    </div>
                                    <span class="risk-badge risk-high">🔴 High Risk</span>
                                </div>
                                <div style="margin-top: 0.75rem; font-size: 0.9rem;">
                                    <span style="color: {THOMAS_COLORS['text_secondary']};">Morale: </span>
                                    <span style="font-weight: 500;">{emp['morale_score']}/100</span>
                                    <span style="margin-left: 1rem; color: {THOMAS_COLORS['text_secondary']};">Sentiment: </span>
                                    <span style="font-weight: 500;">{emp['slack_sentiment']:.2f}</span>
                                </div>
                            </div>
                        """, unsafe_allow_html=True)
                else:
                    st.success("✅ No high-risk employees identified!")
        
        with col2:
            st.markdown("**📅 Upcoming Critical Events**")
            
            critical_events = upcoming_events[upcoming_events["is_critical"] == True] if len(upcoming_events) > 0 else pd.DataFrame()
            
            if len(critical_events) > 0:
                for _, event in critical_events.head(5).iterrows():
                    event_color = THOMAS_COLORS['accent'] if event['event_type'] in ['Medical Leave', 'Maternity Leave'] else THOMAS_COLORS['warning']
                    st.markdown(f"""
                        <div class="metric-card" style="margin-bottom: 1rem; border-left: 4px solid {event_color};">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; color: {THOMAS_COLORS['primary']};">{event['employee_name']}</div>
                                    <div style="font-size: 0.85rem; color: {THOMAS_COLORS['text_secondary']};">{event['event_type']}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 500; color: {THOMAS_COLORS['primary']};">{event['start_date']}</div>
                                    <div style="font-size: 0.8rem; color: {THOMAS_COLORS['text_secondary']};">to {event['end_date']}</div>
                                </div>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
            else:
                st.info("No critical events in the upcoming period.")
    
    # ==========================================
    # TAB 3: INDIVIDUAL VIEW
    # ==========================================
    with tab3:
        render_section_header("Direct Report Analysis", "👤")
        
        if len(direct_reports) > 0:
            selected_employee = st.selectbox(
                "Select Direct Report:",
                direct_reports["employee_id"].tolist(),
                format_func=lambda x: f"{direct_reports[direct_reports['employee_id']==x]['name'].values[0]} - {direct_reports[direct_reports['employee_id']==x]['title'].values[0]}"
            )
            
            if selected_employee:
                emp = direct_reports[direct_reports["employee_id"] == selected_employee].iloc[0]
                emp_assessments = data_access.get_employee_assessment(selected_employee)
                emp_performance = performance_data[performance_data["employee_id"] == selected_employee].sort_values("quarter")
                
                # Employee header
                col1, col2, col3 = st.columns([1, 2, 1])
                
                with col1:
                    st.markdown(f"""
                        <div class="metric-card">
                            <div style="font-size: 1.5rem; font-weight: 700; color: {THOMAS_COLORS['primary']};">{emp['name']}</div>
                            <div style="color: {THOMAS_COLORS['text_secondary']}; margin-top: 0.25rem;">{emp['title']}</div>
                            <div style="font-size: 0.85rem; color: {THOMAS_COLORS['text_secondary']}; margin-top: 0.5rem;">
                                📍 {emp['location']} • 🗓️ {emp['tenure_months']} months tenure
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
                
                with col2:
                    # Performance trend
                    if len(emp_performance) > 0:
                        fig = render_timeline_chart(
                            emp_performance,
                            "quarter",
                            "performance_score",
                            "Performance Trend",
                            show_target=0.75
                        )
                        st.plotly_chart(fig, use_container_width=True)
                
                with col3:
                    latest_perf = emp_performance[emp_performance["quarter"] == "2024-Q4"].iloc[0] if len(emp_performance) > 0 else {}
                    
                    churn_risk = latest_perf.get("churn_risk", "Low")
                    risk_color = THOMAS_COLORS['accent'] if churn_risk == "High" else THOMAS_COLORS['warning'] if churn_risk == "Medium" else THOMAS_COLORS['success']
                    
                    st.markdown(f"""
                        <div class="metric-card" style="text-align: center;">
                            <div class="metric-card-header">Churn Risk</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: {risk_color};">{churn_risk}</div>
                        </div>
                    """, unsafe_allow_html=True)
                    
                    leadership = latest_perf.get("leadership_readiness", 50)
                    st.markdown(f"""
                        <div class="metric-card" style="text-align: center; margin-top: 1rem;">
                            <div class="metric-card-header">Leadership Readiness</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: {THOMAS_COLORS['primary']};">{leadership}%</div>
                        </div>
                    """, unsafe_allow_html=True)
                
                st.markdown("---")
                
                # Thomas profile & AI insights
                col1, col2 = st.columns(2)
                
                with col1:
                    render_section_header("Thomas Assessment Profile", "🧠")
                    
                    if len(emp_assessments) > 0:
                        assessment = emp_assessments.iloc[0]
                        
                        fig = render_ppa_chart(
                            assessment["ppa_dominance"],
                            assessment["ppa_influence"],
                            assessment["ppa_steadiness"],
                            assessment["ppa_compliance"],
                            title="PPA Profile"
                        )
                        st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    if len(emp_assessments) > 0:
                        assessment = emp_assessments.iloc[0]
                        hpti_scores = {
                            "Conscientiousness": assessment["hpti_conscientiousness"],
                            "Adjustment": assessment["hpti_adjustment"],
                            "Curiosity": assessment["hpti_curiosity"],
                            "Risk Approach": assessment["hpti_risk_approach"],
                            "Ambiguity Accept.": assessment["hpti_ambiguity_acceptance"],
                            "Competitiveness": assessment["hpti_competitiveness"],
                        }
                        fig = render_hpti_chart(hpti_scores, title="HPTI Leadership Traits")
                        st.plotly_chart(fig, use_container_width=True)
                
                # AI Insights
                st.markdown("---")
                render_section_header("AI-Powered Insights", "🤖")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    # Quarterly summary
                    if len(emp_performance) > 0:
                        latest = emp_performance[emp_performance["quarter"] == "2024-Q4"].iloc[0] if len(emp_performance) > 0 else {}
                        summary = llm_service.summarize_quarter_performance(
                            emp["name"],
                            latest.to_dict(),
                            ["Strong execution on key deliverables", "Growing into leadership role"]
                        )
                        render_info_box("Q4 Performance Summary", summary)
                
                with col2:
                    # Leadership prediction
                    if len(emp_assessments) > 0:
                        prediction = llm_service.predict_leadership_potential(
                            emp.to_dict(),
                            emp_assessments.iloc[0].to_dict(),
                            emp_performance.to_dict('records')
                        )
                        
                        st.markdown(f"""
                            <div class="metric-card">
                                <div class="metric-card-header">🌟 Next Role Readiness</div>
                                <div style="margin-top: 0.5rem;">
                                    <span style="font-size: 1.2rem; font-weight: 600; color: {THOMAS_COLORS['primary']};">
                                        {prediction.get('recommended_role', 'N/A')}
                                    </span>
                                </div>
                                <div style="margin-top: 0.5rem; color: {THOMAS_COLORS['text_secondary']};">
                                    Timeline: {prediction.get('timeline', 'TBD')}
                                </div>
                                <div style="margin-top: 0.75rem; font-size: 0.9rem;">
                                    <strong>Development Focus:</strong>
                                    <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
                                        {''.join([f"<li>{area}</li>" for area in prediction.get('development_areas', [])])}
                                    </ul>
                                </div>
                            </div>
                        """, unsafe_allow_html=True)
                
                # Churn risk recommendations
                if latest_perf.get("churn_risk", "Low") in ["High", "Medium"]:
                    st.markdown("---")
                    render_section_header("Manager Recommendations", "💡")
                    
                    recommendation = llm_service.generate_churn_recommendation(
                        emp["name"],
                        {
                            "morale_trend": "Declining" if latest_perf.get("morale_score", 70) < 60 else "Stable",
                            "slack_sentiment": latest_perf.get("slack_sentiment", 0.5),
                            "velocity_change": "Decreased" if latest_perf.get("jira_velocity", 30) < 25 else "Stable",
                        },
                        f"Employee has been with the company for {emp['tenure_months']} months"
                    )
                    
                    st.markdown(recommendation)
        else:
            st.info("No direct reports found for the selected manager.")

# ============================================
# FOOTER
# ============================================

st.markdown("---")
st.markdown(f"""
    <div style="text-align: center; padding: 2rem 0; color: {THOMAS_COLORS['text_secondary']};">
        <div style="font-size: 0.9rem;">
            Unified Talent Management Hub • Powered by 
            <span style="color: {THOMAS_COLORS['primary']}; font-weight: 600;">Databricks</span> + 
            <span style="color: {THOMAS_COLORS['secondary']}; font-weight: 600;">Thomas International</span>
        </div>
        <div style="font-size: 0.75rem; margin-top: 0.5rem;">
            GenAI: Mosaic AI Foundation Models • Data: Unity Catalog + Lakeflow Connect
        </div>
    </div>
""", unsafe_allow_html=True)
