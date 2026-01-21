import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Clock,
  Award,
  AlertTriangle,
  Heart,
  Briefcase,
  DollarSign,
  UserCheck,
  UserMinus,
  Zap,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Sparkles,
  Brain,
  Shield,
  CheckCircle2,
  ArrowRight,
  Calendar
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts'
import { usePageContext } from '../contexts/PageContext'

// Real HR metrics data
const retentionTrend = [
  { month: 'Jul', retention: 86, benchmark: 82, interventions: 8 },
  { month: 'Aug', retention: 87, benchmark: 82, interventions: 12 },
  { month: 'Sep', retention: 88, benchmark: 82, interventions: 15 },
  { month: 'Oct', retention: 90, benchmark: 82, interventions: 19 },
  { month: 'Nov', retention: 91, benchmark: 82, interventions: 24 },
  { month: 'Dec', retention: 92, benchmark: 82, interventions: 28 },
]

const hiringFunnel = [
  { stage: 'Applications Received', count: 2840, rate: 100 },
  { stage: 'AI Screened (Thomas)', count: 1136, rate: 40 },
  { stage: 'Phone Interview', count: 568, rate: 20 },
  { stage: 'Technical Interview', count: 284, rate: 10 },
  { stage: 'Final Round', count: 142, rate: 5 },
  { stage: 'Offers Extended', count: 98, rate: 3.5 },
  { stage: 'Hired', count: 89, rate: 3.1 },
]

const departmentHealth = [
  { name: 'Engineering', employees: 847, turnover: 6.2, engagement: 84, chemistryScore: 88 },
  { name: 'Sales', employees: 523, turnover: 12.4, engagement: 79, chemistryScore: 82 },
  { name: 'Product', employees: 234, turnover: 5.8, engagement: 87, chemistryScore: 91 },
  { name: 'Operations', employees: 412, turnover: 8.1, engagement: 81, chemistryScore: 85 },
  { name: 'Finance', employees: 189, turnover: 4.2, engagement: 83, chemistryScore: 89 },
  { name: 'HR', employees: 78, turnover: 3.9, engagement: 91, chemistryScore: 94 },
]

const assessmentDistribution = [
  { name: 'High Performer', value: 23, color: '#22c55e' },
  { name: 'Solid Performer', value: 48, color: '#3b82f6' },
  { name: 'Developing', value: 21, color: '#f59e0b' },
  { name: 'Needs Support', value: 8, color: '#ef4444' },
]

