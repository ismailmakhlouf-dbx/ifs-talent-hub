import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  Sparkles, 
  ExternalLink,
  Linkedin,
  Github,
  Youtube,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  Play
} from 'lucide-react'
import { recruitmentApi, Referral, ReferralAIInsights } from '../lib/api'
import { PPARadarChart } from '../components/Charts'
import { ThomasProductLabel } from '../components/ThomasProductBadge'
import { AskThomBadge, AskThomChat } from '../components/AskThom'
import { PoweredByThomas, PoweredByInline } from '../components/PoweredByThomas'
import { CVViewer } from '../components/CVViewer'
import clsx from 'clsx'

export default function Referrals() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [aiInsights, setAiInsights] = useState<ReferralAIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [extracting, setExtracting] = useState(false)
  const [showCVViewer, setShowCVViewer] = useState(false)
  const [showAskThom, setShowAskThom] = useState(false)

  useEffect(() => {
    recruitmentApi.getReferrals()
      .then(setReferrals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelectReferral = async (referral: Referral) => {
    setSelectedReferral(referral)
    setAiInsights(null)
    
    // Load existing insights if available
    if (referral.ai_enriched) {
      try {
        const details = await recruitmentApi.getReferralDetails(referral.referral_id)
        if (details.ai_insights) {
          setAiInsights(details.ai_insights)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleExtractInsights = async () => {
    if (!selectedReferral) return
    
    setExtracting(true)
    try {
      const response = await recruitmentApi.extractReferralInsights(selectedReferral.referral_id)
      setAiInsights(response.insights)
      setSelectedReferral(response.referral)
      
      // Update in list
      setReferrals(prev => prev.map(r => 
        r.referral_id === response.referral.referral_id ? response.referral : r
      ))
    } catch (e) {
      console.error(e)
    } finally {
      setExtracting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI Enriched':
        return (
          <span className="px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            AI Enriched
          </span>
        )
      case 'Under Review':
        return (
          <span className="px-2.5 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Under Review
          </span>
        )
      case 'CV Uploaded':
        return (
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 text-xs font-medium rounded-full flex items-center gap-1">
            <FileText className="w-3 h-3" />
            CV Uploaded
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            New
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-thomas-orange border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-800">Referrals</h1>
              <p className="text-slate-500">Review referred candidates and extract AI insights from CVs</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Referrals List */}
          <div className="col-span-4 bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-display font-semibold text-slate-800">
                Referral Candidates ({referrals.length})
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[calc(100vh-250px)] overflow-y-auto">
              {referrals.map(referral => (
                <div
                  key={referral.referral_id}
                  onClick={() => handleSelectReferral(referral)}
                  className={clsx(
                    'p-4 cursor-pointer transition-all hover:bg-slate-50',
                    selectedReferral?.referral_id === referral.referral_id && 'bg-thomas-orange/5 border-l-4 border-thomas-orange'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{referral.name}</h3>
                      <p className="text-sm text-slate-500">{referral.role_title}</p>
                    </div>
                    {getStatusBadge(referral.status)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {referral.cv_filename}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>Referred by {referral.referred_by_name}</span>
                    <span>•</span>
                    <span>{new Date(referral.referral_date).toLocaleDateString()}</span>
                  </div>
                  
                  {referral.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {referral.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {referral.skills.length > 3 && (
                        <span className="text-xs text-slate-400">+{referral.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Referral Detail */}
          <div className="col-span-8 space-y-6">
            {selectedReferral ? (
              <>
                {/* Referral Header Card */}
                <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedReferral.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-bold text-slate-800">{selectedReferral.name}</h2>
                        <p className="text-slate-500">{selectedReferral.current_title || selectedReferral.role_title}</p>
                        <p className="text-sm text-slate-400">
                          {selectedReferral.current_company && `at ${selectedReferral.current_company} • `}
                          {selectedReferral.city}, {selectedReferral.country}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {selectedReferral.cv_url && (
                        <button
                          onClick={() => setShowCVViewer(true)}
                          className="px-4 py-2.5 bg-white border-2 border-thomas-slate text-thomas-slate font-medium rounded-card hover:bg-thomas-slate hover:text-white transition-all flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 icon-light" />
                          View CV
                        </button>
                      )}
                      
                      {!selectedReferral.ai_enriched && (
                        <button
                          onClick={handleExtractInsights}
                          disabled={extracting}
                          className="px-5 py-2.5 bg-gradient-to-r from-thomas-orange to-thomas-slate text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {extracting ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                              Extracting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Extract AI Insights
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-thomas-slate">
                        {selectedReferral.years_experience || '—'}
                      </p>
                      <p className="text-xs text-slate-500">Years Exp.</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-thomas-slate">
                        {selectedReferral.skills.length || '—'}
                      </p>
                      <p className="text-xs text-slate-500">Skills</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-thomas-slate">
                        {selectedReferral.education || '—'}
                      </p>
                      <p className="text-xs text-slate-500">Education</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      {getStatusBadge(selectedReferral.status)}
                      <p className="text-xs text-slate-500 mt-1">Status</p>
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  {(selectedReferral.linkedin_url || selectedReferral.github_url) && (
                    <div className="flex items-center gap-3 mt-4">
                      {selectedReferral.linkedin_url && (
                        <a
                          href={selectedReferral.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedReferral.github_url && (
                        <a
                          href={selectedReferral.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* AI Insights Section */}
                {aiInsights ? (
                  <AIInsightsView insights={aiInsights} selectedReferral={selectedReferral} />
                ) : (
                  !extracting && (
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 border-dashed border-purple-200 p-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-display font-semibold text-slate-700 mb-2">
                        Extract AI Insights
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Click "Extract AI Insights" to analyse the CV, crawl LinkedIn, GitHub, and other sources to build a comprehensive candidate profile.
                      </p>
                      <button
                        onClick={handleExtractInsights}
                        className="px-6 py-3 bg-gradient-to-r from-thomas-orange to-thomas-slate text-white font-semibold rounded-xl hover:shadow-glow transition-all inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Extract AI Insights
                      </button>
                    </div>
                  )
                )}

                {extracting && (
                  <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-12 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-purple-200 rounded-full" />
                      <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <div className="absolute inset-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-semibold text-slate-700 mb-2">
                      Extracting AI Insights...
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Parsing CV, crawling LinkedIn, GitHub, YouTube, and other sources...
                    </p>
                    <div className="flex justify-center gap-8 mt-6 text-sm text-slate-400">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        CV Parsed
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-thomas-orange rounded-full animate-pulse" />
                        LinkedIn...
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                        GitHub
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/50 rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-display font-semibold text-slate-600 mb-2">
                  Select a Referral
                </h3>
                <p className="text-slate-500">
                  Click on a referral candidate to view details and extract AI insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* CV Viewer Modal */}
      {showCVViewer && selectedReferral && (
        <CVViewer
          referralId={selectedReferral.referral_id}
          candidateName={selectedReferral.name}
          onClose={() => setShowCVViewer(false)}
        />
      )}
      
      {/* Floating AskThom Button - Visible when candidate selected */}
      {selectedReferral && !showAskThom && (
        <button
          onClick={() => setShowAskThom(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-thomas-orange to-thomas-pink text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Sparkles className="w-5 h-5" />
          Ask about {selectedReferral.name.split(' ')[0]}
        </button>
      )}
      
      {/* AskThom Chat */}
      {showAskThom && selectedReferral && (
        <AskThomChat
          context="referral-candidate"
          contextData={{
            candidateName: selectedReferral.name,
            role: selectedReferral.role_title,
            company: selectedReferral.current_company,
            yearsExperience: selectedReferral.years_experience,
            skills: selectedReferral.skills,
            status: selectedReferral.status,
            aiInsights: aiInsights ? {
              summary: aiInsights.ai_summary?.slice(0, 800),
              predictedPPA: aiInsights.predicted_assessments?.ppa,
              predictedGIA: aiInsights.predicted_assessments?.gia_estimated?.percentile,
              skills: aiInsights.cv_insights?.skills,
              linkedinHighlights: aiInsights.linkedin_insights?.activity_highlights,
            } : undefined,
          }}
          onClose={() => setShowAskThom(false)}
        />
      )}
    </div>
  )
}

// AI Insights Rich View Component
function AIInsightsView({ insights, selectedReferral }: { insights: ReferralAIInsights, selectedReferral: Referral | null }) {
  return (
    <div className="space-y-6">
      {/* Predicted Thomas Assessments - MOVED TO TOP */}
      <div className="bg-white rounded-card shadow-card border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-thomas-slate to-thomas-slate-light px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-thomas-orange ai-sparkle" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white">Predicted Psychometric Profile</h3>
                <p className="text-xs text-white/60">Based on communication style and public content</p>
              </div>
            </div>
            <AskThomBadge 
              context="psychometric-prediction" 
              size="sm" 
              contextData={{
                candidateName: selectedReferral?.name,
                role: selectedReferral?.role_title,
                yearsExperience: insights?.cv_insights?.years_experience,
                skills: insights?.cv_insights?.skills,
                predictedPPA: insights?.predicted_assessments?.ppa,
                predictedGIA: insights?.predicted_assessments?.gia_estimated?.percentile,
              }}
            />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* PPA Radar */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-medium text-thomas-slate mb-3 text-center">PPA (Predicted)</h4>
              <PPARadarChart 
                data={{
                  dominance: insights.predicted_assessments.ppa.dominance,
                  influence: insights.predicted_assessments.ppa.influence,
                  steadiness: insights.predicted_assessments.ppa.steadiness,
                  compliance: insights.predicted_assessments.ppa.compliance,
                }}
              />
              <p className="text-xs text-slate-500 text-center mt-2">
                Confidence: {insights.predicted_assessments.ppa.confidence}%
              </p>
            </div>
            
            {/* GIA Estimate */}
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center">
              <h4 className="font-medium text-thomas-slate mb-3">GIA (Estimated)</h4>
              <p className="text-5xl font-display font-bold text-thomas-orange">
                {insights.predicted_assessments.gia_estimated.percentile}
              </p>
              <p className="text-sm text-slate-500">Percentile</p>
              <p className="text-xs text-slate-400 mt-2">
                Confidence: {insights.predicted_assessments.gia_estimated.confidence}%
              </p>
              <p className="text-xs text-slate-500 mt-2 text-center italic">
                {insights.predicted_assessments.gia_estimated.note}
              </p>
            </div>
            
            {/* HPTI Predicted */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-medium text-thomas-slate mb-3 text-center">HPTI (Predicted)</h4>
              <div className="space-y-2">
                {Object.entries(insights.predicted_assessments.hpti_predicted)
                  .filter(([key]) => !['confidence', 'note'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 w-28 capitalize">{key.replace('_', ' ')}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-thomas-orange rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-thomas-slate w-10">{value}%</span>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                Confidence: {insights.predicted_assessments.hpti_predicted.confidence}%
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-thomas-orange/5 to-thomas-slate/5 rounded-card border border-thomas-orange/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-thomas-orange ai-sparkle" />
              <span className="text-sm font-semibold text-thomas-slate">Note</span>
            </div>
            <p className="text-sm text-text-secondary">
              These predictions are based on AI analysis of the candidate's communication style, career trajectory, and public content. 
              For accurate assessments, we recommend completing the official Thomas International assessments.
            </p>
          </div>
        </div>
      </div>

      {/* AI Summary - Properly Formatted */}
      <div className="bg-white rounded-card shadow-card border border-slate-200 overflow-hidden">
        <div className="bg-thomas-slate px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-thomas-orange ai-sparkle" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white">AI Executive Summary</h3>
                <p className="text-xs text-white/60">Generated from CV and web sources</p>
              </div>
            </div>
            <AskThomBadge 
              context="candidate-analysis" 
              size="sm" 
              contextData={{
                candidateName: selectedReferral?.name,
                role: selectedReferral?.role_title,
                company: selectedReferral?.current_company,
                yearsExperience: insights?.cv_insights?.years_experience,
                skills: insights?.cv_insights?.skills,
                summary: insights?.ai_summary?.slice(0, 500),
                linkedinHighlights: insights?.linkedin_insights?.activity_highlights,
                workHistory: insights?.work_history,
              }}
            />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Parse and format the AI summary */}
          {insights.ai_summary.split('\n\n').map((section, i) => {
            const isHeader = section.startsWith('**') && section.includes(':**');
            const isBulletList = section.includes('•');
            
            if (isHeader && isBulletList) {
              // Section with header and bullets
              const [headerLine, ...bulletLines] = section.split('\n');
              const header = headerLine.replace(/\*\*/g, '').replace(':', '');
              return (
                <div key={i}>
                  <h4 className="font-semibold text-thomas-slate mb-2">{header}</h4>
                  <ul className="space-y-1.5 ml-1">
                    {bulletLines.filter(b => b.trim()).map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-thomas-orange mt-2 flex-shrink-0" />
                        <span>{bullet.replace('•', '').trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else if (isHeader) {
              // Header-only section (like Thomas Profile Prediction)
              const content = section.replace(/\*\*(.*?)\*\*/g, '<strong class="text-thomas-slate">$1</strong>');
              return (
                <div key={i} className="text-sm text-text-primary" 
                  dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} 
                />
              );
            } else {
              // Regular paragraph
              const content = section.replace(/\*\*(.*?)\*\*/g, '<strong class="text-thomas-slate">$1</strong>');
              return (
                <p key={i} className="text-sm text-text-primary leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              );
            }
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Work History */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-thomas-slate" />
            <h3 className="font-display font-semibold text-slate-800">Work History</h3>
          </div>
          
          <div className="space-y-4">
            {insights.work_history.map((job, i) => (
              <div key={i} className={clsx(
                'relative pl-6 pb-4',
                i < insights.work_history.length - 1 && 'border-l-2 border-slate-200'
              )}>
                <div className={clsx(
                  'absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-[7px]',
                  job.current ? 'bg-success' : 'bg-slate-300'
                )} />
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-800">{job.title}</h4>
                  {job.current && (
                    <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{job.company}</p>
                <p className="text-xs text-slate-400 mb-2">{job.duration}</p>
                <ul className="space-y-1">
                  {job.highlights.map((h, j) => (
                    <li key={j} className="text-xs text-slate-500 flex items-start gap-1">
                      <ChevronRight className="w-3 h-3 mt-0.5 text-thomas-orange flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-warning" />
              <h3 className="font-display font-semibold text-slate-800">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.cv_insights.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-thomas-orange/10 to-thomas-slate/10 text-thomas-slate text-sm font-medium rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-display font-semibold text-slate-800">Certifications</h3>
            </div>
            <div className="space-y-2">
              {insights.cv_insights.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-success" />
                  {cert}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="font-display font-semibold text-slate-800">Education</h3>
            </div>
            {insights.cv_insights.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="font-medium text-slate-700">{edu.degree} {edu.field}</p>
                <p className="text-sm text-slate-500">{edu.institution}, {edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LinkedIn Insights */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-600" />
            <h3 className="font-display font-semibold text-slate-800">LinkedIn Insights</h3>
            <PoweredByThomas service="insights" size="xs" />
          </div>
          <a
            href={insights.linkedin_insights.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            View Profile <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{insights.linkedin_insights.connections.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Connections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{insights.linkedin_insights.followers.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{insights.linkedin_insights.recommendations_count}</p>
            <p className="text-xs text-slate-500">Recommendations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{insights.linkedin_insights.posts_last_month}</p>
            <p className="text-xs text-slate-500">Posts/Month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Featured Recommendations</h4>
            {insights.linkedin_insights.featured_recommendations.map((rec, i) => (
              <p key={i} className="text-sm text-slate-500 italic bg-slate-50 rounded-lg p-3 mb-2">
                {rec}
              </p>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Recent Activity</h4>
            {insights.linkedin_insights.activity_highlights.map((act, i) => (
              <p key={i} className="text-sm text-slate-500 flex items-start gap-2 mb-2">
                <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                {act}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* GitHub Insights (if available) */}
      {insights.github_insights && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-slate-800" />
              <h3 className="font-display font-semibold text-slate-800">GitHub Insights</h3>
              <PoweredByThomas service="insights" size="xs" />
            </div>
            <a
              href={insights.github_insights.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:underline flex items-center gap-1"
            >
              View Profile <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{insights.github_insights.public_repos}</p>
              <p className="text-xs text-slate-500">Repositories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{insights.github_insights.stars_received}</p>
              <p className="text-xs text-slate-500">Stars Received</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{insights.github_insights.contributions_last_year}</p>
              <p className="text-xs text-slate-500">Contributions/Year</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-600">{insights.github_insights.followers}</p>
              <p className="text-xs text-slate-500">Followers</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {insights.github_insights.top_languages.map((lang, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg">
                {lang}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-600">Notable Repositories</h4>
            {insights.github_insights.notable_repos.map((repo, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{repo.name}</p>
                  <p className="text-xs text-slate-500">{repo.description}</p>
                </div>
                <div className="flex items-center gap-1 text-warning">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{repo.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speaking Engagements */}
      {insights.speaking_engagements.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Youtube className="w-5 h-5 text-danger" />
            <h3 className="font-display font-semibold text-slate-800">Speaking Engagements</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {insights.speaking_engagements.map((talk, i) => (
              <a
                key={i}
                href={talk.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-video bg-slate-200">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {talk.views.toLocaleString()} views
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-slate-800 text-sm line-clamp-2">{talk.title}</p>
                  <p className="text-xs text-slate-500">{talk.event} • {talk.year}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts */}
      {insights.blog_posts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <h3 className="font-display font-semibold text-slate-800">Published Articles</h3>
          </div>
          
          <div className="space-y-3">
            {insights.blog_posts.map((post, i) => (
              <a
                key={i}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{post.title}</p>
                  <p className="text-sm text-slate-500">{post.platform} • {new Date(post.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-teal-600 font-medium">👏 {post.claps}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
