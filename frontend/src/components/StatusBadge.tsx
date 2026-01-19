import clsx from 'clsx'

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'neutral'
  label: string
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

export default function StatusBadge({ status, label, size = 'md', pulse = false }: StatusBadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const statusStyles = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  const dotColors = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-slate-400',
  }

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      sizeStyles[size],
      statusStyles[status]
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        dotColors[status],
        pulse && 'animate-pulse'
      )} />
      {label}
    </span>
  )
}

// Confidence Badge specifically for candidates
interface ConfidenceBadgeProps {
  confidence: number
  benchmark: number
  stage: string
}

export function ConfidenceBadge({ confidence, benchmark, stage }: ConfidenceBadgeProps) {
  const isOnTrack = confidence >= benchmark
  const isAtRisk = confidence >= benchmark - 10 && confidence < benchmark
  
  let status: 'success' | 'warning' | 'danger'
  let label: string
  
  if (isOnTrack) {
    status = 'success'
    label = 'On Track'
  } else if (isAtRisk) {
    status = 'warning'
    label = 'At Risk'
  } else {
    status = 'danger'
    label = 'Below Benchmark'
  }

  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={status} label={label} pulse={status !== 'success'} />
      <span className="text-sm text-slate-500">
        {confidence.toFixed(0)}% at {stage} (benchmark: {benchmark}%)
      </span>
    </div>
  )
}

// Priority Badge for roles
interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const statusMap: Record<string, 'danger' | 'warning' | 'neutral'> = {
    'Critical': 'danger',
    'High': 'warning',
    'Medium': 'neutral',
    'Low': 'neutral',
  }

  return <StatusBadge status={statusMap[priority] || 'neutral'} label={priority} size="sm" />
}

// Churn Risk Badge
interface ChurnRiskBadgeProps {
  risk: string
}

export function ChurnRiskBadge({ risk }: ChurnRiskBadgeProps) {
  const statusMap: Record<string, 'danger' | 'warning' | 'success'> = {
    'High': 'danger',
    'Medium': 'warning',
    'Low': 'success',
  }

  return <StatusBadge status={statusMap[risk] || 'neutral'} label={`${risk} Risk`} pulse={risk === 'High'} />
}
