# IFS Talent Hub

**Unified Talent Management powered by Thomas International psychometrics and Databricks AI**

A Databricks App demonstrating integration between Thomas International's psychometric assessment products and Databricks' AI/ML capabilities for HR and talent management.

![IFS Talent Hub](docs/screenshot.png)

## Features

### 🎯 Recruitment Intelligence
- **Open Roles Dashboard**: Track hiring pipeline with milestones and priorities
- **Candidate Profiles**: Thomas assessments (PPA, GIA, HPTI) with ideal profile matching
- **Negotiation Coach**: AI-powered salary negotiation advice based on psychometric profiles
- **Bias Detection**: Unconscious bias warnings for interviewers
- **AI Insights**: Highlights, lowlights, and things to check for each candidate

### 👥 Performance Management
- **Manager Dashboard**: Business metrics vs. people metrics
- **Team Collaboration**: Chemistry scores and relationship analysis
- **Churn Risk**: Predictive analytics with actionable recommendations
- **Leadership Potential**: Next-role readiness predictions

### 🤖 Ask Thom AI Assistant
- Context-aware AI assistant powered by `databricks-gemini-2-5-flash`
- Pre-loaded with Thomas International product knowledge
- IFS Cloud enterprise context
- Expandable UI (normal → half-screen → full-screen)
- Keyword highlighting (Thomas products in orange, IFS products in purple)

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| AI/ML | Databricks Mosaic AI, Gemini 2.5 Flash |
| Data | Databricks SQL Warehouse, Unity Catalog |
| Psychometrics | Thomas International APIs (PPA, GIA, HPTI, TEIQue, Engage) |

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Databricks workspace (optional - app works with mock data)

### 1. Clone the repository
```bash
git clone https://github.com/databricks/ifs-talent-hub.git
cd ifs-talent-hub
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Start the development servers

**Option A: Run both servers**
```bash
# Terminal 1 - Backend
python -m uvicorn backend.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Option B: Use the start script**
```bash
./start.sh
```

### 5. Open the app
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

---

## Deploy to Databricks Apps

### Prerequisites
- Databricks CLI v0.200+ installed and configured
- Databricks workspace with Apps enabled
- Personal Access Token with appropriate permissions

### 1. Build the frontend
```bash
cd frontend && npm run build && cd ..
```

### 2. Create the app (first time only)
```bash
databricks apps create \
  --name ifs-talent-hub \
  --description "IFS Talent Hub - Unified Talent Management"
```

### 3. Sync source code to workspace
```bash
databricks sync . /Workspace/Users/<your-email>/ifs-talent-hub --watch=false
```

### 4. Deploy the app
```bash
databricks apps deploy ifs-talent-hub \
  --source-code-path /Workspace/Users/<your-email>/ifs-talent-hub
```

### 5. Access the app
Your app will be available at:
```
https://ifs-talent-hub-<workspace-id>.aws.databricksapps.com
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABRICKS_HOST` | Databricks workspace URL | - |
| `DATABRICKS_TOKEN` | Personal Access Token | - |
| `DATABRICKS_WAREHOUSE_ID` | SQL Warehouse ID for AI functions | - |
| `DATABRICKS_MODEL_ENDPOINT` | Model serving endpoint | `databricks-gemini-2-5-flash` |
| `APP_MODE` | `local` or `databricks` | `local` |
| `USE_MOCK_DATA` | Use mock data instead of real APIs | `true` |

### app.yaml Configuration
```yaml
name: ifs-talent-hub
description: "IFS Talent Hub - Powered by Thomas International"

command: ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

env:
  - name: APP_MODE
    value: "local"
  - name: DATABRICKS_MODEL_ENDPOINT
    value: "databricks-gemini-2-5-flash"
  - name: PYTHONPATH
    value: "."

resources:
  cpu: "2"
  memory: "4Gi"
```

---

## Project Structure

```
ifs-talent-hub/
├── app.yaml                 # Databricks App configuration
├── requirements.txt         # Python dependencies
├── backend/
│   ├── main.py             # FastAPI application
│   ├── routers/
│   │   ├── recruitment.py  # Recruitment API endpoints
│   │   ├── performance.py  # Performance API endpoints
│   │   ├── ai_insights.py  # AI/GenAI endpoints + Ask Thom
│   │   └── analytics.py    # Analytics endpoints
│   └── services/
│       └── databricks_ai.py # Databricks AI integration
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── lib/api.ts      # API client
│   ├── tailwind.config.js  # Tailwind + Thomas branding
│   └── package.json
├── data/
│   ├── mock_data.py        # Mock data generator
│   └── data_access.py      # Data access layer
├── ai/
│   └── llm_service.py      # LLM service abstraction
└── config/
    └── databricks_config.py # Databricks configuration
```

---

## Thomas International Products Integration

This app demonstrates integration with these Thomas products:

| Product | Purpose | Usage in App |
|---------|---------|--------------|
| **PPA** | Personal Profile Analysis (DISC) | Candidate behavioral profiling |
| **GIA** | General Intelligence Assessment | Cognitive ability scoring |
| **HPTI** | High Potential Trait Indicator | Leadership potential prediction |
| **TEIQue** | Trait Emotional Intelligence | Emotional intelligence metrics |
| **Engage** | Employee Engagement | Morale and engagement tracking |
| **Thomas Connect** | Team Composition | Chemistry score calculation |

---

## Databricks AI Features

### SQL Warehouse AI Functions
The app uses Databricks SQL AI functions for:
- CV insight extraction using `AI_QUERY()`
- Candidate profile analysis
- Salary benchmarking

### Model Serving
- **Endpoint**: `databricks-gemini-2-5-flash`
- **Usage**: Ask Thom AI assistant, negotiation advice, performance summaries

### Warehouse Warmup
The app automatically warms up the SQL warehouse on startup to reduce first-query latency.

---

## Branding

### Thomas International Colors
- Orange (Primary): `#FF6B35`
- Magenta (AI): `#E91E63`
- Slate Navy: `#1A1F2E`

### IFS Colors
- Purple: `#7B2FBE`

### Typography
- Headings: `font-display` (Inter/Rubik)
- Body: `font-sans`

---

## License

This is a demo application. Thomas International and IFS are trademarks of their respective owners.

---

## Support

For questions or issues:
- Create a GitHub issue
- Contact: ismail.makhlouf@databricks.com
