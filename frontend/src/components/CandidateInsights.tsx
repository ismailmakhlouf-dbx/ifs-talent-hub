import { useState } from 'react'
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Users,
  FileSearch,
  Shield,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  UserCheck,
  FileText
} from 'lucide-react'
import { CandidateInsightsResponse, CandidateHighlight, CandidateLowlight, CandidateCheck } from '../lib/api'
import { PoweredByThomas } from './PoweredByThomas'
import { AskThomBadge } from './AskThom'
import clsx from 'clsx'

// Action type icons
const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'additional_interview': Users,
  'reference_check': FileSearch,
  'verification': Shield,
  'internal_approval': FileText,
}

interface CandidateInsightsViewProps {
  data: CandidateInsightsResponse | null
  loading?: boolean
}

export function CandidateInsightsView({ data, loading }: CandidateInsightsViewProps) {
  const [expandedSection, setExpandedSection] = useState<'highlights' | 'lowlights' | 'checks' | null>(null)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <div className="animate-spin w-5 h-5 border-2 border-thomas-orange border-t-transparent rounded-full" />
          <span className="text-sm">Generating candidate insights...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const getRecommendationBadge = () => {
    switch (data.overall_recommendation) {
      case 'strong_yes':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl">
            <Star className="w-5 h-5" />
            <span className="font-semibold">Strong Recommendation</span>
          </div>
        )
      case 'yes':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-thomas-orange/10 text-thomas-orange rounded-xl">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Recommended</span>
          </div>
        )
      case 'needs_review':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning rounded-xl">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Needs Review</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-thomas-orange to-thomas-navy flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-800">Pre-Offer Assessment</h3>
              <p className="text-xs text-slate-500">AI-generated insights for {data.candidate_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getRecommendationBadge()}
            <AskThomBadge context="candidate-assessment" size="sm" />
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-success">{data.summary.total_highlights}</p>
              <p className="text-[10px] text-slate-500 uppercase">Highlights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
            <div>
              <p className="text-lg font-bold text-danger">{data.summary.total_lowlights}</p>
              <p className="text-[10px] text-slate-500 uppercase">Lowlights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold text-warning">{data.summary.pending_checks}</p>
              <p className="text-[10px] text-slate-500 uppercase">To Check</p>
            </div>
          </div>
        </div>
        
        {/* Recommendation text */}
        <p className="text-sm text-slate-600 mt-4 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
          {data.recommendation_text}
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Highlights Section */}
        <div className="rounded-xl border border-success/20 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'highlights' ? null : 'highlights')}
            className="w-full flex items-center justify-between px-5 py-4 bg-success/5 hover:bg-success/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-success">Highlights</h4>
                <p className="text-xs text-slate-500">
                  {data.summary.high_impact_highlights} high impact • {data.summary.total_highlights} total
                </p>
              </div>
            </div>
            {expandedSection === 'highlights' ? (
              <ChevronUp className="w-5 h-5 text-success" />
            ) : (
              <ChevronDown className="w-5 h-5 text-success" />
            )}
          </button>
          
          {expandedSection === 'highlights' && (
            <div className="p-4 bg-success/5 border-t border-success/20 space-y-3">
              {data.highlights.map((highlight, i) => (
                <HighlightCard key={i} highlight={highlight} />
              ))}
            </div>
          )}
        </div>

        {/* Lowlights Section */}
        <div className="rounded-xl border border-danger/20 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'lowlights' ? null : 'lowlights')}
            className="w-full flex items-center justify-between px-5 py-4 bg-danger/5 hover:bg-danger/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-danger flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-danger">Lowlights</h4>
                <p className="text-xs text-slate-500">
                  {data.summary.high_severity_lowlights} high severity • {data.summary.total_lowlights} total
                </p>
              </div>
            </div>
            {expandedSection === 'lowlights' ? (
              <ChevronUp className="w-5 h-5 text-danger" />
            ) : (
              <ChevronDown className="w-5 h-5 text-danger" />
            )}
          </button>
          
          {expandedSection === 'lowlights' && (
            <div className="p-4 bg-danger/5 border-t border-danger/20 space-y-3">
              {data.lowlights.map((lowlight, i) => (
                <LowlightCard key={i} lowlight={lowlight} />
              ))}
            </div>
          )}
        </div>

        {/* Things to Check Section */}
        <div className="rounded-xl border border-warning/20 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'checks' ? null : 'checks')}
            className="w-full flex items-center justify-between px-5 py-4 bg-warning/5 hover:bg-warning/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-warning">Things to Check</h4>
                <p className="text-xs text-slate-500">
                  {data.summary.high_priority_checks} high priority • {data.summary.pending_checks} pending
                </p>
              </div>
            </div>
            {expandedSection === 'checks' ? (
              <ChevronUp className="w-5 h-5 text-warning" />
            ) : (
              <ChevronDown className="w-5 h-5 text-warning" />
            )}
          </button>
          
          {expandedSection === 'checks' && (
            <div className="p-4 bg-warning/5 border-t border-warning/20 space-y-3">
              {data.things_to_check.map((check, i) => (
                <CheckCard key={i} check={check} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Generated from: {data.sources.join(', ')}</span>
        </div>
        <PoweredByThomas service="insights" size="xs" />
      </div>
    </div>
  )
}

// Individual card components
function HighlightCard({ highlight }: { highlight: CandidateHighlight }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-success/20">
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          highlight.impact === 'high' ? 'bg-success text-white' : 'bg-success/20 text-success'
        )}>
          <CheckCircle className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold text-slate-800">{highlight.title}</h5>
            <span className={clsx(
              'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
              highlight.impact === 'high' ? 'bg-success/20 text-success' : 'bg-slate-100 text-slate-600'
            )}>
              {highlight.impact}
            </span>
          </div>
          <p className="text-sm text-slate-600">{highlight.description}</p>
          <p className="text-xs text-success/70 mt-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Source: {highlight.source}
          </p>
        </div>
      </div>
    </div>
  )
}

