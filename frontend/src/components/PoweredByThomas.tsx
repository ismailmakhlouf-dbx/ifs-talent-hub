import { Sparkles, Lightbulb, MessageCircle, ThumbsUp, Zap, Link2 } from 'lucide-react'
import clsx from 'clsx'

// Thomas Logo SVG (compact version)
const ThomasLogoMini = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="url(#thomasGradientMini)" />
    <path 
      d="M12 14H28M20 14V28M16 28H24" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="thomasGradientMini" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00BCD4" />
        <stop offset="1" stopColor="#1a365d" />
      </linearGradient>
    </defs>
  </svg>
)

// Product/Service Definitions
export const THOMAS_SERVICES = {
  // Core Products
  connect: {
    name: 'Thomas Connect',
    description: 'Integrated assessment platform for talent data',
    icon: Link2,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  insights: {
    name: 'Thomas Insights',
    description: 'Data-driven analytics and visualizations',
    icon: Lightbulb,
    color: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  askThom: {
    name: 'AskThom',
    description: 'AI-powered conversational assistant',
    icon: MessageCircle,
    color: 'from-thomas-orange to-thomas-slate',
    textColor: 'text-thomas-orange',
    bgColor: 'bg-thomas-orange/10',
  },
  recommendations: {
    name: 'Recommendations by Thom',
    description: 'AI-generated actionable recommendations',
    icon: ThumbsUp,
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  // Additional products
  ppa: {
    name: 'Thomas PPA',
    description: 'Personal Profile Analysis (DISC)',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  gia: {
    name: 'Thomas GIA',
    description: 'General Intelligence Assessment',
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  hpti: {
    name: 'Thomas HPTI',
    description: 'High Potential Trait Indicator',
    icon: Zap,
    color: 'from-teal-500 to-teal-600',
    textColor: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
  },
  engage: {
    name: 'Thomas Engage',
    description: 'Employee engagement platform',
    icon: Sparkles,
    color: 'from-pink-500 to-pink-600',
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-500/10',
  },
  chemistry: {
    name: 'Thomas Chemistry',
    description: 'Team compatibility analysis',
    icon: Sparkles,
    color: 'from-cyan-500 to-cyan-600',
    textColor: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
  },
}

type ServiceKey = keyof typeof THOMAS_SERVICES

interface PoweredByThomasProps {
  service: ServiceKey
  size?: 'xs' | 'sm' | 'md'
  showIcon?: boolean
  showLogo?: boolean
  className?: string
}

export function PoweredByThomas({ 
  service, 
  size = 'sm', 
  showIcon = true,
  showLogo = true,
  className 
}: PoweredByThomasProps) {
  const serviceInfo = THOMAS_SERVICES[service]
  const Icon = serviceInfo.icon
  
  return (
    <div className={clsx(
      'inline-flex items-center gap-1.5 rounded-full',
      size === 'xs' ? 'px-2 py-0.5' : size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1',
      serviceInfo.bgColor,
      className
    )}>
      {showLogo && (
        <ThomasLogoMini className={clsx(
          size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
        )} />
      )}
      {showIcon && (
        <Icon className={clsx(
          serviceInfo.textColor,
          size === 'xs' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
        )} />
      )}
      <span className={clsx(
        'font-medium',
        serviceInfo.textColor,
        size === 'xs' ? 'text-[10px]' : size === 'md' ? 'text-sm' : 'text-xs'
      )}>
        {service === 'askThom' || service === 'recommendations' 
          ? serviceInfo.name 
          : `Powered by ${serviceInfo.name}`}
      </span>
    </div>
  )
}

// Compact inline version for tight spaces
interface PoweredByInlineProps {
  service: ServiceKey
  className?: string
}

export function PoweredByInline({ service, className }: PoweredByInlineProps) {
  const serviceInfo = THOMAS_SERVICES[service]
  const Icon = serviceInfo.icon
  
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-[10px] font-medium',
      serviceInfo.textColor,
      className
    )}>
      <Icon className="w-2.5 h-2.5" />
      {service === 'askThom' || service === 'recommendations' 
        ? serviceInfo.name 
        : `Powered by ${serviceInfo.name}`}
    </span>
  )
}

// Section header with powered by label
interface PoweredBySectionProps {
  service: ServiceKey
  title: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function PoweredBySection({ 
  service, 
  title, 
  subtitle,
  icon,
  className,
  children
}: PoweredBySectionProps) {
  const serviceInfo = THOMAS_SERVICES[service]
  const Icon = serviceInfo.icon
  
  return (
    <div className={clsx('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3">
        {icon || (
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
            serviceInfo.color
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <PoweredByThomas service={service} size="xs" />
      </div>
    </div>
  )
}

// Recommendation card with Thom branding
interface ThomRecommendationProps {
  recommendation: string
  priority?: 'high' | 'medium' | 'low'
  className?: string
}

export function ThomRecommendation({ 
  recommendation, 
  priority = 'medium',
  className 
}: ThomRecommendationProps) {
  return (
    <div className={clsx(
      'rounded-xl border p-4',
      priority === 'high' 
        ? 'bg-gradient-to-r from-purple-50 to-white border-purple-200' 
        : priority === 'low'
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-amber-50 to-white border-amber-200',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          priority === 'high' 
            ? 'bg-purple-100 text-purple-600' 
            : priority === 'low'
              ? 'bg-slate-200 text-slate-600'
              : 'bg-amber-100 text-amber-600'
        )}>
          <ThumbsUp className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-700">{recommendation}</p>
          <div className="mt-2">
            <PoweredByInline service="recommendations" />
          </div>
        </div>
      </div>
    </div>
  )
}

// AI Insight card with proper branding
interface ThomInsightProps {
  insight: string
  source?: string
  className?: string
}

export function ThomInsight({ insight, source, className }: ThomInsightProps) {
  return (
    <div className={clsx(
      'bg-gradient-to-br from-thomas-orange/5 to-thomas-slate/5 rounded-xl border border-thomas-orange/20 p-4',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-thomas-orange to-thomas-slate flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-700">{insight}</p>
          <div className="flex items-center justify-between mt-2">
            <PoweredByInline service="insights" />
            {source && <span className="text-[10px] text-slate-400">{source}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoweredByThomas
