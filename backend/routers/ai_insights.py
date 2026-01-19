"""
AI/GenAI Insights API Routes
Mosaic AI Foundation Model Integration
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
import math


def clean_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, dict):
        return {k: clean_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_numpy_types(item) for item in obj]
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return clean_numpy_types(obj.tolist())
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    return obj

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from data.data_access import get_data_access
from ai.llm_service import get_llm_service

# Lazy import for Databricks AI service to avoid import errors
databricks_ai = None

def get_ai_service():
    """Get Databricks AI service with lazy loading"""
    global databricks_ai
    if databricks_ai is None:
        try:
            from backend.services.databricks_ai import get_databricks_ai_service
            databricks_ai = get_databricks_ai_service()
        except ImportError:
            databricks_ai = None
    return databricks_ai

def get_thomas_kw():
    """Get Thomas keywords with fallback"""
    try:
        from backend.services.databricks_ai import get_thomas_keywords
        return get_thomas_keywords()
    except ImportError:
        return ["PPA", "GIA", "HPTI", "Thomas", "DISC", "Chemistry"]

def get_ifs_kw():
    """Get IFS keywords with fallback"""
    try:
        from backend.services.databricks_ai import get_ifs_keywords
        return get_ifs_keywords()
    except ImportError:
        return ["IFS", "IFS Cloud", "ERP", "EAM", "FSM"]

router = APIRouter()
data_access = get_data_access()
llm_service = get_llm_service()


def generate_negotiation_profile_insight(profile: dict, candidate_data) -> str:
    """Generate a GenAI-style insight based on the candidate's psychometric profile for negotiation"""
    dominance = int(profile.get('ppa_dominance', 50))
    influence = int(profile.get('ppa_influence', 50))
    steadiness = int(profile.get('ppa_steadiness', 50))
    compliance = int(profile.get('ppa_compliance', 50))
    competitiveness = int(profile.get('hpti_competitiveness', 50))
    risk_approach = int(profile.get('hpti_risk_approach', 50))
    
    flexibility = str(candidate_data.get('negotiation_flexibility', 'Medium'))
    
    insights = []
    
    # Dominance-based insight
    if dominance > 70:
        insights.append(f"**High Dominance ({dominance}%)**: This candidate is likely to negotiate assertively and push for top-of-range compensation. Expect counter-offers and be prepared with data to justify your position. They respect directness—avoid hedging.")
    elif dominance < 40:
        insights.append(f"**Low Dominance ({dominance}%)**: This candidate is unlikely to negotiate aggressively. The initial offer may be accepted with minimal pushback. However, ensure the offer is fair to avoid post-acceptance regret.")
    else:
        insights.append(f"**Moderate Dominance ({dominance}%)**: Balanced approach to negotiation expected. They'll advocate for themselves but won't be confrontational.")
    
    # Steadiness-based insight
    if steadiness > 70:
        insights.append(f"**High Steadiness ({steadiness}%)**: Job security, team stability, and work-life balance matter more than pure compensation. Emphasise the team culture, low turnover, and consistent growth opportunities. Avoid creating urgency or pressure.")
    elif steadiness < 40:
        insights.append(f"**Low Steadiness ({steadiness}%)**: Open to change and less concerned with stability. May be swayed by exciting growth opportunities or equity upside even if base is lower.")
    
    # Competitiveness insight
    if competitiveness > 70:
        insights.append(f"**High Competitiveness ({competitiveness}%)**: This candidate benchmarks themselves against peers. Mention that this offer is competitive with market rates and how top performers are rewarded. Status and recognition matter.")
    
    # Risk approach
    if risk_approach > 70:
        insights.append(f"**High Risk Tolerance ({risk_approach}%)**: May be interested in equity-heavy packages or performance bonuses over guaranteed base. Consider offering upside potential.")
    elif risk_approach < 40:
        insights.append(f"**Risk-Averse ({risk_approach}%)**: Prioritise guaranteed base salary over variable comp. Equity or bonuses may not be as compelling as stable income.")
    
    # Flexibility note
    if flexibility == 'Low':
        insights.append("⚠️ **Low Flexibility Indicated**: This candidate has signalled limited room for negotiation on salary expectations. Consider whether the role budget can accommodate their ask.")
    elif flexibility == 'High':
        insights.append("✅ **High Flexibility**: Candidate has indicated openness to negotiate. There's room to find a mutually agreeable package.")
    
    return "\n\n".join(insights)


class NegotiationRequest(BaseModel):
    candidate_id: str
    proposed_tc: int


class ChurnAnalysisRequest(BaseModel):
    employee_id: str


@router.get("/interaction-summary/{candidate_id}")
async def get_interaction_summary(candidate_id: str):
    """Generate AI summary of candidate interactions"""
    interactions = data_access.get_interaction_logs(candidate_id)
    
    if interactions.empty:
        raise HTTPException(status_code=404, detail="No interactions found")
    
    candidates = data_access.get_candidates()
    candidate = candidates[candidates["candidate_id"] == candidate_id]
    
    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate_name = candidate.iloc[0]["name"]
    summary = llm_service.summarize_interactions(
        interactions.to_dict(orient="records"),
        candidate_name
    )
    
    return {
        "candidate_id": candidate_id,
        "candidate_name": candidate_name,
        "summary": summary,
        "interaction_count": len(interactions),
    }


