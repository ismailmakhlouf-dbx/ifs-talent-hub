"""
Reusable UI Components
Custom Streamlit components for the Talent Management Hub
"""

import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any, List, Optional
import pandas as pd
from .styles import THOMAS_COLORS


def render_metric_card(
    title: str,
    value: str,
    delta: Optional[str] = None,
    delta_positive: bool = True,
    icon: str = ""
) -> None:
    """Render a styled metric card"""
    delta_class = "delta-positive" if delta_positive else "delta-negative"
    delta_html = f'<div class="metric-card-delta {delta_class}">{delta}</div>' if delta else ""
    
    st.markdown(f"""
        <div class="metric-card">
            <div class="metric-card-header">{icon} {title}</div>
            <div class="metric-card-value">{value}</div>
            {delta_html}
        </div>
    """, unsafe_allow_html=True)


def render_progress_bar(
    progress: float,
    label: str = "",
    variant: str = "primary",
    show_percentage: bool = True
) -> None:
    """Render a styled progress bar"""
    progress = max(0, min(100, progress))
    
    # Determine variant
    if variant == "auto":
        if progress >= 70:
            variant = "success"
        elif progress >= 40:
            variant = "warning"
        else:
            variant = "danger"
    
    percentage_text = f"{progress:.0f}%" if show_percentage else ""
    
    st.markdown(f"""
        <div style="margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span style="font-size: 0.85rem; color: {THOMAS_COLORS['text_secondary']};">{label}</span>
                <span style="font-size: 0.85rem; font-weight: 600; color: {THOMAS_COLORS['primary']};">{percentage_text}</span>
            </div>
            <div class="progress-container">
                <div class="progress-fill progress-fill-{variant}" style="width: {progress}%;"></div>
            </div>
        </div>
    """, unsafe_allow_html=True)


def render_confidence_indicator(
    candidate_confidence: float,
    benchmark_confidence: float,
    stage: str
) -> None:
    """Render confidence indicator comparing candidate to benchmark"""
    if candidate_confidence >= benchmark_confidence:
        status = "on-track"
        status_text = "On Track"
        icon = "✓"
    elif candidate_confidence >= benchmark_confidence - 10:
        status = "at-risk"
        status_text = "At Risk"
        icon = "!"
    else:
        status = "critical"
        status_text = "Below Benchmark"
        icon = "✗"
    
    st.markdown(f"""
        <div style="display: flex; align-items: center; gap: 1rem; margin: 0.5rem 0;">
            <span class="confidence-badge confidence-{status}">
                {icon} {status_text}
            </span>
            <span style="font-size: 0.85rem; color: {THOMAS_COLORS['text_secondary']};">
                {candidate_confidence:.0f}% confidence at {stage} (benchmark: {benchmark_confidence:.0f}%)
            </span>
        </div>
    """, unsafe_allow_html=True)


def render_ppa_chart(
    dominance: int,
    influence: int,
    steadiness: int,
    compliance: int,
    title: str = "PPA Profile (DISC)",
    comparison: Optional[Dict[str, int]] = None
) -> go.Figure:
    """Render a radar chart for PPA/DISC profile"""
    categories = ['Dominance', 'Influence', 'Steadiness', 'Compliance']
    values = [dominance, influence, steadiness, compliance]
    
    fig = go.Figure()
    
    # Add comparison trace if provided
    if comparison:
        comp_values = [
            comparison.get('ppa_dominance', 50),
            comparison.get('ppa_influence', 50),
            comparison.get('ppa_steadiness', 50),
            comparison.get('ppa_compliance', 50),
        ]
        fig.add_trace(go.Scatterpolar(
            r=comp_values + [comp_values[0]],
            theta=categories + [categories[0]],
            fill='toself',
            fillcolor=f'rgba(27, 54, 93, 0.15)',
            line=dict(color=THOMAS_COLORS['primary'], width=2, dash='dot'),
            name='Ideal Profile'
        ))
    
    # Add main trace
    fig.add_trace(go.Scatterpolar(
        r=values + [values[0]],
        theta=categories + [categories[0]],
        fill='toself',
        fillcolor=f'rgba(0, 169, 206, 0.25)',
        line=dict(color=THOMAS_COLORS['secondary'], width=3),
        name='Candidate'
    ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100],
                tickfont=dict(size=10, color=THOMAS_COLORS['text_secondary']),
                gridcolor=THOMAS_COLORS['neutral_light'],
            ),
            angularaxis=dict(
                tickfont=dict(size=12, color=THOMAS_COLORS['text_primary'], family='IBM Plex Sans'),
                gridcolor=THOMAS_COLORS['neutral_light'],
            ),
            bgcolor='white',
        ),
        showlegend=True if comparison else False,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.2,
            xanchor="center",
            x=0.5
        ),
        title=dict(
            text=title,
            font=dict(size=16, color=THOMAS_COLORS['primary'], family='IBM Plex Sans'),
        ),
        margin=dict(l=60, r=60, t=60, b=60),
        paper_bgcolor='white',
        height=350,
    )
    
    return fig


