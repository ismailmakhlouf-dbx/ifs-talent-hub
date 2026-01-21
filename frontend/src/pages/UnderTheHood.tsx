import { useState, useEffect } from 'react'
import { 
  Database, 
  Server, 
  Cpu, 
  Zap, 
  Cloud,
  GitBranch,
  Layers,
  Shield,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Box,
  Code,
  Sparkles,
  Copy,
  Check,
  Download,
  Table,
  Link2,
  ChevronDown,
  ChevronRight,
  FileCode,
  FileJson,
  Key,
  Hash,
  Calendar,
  Type
} from 'lucide-react'
import { usePageContext } from '../contexts/PageContext'
import clsx from 'clsx'

interface SystemStatus {
  is_databricks_app: boolean
  databricks_connected: boolean
  model_serving_available: boolean
  model_serving_endpoints: string[]
  sql_warehouse_available: boolean
  sql_warehouse_warmed_up: boolean
  lakebase_available: boolean
  lakebase_status?: string
  model_endpoint: string
  host: string
  environment: string
}

export default function UnderTheHood() {
  const { setPageContext } = usePageContext()
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Update page context for AskThom
  useEffect(() => {
    setPageContext({
      pageName: 'Under the Hood',
      pageDescription: 'System architecture and live status of Databricks components',
      systemDiagram: 'IFS Talent Hub Architecture: React Frontend → FastAPI Backend → Databricks (Model Serving + Lakebase)',
      isDatabricksApp: status?.is_databricks_app || false,
      modelEndpoint: status?.model_endpoint || 'Not connected',
      sqlWarehouseStatus: status?.sql_warehouse_available ? 'Available' : 'Unavailable',
      lakebaseStatus: status?.lakebase_available ? 'Available' : 'Unavailable'
    })
  }, [status, setPageContext])

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/system/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-thomas-slate to-slate-700 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-thomas-slate">Under the Hood</h1>
              <p className="text-slate-500">Powered by Databricks • Mosaic AI • Unity Catalog</p>
            </div>
          </div>
        </div>

        {/* Architecture Overview - 2 groups with bounding boxes */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* DEMO ACTIVE - Databricks Apps + Mosaic AI */}
          <div className="relative rounded-2xl border-2 border-success p-4 bg-success/5">
            <div className="absolute -top-3 left-4 px-3 py-0.5 bg-success text-white text-xs font-bold rounded-full flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              DEMO ACTIVE
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Databricks Apps */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-thomas-slate text-sm">Databricks Apps</h3>
                    <p className="text-[10px] text-slate-500">Application Hosting</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span className="text-[11px]">FastAPI Backend</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span className="text-[11px]">React Frontend (Vite)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span className="text-[11px]">Service Principal Auth</span>
                  </li>
                </ul>
              </div>

              {/* Mosaic AI Model Serving */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-thomas-slate text-sm">Mosaic AI</h3>
                    <p className="text-[10px] text-slate-500">Model Serving</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-warning" />
                    <span className="font-mono text-[10px]">gemini-2-5-flash</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span className="text-[11px]">AskThom Chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span className="text-[11px]">Candidate Summaries</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* PRODUCTION - SQL Warehouse + Lakebase */}
          <div className="relative rounded-2xl border-2 border-slate-300 border-dashed p-4 bg-slate-50 opacity-60">
            <div className="absolute -top-3 left-4 px-3 py-0.5 bg-slate-500 text-white text-xs font-bold rounded-full">
              PRODUCTION
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* SQL Warehouse - for AI Functions */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Server className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-thomas-slate text-sm">SQL Warehouse</h3>
                    <p className="text-[10px] text-slate-500">AI Functions</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-cyan-500" />
                    <span className="font-mono text-[10px]">thomas-talenthub-dwh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px]">AI_QUERY (CV Extraction)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px]">AI_GENERATE</span>
                  </li>
                </ul>
              </div>

              {/* Lakebase - Delta Lake Storage */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-thomas-slate text-sm">Lakebase</h3>
                    <p className="text-[10px] text-slate-500">Data Storage</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    <span className="text-[11px]">Delta Lake Tables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px]">Unity Catalog</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px]">Column Masking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Status */}
        <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-thomas-slate text-lg">Live System Status</h3>
            <button 
              onClick={fetchStatus}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-thomas-orange transition-colors"
            >
              <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
          
          {/* Environment Banner */}
          <div className={clsx(
            "mb-4 px-4 py-2 rounded-xl flex items-center gap-3",
            status?.is_databricks_app ? "bg-success/10 border border-success/20" : "bg-warning/10 border border-warning/20"
          )}>
            <div className={clsx(
              "w-2 h-2 rounded-full",
              status?.is_databricks_app ? "bg-success" : "bg-warning"
            )} />
            <span className="text-sm font-medium">
              Environment: <span className={status?.is_databricks_app ? "text-success" : "text-warning"}>
                {status?.environment || 'Checking...'}
              </span>
            </span>
            {status?.host && (
              <span className="text-xs text-slate-500 font-mono ml-auto">{status.host}</span>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            <StatusCard 
              label="Databricks Apps"
              value={status?.is_databricks_app ? 'Running' : 'Local'}
              status={status?.is_databricks_app ? 'success' : 'warning'}
              icon={Cloud}
            />
            <StatusCard 
              label="Model Serving"
              value={status?.model_serving_available ? 'Available' : 'Checking...'}
              status={status?.model_serving_available ? 'success' : 'warning'}
              icon={Sparkles}
              detail={status?.model_endpoint}
            />
            <StatusCard 
              label="SQL Warehouse"
              value={status?.sql_warehouse_available ? 'Connected' : 'Connecting...'}
              status={status?.sql_warehouse_available ? 'success' : 'warning'}
              icon={Server}
              detail={status?.sql_warehouse_warmed_up ? 'Warmed up' : 'Cold start'}
            />
            <StatusCard 
              label="Lakebase"
              value={status?.lakebase_available ? 'Available' : (status?.lakebase_status || 'Not Deployed')}
              status={status?.lakebase_available ? 'success' : 'muted'}
              icon={Layers}
              detail={status?.lakebase_available ? "Delta Lake + Unity Catalog" : "Future: Production Data Layer"}
            />
            <StatusCard 
              label="SDK Connection"
              value={status?.databricks_connected ? 'Connected' : 'Connecting...'}
              status={status?.databricks_connected ? 'success' : 'warning'}
              icon={GitBranch}
            />
          </div>
        </div>

        {/* Data Flow Architecture */}
        <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-200 mb-8">
          <h3 className="font-display font-semibold text-thomas-slate text-lg mb-6">Data Flow Architecture</h3>
          
          {/* Main Flow */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Frontend */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300 flex items-center justify-center">
                <Code className="w-7 h-7 text-cyan-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Frontend</span>
              <span className="text-[10px] text-slate-400">React + Vite</span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-300" />

            {/* Backend */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 flex items-center justify-center">
                <Server className="w-7 h-7 text-green-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Backend</span>
              <span className="text-[10px] text-slate-400">FastAPI</span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-300" />

            {/* Databricks SDK */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300 flex items-center justify-center">
                <Box className="w-7 h-7 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">SDK</span>
              <span className="text-[10px] text-slate-400">databricks-sdk</span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-300" />

            {/* Split into branches */}
            <div className="flex flex-col gap-4">
              {/* Model Serving Branch - ACTIVE */}
              <div className="flex items-center gap-3 bg-purple-50 rounded-xl px-4 py-2 border-2 border-success relative">
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-medium text-purple-700">Model Serving</span>
                  <p className="text-[10px] text-purple-500">AskThom Chat</p>
                </div>
              </div>
              
              {/* SQL Warehouse Branch - PRODUCTION */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2 border border-slate-300 border-dashed opacity-60">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-600">SQL Warehouse</span>
                  <p className="text-[10px] text-slate-500">CV Extraction • AI_QUERY</p>
                </div>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-300" />

            {/* Lakebase */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 flex items-center justify-center">
                <Layers className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Lakebase</span>
              <span className="text-[10px] text-slate-400">Delta + Unity</span>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="grid grid-cols-2 gap-6">
          {/* CV Extraction */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h3 className="font-display font-semibold text-white">CV Insight Extraction</h3>
              <p className="text-white/70 text-sm">Real AI via Model Serving</p>
            </div>
            <div className="p-4">
              <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto">
{`# Using Databricks Model Serving
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import ChatMessage

w = WorkspaceClient()

response = w.serving_endpoints.query(
    name="databricks-gemini-2-5-flash",
    messages=[
        ChatMessage(
            role="user",
            content=f"""Extract insights from CV:
            {cv_text}
            Return JSON with skills, experience..."""
        )
    ],
    max_tokens=800
)

insights = json.loads(response.choices[0].message.content)`}
              </pre>
            </div>
          </div>

          {/* AskThom */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-thomas-orange to-thomas-pink px-6 py-4">
              <h3 className="font-display font-semibold text-white">AskThom AI Assistant</h3>
              <p className="text-white/70 text-sm">Foundation Model with Context</p>
            </div>
            <div className="p-4">
              <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto">
{`# Rich context for intelligent responses
THOM_CONTEXT = """
Thomas International Products:
- PPA (DISC behavioral assessment)
- GIA (Cognitive ability)
- HPTI (Leadership traits)
- Chemistry Score (Team compatibility)

IFS Cloud Context:
- ERP, EAM, FSM solutions
- 6,000+ customers worldwide
"""

response = w.serving_endpoints.query(
    name="databricks-gemini-2-5-flash",
    messages=[
        ChatMessage(role="system", content=THOM_CONTEXT),
        ChatMessage(role="user", content=user_question)
    ]
)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-8 bg-gradient-to-r from-thomas-slate to-slate-700 rounded-2xl p-8">
          <h3 className="font-display font-bold text-xl mb-6 text-white">Full Technology Stack</h3>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <h4 className="text-thomas-orange font-semibold mb-3">Frontend</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>React 18 + TypeScript</li>
                <li>Vite (Build Tool)</li>
                <li>Tailwind CSS</li>
                <li>Recharts (Charts)</li>
                <li>Framer Motion</li>
                <li>Lucide Icons</li>
              </ul>
            </div>
            <div>
              <h4 className="text-thomas-orange font-semibold mb-3">Backend</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>Python 3.11</li>
                <li>FastAPI</li>
                <li>Uvicorn (ASGI)</li>
                <li>Pydantic</li>
                <li>Pandas</li>
              </ul>
            </div>
            <div>
              <h4 className="text-thomas-orange font-semibold mb-3">Databricks</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>Databricks Apps</li>
                <li>Model Serving (Gemini)</li>
                <li>SQL Warehouse</li>
                <li>Unity Catalog</li>
                <li>Delta Lake</li>
                <li>Databricks SDK</li>
              </ul>
            </div>
            <div>
              <h4 className="text-thomas-orange font-semibold mb-3">AI/ML</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>Gemini 2.5 Flash</li>
                <li>Foundation Models API</li>
                <li>AI Functions (SQL)</li>
                <li>Contextual RAG</li>
                <li>Prompt Engineering</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Unity Catalog Data Model */}
        <DataModelSection />

        {/* Production Architecture - Multi-Agent System */}
        <div className="mt-8 bg-white rounded-2xl shadow-card p-8 border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-thomas-slate">Production Architecture</h3>
              <p className="text-slate-500">Multi-Agent Supervisor Pattern using Databricks</p>
            </div>
          </div>

          {/* Supervisor Agent at the top */}
          <div className="relative">
            {/* Supervisor */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-8 py-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h4 className="font-bold text-lg">Supervisor Agent</h4>
                    <p className="text-white/70 text-sm">Orchestrates all child agents • Routes tasks • Manages state</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection lines */}
            <div className="absolute top-20 left-1/2 w-px h-8 bg-gradient-to-b from-purple-400 to-transparent" />
            
            {/* Agent Grid */}
            <div className="grid grid-cols-5 gap-4 mt-8">
              {/* CV Parser Agent */}
              <AgentCard
                name="CV Parser Agent"
                description="Extracts structured data from resumes using vision + NLP"
                tasks={["Parse PDF/DOCX", "Extract skills", "Work history", "Education"]}
                model="Gemini 2.5 Flash"
                icon="📄"
                color="from-blue-500 to-cyan-500"
              />

              {/* Web Enrichment Agent */}
              <AgentCard
                name="Web Enrichment Agent"
                description="Crawls external sources for candidate intelligence"
                tasks={["LinkedIn scraping", "GitHub analysis", "Blog/article finder", "YouTube talks"]}
                model="Gemini + Crawl4AI"
                icon="🌐"
                color="from-green-500 to-emerald-500"
              />

              {/* Psychometric Agent */}
              <AgentCard
                name="Psychometric Agent"
                description="Analyzes Thomas assessments and predicts fit"
                tasks={["PPA analysis", "GIA interpretation", "HPTI scoring", "Chemistry prediction"]}
                model="Custom fine-tuned"
                icon="🧠"
                color="from-thomas-orange to-thomas-pink"
              />

              {/* Interview Agent */}
              <AgentCard
                name="Interview Agent"
                description="Processes interview transcripts and generates insights"
                tasks={["Transcript analysis", "Sentiment detection", "Bias detection", "Score generation"]}
                model="Gemini 2.5 Flash"
                icon="🎤"
                color="from-amber-500 to-orange-500"
              />

              {/* Recommendation Agent */}
              <AgentCard
                name="Recommendation Agent"
                description="Generates hiring and retention recommendations"
                tasks={["Offer strategy", "Negotiation levers", "Churn prevention", "Development plans"]}
                model="Gemini 2.5 Flash"
                icon="💡"
                color="from-pink-500 to-rose-500"
              />
            </div>

            {/* Second row of agents */}
            <div className="grid grid-cols-4 gap-4 mt-4 max-w-4xl mx-auto">
              {/* Data Integration Agent */}
              <AgentCard
                name="Data Integration Agent"
                description="Syncs data across HRIS, CRM, and internal systems"
                tasks={["IFS Cloud sync", "Jira data", "Slack sentiment", "Email analysis"]}
                model="Databricks Workflows"
                icon="🔄"
                color="from-slate-600 to-slate-700"
              />

              {/* Compliance Agent */}
              <AgentCard
                name="Compliance Agent"
                description="Ensures GDPR, bias checks, and audit trails"
                tasks={["PII masking", "Bias monitoring", "Audit logging", "Data retention"]}
                model="Unity Catalog + Rules"
                icon="🛡️"
                color="from-teal-500 to-cyan-600"
              />

              {/* Notification Agent */}
              <AgentCard
                name="Notification Agent"
                description="Sends alerts and updates to stakeholders"
                tasks={["Email alerts", "Slack notifications", "Calendar invites", "Status updates"]}
                model="Databricks Workflows"
                icon="📬"
                color="from-violet-500 to-purple-600"
              />

              {/* Analytics Agent */}
              <AgentCard
                name="Analytics Agent"
                description="Generates reports and dashboard metrics"
                tasks={["KPI calculation", "Trend analysis", "Forecasting", "Benchmark comparison"]}
                model="Databricks SQL + AI"
                icon="📊"
                color="from-indigo-500 to-blue-600"
              />
            </div>
          </div>

          {/* Infrastructure Components */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h4 className="font-semibold text-thomas-slate mb-4">Infrastructure Components</h4>
            <div className="grid grid-cols-6 gap-3">
              <InfraCard icon={<Database className="w-5 h-5" />} label="Vector Store" detail="Mosaic AI Vector Search" />
              <InfraCard icon={<Layers className="w-5 h-5" />} label="Delta Tables" detail="Lakebase Storage" />
              <InfraCard icon={<Server className="w-5 h-5" />} label="Model Registry" detail="Unity Catalog" />
              <InfraCard icon={<GitBranch className="w-5 h-5" />} label="MLflow" detail="Experiment Tracking" />
              <InfraCard icon={<Zap className="w-5 h-5" />} label="Serverless" detail="Auto-scaling Compute" />
              <InfraCard icon={<Shield className="w-5 h-5" />} label="Governance" detail="Column-level Security" />
            </div>
          </div>

          {/* Agent Communication Protocol */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h4 className="font-semibold text-thomas-slate mb-4">Agent Communication Protocol</h4>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-400">
{`# Multi-Agent Supervisor using Databricks
from databricks.agents import AgentSupervisor, Agent
from databricks.sdk import WorkspaceClient

class TalentHubSupervisor(AgentSupervisor):
    def __init__(self):
        self.agents = {
            "cv_parser": CVParserAgent(),
            "enrichment": WebEnrichmentAgent(),
            "psychometric": PsychometricAgent(),
            "interview": InterviewAgent(),
            "recommendation": RecommendationAgent()
        }
        self.state = AgentState()  # Shared memory
    
    async def process_candidate(self, candidate_id: str):
        # Step 1: Parse CV
        cv_data = await self.agents["cv_parser"].run(candidate_id)
        self.state.update("cv_data", cv_data)
        
        # Step 2: Parallel enrichment and psychometric analysis
        enrichment, psych = await asyncio.gather(
            self.agents["enrichment"].run(cv_data),
            self.agents["psychometric"].run(candidate_id)
        )
        
        # Step 3: Generate recommendations
        recommendation = await self.agents["recommendation"].run(
            cv=cv_data,
            enrichment=enrichment,
            psychometrics=psych
        )
        
        # Store in Delta Lake
        await self.save_to_lakehouse(candidate_id, recommendation)
        
        return recommendation`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Status Card Component
function StatusCard({ 
  label, 
  value, 
  status, 
  icon: Icon,
  detail 
}: { 
  label: string
  value: string
  status: 'success' | 'warning' | 'error' | 'muted'
  icon: React.ComponentType<{ className?: string }>
  detail?: string
}) {
  const statusColors = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-danger/10 text-danger border-danger/20',
    muted: 'bg-slate-100 text-slate-500 border-slate-200'
  }
  
  const iconColors = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-danger',
    muted: 'text-slate-400'
  }

  return (
    <div className={clsx(
      'rounded-xl border p-4',
      statusColors[status]
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={clsx('w-5 h-5', iconColors[status])} />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <p className="font-semibold">{value}</p>
      {detail && (
        <p className="text-xs mt-1 font-mono opacity-70">{detail}</p>
      )}
    </div>
  )
}

// Agent Card Component for Production Architecture
function AgentCard({ 
  name, 
  description, 
  tasks, 
  model, 
  icon, 
  color 
}: { 
  name: string
  description: string
  tasks: string[]
  model: string
  icon: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`bg-gradient-to-r ${color} px-4 py-3`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h5 className="font-semibold text-white text-sm">{name}</h5>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-slate-500 mb-2">{description}</p>
        <ul className="space-y-1 mb-2">
          {tasks.map((task, i) => (
            <li key={i} className="text-[10px] text-slate-600 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              {task}
            </li>
          ))}
        </ul>
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[9px] text-slate-400 font-mono">{model}</span>
        </div>
      </div>
    </div>
  )
}

// Infrastructure Card Component
function InfraCard({ 
  icon, 
  label, 
  detail 
}: { 
  icon: React.ReactNode
  label: string
  detail: string
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
      <div className="flex items-center gap-2 mb-1 text-slate-600">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-[10px] text-slate-400">{detail}</p>
    </div>
  )
}

// Data Model Section Component
function DataModelSection() {
  const [exportFormat, setExportFormat] = useState<'sql' | 'schema' | 'json'>('sql')
  const [expandedTable, setExpandedTable] = useState<string | null>('employees')
  const [copied, setCopied] = useState(false)

  const dataModel = {
    catalog: 'ifs_talent_hub',
    schema: 'thomas_analytics',
    tables: [
      {
        name: 'employees',
        description: 'Core employee master data with Thomas assessment linkage',
        businessContext: 'Foundation table for all HR analytics and talent management',
        updateFrequency: 'Real-time (streaming)',
        columns: [
          { name: 'employee_id', type: 'STRING', description: 'Unique employee identifier', isPrimaryKey: true, example: 'EMP-1234' },
          { name: 'full_name', type: 'STRING', description: 'Employee full name', example: 'Sarah Mitchell' },
          { name: 'email', type: 'STRING', description: 'Corporate email address', example: 'sarah.mitchell@ifs.com' },
          { name: 'department', type: 'STRING', description: 'Department assignment', example: 'Engineering' },
          { name: 'title', type: 'STRING', description: 'Job title', example: 'Senior Software Engineer' },
          { name: 'manager_id', type: 'STRING', description: 'Direct manager employee ID', isForeignKey: true, references: 'employees.employee_id', example: 'EMP-1000' },
          { name: 'hire_date', type: 'DATE', description: 'Employment start date', example: '2022-03-15' },
          { name: 'location', type: 'STRING', description: 'Office location', example: 'Stockholm, Sweden' },
          { name: 'salary', type: 'DECIMAL(12,2)', description: 'Annual salary (local currency)', example: '850000.00' },
          { name: 'currency', type: 'STRING', description: 'Salary currency code', example: 'SEK' },
          { name: 'status', type: 'STRING', description: 'Employment status', example: 'Active' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Record creation timestamp', example: '2022-03-15T09:00:00Z' },
          { name: 'updated_at', type: 'TIMESTAMP', description: 'Last update timestamp', example: '2024-01-15T14:30:00Z' },
        ],
        metrics: ['headcount', 'turnover_rate', 'avg_tenure'],
      },
      {
        name: 'thomas_assessments',
        description: 'Thomas International psychometric assessment results',
        businessContext: 'PPA, GIA, HPTI, and TEIQue scores for behavioral and cognitive profiling',
        updateFrequency: 'Hourly batch',
        columns: [
          { name: 'assessment_id', type: 'STRING', description: 'Unique assessment identifier', isPrimaryKey: true, example: 'ASSESS-7890' },
          { name: 'employee_id', type: 'STRING', description: 'Employee reference', isForeignKey: true, references: 'employees.employee_id', example: 'EMP-1234' },
          { name: 'assessment_type', type: 'STRING', description: 'Type: PPA, GIA, HPTI, TEIQue', example: 'PPA' },
          { name: 'dominance', type: 'INT', description: 'PPA Dominance score (0-100)', example: '72' },
          { name: 'influence', type: 'INT', description: 'PPA Influence score (0-100)', example: '85' },
          { name: 'steadiness', type: 'INT', description: 'PPA Steadiness score (0-100)', example: '45' },
          { name: 'compliance', type: 'INT', description: 'PPA Compliance score (0-100)', example: '68' },
          { name: 'gia_score', type: 'INT', description: 'General Intelligence Assessment score', example: '127' },
          { name: 'hpti_conscientiousness', type: 'INT', description: 'HPTI Conscientiousness (0-100)', example: '78' },
          { name: 'hpti_adjustment', type: 'INT', description: 'HPTI Adjustment (0-100)', example: '65' },
          { name: 'hpti_curiosity', type: 'INT', description: 'HPTI Curiosity (0-100)', example: '82' },
          { name: 'hpti_risk_approach', type: 'INT', description: 'HPTI Risk Approach (0-100)', example: '71' },
          { name: 'hpti_ambiguity_acceptance', type: 'INT', description: 'HPTI Ambiguity Acceptance (0-100)', example: '69' },
          { name: 'hpti_competitiveness', type: 'INT', description: 'HPTI Competitiveness (0-100)', example: '75' },
          { name: 'assessed_at', type: 'TIMESTAMP', description: 'Assessment completion timestamp', example: '2024-01-10T11:30:00Z' },
        ],
        metrics: ['avg_gia', 'disc_distribution', 'hpti_benchmarks'],
      },
      {
        name: 'performance_metrics',
        description: 'Employee performance tracking and churn risk predictions',
        businessContext: 'AI-generated performance insights and retention risk scores',
        updateFrequency: 'Daily batch',
        columns: [
          { name: 'metric_id', type: 'STRING', description: 'Unique metric record ID', isPrimaryKey: true, example: 'PERF-4567' },
          { name: 'employee_id', type: 'STRING', description: 'Employee reference', isForeignKey: true, references: 'employees.employee_id', example: 'EMP-1234' },
          { name: 'period', type: 'STRING', description: 'Performance period (Q1 2024)', example: 'Q4 2024' },
          { name: 'performance_score', type: 'INT', description: 'Overall performance score (0-100)', example: '87' },
          { name: 'morale_score', type: 'INT', description: 'AI-derived morale indicator (0-100)', example: '72' },
          { name: 'churn_risk', type: 'STRING', description: 'Predicted churn risk level', example: 'Low' },
          { name: 'churn_probability', type: 'DECIMAL(5,4)', description: 'Churn probability (0-1)', example: '0.12' },
          { name: 'leadership_readiness', type: 'INT', description: 'Leadership potential score (0-100)', example: '78' },
          { name: 'slack_sentiment', type: 'DECIMAL(3,2)', description: 'Slack message sentiment (-1 to 1)', example: '0.65' },
          { name: 'goals_completed', type: 'INT', description: 'Completed goals this period', example: '8' },
          { name: 'goals_total', type: 'INT', description: 'Total assigned goals', example: '10' },
          { name: 'generated_at', type: 'TIMESTAMP', description: 'Metric generation timestamp', example: '2024-01-15T06:00:00Z' },
        ],
        metrics: ['avg_performance', 'churn_risk_distribution', 'morale_trend'],
      },
      {
        name: 'team_chemistry',
        description: 'Pairwise team chemistry scores based on Thomas profiles',
        businessContext: 'Predicts collaboration effectiveness between team members',
        updateFrequency: 'Daily batch',
        columns: [
          { name: 'chemistry_id', type: 'STRING', description: 'Unique chemistry record ID', isPrimaryKey: true, example: 'CHEM-1122' },
          { name: 'employee_a_id', type: 'STRING', description: 'First employee reference', isForeignKey: true, references: 'employees.employee_id', example: 'EMP-1234' },
          { name: 'employee_b_id', type: 'STRING', description: 'Second employee reference', isForeignKey: true, references: 'employees.employee_id', example: 'EMP-5678' },
          { name: 'chemistry_score', type: 'INT', description: 'Predicted compatibility (0-100)', example: '84' },
          { name: 'collaboration_style', type: 'STRING', description: 'Recommended collaboration approach', example: 'Complementary' },
          { name: 'interaction_note', type: 'STRING', description: 'AI-generated interaction guidance', example: 'Schedule daily syncs' },
          { name: 'calculated_at', type: 'TIMESTAMP', description: 'Calculation timestamp', example: '2024-01-15T06:00:00Z' },
        ],
        metrics: ['avg_team_chemistry', 'collaboration_patterns'],
      },
      {
        name: 'candidates',
        description: 'Recruitment candidates with AI-extracted CV insights',
        businessContext: 'Hiring pipeline tracking with Thomas assessment integration',
        updateFrequency: 'Real-time (streaming)',
        columns: [
          { name: 'candidate_id', type: 'STRING', description: 'Unique candidate identifier', isPrimaryKey: true, example: 'CAND-9012' },
          { name: 'full_name', type: 'STRING', description: 'Candidate full name', example: 'Alex Johnson' },
          { name: 'email', type: 'STRING', description: 'Contact email', example: 'alex.johnson@email.com' },
          { name: 'role_id', type: 'STRING', description: 'Applied role reference', isForeignKey: true, references: 'open_roles.role_id', example: 'ROLE-2345' },
          { name: 'status', type: 'STRING', description: 'Pipeline status', example: 'Interview' },
          { name: 'cv_text', type: 'STRING', description: 'Extracted CV text content', example: '(CV content...)' },
          { name: 'ai_summary', type: 'STRING', description: 'AI-generated candidate summary', example: '(AI summary...)' },
          { name: 'skills_extracted', type: 'ARRAY<STRING>', description: 'AI-extracted skills list', example: '["Python", "SQL"]' },
          { name: 'experience_years', type: 'INT', description: 'Total years of experience', example: '7' },
          { name: 'fit_score', type: 'INT', description: 'Role fit prediction (0-100)', example: '89' },
          { name: 'thomas_ppa_completed', type: 'BOOLEAN', description: 'PPA assessment completed', example: 'true' },
          { name: 'applied_at', type: 'TIMESTAMP', description: 'Application timestamp', example: '2024-01-08T14:22:00Z' },
          { name: 'updated_at', type: 'TIMESTAMP', description: 'Last status update', example: '2024-01-12T09:15:00Z' },
        ],
        metrics: ['pipeline_conversion', 'time_to_hire', 'source_effectiveness'],
      },
      {
        name: 'ai_interactions',
        description: 'AskThom conversation logs and manager queries',
        businessContext: 'Tracks AI assistant usage and query patterns',
        updateFrequency: 'Real-time (streaming)',
        columns: [
          { name: 'interaction_id', type: 'STRING', description: 'Unique interaction ID', isPrimaryKey: true, example: 'INT-3344' },
          { name: 'user_id', type: 'STRING', description: 'Manager/user employee ID', isForeignKey: true, references: 'employees.employee_id', example: 'EMP-1000' },
          { name: 'query', type: 'STRING', description: 'User question text', example: 'Tell me about Sarah' },
          { name: 'response', type: 'STRING', description: 'AI response text', example: '(AI response...)' },
          { name: 'context_page', type: 'STRING', description: 'Page context when asked', example: 'Performance' },
          { name: 'context_employee_id', type: 'STRING', description: 'Employee being discussed', example: 'EMP-1234' },
          { name: 'response_time_ms', type: 'INT', description: 'Response latency in ms', example: '1250' },
          { name: 'model_used', type: 'STRING', description: 'Model serving endpoint', example: 'gemini-2-5-flash' },
          { name: 'tokens_used', type: 'INT', description: 'Total tokens consumed', example: '847' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Interaction timestamp', example: '2024-01-15T10:30:00Z' },
        ],
        metrics: ['queries_per_day', 'avg_response_time', 'popular_topics'],
      },
    ],
    relationships: [
      { from: 'employees.manager_id', to: 'employees.employee_id', type: '1:N' as const },
      { from: 'thomas_assessments.employee_id', to: 'employees.employee_id', type: '1:N' as const },
      { from: 'performance_metrics.employee_id', to: 'employees.employee_id', type: '1:N' as const },
      { from: 'team_chemistry.employee_a_id', to: 'employees.employee_id', type: 'N:M' as const },
      { from: 'candidates.role_id', to: 'open_roles.role_id', type: '1:N' as const },
      { from: 'ai_interactions.user_id', to: 'employees.employee_id', type: '1:N' as const },
    ],
  }

  const generateSQL = () => {
    let sql = `-- Unity Catalog Data Model for IFS Talent Hub
-- Catalog: ${dataModel.catalog}
-- Schema: ${dataModel.schema}
-- Generated: ${new Date().toISOString()}
-- Powered by Thomas International + Databricks

-- Create catalog (if not exists)
CREATE CATALOG IF NOT EXISTS ${dataModel.catalog};
USE CATALOG ${dataModel.catalog};

-- Create schema
CREATE SCHEMA IF NOT EXISTS ${dataModel.schema}
COMMENT 'Thomas International talent analytics for IFS workforce management';

USE SCHEMA ${dataModel.schema};

`
    dataModel.tables.forEach(table => {
      sql += `-- ============================================================================
-- Table: ${table.name}
-- ${table.description}
-- Business Context: ${table.businessContext}
-- Update Frequency: ${table.updateFrequency}
-- ============================================================================
CREATE TABLE IF NOT EXISTS ${table.name} (
`
      const columnDefs = table.columns.map(col => {
        let def = `  ${col.name} ${col.type}`
        if (col.isPrimaryKey) def += ' NOT NULL'
        def += ` COMMENT '${col.description}'`
        return def
      })
      sql += columnDefs.join(',\n')
      
      const pkCol = table.columns.find(c => c.isPrimaryKey)
      if (pkCol) {
        sql += `,\n  CONSTRAINT pk_${table.name} PRIMARY KEY (${pkCol.name})`
      }
      
      sql += `
)
COMMENT '${table.description}';

`
    })

    if (exportFormat === 'sql') {
      // Add sample INSERT statements for data hydration
      sql += `-- ============================================================================
-- SAMPLE DATA HYDRATION
-- Uncomment and modify to populate tables with initial data
-- ============================================================================

-- Sample employees
/*
INSERT INTO employees VALUES
  ('EMP-1000', 'Marcus Chen', 'marcus.chen@ifs.com', 'Engineering', 'VP Engineering', NULL, '2019-06-15', 'Stockholm, Sweden', 2500000.00, 'SEK', 'Active', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
  ('EMP-1001', 'Sarah Mitchell', 'sarah.mitchell@ifs.com', 'Engineering', 'Senior Software Engineer', 'EMP-1000', '2022-03-15', 'London, UK', 95000.00, 'GBP', 'Active', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
*/

-- Sample Thomas assessments
/*
INSERT INTO thomas_assessments VALUES
  ('ASSESS-001', 'EMP-1001', 'PPA', 72, 85, 45, 68, 127, 78, 65, 82, 71, 69, 75, CURRENT_TIMESTAMP());
*/

`
    }

    return sql
  }

  const generateJSONSchema = () => {
    return JSON.stringify({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'IFS Talent Hub Data Model',
      description: 'Thomas International + Databricks AI workforce analytics',
      catalog: dataModel.catalog,
      schema: dataModel.schema,
      tables: dataModel.tables.map(table => ({
        name: table.name,
        description: table.description,
        businessContext: table.businessContext,
        updateFrequency: table.updateFrequency,
        columns: table.columns,
        metrics: table.metrics,
      })),
      relationships: dataModel.relationships,
    }, null, 2)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadExport = () => {
    let content: string
    let filename: string
    let mimeType: string
    
    if (exportFormat === 'json') {
      content = generateJSONSchema()
      filename = 'ifs_talent_hub_schema.json'
      mimeType = 'application/json'
    } else {
      content = generateSQL()
      filename = exportFormat === 'sql' ? 'ifs_talent_hub_with_data.sql' : 'ifs_talent_hub_schema.sql'
      mimeType = 'text/sql'
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTypeIcon = (type: string) => {
    if (type.includes('STRING')) return <Type className="w-3 h-3" />
    if (type.includes('INT') || type.includes('DECIMAL')) return <Hash className="w-3 h-3" />
    if (type.includes('TIMESTAMP') || type.includes('DATE')) return <Calendar className="w-3 h-3" />
    if (type.includes('BOOLEAN')) return <CheckCircle className="w-3 h-3" />
    if (type.includes('ARRAY')) return <Layers className="w-3 h-3" />
    return <Database className="w-3 h-3" />
  }

  return (
    <div className="mt-8 bg-[#0D1117] rounded-2xl p-8 border border-white/10 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl">Unity Catalog Data Model</h3>
            <code className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{dataModel.catalog}.{dataModel.schema}</code>
          </div>
        </div>
        
        {/* Export Controls */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-lg p-1">
            {(['sql', 'schema', 'json'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={clsx(
                  'px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5',
                  exportFormat === format ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {format === 'sql' && <><FileCode className="w-3 h-3" /> SQL + Data</>}
                {format === 'schema' && <><FileCode className="w-3 h-3" /> Schema Only</>}
                {format === 'json' && <><FileJson className="w-3 h-3" /> JSON</>}
              </button>
            ))}
          </div>
          <button
            onClick={downloadExport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export Schema
          </button>
        </div>
      </div>

      {/* Ready for AI/BI Banner */}
      <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div>
            <span className="font-semibold text-purple-300">Ready for Databricks AI/BI</span>
            <p className="text-xs text-purple-400/70">Optimized for Genie natural language queries and Lakeview dashboards</p>
          </div>
        </div>
        <button 
          onClick={() => copyToClipboard(`${dataModel.catalog}.${dataModel.schema}`)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          Copy Catalog Path
        </button>
      </div>

      {/* Schema Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Table className="w-4 h-4" />
            <span className="text-xs">Tables</span>
          </div>
          <p className="text-2xl font-bold">{dataModel.tables.length}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Database className="w-4 h-4" />
            <span className="text-xs">Total Columns</span>
          </div>
          <p className="text-2xl font-bold">{dataModel.tables.reduce((acc, t) => acc + t.columns.length, 0)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Link2 className="w-4 h-4" />
            <span className="text-xs">Relationships</span>
          </div>
          <p className="text-2xl font-bold">{dataModel.relationships.length}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs">Update Modes</span>
          </div>
          <p className="text-2xl font-bold">2</p>
          <p className="text-[10px] text-slate-500">streaming, daily</p>
        </div>
      </div>

      {/* Entity Relationships */}
      <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4 text-cyan-400" />
          <h4 className="font-semibold text-sm">Entity Relationships</h4>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {dataModel.relationships.slice(0, 5).map((rel, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-mono">{rel.from.split('.')[0]}</span>
              <span className="px-2 py-0.5 bg-white/10 text-slate-400 rounded text-[10px]">{rel.type}</span>
              <span className="px-3 py-1.5 bg-pink-500/20 text-pink-300 rounded-lg text-xs font-mono">{rel.to.split('.')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table Definitions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-4 h-4 text-cyan-400" />
          <h4 className="font-semibold text-sm">Table Definitions</h4>
        </div>
        <div className="space-y-2">
          {dataModel.tables.map((table) => (
            <div key={table.name} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Table className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{table.name}</span>
                      <span className="text-[10px] text-slate-500">({table.columns.length} columns)</span>
                    </div>
                    <p className="text-xs text-slate-400">{table.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    'px-2 py-1 rounded text-[10px] font-medium',
                    table.updateFrequency.includes('Real-time') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  )}>
                    {table.updateFrequency}
                  </span>
                  {expandedTable === table.name ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>
              
              {expandedTable === table.name && (
                <div className="border-t border-white/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-slate-400">Business Context:</span>
                    <span className="text-xs text-slate-300">{table.businessContext}</span>
                  </div>
                  
                  <div className="overflow-hidden rounded-lg border border-white/10">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Column</th>
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Type</th>
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Description</th>
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((col, i) => (
                          <tr key={i} className="border-t border-white/5">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                {col.isPrimaryKey && <span title="Primary Key"><Key className="w-3 h-3 text-yellow-400" /></span>}
                                {col.isForeignKey && <span title="Foreign Key"><Link2 className="w-3 h-3 text-cyan-400" /></span>}
                                <span className={clsx('font-mono', col.isPrimaryKey ? 'text-yellow-300' : col.isForeignKey ? 'text-cyan-300' : 'text-white')}>
                                  {col.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                {getTypeIcon(col.type)}
                                <span className="font-mono text-[10px]">{col.type}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-300">{col.description}</td>
                            <td className="py-2 px-3">
                              <code className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{col.example}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Key Metrics:</span>
                      {table.metrics.map((metric, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px]">{metric}</span>
                      ))}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(`SELECT * FROM ${dataModel.catalog}.${dataModel.schema}.${table.name} LIMIT 100;`)}
                      className="flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300"
                    >
                      <Copy className="w-3 h-3" />
                      Copy SELECT
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SQL Preview */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm">Schema Preview</h4>
          <button 
            onClick={() => copyToClipboard(generateSQL())}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            Copy All SQL
          </button>
        </div>
        <pre className="bg-[#0a0a0f] rounded-lg p-4 text-[10px] text-green-400 overflow-x-auto max-h-64 overflow-y-auto font-mono">
          {generateSQL().slice(0, 2000)}
          {generateSQL().length > 2000 && '\n\n-- ... (click "Export Schema" to download complete definition)'}
        </pre>
      </div>
    </div>
  )
}