@router.post("/negotiation-advice")
async def get_negotiation_advice(request: NegotiationRequest):
    """Generate AI-powered negotiation advice"""
    candidates = data_access.get_candidates()
    candidate = candidates[candidates["candidate_id"] == request.candidate_id]
    
    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate_data = candidate.iloc[0]
    roles = data_access.get_open_roles()
    role = roles[roles["role_id"] == candidate_data["role_id"]]
    
    if role.empty:
        raise HTTPException(status_code=404, detail="Role not found")
    
    role_data = role.iloc[0]
    
    candidate_profile = {
        "ppa_dominance": candidate_data["ppa_dominance"],
        "ppa_influence": candidate_data["ppa_influence"],
        "ppa_steadiness": candidate_data["ppa_steadiness"],
        "ppa_compliance": candidate_data["ppa_compliance"],
        "hpti_competitiveness": candidate_data["hpti_competitiveness"],
        "hpti_risk_approach": candidate_data["hpti_risk_approach"],
    }
    
    advice = llm_service.generate_negotiation_advice(
        candidate_profile,
        request.proposed_tc,
        (int(role_data["min_salary"]), int(role_data["max_salary"])),
        str(candidate_data["role_title"])
    )
    
    # Calculate benchmark comparisons
    industry_avg = int(role_data.get("industry_avg_salary", role_data["min_salary"] * 1.1))
    company_avg = int(role_data.get("company_avg_salary", role_data["min_salary"] * 1.05))
    
    industry_diff = request.proposed_tc - industry_avg
    company_diff = request.proposed_tc - company_avg
    
    # Generate profile insight
    profile_insight = generate_negotiation_profile_insight(candidate_profile, candidate_data)
    
    return clean_numpy_types({
        "candidate_id": request.candidate_id,
        "candidate_name": str(candidate_data["name"]),
        "proposed_tc": request.proposed_tc,
        "currency": str(candidate_data.get("currency", "GBP")),
        "currency_symbol": str(candidate_data.get("currency_symbol", "£")),
        "salary_range": {
            "min": int(role_data["min_salary"]),
            "max": int(role_data["max_salary"]),
            "mid": int((role_data["min_salary"] + role_data["max_salary"]) / 2),
        },
        "benchmarks": {
            "industry_avg": industry_avg,
            "company_avg": company_avg,
            "industry_diff": industry_diff,
            "industry_diff_percent": round((industry_diff / industry_avg) * 100, 1) if industry_avg > 0 else 0,
            "company_diff": company_diff,
            "company_diff_percent": round((company_diff / company_avg) * 100, 1) if company_avg > 0 else 0,
        },
        "profile_insight": profile_insight,
        "advice": advice,
    })


@router.get("/performance-summary/{employee_id}")
async def get_performance_summary(employee_id: str):
    """Generate AI summary of employee's quarterly performance"""
    employee = data_access.get_employee_by_id(employee_id)
    
    if employee.empty:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    performance = data_access.get_performance_metrics(employee_id=employee_id)
    latest = performance[performance["quarter"] == "2024-Q4"]
    
    if latest.empty:
        raise HTTPException(status_code=404, detail="No performance data found")
    
    summary = llm_service.summarize_quarter_performance(
        employee.iloc[0]["name"],
        latest.iloc[0].to_dict(),
        ["Strong execution on key deliverables", "Growing into leadership role"]
    )
    
    return {
        "employee_id": employee_id,
        "employee_name": employee.iloc[0]["name"],
        "quarter": "2024-Q4",
        "summary": summary,
        "metrics": latest.iloc[0].to_dict(),
    }


@router.get("/leadership-potential/{employee_id}")
async def get_leadership_potential(employee_id: str):
    """Predict leadership readiness using HPTI traits"""
    employee = data_access.get_employee_by_id(employee_id)
    
    if employee.empty:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    assessments = data_access.get_employee_assessment(employee_id)
    performance = data_access.get_performance_metrics(employee_id=employee_id)
    
    if assessments.empty:
        raise HTTPException(status_code=404, detail="No assessments found")
    
    prediction = llm_service.predict_leadership_potential(
        employee.iloc[0].to_dict(),
        assessments.iloc[0].to_dict(),
        performance.to_dict(orient="records")
    )
    
    return {
        "employee_id": employee_id,
        "employee_name": employee.iloc[0]["name"],
        "current_title": employee.iloc[0]["title"],
        "prediction": prediction,
    }


