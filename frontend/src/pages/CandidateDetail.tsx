import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Briefcase,
  DollarSign,
  Sparkles,
  SlidersHorizontal,
  MessageSquare,
  Save,
  Users
} from 'lucide-react'
import { recruitmentApi, aiApi, CandidateDetails, AnalyticsDefault, NegotiationAdvice, BiasPitfallsResponse, CandidateInsightsResponse } from '../lib/api'
import { PPARadarChart, HPTIBarChart, LikelihoodGauge } from '../components/Charts'
import { ConfidenceBadge } from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import { AskThomBadge } from '../components/AskThom'
import { ThomasProductLabel } from '../components/ThomasProductBadge'
import { PoweredByThomas, PoweredByInline } from '../components/PoweredByThomas'
import { BiasPitfallsView, BiasBadge } from '../components/BiasPitfalls'
import { CandidateInsightsView, InsightsSummaryBadge } from '../components/CandidateInsights'
import clsx from 'clsx'

export default function CandidateDetail() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<CandidateDetails | null>(null)
  const [defaults, setDefaults] = useState<AnalyticsDefault[]>([])
  const [interactionSummary, setInteractionSummary] = useState<string | null>(null)
  const [negotiationAdvice, setNegotiationAdvice] = useState<NegotiationAdvice | null>(null)
  const [proposedTc, setProposedTc] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'weights' | 'negotiation'>('profile')
  const [biasPitfalls, setBiasPitfalls] = useState<BiasPitfallsResponse | null>(null)
  const [biasLoading, setBiasLoading] = useState(false)
  const [candidateInsights, setCandidateInsights] = useState<CandidateInsightsResponse | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  
  // Simulated interviewer ID (in production, this would come from auth context)
  const interviewerId = 'EMP-1000'
  
  // Weight sliders
  const [weights, setWeights] = useState({
    coding: 0.25,
    technical: 0.25,
    ppa: 0.20,
    gia: 0.15,
    hpti: 0.15,
  })

  useEffect(() => {
    if (!candidateId) return
    
    Promise.all([
      recruitmentApi.getCandidateDetails(candidateId),
      recruitmentApi.getAnalyticsDefaults(),
      aiApi.getInteractionSummary(candidateId).catch(() => null),
    ])
      .then(([candidateData, defaultsData, summaryData]) => {
        setData(candidateData)
        setDefaults(defaultsData)
        setInteractionSummary(summaryData?.summary || null)
        setProposedTc(candidateData.candidate.expected_salary)
        
        // Set default weights based on role type
        const roleType = candidateData.candidate.role_title.includes('Engineer') 
          ? 'Software Engineer' 
          : candidateData.candidate.role_title.includes('Product') 
            ? 'Product Manager' 
            : 'Software Engineer'
        const roleDefaults = defaultsData.find(d => d.role_type === roleType)
        if (roleDefaults) {
          setWeights({
            coding: roleDefaults.coding_assessment_weight,
            technical: roleDefaults.technical_interview_weight,
            ppa: roleDefaults.ppa_weight,
            gia: roleDefaults.gia_weight,
            hpti: roleDefaults.hpti_weight,
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    
    // Fetch bias pitfalls separately (private to interviewer)
    setBiasLoading(true)
    aiApi.getBiasPitfalls(candidateId, interviewerId)
      .then(setBiasPitfalls)
      .catch(console.error)
      .finally(() => setBiasLoading(false))
    
    // Fetch candidate insights
    setInsightsLoading(true)
    aiApi.getCandidateInsights(candidateId)
      .then(setCandidateInsights)
      .catch(console.error)
      .finally(() => setInsightsLoading(false))
  }, [candidateId, interviewerId])

  const handleNegotiationAnalysis = async () => {
    if (!candidateId) return
    const advice = await aiApi.getNegotiationAdvice(candidateId, proposedTc)
    setNegotiationAdvice(advice)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-thomas-orange border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Candidate not found</div>
  }

  const { candidate, interactions, ideal_profile } = data
  
  // Calculate weighted score
  const ppaAvg = (candidate.ppa_dominance + candidate.ppa_influence + candidate.ppa_steadiness + candidate.ppa_compliance) / 4
  const hptiAvg = (candidate.hpti_conscientiousness + candidate.hpti_adjustment + candidate.hpti_curiosity) / 3
  const weightedScore = (
    (80 * weights.coding) + // Placeholder coding score
    (75 * weights.technical) + // Placeholder technical score
    (ppaAvg * weights.ppa) +
    ((candidate.gia_score / 130) * 100 * weights.gia) +
    (hptiAvg * weights.hpti)
  )

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6">
          <button
            onClick={() => navigate('/recruitment')}
            className="flex items-center gap-2 text-slate-500 hover:text-thomas-orange transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Recruitment
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-thomas-orange to-thomas-slate flex items-center justify-center shadow-glow">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-800">{candidate.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-500">{candidate.role_title}</span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-sm">
                    {candidate.current_stage}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {candidateInsights && (
                <InsightsSummaryBadge
                  highlights={candidateInsights.summary.total_highlights}
                  lowlights={candidateInsights.summary.total_lowlights}
                  checks={candidateInsights.summary.pending_checks}
                  onClick={() => {
                    document.getElementById('insights-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                />
              )}
              {biasPitfalls && biasPitfalls.pitfalls.length > 0 && (
                <BiasBadge 
                  pitfallCount={biasPitfalls.total_detected}
                  overallRisk={biasPitfalls.overall_risk}
                  onClick={() => {
                    document.getElementById('bias-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                />
              )}
              <ConfidenceBadge
                confidence={candidate.candidate_confidence}
                benchmark={candidate.stage_benchmark_confidence}
                stage={candidate.current_stage}
              />
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-8 flex gap-1">
          {[
            { id: 'profile', label: 'Profile & Assessment', icon: User },
            { id: 'weights', label: 'Scoring Weights', icon: SlidersHorizontal },
            { id: 'negotiation', label: 'Negotiation Coach', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2',
                activeTab === id
                  ? 'text-thomas-orange border-thomas-orange'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
          <div className="grid grid-cols-3 gap-8">
            {/* Left - Info & PPA */}
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                <h3 className="text-lg font-display font-semibold text-slate-800 mb-4">Candidate Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected Salary</span>
                    <span className="font-semibold text-slate-800">${candidate.expected_salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flexibility</span>
                    <span className="font-medium text-slate-700">{candidate.negotiation_flexibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source</span>
                    <span className="font-medium text-slate-700">{candidate.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GIA Score</span>
                    <span className="font-semibold text-thomas-orange">{candidate.gia_score}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <ProgressBar
                    value={candidate.match_score}
                    label="Profile Match Score"
                    variant="auto"
                  />
                </div>
              </div>

              {/* PPA Chart */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                <div className="mb-4">
                  <ThomasProductLabel 
                    product="PPA" 
                    title="PPA Profile (DISC)" 
                    size="sm"
                  />
                </div>
                <PPARadarChart
                  data={{
                    dominance: candidate.ppa_dominance,
                    influence: candidate.ppa_influence,
                    steadiness: candidate.ppa_steadiness,
                    compliance: candidate.ppa_compliance,
                  }}
                  comparison={ideal_profile ? {
                    dominance: ideal_profile.ppa_dominance,
                    influence: ideal_profile.ppa_influence,
                    steadiness: ideal_profile.ppa_steadiness,
                    compliance: ideal_profile.ppa_compliance,
                  } : undefined}
                />
              </div>
            </div>

            {/* Center - HPTI & Interactions */}
            <div className="space-y-6">
              {/* HPTI Chart */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                <div className="mb-4">
                  <ThomasProductLabel 
                    product="HPTI" 
                    title="HPTI Leadership Traits" 
                    size="sm"
                  />
                </div>
                <HPTIBarChart
                  data={{
                    conscientiousness: candidate.hpti_conscientiousness,
                    adjustment: candidate.hpti_adjustment,
                    curiosity: candidate.hpti_curiosity,
                    risk_approach: 65, // Placeholder
                    ambiguity_acceptance: 70, // Placeholder
                    competitiveness: 60, // Placeholder
                  }}
                />
              </div>

              {/* AI Summary */}
              {interactionSummary && (
                <div className="bg-gradient-to-br from-thomas-orange/5 to-thomas-slate/5 rounded-2xl border border-thomas-orange/20 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-thomas-orange" />
                      <h3 className="text-lg font-display font-semibold text-slate-800">AI Interview Summary</h3>
                    </div>
                    <AskThomBadge context="interview-summary" size="sm" />
                  </div>
                  <p className="text-slate-600 leading-relaxed">{interactionSummary}</p>
                </div>
              )}
            </div>

            {/* Right - Interactions */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-display font-semibold text-slate-800">
                    Interview Timeline ({interactions.length})
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
                {interactions.map((interaction, idx) => (
                  <div key={interaction.interaction_id} className="px-6 py-5 hover:bg-slate-50/50 transition-colors">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold',
                          interaction.score >= 85 ? 'bg-gradient-to-br from-success to-success/80' :
                          interaction.score >= 70 ? 'bg-gradient-to-br from-thomas-orange to-thomas-orange/80' :
                          'bg-gradient-to-br from-warning to-warning/80'
                        )}>
                          {interaction.score}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{interaction.stage}</p>
                          <p className="text-sm text-slate-500">
                            {interaction.interviewer_name || 'Interview Panel'} • {interaction.duration_minutes || 45} min • {interaction.date}
                          </p>
                        </div>
                      </div>
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        interaction.recommendation === 'Strong Hire' && 'bg-success/10 text-success border border-success/20',
                        interaction.recommendation === 'Hire' && 'bg-thomas-orange/10 text-thomas-orange border border-thomas-orange/20',
                        interaction.recommendation === 'Lean Hire' && 'bg-amber-50 text-amber-600 border border-amber-200',
                        interaction.recommendation === 'No Hire' && 'bg-danger/10 text-danger border border-danger/20',
                        interaction.recommendation === 'Needs Discussion' && 'bg-purple-50 text-purple-600 border border-purple-200'
                      )}>
                        {interaction.recommendation}
                      </span>
                    </div>
                    
                    {/* Notes */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-3">
                      <p className="text-sm text-slate-700 leading-relaxed">{interaction.notes}</p>
                    </div>
                    
                    {/* Document Links */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {interaction.summary_url && (
                        <a 
                          href={interaction.summary_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Summary Notes
                        </a>
                      )}
                      {interaction.transcript_url && (
                        <a 
                          href={interaction.transcript_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          Full Transcript
                        </a>
                      )}
                      {interaction.recording_url && (
                        <a 
                          href={interaction.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Recording
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Pre-Offer Insights Section */}
          <div id="insights-section" className="mt-8">
            <CandidateInsightsView data={candidateInsights} loading={insightsLoading} />
          </div>
          
          {/* Bias Pitfalls Section - Private to Interviewer */}
          <div id="bias-section" className="mt-8">
            <BiasPitfallsView data={biasPitfalls} loading={biasLoading} />
          </div>
          </>
        )}

        {/* Weights Tab */}
        {activeTab === 'weights' && (
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-thomas-orange/20 to-thomas-slate/10 flex items-center justify-center">
                    <SlidersHorizontal className="w-6 h-6 text-thomas-slate" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-800">Scoring Weight Adjustment</h3>
                    <p className="text-slate-500 text-sm">Customize how each assessment factor contributes to the candidate's overall score</p>
                  </div>
                </div>
                <PoweredByThomas service="connect" size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Weight Controls */}
              <div className="col-span-2 bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-display font-semibold text-slate-800">Assessment Weights</h4>
                  <div className={clsx(
                    'px-3 py-1.5 rounded-full text-sm font-medium',
                    Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 0.01
                      ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success'
                  )}>
                    Total: {(Object.values(weights).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[
                    { key: 'coding', label: 'Coding Assessment', icon: '💻', color: 'from-blue-500 to-blue-600', desc: 'Technical coding challenges' },
                    { key: 'technical', label: 'Technical Interview', icon: '🎯', color: 'from-purple-500 to-purple-600', desc: 'System design & problem solving' },
                    { key: 'ppa', label: 'PPA (Behavioral)', icon: '🧠', color: 'from-teal-500 to-teal-600', desc: 'DISC behavioral profile' },
                    { key: 'gia', label: 'GIA (Cognitive)', icon: '⚡', color: 'from-amber-500 to-amber-600', desc: 'General intelligence assessment' },
                    { key: 'hpti', label: 'HPTI (Leadership)', icon: '👑', color: 'from-rose-500 to-rose-600', desc: 'Leadership potential traits' },
                  ].map(({ key, label, icon, color, desc }) => {
                    const value = weights[key as keyof typeof weights] * 100
                    return (
                      <div key={key} className="group">
                        <div className="flex items-center gap-4 mb-2">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg shadow-sm`}>
                            {icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-800">{label}</p>
                                <p className="text-xs text-slate-400">{desc}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setWeights({ ...weights, [key]: Math.max(0, weights[key as keyof typeof weights] - 0.05) })}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                >
                                  −
                                </button>
                                <span className="w-14 text-center text-lg font-bold text-thomas-slate">{value.toFixed(0)}%</span>
                                <button
                                  onClick={() => setWeights({ ...weights, [key]: Math.min(1, weights[key as keyof typeof weights] + 0.05) })}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-14">
                          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`absolute h-full bg-gradient-to-r ${color} rounded-full transition-all duration-300`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => setWeights({ ...weights, [key]: parseInt(e.target.value) / 100 })}
                            className="w-full h-2 mt-1 opacity-0 cursor-pointer absolute"
                            style={{ marginTop: '-10px' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Weight Warning */}
                {Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 0.01 && (
                  <div className="mt-6 p-4 bg-warning/5 border border-warning/20 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">⚠️</span>
                    </div>
                    <div>
                      <p className="font-medium text-warning">Weights don't sum to 100%</p>
                      <p className="text-sm text-slate-500">Adjust weights to total exactly 100% for accurate scoring</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Score Summary */}
              <div className="space-y-6">
                {/* Total Score Card */}
                <div className="bg-gradient-to-br from-thomas-slate via-thomas-slate-dark to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-thomas-orange/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative">
                    <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Weighted Total Score</p>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-5xl font-display font-bold">{weightedScore.toFixed(1)}</span>
                      <span className="text-white/50 text-lg mb-2">/ 100</span>
                    </div>
                    
                    {/* Score Ring */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                          <circle 
                            cx="32" cy="32" r="28" fill="none" 
                            stroke="url(#scoreGradient)" 
                            strokeWidth="6" 
                            strokeLinecap="round"
                            strokeDasharray={`${weightedScore * 1.76} 176`}
                          />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#00BCD4" />
                              <stop offset="100%" stopColor="#4CAF50" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div>
                        <p className={clsx(
                          'font-semibold',
                          weightedScore >= 80 ? 'text-success' : weightedScore >= 60 ? 'text-thomas-orange' : 'text-warning'
                        )}>
                          {weightedScore >= 80 ? 'Excellent Match' : weightedScore >= 60 ? 'Good Fit' : 'Needs Review'}
                        </p>
                        <p className="text-white/50 text-sm">Based on weighted criteria</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                  <h4 className="font-display font-semibold text-slate-800 mb-4">Score Breakdown</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Coding', value: 80, weight: weights.coding, color: 'bg-blue-500' },
                      { label: 'Technical', value: 75, weight: weights.technical, color: 'bg-purple-500' },
                      { label: 'PPA', value: ppaAvg, weight: weights.ppa, color: 'bg-teal-500' },
                      { label: 'GIA', value: (candidate.gia_score / 130) * 100, weight: weights.gia, color: 'bg-amber-500' },
                      { label: 'HPTI', value: hptiAvg, weight: weights.hpti, color: 'bg-rose-500' },
                    ].map(({ label, value, weight, color }) => {
                      const contribution = value * weight
                      return (
                        <div key={label} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${color}`} />
                          <span className="text-sm text-slate-600 w-20">{label}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${color} rounded-full transition-all`}
                              style={{ width: `${Math.min(100, contribution)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 w-12 text-right">
                            +{contribution.toFixed(1)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Total</span>
                    <span className="text-lg font-bold text-thomas-slate">{weightedScore.toFixed(1)} pts</span>
                  </div>
                </div>

                {/* Save Button */}
                <button className="w-full py-4 bg-gradient-to-r from-thomas-slate to-thomas-orange text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Weight Override
                </button>
                <p className="text-xs text-slate-400 text-center">
                  Your customizations will be logged for HR analytics
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Negotiation Tab */}
        {activeTab === 'negotiation' && (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 gap-8">
              {/* Left - Controls */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8">
                <h3 className="text-xl font-display font-semibold text-slate-800 mb-2">Negotiation Coach</h3>
                <p className="text-slate-500 mb-6">Predict offer acceptance likelihood based on the candidate's psychometric profile.</p>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Proposed Total Compensation</label>
                  <input
                    type="range"
                    min={candidate.expected_salary * 0.8}
                    max={candidate.expected_salary * 1.3}
                    value={proposedTc}
                    onChange={(e) => setProposedTc(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-thomas-orange"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-slate-500">${(candidate.expected_salary * 0.8).toLocaleString()}</span>
                    <span className="text-2xl font-bold text-thomas-orange">${proposedTc.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">${(candidate.expected_salary * 1.3).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleNegotiationAnalysis}
                  className="w-full py-4 bg-gradient-to-r from-thomas-slate to-thomas-orange text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze Offer
                </button>
              </div>

              {/* Right - Results */}
              <div className="space-y-6">
                {negotiationAdvice ? (
                  <>
                    {/* Likelihood Gauge */}
                    <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 text-center">
                      <LikelihoodGauge
                        value={negotiationAdvice.advice.likelihood}
                        label="Predicted Acceptance"
                      />
                    </div>

                    {/* Advice */}
                    <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                      <h4 className="font-semibold text-slate-800 mb-4">🎯 Levers to Pull</h4>
                      <ul className="space-y-2">
                        {negotiationAdvice.advice.levers.map((lever, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600">
                            <span className="text-thomas-orange mt-1">•</span>
                            {lever}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                        <h4 className="font-semibold text-success mb-2">✅ Emphasize</h4>
                        <p className="text-slate-600 text-sm">{negotiationAdvice.advice.emphasize}</p>
                      </div>
                      <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                        <h4 className="font-semibold text-danger mb-2">❌ Avoid</h4>
                        <p className="text-slate-600 text-sm">{negotiationAdvice.advice.avoid}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-thomas-orange/5 to-thomas-slate/5 rounded-2xl border border-thomas-orange/20 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-thomas-orange" />
                          <h4 className="font-semibold text-slate-800">AI Recommended Approach</h4>
                        </div>
                        <AskThomBadge context="negotiation" size="sm" />
                      </div>
                      <p className="text-slate-600 leading-relaxed">{negotiationAdvice.advice.approach}</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Click "Analyze Offer" to get AI-powered negotiation advice</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
