"""
UI Styles and Theming
Thomas International brand colors and custom CSS
"""

# Thomas International Brand Colors
THOMAS_COLORS = {
    "primary": "#1B365D",      # Deep Navy Blue (Thomas primary)
    "secondary": "#00A9CE",    # Bright Cyan (Thomas accent)
    "accent": "#E4002B",       # Red (for alerts/critical)
    "success": "#00A878",      # Teal Green
    "warning": "#F5A623",      # Amber
    "neutral_dark": "#2D3748", # Dark Gray
    "neutral_mid": "#718096",  # Medium Gray
    "neutral_light": "#E2E8F0",# Light Gray
    "background": "#F7FAFC",   # Off-white background
    "card_bg": "#FFFFFF",      # White card background
    "text_primary": "#1A202C", # Dark text
    "text_secondary": "#4A5568",# Secondary text
    
    # PPA DISC Colors
    "dominance": "#E63946",    # Red
    "influence": "#F4A261",    # Orange/Yellow
    "steadiness": "#2A9D8F",   # Teal
    "compliance": "#264653",   # Dark Blue
    
    # Status Colors
    "on_track": "#00A878",
    "at_risk": "#F5A623",
    "critical": "#E4002B",
}


def get_custom_css() -> str:
    """Return custom CSS for the Streamlit app"""
    return f"""
    <style>
        /* Import Fonts */
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        
        /* Global Styles */
        .stApp {{
            background: linear-gradient(135deg, {THOMAS_COLORS['background']} 0%, #EDF2F7 100%);
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }}
        
        /* Header Styling */
        header[data-testid="stHeader"] {{
            background: linear-gradient(90deg, {THOMAS_COLORS['primary']} 0%, #2C4A7C 100%);
            border-bottom: 3px solid {THOMAS_COLORS['secondary']};
        }}
        
        /* Sidebar Styling */
        section[data-testid="stSidebar"] {{
            background: linear-gradient(180deg, {THOMAS_COLORS['primary']} 0%, #0D1B2A 100%);
            border-right: 1px solid {THOMAS_COLORS['secondary']};
        }}
        
        section[data-testid="stSidebar"] .stMarkdown {{
            color: white;
        }}
        
        section[data-testid="stSidebar"] label {{
            color: white !important;
        }}
        
        section[data-testid="stSidebar"] .stSelectbox label {{
            color: white !important;
        }}
        
        /* Main Title */
        .main-title {{
            font-size: 2.5rem;
            font-weight: 700;
            color: {THOMAS_COLORS['primary']};
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
        }}
        
        .sub-title {{
            font-size: 1.1rem;
            color: {THOMAS_COLORS['text_secondary']};
            margin-bottom: 2rem;
        }}
        
        /* Card Styles */
        .metric-card {{
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid {THOMAS_COLORS['neutral_light']};
            transition: all 0.2s ease;
        }}
        
        .metric-card:hover {{
            box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08);
            transform: translateY(-2px);
        }}
        
        .metric-card-header {{
            font-size: 0.85rem;
            font-weight: 500;
            color: {THOMAS_COLORS['text_secondary']};
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }}
        
        .metric-card-value {{
            font-size: 2rem;
            font-weight: 700;
            color: {THOMAS_COLORS['primary']};
            line-height: 1.2;
        }}
        
        .metric-card-delta {{
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }}
        
        .delta-positive {{
            color: {THOMAS_COLORS['success']};
        }}
        
        .delta-negative {{
            color: {THOMAS_COLORS['accent']};
        }}
        
        /* Progress Bar */
        .progress-container {{
            background: {THOMAS_COLORS['neutral_light']};
            border-radius: 10px;
            height: 12px;
            overflow: hidden;
            margin: 0.5rem 0;
        }}
        
        .progress-fill {{
            height: 100%;
            border-radius: 10px;
            transition: width 0.5s ease;
        }}
        
        .progress-fill-primary {{
            background: linear-gradient(90deg, {THOMAS_COLORS['secondary']} 0%, {THOMAS_COLORS['primary']} 100%);
        }}
        
        .progress-fill-success {{
            background: linear-gradient(90deg, #00A878 0%, #00C896 100%);
        }}
        
        .progress-fill-warning {{
            background: linear-gradient(90deg, #F5A623 0%, #FFCC00 100%);
        }}
        
        .progress-fill-danger {{
            background: linear-gradient(90deg, #E4002B 0%, #FF4560 100%);
        }}
        
        /* Confidence Indicator */
        .confidence-badge {{
            display: inline-flex;
            align-items: center;
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }}
        
        .confidence-on-track {{
            background: rgba(0, 168, 120, 0.15);
            color: {THOMAS_COLORS['success']};
            border: 1px solid {THOMAS_COLORS['success']};
        }}
        
        .confidence-at-risk {{
            background: rgba(245, 166, 35, 0.15);
            color: #D68910;
            border: 1px solid {THOMAS_COLORS['warning']};
        }}
        
        .confidence-critical {{
            background: rgba(228, 0, 43, 0.15);
            color: {THOMAS_COLORS['accent']};
            border: 1px solid {THOMAS_COLORS['accent']};
        }}
        
        /* Data Table Styling */
        .dataframe {{
            font-family: 'IBM Plex Sans', sans-serif !important;
            font-size: 0.9rem !important;
        }}
        
        .dataframe th {{
            background: {THOMAS_COLORS['primary']} !important;
            color: white !important;
            font-weight: 600 !important;
            padding: 0.75rem !important;
        }}
        
        .dataframe td {{
            padding: 0.65rem !important;
        }}
        
        /* Section Headers */
        .section-header {{
            font-size: 1.25rem;
            font-weight: 600;
            color: {THOMAS_COLORS['primary']};
            margin: 1.5rem 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid {THOMAS_COLORS['secondary']};
        }}
        
        /* Info Box */
        .info-box {{
            background: linear-gradient(135deg, rgba(0, 169, 206, 0.08) 0%, rgba(27, 54, 93, 0.08) 100%);
            border-left: 4px solid {THOMAS_COLORS['secondary']};
            border-radius: 0 8px 8px 0;
            padding: 1rem 1.25rem;
            margin: 1rem 0;
        }}
        
        .info-box-title {{
            font-weight: 600;
            color: {THOMAS_COLORS['primary']};
            margin-bottom: 0.5rem;
        }}
        
        /* Risk Badge */
        .risk-badge {{
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
        }}
        
        .risk-high {{
            background: rgba(228, 0, 43, 0.12);
            color: {THOMAS_COLORS['accent']};
        }}
        
        .risk-medium {{
            background: rgba(245, 166, 35, 0.12);
            color: #D68910;
        }}
        
        .risk-low {{
            background: rgba(0, 168, 120, 0.12);
            color: {THOMAS_COLORS['success']};
        }}
        
        /* Tabs */
        .stTabs [data-baseweb="tab-list"] {{
            gap: 8px;
            background: transparent;
        }}
        
        .stTabs [data-baseweb="tab"] {{
            background: white;
            border-radius: 8px 8px 0 0;
            border: 1px solid {THOMAS_COLORS['neutral_light']};
            border-bottom: none;
            padding: 0.75rem 1.5rem;
            font-weight: 500;
        }}
        
        .stTabs [aria-selected="true"] {{
            background: {THOMAS_COLORS['primary']} !important;
            color: white !important;
        }}
        
        /* Slider Styling */
        .stSlider > div > div > div > div {{
            background: {THOMAS_COLORS['secondary']} !important;
        }}
        
        /* Button Styling */
        .stButton > button {{
            background: linear-gradient(135deg, {THOMAS_COLORS['primary']} 0%, #2C4A7C 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.6rem 1.5rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }}
        
        .stButton > button:hover {{
            background: linear-gradient(135deg, #2C4A7C 0%, {THOMAS_COLORS['primary']} 100%);
            box-shadow: 0 4px 12px rgba(27, 54, 93, 0.3);
        }}
        
        /* Expander */
        .streamlit-expanderHeader {{
            background: white;
            border-radius: 8px;
            font-weight: 500;
        }}
        
        /* Hide Streamlit branding */
        #MainMenu {{visibility: hidden;}}
        footer {{visibility: hidden;}}
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {{
            width: 8px;
            height: 8px;
        }}
        
        ::-webkit-scrollbar-track {{
            background: {THOMAS_COLORS['neutral_light']};
        }}
        
        ::-webkit-scrollbar-thumb {{
            background: {THOMAS_COLORS['neutral_mid']};
            border-radius: 4px;
        }}
        
        ::-webkit-scrollbar-thumb:hover {{
            background: {THOMAS_COLORS['primary']};
        }}
    </style>
    """