@router.post("/churn-recommendation")
async def get_churn_recommendation(request: ChurnAnalysisRequest):
    """Generate recommendations to prevent employee churn"""
    employee = data_access.get_employee_by_id(request.employee_id)
    
    if employee.empty:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    performance = data_access.get_performance_metrics(employee_id=request.employee_id, quarter="2024-Q4")
    
    if performance.empty:
        raise HTTPException(status_code=404, detail="No performance data found")
    
    latest = performance.iloc[0]
    
    risk_factors = {
        "morale_trend": "Declining" if latest.get("morale_score", 70) < 60 else "Stable",
        "slack_sentiment": latest.get("slack_sentiment", 0.5),
        "velocity_change": "Decreased" if latest.get("jira_velocity", 30) and latest.get("jira_velocity") < 25 else "Stable",
    }
    
    recommendation = llm_service.generate_churn_recommendation(
        employee.iloc[0]["name"],
        risk_factors,
        f"Employee has been with the company for {employee.iloc[0]['tenure_months']} months"
    )
    
    return {
        "employee_id": request.employee_id,
        "employee_name": employee.iloc[0]["name"],
        "churn_risk": latest.get("churn_risk", "Unknown"),
        "risk_factors": risk_factors,
        "recommendation": recommendation,
    }


@router.get("/similar-employees/{role_title}")
async def get_similar_employees(role_title: str):
    """Find employees most similar to the ideal profile for a role"""
    ideal_profiles = data_access.get_ideal_profiles()
    ideal = ideal_profiles.get(role_title, {})
    
    if not ideal:
        return {"similar_employees": []}
    
    employees = data_access.get_employees()
    assessments = data_access.get_thomas_assessments()
    
    # Merge employees with assessments
    merged = employees.merge(assessments, on="employee_id", how="left")
    
    similar = []
    for _, emp in merged.iterrows():
        if pd.isna(emp.get("ppa_dominance")):
            continue
            
        # Calculate match score
        d_diff = abs(emp["ppa_dominance"] - ideal.get("ppa_dominance", 50))
        i_diff = abs(emp["ppa_influence"] - ideal.get("ppa_influence", 50))
        s_diff = abs(emp["ppa_steadiness"] - ideal.get("ppa_steadiness", 50))
        c_diff = abs(emp["ppa_compliance"] - ideal.get("ppa_compliance", 50))
        
        match_score = 100 - ((d_diff + i_diff + s_diff + c_diff) / 4)
        
        similar.append({
            "employee_id": emp["employee_id"],
            "name": emp["name"],
            "title": emp["title"],
            "department": emp["department"],
            "match_score": round(match_score, 1)
        })
    
    # Sort by match score and return top 5
    similar.sort(key=lambda x: x["match_score"], reverse=True)
    return {"similar_employees": similar[:5]}


@router.get("/profile-match/{candidate_id}")
async def get_profile_match(candidate_id: str):
    """Compare candidate to ideal profile using RAG pattern"""
    candidates = data_access.get_candidates()
    candidate = candidates[candidates["candidate_id"] == candidate_id]
    
    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate_data = candidate.iloc[0]
    ideal_profiles = data_access.get_ideal_profiles()
    role_title = candidate_data["role_title"]
    ideal = ideal_profiles.get(role_title, {})
    
    if not ideal:
        return {
            "candidate_id": candidate_id,
            "error": "No ideal profile found for this role"
        }
    
    candidate_profile = {
        "ppa_dominance": candidate_data["ppa_dominance"],
        "ppa_influence": candidate_data["ppa_influence"],
        "ppa_steadiness": candidate_data["ppa_steadiness"],
        "ppa_compliance": candidate_data["ppa_compliance"],
        "gia_score": candidate_data["gia_score"],
        "hpti_conscientiousness": candidate_data["hpti_conscientiousness"],
        "hpti_curiosity": candidate_data["hpti_curiosity"],
    }
    
    match_analysis = llm_service.match_candidate_to_ideal(
        candidate_profile,
        ideal,
        role_title
    )
    
    return {
        "candidate_id": candidate_id,
        "candidate_name": candidate_data["name"],
        "role_title": role_title,
        "match_analysis": match_analysis,
        "candidate_profile": candidate_profile,
        "ideal_profile": ideal,
    }