const churnRiskBreakdown = [
  { name: 'Low Risk', value: 72, color: '#22c55e' },
  { name: 'Medium Risk', value: 18, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' },
]

const monthlyHires = [
  { month: 'Jul', hires: 12, terminations: 8, netGrowth: 4 },
  { month: 'Aug', hires: 15, terminations: 6, netGrowth: 9 },
  { month: 'Sep', hires: 18, terminations: 7, netGrowth: 11 },
  { month: 'Oct', hires: 14, terminations: 5, netGrowth: 9 },
  { month: 'Nov', hires: 22, terminations: 9, netGrowth: 13 },
  { month: 'Dec', hires: 8, terminations: 4, netGrowth: 4 },
]

const TIME_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date']

export default function HRDashboard() {
  const { setPageContext } = usePageContext()
  const [selectedRange, setSelectedRange] = useState('Last 30 Days')

  useEffect(() => {
    setPageContext({
      pageName: 'HR Executive Dashboard',
      pageDescription: 'Workforce analytics and Thomas International impact metrics for IFS',
      totalEmployees: 2847,
      activeRoles: 23,
      churnRiskEmployees: 285,
      thomasAssessmentCoverage: '94%'
    })
  }, [setPageContext])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-thomas-orange to-thomas-pink flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold">HR Executive Dashboard</h1>
            </div>
            <p className="text-slate-400 text-sm">Thomas International + GenAI Workforce Impact for IFS</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRange === range 
                    ? 'bg-thomas-orange text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Powered by Banner */}
        <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <span className="font-semibold text-purple-300">Powered by Thomas International + Databricks AI</span>
              <p className="text-xs text-purple-400/70">Real-time analytics with Mosaic AI and psychometric insights</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm transition-colors">
            <Brain className="w-4 h-4" />
            Ask Thom
          </button>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KPICard 
            icon={<Users className="w-5 h-5" />}
            iconColor="text-cyan-400"
            iconBg="bg-cyan-500/20"
            value="2,847"
            change="+4.2%"
            positive={true}
            label="Total Headcount"
            subtext="↑ 115 YoY growth"
          />
          <KPICard 
            icon={<TrendingDown className="w-5 h-5" />}
            iconColor="text-green-400"
            iconBg="bg-green-500/20"
            value="8.2%"
            change="-34%"
            positive={true}
            label="Annual Turnover"
            subtext="vs 12.4% industry avg"
          />
          <KPICard 
            icon={<Clock className="w-5 h-5" />}
            iconColor="text-orange-400"
            iconBg="bg-orange-500/20"
            value="18 days"
            change="-42%"
            positive={true}
            label="Time to Hire"
            subtext="Thomas AI screening"
          />
          <KPICard 
            icon={<DollarSign className="w-5 h-5" />}
            iconColor="text-pink-400"
            iconBg="bg-pink-500/20"
            value="£4,200"
            change="-28%"
            positive={true}
            label="Cost per Hire"
            subtext="down from £5,800"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Hiring Funnel */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm">Hiring Funnel</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Candidate journey with Thomas screening</p>
            
            <div className="space-y-3">
              {hiringFunnel.map((stage, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{stage.stage}</span>
                    <span className="text-slate-400">{stage.count.toLocaleString()} <span className="text-slate-500">({stage.rate}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${stage.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">3.1% application-to-hire rate</span>
              <span className="text-xs text-slate-500">(2.1x industry avg)</span>
            </div>
          </div>

          {/* Retention Trend */}
          <div className="col-span-2 bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-sm">Retention Rate Trend</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-slate-400">Retention %</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-slate-400">AI Interventions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400">Industry Benchmark</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">Monthly retention with Thomas-powered early intervention</p>
            
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={retentionTrend}>
                <defs>
                  <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#ffffff10" />
                <YAxis yAxisId="left" domain={[75, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#ffffff10" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#ffffff10" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1e2e', 
                    border: '1px solid #ffffff20',
                    borderRadius: 8,
                    fontSize: 11 
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="retention" stroke="#22c55e" fill="url(#retentionGradient)" strokeWidth={2} />
                <Line yAxisId="left" type="monotone" dataKey="benchmark" stroke="#64748b" strokeDasharray="5 5" dot={false} />
                <Bar yAxisId="right" dataKey="interventions" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
              <div className="bg-green-500/10 rounded-lg p-3">
                <p className="text-xs text-green-400 mb-1">Current Retention</p>
                <p className="text-xl font-bold text-green-400">92%</p>
                <p className="text-[10px] text-slate-500">+10pp vs 6 months ago</p>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-3">
                <p className="text-xs text-orange-400 mb-1">Interventions Triggered</p>
                <p className="text-xl font-bold text-orange-400">106</p>
                <p className="text-[10px] text-slate-500">73% success rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <SecondaryMetric 
            icon={<UserCheck className="w-4 h-4 text-green-400" />}
            label="Quality of Hire"
            value="94%"
            detail="Thomas-screened hires meeting expectations at 12 months"
          />
          <SecondaryMetric 
            icon={<Award className="w-4 h-4 text-yellow-400" />}
            label="Internal Promotions"
            value="156"
            detail="Predicted leadership-ready employees promoted YTD"
          />
          <SecondaryMetric 
            icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
            label="Churn Risks Flagged"
            value="43"
            detail="Early intervention enabled before resignation"
          />
          <SecondaryMetric 
            icon={<Heart className="w-4 h-4 text-pink-400" />}
            label="eNPS Score"
            value="+47"
            detail="Employee Net Promoter Score (industry avg: +12)"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Headcount Movement */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-sm">Headcount Movement</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyHires}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#ffffff10" />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#ffffff10" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1e2e', 
                    border: '1px solid #ffffff20',
                    borderRadius: 8,
                    fontSize: 11 
                  }}
                />
                <Bar dataKey="hires" fill="#22c55e" radius={[4, 4, 0, 0]} name="Hires" />
                <Bar dataKey="terminations" fill="#ef4444" radius={[4, 4, 0, 0]} name="Terminations" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-green-400">
              <TrendingUp className="w-3 h-3" />
              <span>+50 net headcount growth (6 months)</span>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-sm">Performance Distribution</h3>
            </div>
            <div className="flex justify-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={assessmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {assessmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {assessmentDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                  <span className="text-white ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Churn Risk */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-sm">Churn Risk Distribution</h3>
            </div>
            <div className="flex justify-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={churnRiskBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {churnRiskBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {churnRiskBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                  <span className="text-white ml-auto">{item.value}%</span>
                  <span className="text-slate-500">({Math.round(2847 * item.value / 100)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Health Table */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-sm">Department Health Overview</h3>
            </div>
            <span className="text-xs text-slate-400">Powered by Thomas Assessments</span>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs">Department</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-xs">Headcount</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-xs">Turnover %</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-xs">Engagement</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-xs">Chemistry Score</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentHealth.map((dept, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium">{dept.name}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{dept.employees}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={dept.turnover > 10 ? 'text-red-400' : dept.turnover > 7 ? 'text-yellow-400' : 'text-green-400'}>
                        {dept.turnover}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${dept.engagement >= 85 ? 'bg-green-500' : dept.engagement >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${dept.engagement}%` }}
                          />
                        </div>
                        <span className="text-slate-300 w-8">{dept.engagement}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={dept.chemistryScore >= 88 ? 'text-green-400' : dept.chemistryScore >= 85 ? 'text-blue-400' : 'text-yellow-400'}>
                        {dept.chemistryScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        dept.turnover < 6 ? 'bg-green-500/20 text-green-400' : 
                        dept.turnover < 10 ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {dept.turnover < 6 ? 'Healthy' : dept.turnover < 10 ? 'Monitor' : 'At Risk'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GenAI Impact Summary */}
        <div className="bg-gradient-to-r from-thomas-orange/10 to-thomas-pink/10 rounded-2xl p-6 border border-thomas-orange/20 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-thomas-orange" />
            <h3 className="font-semibold">GenAI-Powered Insights Impact</h3>
          </div>
          
          <div className="grid grid-cols-6 gap-4">
            <ImpactMetric label="AskThom Queries" value="12,450" detail="Manager questions answered" />
            <ImpactMetric label="CVs Analyzed" value="3,200" detail="Automated screening" />
            <ImpactMetric label="Bias Alerts" value="89" detail="Prevented biased decisions" />
            <ImpactMetric label="Retention Saves" value="£2.4M" detail="Avoided replacement costs" />
            <ImpactMetric label="Hours Saved" value="4,800" detail="HR admin automation" />
            <ImpactMetric label="Accuracy" value="94%" detail="Prediction accuracy rate" />
          </div>
        </div>

        {/* ROI Summary */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Thomas + Databricks AI ROI Summary</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
              Export Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Platform Investment</p>
              <p className="text-2xl font-bold">£180K</p>
              <p className="text-[10px] text-slate-500 mt-1">Annual license + implementation</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Annual Savings</p>
              <p className="text-2xl font-bold text-green-400">£2.8M</p>
              <p className="text-[10px] text-slate-500 mt-1">Churn reduction + efficiency gains</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Payback Period</p>
              <p className="text-2xl font-bold text-cyan-400">23 days</p>
              <p className="text-[10px] text-slate-500 mt-1">Time to positive ROI</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Annual ROI</p>
              <p className="text-2xl font-bold text-thomas-orange">1,456%</p>
              <p className="text-[10px] text-slate-500 mt-1">Return on investment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// KPI Card Component
function KPICard({ 
  icon, 
  iconColor, 
  iconBg, 
  value, 
  change, 
  positive, 
  label, 
  subtext 
}: { 
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  value: string
  change: string
  positive: boolean
  label: string
  subtext: string
}) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} mb-3`}>
        {icon}
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`text-sm font-semibold flex items-center gap-0.5 mb-0.5 ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{subtext}</p>
    </div>
  )
}

// Secondary Metric Component
function SecondaryMetric({ 
  icon, 
  label, 
  value, 
  detail 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-slate-500 mt-1">{detail}</p>
    </div>
  )
}

// Impact Metric Component
function ImpactMetric({ 
  label, 
  value, 
  detail 
}: { 
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <p className="text-[10px] text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[9px] text-slate-500">{detail}</p>
    </div>
  )
}
