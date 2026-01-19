"""
Analytics & Reporting API Routes
"""

from fastapi import APIRouter
from typing import Optional

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from data.data_access import get_data_access

router = APIRouter()
data_access = get_data_access()


@router.get("/weight-overrides")
async def get_weight_overrides(manager_id: Optional[str] = None):
    """Get manager weight overrides for HR analysis"""
    overrides = data_access.get_manager_overrides(manager_id)
    return overrides.to_dict(orient="records")


@router.get("/hiring-funnel")
async def get_hiring_funnel():
    """Get hiring funnel analytics"""
    candidates = data_access.get_candidates()
    
    stages = ["Screening", "Phone Interview", "Technical Assessment", "Onsite Interview", "Final Round"]
    funnel = []
    
    for stage in stages:
        count = len(candidates[candidates["current_stage"] == stage])
        funnel.append({"stage": stage, "count": count})
    
    return funnel


@router.get("/department-metrics")
async def get_department_metrics():
    """Get aggregated metrics by department"""
    employees = data_access.get_employees()
    performance = data_access.get_performance_metrics(quarter="2024-Q4")
    
    merged = employees.merge(performance, on="employee_id")
    
    dept_metrics = merged.groupby("department").agg({
        "employee_id": "count",
        "performance_score": "mean",
        "morale_score": "mean",
        "leadership_readiness": "mean",
    }).reset_index()
    
    dept_metrics.columns = ["department", "headcount", "avg_performance", "avg_morale", "avg_leadership_readiness"]
    
    return dept_metrics.to_dict(orient="records")


@router.get("/thomas-profile-distribution")
async def get_thomas_profile_distribution():
    """Get distribution of Thomas assessment scores across org"""
    assessments = data_access.get_thomas_assessments()
    
    return {
        "ppa": {
            "dominance": {
                "mean": float(assessments["ppa_dominance"].mean()),
                "std": float(assessments["ppa_dominance"].std()),
                "min": int(assessments["ppa_dominance"].min()),
                "max": int(assessments["ppa_dominance"].max()),
            },
            "influence": {
                "mean": float(assessments["ppa_influence"].mean()),
                "std": float(assessments["ppa_influence"].std()),
                "min": int(assessments["ppa_influence"].min()),
                "max": int(assessments["ppa_influence"].max()),
            },
            "steadiness": {
                "mean": float(assessments["ppa_steadiness"].mean()),
                "std": float(assessments["ppa_steadiness"].std()),
                "min": int(assessments["ppa_steadiness"].min()),
                "max": int(assessments["ppa_steadiness"].max()),
            },
            "compliance": {
                "mean": float(assessments["ppa_compliance"].mean()),
                "std": float(assessments["ppa_compliance"].std()),
                "min": int(assessments["ppa_compliance"].min()),
                "max": int(assessments["ppa_compliance"].max()),
            },
        },
        "gia": {
            "mean": float(assessments["gia_overall"].mean()),
            "std": float(assessments["gia_overall"].std()),
            "min": int(assessments["gia_overall"].min()),
            "max": int(assessments["gia_overall"].max()),
        },
        "sample_size": len(assessments),
    }