@router.get("/psychometric-analysis/{candidate_id}")
async def get_psychometric_analysis(candidate_id: str):
    """Get detailed psychometric analysis with trait comparisons and GenAI descriptions"""
    candidates = data_access.get_candidates()
    candidate = candidates[candidates["candidate_id"] == candidate_id]
    
    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate_data = candidate.iloc[0]
    ideal_profiles = data_access.get_ideal_profiles()
    role_title = candidate_data["role_title"]
    ideal = ideal_profiles.get(role_title, {})
    
    # Calculate trait gaps
    def calc_gap(trait: str, is_ppa: bool = True):
        prefix = "ppa_" if is_ppa else "hpti_"
        candidate_val = int(candidate_data.get(f"{prefix}{trait}", 50))
        ideal_val = int(ideal.get(f"{prefix}{trait}", 50))
        gap = candidate_val - ideal_val
        return {
            "candidate": candidate_val,
            "ideal": ideal_val,
            "gap": gap,
            "gap_percent": round(float(gap), 1),
            "status": "above" if gap > 5 else "below" if gap < -5 else "aligned"
        }
    
    ppa_analysis = {
        "dominance": calc_gap("dominance"),
        "influence": calc_gap("influence"),
        "steadiness": calc_gap("steadiness"),
        "compliance": calc_gap("compliance"),
    }
    
    hpti_analysis = {
        "conscientiousness": calc_gap("conscientiousness", False),
        "adjustment": calc_gap("adjustment", False),
        "curiosity": calc_gap("curiosity", False),
        "risk_approach": {"candidate": 65, "ideal": 60, "gap": 5, "gap_percent": 5.0, "status": "aligned"},
        "ambiguity_acceptance": {"candidate": 70, "ideal": 65, "gap": 5, "gap_percent": 5.0, "status": "aligned"},
        "competitiveness": {"candidate": 60, "ideal": 55, "gap": 5, "gap_percent": 5.0, "status": "aligned"},
    }
    
    gia_score = int(candidate_data.get("gia_score", 100))
    gia_ideal = int(ideal.get("gia_overall", 110))
    gia_analysis = {
        "score": gia_score,
        "ideal": gia_ideal,
        "percentile": min(99, max(1, int(gia_score / 130 * 100)))
    }
    
    # GenAI descriptions for each assessment
    ppa_description = f"""This candidate shows a **{'High' if ppa_analysis['dominance']['candidate'] > 60 else 'Moderate' if ppa_analysis['dominance']['candidate'] > 40 else 'Low'} Dominance** profile, indicating {'a results-driven, assertive approach to challenges' if ppa_analysis['dominance']['candidate'] > 60 else 'balanced assertiveness with collaborative tendencies'}. 

Their **{'High' if ppa_analysis['influence']['candidate'] > 60 else 'Moderate'} Influence** score suggests {'strong interpersonal skills and enthusiasm for team collaboration' if ppa_analysis['influence']['candidate'] > 60 else 'selective social engagement with focus on key relationships'}.

With **{'High' if ppa_analysis['steadiness']['candidate'] > 60 else 'Moderate' if ppa_analysis['steadiness']['candidate'] > 40 else 'Lower'} Steadiness**, this candidate {'prefers stable environments and excels at maintaining consistent performance' if ppa_analysis['steadiness']['candidate'] > 60 else 'adapts well to change and can handle multiple priorities'}.

{'High' if ppa_analysis['compliance']['candidate'] > 60 else 'Moderate'} **Compliance** indicates {'strong attention to detail and adherence to established processes' if ppa_analysis['compliance']['candidate'] > 60 else 'pragmatic approach to rules while maintaining quality standards'}."""

    hpti_description = f"""**Leadership Potential Assessment**: This candidate demonstrates {'strong' if hpti_analysis['conscientiousness']['candidate'] > 70 else 'moderate'} conscientiousness, indicating {'high reliability and commitment to quality deliverables' if hpti_analysis['conscientiousness']['candidate'] > 70 else 'balanced approach to detail and efficiency'}.

Their adjustment score of {hpti_analysis['adjustment']['candidate']}% suggests {'emotional resilience under pressure and stable performance during stress' if hpti_analysis['adjustment']['candidate'] > 60 else 'sensitivity to environmental factors that may require supportive management'}.

With curiosity at {hpti_analysis['curiosity']['candidate']}%, they show {'eagerness to learn and explore new approaches' if hpti_analysis['curiosity']['candidate'] > 60 else 'focused expertise with preference for proven methods'}.

Top performers in this role typically show similar patterns in risk approach and competitiveness, driving innovation while maintaining team harmony."""

    gia_description = f"""**General Intelligence Assessment**: With a GIA score of {gia_analysis['score']}, this candidate ranks in the **{gia_analysis['percentile']}th percentile** for cognitive ability.

This indicates {'exceptional' if gia_analysis['score'] > 115 else 'strong' if gia_analysis['score'] > 100 else 'solid'} problem-solving capabilities, {'rapid learning potential' if gia_analysis['score'] > 110 else 'effective skill acquisition'}, and {'excellent analytical thinking' if gia_analysis['score'] > 105 else 'practical reasoning ability'}.

Compared to the ideal profile target of {gia_analysis['ideal']}, this candidate is {'well-aligned' if abs(gia_analysis['score'] - gia_analysis['ideal']) < 10 else 'slightly below target but within acceptable range'} for the cognitive demands of this role.

Historical data shows candidates with similar GIA profiles succeed in technical problem-solving and strategic planning tasks."""

    overall_summary = f"""**Overall Profile Summary**: {candidate_data['name']} presents as a {'well-rounded' if candidate_data.get('match_score', 70) > 75 else 'promising'} candidate for the {role_title} role.

**Strengths identified**: {'Strong influence and team dynamics' if ppa_analysis['influence']['candidate'] > 60 else 'Balanced behavioral profile'}, {'high conscientiousness indicating reliability' if hpti_analysis['conscientiousness']['candidate'] > 70 else 'practical approach to work'}, and {'above-average cognitive ability' if gia_analysis['score'] > 105 else 'solid problem-solving skills'}.

**Areas for development**: {'May benefit from developing more assertive decision-making' if ppa_analysis['dominance']['candidate'] < 50 else 'Consider balancing drive with collaboration'}.

**Comparison to top performers**: Employees who succeeded in similar roles at this organization show {candidate_data.get('match_score', 70)}% profile alignment. This candidate's profile suggests {'high potential for success' if candidate_data.get('match_score', 70) > 75 else 'good fit with targeted development support'}."""

    return clean_numpy_types({
        "candidate_id": candidate_id,
        "candidate_name": str(candidate_data["name"]),
        "role_title": str(role_title),
        "match_score": int(candidate_data.get("match_score", 70)),
        "ppa_analysis": ppa_analysis,
        "hpti_analysis": hpti_analysis,
        "gia_analysis": gia_analysis,
        "descriptions": {
            "ppa": ppa_description,
            "hpti": hpti_description,
            "gia": gia_description,
            "overall": overall_summary
        }
    })


