import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

// Thomas International Brand Colors
const COLORS = {
  primary: '#1A1D21',       // Slate Navy
  secondary: '#FF6B35',     // Orange
  accent: '#E91E63',        // Magenta/Pink
  success: '#388E3C',       // Green
  warning: '#FBC02D',       // Yellow
}

// DISC Profile Colors
const DISC_COLORS = {
  dominance: '#D32F2F',     // Red
  influence: '#FBC02D',     // Yellow
  steadiness: '#388E3C',    // Green
  compliance: '#1976D2',    // Blue
}

const STAGE_COLORS = ['#E2E8F0', '#FF6B35', '#E91E63', '#1A1D21', '#388E3C']

// PPA/DISC Radar Chart
interface PPAChartProps {
  data: {
    dominance: number
    influence: number
    steadiness: number
    compliance: number
  }
  comparison?: {
    dominance: number
    influence: number
    steadiness: number
    compliance: number
  }
}

export function PPARadarChart({ data, comparison }: PPAChartProps) {
  const chartData = [
    { trait: 'Dominance', value: data.dominance, ideal: comparison?.dominance },
    { trait: 'Influence', value: data.influence, ideal: comparison?.influence },
    { trait: 'Steadiness', value: data.steadiness, ideal: comparison?.steadiness },
    { trait: 'Compliance', value: data.compliance, ideal: comparison?.compliance },
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis 
          dataKey="trait" 
          tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: '#94A3B8', fontSize: 10 }}
        />
        {comparison && (
          <Radar
            name="Ideal Profile"
            dataKey="ideal"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.15}
            strokeDasharray="5 5"
            strokeWidth={2}
          />
        )}
        <Radar
          name="Candidate"
          dataKey="value"
          stroke={COLORS.secondary}
          fill={COLORS.secondary}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// HPTI Bar Chart
interface HPTIChartProps {
  data: {
    conscientiousness: number
    adjustment: number
    curiosity: number
    risk_approach: number
    ambiguity_acceptance: number
    competitiveness: number
  }
}

export function HPTIBarChart({ data }: HPTIChartProps) {
  const chartData = [
    { trait: 'Conscient.', value: data.conscientiousness },
    { trait: 'Adjustment', value: data.adjustment },
    { trait: 'Curiosity', value: data.curiosity },
    { trait: 'Risk', value: data.risk_approach },
    { trait: 'Ambiguity', value: data.ambiguity_acceptance },
    { trait: 'Competitive', value: data.competitiveness },
  ].map(d => ({
    ...d,
    fill: d.value >= 70 ? COLORS.success : d.value >= 50 ? COLORS.secondary : COLORS.warning
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
        <YAxis 
          type="category" 
          dataKey="trait" 
          tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
          width={80}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
        <Bar 
          dataKey="value" 
          radius={[0, 6, 6, 0]}
          barSize={20}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Pipeline Funnel Chart
interface FunnelChartProps {
  data: Record<string, number>
}

export function PipelineFunnelChart({ data }: FunnelChartProps) {
  const stages = ['Screening', 'Phone Interview', 'Technical Assessment', 'Onsite Interview', 'Final Round']
  const chartData = stages
    .filter(stage => data[stage] !== undefined)
    .map((stage, index) => ({
      name: stage,
      value: data[stage] || 0,
      fill: STAGE_COLORS[index]
    }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
          width={130}
        />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Performance Trend Chart
interface TrendChartProps {
  data: Array<{
    quarter: string
    performance_score: number
    morale_score?: number
  }>
}

export function PerformanceTrendChart({ data }: TrendChartProps) {
  const chartData = data.map(d => ({
    quarter: d.quarter.replace('2024-', ''),
    performance: d.performance_score * 100,
    morale: d.morale_score
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="moraleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="quarter" tick={{ fill: '#64748B', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="performance" 
          stroke={COLORS.secondary}
          fillOpacity={1}
          fill="url(#performanceGradient)"
          strokeWidth={2}
          name="Performance %"
        />
        {chartData[0]?.morale && (
          <Area 
            type="monotone" 
            dataKey="morale" 
            stroke={COLORS.success}
            fillOpacity={1}
            fill="url(#moraleGradient)"
            strokeWidth={2}
            name="Morale"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Churn Risk Distribution
interface ChurnDistributionProps {
  data: Record<string, number>
}

export function ChurnDistributionChart({ data }: ChurnDistributionProps) {
  const chartData = [
    { name: 'Low Risk', value: data['Low'] || 0, fill: COLORS.success },
    { name: 'Medium Risk', value: data['Medium'] || 0, fill: COLORS.warning },
    { name: 'High Risk', value: data['High'] || 0, fill: COLORS.accent },
  ].filter(d => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Likelihood Gauge
interface GaugeProps {
  value: number
  label: string
}

export function LikelihoodGauge({ value, label }: GaugeProps) {
  const color = value >= 70 ? COLORS.success : value >= 50 ? COLORS.warning : COLORS.accent
  const rotation = (value / 100) * 180 - 90

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc */}
        <div 
          className="absolute inset-0 rounded-t-full border-[12px] border-slate-200"
          style={{ borderBottomWidth: 0 }}
        />
        {/* Value arc */}
        <div 
          className="absolute inset-0 rounded-t-full border-[12px] transition-all duration-1000"
          style={{ 
            borderColor: color,
            borderBottomWidth: 0,
            clipPath: `polygon(0 100%, 0 0, ${value}% 0, ${value}% 100%)`,
          }}
        />
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom transition-transform duration-1000"
          style={{ 
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            background: `linear-gradient(to top, ${color}, ${color}CC)`
          }}
        />
        {/* Center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4" style={{ borderColor: color }} />
      </div>
      <p className="text-4xl font-display font-bold mt-2" style={{ color }}>{value}%</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