def render_hpti_chart(
    scores: Dict[str, int],
    title: str = "HPTI Leadership Traits"
) -> go.Figure:
    """Render a bar chart for HPTI scores"""
    traits = list(scores.keys())
    values = list(scores.values())
    
    # Determine colors based on value
    colors = []
    for v in values:
        if v >= 70:
            colors.append(THOMAS_COLORS['success'])
        elif v >= 50:
            colors.append(THOMAS_COLORS['secondary'])
        else:
            colors.append(THOMAS_COLORS['warning'])
    
    fig = go.Figure(data=[
        go.Bar(
            x=values,
            y=traits,
            orientation='h',
            marker=dict(
                color=colors,
                line=dict(width=0),
            ),
            text=[f'{v}%' for v in values],
            textposition='inside',
            textfont=dict(color='white', size=12, family='IBM Plex Sans'),
        )
    ])
    
    fig.update_layout(
        title=dict(
            text=title,
            font=dict(size=16, color=THOMAS_COLORS['primary'], family='IBM Plex Sans'),
        ),
        xaxis=dict(
            range=[0, 100],
            title='Score',
            gridcolor=THOMAS_COLORS['neutral_light'],
            tickfont=dict(color=THOMAS_COLORS['text_secondary']),
        ),
        yaxis=dict(
            tickfont=dict(size=11, color=THOMAS_COLORS['text_primary'], family='IBM Plex Sans'),
            categoryorder='total ascending',
        ),
        margin=dict(l=150, r=30, t=50, b=50),
        paper_bgcolor='white',
        plot_bgcolor='white',
        height=300,
    )
    
    return fig


def render_timeline_chart(
    data: pd.DataFrame,
    x_col: str,
    y_col: str,
    title: str = "Performance Trend",
    show_target: Optional[float] = None
) -> go.Figure:
    """Render a timeline/trend chart"""
    fig = go.Figure()
    
    # Add main line
    fig.add_trace(go.Scatter(
        x=data[x_col],
        y=data[y_col],
        mode='lines+markers',
        line=dict(color=THOMAS_COLORS['secondary'], width=3),
        marker=dict(size=10, color=THOMAS_COLORS['primary']),
        name=y_col.replace('_', ' ').title(),
        fill='tozeroy',
        fillcolor=f'rgba(0, 169, 206, 0.1)',
    ))
    
    # Add target line if provided
    if show_target:
        fig.add_hline(
            y=show_target,
            line_dash="dash",
            line_color=THOMAS_COLORS['success'],
            annotation_text="Target",
            annotation_position="bottom right",
        )
    
    fig.update_layout(
        title=dict(
            text=title,
            font=dict(size=16, color=THOMAS_COLORS['primary'], family='IBM Plex Sans'),
        ),
        xaxis=dict(
            gridcolor=THOMAS_COLORS['neutral_light'],
            tickfont=dict(color=THOMAS_COLORS['text_secondary']),
        ),
        yaxis=dict(
            gridcolor=THOMAS_COLORS['neutral_light'],
            tickfont=dict(color=THOMAS_COLORS['text_secondary']),
        ),
        margin=dict(l=50, r=30, t=50, b=50),
        paper_bgcolor='white',
        plot_bgcolor='white',
        height=300,
        showlegend=False,
    )
    
    return fig


