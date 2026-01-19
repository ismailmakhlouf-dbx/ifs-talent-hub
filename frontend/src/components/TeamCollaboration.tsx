import { useState } from 'react'
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Zap
} from 'lucide-react'
import { Collaborator, InterpersonalFlexibility, CandidateTeamCollaboration, EmployeeTeamCollaboration } from '../lib/api'
import { AskThomBadge } from './AskThom'
import { ThomasProductLabel } from './ThomasProductBadge'
import { PoweredByThomas, PoweredByInline } from './PoweredByThomas'
import clsx from 'clsx'

// Chemistry Score Indicator
function ChemistryBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const getColor = () => {
    if (score >= 75) return 'bg-success/10 text-success border-success/20'
    if (score >= 55) return 'bg-warning/10 text-warning border-warning/20'
    return 'bg-danger/10 text-danger border-danger/20'
  }
  
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full border font-semibold',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      getColor()
    )}>
      {score}%
    </span>
  )
}

// Relationship Score Badge (for employees)
function RelationshipBadge({ chemistry, relationship }: { chemistry: number; relationship: number }) {
  const showFlexibility = chemistry < 55 && relationship >= 70
  
  return (
    <div className="flex items-center gap-2">
      <div className="text-center">
        <p className="text-xs text-slate-500">Chemistry</p>
        <ChemistryBadge score={chemistry} size="sm" />
      </div>
      <div className="text-slate-300">/</div>
      <div className="text-center">
        <p className="text-xs text-slate-500">Relationship</p>
        <span className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
          relationship >= 70 ? 'bg-success/10 text-success border-success/20' :
          relationship >= 50 ? 'bg-slate-100 text-slate-600 border-slate-200' :
          'bg-danger/10 text-danger border-danger/20'
        )}>
          {relationship}%
        </span>
      </div>
      {showFlexibility && (
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" />
          Flexibility
        </span>
      )}
    </div>
  )
}

