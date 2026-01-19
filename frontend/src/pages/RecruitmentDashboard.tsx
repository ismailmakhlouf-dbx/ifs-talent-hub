import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Briefcase, 
  Users, 
  AlertCircle, 
  Calendar,
  ArrowRight,
  Sparkles,
  Target,
  X,
  ChevronRight,
  Brain,
  Zap,
  Award,
  UserCheck,
  Clock,
  TrendingUp
} from 'lucide-react'
import { recruitmentApi, aiApi, DashboardStats, Role, Candidate, IdealProfile, SimilarEmployee, PsychometricAnalysis, NegotiationAdvice } from '../lib/api'
import MetricCard from '../components/MetricCard'
import { PPARadarChart, HPTIBarChart, PipelineFunnelChart } from '../components/Charts'
import { AskThomBadge } from '../components/AskThom'
import { CandidateTeamCollaborationView } from '../components/TeamCollaboration'
import { ThomasProductLabel } from '../components/ThomasProductBadge'
import { PoweredByThomas, PoweredByInline, ThomRecommendation } from '../components/PoweredByThomas'
import { recruitmentApi as recruitmentApiTeam, CandidateTeamCollaboration } from '../lib/api'
import { PriorityBadge } from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import clsx from 'clsx'

// Negotiation Coach Component
function NegotiationCoachView({ 
  candidates, 
  selectedCandidate, 
  onSelectCandidate 
}: { 
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  onSelectCandidate: (c: Candidate | null) => void
}) {
  const [proposedTc, setProposedTc] = useState(0)
  const [advice, setAdvice] = useState<NegotiationAdvice | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedCandidate) {
      setProposedTc(selectedCandidate.expected_salary)
      setAdvice(null)
    }
  }, [selectedCandidate])

  const handleAnalyze = async () => {
    if (!selectedCandidate) return
    setLoading(true)
    try {
      const result = await aiApi.getNegotiationAdvice(selectedCandidate.candidate_id, proposedTc)
      setAdvice(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const currency = selectedCandidate?.currency_symbol || '£'
  const minSalary = selectedCandidate?.min_salary || 50000
  const maxSalary = selectedCandidate?.max_salary || 150000
  const midSalary = Math.round((minSalary + maxSalary) / 2)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-800">Negotiation Coach</h3>
              <p className="text-slate-500 text-sm">Use the salary slider to predict offer acceptance based on the candidate's psychometric profile</p>
            </div>
          </div>
          <PoweredByThomas service="askThom" size="sm" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-500 mb-2">Select Candidate for Negotiation:</label>
            <select 
              value={selectedCandidate?.candidate_id || ''}
              onChange={(e) => {
                const candidate = candidates.find(c => c.candidate_id === e.target.value)
                onSelectCandidate(candidate || null)
              }}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-thomas-orange/20 focus:border-thomas-orange"
            >
              <option value="">Choose a candidate...</option>
              {candidates.map(c => (
                <option key={c.candidate_id} value={c.candidate_id}>
                  {c.name} - {c.role_title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedCandidate && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left - Candidate Info & Controls */}
          <div className="space-y-6">
            {/* Candidate Card */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
              <h4 className="text-xl font-display font-bold text-slate-800 mb-1">{selectedCandidate.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-slate-500">Role:</span>
                  <span className="font-medium text-slate-700 ml-2">{selectedCandidate.role_title}</span>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-700 ml-2">{selectedCandidate.city}, {selectedCandidate.country}</span>
                </div>
                <div>
                  <span className="text-slate-500">Expected Salary:</span>
                  <span className="font-bold text-thomas-slate ml-2">{currency}{selectedCandidate.expected_salary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Flexibility:</span>
                  <span className={clsx(
                    'ml-2 px-2 py-0.5 rounded-full text-xs font-medium',
                    selectedCandidate.negotiation_flexibility === 'High' ? 'bg-success/10 text-success' :
                    selectedCandidate.negotiation_flexibility === 'Low' ? 'bg-danger/10 text-danger' :
                    'bg-warning/10 text-warning'
                  )}>
                    {selectedCandidate.negotiation_flexibility}
                  </span>
                </div>
              </div>

              {/* Salary Slider */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-medium text-slate-600 mb-3">Proposed Total Compensation</label>
                <div className="relative mb-2">
                  <input
                    type="range"
                    min={minSalary * 0.85}
                    max={maxSalary * 1.15}
                    value={proposedTc}
                    onChange={(e) => setProposedTc(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-danger via-warning to-success rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Min: {currency}{Math.round(minSalary * 0.85).toLocaleString()}</span>
                  <span>Mid: {currency}{midSalary.toLocaleString()}</span>
                  <span>Max: {currency}{Math.round(maxSalary * 1.15).toLocaleString()}</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-display font-bold text-thomas-slate">{currency}{proposedTc.toLocaleString()}</span>
                </div>
              </div>

              {/* Benchmarks */}
              {selectedCandidate.industry_avg_salary && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h5 className="text-sm font-medium text-slate-600 mb-3">Salary Benchmarks</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">Industry Average</p>
                      <p className="font-bold text-slate-700">{currency}{selectedCandidate.industry_avg_salary?.toLocaleString()}</p>
                      <p className={clsx(
                        'text-xs font-medium mt-1',
                        proposedTc > selectedCandidate.industry_avg_salary! ? 'text-success' : proposedTc < selectedCandidate.industry_avg_salary! ? 'text-danger' : 'text-slate-500'
                      )}>
                        {proposedTc > selectedCandidate.industry_avg_salary! ? '↑' : proposedTc < selectedCandidate.industry_avg_salary! ? '↓' : '='} 
                        {' '}{Math.abs(Math.round(((proposedTc - selectedCandidate.industry_avg_salary!) / selectedCandidate.industry_avg_salary!) * 100))}% 
                        {' '}{proposedTc >= selectedCandidate.industry_avg_salary! ? 'above' : 'below'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">Company Average</p>
                      <p className="font-bold text-slate-700">{currency}{selectedCandidate.company_avg_salary?.toLocaleString()}</p>
                      <p className={clsx(
                        'text-xs font-medium mt-1',
                        proposedTc > selectedCandidate.company_avg_salary! ? 'text-success' : proposedTc < selectedCandidate.company_avg_salary! ? 'text-danger' : 'text-slate-500'
                      )}>
                        {proposedTc > selectedCandidate.company_avg_salary! ? '↑' : proposedTc < selectedCandidate.company_avg_salary! ? '↓' : '='} 
                        {' '}{Math.abs(Math.round(((proposedTc - selectedCandidate.company_avg_salary!) / selectedCandidate.company_avg_salary!) * 100))}% 
                        {' '}{proposedTc >= selectedCandidate.company_avg_salary! ? 'above' : 'below'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-thomas-slate to-thomas-orange text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Offer
                  </>
                )}
              </button>
            </div>

            {/* PPA Chart */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
              <h4 className="font-display font-semibold text-slate-800 mb-4">Candidate Negotiation Profile</h4>
              <PPARadarChart 
                data={{
                  dominance: selectedCandidate.ppa_dominance,
                  influence: selectedCandidate.ppa_influence,
                  steadiness: selectedCandidate.ppa_steadiness,
                  compliance: selectedCandidate.ppa_compliance,
                }}
              />
            </div>
          </div>

          {/* Right - Results */}
          <div className="space-y-6">
            {/* Likelihood */}
            <div className="bg-gradient-to-br from-thomas-slate via-thomas-slate-dark to-slate-900 rounded-2xl p-6 text-white">
              <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Predicted Acceptance Likelihood</p>
              {advice ? (
                <div className="flex items-center gap-6">
                  <span className={clsx(
                    'text-6xl font-display font-bold',
                    advice.advice.likelihood >= 70 ? 'text-success' : 
                    advice.advice.likelihood >= 50 ? 'text-warning' : 'text-danger'
                  )}>
                    {advice.advice.likelihood}%
                  </span>
                  <div className="flex-1">
                    <p className="text-white/80">at {currency}{proposedTc.toLocaleString()} TC</p>
                    <p className="text-white/50 text-sm mt-1">
                      {advice.advice.likelihood >= 70 ? 'High chance of acceptance' : 
                       advice.advice.likelihood >= 50 ? 'Moderate chance - may need sweeteners' : 
                       'Low chance - consider increasing offer'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/50">Click "Analyze Offer" to see prediction</p>
                </div>
              )}
            </div>

            {/* GenAI Profile Insight */}
            {advice?.profile_insight && (
              <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-2xl border border-purple-100 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h4 className="font-display font-semibold text-slate-800">AI Negotiation Profile Insight</h4>
                  </div>
                  <AskThomBadge context="negotiation" size="sm" />
                </div>
                <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none">
                  {advice.profile_insight.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-3" dangerouslySetInnerHTML={{ 
                      __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Levers to Pull */}
            {advice && (
              <>
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">🎯 Levers to Pull</h4>
                  <ul className="space-y-2">
                    {advice.advice.levers.map((lever, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600">
                        <span className="text-thomas-orange mt-1">•</span>
                        {lever}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                    <h4 className="font-semibold text-success mb-2">✅ Emphasise</h4>
                    <p className="text-slate-600 text-sm">{advice.advice.emphasize}</p>
                  </div>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                    <h4 className="font-semibold text-danger mb-2">❌ Avoid</h4>
                    <p className="text-slate-600 text-sm">{advice.advice.avoid}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-thomas-orange/5 to-thomas-slate/5 rounded-2xl border border-thomas-orange/20 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-thomas-orange" />
                      <h4 className="font-semibold text-slate-800">Recommended Approach</h4>
                    </div>
                    <AskThomBadge context="negotiation" size="sm" />
                  </div>
                  <p className="text-slate-600 leading-relaxed">{advice.advice.approach}</p>
                </div>
              </>
            )}

            {!advice && !loading && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Adjust the salary slider and click "Analyze Offer" to get AI-powered negotiation advice</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedCandidate && (
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <span className="text-4xl mb-4 block">🤝</span>
          <h3 className="text-lg font-display font-semibold text-slate-600 mb-2">Select a Candidate</h3>
          <p className="text-slate-500">Choose a candidate from the dropdown above to start the negotiation analysis.</p>
        </div>
      )}
    </div>
  )
}

interface Props {
  managerId: string
}

export default function RecruitmentDashboard({ managerId }: Props) {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [idealProfiles, setIdealProfiles] = useState<Record<string, IdealProfile>>({})
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [similarEmployees, setSimilarEmployees] = useState<SimilarEmployee[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'urgent' | null>(null)
  const [activeView, setActiveView] = useState<'pipeline' | 'deep-dive' | 'team' | 'negotiation'>('pipeline')
  const [teamCollaboration, setTeamCollaboration] = useState<CandidateTeamCollaboration | null>(null)
  const [teamCollaborationLoading, setTeamCollaborationLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [psychometricAnalysis, setPsychometricAnalysis] = useState<PsychometricAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      recruitmentApi.getDashboardStats(),
      recruitmentApi.getRoles(managerId),
      recruitmentApi.getCandidates(undefined, managerId),
      recruitmentApi.getIdealProfiles(),
    ])
      .then(([statsData, rolesData, candidatesData, profilesData]) => {
        setStats(statsData)
        setRoles(rolesData)
        setCandidates(candidatesData)
        setIdealProfiles(profilesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [managerId])

  const roleCandidates = selectedRole 
    ? candidates.filter(c => c.role_id === selectedRole.role_id)
    : []
  
  const idealProfile = selectedRole ? idealProfiles[selectedRole.title] : null

  // Filter roles based on active filter
  const filteredRoles = roles.filter(role => {
    if (activeFilter === 'critical') return role.priority === 'Critical'
    if (activeFilter === 'urgent') return role.days_until_target < 14
    return true
  })

  // Fetch similar employees when role changes
  useEffect(() => {
    if (selectedRole) {
      aiApi.getSimilarEmployees(selectedRole.title)
        .then(res => setSimilarEmployees(res.similar_employees))
        .catch(console.error)
    }
  }, [selectedRole])

  // Fetch psychometric analysis when candidate is selected for deep dive
  useEffect(() => {
    if (selectedCandidate && activeView === 'deep-dive') {
      setAnalysisLoading(true)
      aiApi.getPsychometricAnalysis(selectedCandidate.candidate_id)
        .then(setPsychometricAnalysis)
        .catch(console.error)
        .finally(() => setAnalysisLoading(false))
    }
  }, [selectedCandidate, activeView])

  // Fetch team collaboration when candidate is selected for team view
  useEffect(() => {
    if (selectedCandidate && activeView === 'team') {
      setTeamCollaborationLoading(true)
      recruitmentApiTeam.getTeamCollaboration(selectedCandidate.candidate_id)
        .then(setTeamCollaboration)
        .catch(console.error)
        .finally(() => setTeamCollaborationLoading(false))
    }
  }, [selectedCandidate, activeView])

  // Helper to render trait gap bar
  const renderTraitGap = (label: string, trait: { candidate: number; ideal: number; gap: number; status: string }) => {
    const gapColor = trait.status === 'above' ? 'text-success' : trait.status === 'below' ? 'text-warning' : 'text-slate-500'
    const gapBg = trait.status === 'above' ? 'bg-success/10' : trait.status === 'below' ? 'bg-warning/10' : 'bg-slate-100'
    const barWidth = Math.min(100, Math.max(0, trait.candidate))
    const idealWidth = Math.min(100, Math.max(0, trait.ideal))
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-thomas-slate">{trait.candidate}%</span>
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', gapBg, gapColor)}>
              {trait.gap > 0 ? '+' : ''}{trait.gap} from ideal
            </span>
          </div>
        </div>
        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          {/* Ideal marker */}
          <div 
            className="absolute h-full w-0.5 bg-slate-400 z-10"
            style={{ left: `${idealWidth}%` }}
          />
          <div 
            className="absolute -top-0.5 w-2 h-2 rounded-full bg-slate-500 border-2 border-white shadow z-20"
            style={{ left: `calc(${idealWidth}% - 4px)`, top: '50%', transform: 'translateY(-50%)' }}
          />
          {/* Candidate bar */}
          <div 
            className={clsx(
              'h-full rounded-full transition-all',
              trait.status === 'above' ? 'bg-gradient-to-r from-success/80 to-success' :
              trait.status === 'below' ? 'bg-gradient-to-r from-warning/80 to-warning' :
              'bg-gradient-to-r from-thomas-orange/80 to-thomas-orange'
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-400">
          <span>0</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Ideal: {trait.ideal}%
          </span>
          <span>100</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-thomas-orange border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-slate-500">Loading recruitment data...</p>
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
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-800">
                  Recruitment Intelligence
                </h1>
                <p className="text-slate-500 text-sm">
                  IFS talent acquisition • Powered by <span className="text-thomas-orange font-medium">Thomas</span> psychometrics
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-thomas-slate">{roles.length}</p>
                <p className="text-xs text-slate-500">Open Roles</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-right">
                <p className="text-2xl font-bold text-thomas-orange">{candidates.length}</p>
                <p className="text-xs text-slate-500">Candidates</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-right">
                <p className="text-2xl font-bold text-danger">{roles.filter(r => r.priority === 'Critical').length}</p>
                <p className="text-xs text-slate-500">Critical</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Clickable Metrics Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => { setActiveFilter(null); setSelectedRole(null); }}
            className={clsx(
              'bg-white rounded-2xl p-5 text-left transition-all border-2 hover:shadow-lg group',
              activeFilter === null && !selectedRole ? 'border-thomas-orange shadow-lg' : 'border-transparent shadow-card hover:border-slate-200'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">📂 Open Roles</p>
            </div>
            <p className="text-3xl font-display font-bold text-slate-800">{roles.length}</p>
            <p className="text-sm text-thomas-orange mt-1">For your department</p>
          </button>

          <button
            onClick={() => { setActiveFilter('critical'); setSelectedRole(null); }}
            className={clsx(
              'bg-white rounded-2xl p-5 text-left transition-all border-2 hover:shadow-lg group',
              activeFilter === 'critical' ? 'border-danger shadow-lg bg-danger/5' : 'border-transparent shadow-card hover:border-danger/30'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">🔴 Critical Priority</p>
            </div>
            <p className="text-3xl font-display font-bold text-danger">{roles.filter(r => r.priority === 'Critical').length}</p>
            <p className="text-sm text-danger mt-1">Need immediate attention</p>
          </button>

          <button
            onClick={() => { setActiveFilter(null); setSelectedRole(null); }}
            className={clsx(
              'bg-white rounded-2xl p-5 text-left transition-all border-2 hover:shadow-lg group',
              'border-transparent shadow-card hover:border-slate-200'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">👥 Active Candidates</p>
            </div>
            <p className="text-3xl font-display font-bold text-thomas-slate">{candidates.length}</p>
            <p className="text-sm text-slate-500 mt-1">Across {roles.length} roles</p>
          </button>

          <button
            onClick={() => { setActiveFilter('urgent'); setSelectedRole(null); }}
            className={clsx(
              'bg-white rounded-2xl p-5 text-left transition-all border-2 hover:shadow-lg group',
              activeFilter === 'urgent' ? 'border-warning shadow-lg bg-warning/5' : 'border-transparent shadow-card hover:border-warning/30'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">🏃 Avg Days to Target</p>
            </div>
            <p className="text-3xl font-display font-bold text-warning">
              {Math.round(roles.reduce((acc, r) => acc + r.days_until_target, 0) / (roles.length || 1))}
            </p>
            <p className="text-sm text-warning mt-1">days remaining</p>
          </button>
        </div>

        {/* Filter indicator */}
        {activeFilter && (
          <div className="mb-6 flex items-center gap-3">
            <div className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2',
              activeFilter === 'critical' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
            )}>
              {activeFilter === 'critical' ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Showing {filteredRoles.length} Critical Priority Roles
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Showing {filteredRoles.length} Urgent Timeline Roles (&lt;14 days)
                </>
              )}
            </div>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Roles Grid - Clickable Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-display font-semibold text-slate-800 mb-4">
            {activeFilter === 'critical' ? 'Critical Priority Roles' : 
             activeFilter === 'urgent' ? 'Urgent Timeline Roles' : 
             'Open Positions'}
            <span className="text-slate-400 font-normal ml-2">({filteredRoles.length})</span>
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {filteredRoles.map((role) => {
              const progress = Math.max(0, ((60 - role.days_until_target) / 60) * 100)
              const isUrgent = role.days_until_target < 14
              const isSelected = selectedRole?.role_id === role.role_id
              
              return (
                <button
                  key={role.role_id}
                  onClick={() => setSelectedRole(isSelected ? null : role)}
                  className={clsx(
                    'bg-white rounded-2xl p-5 text-left transition-all duration-300 border-2',
                    'hover:shadow-lg hover:-translate-y-1',
                    isSelected 
                      ? 'border-thomas-orange shadow-lg shadow-thomas-orange/10' 
                      : 'border-transparent shadow-card hover:border-slate-200',
                    isUrgent && !isSelected && 'border-l-4 border-l-danger'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 leading-tight">{role.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{role.department}</p>
                    </div>
                    <PriorityBadge priority={role.priority} />
                  </div>
                  
                  <div className="space-y-3">
                    <ProgressBar
                      value={progress}
                      showValue={false}
                      variant={progress > 70 ? 'warning' : 'default'}
                      size="sm"
                    />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        <span className="font-semibold text-slate-700">{role.days_until_target}</span> days left
                      </span>
                      <span className="text-slate-500">
                        <span className="font-semibold text-thomas-orange">{role.current_pipeline_count}</span> candidates
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-thomas-orange">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Role Details - Slide In Panel */}
        {selectedRole && (
          <div className="animate-slide-up">
            {/* Role Header */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-thomas-orange/20 to-thomas-slate/10 flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-thomas-slate" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-slate-800">
                      {selectedRole.title}
                    </h2>
                    <p className="text-slate-500">
                      {selectedRole.department} • {selectedRole.level} • ${(selectedRole.min_salary/1000).toFixed(0)}K - ${(selectedRole.max_salary/1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              {/* Hiring Milestones */}
              <div className="mt-6 grid grid-cols-6 gap-3">
                {[
                  { label: 'Phone Screens', date: selectedRole.target_hire_date, done: true },
                  { label: 'Tech Assessment', date: selectedRole.target_hire_date, done: true },
                  { label: 'Onsite', date: selectedRole.target_hire_date, done: true },
                  { label: 'Final Round', date: selectedRole.target_hire_date, done: false },
                  { label: 'Offer', date: selectedRole.target_hire_date, done: false },
                  { label: 'Start Date', date: selectedRole.target_hire_date, done: false },
                ].map((milestone, idx) => (
                  <div key={idx} className="relative">
                    <div className={clsx(
                      'h-1.5 rounded-full mb-2',
                      milestone.done ? 'bg-success' : 'bg-slate-200'
                    )} />
                    <p className={clsx(
                      'text-xs font-medium',
                      milestone.done ? 'text-success' : 'text-slate-500'
                    )}>{milestone.label}</p>
                  </div>
                ))}
              </div>

              {/* View Tabs */}
              <div className="mt-6 flex gap-1 border-t border-slate-100 pt-4">
                {[
                  { id: 'pipeline', label: '📋 Open Roles Pipeline', icon: Briefcase },
                  { id: 'deep-dive', label: '🔬 Candidate Deep Dive', icon: Brain },
                  { id: 'team', label: '👥 Team Collaboration', icon: Users },
                  { id: 'negotiation', label: '🤝 Negotiation Coach', icon: TrendingUp },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveView(id as typeof activeView)}
                    className={clsx(
                      'px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                      activeView === id
                        ? 'bg-thomas-slate text-white shadow-lg'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline View */}
            {activeView === 'pipeline' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Candidates List */}
              <div className="col-span-2 space-y-6">
                {/* Candidate Pipeline */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-thomas-orange" />
                      <h3 className="font-display font-semibold text-slate-800">
                        Candidates ({roleCandidates.length})
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>Target: <strong className="text-thomas-slate">{selectedRole.required_interviews_per_week}</strong> interviews/week</span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {roleCandidates.slice(0, 6).map((candidate, idx) => (
                      <div 
                        key={candidate.candidate_id}
                        className="px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/recruitment/candidate/${candidate.candidate_id}`)}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-thomas-orange/20 to-thomas-slate/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-thomas-slate">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-800">{candidate.name}</p>
                              <span className={clsx(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                candidate.confidence_status === 'On Track' 
                                  ? 'bg-success/10 text-success' 
                                  : 'bg-warning/10 text-warning'
                              )}>
                                {candidate.confidence_status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">{candidate.current_stage} • {candidate.source}</p>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-lg font-bold text-thomas-orange">{candidate.match_score}%</p>
                              <p className="text-xs text-slate-500">Match</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-slate-700">${(candidate.expected_salary/1000).toFixed(0)}K</p>
                              <p className="text-xs text-slate-500">Expected</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                        
                        {/* Candidate Timeline */}
                        <div className="mt-3 ml-14 flex items-center gap-2">
                          {['Screening', 'Phone', 'Technical', 'Onsite', 'Final'].map((stage, stageIdx) => {
                            const stageOrder = candidate.stage_order || 1
                            const isDone = stageIdx < stageOrder
                            const isCurrent = stageIdx === stageOrder - 1
                            return (
                              <div key={stage} className="flex items-center gap-2">
                                <div className={clsx(
                                  'w-2 h-2 rounded-full',
                                  isDone ? 'bg-success' : isCurrent ? 'bg-thomas-orange animate-pulse' : 'bg-slate-200'
                                )} />
                                <span className={clsx(
                                  'text-xs',
                                  isDone ? 'text-success' : isCurrent ? 'text-thomas-orange font-medium' : 'text-slate-400'
                                )}>{stage}</span>
                                {stageIdx < 4 && <div className="w-4 h-px bg-slate-200" />}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline Funnel */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                  <h3 className="font-display font-semibold text-slate-800 mb-4">Pipeline by Stage</h3>
                  {stats?.candidates_by_stage && (
                    <PipelineFunnelChart data={stats.candidates_by_stage} />
                  )}
                </div>
              </div>

              {/* Ideal Candidate Profile - Enhanced with solid dark background */}
              <div className="space-y-6">
                <div className="bg-[#1A1F2E] rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-thomas-orange/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-thomas-orange" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-white">Ideal Candidate Profile</h3>
                        <p className="text-[#9CA3AF] text-xs">Based on top performers</p>
                      </div>
                    </div>
                    <PoweredByThomas service="connect" size="xs" />
                  </div>
                  
                  {idealProfile && (
                    <>
                      {/* PPA Scores */}
                      <div className="space-y-2 mb-6">
                        <p className="text-xs text-[#6B7280] uppercase tracking-wider">DISC Profile</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Dominance', value: idealProfile.ppa_dominance, color: 'bg-red-500' },
                            { label: 'Influence', value: idealProfile.ppa_influence, color: 'bg-yellow-500' },
                            { label: 'Steadiness', value: idealProfile.ppa_steadiness, color: 'bg-teal-500' },
                            { label: 'Compliance', value: idealProfile.ppa_compliance, color: 'bg-blue-500' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="bg-[#242937] rounded-xl p-3 border border-[#2A3142]">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-[#9CA3AF]">{label}</span>
                                <span className="text-sm font-bold text-white">{value}</span>
                              </div>
                              <div className="h-1.5 bg-[#1A1F2E] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${color} rounded-full`}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* GIA & HPTI */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[#242937] rounded-xl p-4 text-center border border-[#2A3142]">
                          <Zap className="w-6 h-6 text-thomas-orange mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{idealProfile.gia_overall}</p>
                          <p className="text-xs text-[#9CA3AF]">GIA Score</p>
                        </div>
                        <div className="bg-[#242937] rounded-xl p-4 text-center border border-[#2A3142]">
                          <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{idealProfile.hpti_conscientiousness}%</p>
                          <p className="text-xs text-[#9CA3AF]">HPTI Leader</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* AI-Generated Description */}
                  <div className="bg-[#242937] rounded-xl p-4 mb-4 border border-[#2A3142]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-thomas-orange" />
                        <span className="text-xs text-[#9CA3AF]">AI Profile Summary</span>
                      </div>
                      <AskThomBadge context="ideal-profile" size="sm" />
                    </div>
                    <p className="text-sm text-[#D1D5DB] leading-relaxed">
                      The ideal candidate demonstrates <strong className="text-white">balanced assertiveness</strong> with high influence skills, 
                      thriving in collaborative environments. Top performers in this role show strong 
                      <strong className="text-white"> analytical thinking</strong> and adapt quickly to ambiguity. They typically 
                      drive 2-3 major initiatives per quarter and mentor junior team members.
                    </p>
                  </div>

                  <p className="text-xs text-[#6B7280] text-center">
                    Based on {idealProfile?.sample_size || 5}+ top performers
                  </p>
                </div>

                {/* Most Similar Employees */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-success" />
                      <h3 className="font-display font-semibold text-slate-800">Most Similar In Org</h3>
                    </div>
                    <PoweredByThomas service="insights" size="xs" />
                  </div>
                  
                  <div className="space-y-3">
                    {similarEmployees.slice(0, 5).map((emp) => (
                      <div 
                        key={emp.employee_id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                          <span className="text-xs font-semibold text-success">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-success">{emp.match_score}%</p>
                          <p className="text-xs text-slate-400">match</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-4 text-center">
                    Employees who best match the ideal profile for this role
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Candidate Deep Dive View */}
            {activeView === 'deep-dive' && (
              <div className="space-y-6">
                {/* Candidate Selection */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Brain className="w-6 h-6 text-thomas-orange" />
                    <h3 className="font-display font-semibold text-slate-800 text-lg">Candidate Analysis</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-500 mb-2">Select Candidate:</label>
                      <select 
                        value={selectedCandidate?.candidate_id || ''}
                        onChange={(e) => {
                          const candidate = roleCandidates.find(c => c.candidate_id === e.target.value)
                          setSelectedCandidate(candidate || null)
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-thomas-orange/20 focus:border-thomas-orange"
                      >
                        <option value="">Choose a candidate...</option>
                        {roleCandidates.map(c => (
                          <option key={c.candidate_id} value={c.candidate_id}>
                            {c.name} ({c.role_title})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedCandidate && (
                      <div className="flex items-center gap-4 mt-6">
                        <span className={clsx(
                          'px-3 py-1.5 rounded-full text-sm font-medium',
                          selectedCandidate.confidence_status === 'On Track' 
                            ? 'bg-warning/10 text-warning border border-warning/20' 
                            : 'bg-success/10 text-success border border-success/20'
                        )}>
                          {selectedCandidate.confidence_status === 'On Track' ? '⚠️ At Risk' : '✓ On Track'}
                        </span>
                        <span className="text-sm text-slate-500">
                          {selectedCandidate.candidate_confidence}% confidence at {selectedCandidate.current_stage} (benchmark: {selectedCandidate.stage_benchmark_confidence}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedCandidate && (
                  <>
                    {analysisLoading ? (
                      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-thomas-orange border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-slate-500">Loading psychometric analysis...</p>
                      </div>
                    ) : psychometricAnalysis ? (
                      <div className="space-y-6">
                        {/* PROMINENT AI Profile Summary - At Top */}
                        <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                                  <span className="text-2xl font-bold text-white">
                                    {selectedCandidate.name.split(' ').map((n: string) => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-xl font-display font-bold text-white">{selectedCandidate.name}</h3>
                                  <p className="text-white/70 text-sm">{selectedCandidate.role_title} • {selectedCandidate.current_stage}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-3xl font-bold text-thomas-orange">{psychometricAnalysis.match_score}%</p>
                                  <p className="text-xs text-white/60 uppercase tracking-wider">Profile Match</p>
                                </div>
                                <AskThomBadge context="candidate-analysis" size="sm" />
                              </div>
                            </div>
                          </div>
                          <div className="p-6 bg-slate-50">
                            <div className="flex items-start gap-3">
                              <Sparkles className="w-5 h-5 text-thomas-orange flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800 mb-2">AI Profile Summary</h4>
                                <p className="text-slate-700 leading-relaxed">
                                  {psychometricAnalysis.descriptions.overall}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                        {/* Left Column - Candidate Profile */}
                        <div className="space-y-6">
                          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                            <h4 className="text-lg font-display font-semibold text-slate-800 mb-3">Candidate Details</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-slate-500">Source:</span> <span className="font-medium text-slate-700">{selectedCandidate.source}</span></p>
                              <p><span className="text-slate-500">Expected Salary:</span> <span className="font-bold text-slate-800">{selectedCandidate.currency_symbol || '$'}{selectedCandidate.expected_salary.toLocaleString()}</span></p>
                              <p><span className="text-slate-500">Flexibility:</span> <span className="font-medium text-slate-700">{selectedCandidate.negotiation_flexibility}</span></p>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">Confidence Level</span>
                                <span className="text-lg font-bold text-thomas-orange">{selectedCandidate.candidate_confidence}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-thomas-orange to-success rounded-full transition-all"
                                  style={{ width: `${selectedCandidate.candidate_confidence}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Benchmark: {selectedCandidate.stage_benchmark_confidence}% at this stage</p>
                            </div>
                          </div>

                          {/* PPA Radar */}
                          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                            <h4 className="font-display font-semibold text-slate-800 mb-4">Candidate vs Ideal PPA</h4>
                            <PPARadarChart 
                              data={{
                                dominance: selectedCandidate.ppa_dominance,
                                influence: selectedCandidate.ppa_influence,
                                steadiness: selectedCandidate.ppa_steadiness,
                                compliance: selectedCandidate.ppa_compliance,
                              }}
                              comparison={idealProfile ? {
                                dominance: idealProfile.ppa_dominance,
                                influence: idealProfile.ppa_influence,
                                steadiness: idealProfile.ppa_steadiness,
                                compliance: idealProfile.ppa_compliance,
                              } : undefined}
                            />
                          </div>
                        </div>

                        {/* Center Column - Trait Analysis with Gaps */}
                        <div className="space-y-6">
                          {/* PPA Trait Gaps */}
                          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                            <div className="mb-4">
                              <ThomasProductLabel 
                                product="PPA" 
                                title="PPA Profile (DISC)" 
                                subtitle="Gap from ideal shown"
                                size="sm"
                              />
                            </div>
                            
                            {renderTraitGap('Dominance', psychometricAnalysis.ppa_analysis.dominance)}
                            {renderTraitGap('Influence', psychometricAnalysis.ppa_analysis.influence)}
                            {renderTraitGap('Steadiness', psychometricAnalysis.ppa_analysis.steadiness)}
                            {renderTraitGap('Compliance', psychometricAnalysis.ppa_analysis.compliance)}
                            
                            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-thomas-orange" />
                                  <span className="text-xs font-medium text-slate-600">AI Analysis</span>
                                </div>
                                <AskThomBadge context="psychometric" size="sm" />
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {psychometricAnalysis.descriptions.ppa}
                              </p>
                            </div>
                          </div>

                          {/* GIA Score */}
                          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                            <div className="mb-4">
                              <ThomasProductLabel 
                                product="GIA" 
                                title="GIA Score" 
                                subtitle="General Intelligence Assessment"
                                size="sm"
                              />
                            </div>
                            
                            <div className="flex items-center gap-6 mb-4">
                              <div className="text-center">
                                <p className="text-4xl font-display font-bold text-purple-600">{psychometricAnalysis.gia_analysis.score}</p>
                                <p className="text-xs text-slate-500">Candidate</p>
                              </div>
                              <div className="flex-1 h-px bg-slate-200" />
                              <div className="text-center">
                                <p className="text-2xl font-bold text-slate-400">{psychometricAnalysis.gia_analysis.ideal}</p>
                                <p className="text-xs text-slate-500">Ideal</p>
                              </div>
                              <div className="flex-1 h-px bg-slate-200" />
                              <div className="text-center">
                                <p className="text-2xl font-bold text-thomas-orange">{psychometricAnalysis.gia_analysis.percentile}th</p>
                                <p className="text-xs text-slate-500">Percentile</p>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl border border-purple-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-purple-600" />
                                  <span className="text-xs font-medium text-slate-600">AI Analysis</span>
                                </div>
                                <AskThomBadge context="psychometric" size="sm" />
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {psychometricAnalysis.descriptions.gia}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - HPTI */}
                        <div className="space-y-6">
                          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                            <div className="mb-4">
                              <ThomasProductLabel 
                                product="HPTI" 
                                title="HPTI Leadership Traits" 
                                subtitle="Gap from ideal shown"
                                size="sm"
                              />
                            </div>
                            
                            {renderTraitGap('Risk Approach', psychometricAnalysis.hpti_analysis.risk_approach)}
                            {renderTraitGap('Conscientiousness', psychometricAnalysis.hpti_analysis.conscientiousness)}
                            {renderTraitGap('Ambiguity Accept.', psychometricAnalysis.hpti_analysis.ambiguity_acceptance)}
                            {renderTraitGap('Competitiveness', psychometricAnalysis.hpti_analysis.competitiveness)}
                            {renderTraitGap('Adjustment', psychometricAnalysis.hpti_analysis.adjustment)}
                            {renderTraitGap('Curiosity', psychometricAnalysis.hpti_analysis.curiosity)}
                            
                            <div className="mt-4 p-4 bg-gradient-to-br from-teal-50 to-slate-50 rounded-xl border border-teal-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-teal-600" />
                                  <span className="text-xs font-medium text-slate-600">AI Analysis</span>
                                </div>
                                <AskThomBadge context="psychometric" size="sm" />
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {psychometricAnalysis.descriptions.hpti}
                              </p>
                            </div>
                          </div>

                          </div>
                      </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center">
                        <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Select a candidate to view detailed psychometric analysis</p>
                      </div>
                    )}
                  </>
                )}

                {!selectedCandidate && (
                  <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-display font-semibold text-slate-600 mb-2">Select a Candidate</h3>
                    <p className="text-slate-500">Choose a candidate from the dropdown above to view their detailed psychometric analysis with trait comparisons and AI-generated insights.</p>
                  </div>
                )}
              </div>
            )}

            {/* Team Collaboration View */}
            {activeView === 'team' && (
              <div className="space-y-6">
                {/* Candidate Selection */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-800">Team Collaboration</h3>
                      <p className="text-slate-500 text-sm">Analyse chemistry and working relationships with future team members</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-500 mb-2">Select Candidate to Analyse:</label>
                      <select 
                        value={selectedCandidate?.candidate_id || ''}
                        onChange={(e) => {
                          const candidate = roleCandidates.find(c => c.candidate_id === e.target.value)
                          setSelectedCandidate(candidate || null)
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      >
                        <option value="">Choose a candidate...</option>
                        {roleCandidates.map(c => (
                          <option key={c.candidate_id} value={c.candidate_id}>
                            {c.name} - {c.current_stage}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {teamCollaborationLoading && (
                  <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Analysing team chemistry...</p>
                  </div>
                )}

                {!teamCollaborationLoading && teamCollaboration && selectedCandidate && (
                  <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                    <CandidateTeamCollaborationView data={teamCollaboration} />
                  </div>
                )}

                {!selectedCandidate && !teamCollaborationLoading && (
                  <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-display font-semibold text-slate-600 mb-2">Select a Candidate</h3>
                    <p className="text-slate-500">Choose a candidate from the dropdown above to analyse their team chemistry and collaboration potential.</p>
                  </div>
                )}
              </div>
            )}

            {/* Negotiation Coach View */}
            {activeView === 'negotiation' && (
              <NegotiationCoachView 
                candidates={roleCandidates} 
                selectedCandidate={selectedCandidate}
                onSelectCandidate={setSelectedCandidate}
              />
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedRole && (
          <div className="bg-white/50 rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-thomas-orange/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-thomas-orange" />
            </div>
            <h3 className="text-lg font-display font-semibold text-slate-700 mb-2">
              Select a Role to View Details
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Click on any open position above to view the candidate pipeline, ideal profile, and AI-powered insights.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
