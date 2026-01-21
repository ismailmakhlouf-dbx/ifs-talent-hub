import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  Star,
  AlertTriangle
} from 'lucide-react'
import { performanceApi, aiApi, EmployeeDetails, PerformanceSummary, LeadershipPotential, ChurnRecommendation, EmployeeTeamCollaboration } from '../lib/api'
import { PPARadarChart, HPTIBarChart, PerformanceTrendChart } from '../components/Charts'
import { ChurnRiskBadge } from '../components/StatusBadge'
import { CircularProgress } from '../components/ProgressBar'
import { AskThomBadge } from '../components/AskThom'
import { EmployeeTeamCollaborationView } from '../components/TeamCollaboration'
import { ThomasProductLabel } from '../components/ThomasProductBadge'
import { PoweredByThomas, PoweredByInline } from '../components/PoweredByThomas'
import { usePageContext } from '../contexts/PageContext'
import clsx from 'clsx'

export default function EmployeeDetail() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { setPageContext } = usePageContext()
  const [data, setData] = useState<EmployeeDetails | null>(null)
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null)
  const [leadershipPotential, setLeadershipPotential] = useState<LeadershipPotential | null>(null)
  const [churnRecommendation, setChurnRecommendation] = useState<ChurnRecommendation | null>(null)
  const [teamCollaboration, setTeamCollaboration] = useState<EmployeeTeamCollaboration | null>(null)
  const [loading, setLoading] = useState(true)

  // Update page context for AskThom - include full employee details
  useEffect(() => {
    if (data) {
      const perfHistory = Array.isArray(data.performance_history) ? data.performance_history : []
      const assessmentsList = Array.isArray(data.assessments) ? data.assessments : []
      const latestPerf = perfHistory.find(p => p.quarter === '2024-Q4')
      const assessment = assessmentsList[0]
      
      // Debug: Log that we're setting context
      console.log('EmployeeDetail: Setting page context for', data.employee.name)
      
      setPageContext({
        pageName: 'Employee Detail',
        pageDescription: `Currently viewing the profile of ${data.employee.name}`,
        // Explicitly state who the user is viewing
        currentlyViewingEmployee: data.employee.name,
        employeeId: data.employee.employee_id,
        // Full employee details
        employee: {
          id: data.employee.employee_id,
          fullName: data.employee.name,
          title: data.employee.title,
          department: data.employee.department,
          location: data.employee.location,
          tenureMonths: data.employee.tenure_months,
          isManager: data.employee.is_manager
        },
        // Performance data
        performance: {
          score: latestPerf?.performance_score || null,
          moraleScore: latestPerf?.morale_score || null,
          churnRisk: latestPerf?.churn_risk || null,
          quarter: latestPerf?.quarter || null,
          slackSentiment: latestPerf?.slack_sentiment || null
        },
        // Psychometric assessments
        thomasAssessments: assessment ? {
          ppa: {
            dominance: assessment.ppa_dominance,
            influence: assessment.ppa_influence,
            steadiness: assessment.ppa_steadiness,
            compliance: assessment.ppa_compliance
          },
          gia: assessment.gia_overall,
          hpti: {
            conscientiousness: assessment.hpti_conscientiousness,
            adjustment: assessment.hpti_adjustment,
            curiosity: assessment.hpti_curiosity,
            riskApproach: assessment.hpti_risk_approach,
            ambiguityAcceptance: assessment.hpti_ambiguity_acceptance,
            competitiveness: assessment.hpti_competitiveness
          }
        } : null,
        // Leadership & team data - use the same value shown in the UI header
        leadershipReadiness: perfHistory.find(p => p.quarter === '2024-Q4')?.leadership_readiness || null,
        recommendedNextRole: leadershipPotential?.prediction?.recommended_role || null,
        teamCollaboration: teamCollaboration ? {
          avgChemistryScore: teamCollaboration.summary?.avg_chemistry_score,
          avgRelationshipScore: teamCollaboration.summary?.avg_relationship_score,
          collaboratorsCount: teamCollaboration.summary?.total_collaborators,
          interpersonalFlexibility: teamCollaboration.interpersonal_flexibility?.score
        } : null
      })
    }
  }, [data, leadershipPotential, teamCollaboration, setPageContext])

  useEffect(() => {
    if (!employeeId) return
    
    Promise.all([
      performanceApi.getEmployeeDetails(employeeId),
      aiApi.getPerformanceSummary(employeeId).catch(() => null),
      aiApi.getLeadershipPotential(employeeId).catch(() => null),
      performanceApi.getTeamCollaboration(employeeId).catch(() => null),
    ])
      .then(([employeeData, summaryData, leadershipData, teamData]) => {
        setData(employeeData)
        setPerformanceSummary(summaryData)
        setLeadershipPotential(leadershipData)
        setTeamCollaboration(teamData)
        
        // Get churn recommendation if high risk
        const empPerfHistory = Array.isArray(employeeData.performance_history) ? employeeData.performance_history : []
        const latestPerf = empPerfHistory.find(p => p.quarter === '2024-Q4')
        if (latestPerf && ['High', 'Medium'].includes(latestPerf.churn_risk)) {
          aiApi.getChurnRecommendation(employeeId)
            .then(setChurnRecommendation)
            .catch(console.error)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [employeeId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-thomas-orange border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Employee not found</div>
  }

  const { employee } = data
  const assessments = Array.isArray(data.assessments) ? data.assessments : []
  const performance_history = Array.isArray(data.performance_history) ? data.performance_history : []
  const latestPerformance = performance_history.find(p => p.quarter === '2024-Q4')
  const assessment = assessments[0]

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6">
          <button
            onClick={() => navigate('/performance')}
            className="flex items-center gap-2 text-slate-500 hover:text-thomas-orange transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Performance
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-800">{employee.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-slate-500">
                  <span>{employee.title}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {employee.location}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {employee.tenure_months} months
                  </span>
                </div>
              </div>
            </div>
            {latestPerformance && (
              <div className="flex items-center gap-4">
                <ChurnRiskBadge risk={latestPerformance.churn_risk} />
                <CircularProgress
                  value={latestPerformance.leadership_readiness}
                  label="Leadership"
                  variant={latestPerformance.leadership_readiness >= 70 ? 'success' : 'default'}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Assessment */}
          <div className="space-y-6">
            {/* PPA Chart */}
            {assessment && (
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
                    dominance: assessment.ppa_dominance,
                    influence: assessment.ppa_influence,
                    steadiness: assessment.ppa_steadiness,
                    compliance: assessment.ppa_compliance,
                  }}
                />
              </div>
            )}

            {/* HPTI Chart */}
            {assessment && (
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
                    conscientiousness: assessment.hpti_conscientiousness,
                    adjustment: assessment.hpti_adjustment,
                    curiosity: assessment.hpti_curiosity,
                    risk_approach: assessment.hpti_risk_approach,
                    ambiguity_acceptance: assessment.hpti_ambiguity_acceptance,
                    competitiveness: assessment.hpti_competitiveness,
                  }}
                />
              </div>
            )}
          </div>

          {/* Center Column - Performance & Trend */}
          <div className="space-y-6">
            {/* Performance Trend */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
              <h3 className="text-lg font-display font-semibold text-slate-800 mb-4">Performance Trend</h3>
              <PerformanceTrendChart data={performance_history} />
            </div>

            {/* Key Metrics */}
            {latestPerformance && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Performance</span>
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(latestPerformance.performance_score * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Morale</span>
                    <span className="text-2xl">😊</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {latestPerformance.morale_score}/100
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Slack Sentiment</span>
                    <span className="text-lg">💬</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {latestPerformance.slack_sentiment.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Leadership Ready</span>
                    <Star className="w-4 h-4 text-warning" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {latestPerformance.leadership_readiness}%
                  </p>
                </div>
              </div>
            )}

            {/* AI Performance Summary */}
            {performanceSummary && (
              <div className="bg-gradient-to-br from-thomas-orange/5 to-thomas-slate/5 rounded-2xl border border-thomas-orange/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-thomas-orange" />
                    <h3 className="font-semibold text-slate-800">Q4 Performance Summary</h3>
                  </div>
                  <AskThomBadge context="performance" size="sm" />
                </div>
                <p className="text-slate-600 leading-relaxed">{performanceSummary.summary}</p>
              </div>
            )}
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            {/* Leadership Potential */}
            {leadershipPotential && (
              <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-warning" />
                    <h3 className="text-lg font-display font-semibold text-slate-800">Next Role Readiness</h3>
                  </div>
                  <AskThomBadge context="performance" size="sm" />
                </div>
                
                <div className="text-center mb-6">
                  <CircularProgress
                    value={leadershipPotential.prediction.readiness_score}
                    size={100}
                    strokeWidth={10}
                    variant={leadershipPotential.prediction.readiness_score >= 70 ? 'success' : 'default'}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Recommended Role</p>
                    <p className="font-semibold text-thomas-slate">{leadershipPotential.prediction.recommended_role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Timeline</p>
                    <p className="font-medium text-slate-700">{leadershipPotential.prediction.timeline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Development Focus</p>
                    <ul className="space-y-1">
                      {leadershipPotential.prediction.development_areas.map((area, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-thomas-orange" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Churn Recommendation */}
            {churnRecommendation && (
              <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <h3 className="text-lg font-display font-semibold text-slate-800">Manager Recommendations</h3>
                  </div>
                  <PoweredByThomas service="recommendations" size="xs" />
                </div>
                <div className="prose prose-sm text-slate-600">
                  {churnRecommendation.recommendation.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Collaboration Section */}
        {teamCollaboration && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            <EmployeeTeamCollaborationView data={teamCollaboration} />
          </div>
        )}
      </div>
    </div>
  )
}
