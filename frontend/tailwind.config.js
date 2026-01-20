/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ==========================================
        // THOMAS INTERNATIONAL 2025/2026 REBRAND
        // "Thom AI" Aesthetic
        // ==========================================
        
        // Primary Brand Colors
        thomas: {
          orange: '#FF6B35',           // Primary Action Color
          'orange-dark': '#E55A2B',    // Hover state
          'orange-light': '#FF8F66',   // Light variant
          teal: '#00A9A5',             // Thomas Teal - Secondary accent
          'teal-dark': '#008B87',      // Darker teal
          'teal-light': '#4DC9C5',     // Lighter teal
          pink: '#E91E63',             // AI Highlights / Magenta
          'pink-dark': '#C2185B',      // Darker pink
          'pink-light': '#F06292',     // Lighter pink
          slate: '#1A1D21',            // Primary Text / Slate Navy
          'slate-dark': '#0F1114',     // Darker slate for dropdowns
          'slate-light': '#2D3748',    // Lighter slate
          'slate-muted': '#4A5568',    // Muted text
          // Harmonized palette
          navy: '#1E2A3A',             // Deep navy for sidebar
          'navy-dark': '#141D29',      // Darker navy for dropdowns
          cream: '#FEF7F2',            // Warm off-white
          coral: '#FF7849',            // Softer coral accent
        },
        
        // IFS Brand Colors
        ifs: {
          purple: '#7B2D8E',           // IFS Purple
          'purple-dark': '#5A1F68',
          'purple-light': '#9B4DB0',
        },
        
        // Background Colors
        bg: {
          warm: '#FEF7F2',             // Warm Off-White - Main background
          card: '#FFFFFF',             // Pure White - Cards
          hover: '#FFF5EE',            // Hover state for cards
          dark: '#1A1D21',             // Dark mode
        },
        
        // Text Colors
        text: {
          primary: '#1A1D21',          // Slate Navy - Primary text
          secondary: '#4A5568',        // Muted gray
          muted: '#718096',            // Light muted
          inverse: '#FFFFFF',          // White on dark
          accent: '#FF6B35',           // Orange accent text
        },
        
        // DISC Profile Colors (Psychometric Charts)
        disc: {
          dominance: '#D32F2F',        // Red
          influence: '#FBC02D',        // Yellow
          steadiness: '#388E3C',       // Green
          compliance: '#1976D2',       // Blue
        },
        
        // Semantic Colors
        success: '#388E3C',
        'success-light': '#E8F5E9',
        warning: '#FBC02D',
        'warning-light': '#FFFDE7',
        danger: '#FF6B35',             // Using Thomas Orange
        'danger-light': '#FFF3E0',
        info: '#1976D2',
        'info-light': '#E3F2FD',
        
        // AI Gradient Colors
        ai: {
          start: '#FF6B35',            // Orange
          end: '#E91E63',              // Pink/Magenta
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'Rubik', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Rubik', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      fontSize: {
        'page-title': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'section-title': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'tiny': ['10px', { lineHeight: '14px', fontWeight: '500' }],
      },
      
      borderRadius: {
        'card': '16px',                // Softer card radius
        'button': '50px',              // Pill-shaped buttons
        'pill': '50px',                // Pill shape
        'input': '12px',
        'badge': '8px',
        'hexagon': '0px',              // For clip-path hexagons
        'full': '9999px',
      },
      
      boxShadow: {
        // Soft shadows per new brand
        'card': '0 4px 20px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'elevated': '0 12px 40px rgba(0, 0, 0, 0.08)',
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
        // AI Glow effects
        'ai-glow': '0 0 20px rgba(233, 30, 99, 0.3), 0 0 40px rgba(255, 107, 53, 0.2)',
        'orange-glow': '0 0 20px rgba(255, 107, 53, 0.4)',
        'pink-glow': '0 0 20px rgba(233, 30, 99, 0.4)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ai-pulse': 'aiPulse 2s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        aiPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(233, 30, 99, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 107, 53, 0.5)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.2)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      
      backgroundImage: {
        // AI Gradient (Orange to Pink)
        'ai-gradient': 'linear-gradient(135deg, #FF6B35 0%, #E91E63 100%)',
        'ai-gradient-horizontal': 'linear-gradient(90deg, #FF6B35 0%, #E91E63 100%)',
        'ai-gradient-soft': 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
        // Warm background gradient
        'warm-gradient': 'linear-gradient(180deg, #FEF7F2 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}
