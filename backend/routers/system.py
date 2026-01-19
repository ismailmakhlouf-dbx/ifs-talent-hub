"""
System Status Router
Provides endpoints for checking Databricks connectivity and system health
"""

from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/status")
async def get_system_status():
    """Get the current system status including Databricks connectivity"""
    from backend.services.databricks_ai import get_databricks_ai_service, DATABRICKS_HOST, MODEL_ENDPOINT
    
    ai_service = get_databricks_ai_service()
    
    # Check model serving availability
    model_serving_available = False
    try:
        w = ai_service._get_workspace_client()
        if w:
            # Try to list endpoints
            endpoints = list(w.serving_endpoints.list())
            model_serving_available = any(e.name == MODEL_ENDPOINT for e in endpoints)
    except Exception as e:
        logger.warning(f"Could not check model serving: {e}")
    
    # Check SQL warehouse availability
    sql_warehouse_available = False
    try:
        conn = ai_service.get_connection()
        sql_warehouse_available = conn is not None
    except Exception as e:
        logger.warning(f"Could not check SQL warehouse: {e}")
    
    return {
        "databricks_connected": ai_service._workspace_client is not None,
        "model_serving_available": model_serving_available,
        "sql_warehouse_available": sql_warehouse_available,
        "sql_warehouse_warmed_up": ai_service._warmed_up,
        "model_endpoint": MODEL_ENDPOINT,
        "host": DATABRICKS_HOST,
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
