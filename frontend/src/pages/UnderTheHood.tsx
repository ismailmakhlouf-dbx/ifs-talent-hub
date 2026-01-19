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
  Sparkles
} from 'lucide-react'
import clsx from 'clsx'

interface SystemStatus {
  databricks_connected: boolean
  model_serving_available: boolean
  sql_warehouse_available: boolean
  sql_warehouse_warmed_up: boolean
  model_endpoint: string
  host: string
}

export default function UnderTheHood() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

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

        {/* Architecture Overview */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Databricks Apps */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-thomas-slate">Databricks Apps</h3>
                <p className="text-xs text-slate-500">Application Hosting</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                FastAPI Backend
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                React Frontend (Vite)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Service Principal Auth
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Auto-scaling Compute
              </li>
            </ul>
          </div>

          {/* Model Serving */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-thomas-slate">Mosaic AI</h3>
                <p className="text-xs text-slate-500">Model Serving</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                <span className="font-mono text-xs">databricks-gemini-2-5-flash</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                AskThom Conversations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                CV Insight Extraction
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Candidate Summaries
              </li>
            </ul>
          </div>

          {/* SQL Warehouse / Lakebase */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-thomas-slate">Lakebase</h3>
                <p className="text-xs text-slate-500">SQL Warehouse + Delta Tables</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-xs">thomas-talenthub-dwh</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Delta Lake Storage
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                AI Functions (AI_QUERY)
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                Unity Catalog Governance
              </li>
            </ul>
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
          
          <div className="grid grid-cols-4 gap-4">
            <StatusCard 
              label="Databricks Connection"
              value={status?.databricks_connected ? 'Connected' : 'Disconnected'}
              status={status?.databricks_connected ? 'success' : 'error'}
              icon={Cloud}
            />
            <StatusCard 
              label="Model Serving"
              value={status?.model_serving_available ? 'Available' : 'Unavailable'}
              status={status?.model_serving_available ? 'success' : 'warning'}
              icon={Sparkles}
              detail={status?.model_endpoint}
            />
            <StatusCard 
              label="SQL Warehouse"
              value={status?.sql_warehouse_available ? 'Available' : 'Unavailable'}
              status={status?.sql_warehouse_available ? 'success' : 'warning'}
              icon={Database}
            />
            <StatusCard 
              label="Warehouse Warmed"
              value={status?.sql_warehouse_warmed_up ? 'Warmed Up' : 'Cold'}
              status={status?.sql_warehouse_warmed_up ? 'success' : 'warning'}
              icon={Zap}
            />
          </div>
        </div>

        {/* Data Flow Architecture */}
        <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-200 mb-8">
          <h3 className="font-display font-semibold text-thomas-slate text-lg mb-6">Data Flow Architecture</h3>
          
          <div className="flex items-center justify-between">
            {/* Frontend */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300 flex items-center justify-center">
                <Code className="w-8 h-8 text-cyan-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">React Frontend</span>
              <span className="text-xs text-slate-400">Vite + TypeScript</span>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-300" />

            {/* Backend */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 flex items-center justify-center">
                <Server className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">FastAPI Backend</span>
              <span className="text-xs text-slate-400">Python 3.11</span>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-300" />

            {/* Databricks SDK */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300 flex items-center justify-center">
                <Box className="w-8 h-8 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Databricks SDK</span>
              <span className="text-xs text-slate-400">databricks-sdk</span>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-300" />

            {/* Model Serving */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Model Serving</span>
              <span className="text-xs text-slate-400">Gemini 2.5 Flash</span>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-300" />

            {/* Delta Lake */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 flex items-center justify-center">
                <Layers className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Delta Lake</span>
              <span className="text-xs text-slate-400">Unity Catalog</span>
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
        <div className="mt-8 bg-gradient-to-r from-thomas-slate to-slate-700 rounded-2xl p-8 text-white">
          <h3 className="font-display font-bold text-xl mb-6">Full Technology Stack</h3>
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
  status: 'success' | 'warning' | 'error'
  icon: React.ComponentType<{ className?: string }>
  detail?: string
}) {
  const statusColors = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-danger/10 text-danger border-danger/20'
  }
  
  const iconColors = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-danger'
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
