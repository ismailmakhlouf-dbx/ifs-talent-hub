"""
Databricks Configuration Module
Handles connection to Databricks SQL Warehouse and AI endpoints
"""

import os
from dataclasses import dataclass
from typing import Optional


def _is_databricks_environment() -> bool:
    """Quick check for Databricks environment - used before config module loads"""
    # Check if main.py already forced production mode
    if os.getenv("_DATABRICKS_PROD_FORCED") == "1":
        return True
    
    cwd = os.getcwd()
    return bool(
        os.getenv("DATABRICKS_APP_NAME") or 
        os.getenv("DATABRICKS_APP_ID") or 
        "databricks" in os.getenv("HOSTNAME", "").lower() or
        os.path.exists("/databricks") or
        os.getenv("SPARK_HOME") or
        "/Workspace/" in cwd or
        cwd.startswith("/home/app")  # Databricks Apps container path
    )


# CRITICAL: Only load .env file in local development
# In Databricks Apps, we use managed identity and environment variables
if not _is_databricks_environment():
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except (PermissionError, OSError):
        # .env file not accessible - use environment variables only
        pass
    except ImportError:
        # python-dotenv not installed
        pass


@dataclass
class DatabricksConfig:
    """Configuration for Databricks connection"""
    host: str
    token: str
    warehouse_id: str
    catalog: str
    schema: str
    model_endpoint: str
    embedding_endpoint: str
    
    @classmethod
    def from_env(cls) -> "DatabricksConfig":
        """Load configuration from environment variables"""
        return cls(
            host=os.getenv("DATABRICKS_HOST", ""),
            token=os.getenv("DATABRICKS_TOKEN", ""),
            warehouse_id=os.getenv("DATABRICKS_WAREHOUSE_ID", ""),
            catalog=os.getenv("DATABRICKS_CATALOG", "talent_management"),
            schema=os.getenv("DATABRICKS_SCHEMA", "unified_hub"),
            model_endpoint=os.getenv("DATABRICKS_MODEL_ENDPOINT", "databricks-meta-llama-3-1-70b-instruct"),
            embedding_endpoint=os.getenv("DATABRICKS_EMBEDDING_ENDPOINT", "databricks-bge-large-en"),
        )
    
    @property
    def is_configured(self) -> bool:
        """Check if Databricks is properly configured"""
        return bool(self.host and self.token and self.warehouse_id)


def is_databricks_app() -> bool:
    """Check if running as a Databricks App (using managed identity)"""
    # Use the same aggressive detection as _is_databricks_environment
    return _is_databricks_environment()


def get_app_mode() -> str:
    """Get current app mode (local or databricks)"""
    # PRIORITY 1: Check if running in Databricks Apps environment
    if is_databricks_app():
        return "databricks"
    
    # PRIORITY 2: Check explicit RUN_MODE or APP_MODE environment variables
    run_mode = os.getenv("RUN_MODE", "")
    if run_mode:
        return run_mode
    
    app_mode = os.getenv("APP_MODE", "")
    if app_mode:
        return app_mode
    
    # Default to local mode for development
    return "local"


def is_local_mode() -> bool:
    """Check if running in local mode with mock data"""
    # NOT local mode if we're in Databricks Apps
    if is_databricks_app():
        return False
    
    mode = get_app_mode()
    return mode == "local"


def get_sql_connection():
    """
    Get Databricks SQL connection
    Returns None if in local mode
    """
    if is_local_mode():
        return None
    
    from databricks import sql
    
    config = DatabricksConfig.from_env()
    
    return sql.connect(
        server_hostname=config.host.replace("https://", ""),
        http_path=f"/sql/1.0/warehouses/{config.warehouse_id}",
        access_token=config.token,
    )


def get_databricks_client():
    """
    Get Databricks SDK client for AI functions
    Returns None if in local mode
    """
    if is_local_mode():
        return None
    
    from databricks.sdk import WorkspaceClient
    
    config = DatabricksConfig.from_env()
    
    return WorkspaceClient(
        host=config.host,
        token=config.token,
    )
