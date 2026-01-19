"""
Employee Performance & Morale API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
import math
import numpy as np

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from data.data_access import get_data_access

router = APIRouter()
data_access = get_data_access()


def clean_nan_values(data):
    """Replace NaN/Inf values with None and convert numpy types for JSON serialization"""
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


@router.get("/employees")
async def get_employees():
    """Get all employees"""
    employees = data_access.get_employees()
    return clean_nan_values(employees.to_dict(orient="records"))


@router.get("/employees/{employee_id}")
async def get_employee_details(employee_id: str):
    """Get detailed employee information with assessments and performance"""
    employee = data_access.get_employee_by_id(employee_id)
    if employee.empty:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    assessments = data_access.get_employee_assessment(employee_id)
    performance = data_access.get_performance_metrics(employee_id=employee_id)
    
    return clean_nan_values({
        "employee": employee.iloc[0].to_dict(),
        "assessments": assessments.to_dict(orient="records") if not assessments.empty else [],
        "performance_history": performance.to_dict(orient="records"),
    })


@router.get("/managers")
async def get_managers():
    """Get all managers"""
    employees = data_access.get_employees()
    managers = employees[employees["is_manager"] == True]
    return clean_nan_values(managers.to_dict(orient="records"))


@router.get("/managers/{manager_id}/team")
async def get_manager_team(manager_id: str):
    """Get manager's direct reports and team metrics"""
    direct_reports = data_access.get_direct_reports(manager_id)
    team_metrics = data_access.get_team_metrics(manager_id)
    upcoming_events = data_access.get_upcoming_events(manager_id)
    
    return clean_nan_values({
        "direct_reports": direct_reports.to_dict(orient="records"),
        "team_metrics": team_metrics,
        "upcoming_events": upcoming_events.to_dict(orient="records") if not upcoming_events.empty else [],
    })


@router.get("/managers/{manager_id}/at-risk")
async def get_at_risk_employees(manager_id: str):
    """Get high-risk employees for a manager"""
    direct_reports = data_access.get_direct_reports(manager_id)
    performance = data_access.get_performance_metrics(quarter="2024-Q4")
    
    if direct_reports.empty:
        return {"at_risk": [], "critical_events": []}
    
    team_performance = performance[performance["employee_id"].isin(direct_reports["employee_id"])]
    high_risk = team_performance[team_performance["churn_risk"] == "High"]
    
    # Merge with employee info
    at_risk_employees = high_risk.merge(
        direct_reports[["employee_id", "name", "title", "tenure_months"]],
        on="employee_id"
    )
    
    # Get critical events
    upcoming_events = data_access.get_upcoming_events(manager_id)
    critical_events = upcoming_events[upcoming_events["is_critical"] == True] if not upcoming_events.empty else []
    
    return clean_nan_values({
        "at_risk": at_risk_employees.to_dict(orient="records") if not at_risk_employees.empty else [],
        "critical_events": critical_events.to_dict(orient="records") if len(critical_events) > 0 else [],
    })


@router.get("/metrics")
async def get_performance_metrics(
    employee_id: Optional[str] = None,
    quarter: Optional[str] = None
):
    """Get performance metrics with optional filters"""
    metrics = data_access.get_performance_metrics(employee_id=employee_id, quarter=quarter)
    return clean_nan_values(metrics.to_dict(orient="records"))


@router.get("/assessments/{employee_id}")
async def get_thomas_assessments(employee_id: str):
    """Get Thomas International assessment data for an employee"""
    assessments = data_access.get_employee_assessment(employee_id)
    if assessments.empty:
        raise HTTPException(status_code=404, detail="No assessments found")
    return clean_nan_values(assessments.iloc[0].to_dict())


@router.get("/dashboard-stats/{manager_id}")
async def get_performance_dashboard_stats(manager_id: str):
    """Get aggregated performance dashboard statistics for a manager"""
    team_metrics = data_access.get_team_metrics(manager_id)
    direct_reports = data_access.get_direct_reports(manager_id)
    performance = data_access.get_performance_metrics(quarter="2024-Q4")
    
    if direct_reports.empty:
        return {"error": "No direct reports found"}
    
    team_perf = performance[performance["employee_id"].isin(direct_reports["employee_id"])]
    
    # Handle potential NaN values from team_metrics
    avg_perf = team_metrics.get("avg_performance", 0)
    avg_mor = team_metrics.get("avg_morale", 0)
    avg_lead = team_metrics.get("avg_leadership_readiness", 0)
    
    return clean_nan_values({
        "team_size": team_metrics.get("team_size", 0),
        "avg_performance": round(avg_perf * 100, 1) if avg_perf and not (isinstance(avg_perf, float) and math.isnan(avg_perf)) else 0,
        "avg_morale": round(avg_mor, 1) if avg_mor and not (isinstance(avg_mor, float) and math.isnan(avg_mor)) else 0,
        "high_risk_count": team_metrics.get("high_risk_count", 0),
        "avg_leadership_readiness": round(avg_lead, 1) if avg_lead and not (isinstance(avg_lead, float) and math.isnan(avg_lead)) else 0,
        "total_revenue": team_metrics.get("total_revenue", 0),
        "churn_risk_distribution": team_perf.groupby("churn_risk").size().to_dict() if not team_perf.empty else {},
        "performance_distribution": team_perf["performance_score"].describe().to_dict() if not team_perf.empty else {},
    })


@router.get("/employees/{employee_id}/team-collaboration")
async def get_employee_team_collaboration(employee_id: str):
    """Get team collaboration data including chemistry scores and interpersonal flexibility"""
    from data.mock_data import get_mock_data_generator
    
    employee = data_access.get_employee_by_id(employee_id)
    if employee.empty:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    mock_gen = get_mock_data_generator()
    collaboration_data = mock_gen.generate_team_collaboration_for_employee(employee_id)
    
    collaborations = collaboration_data.get("collaborations", [])
    interpersonal_flexibility = collaboration_data.get("interpersonal_flexibility", {})
    
    # Summary stats
    avg_chemistry = sum(c.get('chemistry_score', 0) for c in collaborations) / len(collaborations) if collaborations else 0
    avg_relationship = sum(c.get('relationship_score', 0) for c in collaborations) / len(collaborations) if collaborations else 0
    flexibility_examples = [c for c in collaborations if c.get('shows_interpersonal_flexibility')]
    
    return clean_nan_values({
        "employee_id": employee_id,
        "employee_name": str(employee.iloc[0]["name"]),
        "collaborations": collaborations,
        "interpersonal_flexibility": interpersonal_flexibility,
        "summary": {
            "total_collaborators": len(collaborations),
            "avg_chemistry_score": round(avg_chemistry, 1),
            "avg_relationship_score": round(avg_relationship, 1),
            "flexibility_examples_count": len(flexibility_examples),
        },
    })