# ========================================
# BIAS DETECTION
# ========================================

@router.get("/bias-pitfalls/{candidate_id}")
async def get_bias_pitfalls(candidate_id: str, interviewer_id: str):
    """
    Get personalized unconscious bias warnings for a specific interviewer-candidate pairing.
    This endpoint is private and should only be visible to the interviewer.
    
    Analyzes:
    - CV content
    - LinkedIn profile similarities
    - Interview transcript topics
    - Shared backgrounds and interests
    """
    from data.mock_data import get_mock_data_generator
    
    mock_gen = get_mock_data_generator()
    
    # Detect bias pitfalls
    pitfalls = mock_gen.detect_bias_pitfalls(candidate_id, interviewer_id)
    
    if not pitfalls.get("pitfalls"):
        pitfalls["pitfalls"] = []
    
    return clean_numpy_types(pitfalls)


# ========================================
# CANDIDATE INSIGHTS (Highlights/Lowlights/Things to Check)
# ========================================

@router.get("/candidate-insights/{candidate_id}")
async def get_candidate_insights(candidate_id: str):
    """
    Get AI-generated insights for a candidate including:
    - Highlights (green): Strong points to consider
    - Lowlights (red): Concerns or potential issues
    - Things to Check (yellow): Items requiring verification before offer
    """
    from data.mock_data import get_mock_data_generator
    import random
    
    mock_gen = get_mock_data_generator()
    candidates = mock_gen.generate_candidates()
    interactions = mock_gen.generate_interaction_logs()
    
    candidate = candidates[candidates['candidate_id'] == candidate_id]
    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate = candidate.iloc[0]
    candidate_interactions = interactions[interactions['candidate_id'] == candidate_id]
    
    name = str(candidate['name'])
    first_name = name.split()[0]
    role = str(candidate['role_title'])
    stage = str(candidate['current_stage'])
    
    # Generate highlights based on candidate data
    possible_highlights = [
        {
            "title": "Strong Technical Foundation",
            "description": f"{first_name}'s coding assessment score of {random.randint(85, 98)}% places them in the top quartile of candidates for this role.",
            "source": "Coding Assessment",
            "impact": "high",
        },
        {
            "title": "Excellent Cultural Alignment",
            "description": f"PPA profile shows {first_name} has high Influence ({candidate.get('ppa_influence', 75)}) and balanced Dominance, suggesting strong collaboration potential.",
            "source": "Thomas PPA",
            "impact": "high",
        },
        {
            "title": "Proven Track Record",
            "description": f"Interview notes indicate {first_name} led a team of {random.randint(5, 15)} at their previous role, delivering ${random.randint(2, 10)}M in value.",
            "source": "Technical Interview",
            "impact": "high",
        },
        {
            "title": "High Cognitive Ability",
            "description": f"GIA score of {candidate.get('gia_score', random.randint(75, 95))} percentile indicates excellent problem-solving and learning agility.",
            "source": "Thomas GIA",
            "impact": "medium",
        },
        {
            "title": "Positive Reference Feedback",
            "description": f"Reference from previous manager describes {first_name} as 'exceptional' with 'rare combination of technical depth and leadership'.",
            "source": "Reference Check",
            "impact": "high",
        },
        {
            "title": "Strong Communication Skills",
            "description": f"All interviewers noted {first_name}'s ability to explain complex concepts clearly and ask thoughtful questions.",
            "source": "Interview Panel",
            "impact": "medium",
        },
        {
            "title": "Domain Expertise",
            "description": f"{first_name} has {random.randint(3, 8)} years of direct experience in our core technology stack.",
            "source": "CV Analysis",
            "impact": "medium",
        },
        {
            "title": "Growth Mindset",
            "description": f"HPTI Curiosity score of {candidate.get('hpti_curiosity', random.randint(70, 90))} suggests strong appetite for learning and innovation.",
            "source": "Thomas HPTI",
            "impact": "medium",
        },
    ]
    
    # Generate lowlights
    possible_lowlights = [
        {
            "title": "Salary Expectations Above Budget",
            "description": f"{first_name}'s expected compensation of £{candidate.get('expected_salary', 95000):,} is {random.randint(8, 15)}% above the approved budget for this role.",
            "source": "Recruiter Screen",
            "severity": "medium",
            "recommendation": "Consider total compensation package including equity, benefits, and growth trajectory.",
        },
        {
            "title": "Limited People Management Experience",
            "description": f"While technically strong, {first_name} has only managed teams of {random.randint(1, 3)} people, below our typical requirement of 5+.",
            "source": "CV Analysis",
            "severity": "low",
            "recommendation": "If hired, prioritize leadership development and pair with experienced manager mentor.",
        },
        {
            "title": "Job Hopping Pattern",
            "description": f"{first_name} has held {random.randint(4, 6)} positions in the last {random.randint(5, 7)} years, averaging {random.randint(12, 18)} months per role.",
            "source": "CV Analysis",
            "severity": "medium",
            "recommendation": "Probe career motivations deeply. Ensure role offers growth path to encourage retention.",
        },
        {
            "title": "Competing Offer Timeline",
            "description": f"{first_name} mentioned having a competing offer with a {random.randint(3, 7)} day deadline during their last interview.",
            "source": "Interview Notes",
            "severity": "high",
            "recommendation": "Expedite decision-making process and be prepared to move quickly.",
        },
        {
            "title": "Gaps in Core Technology",
            "description": f"Limited experience with {random.choice(['Kubernetes', 'React', 'Python', 'AWS', 'Spark'])} which is central to our tech stack.",
            "source": "Technical Interview",
            "severity": "low",
            "recommendation": "Plan onboarding to include focused upskilling in this area.",
        },
        {
            "title": "Remote Work Preference Mismatch",
            "description": f"{first_name} expressed strong preference for fully remote work; our policy requires {random.randint(2, 3)} days in office.",
            "source": "Recruiter Screen",
            "severity": "medium",
            "recommendation": "Discuss flexibility options and ensure alignment before extending offer.",
        },
        {
            "title": "Notice Period Challenge",
            "description": f"Current employer requires {random.randint(2, 3)} month notice period, which may impact start date timing.",
            "source": "HR Screen",
            "severity": "low",
            "recommendation": "Factor into project planning and consider negotiation support if needed.",
        },
    ]
    
    # Generate things to check
    possible_checks = [
        {
            "title": "Team Compatibility Assessment",
            "description": f"Schedule informal coffee chat between {first_name} and key team members ({random.choice(['Sarah', 'James', 'Priya'])}, {random.choice(['Alex', 'Tom', 'Emma'])}) to assess cultural fit.",
            "priority": "high",
            "action_type": "additional_interview",
            "stakeholders": ["Direct Reports", "Cross-functional Partners"],
        },
        {
            "title": "Dotted Line Manager Alignment",
            "description": f"This role has dotted line to {random.choice(['Product', 'Data Science', 'Platform'])} team. Recommend brief chat with their lead to confirm collaboration style fit.",
            "priority": "high",
            "action_type": "additional_interview",
            "stakeholders": ["Dotted Line Manager"],
        },
        {
            "title": "Reference Deep Dive",
            "description": f"One reference was a peer rather than manager. Consider requesting an additional manager reference from {first_name}'s tenure at {random.choice(['previous company', 'current employer'])}.",
            "priority": "medium",
            "action_type": "reference_check",
            "stakeholders": ["HR", "Recruiting"],
        },
        {
            "title": "Technical Deep Dive Needed",
            "description": f"Interview panel split on {first_name}'s {random.choice(['system design', 'architecture', 'coding'])} skills. Consider additional technical round focused on this area.",
            "priority": "medium",
            "action_type": "additional_interview",
            "stakeholders": ["Engineering Lead", "Staff Engineer"],
        },
        {
            "title": "Stakeholder Introduction",
            "description": f"Given cross-functional nature of role, recommend intro call with {random.choice(['VP of Engineering', 'CPO', 'Head of Data'])} before final decision.",
            "priority": "medium",
            "action_type": "additional_interview",
            "stakeholders": ["Executive Sponsor"],
        },
        {
            "title": "Compensation Alignment",
            "description": f"Verify budget approval for proposed package. {first_name}'s expectations may require additional headcount budget discussion.",
            "priority": "high",
            "action_type": "internal_approval",
            "stakeholders": ["HR", "Finance", "Hiring Manager"],
        },
        {
            "title": "Background Verification",
            "description": f"Standard background check and employment verification pending. Ensure completion before final offer.",
            "priority": "low",
            "action_type": "verification",
            "stakeholders": ["HR"],
        },
        {
            "title": "Visa/Work Authorization",
            "description": f"Confirm {first_name}'s work authorization status and any sponsorship requirements.",
            "priority": "high" if random.random() > 0.7 else "low",
            "action_type": "verification",
            "stakeholders": ["HR", "Legal"],
        },
    ]
    
    # Select random subset based on candidate stage
    num_highlights = random.randint(3, 5)
    num_lowlights = random.randint(1, 3)
    num_checks = random.randint(2, 4)
    
    highlights = random.sample(possible_highlights, min(num_highlights, len(possible_highlights)))
    lowlights = random.sample(possible_lowlights, min(num_lowlights, len(possible_lowlights)))
    checks = random.sample(possible_checks, min(num_checks, len(possible_checks)))
    
    # Sort by importance
    highlights = sorted(highlights, key=lambda x: 0 if x['impact'] == 'high' else 1)
    lowlights = sorted(lowlights, key=lambda x: 0 if x['severity'] == 'high' else (1 if x['severity'] == 'medium' else 2))
    checks = sorted(checks, key=lambda x: 0 if x['priority'] == 'high' else (1 if x['priority'] == 'medium' else 2))
    
    # Generate overall recommendation
    highlight_count = len([h for h in highlights if h['impact'] == 'high'])
    lowlight_count = len([l for l in lowlights if l['severity'] == 'high'])
    
    if highlight_count >= 3 and lowlight_count == 0:
        overall_recommendation = "strong_yes"
        recommendation_text = f"Strong candidate with multiple high-impact strengths. Recommend moving to offer stage."
    elif highlight_count >= 2 and lowlight_count <= 1:
        overall_recommendation = "yes"
        recommendation_text = f"Good candidate overall. Address noted concerns and complete required checks before extending offer."
    elif lowlight_count >= 2:
        overall_recommendation = "needs_review"
        recommendation_text = f"Several concerns require attention. Recommend additional evaluation before proceeding."
    else:
        overall_recommendation = "yes"
        recommendation_text = f"Solid candidate with standard pre-offer verification needed."
    
    return clean_numpy_types({
        "candidate_id": candidate_id,
        "candidate_name": name,
        "role_title": role,
        "current_stage": stage,
        "highlights": highlights,
        "lowlights": lowlights,
        "things_to_check": checks,
        "summary": {
            "total_highlights": len(highlights),
            "high_impact_highlights": highlight_count,
            "total_lowlights": len(lowlights),
            "high_severity_lowlights": lowlight_count,
            "pending_checks": len(checks),
            "high_priority_checks": len([c for c in checks if c['priority'] == 'high']),
        },
        "overall_recommendation": overall_recommendation,
        "recommendation_text": recommendation_text,
        "generated_at": "2026-01-16T10:00:00Z",
        "sources": ["Interview Transcripts", "Thomas Assessments", "CV Analysis", "Reference Checks", "Recruiter Notes"],
    })


