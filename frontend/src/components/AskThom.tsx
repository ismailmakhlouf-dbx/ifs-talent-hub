import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, MessageCircle, Minimize2, Maximize2, Square } from 'lucide-react'
import clsx from 'clsx'

// Expansion mode type
type ExpansionMode = 'normal' | 'half' | 'full'

// Four-Point Star SVG - Magenta (#E91E63) for AI features
export const FourPointStar = ({ className = "w-4 h-4", animate = false }: { className?: string; animate?: boolean }) => (
  <svg 
    className={clsx(className, animate && 'ai-star-animate')} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    style={{ filter: 'drop-shadow(0 0 4px rgba(233, 30, 99, 0.6))' }}
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="#E91E63" />
  </svg>
)

// Thomas Double Hexagon Logo - Official 2025/2026 branding
// Two interlocking hexagon outlines in orange (#FF6B35)
export const ThomasHexagonLogo = ({ className = "w-8 h-8", color = "#FF6B35" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left hexagon */}
    <path 
      d="M18 6L30 6L36 18L30 30L18 30L12 18L18 6Z" 
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      transform="translate(-6, 3)"
    />
    {/* Right hexagon (overlapping) */}
    <path 
      d="M18 6L30 6L36 18L30 30L18 30L12 18L18 6Z" 
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      transform="translate(6, 3)"
    />
  </svg>
)

// Simplified Thomas Logo for small sizes
const ThomasLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <ThomasHexagonLogo className={className} />
)

// Chat icon for the floating button
export const ChatIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
    <path d="M7 9H17V11H7V9Z" fill="white"/>
    <path d="M7 12H14V14H7V12Z" fill="white"/>
  </svg>
)

// AskThom Badge - shows next to AI-powered elements
interface AskThomBadgeProps {
  context: string
  contextData?: Record<string, unknown>
  size?: 'sm' | 'md'
  className?: string
}

export function AskThomBadge({ context, contextData, size = 'md', className }: AskThomBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-full transition-all hover:scale-105 group',
          size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1',
          'bg-ai-gradient-soft hover:bg-ai-gradient',
          'border border-thomas-pink/30 hover:border-transparent hover:shadow-ai-glow',
          'hover:text-white',
          className
        )}
        title="Click to ask Thom about this"
      >
        <ThomasLogo className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span className={clsx(
          'font-semibold text-ai-gradient group-hover:text-white transition-colors',
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        )}>
          AskThom
        </span>
        <FourPointStar className={clsx(
          'text-thomas-pink opacity-70 group-hover:opacity-100 transition-opacity ai-star-animate',
          size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
        )} />
      </button>

      {isOpen && (
        <AskThomChat 
          context={context} 
          contextData={contextData}
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}

// AskThom Inline Label - smaller version for inline use
export function AskThomLabel({ className }: { className?: string }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs text-slate-500',
      className
    )}>
      <ThomasLogo className="w-3.5 h-3.5" />
      <span className="font-medium text-thomas-orange">AI-Powered</span>
    </span>
  )
}

// API base URL - check if we're in development mode
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
const API_BASE = isDev ? 'http://localhost:8000' : ''

// Chat interface
interface Message {
  role: 'user' | 'assistant'
  content: string
  thomasKeywords?: string[]
  ifsKeywords?: string[]
  timestamp: Date
  sources?: string[]
}

interface AskThomChatProps {
  context: string
  contextData?: Record<string, unknown>
  onClose: () => void
}

// Thomas and IFS keywords for highlighting
const THOMAS_KEYWORDS = [
  'PPA', 'Personal Profile Analysis', 'DISC',
  'GIA', 'General Intelligence Assessment',
  'HPTI', 'High Potential Trait Indicator',
  'TEIQue', 'Thomas Connect', 'Thomas Insights',
  'Chemistry Score', 'Interpersonal Flexibility',
  'Dominance', 'Influence', 'Steadiness', 'Compliance',
  'Conscientiousness', 'Adjustment', 'Curiosity',
  'Risk Approach', 'Ambiguity Acceptance', 'Competitiveness'
]

const IFS_KEYWORDS = [
  'IFS', 'IFS Cloud', 'Industrial AI',
  'ERP', 'Enterprise Resource Planning',
  'EAM', 'Enterprise Asset Management',
  'FSM', 'Field Service Management'
]

