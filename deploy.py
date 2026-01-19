"""
Deploy Thomas Talent Hub to Databricks Apps
"""

import os
import sys
import time
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.apps import App, AppDeployment

# Configuration - Use environment variables
DATABRICKS_HOST = os.getenv("DATABRICKS_HOST", "https://your-workspace.cloud.databricks.com")
DATABRICKS_TOKEN = os.getenv("DATABRICKS_TOKEN", "")
APP_NAME = "thomas-talent-hub"

def main():
    print("=" * 60)
    print("🚀 Deploying Thomas Talent Hub to Databricks Apps")
    print("=" * 60)
    
    if not DATABRICKS_TOKEN:
        print("ERROR: DATABRICKS_TOKEN environment variable not set")
        print("Please set: export DATABRICKS_TOKEN=your-token")
        sys.exit(1)
    
    try:
        w = WorkspaceClient()
        print(f"✓ Connected to {DATABRICKS_HOST}")
    except Exception as e:
        print(f"✗ Failed to connect: {e}")
        sys.exit(1)
    
    # Check if app exists
    app_exists = False
    try:
        existing_app = w.apps.get(name=APP_NAME)
        if existing_app:
            app_exists = True
            print(f"✓ Found existing app: {APP_NAME}")
    except Exception as e:
        print(f"  App '{APP_NAME}' not found, will create new")
    
    # Create app if it doesn't exist
    if not app_exists:
        try:
            print(f"Creating new app: {APP_NAME}...")
            app = w.apps.create(
                name=APP_NAME,
                description="Unified Talent Management Hub - Recruitment Intelligence & Performance Management powered by Thomas International psychometrics and Databricks AI"
            )
            print(f"✓ App created: {APP_NAME}")
        except Exception as e:
            print(f"✗ Failed to create app: {e}")
            sys.exit(1)
    
    # Get the app
    try:
        app = w.apps.get(name=APP_NAME)
        print(f"✓ App URL: {app.url}")
    except Exception as e:
        print(f"✗ Failed to get app: {e}")
    
    print()
    print("=" * 60)
    print("📋 Deployment Instructions")
    print("=" * 60)
    print()
    print("Since the Databricks Apps API requires source code to be uploaded,")
    print("please follow these steps to complete deployment:")
    print()
    print("1. Open Databricks Workspace:")
    print(f"   {DATABRICKS_HOST}")
    print()
    print("2. Navigate to Compute > Apps")
    print()
    print("3. Create a new app named 'thomas-talent-hub' or update existing")
    print()
    print("4. Upload the project files from this directory:")
    print(f"   {os.path.dirname(os.path.abspath(__file__))}")
    print()
    print("5. Key files to include:")
    print("   - app.yaml (app configuration)")
    print("   - backend/ (FastAPI backend)")
    print("   - frontend/dist/ (built React frontend)")
    print("   - data/ (mock data generators)")
    print("   - config.py (configuration)")
    print("   - requirements.txt (Python dependencies)")
    print()
    print("6. The app will start at the configured URL once deployed.")
    print()
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