function LowlightCard({ lowlight }: { lowlight: CandidateLowlight }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-danger/20">
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          lowlight.severity === 'high' ? 'bg-danger text-white' : 'bg-danger/20 text-danger'
        )}>
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold text-slate-800">{lowlight.title}</h5>
            <span className={clsx(
              'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
              lowlight.severity === 'high' ? 'bg-danger/20 text-danger' : 
              lowlight.severity === 'medium' ? 'bg-warning/20 text-warning' :
              'bg-slate-100 text-slate-600'
            )}>
              {lowlight.severity}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">{lowlight.description}</p>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Recommendation</p>
            <p className="text-sm text-slate-700">{lowlight.recommendation}</p>
          </div>
          <p className="text-xs text-danger/70 mt-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Source: {lowlight.source}
          </p>
        </div>
      </div>
    </div>
  )
}

function CheckCard({ check }: { check: CandidateCheck }) {
  const ActionIcon = ACTION_ICONS[check.action_type] || AlertCircle
  
  return (
    <div className="bg-white rounded-xl p-4 border border-warning/20">
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          check.priority === 'high' ? 'bg-warning text-white' : 'bg-warning/20 text-warning'
        )}>
          <ActionIcon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold text-slate-800">{check.title}</h5>
            <span className={clsx(
              'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
              check.priority === 'high' ? 'bg-warning/20 text-warning' : 
              check.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            )}>
              {check.priority} priority
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">{check.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Stakeholders:</span>
            <div className="flex flex-wrap gap-1">
              {check.stakeholders.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact summary badge for headers
interface InsightsSummaryBadgeProps {
  highlights: number
  lowlights: number
  checks: number
  onClick?: () => void
}

export function InsightsSummaryBadge({ highlights, lowlights, checks, onClick }: InsightsSummaryBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-1">
        <CheckCircle className="w-4 h-4 text-success" />
        <span className="font-semibold text-success">{highlights}</span>
      </div>
      <div className="w-px h-4 bg-slate-300" />
      <div className="flex items-center gap-1">
        <AlertTriangle className="w-4 h-4 text-danger" />
        <span className="font-semibold text-danger">{lowlights}</span>
      </div>
      <div className="w-px h-4 bg-slate-300" />
      <div className="flex items-center gap-1">
        <AlertCircle className="w-4 h-4 text-warning" />
        <span className="font-semibold text-warning">{checks}</span>
      </div>
    </button>
  )
}

export default CandidateInsightsView
