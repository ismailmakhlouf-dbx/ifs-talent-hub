import clsx from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'auto'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  // Auto variant determines color based on value
  let actualVariant = variant
  if (variant === 'auto') {
    if (percentage >= 70) actualVariant = 'success'
    else if (percentage >= 40) actualVariant = 'warning'
    else actualVariant = 'danger'
  }

  const barColors = {
    default: 'bg-gradient-to-r from-thomas-orange to-thomas-navy',
    success: 'bg-gradient-to-r from-success to-emerald-400',
    warning: 'bg-gradient-to-r from-warning to-amber-400',
    danger: 'bg-gradient-to-r from-danger to-rose-400',
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-thomas-navy">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={clsx('w-full bg-slate-200 rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            barColors[actualVariant as keyof typeof barColors]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Circular Progress
interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
  label?: string
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  variant = 'default',
  label
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const colors = {
    default: '#00A9CE',
    success: '#00A878',
    warning: '#F5A623',
    danger: '#E4002B',
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-slate-800">{value}%</span>
        {label && <span className="text-xs text-slate-500">{label}</span>}
      </div>
    </div>
  )
}
