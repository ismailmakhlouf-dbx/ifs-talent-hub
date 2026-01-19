"""
Recruitment Intelligence API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import date
import math

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from data.data_access import get_data_access

router = APIRouter()
data_access = get_data_access()


def clean_nan_values(data):
    """Replace NaN/Inf values with None and convert numpy types for JSON serialization"""
    import numpy as np
    
    if isinstance(data, dict):
        return {k: clean_nan_values(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_nan_values(item) for item in data]
    elif isinstance(data, (np.integer, np.int64, np.int32)):
        return int(data)
    elif isinstance(data, (np.floating, np.float64, np.float32)):
        if np.isnan(data) or np.isinf(data):
            return None
        return float(data)
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    elif isinstance(data, np.ndarray):
        return clean_nan_values(data.tolist())
    return data


class WeightOverride(BaseModel):
    manager_id: str
    role_id: str
    coding_assessment_weight: float
    technical_interview_weight: float
    ppa_weight: float
    gia_weight: float
    hpti_weight: float
    reason: Optional[str] = None


@router.get("/roles")
async def get_open_roles(manager_id: Optional[str] = None):
    """Get open roles with hiring targets, optionally filtered by manager"""
    roles = data_access.get_open_roles()
    
    # If manager_id is provided, filter to roles where manager is hiring manager
    # or roles in the same department (for panel interviews)
    if manager_id:
        employees = data_access.get_employees()
        manager = employees[employees["employee_id"] == manager_id]
        if not manager.empty:
            manager_dept = manager.iloc[0]["department"]
            # Show roles where this manager is hiring manager OR same department
            roles = roles[
                (roles["hiring_manager_id"] == manager_id) |
                (roles["department"] == manager_dept)
            ]
    
    return clean_nan_values(roles.to_dict(orient="records"))


@router.get("/roles/{role_id}")
async def get_role_details(role_id: str):
    """Get detailed role information"""
    role = data_access.get_role_by_id(role_id)
    if role.empty:
        raise HTTPException(status_code=404, detail="Role not found")
    
    candidates = data_access.get_candidates_for_role(role_id)
    ideal_profiles = data_access.get_ideal_profiles()
    
    role_data = role.iloc[0].to_dict()
    role_title = role_data.get("title", "")
    
    return clean_nan_values({
        "role": role_data,
        "candidates": candidates.to_dict(orient="records"),
        "ideal_profile": ideal_profiles.get(role_title, {}),
        "pipeline_summary": {
            "total": len(candidates),
            "by_stage": candidates.groupby("current_stage").size().to_dict() if len(candidates) > 0 else {}
        }
    })


@router.get("/candidates")
async def get_candidates(role_id: Optional[str] = None, manager_id: Optional[str] = None):
    """Get candidates, optionally filtered by role or manager's department"""
    if role_id:
        candidates = data_access.get_candidates_for_role(role_id)
    else:
        candidates = data_access.get_candidates()
    
    # If manager_id provided, filter candidates to relevant roles
    if manager_id:
        employees = data_access.get_employees()
        manager = employees[employees["employee_id"] == manager_id]
        if not manager.empty:
            manager_dept = manager.iloc[0]["department"]
            roles = data_access.get_open_roles()
            # Get roles in manager's department or where manager is hiring manager
            relevant_roles = roles[
                (roles["hiring_manager_id"] == manager_id) |
                (roles["department"] == manager_dept)
            ]
            relevant_role_ids = relevant_roles["role_id"].tolist()
            candidates = candidates[candidates["role_id"].isin(relevant_role_ids)]
    
    return clean_nan_values(candidates.to_dict(orient="records"))


@router.get("/candidates/{candidate_id}")
async def get_candidate_details(candidate_id: str):
    """Get detailed candidate information with interactions"""
    candidates = data_access.get_candidates()
    candidate = candidates[candidates["candidate_id"] == candidate_id]
    
    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    interactions = data_access.get_interaction_logs(candidate_id)
    ideal_profiles = data_access.get_ideal_profiles()
    
    candidate_data = candidate.iloc[0].to_dict()
    role_title = candidate_data.get("role_title", "")
    
    return clean_nan_values({
        "candidate": candidate_data,
        "interactions": interactions.to_dict(orient="records"),
        "ideal_profile": ideal_profiles.get(role_title, {}),
    })


@router.get("/ideal-profiles")
async def get_ideal_profiles():
    """Get ideal candidate profiles by role"""
    return data_access.get_ideal_profiles()


@router.get("/analytics-defaults")
async def get_analytics_defaults():
    """Get default scoring weights by role type"""
    defaults = data_access.get_analytics_defaults()
    return clean_nan_values(defaults.to_dict(orient="records"))


