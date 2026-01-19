import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = 'default',
  className = ''
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-slate-200',
    success: 'border-success/30 bg-success-light/30',
    warning: 'border-warning/30 bg-warning-light/30',
    danger: 'border-danger/30 bg-danger-light/30',
  }

  const iconColors = {
    default: 'from-thomas-orange/20 to-thomas-navy/10 text-thomas-navy',
    success: 'from-success/20 to-success/5 text-success',
    warning: 'from-warning/20 to-warning/5 text-warning',
    danger: 'from-danger/20 to-danger/5 text-danger',
  }

  return (
    <div className={clsx(
      'bg-white rounded-2xl p-6 border shadow-card metric-hover',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        {icon && (
          <div className={clsx(
            'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
            iconColors[variant]
          )}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-display font-bold text-slate-800">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            trend === 'up' && 'bg-success/10 text-success',
            trend === 'down' && 'bg-danger/10 text-danger',
            trend === 'neutral' && 'bg-slate-100 text-slate-500'
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  )
}
