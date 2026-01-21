import os
# ============================================================================
# DATABRICKS CLOUD DETECTION - ABSOLUTE FIRST THING
# ============================================================================
if os.getenv("DATABRICKS_APP_NAME"):
    os.environ["MODE"] = "PROD"
    os.environ["APP_MODE"] = "databricks"
    os.environ["RUN_MODE"] = "databricks"
    os.environ["MOCK_DATA"] = "False"
    os.environ["_DATABRICKS_PROD_FORCED"] = "1"
    print("🚨 DATABRICKS CLOUD DETECTED: FORCING PRODUCTION SETTINGS (MOCK MODE KILLED)")

"""
Unified Talent Management Hub - FastAPI Backend
Powered by Databricks + Thomas International
"""

import sys

# Now do regular imports
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routers import recruitment, performance, analytics, ai_insights, system
from config import is_local_mode, is_databricks_app

# Check if we have a built frontend
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
HAS_STATIC = os.path.exists(STATIC_DIR) and os.path.exists(os.path.join(STATIC_DIR, "index.html"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Determine runtime mode
    if is_databricks_app():
        mode_str = "🚀 STARTING IN PRODUCTION MODE (Managed Identity)"
        app_name = os.getenv("DATABRICKS_APP_NAME", "unknown")
        print(mode_str)
        print(f"   App Name: {app_name}")
    elif is_local_mode():
        print("🚀 Starting IFS Talent Hub API (Powered by Thomas International)")
        print("   Mode: Local (Mock Data)")
    else:
        print("🚀 Starting IFS Talent Hub API (Powered by Thomas International)")
        print("   Mode: Databricks Connected (Token Auth)")
    
    print(f"   Static Files: {'Enabled' if HAS_STATIC else 'Disabled (development mode)'}")
    
    # Warm up Databricks SQL Warehouse
    if not is_local_mode():
        try:
            from backend.services.databricks_ai import get_databricks_ai_service
            ai_service = get_databricks_ai_service()
            print("   ⏳ Warming up Databricks SQL Warehouse...")
            if ai_service.warmup():
                print("   ✅ SQL Warehouse warmed up successfully")
            else:
                print("   ⚠️  SQL Warehouse warmup failed - will use fallback")
        except Exception as e:
            print(f"   ⚠️  Warmup error: {e}")
    
    yield
    print("👋 Shutting down API")


app = FastAPI(
    title="Unified Talent Management Hub",
    description="Predictive insights for recruiting and performance management powered by Thomas International psychometric data",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler to prevent crashes
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions to prevent app crashes"""
    error_id = id(exc)
    logger.error(f"Unhandled exception [{error_id}]: {type(exc).__name__}: {str(exc)}")
    logger.error(f"Request: {request.method} {request.url}")
    logger.error(traceback.format_exc())
    
    # Return a safe error response instead of crashing
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "error_id": str(error_id),
            "message": str(exc) if not is_local_mode() else f"{type(exc).__name__}: {str(exc)}",
            "recovery": "The request failed but the application is still running. Please try again."
        }
    )

# Include API routers
app.include_router(recruitment.router, prefix="/api/recruitment", tags=["Recruitment"])
app.include_router(performance.router, prefix="/api/performance", tags=["Performance"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(ai_insights.router, prefix="/api/ai", tags=["AI Insights"])
app.include_router(system.router, prefix="/api/system", tags=["System"])


@app.get("/api")
async def api_root():
    return {
        "name": "Unified Talent Management Hub API",
        "version": "1.0.0",
        "status": "running",
        "mode": "local" if is_local_mode() else "databricks",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


# Serve static files and SPA routing if frontend is built
if HAS_STATIC:
    # Mount static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    # Catch-all route for SPA - must be last
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the React SPA for all non-API routes"""
        # Don't intercept API calls
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        
        # Check if it's a static file request
        static_file = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(static_file):
            return FileResponse(static_file)
        
        # Otherwise serve index.html for SPA routing
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "name": "Unified Talent Management Hub",
            "version": "1.0.0",
            "status": "running",
            "mode": "local" if is_local_mode() else "databricks",
            "note": "Frontend not built. Run 'npm run build' in frontend directory.",
        }