# ========================================
# ASKTHOM AI ASSISTANT
# ========================================

class AskThomRequest(BaseModel):
    question: str
    context: Optional[str] = None
    page_context: Optional[str] = None  # E.g., "recruitment_dashboard", "candidate_detail"


class AskThomResponse(BaseModel):
    answer: str
    highlighted_answer: str  # With Thomas (orange) and IFS (purple) highlighting
    thomas_keywords_found: List[str]
    ifs_keywords_found: List[str]
    sources: List[str]


def highlight_keywords(text: str) -> dict:
    """
    Parse text and identify Thomas and IFS keywords for frontend highlighting.
    Returns the text with markers for highlighting.
    """
    thomas_keywords = get_thomas_kw()
    ifs_keywords = get_ifs_kw()
    
    found_thomas = []
    found_ifs = []
    
    # Find all occurrences (case-insensitive matching)
    text_lower = text.lower()
    
    for keyword in thomas_keywords:
        if keyword.lower() in text_lower:
            found_thomas.append(keyword)
    
    for keyword in ifs_keywords:
        if keyword.lower() in text_lower:
            found_ifs.append(keyword)
    
    # Create highlighted version with markers
    # Using special markers that frontend will parse
    highlighted = text
    
    # Sort keywords by length (longest first) to avoid partial replacements
    for keyword in sorted(set(found_thomas), key=len, reverse=True):
        import re
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        highlighted = pattern.sub(f"[[THOMAS:{keyword}]]", highlighted)
    
    for keyword in sorted(set(found_ifs), key=len, reverse=True):
        import re
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        highlighted = pattern.sub(f"[[IFS:{keyword}]]", highlighted)
    
    return {
        "highlighted_text": highlighted,
        "thomas_keywords": list(set(found_thomas)),
        "ifs_keywords": list(set(found_ifs))
    }


