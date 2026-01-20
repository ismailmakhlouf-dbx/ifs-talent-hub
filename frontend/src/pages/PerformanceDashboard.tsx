import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Heart,
  Star,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronRight,
  User,
  Building2,
  BarChart3
} from 'lucide-react'
import { performanceApi, TeamData, AtRiskData, PerformanceStats, Employee } from '../lib/api'
import MetricCard from '../components/MetricCard'
import { ChurnDistributionChart } from '../components/Charts'
import { ChurnRiskBadge } from '../components/StatusBadge'
import { CircularProgress } from '../components/ProgressBar'
import { AskThomBadge } from '../components/AskThom'
import { PoweredByThomas, PoweredByInline } from '../components/PoweredByThomas'
import { usePageContext } from '../contexts/PageContext'
import clsx from 'clsx'

interface Props {
  managerId: string
}

export default function PerformanceDashboard({ managerId }: Props) {
  const navigate = useNavigate()
  const { setPageContext } = usePageContext()
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [team, setTeam] = useState<TeamData | null>(null)
  const [atRisk, setAtRisk] = useState<AtRiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'org' | 'list'>('org')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Update page context for AskThom
  useEffect(() => {
    setPageContext({
      pageName: 'Performance Dashboard',
      pageDescription: 'Viewing team performance metrics and employee health',
      teamSize: stats?.team_size || 0,
      avgPerformance: stats?.avg_performance || 0,
      avgMorale: stats?.avg_morale || 0,
      highChurnRiskCount: stats?.high_risk_count || 0,
      atRiskEmployees: atRisk?.at_risk?.map(e => e.name).slice(0, 5) || [],
      criticalEvents: atRisk?.critical_events?.length || 0,
      viewMode
    })
  }, [stats, atRisk, viewMode, setPageContext])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      performanceApi.getDashboardStats(managerId),
      performanceApi.getTeam(managerId),
      performanceApi.getAtRisk(managerId),
    ])
      .then(([statsData, teamData, atRiskData]) => {
        setStats(statsData)
        setTeam(teamData)
        setAtRisk(atRiskData)
        // Expand all by default
        if (teamData?.direct_reports) {
          setExpandedNodes(new Set(teamData.direct_reports.map(r => r.employee_id)))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [managerId])

  const toggleNode = (id: string) => {
    const newSet = new Set(expandedNodes)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedNodes(newSet)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-thomas-orange border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-slate-500">Loading team data...</p>
        </div>
      </div>
    )
  }

  // Create org chart structure
  const renderOrgNode = (employee: Employee, isRoot = false, depth = 0) => {
    const isExpanded = expandedNodes.has(employee.employee_id)
    const atRiskEmployee = atRisk?.at_risk?.find(e => e.employee_id === employee.employee_id)
    const hasSubordinates = employee.is_manager && team?.direct_reports?.some(r => r.employee_id !== employee.employee_id)

    return (
      <div key={employee.employee_id} className="relative">
        {/* Connection line from parent */}
        {!isRoot && depth > 0 && (
          <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-200" />
        )}
        
        <div
          onClick={() => navigate(`/performance/employee/${employee.employee_id}`)}
          className={clsx(
            'relative bg-white rounded-2xl p-4 shadow-card border-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
            atRiskEmployee ? 'border-danger/30' : 'border-transparent hover:border-thomas-orange/30',
            isRoot && 'ring-2 ring-thomas-orange/20'
          )}
          style={{ minWidth: '200px' }}
        >
          {atRiskEmployee && (
            <div className="absolute -top-2 -right-2">
              <div className="w-5 h-5 rounded-full bg-danger flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isRoot 
                ? 'bg-gradient-to-br from-thomas-orange to-thomas-slate' 
                : 'bg-gradient-to-br from-slate-100 to-slate-50'
            )}>
              <span className={clsx(
                'font-bold',
                isRoot ? 'text-white' : 'text-slate-600'
              )}>
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{employee.name}</p>
              <p className="text-xs text-slate-500 truncate">{employee.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">{employee.department}</span>
                {atRiskEmployee && (
                  <ChurnRiskBadge risk={atRiskEmployee.churn_risk} />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">{employee.tenure_months}mo tenure</span>
            <span className="text-slate-500">{employee.location}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B2FBE] to-[#5B1F9E] flex items-center justify-center shadow-lg shadow-[#7B2FBE]/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-800">
                  Team Performance
                </h1>
                <p className="text-slate-500 text-sm">
                  {team?.direct_reports?.length || 0} direct reports • Powered by <span className="text-thomas-orange font-medium">Thomas</span> insights
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('org')}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  viewMode === 'org' 
                    ? 'bg-white shadow text-thomas-slate' 
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <Building2 className="w-4 h-4" />
                Org Chart
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  viewMode === 'list' 
                    ? 'bg-white shadow text-thomas-slate' 
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <BarChart3 className="w-4 h-4" />
                List View
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Metrics Row */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Team Size"
            value={stats?.team_size || 0}
            subtitle="direct reports"
            icon={<Users className="w-5 h-5" />}
          />
          <MetricCard
            title="Avg Performance"
            value={`${stats?.avg_performance || 0}%`}
            subtitle="vs 78% company avg"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={(stats?.avg_performance || 0) > 78 ? 'up' : 'down'}
            trendValue={`${((stats?.avg_performance || 0) - 78).toFixed(1)}%`}
            variant={(stats?.avg_performance || 0) > 78 ? 'success' : 'warning'}
          />
          <MetricCard
            title="Team Morale"
            value={stats?.avg_morale?.toFixed(0) || 0}
            subtitle="out of 100"
            icon={<Heart className="w-5 h-5" />}
            variant={(stats?.avg_morale || 0) > 70 ? 'success' : 'warning'}
          />
          <MetricCard
            title="High Churn Risk"
            value={stats?.high_risk_count || 0}
            subtitle="need attention"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant={(stats?.high_risk_count || 0) > 0 ? 'danger' : 'success'}
          />
          <MetricCard
            title="Leadership Ready"
            value={`${stats?.avg_leadership_readiness?.toFixed(0) || 0}%`}
            subtitle="promotion ready"
            icon={<Star className="w-5 h-5" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Org Chart / List View */}
          <div className="col-span-2">
            {viewMode === 'org' ? (
              /* Org Chart View */
              <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 overflow-x-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-display font-semibold text-slate-800">Organization Structure</h3>
                  <p className="text-sm text-slate-500">Click any card to view details</p>
                </div>
                
                {/* Org Chart */}
                <div className="flex flex-col items-center">
                  {/* Current Manager (You) */}
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-thomas-slate to-thomas-slate-light rounded-2xl p-5 text-white shadow-lg min-w-[260px]">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                          <User className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">You</p>
                          <p className="text-white/70 text-sm">Team Manager</p>
                          <p className="text-xs text-white/50 mt-1">{team?.direct_reports?.length || 0} direct reports</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Lines */}
                  <div className="relative w-full mb-6">
                    <div className="absolute left-1/2 top-0 w-px h-8 bg-slate-200" />
                    <div className="absolute left-1/4 right-1/4 top-8 h-px bg-slate-200" />
                  </div>

                  {/* Direct Reports Grid */}
                  <div className="grid grid-cols-3 gap-6 w-full">
                    {team?.direct_reports?.map((emp) => {
                      const atRiskEmp = atRisk?.at_risk?.find(e => e.employee_id === emp.employee_id)
                      return (
                        <div key={emp.employee_id} className="relative">
                          <div className="absolute left-1/2 -top-6 w-px h-6 bg-slate-200" />
                          <div
                            onClick={() => navigate(`/performance/employee/${emp.employee_id}`)}
                            className={clsx(
                              'bg-white rounded-2xl p-5 shadow-card border-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
                              atRiskEmp ? 'border-danger/40' : 'border-transparent hover:border-thomas-orange/30'
                            )}
                          >
                            {atRiskEmp && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger flex items-center justify-center shadow-lg">
                                <AlertTriangle className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-thomas-orange/20 to-thomas-slate/10 flex items-center justify-center">
                                <span className="font-bold text-thomas-slate">
                                  {emp.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{emp.name}</p>
                                <p className="text-sm text-slate-500 truncate">{emp.title}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                              <span className="text-slate-500">{emp.department}</span>
                              <span className="text-slate-500">{emp.tenure_months}mo</span>
                            </div>
                            
                            {atRiskEmp && (
                              <div className="mt-3 p-2 bg-danger/5 rounded-lg">
                                <p className="text-xs text-danger font-medium">
                                  ⚠️ {atRiskEmp.churn_risk} churn risk
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-slate-800">
                    Direct Reports ({team?.direct_reports?.length || 0})
                  </h3>
                  <AskThomBadge context="performance" />
                </div>
                
                <div className="divide-y divide-slate-100">
                  {team?.direct_reports?.map((emp) => {
                    const atRiskEmp = atRisk?.at_risk?.find(e => e.employee_id === emp.employee_id)
                    return (
                      <div 
                        key={emp.employee_id}
                        onClick={() => navigate(`/performance/employee/${emp.employee_id}`)}
                        className="px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-thomas-orange/20 to-thomas-slate/10 flex items-center justify-center">
                            <span className="font-bold text-thomas-slate">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800">{emp.name}</p>
                              {atRiskEmp && <ChurnRiskBadge risk={atRiskEmp.churn_risk} />}
                            </div>
                            <p className="text-sm text-slate-500">{emp.title} • {emp.department}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm font-semibold text-slate-700">{emp.tenure_months}</p>
                              <p className="text-xs text-slate-400">months</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-slate-700">{emp.location}</p>
                              <p className="text-xs text-slate-400">location</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* At Risk Alert */}
            {atRisk?.at_risk && atRisk.at_risk.length > 0 && (
              <div className="bg-gradient-to-br from-danger/10 to-danger/5 rounded-2xl border border-danger/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-danger" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-slate-800">High Churn Risk Employees</h3>
                      <p className="text-xs text-slate-500">{atRisk.at_risk.length} require attention</p>
                    </div>
                  </div>
                  <PoweredByThomas service="engage" size="xs" />
                </div>
                
                <div className="space-y-3">
                  {atRisk.at_risk.slice(0, 3).map((emp) => (
                    <div 
                      key={emp.employee_id}
                      onClick={() => navigate(`/performance/employee/${emp.employee_id}`)}
                      className="bg-white rounded-xl p-3 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-slate-800 text-sm">{emp.name}</p>
                        <ChurnRiskBadge risk={emp.churn_risk} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Morale: {emp.morale_score}</span>
                        <span>Sentiment: {emp.slack_sentiment?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-4 py-2 text-sm text-danger font-medium hover:bg-danger/10 rounded-lg transition-colors">
                  View All High Churn Risk →
                </button>
              </div>
            )}

            {/* Churn Distribution */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
              <h3 className="font-display font-semibold text-slate-800 mb-4">Risk Distribution</h3>
              {stats?.churn_risk_distribution && (
                <ChurnDistributionChart data={stats.churn_risk_distribution} />
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-warning" />
                <h3 className="font-display font-semibold text-slate-800">Upcoming Events</h3>
              </div>
              
              <div className="space-y-3">
                {team?.upcoming_events?.slice(0, 4).map((event) => (
                  <div 
                    key={event.event_id}
                    className={clsx(
                      'p-3 rounded-xl',
                      event.is_critical ? 'bg-warning/10 border border-warning/20' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{event.employee_name}</p>
                        <p className="text-xs text-slate-500">{event.event_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-700">
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        {event.is_critical && (
                          <span className="text-[10px] text-warning font-medium">CRITICAL</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!team?.upcoming_events || team.upcoming_events.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No upcoming events</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
