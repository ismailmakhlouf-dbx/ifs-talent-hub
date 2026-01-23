# Thomas International Unified Talent Hub

**AI-Powered Talent Management Platform**

A unified talent management application integrating Thomas International psychometric assessments with Databricks AI capabilities for data-driven recruitment and performance management.

![Thomas Unified Talent Hub](docs/screenshot.png)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Deployment Guide](#deployment-guide)
   - [Step 1: Clone the Repository](#step-1-clone-the-repository)
   - [Step 2: Set Up Databricks Workspace](#step-2-set-up-databricks-workspace)
   - [Step 3: Configure Data Layer](#step-3-configure-data-layer)
   - [Step 4: Configure AI Model Endpoint](#step-4-configure-ai-model-endpoint)
   - [Step 5: Deploy the Application](#step-5-deploy-the-application)
   - [Step 6: Verify Deployment](#step-6-verify-deployment)
6. [Configuration Reference](#configuration-reference)
7. [Local Development](#local-development)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Thomas International Unified Talent Hub combines:

- **Thomas International Psychometric Assessments**: PPA (DISC), GIA, HPTI, TEIQue
- **Databricks Mosaic AI**: LLM-powered insights via Model Serving Endpoints
- **Databricks SQL/Lakebase**: Unified data layer for talent analytics
- **Modern React Frontend**: Beautiful, responsive UI with real-time data

---

## Features

| Feature | Description |
|---------|-------------|
| **Recruitment Dashboard** | Track open roles, candidates, and hiring pipelines |
| **Candidate Insights** | AI-generated highlights based on Thomas assessments |
| **Performance Management** | Team metrics, at-risk employees, churn prediction |
| **Ask Thom (AI Assistant)** | Conversational AI for psychometric interpretation |
| **Chemistry Scores** | Thomas-powered team compatibility predictions |
| **Bias Detection** | Interview bias pitfall alerts |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│                   (TypeScript + Tailwind CSS)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                            │
│                     (Python + Uvicorn)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Model Serving  │  │  SQL Warehouse  │  │   Lakebase      │
│   (Mosaic AI)   │  │   (Optional)    │  │   (Optional)    │
│                 │  │                 │  │                 │
│ - Ask Thom AI   │  │ - Live queries  │  │ - Vector search │
│ - Candidate AI  │  │ - Analytics     │  │ - Embeddings    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Prerequisites

### Required

| Requirement | Details |
|-------------|---------|
| **Databricks Workspace** | Any cloud (AWS, Azure, GCP) |
| **Databricks CLI** | v0.200+ installed and configured |
| **Model Serving Endpoint** | Foundation model or custom endpoint |

### Optional (Enhanced Features)

| Component | Purpose | Fallback |
|-----------|---------|----------|
| **SQL Warehouse** | Live data queries | Uses bundled demo data |
| **Lakebase** | Vector similarity search | Disabled gracefully |
| **Unity Catalog** | Data governance | Standard tables |

---

## Deployment Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_ORG/thomas-unified-talent-hub.git
cd thomas-unified-talent-hub
```

### Step 2: Set Up Databricks Workspace

#### 2.1 Install Databricks CLI

```bash
# macOS
brew install databricks/tap/databricks

# Windows (PowerShell)
winget install Databricks.CLI

# Linux
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

#### 2.2 Configure Authentication

```bash
databricks configure
```

When prompted, enter:
- **Databricks Host**: `https://YOUR-WORKSPACE.cloud.databricks.com`
- **Personal Access Token**: Generate from User Settings → Developer → Access Tokens

Verify connection:
```bash
databricks workspace list /
```

### Step 3: Configure Data Layer

You have **two options** for the data layer:

#### Option A: Demo Mode (No SQL Warehouse Required)

The application includes comprehensive demo data and works immediately without any SQL setup. This is the **default mode** when no SQL Warehouse is configured.

**No action required** - skip to Step 4.

#### Option B: Production Mode (SQL Warehouse + Real Data)

For production deployments with your own HR data:

##### 3.1 Create SQL Warehouse

1. Go to **Databricks Workspace** → **SQL** → **SQL Warehouses**
2. Click **Create SQL Warehouse**
3. Configure:
   - **Name**: `talent-hub-warehouse`
   - **Size**: Small (for demo) or Medium (production)
   - **Auto Stop**: 10 minutes
4. Note the **Warehouse ID** from the connection details

##### 3.2 Create Unity Catalog Resources

```sql
-- Run in SQL Editor
CREATE CATALOG IF NOT EXISTS talent_management;
USE CATALOG talent_management;

CREATE SCHEMA IF NOT EXISTS unified_hub
COMMENT 'Thomas International talent analytics';

USE SCHEMA unified_hub;
```

##### 3.3 Load Data Tables

Use the **Under the Hood** page in the deployed app to:
1. Download the complete SQL schema
2. Execute in your SQL Warehouse to create tables
3. Populate with your HR/assessment data

### Step 4: Configure AI Model Endpoint

#### 4.1 Use a Foundation Model (Recommended)

Databricks provides pay-per-token foundation models. No setup required.

The app is pre-configured to use:
```
databricks-gemini-2-5-flash
```

Alternative models:
- `databricks-meta-llama-3-1-70b-instruct`
- `databricks-claude-sonnet-4`
- `databricks-dbrx-instruct`

To change the model, edit `app.yaml`:
```yaml
env:
  - name: DATABRICKS_MODEL_ENDPOINT
    value: "your-preferred-model"
```

#### 4.2 Use a Custom Model Endpoint (Optional)

If you have a fine-tuned model:

1. Go to **Serving** → **Serving Endpoints**
2. Create or note your endpoint name
3. Update `app.yaml` with your endpoint name
4. Add the endpoint as a resource:

```yaml
resources:
  - name: "ask_thom_llm"
    serving_endpoint:
      name: "your-custom-endpoint"
      permission: "CAN_QUERY"
```

### Step 5: Deploy the Application

#### 5.1 Create the Databricks App

```bash
databricks apps create thomas-talent-hub \
  --description "Thomas International Unified Talent Hub"
```

#### 5.2 Sync Source Code to Workspace

```bash
databricks sync . /Workspace/Users/YOUR_EMAIL/thomas-talent-hub
```

Replace `YOUR_EMAIL` with your Databricks username.

#### 5.3 Deploy the Application

```bash
databricks apps deploy thomas-talent-hub \
  --source-code-path /Workspace/Users/YOUR_EMAIL/thomas-talent-hub
```

#### 5.4 Wait for Deployment

```bash
# Check deployment status
databricks apps get thomas-talent-hub

# View logs during deployment
databricks apps logs thomas-talent-hub --follow
```

### Step 6: Verify Deployment

#### 6.1 Access the Application

Once deployed, get your app URL:

```bash
databricks apps get thomas-talent-hub | grep url
```

The URL format is:
```
https://thomas-talent-hub-XXXXXXXX.REGION.databricksapps.com
```

#### 6.2 Verify All Components

1. **Open the app URL** in your browser
2. Navigate to **Under the Hood** page
3. Check the status indicators:
   - ✅ **App Status**: Running
   - ✅ **Model Endpoint**: Connected (shows model name)
   - ⚠️ **SQL Warehouse**: Available or "Demo Mode" (both are OK)
   - ⚠️ **Lakebase**: Available or "Not configured" (both are OK)

#### 6.3 Test Ask Thom

1. Click the **Ask Thom** button (bottom right)
2. Type: "What is a PPA assessment?"
3. Verify you get an AI-generated response

---

## Configuration Reference

### app.yaml

The main configuration file for Databricks Apps:

```yaml
# Databricks App Configuration
# Thomas International Unified Talent Hub

command: ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

env:
  - name: DATABRICKS_MODEL_ENDPOINT
    value: "databricks-gemini-2-5-flash"   # Change to your preferred model
  - name: LOG_LEVEL
    value: "INFO"                           # DEBUG for troubleshooting

resources:
  - name: "ask_thom_llm"
    serving_endpoint:
      name: "databricks-gemini-2-5-flash"  # Must match env value
      permission: "CAN_QUERY"
```

### Environment Variables (Optional)

For SQL Warehouse integration, set in `app.yaml`:

```yaml
env:
  - name: DATABRICKS_WAREHOUSE_ID
    value: "your-warehouse-id"
  - name: DATABRICKS_CATALOG
    value: "talent_management"
  - name: DATABRICKS_SCHEMA
    value: "unified_hub"
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Create .env file (copy from example)
cp env_example.txt .env
# Edit .env with your Databricks credentials

# 4. Start backend (Terminal 1)
uvicorn backend.main:app --reload --port 8000

# 5. Start frontend (Terminal 2)
cd frontend
npm run dev
```

### Local .env File

```bash
# .env - Local development only (not used in Databricks Apps)
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi...your-token-here
DATABRICKS_WAREHOUSE_ID=abc123...
DATABRICKS_MODEL_ENDPOINT=databricks-gemini-2-5-flash
```

---

## Troubleshooting

### Common Issues

#### 1. "App crashed unexpectedly"

**Cause**: Usually a Python import error or missing dependency.

**Solution**:
```bash
# Check logs
databricks apps logs thomas-talent-hub --follow

# Common fix: Ensure requirements.txt is complete
pip freeze > requirements.txt
```

#### 2. "Model endpoint not responding"

**Cause**: Model endpoint name mismatch or permissions.

**Solution**:
1. Verify endpoint exists: `databricks serving-endpoints list`
2. Ensure `app.yaml` resource matches env variable exactly
3. Check you have `CAN_QUERY` permission on the endpoint

#### 3. "Auth conflict: oauth and pat"

**Cause**: Both OAuth and PAT credentials detected.

**Solution**: This is handled automatically in the app. If persists:
```bash
# Clear any local token that might be synced
unset DATABRICKS_TOKEN
databricks sync . /Workspace/Users/YOUR_EMAIL/thomas-talent-hub
databricks apps deploy thomas-talent-hub --source-code-path /Workspace/Users/YOUR_EMAIL/thomas-talent-hub
```

#### 4. Data shows as empty

**Cause**: SQL Warehouse not configured or not accessible.

**Solution**: The app will use demo data automatically. To use real data:
1. Configure SQL Warehouse (see Step 3B)
2. Load your data into Unity Catalog tables
3. Redeploy the app

#### 5. Frontend not updating after changes

**Cause**: Stale frontend build.

**Solution**:
```bash
# Rebuild frontend
cd frontend
rm -rf dist
npm run build
cd ..

# Resync and redeploy
databricks sync . /Workspace/Users/YOUR_EMAIL/thomas-talent-hub
databricks apps deploy thomas-talent-hub --source-code-path /Workspace/Users/YOUR_EMAIL/thomas-talent-hub
```

### Getting Help

1. **Check Logs**: `databricks apps logs thomas-talent-hub --follow`
2. **Under the Hood**: Visit `/under-the-hood` page for system status
3. **Console**: Open browser DevTools → Console for frontend errors

---

## Data Model

The application uses the following Unity Catalog tables (optional):

| Table | Description |
|-------|-------------|
| `candidates` | Recruitment candidates with assessment scores |
| `employees` | Current employees with profiles |
| `assessments` | Thomas assessment results (PPA, GIA, HPTI) |
| `roles` | Open positions and requirements |
| `teams` | Team structure and chemistry |
| `referrals` | Employee referral tracking |

Download the complete schema from the **Under the Hood** page.

---

## Security

- **Authentication**: Databricks Apps use OAuth managed identity
- **No tokens in code**: PAT tokens are never stored in the app
- **Unity Catalog**: RBAC controls access to data
- **Model Serving**: Permission-based endpoint access

---

## License

Proprietary - Thomas International

---

## Support

For deployment assistance, contact your Thomas International representative.
