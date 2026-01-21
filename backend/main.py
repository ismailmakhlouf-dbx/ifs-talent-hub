"""FastAPI app with routers, static files, and lifespan - debugging step 4"""
import os
import sys
import logging
import traceback as tb

print(f"[BOOT] DATABRICKS_APP_NAME={os.getenv('DATABRICKS_APP_NAME')}")
print(f"[BOOT] CWD={os.getcwd()}")

# Set production mode if in Databricks
if os.getenv("DATABRICKS_APP_NAME"):
    os.environ["MODE"] = "PROD"
    os.environ["APP_MODE"] = "databricks"
    os.environ["RUN_MODE"] = "databricks"
    os.environ["MOCK_DATA"] = "False"
    os.environ["_DATABRICKS_PROD_FORCED"] = "1"
    print("[BOOT] Production mode set")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

print("[BOOT] FastAPI imported")

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
print(f"[BOOT] Path updated, trying imports...")

try:
    from backend.routers import recruitment, performance, analytics, ai_insights, system
    print("[BOOT] Routers imported")
except Exception as e:
    print(f"[BOOT] Router import failed: {e}")

try:
    from config import is_local_mode, is_databricks_app
    print(f"[BOOT] Config imported: is_databricks_app={is_databricks_app()}")
except Exception as e:
    print(f"[BOOT] Config import failed: {e}")
    is_local_mode = lambda: True
    is_databricks_app = lambda: False

# Find static files
_base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(_base_dir, "frontend", "dist")
_assets_dir = os.path.join(STATIC_DIR, "assets")
_index_html = os.path.join(STATIC_DIR, "index.html")

HAS_STATIC = os.path.exists(_index_html) and os.path.isdir(_assets_dir)
print(f"[BOOT] STATIC_DIR={STATIC_DIR}, HAS_STATIC={HAS_STATIC}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print("[LIFESPAN] Starting up...")
    
    if is_databricks_app():
        print("[LIFESPAN] PRODUCTION MODE (Managed Identity)")
        print(f"[LIFESPAN] App Name: {os.getenv('DATABRICKS_APP_NAME', 'unknown')}")
    elif is_local_mode():
        print("[LIFESPAN] LOCAL MODE (Mock Data)")
    else:
        print("[LIFESPAN] DATABRICKS MODE (Token Auth)")
    
    print(f"[LIFESPAN] Static Files: {'Enabled' if HAS_STATIC else 'Disabled'}")
    
    # Skip warmup in this debug version
    # if not is_local_mode():
    #     try:
    #         from backend.services.databricks_ai import get_databricks_ai_service
    #         ai_service = get_databricks_ai_service()
    #         if ai_service.warmup():
    #             print("[LIFESPAN] SQL Warehouse warmed up")
    #     except Exception as e:
    #         print(f"[LIFESPAN] Warmup error: {e}")
    
    yield
    print("[LIFESPAN] Shutting down...")


app = FastAPI(
    title="Unified Talent Management Hub",
    description="Powered by Thomas International + Databricks AI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_id = id(exc)
    logger.error(f"Unhandled exception [{error_id}]: {type(exc).__name__}: {str(exc)}")
    logger.error(f"Request: {request.method} {request.url}")
    logger.error(tb.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "error_id": str(error_id),
            "message": str(exc),
        }
    )

# Include routers
try:
    app.include_router(recruitment.router, prefix="/api/recruitment", tags=["Recruitment"])
    app.include_router(performance.router, prefix="/api/performance", tags=["Performance"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
    app.include_router(ai_insights.router, prefix="/api/ai", tags=["AI Insights"])
    app.include_router(system.router, prefix="/api/system", tags=["System"])
    print("[BOOT] Routers registered")
except Exception as e:
    print(f"[BOOT] Router registration failed: {e}")


@app.get("/api")
async def api_root():
    return {
        "name": "Unified Talent Management Hub API",
        "version": "1.0.0",
        "status": "running",
        "mode": "databricks" if is_databricks_app() else ("local" if is_local_mode() else "token"),
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# Static file serving
if HAS_STATIC:
    print("[BOOT] Mounting static files...")
    try:
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")
        print("[BOOT] Static files mounted")
    except Exception as e:
        print(f"[BOOT] Failed to mount static files: {e}")
    
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        
        static_file = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(static_file):
            return FileResponse(static_file)
        
        return FileResponse(_index_html)
else:
    @app.get("/")
    async def root():
        return {"message": "API only mode - no static files", "static_dir": STATIC_DIR}