@router.post("/weight-override")
async def save_weight_override(override: WeightOverride):
    """Save manager weight override for HR analysis"""
    from datetime import datetime
    
    override_data = {
        "override_id": f"OVR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "manager_id": override.manager_id,
        "role_id": override.role_id,
        "coding_assessment_weight": override.coding_assessment_weight,
        "technical_interview_weight": override.technical_interview_weight,
        "ppa_weight": override.ppa_weight,
        "gia_weight": override.gia_weight,
        "hpti_weight": override.hpti_weight,
        "reason": override.reason,
    }
    
    success = data_access.save_manager_override(override_data)
    return {"success": success, "override_id": override_data["override_id"]}


@router.get("/dashboard-stats")
async def get_recruitment_dashboard_stats():
    """Get aggregated recruitment dashboard statistics"""
    roles = data_access.get_open_roles()
    candidates = data_access.get_candidates()
    
    return {
        "total_open_roles": len(roles),
        "critical_roles": len(roles[roles["priority"] == "Critical"]) if len(roles) > 0 else 0,
        "total_candidates": len(candidates),
        "avg_days_to_target": int(roles["days_until_target"].mean()) if len(roles) > 0 else 0,
        "candidates_by_stage": candidates.groupby("current_stage").size().to_dict() if len(candidates) > 0 else {},
        "roles_by_department": roles.groupby("department").size().to_dict() if len(roles) > 0 else {},
    }


@router.get("/candidates/{candidate_id}/team-collaboration")
async def get_candidate_team_collaboration(candidate_id: str):
    """Get predicted team collaborators and chemistry scores for a candidate"""
    from data.mock_data import get_mock_data_generator
    
    candidates = data_access.get_candidates()
    candidate = candidates[candidates["candidate_id"] == candidate_id]
    
    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    role_id = candidate.iloc[0]["role_id"]
    
    mock_gen = get_mock_data_generator()
    collaborations = mock_gen.generate_team_collaboration_for_candidate(candidate_id, role_id)
    
    # Summary stats
    high_risk_count = len([c for c in collaborations if c.get('chemistry_risk') == 'high'])
    low_chemistry_count = len([c for c in collaborations if c.get('chemistry_score', 0) < 50])
    avg_chemistry = sum(c.get('chemistry_score', 0) for c in collaborations) / len(collaborations) if collaborations else 0
    
    # Key recommendations
    key_recommendations = [c['recommendation'] for c in collaborations if c.get('recommendation') and c.get('importance') == 'high']
    
    return clean_nan_values({
        "candidate_id": candidate_id,
        "candidate_name": str(candidate.iloc[0]["name"]),
        "role_title": str(candidate.iloc[0]["role_title"]),
        "collaborations": collaborations,
        "summary": {
            "total_collaborators": len(collaborations),
            "avg_chemistry_score": round(avg_chemistry, 1),
            "high_risk_relationships": high_risk_count,
            "low_chemistry_count": low_chemistry_count,
        },
        "key_recommendations": key_recommendations,
    })


# ========================================
# REFERRALS ENDPOINTS
# ========================================

@router.get("/referrals")
async def get_referrals(role_id: Optional[str] = None, status: Optional[str] = None):
    """Get all referral candidates with optional filtering"""
    from data.mock_data import get_mock_data_generator
    
    mock_gen = get_mock_data_generator()
    referrals = mock_gen.generate_referrals()
    
    # Filter by role if specified
    if role_id:
        referrals = [r for r in referrals if r["role_id"] == role_id]
    
    # Filter by status if specified
    if status:
        referrals = [r for r in referrals if r["status"] == status]
    
    return clean_nan_values(referrals)


@router.get("/referrals/{referral_id}")
async def get_referral_details(referral_id: str):
    """Get detailed information about a specific referral"""
    from data.mock_data import get_mock_data_generator
    
    mock_gen = get_mock_data_generator()
    referrals = mock_gen.generate_referrals()
    
    referral = next((r for r in referrals if r["referral_id"] == referral_id), None)
    
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    # Check if AI insights exist
    insights = mock_gen._referral_insights.get(referral_id)
    
    return clean_nan_values({
        "referral": referral,
        "ai_insights": insights,
    })


@router.post("/referrals/{referral_id}/extract-insights")
async def extract_referral_insights(referral_id: str):
    """Extract AI insights from CV and web crawling for a referral candidate"""
    from data.mock_data import get_mock_data_generator
    
    mock_gen = get_mock_data_generator()
    referrals = mock_gen.generate_referrals()
    
    referral = next((r for r in referrals if r["referral_id"] == referral_id), None)
    
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    # Extract AI insights (this would be async in production)
    insights = mock_gen.extract_ai_insights(referral_id)
    
    # Get updated referral data
    updated_referral = next((r for r in mock_gen._referrals if r["referral_id"] == referral_id), referral)
    
    return clean_nan_values({
        "success": True,
        "referral": updated_referral,
        "insights": insights,
    })


