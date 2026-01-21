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
  XCircle,
  RefreshCw,
  ArrowRight,
  Box,
  Code,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  Award,
  AlertTriangle,
  Heart,
  Briefcase,
  BarChart2
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, PieChart, Pie, Cell } from 'recharts'
import { usePageContext } from '../contexts/PageContext'
import clsx from 'clsx'

// HR Dashboard Mock Data
const retentionData = [
  { quarter: 'Q1 24', retention: 85, interventions: 12 },
  { quarter: 'Q2 24', retention: 87, interventions: 18 },
  { quarter: 'Q3 24', retention: 89, interventions: 24 },
  { quarter: 'Q4 24', retention: 90, interventions: 31 },
  { quarter: 'Q1 25', retention: 91, interventions: 38 },
  { quarter: 'Q2 25', retention: 92, interventions: 42 },
  { quarter: 'Q3 25', retention: 93, interventions: 48 },
  { quarter: 'Q4 25', retention: 94, interventions: 52 },
]

const assessmentCoverage = [
  { name: 'PPA', value: 92, color: '#f97316' },
  { name: 'GIA', value: 78, color: '#8b5cf6' },
  { name: 'HPTI', value: 65, color: '#06b6d4' },
  { name: 'TEIQue', value: 45, color: '#22c55e' },
]

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

        {/* HR Executive Dashboard - Workforce Impact */}
        <div className="mt-8 bg-white rounded-2xl shadow-card p-8 border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-thomas-orange to-thomas-pink flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-thomas-slate">HR Executive Dashboard</h3>
              <p className="text-slate-500">Thomas + GenAI Impact on IFS Workforce</p>
            </div>
          </div>

          {/* Primary KPIs - 4 cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <KPICard 
              icon={<Users className="w-5 h-5" />}
              iconBg="from-blue-500 to-cyan-500"
              label="Active Employees"
              value="2,847"
              change="+12%"
              positive={true}
              subtext="vs. last quarter"
            />
            <KPICard 
              icon={<TrendingDown className="w-5 h-5" />}
              iconBg="from-green-500 to-emerald-500"
              label="Churn Rate"
              value="8.2%"
              change="-34%"
              positive={true}
              subtext="reduced via early intervention"
            />
            <KPICard 
              icon={<Target className="w-5 h-5" />}
              iconBg="from-purple-500 to-pink-500"
              label="Hiring Accuracy"
              value="94%"
              change="+28%"
              positive={true}
              subtext="Thomas-screened candidates"
            />
            <KPICard 
              icon={<Clock className="w-5 h-5" />}
              iconBg="from-orange-500 to-red-500"
              label="Time to Hire"
              value="18 days"
              change="-42%"
              positive={true}
              subtext="AI-accelerated screening"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Retention Improvement Over Time */}
            <div className="col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="font-semibold text-thomas-slate text-sm mb-4">Retention Rate Improvement (2024-2026)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[80, 100]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar yAxisId="left" dataKey="retention" fill="#22c55e" radius={[4, 4, 0, 0]} name="Retention %" />
                  <Line yAxisId="right" type="monotone" dataKey="interventions" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} name="AI Interventions" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Thomas Assessment Adoption */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="font-semibold text-thomas-slate text-sm mb-4">Thomas Assessment Coverage</h4>
              <div className="flex justify-center">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={assessmentCoverage}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {assessmentCoverage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {assessmentCoverage.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                    <span className="text-slate-400 ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SecondaryKPI 
              icon={<Award className="w-4 h-4 text-yellow-500" />}
              label="Promotions Predicted"
              value="156"
              description="Leadership-ready identified"
            />
            <SecondaryKPI 
              icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
              label="Churn Risks Flagged"
              value="43"
              description="Early intervention enabled"
            />
            <SecondaryKPI 
              icon={<Heart className="w-4 h-4 text-pink-500" />}
              label="Team Chemistry Score"
              value="87%"
              description="Cross-department average"
            />
            <SecondaryKPI 
              icon={<Briefcase className="w-4 h-4 text-blue-500" />}
              label="Roles Filled"
              value="89"
              description="YTD with Thomas screening"
            />
          </div>

          {/* GenAI Impact Breakdown */}
          <div className="bg-gradient-to-r from-thomas-slate/5 to-thomas-pink/5 rounded-xl p-5 border border-thomas-orange/20">
            <h4 className="font-semibold text-thomas-slate text-sm mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-thomas-orange" />
              GenAI-Powered Insights Impact
            </h4>
            <div className="grid grid-cols-5 gap-4">
              <ImpactCard 
                label="AskThom Queries"
                value="12,450"
                detail="Manager questions answered"
              />
              <ImpactCard 
                label="CVs Analyzed"
                value="3,200"
                detail="Automated screening"
              />
              <ImpactCard 
                label="Bias Alerts"
                value="89"
                detail="Prevented biased decisions"
              />
              <ImpactCard 
                label="Retention Saves"
                value="£2.4M"
                detail="Avoided replacement costs"
              />
              <ImpactCard 
                label="Hours Saved"
                value="4,800"
                detail="HR admin automation"
              />
            </div>
          </div>

          {/* ROI Summary */}
          <div className="mt-6 bg-gradient-to-r from-thomas-orange to-thomas-pink rounded-xl p-5">
            <div className="grid grid-cols-4 gap-6 text-white">
              <div>
                <p className="text-white/70 text-xs mb-1">Platform Investment</p>
                <p className="text-2xl font-bold">£180K</p>
                <p className="text-[10px] text-white/60">Annual license + implementation</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Annual Savings</p>
                <p className="text-2xl font-bold">£2.8M</p>
                <p className="text-[10px] text-white/60">Churn reduction + efficiency</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Payback Period</p>
                <p className="text-2xl font-bold">23 days</p>
                <p className="text-[10px] text-white/60">Time to positive ROI</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Annual ROI</p>
                <p className="text-2xl font-bold">1,456%</p>
                <p className="text-[10px] text-white/60">Return on investment</p>
              </div>
            </div>
          </div>
        </div>

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

// KPI Card for HR Dashboard
function KPICard({
  icon,
  iconBg,
  label,
  value,
  change,
  positive,
  subtext
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  change: string
  positive: boolean
  subtext: string
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl font-bold text-thomas-slate">{value}</span>
        <span className={clsx(
          "text-sm font-semibold flex items-center gap-0.5 mb-1",
          positive ? "text-success" : "text-danger"
        )}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="text-[10px] text-slate-400">{subtext}</p>
    </div>
  )
}

// Secondary KPI for HR Dashboard
function SecondaryKPI({
  icon,
  label,
  value,
  description
}: {
  icon: React.ReactNode
  label: string
  value: string
  description: string
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <p className="text-xl font-bold text-thomas-slate">{value}</p>
      <p className="text-[10px] text-slate-400">{description}</p>
    </div>
  )
}

// Impact Card for GenAI section
function ImpactCard({
  label,
  value,
  detail
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-thomas-slate">{value}</p>
      <p className="text-[9px] text-slate-400">{detail}</p>
    </div>
  )
}