@router.post("/ask-thom", response_model=AskThomResponse)
async def ask_thom(request: AskThomRequest):
    """
    Ask Thom, the AI assistant powered by Thomas International insights and Databricks Gemini.
    
    Thom is pre-loaded with:
    - Thomas International product knowledge (PPA, GIA, HPTI, TEIQue, Chemistry, etc.)
    - IFS Cloud enterprise context
    - Application-specific context about this Talent Hub
    
    The response will highlight Thomas keywords in orange and IFS keywords in purple.
    """
    # Build context string
    context_parts = []
    
    if request.page_context:
        context_parts.append(f"User is currently on: {request.page_context}")
    
    if request.context:
        context_parts.append(request.context)
    
    full_context = "\n".join(context_parts) if context_parts else None
    
    # Call Databricks AI service (with fallback)
    ai_service = get_ai_service()
    if ai_service:
        answer = ai_service.ask_thom(request.question, full_context)
    else:
        # Fallback response when AI service is unavailable
        answer = generate_fallback_response(request.question)
    
    # Apply keyword highlighting
    highlighting = highlight_keywords(answer)
    
    # Determine sources based on content
    sources = []
    answer_lower = answer.lower()
    
    if any(k.lower() in answer_lower for k in ["ppa", "disc", "dominance", "influence", "steadiness", "compliance"]):
        sources.append("Thomas PPA Assessment")
    if any(k.lower() in answer_lower for k in ["gia", "intelligence", "cognitive"]):
        sources.append("Thomas GIA Assessment")
    if any(k.lower() in answer_lower for k in ["hpti", "leadership", "conscientiousness", "adjustment"]):
        sources.append("Thomas HPTI Assessment")
    if any(k.lower() in answer_lower for k in ["chemistry", "team", "collaboration"]):
        sources.append("Thomas Connect")
    if any(k.lower() in answer_lower for k in ["ifs", "erp", "eam", "fsm", "cloud"]):
        sources.append("IFS Cloud Platform")
    if any(k.lower() in answer_lower for k in ["churn", "retention", "engagement"]):
        sources.append("Thomas Engage")
    
    if not sources:
        sources = ["Thomas Insights", "Application Knowledge Base"]
    
    return AskThomResponse(
        answer=answer,
        highlighted_answer=highlighting["highlighted_text"],
        thomas_keywords_found=highlighting["thomas_keywords"],
        ifs_keywords_found=highlighting["ifs_keywords"],
        sources=sources
    )


