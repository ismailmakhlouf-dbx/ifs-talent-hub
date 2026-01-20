"""
System Status Router
Provides endpoints for checking Databricks connectivity and system health
"""

from fastapi import APIRouter
import logging
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)
router = APIRouter()

# Thread pool for blocking Databricks operations
_executor = ThreadPoolExecutor(max_workers=2)


def _check_databricks_sync():
    """Synchronous check of Databricks connectivity with timeout"""
    from backend.services.databricks_ai import get_databricks_ai_service, DATABRICKS_HOST, MODEL_ENDPOINT
    
    result = {
        "databricks_connected": False,
        "model_serving_available": False,
        "model_serving_endpoints": [],
        "sql_warehouse_available": False,
        "sql_warehouse_error": None,
        "sql_warehouse_warmed_up": False,
        # Lakebase is NOT deployed - set explicitly to False with explanation
        "lakebase_available": False,
        "lakebase_status": "Not Deployed",
        "model_endpoint": MODEL_ENDPOINT,
        "host": DATABRICKS_HOST,
    }
    
    try:
        ai_service = get_databricks_ai_service()
        result["sql_warehouse_warmed_up"] = ai_service._warmed_up
        
        # Quick check - just try to get workspace client (don't list endpoints)
        w = ai_service._get_workspace_client()
        if w:
            result["databricks_connected"] = True
            # Assume model is available if SDK connected
            result["model_serving_available"] = True
        
        # Quick SQL check
        conn = ai_service.get_connection()
        result["sql_warehouse_available"] = conn is not None
        
    except Exception as e:
        logger.warning(f"Databricks check failed: {e}")
        result["sql_warehouse_error"] = str(e)
    
    return result


@router.get("/status")
async def get_system_status():
    """Get the current system status including Databricks connectivity"""
    from backend.services.databricks_ai import DATABRICKS_HOST, MODEL_ENDPOINT
    
    # Detect if running on Databricks Apps
    is_databricks_app = os.getenv("DATABRICKS_RUNTIME_VERSION") is not None or \
                        os.getenv("SPARK_HOME") is not None or \
                        "databricksapps.com" in os.getenv("DATABRICKS_HOST", "")
    
    # Run Databricks check with a 5-second timeout
    loop = asyncio.get_event_loop()
    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(_executor, _check_databricks_sync),
            timeout=5.0
        )
    except asyncio.TimeoutError:
        logger.warning("System status check timed out after 5 seconds")
        result = {
            "databricks_connected": False,
            "model_serving_available": False,
            "model_serving_endpoints": [],
            "sql_warehouse_available": False,
            "sql_warehouse_error": "Connection check timed out",
            "sql_warehouse_warmed_up": False,
            "lakebase_available": False,
            "lakebase_status": "Not Deployed",
            "model_endpoint": MODEL_ENDPOINT,
            "host": DATABRICKS_HOST,
        }
    except Exception as e:
        logger.error(f"System status check failed: {e}")
        result = {
            "databricks_connected": False,
            "model_serving_available": False,
            "model_serving_endpoints": [],
            "sql_warehouse_available": False,
            "sql_warehouse_error": str(e),
            "sql_warehouse_warmed_up": False,
            "lakebase_available": False,
            "lakebase_status": "Not Deployed",
            "model_endpoint": MODEL_ENDPOINT,
            "host": DATABRICKS_HOST,
        }
    
    result["is_databricks_app"] = is_databricks_app
    result["environment"] = "Databricks Apps" if is_databricks_app else "Local Development"
    
    return result


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
