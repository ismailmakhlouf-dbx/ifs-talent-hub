import { useState } from 'react'
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Lock, 
  Shield,
  Users,
  Heart,
  Star,
  CheckCircle,
  Anchor,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb
} from 'lucide-react'
import { BiasPitfall, BiasPitfallsResponse } from '../lib/api'
import clsx from 'clsx'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'users': Users,
  'heart': Heart,
  'star': Star,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  'anchor': Anchor,
  'shuffle': Shuffle,
  'eye': Eye,
  'user': Users,
}

interface BiasPitfallsViewProps {
  data: BiasPitfallsResponse | null
  loading?: boolean
  onRefresh?: () => void
}

export function BiasPitfallsView({ data, loading, onRefresh }: BiasPitfallsViewProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [expandedPitfall, setExpandedPitfall] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border-2 border-dashed border-amber-200 p-6">
        <div className="flex items-center justify-center gap-3 text-amber-600">
          <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
          <span className="text-sm">Analyzing for potential biases...</span>
        </div>
      </div>
    )
  }

  if (!data || data.pitfalls.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800">No Significant Bias Risks Detected</h4>
            <p className="text-sm text-green-600">No obvious similarities that might trigger unconscious bias were found.</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-green-500">
          <Lock className="w-3 h-3" />
          <span>This analysis is private and visible only to you</span>
        </div>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'from-red-500 to-red-600'
      case 'medium': return 'from-amber-500 to-amber-600'
      case 'low': return 'from-blue-500 to-blue-600'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'medium': return 'bg-amber-50 border-amber-200'
      case 'low': return 'bg-blue-50 border-blue-200'
      default: return 'bg-slate-50 border-slate-200'
    }
  }

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-700'
      case 'medium': return 'text-amber-700'
      case 'low': return 'text-blue-700'
      default: return 'text-slate-700'
    }
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 rounded-2xl border border-amber-200 overflow-hidden">
      {/* Header with Privacy Notice */}
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4 border-b border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-800">Bias Awareness Check</h3>
              <p className="text-xs text-amber-700">Personal reminders based on detected similarities</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Privacy Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-amber-200 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Private to You</span>
            </div>
            
            {/* Toggle Visibility */}
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="p-2 rounded-lg hover:bg-amber-200/50 transition-colors"
              title={isVisible ? 'Hide details' : 'Show details'}
            >
              {isVisible ? (
                <EyeOff className="w-5 h-5 text-amber-600" />
              ) : (
                <Eye className="w-5 h-5 text-amber-600" />
              )}
            </button>
          </div>
        </div>
        
        {/* Overall Risk Indicator */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-600">Overall Risk:</span>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
              data.overall_risk === 'high' ? 'bg-red-100 text-red-700' :
              data.overall_risk === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            )}>
              {data.overall_risk}
            </span>
          </div>
          <span className="text-xs text-amber-600">•</span>
          <span className="text-xs text-amber-600">{data.total_detected} similarities detected</span>
          <span className="text-xs text-amber-600">•</span>
          <span className="text-xs text-amber-500">Sources: {data.sources.join(', ')}</span>
        </div>
      </div>

      {isVisible && (
        <div className="p-6">
          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-100 mb-6">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              {data.disclaimer}
            </p>
          </div>

          {/* Pitfalls List */}
          <div className="space-y-4">
            {data.pitfalls.map((pitfall, index) => {
              const IconComponent = ICON_MAP[pitfall.icon] || AlertTriangle
              const isExpanded = expandedPitfall === index
              
              return (
                <div 
                  key={index}
                  className={clsx(
                    'rounded-xl border transition-all',
                    getRiskBgColor(pitfall.risk_level)
                  )}
                >
                  {/* Pitfall Header */}
                  <button
                    onClick={() => setExpandedPitfall(isExpanded ? null : index)}
                    className="w-full p-4 flex items-start gap-4 text-left"
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                      getRiskColor(pitfall.risk_level)
                    )}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={clsx('font-semibold', getRiskTextColor(pitfall.risk_level))}>
                          {pitfall.bias_name}
                        </h4>
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                          pitfall.risk_level === 'high' ? 'bg-red-200/50 text-red-700' :
                          pitfall.risk_level === 'medium' ? 'bg-amber-200/50 text-amber-700' :
                          'bg-blue-200/50 text-blue-700'
                        )}>
                          {pitfall.risk_level} risk
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium">{pitfall.detected_similarity}</p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/50">
                      <div className="pl-14 space-y-4">
                        {/* What we detected */}
                        <div>
                          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            What We Detected
                          </h5>
                          <p className="text-sm text-slate-700">{pitfall.details}</p>
                        </div>
                        
                        {/* About this bias */}
                        <div className="p-3 bg-white/60 rounded-lg">
                          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            About {pitfall.bias_name}
                          </h5>
                          <p className="text-sm text-slate-600">{pitfall.bias_description}</p>
                        </div>
                        
                        {/* Specific advice */}
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                              Specific Advice for This Interview
                            </h5>
                            <p className="text-sm text-slate-700">{pitfall.specific_advice}</p>
                          </div>
                        </div>
                        
                        {/* General mitigation */}
                        <div>
                          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            General Mitigation Strategy
                          </h5>
                          <p className="text-sm text-slate-600">{pitfall.general_mitigation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer with reminder */}
          <div className="mt-6 flex items-center justify-between text-xs text-amber-600">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              <span>This information is only visible to you as the interviewer</span>
            </div>
            <span className="text-amber-500">
              Viewing as: {data.interviewer_name}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact badge for headers
interface BiasBadgeProps {
  pitfallCount: number
  overallRisk: 'high' | 'medium' | 'low'
  onClick?: () => void
}

export function BiasBadge({ pitfallCount, overallRisk, onClick }: BiasBadgeProps) {
  if (pitfallCount === 0) return null
  
  return (
    <button
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105',
        overallRisk === 'high' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
        overallRisk === 'medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
        'bg-blue-100 text-blue-700 hover:bg-blue-200'
      )}
    >
      <Shield className="w-3.5 h-3.5" />
      <span>{pitfallCount} Bias Alert{pitfallCount > 1 ? 's' : ''}</span>
      <Lock className="w-3 h-3 opacity-60" />
    </button>
  )
}

export default BiasPitfallsView
