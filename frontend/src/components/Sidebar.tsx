import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Users, 
  Target, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  User,
  Building2,
  Sparkles,
  UserPlus,
  Cpu
} from 'lucide-react'
import { performanceApi, Manager } from '../lib/api'
import clsx from 'clsx'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  selectedManager: string
  onManagerChange: (id: string) => void
}

export default function Sidebar({ collapsed, onToggle, selectedManager, onManagerChange }: SidebarProps) {
  const location = useLocation()
  const [managers, setManagers] = useState<Manager[]>([])
  const [showManagerDropdown, setShowManagerDropdown] = useState(false)
  
  useEffect(() => {
    performanceApi.getManagers()
      .then(setManagers)
      .catch(console.error)
  }, [])

  const navItems = [
    { 
      path: '/recruitment', 
      icon: Target, 
      label: 'Recruitment', 
      description: 'Hiring pipeline & candidates'
    },
    { 
      path: '/referrals', 
      icon: UserPlus, 
      label: 'Referrals', 
      description: 'CV analysis & AI enrichment'
    },
    { 
      path: '/performance', 
      icon: BarChart3, 
      label: 'Performance', 
      description: 'Team metrics & morale'
    },
    { 
      path: '/hr-dashboard', 
      icon: Users, 
      label: 'HR Dashboard', 
      description: 'Executive workforce analytics'
    },
    { 
      path: '/under-the-hood', 
      icon: Cpu, 
      label: 'Under the Hood', 
      description: 'Architecture & data model'
    },
  ]

  const currentManager = managers.find(m => m.employee_id === selectedManager)

  return (
    <aside 
      className={clsx(
        'fixed left-0 top-0 h-screen',
        'flex flex-col transition-all duration-300 z-50',
        'bg-[#1A1F2E] border-r border-[#2A3142]',
        collapsed ? 'w-20' : 'w-80'
      )}
    >
      {/* Logo Header - IFS branded with Thomas powered */}
      <div className="p-5 border-b border-[#2A3142]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2">
            {/* IFS Logo - Starburst SVG */}
            <svg width="36" height="36" viewBox="0 0 100 100" className="flex-shrink-0">
              {/* Radial starburst pattern */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 15) * Math.PI / 180;
                const innerRadius = 15;
                const outerRadius = i % 2 === 0 ? 45 : 38;
                const x1 = 50 + innerRadius * Math.cos(angle);
                const y1 = 50 + innerRadius * Math.sin(angle);
                const x2 = 50 + outerRadius * Math.cos(angle);
                const y2 = 50 + outerRadius * Math.sin(angle);
                // Gradient from purple to lighter purple
                const opacity = 0.6 + (i % 3) * 0.15;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i % 3 === 0 ? '#A855F7' : i % 3 === 1 ? '#8B5CF6' : '#7C3AED'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity={opacity}
                  />
                );
              })}
            </svg>
            {!collapsed && (
              <span className="text-[#A855F7] font-bold text-2xl tracking-tight">IFS</span>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1A1F2E]" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in border-l border-[#2A3142] pl-3">
              <p className="text-white text-sm font-medium">Talent Hub</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-[#6B7280]">Powered by</span>
                <span className="text-[10px] text-thomas-orange font-semibold">Thomas</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manager Profile Card */}
      {!collapsed && (
        <div className="p-4 border-b border-[#2A3142]">
          <div 
            className="relative bg-[#242937] rounded-xl p-3.5 cursor-pointer hover:bg-[#2A3142] transition-all border border-[#2A3142]"
            onClick={() => setShowManagerDropdown(!showManagerDropdown)}
          >
            <div className="flex items-center gap-3">
              {/* Profile avatar */}
              <div className="w-10 h-10 rounded-xl bg-thomas-orange flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {currentManager?.name.split(' ').map(n => n[0]).join('') || '??'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">
                  {currentManager?.name || 'Select Manager'}
                </p>
                <p className="text-thomas-orange text-xs truncate">
                  {currentManager?.title || 'Loading...'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3 h-3 text-[#6B7280]" />
                  <span className="text-[#6B7280] text-[11px]">{currentManager?.department}</span>
                </div>
              </div>
              <ChevronRight className={clsx(
                'w-4 h-4 text-[#6B7280] transition-transform',
                showManagerDropdown && 'rotate-90'
              )} />
            </div>

            {/* Manager Dropdown - Solid opaque background */}
            {showManagerDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#0F1114] rounded-xl border border-thomas-orange/20 shadow-2xl z-50 max-h-72 overflow-y-auto">
                <div className="p-2">
                  <p className="px-3 py-2 text-[10px] text-white/40 uppercase tracking-widest">Select Manager</p>
                  {managers.map(m => (
                    <button
                      key={m.employee_id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onManagerChange(m.employee_id)
                        setShowManagerDropdown(false)
                      }}
                      className={clsx(
                        'w-full px-3 py-3 text-left rounded-lg transition-all flex items-center gap-3',
                        m.employee_id === selectedManager 
                          ? 'bg-thomas-orange/15 border border-thomas-orange/30' 
                          : 'hover:bg-white/5 border border-transparent'
                      )}
                    >
                      <div className={clsx(
                        'w-9 h-9 rounded-lg flex items-center justify-center',
                        m.employee_id === selectedManager 
                          ? 'bg-thomas-orange text-white' 
                          : 'bg-white/10 text-white/70'
                      )}>
                        <span className="text-xs font-bold">
                          {m.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{m.name}</p>
                        <p className="text-white/50 text-xs truncate">{m.title}</p>
                      </div>
                      {m.employee_id === selectedManager && (
                        <div className="w-2 h-2 rounded-full bg-thomas-orange animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-3 px-1">Viewing as Manager</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        <p className={clsx(
          'text-[10px] text-[#6B7280] uppercase tracking-widest mb-3 px-3',
          collapsed && 'text-center'
        )}>
          {collapsed ? '•' : 'Navigation'}
        </p>
        
        {navItems.map(({ path, icon: Icon, label, description }) => {
          const isActive = location.pathname.startsWith(path)
          return (
            <NavLink
              key={path}
              to={path}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                'group relative',
                isActive 
                  ? 'bg-thomas-orange text-white shadow-lg shadow-thomas-orange/25' 
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#242937]'
              )}
            >
              <div className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-[#2A3142] text-[#6B7280] group-hover:text-white group-hover:bg-[#323848]'
              )}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              {!collapsed && (
                <div className="flex-1 animate-fade-in">
                  <p className="font-medium text-sm">{label}</p>
                  <p className={clsx(
                    'text-[11px] mt-0.5',
                    isActive ? 'text-white/70' : 'text-[#6B7280]'
                  )}>{description}</p>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer - Powered By */}
      <div className="p-4 border-t border-[#2A3142]">
        {!collapsed && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#9CA3AF]">
              <Sparkles className="w-3 h-3 text-thomas-orange" />
              <span className="text-[10px] font-medium">Thomas Insights + Mosaic AI</span>
            </div>
            <span className="text-[9px] text-[#6B7280]">IFS Cloud Integration</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <Sparkles className="w-4 h-4 text-thomas-orange" />
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-6 h-6 bg-thomas-orange rounded-full flex items-center justify-center shadow-lg shadow-thomas-orange/25 hover:scale-110 transition-transform z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-white" />
        )}
      </button>
    </aside>
  )
}