// Parse markdown and render with highlighted keywords
function HighlightedText({ text, thomasKeywords = [], ifsKeywords = [] }: { 
  text: string
  thomasKeywords?: string[]
  ifsKeywords?: string[]
}) {
  // First, parse markdown (bold, bullet points)
  const parseMarkdown = (input: string): React.ReactNode[] => {
    const lines = input.split('\n')
    const result: React.ReactNode[] = []
    
    lines.forEach((line, lineIdx) => {
      // Handle bullet points
      let processedLine = line
      let isBullet = false
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        isBullet = true
        processedLine = line.replace(/^\s*[\*\-]\s*/, '')
      }
      
      // Parse **bold** text
      const boldPattern = /\*\*([^*]+)\*\*/g
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let match
      
      while ((match = boldPattern.exec(processedLine)) !== null) {
        // Add text before the bold
        if (match.index > lastIndex) {
          parts.push(processedLine.slice(lastIndex, match.index))
        }
        // Add bold text
        parts.push(<strong key={`bold-${lineIdx}-${match.index}`}>{match[1]}</strong>)
        lastIndex = match.index + match[0].length
      }
      // Add remaining text
      if (lastIndex < processedLine.length) {
        parts.push(processedLine.slice(lastIndex))
      }
      
      if (isBullet) {
        result.push(
          <span key={`line-${lineIdx}`} className="block pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-thomas-orange">
            {parts.length > 0 ? parts : processedLine}
          </span>
        )
      } else {
        result.push(...parts)
        if (lineIdx < lines.length - 1) {
          result.push('\n')
        }
      }
    })
    
    return result
  }
  
  // Combine provided keywords with defaults
  const allThomasKw = [...new Set([...THOMAS_KEYWORDS, ...thomasKeywords])]
  const allIfsKw = [...new Set([...IFS_KEYWORDS, ...ifsKeywords])]
  
  // Parse markdown first
  const parsedContent = parseMarkdown(text)
  
  // Now highlight keywords in string parts
  const highlightKeywords = (content: React.ReactNode): React.ReactNode => {
    if (typeof content !== 'string') return content
    
    const pattern = new RegExp(
      `(${[...allThomasKw, ...allIfsKw].map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    )
    
    const parts = content.split(pattern)
    
    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase()
      
      if (allThomasKw.some(k => k.toLowerCase() === lowerPart)) {
        return (
          <span key={i} className="text-thomas-orange font-semibold" title="Thomas International">
            {part}
          </span>
        )
      }
      
      if (allIfsKw.some(k => k.toLowerCase() === lowerPart)) {
        return (
          <span key={i} className="text-ifs-purple font-semibold" title="IFS Cloud">
            {part}
          </span>
        )
      }
      
      return <span key={i}>{part}</span>
    })
  }
  
  return (
    <>
      {parsedContent.map((node, i) => (
        <React.Fragment key={i}>{highlightKeywords(node)}</React.Fragment>
      ))}
    </>
  )
}

function AskThomChat({ context, contextData, onClose }: AskThomChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getInitialMessage(context),
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [expansionMode, setExpansionMode] = useState<ExpansionMode>('normal')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cycle through expansion modes
  const cycleExpansion = () => {
    setExpansionMode(prev => {
      if (prev === 'normal') return 'half'
      if (prev === 'half') return 'full'
      return 'normal'
    })
  }

  // Get container classes based on expansion mode
  const getContainerClasses = () => {
    switch (expansionMode) {
      case 'full':
        return 'fixed inset-4 w-auto h-auto max-h-[calc(100vh-32px)]'
      case 'half':
        return 'fixed right-4 bottom-4 w-[420px] h-[50vh] max-h-[500px]'
      default:
        return isMinimized ? 'w-72' : 'w-[380px] max-h-[50vh]'
    }
  }

  // Get messages height based on expansion mode
  const getMessagesHeight = () => {
    switch (expansionMode) {
      case 'full':
        return 'max-h-[calc(100vh-250px)] overflow-y-auto'
      case 'half':
        return 'max-h-[calc(50vh-180px)] overflow-y-auto'
      default:
        return 'max-h-[250px] overflow-y-auto'
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const question = input
    setInput('')
    setIsLoading(true)

    try {
      // Call the AskThom API
      const response = await fetch(`${API_BASE}/api/ai/ask-thom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: contextData ? JSON.stringify(contextData) : undefined,
          page_context: context
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          thomasKeywords: data.thomas_keywords_found || [],
          ifsKeywords: data.ifs_keywords_found || [],
          timestamp: new Date(),
          sources: data.sources
        }])
      } else {
        // Fallback to local response
        const fallbackResponse = generateResponse(question, context, contextData)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      // Fallback to local response on network error
      console.log('Using fallback response:', error)
      const fallbackResponse = generateResponse(question, context, contextData)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      }])
    }

    setIsLoading(false)
  }

  const suggestedQuestions = getSuggestedQuestions(context)

  return (
    <div className={clsx(
      "fixed z-50 pointer-events-none",
      expansionMode === 'full' ? 'inset-0 p-4' : 
      expansionMode === 'half' ? 'inset-0' : 
      'inset-0 flex items-end justify-end p-4'
    )}>
      {/* Backdrop for expanded modes */}
      {expansionMode !== 'normal' && (
        <div 
          className="absolute inset-0 bg-black/30 pointer-events-auto" 
          onClick={() => setExpansionMode('normal')}
        />
      )}
      <div 
        className={clsx(
          'bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto transition-all duration-300 flex flex-col',
          getContainerClasses()
        )}
      >
        {/* Header - Ask Thom */}
        <div className="bg-thomas-orange rounded-t-2xl px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThomasHexagonLogo className="w-8 h-8" color="#FFFFFF" />
              <div>
                <h3 className="font-display font-bold text-white">Ask Thom</h3>
                <p className="text-white/80 text-xs">Powered by Thomas International + Databricks AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Expansion toggle button */}
              <button
                onClick={cycleExpansion}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={expansionMode === 'normal' ? 'Expand to half screen' : expansionMode === 'half' ? 'Expand to full screen' : 'Minimize'}
              >
                {expansionMode === 'full' ? (
                  <Minimize2 className="w-4 h-4 text-white" />
                ) : expansionMode === 'half' ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Square className="w-4 h-4 text-white" />
                )}
              </button>
              {expansionMode === 'normal' && (
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages - Warm background */}
            <div className={clsx(
              "overflow-y-auto p-4 space-y-4 bg-bg-warm flex-1",
              getMessagesHeight()
            )}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex gap-2',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {/* Hexagon avatar for assistant */}
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mt-1">
                      <ThomasHexagonLogo className="w-6 h-6" color="#FF6B35" />
                    </div>
                  )}
                  <div
                    className={clsx(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-thomas-slate text-white rounded-br-sm'
                        : 'bg-white text-text-primary rounded-bl-sm shadow-soft'
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.role === 'assistant' ? (
                        <HighlightedText 
                          text={msg.content} 
                          thomasKeywords={msg.thomasKeywords}
                          ifsKeywords={msg.ifsKeywords}
                        />
                      ) : (
                        msg.content
                      )}
                    </p>
                    {/* Show sources if available */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100">
                        {msg.sources.map((source, idx) => (
                          <span 
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className={clsx(
                      'text-[10px] mt-1.5',
                      msg.role === 'user' ? 'text-white/50' : 'text-text-muted'
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <ThomasLogo className="w-4 h-4" />
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-thomas-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-thomas-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-thomas-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && suggestedQuestions.length > 0 && (
              <div className="px-4 py-2 bg-white border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q)
                        setTimeout(() => handleSend(), 100)
                      }}
                      className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - White with orange send button */}
            <div className="p-4 border-t border-thomas-slate/10 bg-white rounded-b-2xl">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 bg-bg-warm border border-thomas-slate/10 rounded-pill text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-thomas-orange/30 focus:border-thomas-orange"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-11 h-11 bg-thomas-orange text-white rounded-full flex items-center justify-center hover:bg-thomas-orange-dark hover:shadow-orange-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 icon-thin" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Helper functions for generating contextual responses
function getInitialMessage(context: string): string {
  const greetings: Record<string, string> = {
    'negotiation': "Hello! I'm Thom, your AI negotiation coach. I can help you understand this candidate's psychometric profile and suggest the best approach for salary discussions. What would you like to know?",
    'psychometric': "Hi there! I can help you interpret this candidate's Thomas assessment results. The PPA, GIA, and HPTI scores reveal important insights about their work style and potential. What aspects would you like to explore?",
    'candidate-analysis': "Welcome! I'm here to help you understand this candidate's fit for the role. I can explain the match scores, trait gaps, and provide recommendations. What would you like to discuss?",
    'performance': "Hello! I can help you understand this employee's performance metrics and Thomas assessment data. Would you like insights on their development areas or leadership potential?",
    'interview-summary': "Hi! I've summarised the interview feedback for this candidate. I can help you understand the panel's assessments and what the scores indicate about their suitability. How can I help?",
    'ideal-profile': "Welcome! I can explain how the ideal candidate profile was generated from top performers in your organisation. What would you like to know about the benchmarks?",
    'churn-risk': "Hello! I'm analysing the churn risk indicators for this employee. I can help you understand the warning signs and suggest retention strategies. What concerns you most?",
    'default': "Hello! I'm Thom, Thomas International's AI assistant. I can help you understand psychometric assessments, candidate fit, and talent insights. How can I assist you today?"
  }
  return greetings[context] || greetings['default']
}

function getSuggestedQuestions(context: string): string[] {
  const questions: Record<string, string[]> = {
    'negotiation': [
      "How should I approach this negotiation?",
      "What does their profile suggest about salary expectations?",
      "Is this offer competitive?"
    ],
    'psychometric': [
      "What does high Dominance mean?",
      "How do these scores compare to top performers?",
      "What are the development areas?"
    ],
    'candidate-analysis': [
      "Is this a good fit for the role?",
      "What are the key concerns?",
      "How confident should I be in this hire?"
    ],
    'performance': [
      "What's driving the performance score?",
      "Are there any warning signs?",
      "What development should I prioritise?"
    ],
    'interview-summary': [
      "What were the main concerns?",
      "How did technical skills compare?",
      "Should we extend an offer?"
    ],
    'ideal-profile': [
      "How was this profile created?",
      "What traits are most important?",
      "How many employees contributed?"
    ],
    'churn-risk': [
      "What's causing the risk?",
      "What should I do this week?",
      "How reliable is this prediction?"
    ],
    'default': [
      "What can you help me with?",
      "Explain the Thomas assessments",
      "How do I use this data?"
    ]
  }
  return questions[context] || questions['default']
}

function generateResponse(input: string, context: string, _contextData?: Record<string, unknown>): string {
  const inputLower = input.toLowerCase()
  
  // Negotiation context responses
  if (context === 'negotiation') {
    if (inputLower.includes('approach') || inputLower.includes('how should')) {
      return "Based on the candidate's psychometric profile, I'd recommend:\n\n1. **Start with rapport** - Their Influence score suggests they value personal connection before business.\n\n2. **Be direct but not pushy** - Their moderate Dominance means they appreciate straightforward communication.\n\n3. **Emphasise stability** - High Steadiness indicates they prioritise job security over maximum compensation.\n\n4. **Present data** - Their Compliance score suggests they'll respond well to market benchmarks and structured reasoning.\n\nWould you like specific talking points?"
    }
    if (inputLower.includes('competitive') || inputLower.includes('offer')) {
      return "Looking at the benchmarks:\n\n📊 **Industry comparison**: Your offer is positioned against market rates for this role and level.\n\n🏢 **Internal equity**: I've compared against similar roles in your organisation.\n\n💡 **My recommendation**: Consider the candidate's flexibility rating and competing offers. Their psychometric profile suggests they may value non-monetary benefits like work-life balance and team culture.\n\nShall I suggest some negotiation levers to use?"
    }
    if (inputLower.includes('salary') || inputLower.includes('expect')) {
      return "Based on their profile and the data available:\n\n• **Expected range**: The candidate's stated expectation is visible in their profile\n• **Flexibility indicator**: Check their negotiation flexibility rating (Low/Medium/High)\n• **Profile insight**: High Steadiness candidates typically accept below-market if the role offers stability\n• **Risk tolerance**: Their HPTI Risk Approach score indicates whether they'd prefer guaranteed base vs. variable comp\n\nDo you want me to explain how to use these insights in your offer?"
    }
  }
  
  // Psychometric context responses
  if (context === 'psychometric' || context === 'candidate-analysis') {
    if (inputLower.includes('dominance') || inputLower.includes('high d')) {
      return "**Dominance (D)** in the PPA measures assertiveness and results-orientation.\n\n**High Dominance** (70%+):\n• Direct and decisive\n• Comfortable with conflict\n• Results-focused, may overlook details\n• Prefer autonomy over close supervision\n\n**In negotiations**: Expect them to push back firmly. Be prepared with data.\n\n**In the role**: Best in positions requiring quick decisions and leadership.\n\nWould you like to know how this interacts with their other traits?"
    }
    if (inputLower.includes('fit') || inputLower.includes('good')) {
      return "To assess role fit, I look at several factors:\n\n**1. Profile Match Score** - How closely their PPA/HPTI aligns with successful employees in this role\n\n**2. GIA Score** - Cognitive ability relative to role demands\n\n**3. Trait gaps** - Where they differ significantly from the ideal profile\n\n**4. Interview performance** - Technical and behavioural assessments\n\nThe match score gives you a quick indicator, but I'd recommend reviewing the specific trait gaps. Even a 70% match can be excellent if the gaps are in less critical areas.\n\nShall I explain the specific gaps for this candidate?"
    }
    if (inputLower.includes('concern') || inputLower.includes('risk')) {
      return "I'd flag these potential concerns:\n\n⚠️ **Trait gaps**: Check where the candidate differs significantly from the ideal profile - gaps over 15 points warrant discussion\n\n⚠️ **Confidence trajectory**: Is their interview confidence on track for this stage?\n\n⚠️ **Interview red flags**: Review the detailed notes for any concerns raised by the panel\n\n⚠️ **Competing offers**: This can affect both timeline and acceptance likelihood\n\nWant me to dive deeper into any of these?"
    }
  }
  
  // Performance context
  if (context === 'performance' || context === 'churn-risk') {
    if (inputLower.includes('warning') || inputLower.includes('sign') || inputLower.includes('causing')) {
      return "The key risk indicators I monitor are:\n\n🔴 **Morale score decline** - A drop of 10+ points quarter-over-quarter is significant\n\n🔴 **Slack sentiment** - Negative tone in communications can precede departure\n\n🔴 **Velocity changes** - Sudden productivity drops may indicate disengagement\n\n🔴 **Life events** - Major changes like maternity, relocation, or team changes\n\nI weight these differently based on the employee's Thomas profile. High Steadiness employees are more affected by team changes, while high Dominance employees react more to lack of progression.\n\nWould you like specific recommendations for this employee?"
    }
    if (inputLower.includes('development') || inputLower.includes('prioriti')) {
      return "Based on their Thomas assessment and performance data, I'd suggest prioritising:\n\n**1. Skill gaps** - Where do their scores fall below role requirements?\n\n**2. Leadership readiness** - HPTI traits indicate leadership potential and timeline\n\n**3. Career interests** - Consider their profile when suggesting development paths\n\n**4. Stretch assignments** - Match opportunities to their behavioural preferences\n\nEmployees with high Curiosity (HPTI) respond well to new challenges, while high Steadiness employees prefer gradual skill-building.\n\nWant me to suggest specific development activities?"
    }
  }
  
  // Default helpful responses
  if (inputLower.includes('thank')) {
    return "You're welcome! I'm here whenever you need help interpreting Thomas assessment data or making talent decisions. Good luck! 🎯"
  }
  
  if (inputLower.includes('help') || inputLower.includes('what can you')) {
    return "I can help you with:\n\n📊 **Interpreting assessments** - Understanding PPA, GIA, and HPTI scores\n\n👥 **Candidate analysis** - Evaluating fit and identifying concerns\n\n💰 **Negotiation strategy** - Psychometric-informed offer approaches\n\n📈 **Performance insights** - Understanding trends and predicting risks\n\n🎯 **Development planning** - Tailored recommendations based on profiles\n\nJust ask me anything about the data you're viewing!"
  }
  
  // Generic contextual response
  return `That's a great question about ${context.replace('-', ' ')}. Based on the Thomas assessment data and best practices:\n\n• Consider the specific trait scores and how they interact\n• Compare against benchmarks (both industry and internal)\n• Factor in the context - role requirements, team dynamics, and timeline\n\nWould you like me to focus on a specific aspect? I can provide more detailed guidance on any element of the analysis.`
}

export default AskThomBadge
