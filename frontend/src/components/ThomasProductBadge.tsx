import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { AskThomBadge } from './AskThom'
import clsx from 'clsx'

// Thomas Logo SVG (compact version)
const ThomasLogoSmall = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="url(#thomasGradientSmall)" />
    <path 
      d="M12 14H28M20 14V28M16 28H24" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="thomasGradientSmall" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00BCD4" />
        <stop offset="1" stopColor="#1a365d" />
      </linearGradient>
    </defs>
  </svg>
)

// Product definitions with descriptions
export const THOMAS_PRODUCTS = {
  PPA: {
    name: 'PPA',
    fullName: 'Personal Profile Analysis',
    shortDescription: 'DISC-based behavioural assessment measuring work preferences and communication style.',
    description: `The Personal Profile Analysis (PPA) is Thomas International's flagship behavioural assessment based on DISC theory. It measures four key behavioural traits:

• **Dominance (D)**: How a person responds to problems and challenges
• **Influence (I)**: How a person influences others to their point of view
• **Steadiness (S)**: How a person responds to pace and consistency
• **Compliance (C)**: How a person responds to rules and procedures

The PPA takes approximately 8 minutes to complete and provides insights into a person's preferred work style, communication preferences, and potential areas of strength or limitation in different work contexts.`,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
  },
  GIA: {
    name: 'GIA',
    fullName: 'General Intelligence Assessment',
    shortDescription: 'Cognitive ability test measuring learning speed, problem-solving, and adaptability.',
    description: `The General Intelligence Assessment (GIA) measures cognitive ability and trainability. Unlike traditional IQ tests, the GIA focuses on fluid intelligence—how quickly someone can learn and adapt.

**Five Key Areas Assessed:**
• **Reasoning**: Ability to make inferences and draw conclusions
• **Perceptual Speed**: Processing speed for visual information
• **Number Speed & Accuracy**: Numerical computation ability
• **Word Meaning**: Vocabulary and verbal comprehension
• **Spatial Visualisation**: Mental manipulation of shapes

The GIA score is presented as a percentile (1-100) indicating how the individual compares to the general working population. Higher scores indicate faster learning potential and greater cognitive adaptability.`,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
  },
  HPTI: {
    name: 'HPTI',
    fullName: 'High Potential Trait Indicator',
    shortDescription: 'Leadership potential assessment measuring traits linked to senior leadership success.',
    description: `The High Potential Trait Indicator (HPTI) assesses personality traits that predict leadership potential and success in senior roles. Based on the "Big Five" personality model, it measures six key traits:

• **Conscientiousness**: Self-discipline, organisation, and reliability
• **Adjustment**: Emotional stability and resilience under pressure
• **Curiosity**: Openness to new ideas and intellectual exploration
• **Risk Approach**: Willingness to take calculated risks
• **Ambiguity Acceptance**: Comfort with uncertainty and complexity
• **Competitiveness**: Drive to outperform and achieve

Each trait is scored on a spectrum, with optimal zones identified for leadership roles. The HPTI helps organisations identify high-potential employees and develop future leaders.`,
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-600',
  },
  TEIQue: {
    name: 'TEIQue',
    fullName: 'Trait Emotional Intelligence Questionnaire',
    shortDescription: 'Measures emotional intelligence including self-awareness and interpersonal skills.',
    description: `The Trait Emotional Intelligence Questionnaire (TEIQue) measures emotional intelligence—the ability to perceive, understand, and manage emotions effectively.

**Four Key Factors:**
• **Well-being**: Self-esteem, optimism, and happiness
• **Self-control**: Emotion regulation and stress management
• **Emotionality**: Empathy and emotional expression
• **Sociability**: Social awareness and assertiveness

High emotional intelligence is linked to better teamwork, leadership effectiveness, and workplace relationships. The TEIQue helps identify individuals who excel at navigating interpersonal dynamics.`,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-600',
  },
  Engage: {
    name: 'Engage',
    fullName: 'Thomas Engage',
    shortDescription: 'Employee engagement survey measuring motivation, satisfaction, and commitment.',
    description: `Thomas Engage is an employee engagement platform that measures the factors driving workplace motivation and commitment.

**Key Engagement Drivers:**
• **Voice**: Feeling heard and valued
• **Togetherness**: Team cohesion and collaboration
• **Challenge**: Meaningful and stimulating work
• **Freedom**: Autonomy and flexibility
• **Clarity**: Understanding of goals and expectations
• **Recognition**: Appreciation and reward
• **Growth**: Development and career opportunities

Engage provides actionable insights for managers to improve team morale, reduce turnover, and create a more engaged workforce.`,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-600',
  },
  Chemistry: {
    name: 'Chemistry',
    fullName: 'Team Chemistry Score',
    shortDescription: 'AI-powered compatibility analysis based on PPA profiles for team dynamics.',
    description: `Team Chemistry is a Thomas International metric that predicts working compatibility between individuals based on their PPA behavioural profiles.

**Chemistry Factors:**
• **Communication Alignment**: Similar Influence (I) scores indicate compatible communication styles
• **Leadership Balance**: Complementary Dominance (D) scores reduce conflict
• **Pace Compatibility**: Similar Steadiness (S) scores mean aligned work pace
• **Approach Balance**: Balanced Compliance (C) scores for structured vs. flexible approaches

A high Chemistry score (75%+) suggests natural compatibility, while lower scores indicate that deliberate effort may be needed to establish effective collaboration. Chemistry is predictive, not prescriptive—low chemistry relationships can still be highly successful with awareness and adaptation.`,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-600',
  },
  InterpersonalFlexibility: {
    name: 'IF',
    fullName: 'Interpersonal Flexibility',
    shortDescription: 'NEW: Measures ability to maintain productive relationships despite personality differences.',
    description: `Interpersonal Flexibility is a new Thomas International metric that measures an individual's ability to maintain productive working relationships with colleagues whose natural work styles differ from their own.

**How It's Calculated:**
• Identifies relationships where Chemistry score is low (<55%)
• Measures actual Relationship quality in those pairings
• High relationship scores despite low chemistry = high flexibility

**What It Indicates:**
• **Exceptional (85+)**: Remarkable team unifier who adapts to any personality
• **High (70-84)**: Consistently adjusts communication style for others
• **Average (55-69)**: Works well with most, may struggle with very different styles
• **Developing (<55)**: Prefers similar personalities, coaching recommended

This metric identifies individuals who set aside personal preferences for team success—a valuable leadership trait.`,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-600',
    isNew: true,
  },
}