// Collaborator Card
function CollaboratorCard({ 
  collaborator, 
  isCandidate = false,
  expanded,
  onToggle
}: { 
  collaborator: Collaborator
  isCandidate?: boolean
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className={clsx(
      'border rounded-xl transition-all',
      collaborator.chemistry_risk === 'high' ? 'border-danger/30 bg-danger/5' :
      collaborator.shows_interpersonal_flexibility ? 'border-purple-200 bg-purple-50/50' :
      'border-slate-200 bg-white'
    )}>
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <div className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
            collaborator.chemistry_risk === 'high' ? 'bg-danger' :
            (collaborator.chemistry_score >= 75) ? 'bg-success' :
            'bg-thomas-navy'
          )}>
            {collaborator.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 truncate">{collaborator.name}</h4>
              {isCandidate && collaborator.importance === 'high' && (
                <span className="px-2 py-0.5 bg-thomas-navy/10 text-thomas-navy text-xs font-medium rounded-full">
                  Key Collaborator
                </span>
              )}
              {collaborator.shows_interpersonal_flexibility && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  High Flexibility
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{collaborator.title}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <span>{collaborator.department}</span>
              {isCandidate && collaborator.relationship_role && (
                <>
                  <span>•</span>
                  <span>{collaborator.relationship_role}</span>
                </>
              )}
              {!isCandidate && collaborator.interaction_frequency && (
                <>
                  <span>•</span>
                  <span>{collaborator.interaction_frequency}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Time Allocation */}
          <div className="text-center px-4 border-l border-slate-100">
            <p className="text-2xl font-bold text-thomas-navy">{collaborator.time_allocation_percent}%</p>
            <p className="text-xs text-slate-500">Time</p>
          </div>
          
          {/* Chemistry/Relationship */}
          <div className="pl-4 border-l border-slate-100">
            {isCandidate ? (
              <div className="text-center">
                <ChemistryBadge score={collaborator.chemistry_score} />
                <p className="text-xs text-slate-500 mt-1">Chemistry</p>
              </div>
            ) : (
              <RelationshipBadge 
                chemistry={collaborator.chemistry_score} 
                relationship={collaborator.relationship_score || 0} 
              />
            )}
          </div>
        </div>
        
        <button className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Chemistry Breakdown */}
            <div>
              <h5 className="text-sm font-medium text-slate-600 mb-2">Chemistry Breakdown</h5>
              <div className="space-y-2">
                {Object.entries(collaborator.chemistry_breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-32 capitalize">{key.replace('_', ' ')}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          'h-full rounded-full',
                          value >= 70 ? 'bg-success' : value >= 50 ? 'bg-warning' : 'bg-danger'
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Interaction Notes */}
            <div>
              <h5 className="text-sm font-medium text-slate-600 mb-2">Interaction Style</h5>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {collaborator.interaction_note}
              </p>
              
              {collaborator.recommendation && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">Thom Recommends</span>
                    </div>
                    <PoweredByInline service="recommendations" />
                  </div>
                  <p className="text-sm text-slate-700">{collaborator.recommendation}</p>
                </div>
              )}
              
              {collaborator.flexibility_note && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-700">{collaborator.flexibility_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Interpersonal Flexibility Card (New Thomas Metric)
function InterpersonalFlexibilityCard({ data }: { data: InterpersonalFlexibility }) {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-200 p-6">
      <div className="mb-4">
        <ThomasProductLabel 
          product="InterpersonalFlexibility" 
          title="Interpersonal Flexibility" 
          subtitle="Thomas International Metric"
          size="sm"
        />
      </div>
      
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-4xl font-display font-bold text-purple-600">{data.score}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
        <div className="flex-1">
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-semibold',
            data.rating === 'Exceptional' ? 'bg-success/10 text-success' :
            data.rating === 'High' ? 'bg-purple-100 text-purple-700' :
            data.rating === 'Average' ? 'bg-slate-100 text-slate-600' :
            'bg-warning/10 text-warning'
          )}>
            {data.rating}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">{data.description}</p>
      
      {data.evidence.length > 0 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
        >
          {showDetails ? 'Hide' : 'View'} Evidence ({data.evidence.length})
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
      
      {showDetails && data.evidence.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.evidence.map((ev, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">{ev.collaborator}</span>
                <span className="text-xs text-purple-600">+{ev.flexibility_contribution} pts</span>
              </div>
              <p className="text-xs text-slate-500">{ev.note}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-purple-100">
        <p className="text-xs text-slate-500 italic">{data.metric_info}</p>
      </div>
    </div>
  )
}

// Main Component for Candidate Team Collaboration
export function CandidateTeamCollaborationView({ data }: { data: CandidateTeamCollaboration }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <ThomasProductLabel 
          product="Chemistry" 
          title="Team Collaboration" 
          subtitle={`People ${data.candidate_name} will work with`}
          size="md"
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-thomas-navy">{data.summary.total_collaborators}</p>
          <p className="text-xs text-slate-500">Collaborators</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className={clsx(
            'text-2xl font-bold',
            data.summary.avg_chemistry_score >= 70 ? 'text-success' :
            data.summary.avg_chemistry_score >= 50 ? 'text-warning' : 'text-danger'
          )}>
            {data.summary.avg_chemistry_score}%
          </p>
          <p className="text-xs text-slate-500">Avg Chemistry</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className={clsx(
            'text-2xl font-bold',
            data.summary.high_risk_relationships > 0 ? 'text-danger' : 'text-success'
          )}>
            {data.summary.high_risk_relationships}
          </p>
          <p className="text-xs text-slate-500">High Risk</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-warning">{data.summary.low_chemistry_count}</p>
          <p className="text-xs text-slate-500">Low Chemistry</p>
        </div>
      </div>
      
      {/* Key Recommendations */}
      {data.key_recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-slate-800">Onboarding Recommendations</h4>
            </div>
            <PoweredByThomas service="recommendations" size="xs" />
          </div>
          <ul className="space-y-2">
            {data.key_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-purple-600 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Collaborators List */}
      <div className="space-y-3">
        {data.collaborations.map((collab) => (
          <CollaboratorCard
            key={collab.employee_id}
            collaborator={collab}
            isCandidate={true}
            expanded={expandedId === collab.employee_id}
            onToggle={() => setExpandedId(expandedId === collab.employee_id ? null : collab.employee_id)}
          />
        ))}
      </div>
    </div>
  )
}

// Main Component for Employee Team Collaboration
export function EmployeeTeamCollaborationView({ data }: { data: EmployeeTeamCollaboration }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const flexibilityExamples = data.collaborations.filter(c => c.shows_interpersonal_flexibility)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <ThomasProductLabel 
          product="Chemistry" 
          title="Team Collaboration" 
          subtitle="Working relationships and chemistry analysis"
          size="md"
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-thomas-navy">{data.summary.total_collaborators}</p>
          <p className="text-xs text-slate-500">Collaborators</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className={clsx(
            'text-2xl font-bold',
            data.summary.avg_chemistry_score >= 70 ? 'text-success' :
            data.summary.avg_chemistry_score >= 50 ? 'text-warning' : 'text-danger'
          )}>
            {data.summary.avg_chemistry_score}%
          </p>
          <p className="text-xs text-slate-500">Avg Chemistry</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className={clsx(
            'text-2xl font-bold',
            data.summary.avg_relationship_score >= 70 ? 'text-success' :
            data.summary.avg_relationship_score >= 50 ? 'text-warning' : 'text-danger'
          )}>
            {data.summary.avg_relationship_score}%
          </p>
          <p className="text-xs text-slate-500">Avg Relationship</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{data.summary.flexibility_examples_count}</p>
          <p className="text-xs text-slate-500">Flexibility Examples</p>
        </div>
      </div>
      
      {/* Interpersonal Flexibility Score */}
      {data.interpersonal_flexibility && (
        <InterpersonalFlexibilityCard data={data.interpersonal_flexibility} />
      )}
      
      {/* Flexibility Highlights */}
      {flexibilityExamples.length > 0 && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-800">Interpersonal Flexibility Highlights</h4>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            🌟 {data.employee_name} demonstrates strong interpersonal flexibility by maintaining productive relationships despite personality differences:
          </p>
          <ul className="space-y-2">
            {flexibilityExamples.slice(0, 3).map((ex, i) => (
              <li key={i} className="text-sm text-purple-600">
                • {ex.flexibility_note?.replace('🌟 ', '')}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Collaborators List */}
      <div className="space-y-3">
        {data.collaborations.map((collab) => (
          <CollaboratorCard
            key={collab.employee_id}
            collaborator={collab}
            isCandidate={false}
            expanded={expandedId === collab.employee_id}
            onToggle={() => setExpandedId(expandedId === collab.employee_id ? null : collab.employee_id)}
          />
        ))}
      </div>
    </div>
  )
}

export { ChemistryBadge, InterpersonalFlexibilityCard }
