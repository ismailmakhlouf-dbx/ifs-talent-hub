"""
System Status Router
Provides endpoints for checking Databricks connectivity and system health
"""

from fastapi import APIRouter
import logging
import os

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/status")
async def get_system_status():
    """Get the current system status including Databricks connectivity"""
    from backend.services.databricks_ai import get_databricks_ai_service, DATABRICKS_HOST, MODEL_ENDPOINT
    
    ai_service = get_databricks_ai_service()
    
    # Detect if running on Databricks Apps (service principal auth available)
    is_databricks_app = os.getenv("DATABRICKS_RUNTIME_VERSION") is not None or \
                        os.getenv("SPARK_HOME") is not None or \
                        "databricksapps.com" in os.getenv("DATABRICKS_HOST", "")
    
    # Check workspace client connectivity
    databricks_connected = False
    model_serving_available = False
    model_serving_endpoints = []
    
    try:
        w = ai_service._get_workspace_client()
        if w:
            databricks_connected = True
            # Try to list endpoints
            try:
                endpoints = list(w.serving_endpoints.list())
                model_serving_endpoints = [e.name for e in endpoints[:5]]  # First 5 for display
                model_serving_available = any(e.name == MODEL_ENDPOINT for e in endpoints)
            except Exception as e:
                logger.warning(f"Could not list serving endpoints: {e}")
    except Exception as e:
        logger.warning(f"Could not check workspace client: {e}")
    
    # Check SQL warehouse availability
    sql_warehouse_available = False
    sql_warehouse_error = None
    try:
        conn = ai_service.get_connection()
        sql_warehouse_available = conn is not None
    except Exception as e:
        sql_warehouse_error = str(e)
        logger.warning(f"Could not check SQL warehouse: {e}")
    
    # Check Lakebase (Delta Lake) - simulated for demo
    lakebase_available = databricks_connected  # If connected, Lakebase is available
    
    return {
        "is_databricks_app": is_databricks_app,
        "databricks_connected": databricks_connected,
        "model_serving_available": model_serving_available,
        "model_serving_endpoints": model_serving_endpoints,
        "sql_warehouse_available": sql_warehouse_available,
        "sql_warehouse_error": sql_warehouse_error,
        "sql_warehouse_warmed_up": ai_service._warmed_up,
        "lakebase_available": lakebase_available,
        "model_endpoint": MODEL_ENDPOINT,
        "host": DATABRICKS_HOST,
        "environment": "Databricks Apps" if is_databricks_app else "Local Development",
    }


@router.post("/warmup")
async def warmup_services():
    """Warm up Databricks services"""
    from backend.services.databricks_ai import get_databricks_ai_service
    
    ai_service = get_databricks_ai_service()
    
    # Warm up SQL warehouse
    sql_warmed = ai_service.warmup()
    
    # Test model serving with a simple query
    model_warmed = False
    try:
        response = ai_service.ask_thom("Hello, this is a warmup test. Reply with 'Ready!'")
        model_warmed = "Ready" in response or len(response) > 10
    except Exception as e:
        logger.warning(f"Model warmup failed: {e}")
    
    return {
        "sql_warehouse_warmed": sql_warmed,
        "model_serving_warmed": model_warmed,
    }