type ProductKey = keyof typeof THOMAS_PRODUCTS

// Info Tooltip Component
function InfoTooltip({ 
  product, 
  onClose 
}: { 
  product: typeof THOMAS_PRODUCTS[ProductKey]
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={clsx(
          'p-6 bg-gradient-to-r text-white',
          product.color
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThomasLogoSmall className="w-8 h-8" />
              <div>
                <h3 className="font-display font-bold text-xl">{product.name}</h3>
                <p className="text-white/80 text-sm">{product.fullName}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="prose prose-sm max-w-none text-slate-600">
            {product.description.split('\n\n').map((para, i) => (
              <p key={i} className="mb-4" dangerouslySetInnerHTML={{ 
                __html: para
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/• /g, '<br/>• ')
              }} />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Powered by Thomas International</span>
          <AskThomBadge context="psychometric" size="sm" />
        </div>
      </div>
    </div>
  )
}

// Main Product Badge Component
interface ThomasProductBadgeProps {
  product: ProductKey
  showName?: boolean
  showAskThom?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ThomasProductBadge({ 
  product, 
  showName = true,
  showAskThom = true,
  size = 'md',
  className 
}: ThomasProductBadgeProps) {
  const [showInfo, setShowInfo] = useState(false)
  const productInfo = THOMAS_PRODUCTS[product]
  
  if (!productInfo) return null
  
  return (
    <>
      <div className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg',
        size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-4 py-2' : 'px-3 py-1.5',
        productInfo.bgColor,
        productInfo.borderColor,
        'border',
        className
      )}>
        <ThomasLogoSmall className={clsx(
          size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
        )} />
        
        {showName && (
          <span className={clsx(
            'font-semibold',
            productInfo.textColor,
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
          )}>
            {productInfo.name}
          </span>
        )}
        
        {('isNew' in productInfo) && productInfo.isNew && (
          <span className="px-1.5 py-0.5 bg-violet-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
            New
          </span>
        )}
        
        <button
          onClick={() => setShowInfo(true)}
          className={clsx(
            'rounded-full hover:bg-white/50 transition-colors flex items-center justify-center',
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          title={productInfo.shortDescription}
        >
          <Info className={clsx(
            'text-slate-400 hover:text-slate-600',
            size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        </button>
        
        {showAskThom && (
          <AskThomBadge context="psychometric" size="sm" className="ml-1" />
        )}
      </div>
      
      {showInfo && (
        <InfoTooltip product={productInfo} onClose={() => setShowInfo(false)} />
      )}
    </>
  )
}

// Inline version for headers/titles
interface ThomasProductLabelProps {
  product: ProductKey
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  showAskThom?: boolean
}

export function ThomasProductLabel({ 
  product, 
  title,
  subtitle,
  size = 'md',
  showAskThom = true
}: ThomasProductLabelProps) {
  const [showInfo, setShowInfo] = useState(false)
  const productInfo = THOMAS_PRODUCTS[product]
  
  if (!productInfo) return null
  
  return (
    <>
      <div className="flex items-center gap-3">
        <div className={clsx(
          'rounded-xl flex items-center justify-center',
          `bg-gradient-to-br ${productInfo.color}`,
          size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
        )}>
          <ThomasLogoSmall className={clsx(
            'text-white',
            size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'
          )} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={clsx(
              'font-display font-semibold text-slate-800',
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
            )}>
              {title || productInfo.fullName}
            </h4>
            
            {('isNew' in productInfo) && productInfo.isNew && (
              <span className="px-1.5 py-0.5 bg-violet-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                New
              </span>
            )}
            
            <button
              onClick={() => setShowInfo(true)}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              title={productInfo.shortDescription}
            >
              <Info className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
            
            {showAskThom && (
              <AskThomBadge context="psychometric" size="sm" />
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      
      {showInfo && (
        <InfoTooltip product={productInfo} onClose={() => setShowInfo(false)} />
      )}
    </>
  )
}

// Compact inline label for use in small spaces
export function ThomasProductInline({ product }: { product: ProductKey }) {
  const [showInfo, setShowInfo] = useState(false)
  const productInfo = THOMAS_PRODUCTS[product]
  
  if (!productInfo) return null
  
  return (
    <>
      <span className="inline-flex items-center gap-1">
        <ThomasLogoSmall className="w-3.5 h-3.5" />
        <span className={clsx('font-medium text-xs', productInfo.textColor)}>
          {productInfo.name}
        </span>
        <button
          onClick={() => setShowInfo(true)}
          className="opacity-60 hover:opacity-100 transition-opacity"
          title={productInfo.shortDescription}
        >
          <Info className="w-3 h-3 text-slate-400" />
        </button>
      </span>
      
      {showInfo && (
        <InfoTooltip product={productInfo} onClose={() => setShowInfo(false)} />
      )}
    </>
  )
}

export default ThomasProductBadge