def render_risk_badge(risk_level: str) -> str:
    """Return HTML for risk badge"""
    risk_class = f"risk-{risk_level.lower()}"
    icon = "🔴" if risk_level == "High" else "🟡" if risk_level == "Medium" else "🟢"
    return f'<span class="risk-badge {risk_class}">{icon} {risk_level}</span>'


def render_section_header(title: str, icon: str = "") -> None:
    """Render a styled section header"""
    st.markdown(f'<div class="section-header">{icon} {title}</div>', unsafe_allow_html=True)


def render_info_box(title: str, content: str) -> None:
    """Render an info/insight box"""
    st.markdown(f"""
        <div class="info-box">
            <div class="info-box-title">💡 {title}</div>
            <div style="color: {THOMAS_COLORS['text_secondary']}; font-size: 0.95rem; line-height: 1.6;">
                {content}
            </div>
        </div>
    """, unsafe_allow_html=True)


def render_candidate_stage_pipeline(candidates_by_stage: Dict[str, int]) -> go.Figure:
    """Render a funnel chart for candidate pipeline"""
    stages = list(candidates_by_stage.keys())
    counts = list(candidates_by_stage.values())
    
    # Colors gradient
    colors = [
        THOMAS_COLORS['neutral_mid'],
        THOMAS_COLORS['secondary'],
        '#0088A8',
        THOMAS_COLORS['primary'],
        THOMAS_COLORS['success'],
    ]
    
    fig = go.Figure(go.Funnel(
        y=stages,
        x=counts,
        textinfo="value+percent initial",
        textfont=dict(size=13, family='IBM Plex Sans', color='white'),
        marker=dict(color=colors[:len(stages)]),
        connector=dict(line=dict(color="white", width=2)),
    ))
    
    fig.update_layout(
        title=dict(
            text="Candidate Pipeline by Stage",
            font=dict(size=16, color=THOMAS_COLORS['primary'], family='IBM Plex Sans'),
        ),
        margin=dict(l=100, r=50, t=60, b=30),
        paper_bgcolor='white',
        height=320,
    )
    
    return fig


def render_weighted_score_breakdown(
    scores: Dict[str, float],
    weights: Dict[str, float],
    title: str = "Weighted Score Breakdown"
) -> go.Figure:
    """Render a waterfall chart showing weighted score contributions"""
    components = list(scores.keys())
    weighted_scores = [scores[k] * weights.get(k, 0) * 100 for k in components]
    
    fig = go.Figure(go.Waterfall(
        name="Score",
        orientation="v",
        measure=["relative"] * len(components) + ["total"],
        x=components + ["Total"],
        y=weighted_scores + [sum(weighted_scores)],
        text=[f"+{s:.1f}" for s in weighted_scores] + [f"{sum(weighted_scores):.1f}"],
        textposition="outside",
        textfont=dict(family='IBM Plex Sans'),
        connector=dict(line=dict(color=THOMAS_COLORS['neutral_mid'])),
        increasing=dict(marker=dict(color=THOMAS_COLORS['secondary'])),
        totals=dict(marker=dict(color=THOMAS_COLORS['primary'])),
    ))
    
    fig.update_layout(
        title=dict(
            text=title,
            font=dict(size=16, color=THOMAS_COLORS['primary'], family='IBM Plex Sans'),
        ),
        showlegend=False,
        xaxis=dict(tickfont=dict(size=10, family='IBM Plex Sans')),
        yaxis=dict(title="Points", gridcolor=THOMAS_COLORS['neutral_light']),
        margin=dict(l=50, r=30, t=60, b=50),
        paper_bgcolor='white',
        plot_bgcolor='white',
        height=350,
    )
    
    return fig
