"""
Data Access Layer
Abstraction layer that switches between mock data (local) and Databricks (production)
"""

from typing import Dict, List, Any, Optional
import pandas as pd
from config import is_local_mode, get_sql_connection, DatabricksConfig
from .mock_data import get_mock_data_generator


class DataAccessLayer:
    """
    Unified data access layer that abstracts data source.
    Uses mock data in local mode and Databricks SQL in production.
    """
    
    def __init__(self):
        self.is_local = is_local_mode()
        self.mock_gen = get_mock_data_generator() if self.is_local else None
        self.connection = None if self.is_local else get_sql_connection()
        self.config = DatabricksConfig.from_env()
    
    def _execute_query(self, query: str) -> pd.DataFrame:
        """Execute SQL query against Databricks"""
        if self.is_local:
            raise ValueError("Cannot execute SQL in local mode")
        
        cursor = self.connection.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        data = cursor.fetchall()
        cursor.close()
        
        return pd.DataFrame(data, columns=columns)
    
    # ========================================
    # EMPLOYEE DATA
    # ========================================
    
    def get_employees(self) -> pd.DataFrame:
        """Get all employees"""
        if self.is_local:
            return self.mock_gen.generate_employees()
        
        return self._execute_query(f"""
            SELECT * FROM {self.config.catalog}.{self.config.schema}.employees
        """)
    
    def get_employee_by_id(self, employee_id: str) -> pd.DataFrame:
        """Get single employee by ID"""
        employees = self.get_employees()
        return employees[employees["employee_id"] == employee_id]
    
    def get_direct_reports(self, manager_id: str) -> pd.DataFrame:
        """Get direct reports for a manager"""
        employees = self.get_employees()
        return employees[employees["manager_id"] == manager_id]
    
    # ========================================
    # THOMAS ASSESSMENTS
    # ========================================
    
    def get_thomas_assessments(self) -> pd.DataFrame:
        """Get all Thomas International assessment data"""
        if self.is_local:
            return self.mock_gen.generate_thomas_assessments()
        
        return self._execute_query(f"""
            SELECT * FROM {self.config.catalog}.{self.config.schema}.thomas_assessments
        """)
    
    def get_employee_assessment(self, employee_id: str) -> pd.DataFrame:
        """Get Thomas assessment for specific employee"""
        assessments = self.get_thomas_assessments()
        return assessments[assessments["employee_id"] == employee_id]
    
    # ========================================
    # RECRUITMENT DATA
    # ========================================
    
    def get_open_roles(self) -> pd.DataFrame:
        """Get all open roles"""
        if self.is_local:
            return self.mock_gen.generate_open_roles()
        
        return self._execute_query(f"""
            SELECT * FROM {self.config.catalog}.{self.config.schema}.recruitment_pipeline
            WHERE status = 'Open'
        """)
    
    def get_role_by_id(self, role_id: str) -> pd.DataFrame:
        """Get single role by ID"""
        roles = self.get_open_roles()
        return roles[roles["role_id"] == role_id]
    
    def get_candidates(self) -> pd.DataFrame:
        """Get all candidates"""
        if self.is_local:
            return self.mock_gen.generate_candidates()
        
        return self._execute_query(f"""
            SELECT * FROM {self.config.catalog}.{self.config.schema}.candidates
        """)
    
    def get_candidates_for_role(self, role_id: str) -> pd.DataFrame:
        """Get candidates for a specific role"""
        candidates = self.get_candidates()
        return candidates[candidates["role_id"] == role_id]
    
    def get_interaction_logs(self, candidate_id: Optional[str] = None) -> pd.DataFrame:
        """Get interaction logs, optionally filtered by candidate"""
        if self.is_local:
            logs = self.mock_gen.generate_interaction_logs()
        else:
            logs = self._execute_query(f"""
                SELECT * FROM {self.config.catalog}.{self.config.schema}.interaction_logs
            """)
        
        if candidate_id:
            return logs[logs["candidate_id"] == candidate_id]
        return logs
    
    # ========================================
    # PERFORMANCE DATA
    # ========================================
    
    def get_performance_metrics(self, employee_id: Optional[str] = None, quarter: Optional[str] = None) -> pd.DataFrame:
        """Get performance metrics, optionally filtered"""
        if self.is_local:
            metrics = self.mock_gen.generate_performance_metrics()
        else:
            metrics = self._execute_query(f"""
                SELECT * FROM {self.config.catalog}.{self.config.schema}.performance_metrics
            """)
        
        if employee_id:
            metrics = metrics[metrics["employee_id"] == employee_id]
        if quarter:
            metrics = metrics[metrics["quarter"] == quarter]
        
        return metrics
    
    def get_upcoming_events(self, manager_id: Optional[str] = None) -> pd.DataFrame:
        """Get upcoming critical events"""
        if self.is_local:
            events = self.mock_gen.generate_upcoming_events()
        else:
            events = self._execute_query(f"""
                SELECT * FROM {self.config.catalog}.{self.config.schema}.employee_events
                WHERE start_date >= CURRENT_DATE()
            """)
        
        if manager_id:
            return events[events["manager_id"] == manager_id]
        return events
    
    # ========================================
    # CONFIGURATION DATA
    # ========================================
    
    def get_analytics_defaults(self) -> pd.DataFrame:
        """Get default scoring weights by role type"""
        if self.is_local:
            return self.mock_gen.generate_analytics_defaults()
        
        return self._execute_query(f"""
            SELECT * FROM {self.config.catalog}.{self.config.schema}.analytics_defaults
        """)
    
    def get_manager_overrides(self, manager_id: Optional[str] = None) -> pd.DataFrame:
        """Get manager weight overrides"""
        if self.is_local:
            overrides = self.mock_gen.generate_manager_overrides()
        else:
            overrides = self._execute_query(f"""
                SELECT * FROM {self.config.catalog}.{self.config.schema}.manager_overrides
            """)
        
        if manager_id:
            return overrides[overrides["manager_id"] == manager_id]
        return overrides
    
    def save_manager_override(self, override_data: Dict[str, Any]) -> bool:
        """Save a manager weight override"""
        if self.is_local:
            # In local mode, just log it
            print(f"[LOCAL] Would save override: {override_data}")
            return True
        
        # In production, insert into Databricks
        cursor = self.connection.cursor()
        cursor.execute(f"""
            INSERT INTO {self.config.catalog}.{self.config.schema}.manager_overrides
            VALUES (
                '{override_data["override_id"]}',
                '{override_data["manager_id"]}',
                '{override_data["role_id"]}',
                {override_data["coding_assessment_weight"]},
                {override_data["technical_interview_weight"]},
                {override_data["ppa_weight"]},
                {override_data["gia_weight"]},
                {override_data["hpti_weight"]},
                CURRENT_DATE(),
                '{override_data.get("reason", "Manager override")}'
            )
        """)
        cursor.close()
        return True
    
    # ========================================
    # IDEAL PROFILES
    # ========================================
    
    def get_ideal_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Get ideal candidate profiles by role"""
        if self.is_local:
            return self.mock_gen.generate_ideal_profiles()
        
        # In production, this would be a pre-computed table
        result = self._execute_query(f"""
            SELECT * FROM {self.config.catalog}.{self.config.schema}.ideal_profiles
        """)
        
        profiles = {}
        for _, row in result.iterrows():
            profiles[row["role_title"]] = row.to_dict()
        return profiles
    
    # ========================================
    # AGGREGATED METRICS
    # ========================================
    
    def get_team_metrics(self, manager_id: str) -> Dict[str, Any]:
        """Get aggregated team metrics for a manager"""
        direct_reports = self.get_direct_reports(manager_id)
        
        if len(direct_reports) == 0:
            return {"error": "No direct reports found"}
        
        metrics = self.get_performance_metrics(quarter="2024-Q4")
        team_metrics = metrics[metrics["employee_id"].isin(direct_reports["employee_id"])]
        
        return {
            "team_size": len(direct_reports),
            "avg_performance": team_metrics["performance_score"].mean(),
            "avg_morale": team_metrics["morale_score"].mean(),
            "high_risk_count": len(team_metrics[team_metrics["churn_risk"] == "High"]),
            "total_revenue": team_metrics["revenue"].sum() if "revenue" in team_metrics else 0,
            "avg_leadership_readiness": team_metrics["leadership_readiness"].mean(),
        }


# Singleton instance
_data_access_layer = None


def get_data_access() -> DataAccessLayer:
    """Get or create the data access layer singleton"""
    global _data_access_layer
    if _data_access_layer is None:
        _data_access_layer = DataAccessLayer()
    return _data_access_layer