def generate_fallback_response(question: str) -> str:
    """Generate a helpful fallback response when AI service is unavailable"""
    question_lower = question.lower()
    
    if any(term in question_lower for term in ['ppa', 'disc', 'dominance', 'influence', 'steadiness', 'compliance']):
        return """The **PPA (Personal Profile Analysis)** is Thomas International's DISC-based behavioral assessment. It measures:

• **Dominance (D)**: How you respond to problems and challenges
• **Influence (I)**: How you persuade others to your point of view
• **Steadiness (S)**: Your response to pace and consistency
• **Compliance (C)**: How you respond to rules and procedures

For IFS roles, we match candidate PPA profiles against ideal profiles derived from top performers."""

    elif any(term in question_lower for term in ['gia', 'intelligence', 'cognitive']):
        return """The **GIA (General Intelligence Assessment)** measures fluid intelligence and predicts:

• **Learning speed**: How quickly someone can acquire new skills
• **Trainability**: Potential for development and growth
• **Problem-solving**: Ability to work with abstract concepts

Higher GIA scores correlate with faster onboarding at IFS Cloud implementations."""

    elif any(term in question_lower for term in ['hpti', 'leadership', 'potential']):
        return """The **HPTI (High Potential Trait Indicator)** measures six leadership traits:

• Conscientiousness, Adjustment, Curiosity
• Risk Approach, Ambiguity Acceptance, Competitiveness

For senior IFS roles, we look for balanced HPTI profiles with strong Adjustment and Conscientiousness."""

    elif any(term in question_lower for term in ['chemistry', 'team', 'collaboration']):
        return """**Chemistry Scores** powered by Thomas Connect predict team collaboration success based on psychometric profiles.

High chemistry (75%+) suggests natural collaboration. The **Interpersonal Flexibility** score shows adaptability to work with different personalities."""

    elif any(term in question_lower for term in ['ifs', 'cloud', 'erp']):
        return """**IFS Cloud** is our unified enterprise platform combining ERP, EAM, FSM, and Industrial AI.

The Talent Hub integrates with IFS Cloud to correlate Thomas assessments with business outcomes for better hiring decisions."""

    else:
        return """I'm Thom, your AI assistant for the IFS Talent Hub. I can help you with:

• Interpreting Thomas assessments (PPA, GIA, HPTI)
• Understanding candidate fit and team chemistry
• Negotiation strategy based on psychometric profiles
• Performance insights and development recommendations

What specific aspect would you like to explore?"""


@router.get("/thom-status")
async def get_thom_status():
    """Check Thom AI service status and warmup state"""
    ai_service = get_ai_service()
    return {
        "status": "online" if ai_service else "fallback",
        "model": "databricks-gemini-2-5-flash",
        "sql_warehouse": "thomas-talenthub-dwh",
        "warmed_up": ai_service._warmed_up if ai_service else False,
        "features": [
            "Thomas International psychometric insights",
            "IFS Cloud integration knowledge",
            "Candidate analysis",
            "Negotiation advice",
            "Team chemistry predictions",
            "Leadership potential assessment"
        ]
    }
