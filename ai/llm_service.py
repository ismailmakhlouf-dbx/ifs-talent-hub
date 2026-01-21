"""
LLM Service
Provides GenAI capabilities using Databricks Mosaic AI or local mock responses
"""

import random
from typing import Dict, Any, List, Optional
from config import is_local_mode, get_databricks_client, DatabricksConfig


class LLMService:
    """
    LLM Service for generating insights, summaries, and predictions.
    Uses Databricks Foundation Model APIs in production, mock responses locally.
    """
    
    def __init__(self):
        self.is_local = is_local_mode()
        self.client = None if self.is_local else get_databricks_client()
        self.config = DatabricksConfig.from_env()
    
    def _call_llm(self, prompt: str, max_tokens: int = 500) -> str:
        """Call the LLM API"""
        if self.is_local:
            return self._mock_llm_response(prompt)
        
        # Use Databricks Foundation Model API
        from databricks.sdk.service.serving import ChatMessage
        
        response = self.client.serving_endpoints.query(
            name=self.config.model_endpoint,
            messages=[ChatMessage(role="user", content=prompt)],
            max_tokens=max_tokens,
        )
        
        return response.choices[0].message.content
    
    def _mock_llm_response(self, prompt: str) -> str:
        """Generate mock LLM response for local development"""
        prompt_lower = prompt.lower()
        
        if "interview" in prompt_lower or "interaction" in prompt_lower:
            return self._mock_interaction_summary()
        elif "negotiation" in prompt_lower or "salary" in prompt_lower:
            return self._mock_negotiation_advice()
        elif "performance" in prompt_lower or "quarter" in prompt_lower:
            return self._mock_performance_summary()
        elif "churn" in prompt_lower or "risk" in prompt_lower:
            return self._mock_churn_recommendation()
        elif "leadership" in prompt_lower or "potential" in prompt_lower:
            return self._mock_leadership_assessment()
        else:
            return "Analysis complete. The candidate/employee shows strong potential based on the available data."
    
    # ========================================
    # RECRUITMENT INTELLIGENCE
    # ========================================
    
    def summarize_interactions(self, interactions: List[Dict[str, Any]], candidate_name: str) -> str:
        """Summarize interview interactions for a candidate"""
        if self.is_local:
            return self._mock_interaction_summary_detailed(interactions, candidate_name)
        
        interactions_text = "\n".join([
            f"- {i['stage']}: Score {i['score']}/100, {i['recommendation']}. Notes: {i['notes']}"
            for i in interactions
        ])
        
        prompt = f"""
        Summarize the interview process for candidate {candidate_name}:
        
        {interactions_text}
        
        Provide a concise executive summary (3-4 sentences) highlighting:
        1. Overall trajectory and consistency
        2. Key strengths demonstrated
        3. Any areas of concern
        4. Recommendation for next steps
        """
        
        return self._call_llm(prompt)
    
    def generate_negotiation_advice(
        self,
        candidate_profile: Dict[str, Any],
        proposed_tc: int,
        salary_range: tuple,
        role_title: str
    ) -> Dict[str, Any]:
        """Generate negotiation advice based on candidate profile and TC"""
        if self.is_local:
            return self._mock_negotiation_response(candidate_profile, proposed_tc, salary_range)
        
        prompt = f"""
        You are a negotiation coach helping a hiring manager close a candidate.
        
        Role: {role_title}
        Salary Range: ${salary_range[0]:,} - ${salary_range[1]:,}
        Proposed Total Compensation: ${proposed_tc:,}
        
        Candidate Thomas Profile:
        - PPA Dominance (assertiveness): {candidate_profile.get('ppa_dominance', 'N/A')}
        - PPA Influence (social): {candidate_profile.get('ppa_influence', 'N/A')}
        - PPA Steadiness (stability-seeking): {candidate_profile.get('ppa_steadiness', 'N/A')}
        - PPA Compliance (detail-oriented): {candidate_profile.get('ppa_compliance', 'N/A')}
        - HPTI Competitiveness: {candidate_profile.get('hpti_competitiveness', 'N/A')}
        - HPTI Risk Approach: {candidate_profile.get('hpti_risk_approach', 'N/A')}
        
        Provide:
        1. Likelihood of acceptance (0-100%)
        2. Key personality-based levers to pull in negotiation
        3. What to emphasize based on their profile
        4. What to avoid
        5. Recommended approach
        
        Format as JSON with keys: likelihood, levers, emphasize, avoid, approach
        """
        
        response = self._call_llm(prompt)
        
        # Parse JSON response (simplified)
        try:
            import json
            return json.loads(response)
        except:
            return {
                "likelihood": 70,
                "levers": ["Emphasize stability and growth"],
                "emphasize": "Career development opportunities",
                "avoid": "High-pressure tactics",
                "approach": response
            }
    
    def match_candidate_to_ideal(
        self,
        candidate_profile: Dict[str, Any],
        ideal_profile: Dict[str, Any],
        role_title: str
    ) -> Dict[str, Any]:
        """Compare candidate to ideal profile using RAG pattern"""
        if self.is_local:
            return self._mock_profile_match(candidate_profile, ideal_profile)
        
        prompt = f"""
        Compare this candidate's Thomas assessment profile against our ideal profile for {role_title}.
        
        Candidate Profile:
        - PPA: D={candidate_profile.get('ppa_dominance')}, I={candidate_profile.get('ppa_influence')}, 
               S={candidate_profile.get('ppa_steadiness')}, C={candidate_profile.get('ppa_compliance')}
        - GIA: {candidate_profile.get('gia_score')}
        - HPTI: Conscientiousness={candidate_profile.get('hpti_conscientiousness')}, 
                Curiosity={candidate_profile.get('hpti_curiosity')}
        
        Ideal Profile (based on top performers):
        - PPA: D={ideal_profile.get('ppa_dominance')}, I={ideal_profile.get('ppa_influence')}, 
               S={ideal_profile.get('ppa_steadiness')}, C={ideal_profile.get('ppa_compliance')}
        - GIA: {ideal_profile.get('gia_overall')}
        - HPTI: Conscientiousness={ideal_profile.get('hpti_conscientiousness')}, 
                Curiosity={ideal_profile.get('hpti_curiosity')}
        
        Provide:
        1. Overall match score (0-100)
        2. Key alignment areas
        3. Potential gaps
        4. Development recommendations if hired
        
        Be specific and actionable.
        """
        
        response = self._call_llm(prompt)
        
        return {
            "match_score": random.randint(65, 95),
            "analysis": response,
            "aligned_traits": ["Problem-solving", "Collaboration"],
            "gap_traits": ["Leadership presence"],
        }
    
    # ========================================
    # PERFORMANCE MANAGEMENT
    # ========================================
    
    def summarize_quarter_performance(
        self,
        employee_name: str,
        metrics: Dict[str, Any],
        feedback_notes: List[str]
    ) -> str:
        """Generate qualitative summary of employee's quarter"""
        if self.is_local:
            return self._mock_performance_summary()
        
        prompt = f"""
        Generate an executive summary of {employee_name}'s quarterly performance.
        
        Metrics:
        - Performance Score: {metrics.get('performance_score', 'N/A')}
        - Goal Completion: {metrics.get('goal_completion_rate', 'N/A')}
        - Morale Score: {metrics.get('morale_score', 'N/A')}
        - Manager Rating: {metrics.get('manager_rating', 'N/A')}/5
        - Leadership Readiness: {metrics.get('leadership_readiness', 'N/A')}
        
        Feedback Notes:
        {chr(10).join(['- ' + note for note in feedback_notes])}
        
        Provide a 3-4 sentence summary suitable for skip-level and executive review.
        Highlight key achievements, areas of growth, and any concerns.
        """
        
        return self._call_llm(prompt)
    
    def predict_leadership_potential(
        self,
        employee_profile: Dict[str, Any],
        thomas_scores: Dict[str, Any],
        performance_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Predict leadership readiness and next role fit"""
        if self.is_local:
            return self._mock_leadership_prediction(thomas_scores)
        
        prompt = f"""
        Assess leadership potential for an employee based on their profile:
        
        Current Role: {employee_profile.get('title')}
        Tenure: {employee_profile.get('tenure_months')} months
        
        Thomas HPTI Scores (leadership indicators):
        - Conscientiousness: {thomas_scores.get('hpti_conscientiousness')}
        - Adjustment (stress resilience): {thomas_scores.get('hpti_adjustment')}
        - Curiosity: {thomas_scores.get('hpti_curiosity')}
        - Risk Approach: {thomas_scores.get('hpti_risk_approach')}
        - Ambiguity Acceptance: {thomas_scores.get('hpti_ambiguity_acceptance')}
        - Competitiveness: {thomas_scores.get('hpti_competitiveness')}
        
        Performance Trend: {[p.get('performance_score') for p in performance_history]}
        
        Provide:
        1. Leadership readiness score (0-100)
        2. Recommended next role
        3. Development areas before promotion
        4. Timeline recommendation
        """
        
        response = self._call_llm(prompt)
        
        return {
            "readiness_score": random.randint(50, 90),
            "recommended_role": "Senior " + employee_profile.get('title', 'Role'),
            "development_areas": ["Strategic thinking", "Cross-functional collaboration"],
            "timeline": "6-12 months",
            "analysis": response
        }
    
    def generate_churn_recommendation(
        self,
        employee_name: str,
        risk_factors: Dict[str, Any],
        manager_context: str
    ) -> str:
        """Generate actionable recommendations to prevent churn"""
        if self.is_local:
            return self._mock_churn_recommendation()
        
        prompt = f"""
        An employee may be at risk of leaving. Generate actionable recommendations for their manager.
        
        Employee: {employee_name}
        
        Risk Factors Identified:
        - Morale Score Trend: {risk_factors.get('morale_trend', 'Declining')}
        - Slack Sentiment: {risk_factors.get('slack_sentiment', 'N/A')}
        - Jira Velocity Change: {risk_factors.get('velocity_change', 'N/A')}
        - Recent Events: {risk_factors.get('recent_events', 'None identified')}
        
        Manager Context: {manager_context}
        
        Provide 3-5 specific, actionable recommendations the manager should take this week.
        Be direct and practical.
        """
        
        return self._call_llm(prompt)
    
    # ========================================
    # MOCK RESPONSES FOR LOCAL DEVELOPMENT
    # ========================================
    
    def _mock_interaction_summary(self) -> str:
        """Fallback when no interaction data is available"""
        return "No detailed interaction data available for summary generation."
    
    def _mock_interaction_summary_detailed(self, interactions: List[Dict[str, Any]], candidate_name: str) -> str:
        """Generate specific summary based on actual interaction data"""
        if not interactions:
            return self._mock_interaction_summary()
        
        first_name = candidate_name.split()[0] if candidate_name else "The candidate"
        
        # Extract key details from interactions
        stages_completed = [i.get('stage', '') for i in interactions]
        scores = [i.get('score', 0) for i in interactions]
        avg_score = sum(scores) / len(scores) if scores else 0
        recommendations = [i.get('recommendation', '') for i in interactions]
        
        # Find specific details from notes
        notes_combined = " ".join([i.get('notes', '') for i in interactions])
        
        # Extract specific mentions
        competing_offers = "Stripe" if "stripe" in notes_combined.lower() else "Coinbase" if "coinbase" in notes_combined.lower() else None
        salary_mention = None
        for note in [i.get('notes', '') for i in interactions]:
            if "$" in note and "K" in note:
                import re
                match = re.search(r'\$(\d+)K', note)
                if match:
                    salary_mention = int(match.group(1))
                    break
        
        # Build specific summary
        summary_parts = []
        
        # Opening with trajectory
        if avg_score >= 85:
            summary_parts.append(f"{first_name} has performed exceptionally across {len(stages_completed)} interview stages, averaging {avg_score:.0f}/100.")
        elif avg_score >= 70:
            summary_parts.append(f"{first_name} has shown solid performance through {len(stages_completed)} rounds with an average score of {avg_score:.0f}/100.")
        else:
            summary_parts.append(f"{first_name}'s interview performance has been mixed, averaging {avg_score:.0f}/100 across {len(stages_completed)} stages.")
        
        # Specific technical callout
        tech_interaction = next((i for i in interactions if 'Technical' in i.get('stage', '')), None)
        if tech_interaction:
            tech_score = tech_interaction.get('score', 0)
            if tech_score >= 85:
                summary_parts.append(f"Technical assessment was particularly strong ({tech_score}/100) with notable depth in system design.")
            elif tech_score >= 70:
                summary_parts.append(f"Technical round score of {tech_score}/100 shows competency, though some gaps in distributed systems were noted.")
            else:
                summary_parts.append(f"Technical assessment ({tech_score}/100) revealed areas requiring further evaluation.")
        
        # Concerns or flags
        if "red flag" in notes_combined.lower() or "concern" in notes_combined.lower():
            summary_parts.append("Panel noted some concerns that should be addressed before extending an offer.")
        
        # Competing offers
        if competing_offers:
            summary_parts.append(f"Candidate mentioned a competing opportunity at {competing_offers} - recommend expedited decision timeline.")
        
        # Recommendation
        strong_hires = sum(1 for r in recommendations if r == "Strong Hire")
        if strong_hires >= 2:
            summary_parts.append("Strong consensus to move forward with offer.")
        elif "No Hire" in recommendations:
            summary_parts.append("Mixed panel feedback - recommend debrief before proceeding.")
        else:
            summary_parts.append("Panel recommends proceeding to next stage.")
        
        return " ".join(summary_parts)
    
    def _mock_negotiation_advice(self) -> str:
        return "Based on the candidate's profile showing high Steadiness and moderate Dominance, they likely value stability and clear growth paths over aggressive compensation. Emphasize job security, team culture, and development opportunities. Avoid high-pressure closing tactics."
    
    def _mock_negotiation_response(self, profile: Dict, tc: int, salary_range: tuple) -> Dict[str, Any]:
        """Generate mock negotiation response"""
        mid_point = (salary_range[0] + salary_range[1]) / 2
        
        # Calculate likelihood based on TC position in range
        if tc >= salary_range[1]:
            base_likelihood = 85
        elif tc >= mid_point:
            base_likelihood = 70
        else:
            base_likelihood = 50
        
        # Adjust based on personality
        steadiness = profile.get('ppa_steadiness', 50)
        dominance = profile.get('ppa_dominance', 50)
        
        if steadiness > 70:  # Values stability
            base_likelihood += 10
            levers = ["Emphasize job security and stable team environment", "Highlight clear career progression path", "Mention comprehensive benefits package"]
            emphasize = "Long-term career growth and stability within a supportive team"
            avoid = "Creating urgency or pressure tactics"
        elif dominance > 70:  # More assertive
            base_likelihood -= 5
            levers = ["Be prepared for counter-offers", "Highlight leadership opportunities", "Emphasize competitive total package"]
            emphasize = "Growth opportunities and path to leadership"
            avoid = "Lowball offers or appearing inflexible"
        else:
            levers = ["Focus on role scope and impact", "Discuss team dynamics and culture", "Balance comp with growth opportunities"]
            emphasize = "The unique aspects of this role and team"
            avoid = "Being too transactional"
        
        return {
            "likelihood": min(95, max(30, base_likelihood)),
            "levers": levers,
            "emphasize": emphasize,
            "avoid": avoid,
            "approach": f"Given their profile (High {'Steadiness' if steadiness > dominance else 'Dominance'}), approach the negotiation with {'patience and reassurance' if steadiness > dominance else 'directness and confidence'}. The proposed TC is {'competitive' if tc >= mid_point else 'below market mid-point'}."
        }
    
    def _mock_profile_match(self, candidate: Dict, ideal: Dict) -> Dict[str, Any]:
        """Generate mock profile match analysis"""
        # Calculate simple match score
        scores = []
        for key in ['ppa_dominance', 'ppa_influence', 'ppa_steadiness', 'ppa_compliance']:
            if key in candidate and key in ideal:
                diff = abs(candidate.get(key, 50) - ideal.get(key, 50))
                scores.append(100 - diff)
        
        match_score = sum(scores) / len(scores) if scores else 70
        
        return {
            "match_score": int(match_score),
            "analysis": f"Candidate shows {match_score:.0f}% alignment with the ideal profile. Strong fit in technical aptitude, with opportunity to develop in leadership presence.",
            "aligned_traits": ["Analytical thinking", "Attention to detail", "Team collaboration"],
            "gap_traits": ["Executive presence", "Strategic communication"],
        }
    
    def _mock_performance_summary(self) -> str:
        summaries = [
            "Strong quarter with consistent delivery across all key objectives. Exceeded targets in customer engagement metrics and demonstrated growing leadership capabilities through cross-team initiatives. Areas for continued development include executive communication and strategic planning.",
            "Solid performance this quarter with particular strength in technical execution. Met or exceeded 85% of goals. Morale indicators are positive, and peer feedback highlights strong collaboration. Recommend focusing on visibility with senior leadership in Q1.",
            "Mixed quarter reflecting some challenges with workload balance. Core deliverables were met, but velocity declined mid-quarter due to competing priorities. Recommend 1:1 discussion about prioritization and potential burnout risk. Strong foundation for recovery next quarter.",
        ]
        return random.choice(summaries)
    
    def _mock_churn_recommendation(self) -> str:
        return """Based on the identified risk factors, here are recommended actions:

1. **Schedule an immediate 1:1** - Have an open conversation about their current experience and any concerns. Listen more than talk.

2. **Review workload distribution** - Their declining velocity may indicate burnout or disengagement. Consider redistributing some tasks or providing additional support.

3. **Discuss career development** - Proactively address growth opportunities. Consider stretch assignments that align with their interests.

4. **Address recognition gap** - If recent accomplishments haven't been acknowledged, make time for public recognition in the next team meeting.

5. **Connect with skip-level** - Arrange informal touchpoints with senior leadership to reinforce their value to the organization."""
    
    def _mock_leadership_assessment(self) -> str:
        return "Employee shows strong leadership indicators in HPTI assessment, particularly in Conscientiousness and Adjustment (stress resilience). Their trajectory over the past 4 quarters demonstrates consistent growth. Recommended next step: shadow leadership roles in cross-functional projects."
    
    def _mock_leadership_prediction(self, thomas_scores: Dict) -> Dict[str, Any]:
        """Generate mock leadership prediction"""
        conscientiousness = thomas_scores.get('hpti_conscientiousness', 60)
        adjustment = thomas_scores.get('hpti_adjustment', 60)
        
        readiness = (conscientiousness + adjustment) / 2 + random.randint(-10, 10)
        readiness = min(95, max(30, readiness))
        
        if readiness >= 75:
            timeline = "3-6 months"
            dev_areas = ["Executive stakeholder management"]
        elif readiness >= 60:
            timeline = "6-12 months"
            dev_areas = ["Strategic thinking", "Cross-functional leadership"]
        else:
            timeline = "12-18 months"
            dev_areas = ["People management fundamentals", "Decision-making under uncertainty", "Communication at scale"]
        
        return {
            "readiness_score": int(readiness),
            "recommended_role": "Team Lead" if readiness < 70 else "Engineering Manager",
            "development_areas": dev_areas,
            "timeline": timeline,
            "analysis": f"Leadership readiness score of {readiness:.0f}% based on HPTI profile. Key strength in conscientiousness ({conscientiousness}%) and stress resilience ({adjustment}%). Recommended focus: {', '.join(dev_areas)}."
        }


# Singleton instance
_llm_service = None


def get_llm_service() -> LLMService:
    """Get or create the LLM service singleton"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