@router.get("/referrals/stats/summary")
async def get_referral_stats():
    """Get summary statistics for referrals"""
    from data.mock_data import get_mock_data_generator
    
    mock_gen = get_mock_data_generator()
    referrals = mock_gen.generate_referrals()
    
    status_counts = {}
    for r in referrals:
        status = r["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    enriched_count = len([r for r in referrals if r["ai_enriched"]])
    
    return {
        "total_referrals": len(referrals),
        "by_status": status_counts,
        "ai_enriched": enriched_count,
        "pending_enrichment": len(referrals) - enriched_count,
        "by_department": {},
    }


@router.get("/referrals/{referral_id}/cv")
async def get_referral_cv(referral_id: str):
    """Get generated CV content for a referral that matches their AI insights"""
    from data.mock_data import get_mock_data_generator
    import random
    
    mock_gen = get_mock_data_generator()
    referrals = mock_gen.generate_referrals()
    
    referral = next((r for r in referrals if r["referral_id"] == referral_id), None)
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    name = referral["name"]
    first_name = name.split()[0]
    role = referral["role_title"]
    dept = referral.get("department", "Engineering")
    location = referral.get("city", "London")
    email = f"{first_name.lower()}.{name.split()[-1].lower()}@email.com"
    phone = f"+44 7{random.randint(100, 999)} {random.randint(100, 999)} {random.randint(1000, 9999)}"
    
    # Generate experience matching the insights
    years_exp = referral.get("years_experience", random.randint(5, 12))
    current_company = referral.get("current_company", "TechCorp Ltd")
    current_title = referral.get("current_title", role)
    
    skills = referral.get("skills", ["Python", "SQL", "Data Analysis", "Machine Learning", "Leadership"])
    if isinstance(skills, str):
        skills = skills.split(", ")
    
    education = referral.get("education", "BSc Computer Science")
    
    # Build work history
    work_history = [
        {
            "company": current_company,
            "title": current_title,
            "period": f"2021 - Present",
            "achievements": [
                f"Led cross-functional team of {random.randint(5, 15)} members on strategic initiatives",
                f"Delivered {random.choice(['£2M', '£5M', '£10M'])} in business value through process improvements",
                f"Established best practices for {random.choice(['data governance', 'team collaboration', 'technical excellence'])}",
            ]
        },
        {
            "company": random.choice(["Innovate Solutions", "DataFlow Inc", "Tech Dynamics"]),
            "title": f"Senior {role.replace('Staff ', '').replace('Senior ', '')}",
            "period": f"2018 - 2021",
            "achievements": [
                f"Promoted within {random.randint(12, 18)} months due to exceptional performance",
                f"Mentored {random.randint(3, 8)} junior team members",
                f"Implemented {random.choice(['ML pipeline', 'data platform', 'analytics framework'])} serving 1M+ users",
            ]
        },
        {
            "company": random.choice(["StartupXYZ", "Growth Labs", "Acme Corp"]),
            "title": role.replace('Staff ', '').replace('Senior ', ''),
            "period": f"2015 - 2018",
            "achievements": [
                f"Core team member during {random.choice(['Series A', 'Series B', 'rapid growth phase'])}",
                f"Built foundational systems still in production today",
            ]
        }
    ]
    
    cv_content = {
        "personal": {
            "name": name,
            "title": current_title,
            "email": email,
            "phone": phone,
            "location": f"{location}, UK",
            "linkedin": f"linkedin.com/in/{first_name.lower()}-{name.split()[-1].lower()}",
        },
        "summary": f"Experienced {role} with {years_exp}+ years of expertise in {dept}. "
                   f"Proven track record of delivering impactful solutions at scale. "
                   f"Strong technical foundation combined with excellent communication and leadership abilities. "
                   f"Passionate about innovation and continuous improvement.",
        "experience": work_history,
        "education": [
            {
                "degree": education,
                "institution": random.choice(["Imperial College London", "University of Manchester", "University of Edinburgh", "UCL"]),
                "year": f"{2015 - years_exp + 4}",
                "achievements": ["First Class Honours", "Dean's List"]
            }
        ],
        "skills": {
            "technical": skills[:5] if len(skills) > 5 else skills,
            "tools": [random.choice(["AWS", "GCP", "Azure"]), "Docker", "Kubernetes", "Git", "CI/CD"],
            "soft": ["Leadership", "Communication", "Problem Solving", "Stakeholder Management"],
        },
        "certifications": [
            f"{random.choice(['AWS Solutions Architect', 'Google Cloud Professional', 'Azure Administrator'])} - 2023",
            f"{random.choice(['PMP', 'Agile Scrum Master', 'ITIL Foundation'])} - 2022",
        ],
        "languages": ["English (Native)", random.choice(["French (Conversational)", "Spanish (Basic)", "German (Basic)"])],
    }
    
    return clean_nan_values(cv_content)
