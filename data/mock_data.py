"""
Mock Data Generator
Generates realistic mock data for local development and testing
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import pandas as pd
from faker import Faker

# Import currency utilities for consistent FX conversion
from data.currency import (
    FX_RATES, 
    CURRENCY_CONFIG, 
    convert_gbp_to_currency, 
    convert_currency_to_gbp,
    format_currency,
    get_currency_config,
    get_fx_rate,
    get_salary_multiplier,
    convert_salary_range,
    generate_expected_salary,
    LOCATIONS as CURRENCY_LOCATIONS
)

fake = Faker()
Faker.seed(42)
random.seed(42)


class MockDataGenerator:
    """Generates mock data for the Unified Talent Management Hub"""
    
    # Thomas International Assessment Trait Definitions
    PPA_TRAITS = ["Dominance", "Influence", "Steadiness", "Compliance"]
    HPTI_TRAITS = ["Conscientiousness", "Adjustment", "Curiosity", "Risk_Approach", "Ambiguity_Acceptance", "Competitiveness"]
    
    # Location definitions - use imported CURRENCY_LOCATIONS for proper FX rates
    # All salary conversions use the centralized FX_RATES from currency.py
    # - GBP: "£60,000" (1 GBP = 1 GBP)
    # - USD: "$76,200" (1 GBP = 1.27 USD)
    # - SEK: "792,000 SEK" (1 GBP = 13.20 SEK)
    LOCATIONS = CURRENCY_LOCATIONS
    
    # ===========================================
    # IFS ORGANIZATIONAL STRUCTURE
    # Enterprise Cloud Software Company
    # ~7000 employees, €1B+ revenue
    # Key divisions: R&D, ERP, EAM, FSM, Industrial AI
    # ===========================================
    
    # Role definitions (base salaries in GBP) - IC roles for hiring
    ROLES = [
        # R&D / Engineering
        {"title": "Senior Cloud Engineer", "department": "R&D", "level": "L5", "base_salary": 85000, "max_salary": 120000, "industry_avg": 95000, "company_avg": 92000},
        {"title": "Staff Platform Engineer", "department": "R&D", "level": "L6", "base_salary": 110000, "max_salary": 160000, "industry_avg": 125000, "company_avg": 118000},
        {"title": "Industrial AI Engineer", "department": "Industrial AI", "level": "L5", "base_salary": 95000, "max_salary": 135000, "industry_avg": 105000, "company_avg": 100000},
        {"title": "Senior AI/ML Engineer", "department": "Industrial AI", "level": "L6", "base_salary": 115000, "max_salary": 165000, "industry_avg": 130000, "company_avg": 125000},
        # ERP / EAM / FSM Product
        {"title": "ERP Solutions Architect", "department": "ERP", "level": "L5", "base_salary": 90000, "max_salary": 130000, "industry_avg": 100000, "company_avg": 95000},
        {"title": "Field Service Consultant", "department": "FSM", "level": "L4", "base_salary": 65000, "max_salary": 95000, "industry_avg": 75000, "company_avg": 72000},
        {"title": "Asset Management Specialist", "department": "EAM", "level": "L4", "base_salary": 60000, "max_salary": 90000, "industry_avg": 70000, "company_avg": 68000},
        # Customer Success / Sales
        {"title": "Enterprise Account Executive", "department": "Sales", "level": "L5", "base_salary": 75000, "max_salary": 120000, "industry_avg": 85000, "company_avg": 82000},
        {"title": "Customer Success Manager", "department": "Customer Success", "level": "L4", "base_salary": 55000, "max_salary": 85000, "industry_avg": 65000, "company_avg": 62000},
    ]
    
    # Manager roles with IFS-specific departments
    MANAGER_ROLES = [
        # R&D Leadership (30% of workforce per IFS stats)
        {"title": "VP of R&D", "department": "R&D", "level": "VP", "base_salary": 185000, "max_salary": 260000},
        {"title": "Director of Cloud Platform", "department": "R&D", "level": "D1", "base_salary": 150000, "max_salary": 200000},
        {"title": "Engineering Manager - IFS Cloud", "department": "R&D", "level": "M1", "base_salary": 125000, "max_salary": 170000},
        # Industrial AI Division
        {"title": "Head of Industrial AI", "department": "Industrial AI", "level": "D1", "base_salary": 160000, "max_salary": 220000},
        # Product Divisions
        {"title": "VP of ERP Solutions", "department": "ERP", "level": "VP", "base_salary": 175000, "max_salary": 240000},
        {"title": "Director of Field Service Mgmt", "department": "FSM", "level": "D1", "base_salary": 140000, "max_salary": 190000},
        {"title": "Head of Asset Management", "department": "EAM", "level": "D1", "base_salary": 135000, "max_salary": 185000},
        # Go-to-Market
        {"title": "VP of Enterprise Sales", "department": "Sales", "level": "VP", "base_salary": 165000, "max_salary": 230000},
    ]
    
    INTERVIEW_STAGES = [
        {"name": "Screening", "order": 1, "benchmark_confidence": 25, "weight": 0.10},
        {"name": "Phone Interview", "order": 2, "benchmark_confidence": 35, "weight": 0.15},
        {"name": "Technical Assessment", "order": 3, "benchmark_confidence": 50, "weight": 0.25},
        {"name": "Onsite Interview", "order": 4, "benchmark_confidence": 70, "weight": 0.30},
        {"name": "Final Round", "order": 5, "benchmark_confidence": 85, "weight": 0.20},
    ]
    
    def __init__(self):
        self._employees = None
        self._candidates = None
        self._open_roles = None
        self._thomas_assessments = None
        self._interaction_logs = None
        self._performance_metrics = None
        self._analytics_defaults = None
        self._manager_overrides = None
        self._referrals = None
        self._referral_insights = {}
        self._bias_cache = {}
        self._location_index = 0  # For round-robin location assignment
    
    # ========================================
    # HELPER METHODS
    # ========================================
    
    def _get_balanced_location(self):
        """Get a location with balanced distribution across UK, Sweden, US"""
        # Group locations by country
        uk_locations = [loc for loc in self.LOCATIONS if loc["country"] == "United Kingdom"]
        se_locations = [loc for loc in self.LOCATIONS if loc["country"] == "Sweden"]
        us_locations = [loc for loc in self.LOCATIONS if loc["country"] == "United States"]
        
        # Round-robin through countries for balance
        country_groups = [uk_locations, se_locations, us_locations]
        selected_group = country_groups[self._location_index % 3]
        self._location_index += 1
        
        return random.choice(selected_group)
    
    def _format_salary(self, base_salary_gbp: int, location: dict) -> tuple:
        """
        Convert GBP base salary to local currency and format correctly using FX rates.
        Returns (formatted_string, raw_value, currency, symbol)
        
        Uses centralized FX_RATES:
        - GBP: "£60,000" (1:1)
        - USD: "$76,200" (1 GBP = 1.27 USD)
        - SEK: "792,000 SEK" (1 GBP = 13.20 SEK)
        """
        currency = location.get("currency", "GBP")
        
        # Use centralized conversion function
        local_salary = convert_gbp_to_currency(base_salary_gbp, currency)
        
        # Apply cost-of-living adjustment if present
        cost_adj = location.get("cost_adjustment", 1.0)
        local_salary = round((local_salary * cost_adj) / 1000) * 1000
        
        # Get currency config
        config = get_currency_config(currency)
        symbol = config["symbol"]
        symbol_position = config["position"]
        
        # Format the string
        formatted = format_currency(local_salary, currency)
        
        return formatted, local_salary, currency, symbol
    
    def _get_realistic_salary_range(self, base_min: int, base_max: int, location: dict) -> tuple:
        """Get realistic salary range for a location using FX rates"""
        return convert_salary_range(base_min, base_max, location)
    
    # ========================================
    # EMPLOYEE DATA
    # ========================================
    
    def generate_employees(self, n: int = 50) -> pd.DataFrame:
        """Generate employee data with Thomas assessments"""
        if self._employees is not None:
            return self._employees
        
        employees = []
        managers = []
        manager_details = []
        
        # First, create all 8 managers with proper manager titles
        for i in range(8):
            manager_id = f"EMP-{1000 + i}"
            manager_role = self.MANAGER_ROLES[i % len(self.MANAGER_ROLES)]
            managers.append(manager_id)
            manager_details.append({
                "id": manager_id,
                "department": manager_role["department"]
            })
        
        # Generate managers first (first 8 employees)
        for i in range(8):
            emp_id = f"EMP-{1000 + i}"
            manager_role = self.MANAGER_ROLES[i % len(self.MANAGER_ROLES)]
            
            # VP and Directors report to execs or no one, Managers report to Directors/VPs
            if manager_role["level"] == "VP":
                assigned_manager_id = None
            elif manager_role["level"] == "D1":
                # Find a VP in the same department
                vp_in_dept = [m for j, m in enumerate(manager_details[:i]) if 
                              self.MANAGER_ROLES[j % len(self.MANAGER_ROLES)]["level"] == "VP" and
                              self.MANAGER_ROLES[j % len(self.MANAGER_ROLES)]["department"] == manager_role["department"]]
                assigned_manager_id = vp_in_dept[0]["id"] if vp_in_dept else None
            else:  # M1
                # Find a Director in same department
                d1_in_dept = [m for j, m in enumerate(manager_details[:i]) if 
                              self.MANAGER_ROLES[j % len(self.MANAGER_ROLES)]["level"] == "D1" and
                              self.MANAGER_ROLES[j % len(self.MANAGER_ROLES)]["department"] == manager_role["department"]]
                assigned_manager_id = d1_in_dept[0]["id"] if d1_in_dept else managers[0] if managers else None
            
            hire_date = (datetime.now() - timedelta(days=random.randint(365, 2555))).date()  # 1-7 years tenure for managers
            
            employees.append({
                "employee_id": emp_id,
                "name": fake.name(),
                "email": fake.company_email(),
                "title": manager_role["title"],
                "department": manager_role["department"],
                "level": manager_role["level"],
                "manager_id": assigned_manager_id,
                "hire_date": hire_date,
                "tenure_months": (datetime.now().date() - hire_date).days // 30,
                "location": random.choice(["London", "New York", "San Francisco", "Dublin"]),
                "salary": random.randint(manager_role["base_salary"], manager_role["max_salary"]),
                "is_manager": True,
            })
        
        # Now generate regular employees (remaining n-8 employees)
        for i in range(8, n):
            emp_id = f"EMP-{1000 + i}"
            role = random.choice(self.ROLES)
            
            # Assign employee to a manager in the same department
            matching_managers = [m for j, m in enumerate(manager_details) if m["department"] == role["department"]]
            if matching_managers:
                assigned_manager_id = random.choice(matching_managers)["id"]
            else:
                # Fallback to any manager
                assigned_manager_id = random.choice(managers)
            
            hire_date = (datetime.now() - timedelta(days=random.randint(90, 1825))).date()
            
            employees.append({
                "employee_id": emp_id,
                "name": fake.name(),
                "email": fake.company_email(),
                "title": role["title"],
                "department": role["department"],
                "level": role["level"],
                "manager_id": assigned_manager_id,
                "hire_date": hire_date,
                "tenure_months": (datetime.now().date() - hire_date).days // 30,
                "location": random.choice(["San Francisco", "New York", "Austin", "Seattle", "London", "Remote"]),
                "salary": random.randint(role["base_salary"], role["max_salary"]),
                "is_manager": False,
            })
        
        self._employees = pd.DataFrame(employees)
        return self._employees
    
    def generate_thomas_assessments(self) -> pd.DataFrame:
        """Generate Thomas International assessment data (PPA, GIA, HPTI)"""
        if self._thomas_assessments is not None:
            return self._thomas_assessments
        
        employees = self.generate_employees()
        assessments = []
        
        for _, emp in employees.iterrows():
            # PPA (Personal Profile Analysis) - DISC-based
            ppa_scores = {
                "Dominance": random.randint(20, 95),
                "Influence": random.randint(20, 95),
                "Steadiness": random.randint(20, 95),
                "Compliance": random.randint(20, 95),
            }
            
            # Adjust based on role (stereotypical patterns)
            if "Sales" in emp["department"]:
                ppa_scores["Dominance"] = random.randint(60, 95)
                ppa_scores["Influence"] = random.randint(70, 95)
            elif "Engineering" in emp["department"]:
                ppa_scores["Compliance"] = random.randint(60, 95)
                ppa_scores["Steadiness"] = random.randint(50, 85)
            elif "Product" in emp["department"]:
                ppa_scores["Influence"] = random.randint(55, 90)
                ppa_scores["Dominance"] = random.randint(50, 85)
            
            # GIA (General Intelligence Assessment)
            gia_score = random.randint(70, 130)
            gia_components = {
                "Perceptual_Speed": random.randint(60, 140),
                "Reasoning": random.randint(60, 140),
                "Number_Speed": random.randint(60, 140),
                "Word_Meaning": random.randint(60, 140),
                "Spatial_Visualization": random.randint(60, 140),
            }
            
            # HPTI (High Potential Trait Indicator)
            hpti_scores = {trait: random.randint(30, 95) for trait in self.HPTI_TRAITS}
            
            # Higher leadership scores for managers
            if emp["is_manager"]:
                hpti_scores["Conscientiousness"] = random.randint(70, 95)
                hpti_scores["Adjustment"] = random.randint(65, 95)
                hpti_scores["Ambiguity_Acceptance"] = random.randint(60, 90)
            
            assessments.append({
                "employee_id": emp["employee_id"],
                "assessment_date": (datetime.now() - timedelta(days=random.randint(30, 730))).date(),
                "ppa_dominance": ppa_scores["Dominance"],
                "ppa_influence": ppa_scores["Influence"],
                "ppa_steadiness": ppa_scores["Steadiness"],
                "ppa_compliance": ppa_scores["Compliance"],
                "gia_overall": gia_score,
                "gia_perceptual_speed": gia_components["Perceptual_Speed"],
                "gia_reasoning": gia_components["Reasoning"],
                "gia_number_speed": gia_components["Number_Speed"],
                "gia_word_meaning": gia_components["Word_Meaning"],
                "gia_spatial": gia_components["Spatial_Visualization"],
                "hpti_conscientiousness": hpti_scores["Conscientiousness"],
                "hpti_adjustment": hpti_scores["Adjustment"],
                "hpti_curiosity": hpti_scores["Curiosity"],
                "hpti_risk_approach": hpti_scores["Risk_Approach"],
                "hpti_ambiguity_acceptance": hpti_scores["Ambiguity_Acceptance"],
                "hpti_competitiveness": hpti_scores["Competitiveness"],
            })
        
        self._thomas_assessments = pd.DataFrame(assessments)
        return self._thomas_assessments
    
    # ========================================
    # RECRUITMENT DATA
    # ========================================
    
    def generate_open_roles(self, n: int = 8) -> pd.DataFrame:
        """Generate open roles with target hiring dates - ensures every manager has roles"""
        if self._open_roles is not None:
            return self._open_roles
        
        # Get all managers
        employees = self.generate_employees()
        managers = employees[employees["is_manager"] == True]
        
        # Create a mapping of departments to possible role titles
        # Expand ROLES to cover all departments managers might have
        dept_to_roles = {
            "R&D": [
                {"title": "Senior Cloud Engineer", "level": "L5", "base_salary": 85000, "max_salary": 120000, "industry_avg": 95000, "company_avg": 92000},
                {"title": "Staff Platform Engineer", "level": "L6", "base_salary": 110000, "max_salary": 160000, "industry_avg": 125000, "company_avg": 118000},
                {"title": "Principal Software Engineer", "level": "L7", "base_salary": 130000, "max_salary": 180000, "industry_avg": 145000, "company_avg": 140000},
            ],
            "Industrial AI": [
                {"title": "Industrial AI Engineer", "level": "L5", "base_salary": 95000, "max_salary": 135000, "industry_avg": 105000, "company_avg": 100000},
                {"title": "Senior AI/ML Engineer", "level": "L6", "base_salary": 115000, "max_salary": 165000, "industry_avg": 130000, "company_avg": 125000},
            ],
            "ERP": [
                {"title": "ERP Solutions Architect", "level": "L5", "base_salary": 90000, "max_salary": 130000, "industry_avg": 100000, "company_avg": 95000},
                {"title": "Senior ERP Consultant", "level": "L5", "base_salary": 80000, "max_salary": 115000, "industry_avg": 90000, "company_avg": 88000},
            ],
            "FSM": [
                {"title": "Field Service Consultant", "level": "L4", "base_salary": 65000, "max_salary": 95000, "industry_avg": 75000, "company_avg": 72000},
                {"title": "Senior FSM Developer", "level": "L5", "base_salary": 80000, "max_salary": 115000, "industry_avg": 90000, "company_avg": 88000},
            ],
            "EAM": [
                {"title": "Asset Management Specialist", "level": "L4", "base_salary": 60000, "max_salary": 90000, "industry_avg": 70000, "company_avg": 68000},
                {"title": "Senior Asset Management Consultant", "level": "L5", "base_salary": 75000, "max_salary": 105000, "industry_avg": 85000, "company_avg": 82000},
            ],
            "Sales": [
                {"title": "Enterprise Account Executive", "level": "L5", "base_salary": 75000, "max_salary": 120000, "industry_avg": 85000, "company_avg": 82000},
                {"title": "Senior Sales Engineer", "level": "L5", "base_salary": 85000, "max_salary": 125000, "industry_avg": 95000, "company_avg": 92000},
            ],
            "Customer Success": [
                {"title": "Customer Success Manager", "level": "L4", "base_salary": 55000, "max_salary": 85000, "industry_avg": 65000, "company_avg": 62000},
                {"title": "Senior Customer Success Manager", "level": "L5", "base_salary": 70000, "max_salary": 100000, "industry_avg": 80000, "company_avg": 78000},
            ],
        }
        
        roles = []
        role_counter = 0
        
        # Ensure every manager gets at least 2 roles, with 1 being Critical
        for _, mgr in managers.iterrows():
            manager_id = mgr["employee_id"]
            dept = mgr["department"]
            
            # Get roles for this department
            available_roles = dept_to_roles.get(dept, dept_to_roles["R&D"])  # Default to R&D if not found
            
            # Each manager gets 2-3 roles
            num_roles_for_manager = random.randint(2, 3)
            
            for j in range(num_roles_for_manager):
                role_template = available_roles[j % len(available_roles)]
                location = self._get_balanced_location()
                
                # First role for each manager is Critical, second is High, rest are random
                if j == 0:
                    days_ahead = random.randint(3, 7)  # Critical - very urgent
                    priority = "Critical"
                elif j == 1:
                    days_ahead = random.randint(8, 14)  # High priority
                    priority = "High"
                else:
                    days_ahead = random.randint(21, 60)
                    priority = random.choice(["Medium", "Low"])
            
                target_date = (datetime.now() + timedelta(days=days_ahead)).date()
                days_until_target = days_ahead
                
                # Calculate milestones working backwards
                offer_date = target_date - timedelta(days=7)
                final_round_date = offer_date - timedelta(days=10)
                onsite_date = final_round_date - timedelta(days=14)
                tech_assessment_date = onsite_date - timedelta(days=10)
                phone_interview_date = tech_assessment_date - timedelta(days=7)
                
                # Calculate milestone statuses based on current date
                today = datetime.now().date()
                
                def get_milestone_status(milestone_date, candidates_at_stage):
                    if milestone_date < today:
                        return "completed" if candidates_at_stage > 0 else "missed"
                    elif (milestone_date - today).days <= 3:
                        return "at_risk" if candidates_at_stage < 2 else "on_track"
                    else:
                        return "upcoming"
                
                # Simulate candidates at each stage
                candidates_phone = random.randint(3, 8)
                candidates_tech = random.randint(2, 5)
                candidates_onsite = random.randint(1, 4)
                candidates_final = random.randint(0, 2)
                candidates_offer = random.randint(0, 1)
                
                # ROLES are ALWAYS in GBP (company standard currency)
                # Location is for where the role is based, but salary shown in GBP
                base_salary_gbp = role_template["base_salary"]
                max_salary_gbp = role_template["max_salary"]
                industry_avg_gbp = role_template["industry_avg"]
                company_avg_gbp = role_template["company_avg"]
                
                # Calculate local currency equivalent using centralized FX rates
                local_currency = location.get("currency", "GBP")
                base_salary_local, max_salary_local = convert_salary_range(
                    base_salary_gbp, max_salary_gbp, location
                )
                # Get the actual multiplier used (for reference)
                salary_mult = get_salary_multiplier(location)
                
                roles.append({
                    "role_id": f"REQ-{2024000 + role_counter}",
                    "title": role_template["title"],
                    "department": dept,
                    "level": role_template["level"],
                    "hiring_manager_id": manager_id,
                    "status": "Open",
                    "priority": priority,
                    "target_hire_date": target_date,
                    "days_until_target": days_until_target,
                    "is_urgent": days_until_target <= 14,
                    # Milestones with dates and status
                    "target_offer_date": offer_date,
                    "target_final_round": final_round_date,
                    "target_onsite": onsite_date,
                    "target_tech_assessment": tech_assessment_date,
                    "target_phone_interview": phone_interview_date,
                    # Milestone statuses
                    "milestone_phone_status": get_milestone_status(phone_interview_date, candidates_phone),
                    "milestone_tech_status": get_milestone_status(tech_assessment_date, candidates_tech),
                    "milestone_onsite_status": get_milestone_status(onsite_date, candidates_onsite),
                    "milestone_final_status": get_milestone_status(final_round_date, candidates_final),
                    "milestone_offer_status": get_milestone_status(offer_date, candidates_offer),
                    # Candidates at each stage
                    "candidates_phone": candidates_phone,
                    "candidates_tech": candidates_tech,
                    "candidates_onsite": candidates_onsite,
                    "candidates_final": candidates_final,
                    "candidates_offer": candidates_offer,
                    # Location info
                    "city": location["city"],
                    "country": location["country"],
                    # Role salary is ALWAYS in GBP (company standard)
                    "currency": "GBP",
                    "currency_symbol": "£",
                    "symbol_position": "before",
                    # Salary info in GBP (company standard)
                    "min_salary": base_salary_gbp,
                    "max_salary": max_salary_gbp,
                    "industry_avg_salary": industry_avg_gbp,
                    "company_avg_salary": company_avg_gbp,
                    # Local currency equivalent for reference (using FX rates)
                    "local_currency": local_currency,
                    "local_currency_symbol": get_currency_config(local_currency)["symbol"],
                    "local_symbol_position": get_currency_config(local_currency)["position"],
                    "min_salary_local": base_salary_local,
                    "max_salary_local": max_salary_local,
                    "salary_multiplier": salary_mult,
                    "fx_rate": get_fx_rate(local_currency),
                    # Realistic interview targets: 2-6 per week depending on urgency
                    "required_interviews_per_week": min(6, max(2, 7 - days_until_target // 10)),
                    "current_pipeline_count": candidates_phone + candidates_tech + candidates_onsite + candidates_final + candidates_offer,
                    "created_date": (datetime.now() - timedelta(days=random.randint(7, 60))).date(),
                })
                role_counter += 1
        
        self._open_roles = pd.DataFrame(roles)
        return self._open_roles
    
    def generate_candidates(self, n: int = 60) -> pd.DataFrame:
        """Generate candidate data with assessment scores"""
        if self._candidates is not None:
            return self._candidates
        
        open_roles = self.generate_open_roles()
        candidates = []
        
        for i in range(n):
            role = open_roles.sample(1).iloc[0]
            stage = random.choice(self.INTERVIEW_STAGES)
            
            # Generate Thomas assessment scores
            ppa_scores = {trait: random.randint(20, 95) for trait in self.PPA_TRAITS}
            hpti_scores = {trait: random.randint(30, 95) for trait in self.HPTI_TRAITS}
            gia_score = random.randint(70, 130)
            
            # Confidence based on stage + some variance
            base_confidence = stage["benchmark_confidence"]
            candidate_confidence = base_confidence + random.randint(-15, 20)
            candidate_confidence = max(10, min(95, candidate_confidence))
            
            # Match score (how well they match ideal profile)
            match_score = random.randint(45, 95)
            
            # Interview scores
            interview_scores = {}
            for s in self.INTERVIEW_STAGES:
                if s["order"] <= stage["order"]:
                    interview_scores[s["name"]] = random.randint(60, 100)
            
            # Candidate expected salary - use centralized FX conversion
            # Role min/max are in GBP, candidate salary shown in LOCAL currency
            local_currency = role.get("local_currency", "GBP")
            local_config = get_currency_config(local_currency)
            local_symbol = local_config["symbol"]
            local_symbol_pos = local_config["position"]
            
            # Generate expected salary using FX rates
            # First pick a GBP value within the role range, then convert
            expected_salary_gbp = random.randint(int(role["min_salary"]), int(role["max_salary"]))
            expected_salary_gbp = round(expected_salary_gbp / 1000) * 1000  # Round to nearest 1000
            
            # Convert to local currency using proper FX rate
            expected_salary_local = convert_gbp_to_currency(expected_salary_gbp, local_currency)
            
            # Apply cost adjustment if role has it (city-specific)
            if role.get("salary_multiplier"):
                # The salary_multiplier includes cost adjustment, FX rate is separate
                cost_adj = role.get("salary_multiplier") / get_fx_rate(local_currency)
                if cost_adj > 0 and cost_adj != 1.0:
                    expected_salary_local = round((expected_salary_local * cost_adj) / 1000) * 1000
            
            candidates.append({
                "candidate_id": f"CAN-{3000 + i}",
                "name": fake.name(),
                "email": fake.email(),
                "role_id": role["role_id"],
                "role_title": role["title"],
                "current_stage": stage["name"],
                "stage_order": stage["order"],
                "stage_benchmark_confidence": base_confidence,
                "candidate_confidence": candidate_confidence,
                "confidence_status": "On Track" if candidate_confidence >= base_confidence else "Below Benchmark",
                "match_score": match_score,
                "ppa_dominance": ppa_scores["Dominance"],
                "ppa_influence": ppa_scores["Influence"],
                "ppa_steadiness": ppa_scores["Steadiness"],
                "ppa_compliance": ppa_scores["Compliance"],
                "gia_score": gia_score,
                "hpti_conscientiousness": hpti_scores["Conscientiousness"],
                "hpti_adjustment": hpti_scores["Adjustment"],
                "hpti_curiosity": hpti_scores["Curiosity"],
                "hpti_risk_approach": hpti_scores["Risk_Approach"],
                "hpti_ambiguity_acceptance": hpti_scores["Ambiguity_Acceptance"],
                "hpti_competitiveness": hpti_scores["Competitiveness"],
                "screening_score": interview_scores.get("Screening"),
                "phone_interview_score": interview_scores.get("Phone Interview"),
                "technical_score": interview_scores.get("Technical Assessment"),
                "onsite_score": interview_scores.get("Onsite Interview"),
                "final_round_score": interview_scores.get("Final Round"),
                # Location info from role
                "city": role.get("city", "London"),
                "country": role.get("country", "United Kingdom"),
                # Local currency for candidate's expected salary
                "currency": local_currency,
                "currency_symbol": local_symbol,
                "symbol_position": local_symbol_pos,
                # Salary in LOCAL currency
                "expected_salary": expected_salary_local,
                # Also store GBP equivalent for comparison
                "expected_salary_gbp": expected_salary_gbp,
                # Role salary range (always in GBP)
                "min_salary": int(role["min_salary"]),
                "max_salary": int(role["max_salary"]),
                "min_salary_local": int(role.get("min_salary_local", role["min_salary"])),
                "max_salary_local": int(role.get("max_salary_local", role["max_salary"])),
                "industry_avg_salary": int(role.get("industry_avg_salary", role["min_salary"] * 1.1)),
                "company_avg_salary": int(role.get("company_avg_salary", role["min_salary"] * 1.05)),
                "salary_multiplier": role.get("salary_multiplier", 1.0),
                "fx_rate": get_fx_rate(local_currency),
                "negotiation_flexibility": random.choice(["Low", "Medium", "High"]),
                "source": random.choice(["LinkedIn", "Referral", "Indeed", "Company Website", "Recruiter"]),
                "applied_date": (datetime.now() - timedelta(days=random.randint(7, 60))).date(),
            })
        
        self._candidates = pd.DataFrame(candidates)
        return self._candidates
    
    def generate_interaction_logs(self) -> pd.DataFrame:
        """Generate interaction logs (interview notes, Slack, Zoom)"""
        if self._interaction_logs is not None:
            return self._interaction_logs
        
        candidates = self.generate_candidates()
        interactions = []
        
        # Interviewer names for more realistic notes
        interviewers = ["Sarah Chen", "Michael Rodriguez", "Emily Watson", "David Kim", "Jessica Taylor", "Alex Johnson"]
        
        # Detailed feedback templates by stage
        screening_feedback = [
            "{name} has 6 years at Amazon working on distributed systems. Left due to team restructuring. Salary expectation is ${salary}K, slightly above our mid-point. Mentioned competing offer from Stripe (verbal, no letter yet). Available to start in 3 weeks. Red flag: left previous role after only 8 months - says it was due to acquisition.",
            "Currently at Google L5, looking to move to a smaller company for more ownership. {name} led a team of 4 on their search ranking project. Expects ${salary}K base + equity refresh. Timeline: needs to give 2 weeks notice. No competing offers currently but interviewing at 2 other companies.",
            "Background: MIT CS, 4 years at Meta working on React Native. {name} mentioned burnout from on-call rotations as primary reason for looking. Salary: flexible around ${salary}K if equity is strong. Asked specific questions about work-life balance - seemed concerned about on-call expectations here.",
        ]
        
        phone_feedback = [
            "45-min call with {interviewer}. {name} walked through their lead role on the payment processing migration at Stripe - handled 2M+ daily transactions. Solid systems thinking but struggled to explain their CAP theorem trade-offs clearly. When asked about conflict resolution, gave a generic answer. Coding warm-up: implemented binary search correctly in 8 minutes.",
            "Strong call. {name} explained their MLOps pipeline work at scale (50+ models in prod). Good depth on monitoring and observability. Weakness: hasn't managed people directly, only 'influenced' contractors. Said they'd need a month to ramp up on our tech stack. {interviewer} noted they asked about promotion timelines 3 times.",
            "Mixed signals. {name}'s resume says 'led' a project but clarified they were one of 3 co-leads. Technical depth is there for backend but admitted frontend is weak. Mentioned they're also talking to Coinbase and Databricks. {interviewer} felt they were more interested in the other roles - kept comparing benefits.",
        ]
        
        technical_feedback = [
            "System Design (60min): Asked to design a real-time notification system. {name} started with requirements gathering (good), proposed a pub/sub architecture. Missed edge cases around message ordering until prompted. Code quality in follow-up implementation was clean. {interviewer} rating: 7/10. Concern: took 15 min to debug a simple null pointer issue.",
            "Coding Assessment: 2 problems, 90 min. Problem 1 (medium): optimal solution in 25 min, good. Problem 2 (hard): got 70% of test cases, ran out of time on edge cases. {name} communicated well throughout and asked clarifying questions. Their approach to the DP problem was unconventional but worked. Would benefit from more practice on time complexity analysis.",
            "Live coding went well overall. {name} solved the graph traversal problem using BFS when DFS would have been cleaner but got the right answer. System design: proposed microservices when a monolith would suffice for our scale - shows bias toward complexity. {interviewer} pushed back and they adapted their design. Final 10 min: asked about team structure and seemed genuinely interested.",
        ]
        
        onsite_feedback = [
            "4-hour onsite. Panel: {interviewer}, James Lee, Amanda Foster. {name} presented their portfolio project confidently. Architecture deep-dive revealed solid understanding of trade-offs. Lunch conversation: mentioned spouse works remotely, interested in our hybrid policy. Behavioral round: gave a strong example of handling a difficult stakeholder. One concern from James: seemed to deflect when asked about a project failure.",
            "Full loop completed. {name} showed up 10 min early, good first impression. Technical rounds were strong - both interviewers scored 4/5. Culture fit round with Amanda: connected well, discussed their volunteer work mentoring bootcamp grads. Concern: when asked 'why us?' the answer felt rehearsed and generic. {interviewer} recommends a follow-up call to gauge genuine interest.",
            "Onsite with {name}. Morning technical rounds: excelled at the ML system design, proposed an elegant feature store architecture. Afternoon behavioral: gave thoughtful answers about team dynamics. Red flag: during lunch, made a comment about 'avoiding politics' when asked about cross-team collaboration. Debrief: team is split 3-2 on moving forward. {interviewer} is a yes but wants concerns addressed.",
        ]
        
        final_feedback = [
            "Bar raiser round with VP Engineering. {name} handled tough questions well - explained a technical decision that failed and what they learned. Discussed compensation expectations: ${salary}K base is firm, but flexible on equity split. VP's feedback: 'Strong hire, would add immediately to the platform team.' Next step: prepare offer letter with signing bonus to close quickly given competing offers.",
            "Exec interview focused on career goals. {name} wants to be a principal engineer in 3-5 years, not management track. Discussed our IC ladder in detail - they appreciated the clarity. {interviewer} asked about their biggest weakness: 'I can be too detail-oriented and lose sight of deadlines.' Genuine answer. Recommendation: extend offer this week, they mentioned Stripe deadline is Friday.",
            "Final conversation with {name}. Addressed the concerns from onsite about cross-team collaboration - they gave a more specific example this time. Salary discussion: we're at ${salary}K, they want $15K more. Mentioned they value the mission over pure comp. {interviewer} believes we can close at ${salary}K + 10K signing. They asked about team offsite schedule - good sign of interest.",
        ]
        
        stage_feedback = {
            "Screening": screening_feedback,
            "Phone Interview": phone_feedback,
            "Technical Assessment": technical_feedback,
            "Onsite Interview": onsite_feedback,
            "Final Round": final_feedback,
        }
        
        for _, candidate in candidates.iterrows():
            # Generate 1-4 interaction logs based on stage
            num_interactions = min(4, candidate["stage_order"])
            salary_k = candidate["expected_salary"] // 1000
            
            for j in range(num_interactions):
                stage = self.INTERVIEW_STAGES[j]
                stage_name = stage["name"]
                interviewer = random.choice(interviewers)
                
                # Get specific feedback for this stage
                feedback_templates = stage_feedback.get(stage_name, screening_feedback)
                notes = random.choice(feedback_templates).format(
                    name=candidate["name"].split()[0],
                    interviewer=interviewer,
                    salary=salary_k
                )
                
                # Generate document IDs
                interaction_id = f"INT-{len(interactions) + 1}"
                doc_date = (datetime.now() - timedelta(days=random.randint(0, 30))).date()
                
                interactions.append({
                    "interaction_id": interaction_id,
                    "candidate_id": candidate["candidate_id"],
                    "role_id": candidate["role_id"],
                    "interaction_type": random.choice(["Interview", "Phone Screen", "Assessment", "Zoom Call"]),
                    "stage": stage_name,
                    "interviewer_id": f"EMP-{1000 + random.randint(0, 20)}",
                    "interviewer_name": interviewer,
                    "date": doc_date,
                    "duration_minutes": random.randint(30, 90),
                    "score": random.randint(60, 100),
                    "sentiment": random.choice(["Positive", "Neutral", "Mixed"]),
                    "notes": notes,
                    "recommendation": random.choice(["Strong Hire", "Hire", "Lean Hire", "No Hire", "Needs Discussion"]),
                    "transcript_url": f"https://docs.google.com/document/d/{interaction_id}-transcript-{doc_date.strftime('%Y%m%d')}",
                    "summary_url": f"https://docs.google.com/document/d/{interaction_id}-summary-{doc_date.strftime('%Y%m%d')}",
                    "recording_url": f"https://zoom.us/rec/{interaction_id}-{doc_date.strftime('%Y%m%d')}" if j > 0 else None,
                })
        
        self._interaction_logs = pd.DataFrame(interactions)
        return self._interaction_logs
    
    # ========================================
    # PERFORMANCE DATA
    # ========================================
    
    def generate_performance_metrics(self) -> pd.DataFrame:
        """Generate performance metrics for employees"""
        if self._performance_metrics is not None:
            return self._performance_metrics
        
        employees = self.generate_employees()
        metrics = []
        
        # Generate quarterly metrics for last 4 quarters
        quarters = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"]
        
        for _, emp in employees.iterrows():
            base_performance = random.uniform(0.6, 0.95)
            
            for q_idx, quarter in enumerate(quarters):
                # Add some trend/variance
                trend = random.uniform(-0.1, 0.1)
                performance = max(0.3, min(1.0, base_performance + trend))
                
                # Department-specific metrics
                if emp["department"] == "Sales":
                    revenue = random.randint(50000, 500000)
                    deals_closed = random.randint(2, 15)
                    pipeline_value = random.randint(100000, 1000000)
                else:
                    revenue = None
                    deals_closed = None
                    pipeline_value = None
                
                if emp["department"] == "Engineering":
                    jira_velocity = random.randint(15, 45)
                    code_reviews = random.randint(10, 50)
                    pr_merged = random.randint(8, 40)
                else:
                    jira_velocity = None
                    code_reviews = None
                    pr_merged = None
                
                # Morale and sentiment - create some specific "problem" employees
                emp_num = int(emp["employee_id"].replace("EMP-", ""))
                
                # Designated problem employees for interesting demo cases
                if emp_num in [1001, 1005, 1010]:  # High churn risk employees
                    morale_score = random.randint(35, 55)
                    slack_sentiment = random.uniform(0.25, 0.45)
                elif emp_num in [1002, 1006]:  # Medium risk, struggling
                    morale_score = random.randint(50, 65)
                    slack_sentiment = random.uniform(0.4, 0.55)
                elif emp_num in [1003, 1007]:  # High performers, happy
                    morale_score = random.randint(85, 98)
                    slack_sentiment = random.uniform(0.8, 0.95)
                else:
                    morale_score = random.randint(50, 95)
                    slack_sentiment = random.uniform(0.3, 0.9)
                
                # Churn risk calculation
                churn_indicators = 0
                if morale_score < 60:
                    churn_indicators += 2
                if emp["tenure_months"] < 12:
                    churn_indicators += 1
                if jira_velocity and jira_velocity < 20:
                    churn_indicators += 1
                if slack_sentiment < 0.5:
                    churn_indicators += 1
                
                churn_risk = "High" if churn_indicators >= 3 else "Medium" if churn_indicators >= 2 else "Low"
                
                metrics.append({
                    "employee_id": emp["employee_id"],
                    "quarter": quarter,
                    "performance_score": round(performance, 2),
                    "goal_completion_rate": round(random.uniform(0.5, 1.0), 2),
                    "revenue": revenue,
                    "deals_closed": deals_closed,
                    "pipeline_value": pipeline_value,
                    "jira_velocity": jira_velocity,
                    "code_reviews": code_reviews,
                    "pr_merged": pr_merged,
                    "morale_score": morale_score,
                    "slack_sentiment": round(slack_sentiment, 2),
                    "manager_rating": random.randint(3, 5),
                    "peer_feedback_score": random.randint(60, 100),
                    "leadership_readiness": random.randint(20, 95),
                    "churn_risk": churn_risk,
                    "churn_risk_score": churn_indicators * 20,
                })
        
        self._performance_metrics = pd.DataFrame(metrics)
        return self._performance_metrics
    
    # ========================================
    # CONFIGURATION DATA
    # ========================================
    
    def generate_analytics_defaults(self) -> pd.DataFrame:
        """Generate default weights for scoring by role"""
        if self._analytics_defaults is not None:
            return self._analytics_defaults
        
        defaults = [
            {"role_type": "Software Engineer", "coding_assessment_weight": 0.35, "technical_interview_weight": 0.25, "ppa_weight": 0.15, "gia_weight": 0.15, "hpti_weight": 0.10},
            {"role_type": "Product Manager", "coding_assessment_weight": 0.10, "technical_interview_weight": 0.20, "ppa_weight": 0.30, "gia_weight": 0.20, "hpti_weight": 0.20},
            {"role_type": "Data Scientist", "coding_assessment_weight": 0.30, "technical_interview_weight": 0.25, "ppa_weight": 0.15, "gia_weight": 0.20, "hpti_weight": 0.10},
            {"role_type": "Sales", "coding_assessment_weight": 0.00, "technical_interview_weight": 0.15, "ppa_weight": 0.35, "gia_weight": 0.20, "hpti_weight": 0.30},
            {"role_type": "Engineering Manager", "coding_assessment_weight": 0.15, "technical_interview_weight": 0.20, "ppa_weight": 0.25, "gia_weight": 0.15, "hpti_weight": 0.25},
        ]
        
        self._analytics_defaults = pd.DataFrame(defaults)
        return self._analytics_defaults
    
    def generate_manager_overrides(self) -> pd.DataFrame:
        """Generate manager weight overrides for HR analysis"""
        if self._manager_overrides is not None:
            return self._manager_overrides
        
        overrides = []
        for i in range(15):
            overrides.append({
                "override_id": f"OVR-{i+1}",
                "manager_id": f"EMP-{1000 + random.randint(0, 7)}",
                "role_id": f"REQ-{2024000 + random.randint(0, 7)}",
                "coding_assessment_weight": round(random.uniform(0.0, 0.5), 2),
                "technical_interview_weight": round(random.uniform(0.1, 0.4), 2),
                "ppa_weight": round(random.uniform(0.1, 0.4), 2),
                "gia_weight": round(random.uniform(0.1, 0.3), 2),
                "hpti_weight": round(random.uniform(0.05, 0.25), 2),
                "override_date": (datetime.now() - timedelta(days=random.randint(0, 90))).date(),
                "reason": random.choice([
                    "Role requires stronger technical skills",
                    "Team culture fit is critical",
                    "Leadership potential more important for this position",
                    "Fast learner needed more than current skills",
                ]),
            })
        
        self._manager_overrides = pd.DataFrame(overrides)
        return self._manager_overrides
    
    def generate_upcoming_events(self) -> pd.DataFrame:
        """Generate upcoming critical events for employees"""
        employees = self.generate_employees()
        events = []
        
        event_types = [
            ("Vacation", "Employee on approved PTO"),
            ("Maternity Leave", "Maternity leave starting"),
            ("Medical Leave", "Approved medical leave"),
            ("Project Deadline", "Critical project milestone"),
            ("Performance Review", "Quarterly performance review scheduled"),
            ("Training", "Required training/certification"),
        ]
        
        for i in range(20):
            emp = employees.sample(1).iloc[0]
            event_type, desc = random.choice(event_types)
            # Generate event start date 1-60 days in the future
            days_ahead = random.randint(1, 60)
            start_date = (datetime.now() + timedelta(days=days_ahead)).date()
            
            events.append({
                "event_id": f"EVT-{i+1}",
                "employee_id": emp["employee_id"],
                "employee_name": emp["name"],
                "event_type": event_type,
                "description": desc,
                "start_date": start_date,
                "end_date": start_date + timedelta(days=random.randint(1, 21)),
                "is_critical": event_type in ["Project Deadline", "Medical Leave", "Maternity Leave"],
                "manager_id": emp["manager_id"],
            })
        
        return pd.DataFrame(events)
    
    # ========================================
    # IDEAL PROFILES
    # ========================================
    
    def generate_ideal_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Generate ideal candidate profiles based on top performers"""
        employees = self.generate_employees()
        assessments = self.generate_thomas_assessments()
        performance = self.generate_performance_metrics()
        
        # Merge data
        merged = employees.merge(assessments, on="employee_id")
        merged = merged.merge(
            performance[performance["quarter"] == "2024-Q4"],
            on="employee_id"
        )
        
        ideal_profiles = {}
        
        for role in self.ROLES:
            dept_employees = merged[merged["department"] == role["department"]]
            
            # Get top performers (top 25%)
            if len(dept_employees) > 0:
                threshold = dept_employees["performance_score"].quantile(0.75)
                top_performers = dept_employees[dept_employees["performance_score"] >= threshold]
                
                if len(top_performers) > 0:
                    ideal_profiles[role["title"]] = {
                        "ppa_dominance": int(top_performers["ppa_dominance"].mean()),
                        "ppa_influence": int(top_performers["ppa_influence"].mean()),
                        "ppa_steadiness": int(top_performers["ppa_steadiness"].mean()),
                        "ppa_compliance": int(top_performers["ppa_compliance"].mean()),
                        "gia_overall": int(top_performers["gia_overall"].mean()),
                        "hpti_conscientiousness": int(top_performers["hpti_conscientiousness"].mean()),
                        "hpti_adjustment": int(top_performers["hpti_adjustment"].mean()),
                        "hpti_curiosity": int(top_performers["hpti_curiosity"].mean()),
                        "sample_size": len(top_performers),
                    }
        
        return ideal_profiles
    
    def calculate_chemistry_score(self, person1_ppa: dict, person2_ppa: dict) -> dict:
        """
        Calculate Thomas International Chemistry Score between two people based on PPA profiles.
        Higher chemistry = complementary profiles that work well together.
        """
        # Extract PPA values
        d1, i1, s1, c1 = person1_ppa.get('dominance', 50), person1_ppa.get('influence', 50), person1_ppa.get('steadiness', 50), person1_ppa.get('compliance', 50)
        d2, i2, s2, c2 = person2_ppa.get('dominance', 50), person2_ppa.get('influence', 50), person2_ppa.get('steadiness', 50), person2_ppa.get('compliance', 50)
        
        # Chemistry calculation:
        # - Similar I (Influence) = good communication
        # - Complementary D (Dominance) = less conflict (one leads, one follows)
        # - Similar S (Steadiness) = compatible pace
        # - Complementary C (Compliance) = balanced approach to rules
        
        influence_alignment = 100 - abs(i1 - i2)  # Similar is good
        dominance_complement = 50 + min(abs(d1 - d2), 50)  # Some difference is good, but not too much
        steadiness_alignment = 100 - abs(s1 - s2)  # Similar is good
        compliance_balance = 100 - abs((c1 - c2))  # Balance is good
        
        # Weighted average
        chemistry_score = int(
            influence_alignment * 0.30 +
            dominance_complement * 0.25 +
            steadiness_alignment * 0.25 +
            compliance_balance * 0.20
        )
        
        # Determine interaction style recommendations - specific and actionable
        if d1 > 70 and d2 > 70:
            interaction_note = "High-D pairing benefits from pre-agreed decision domains. Schedule brief daily syncs to prevent parallel work."
            risk = "medium"
        elif d1 < 30 and d2 < 30:
            interaction_note = "Consider rotating facilitator roles in meetings. Both may defer; assign explicit ownership per project."
            risk = "medium"
        elif abs(i1 - i2) > 40:
            interaction_note = "Align on communication preferences early: one may want bullet points, the other context. Use shared templates."
            risk = "medium"
        elif s1 > 70 and s2 < 30:
            interaction_note = "Build in buffer time for the high-S partner when introducing changes. Frame urgency with rationale."
            risk = "medium"
        elif chemistry_score >= 75:
            interaction_note = "Natural working rhythm aligns well. Leverage this for high-stakes projects requiring close collaboration."
            risk = "low"
        elif chemistry_score >= 55:
            interaction_note = "Complementary profiles. Establish explicit feedback loops to catch misunderstandings early."
            risk = "low"
        else:
            interaction_note = "Assign a neutral facilitator for key discussions. Document agreements in writing."
            risk = "high"
        
        return {
            "chemistry_score": chemistry_score,
            "interaction_note": interaction_note,
            "risk_level": risk,
            "breakdown": {
                "communication_alignment": int(influence_alignment),
                "leadership_balance": int(dominance_complement),
                "pace_compatibility": int(steadiness_alignment),
                "approach_balance": int(compliance_balance),
            }
        }
    
    def calculate_interpersonal_flexibility(self, employee_id: str, collaborations: list) -> dict:
        """
        Calculate Interpersonal Flexibility score - a new Thomas International metric.
        Measures ability to maintain productive relationships despite low natural chemistry.
        """
        if not collaborations:
            return {"score": 50, "rating": "Average", "evidence": []}
        
        # Find cases where chemistry is low but relationship is high
        flexibility_indicators = []
        total_flexibility_score = 0
        
        for collab in collaborations:
            chemistry = collab.get('chemistry_score', 50)
            relationship = collab.get('relationship_score', 50)
            
            if chemistry < 50 and relationship >= 70:
                # This is strong evidence of interpersonal flexibility
                flexibility_indicators.append({
                    "collaborator": collab.get('name', 'Unknown'),
                    "chemistry": chemistry,
                    "relationship": relationship,
                    "flexibility_contribution": relationship - chemistry,
                    "note": f"Maintains {relationship}% relationship quality despite {chemistry}% natural chemistry"
                })
                total_flexibility_score += (relationship - chemistry) * 2
            elif chemistry < 60 and relationship >= 60:
                # Moderate evidence
                flexibility_indicators.append({
                    "collaborator": collab.get('name', 'Unknown'),
                    "chemistry": chemistry,
                    "relationship": relationship,
                    "flexibility_contribution": (relationship - chemistry),
                    "note": f"Good working relationship despite personality differences"
                })
                total_flexibility_score += (relationship - chemistry)
        
        # Base score + flexibility bonus
        base_score = 50
        flexibility_bonus = min(total_flexibility_score, 40)  # Cap bonus at 40
        final_score = base_score + flexibility_bonus
        
        # Rating
        if final_score >= 85:
            rating = "Exceptional"
            description = "Demonstrates remarkable ability to build productive relationships regardless of personality differences. A team unifier."
        elif final_score >= 70:
            rating = "High"
            description = "Consistently adapts communication style to work effectively with diverse personalities."
        elif final_score >= 55:
            rating = "Average"
            description = "Generally works well with others but may struggle with significantly different personalities."
        else:
            rating = "Developing"
            description = "May prefer working with similar personalities. Coaching on adaptive communication recommended."
        
        return {
            "score": min(final_score, 100),
            "rating": rating,
            "description": description,
            "evidence": flexibility_indicators,
            "is_new_metric": True,
            "metric_info": "Interpersonal Flexibility is a new Thomas International metric that measures an individual's ability to maintain productive working relationships with colleagues whose natural work styles differ from their own."
        }
    
    def generate_team_collaboration_for_candidate(self, candidate_id: str, role_id: str) -> list:
        """Generate predicted team collaborators for a candidate"""
        employees = self.generate_employees()
        assessments = self.generate_thomas_assessments()
        candidates = self.generate_candidates()
        
        # Get candidate's PPA
        candidate = candidates[candidates['candidate_id'] == candidate_id]
        if candidate.empty:
            return []
        
        candidate = candidate.iloc[0]
        candidate_ppa = {
            'dominance': candidate['ppa_dominance'],
            'influence': candidate['ppa_influence'],
            'steadiness': candidate['ppa_steadiness'],
            'compliance': candidate['ppa_compliance'],
        }
        
        # Get role to find department
        roles = self.generate_open_roles()
        role = roles[roles['role_id'] == role_id]
        if role.empty:
            return []
        
        department = role.iloc[0]['department']
        
        # Get employees in same department + cross-functional partners
        dept_employees = employees[employees['department'] == department].head(8)
        other_employees = employees[employees['department'] != department].sample(min(4, len(employees)))
        potential_collaborators = pd.concat([dept_employees, other_employees])
        
        collaborations = []
        roles_worked_with = ["Direct Manager", "Team Lead", "Peer", "Cross-functional Partner", "Stakeholder", "Mentor"]
        
        for idx, (_, emp) in enumerate(potential_collaborators.iterrows()):
            emp_assessment = assessments[assessments['employee_id'] == emp['employee_id']]
            if emp_assessment.empty:
                continue
            
            emp_assessment = emp_assessment.iloc[0]
            emp_ppa = {
                'dominance': emp_assessment['ppa_dominance'],
                'influence': emp_assessment['ppa_influence'],
                'steadiness': emp_assessment['ppa_steadiness'],
                'compliance': emp_assessment['ppa_compliance'],
            }
            
            chemistry = self.calculate_chemistry_score(candidate_ppa, emp_ppa)
            
            # Time allocation - varies by role
            if idx == 0:
                time_allocation = random.randint(25, 40)  # Manager
                relationship_role = "Direct Manager"
            elif idx < 3:
                time_allocation = random.randint(15, 25)  # Close collaborators
                relationship_role = random.choice(["Team Lead", "Peer"])
            else:
                time_allocation = random.randint(5, 15)  # Less frequent
                relationship_role = random.choice(["Cross-functional Partner", "Stakeholder"])
            
            # Generate recommendation based on chemistry and importance
            importance = "high" if time_allocation >= 20 else "medium" if time_allocation >= 10 else "low"
            
            if chemistry['chemistry_score'] < 50 and importance == "high":
                recommendation = f"Schedule introductory coffee chat before start date. Focus on {emp['name']}'s communication preferences (high {self._get_dominant_trait(emp_ppa)} style)."
            elif chemistry['chemistry_score'] < 60 and importance == "high":
                recommendation = f"Arrange shadowing session with {emp['name']} in first week. Build rapport early."
            elif chemistry['risk_level'] == 'high':
                recommendation = f"Proactive relationship building recommended. Consider structured 1:1s initially."
            elif chemistry['chemistry_score'] >= 80:
                recommendation = "Natural compatibility detected. Standard onboarding sufficient."
            else:
                recommendation = None
            
            collaborations.append({
                "employee_id": emp['employee_id'],
                "name": emp['name'],
                "title": emp['title'],
                "department": emp['department'],
                "relationship_role": relationship_role,
                "time_allocation_percent": time_allocation,
                "importance": importance,
                "chemistry_score": chemistry['chemistry_score'],
                "chemistry_risk": chemistry['risk_level'],
                "interaction_note": chemistry['interaction_note'],
                "chemistry_breakdown": chemistry['breakdown'],
                "recommendation": recommendation,
                "ppa_profile": emp_ppa,
            })
        
        # Sort by importance and time allocation
        collaborations.sort(key=lambda x: (-x['time_allocation_percent'], x['chemistry_score']))
        return collaborations
    
    def generate_team_collaboration_for_employee(self, employee_id: str) -> dict:
        """Generate actual team collaboration data for an existing employee"""
        employees = self.generate_employees()
        assessments = self.generate_thomas_assessments()
        
        # Get employee's PPA
        emp_assessment = assessments[assessments['employee_id'] == employee_id]
        if emp_assessment.empty:
            return {"collaborations": [], "interpersonal_flexibility": {}}
        
        emp_assessment = emp_assessment.iloc[0]
        employee_ppa = {
            'dominance': emp_assessment['ppa_dominance'],
            'influence': emp_assessment['ppa_influence'],
            'steadiness': emp_assessment['ppa_steadiness'],
            'compliance': emp_assessment['ppa_compliance'],
        }
        
        # Get employee info
        emp = employees[employees['employee_id'] == employee_id]
        if emp.empty:
            return {"collaborations": [], "interpersonal_flexibility": {}}
        emp = emp.iloc[0]
        
        # Get collaborators (same department + some cross-functional)
        dept_employees = employees[(employees['department'] == emp['department']) & (employees['employee_id'] != employee_id)].head(6)
        other_employees = employees[(employees['department'] != emp['department']) & (employees['employee_id'] != employee_id)].sample(min(3, len(employees)))
        collaborators = pd.concat([dept_employees, other_employees])
        
        collaborations = []
        
        for _, collab in collaborators.iterrows():
            collab_assessment = assessments[assessments['employee_id'] == collab['employee_id']]
            if collab_assessment.empty:
                continue
            
            collab_assessment = collab_assessment.iloc[0]
            collab_ppa = {
                'dominance': collab_assessment['ppa_dominance'],
                'influence': collab_assessment['ppa_influence'],
                'steadiness': collab_assessment['ppa_steadiness'],
                'compliance': collab_assessment['ppa_compliance'],
            }
            
            chemistry = self.calculate_chemistry_score(employee_ppa, collab_ppa)
            
            # Simulate relationship score (actual working relationship quality)
            # Sometimes high despite low chemistry (interpersonal flexibility)
            # Sometimes low despite high chemistry (other issues)
            base_relationship = chemistry['chemistry_score']
            relationship_variance = random.randint(-20, 30)
            relationship_score = max(30, min(100, base_relationship + relationship_variance))
            
            # Determine if this shows interpersonal flexibility
            shows_flexibility = chemistry['chemistry_score'] < 55 and relationship_score >= 70
            
            # Interaction frequency
            if collab['department'] == emp['department']:
                interaction_frequency = random.choice(["Daily", "Multiple times daily", "Several times per week"])
                time_allocation = random.randint(10, 25)
            else:
                interaction_frequency = random.choice(["Weekly", "Bi-weekly", "Monthly"])
                time_allocation = random.randint(3, 12)
            
            collaboration_data = {
                "employee_id": collab['employee_id'],
                "name": collab['name'],
                "title": collab['title'],
                "department": collab['department'],
                "interaction_frequency": interaction_frequency,
                "time_allocation_percent": time_allocation,
                "chemistry_score": chemistry['chemistry_score'],
                "relationship_score": relationship_score,
                "chemistry_breakdown": chemistry['breakdown'],
                "interaction_note": chemistry['interaction_note'],
                "shows_interpersonal_flexibility": shows_flexibility,
                "ppa_profile": collab_ppa,
            }
            
            # Add flexibility praise if applicable
            if shows_flexibility:
                collaboration_data["flexibility_note"] = f"🌟 {emp['name']} demonstrates strong interpersonal flexibility with {collab['name']} - maintaining a {relationship_score}% relationship quality despite only {chemistry['chemistry_score']}% natural chemistry."
            
            collaborations.append(collaboration_data)
        
        # Calculate interpersonal flexibility
        interpersonal_flexibility = self.calculate_interpersonal_flexibility(employee_id, collaborations)
        
        # Sort by relationship importance
        collaborations.sort(key=lambda x: (-x['time_allocation_percent'], -x['relationship_score']))
        
        return {
            "collaborations": collaborations,
            "interpersonal_flexibility": interpersonal_flexibility,
        }
    
    def _get_dominant_trait(self, ppa: dict) -> str:
        """Get the dominant PPA trait for a person"""
        traits = [
            ('Dominance', ppa.get('dominance', 0)),
            ('Influence', ppa.get('influence', 0)),
            ('Steadiness', ppa.get('steadiness', 0)),
            ('Compliance', ppa.get('compliance', 0)),
        ]
        return max(traits, key=lambda x: x[1])[0]
    
    # ========================================
    # REFERRALS DATA
    # ========================================
    
    def generate_referrals(self, n: int = 12) -> list:
        """Generate referral candidates with basic metadata and CV info"""
        if self._referrals is not None:
            return self._referrals
        
        employees = self.generate_employees()
        open_roles = self.generate_open_roles()
        
        # Skills by department
        skills_by_dept = {
            "Engineering": ["Python", "JavaScript", "React", "AWS", "Kubernetes", "Go", "TypeScript", "Node.js", "PostgreSQL", "Redis"],
            "Product": ["Product Strategy", "Roadmapping", "User Research", "Agile", "Data Analysis", "Stakeholder Management", "A/B Testing"],
            "Data": ["Python", "SQL", "Machine Learning", "Spark", "TensorFlow", "Statistics", "Data Visualization", "Airflow"],
            "Sales": ["Salesforce", "Negotiation", "Lead Generation", "Account Management", "CRM", "Presentation Skills"],
        }
        
        referrals = []
        
        for i in range(n):
            role = open_roles.sample(1).iloc[0]
            referrer = employees.sample(1).iloc[0]
            # Balanced mix: ~33% UK, ~33% Sweden, ~33% US
            location = self._get_balanced_location()
            
            # Basic metadata (some fields intentionally sparse - to be filled by AI)
            name = fake.name()
            email = fake.email()
            
            # CV-extracted partial data (simulating what basic parsing would find)
            years_exp = random.randint(3, 15) if random.random() > 0.3 else None
            current_company = fake.company() if random.random() > 0.2 else None
            current_title = role["title"] if random.random() > 0.4 else None
            
            # Some skills from CV
            dept_skills = skills_by_dept.get(role["department"], skills_by_dept["Engineering"])
            extracted_skills = random.sample(dept_skills, k=min(random.randint(2, 4), len(dept_skills))) if random.random() > 0.3 else []
            
            referrals.append({
                "referral_id": f"REF-{5000 + i}",
                "name": name,
                "email": email,
                "role_id": role["role_id"],
                "role_title": role["title"],
                "department": role["department"],
                "referred_by_id": referrer["employee_id"],
                "referred_by_name": referrer["name"],
                "referral_date": (datetime.now() - timedelta(days=random.randint(1, 30))).date().isoformat(),
                "status": random.choice(["New", "CV Uploaded", "Under Review", "AI Enriched"]),
                "cv_uploaded": True,
                "cv_filename": f"{name.replace(' ', '_')}_CV.pdf",
                "cv_url": f"https://docs.google.com/document/d/{fake.uuid4()}/preview",
                # Partial metadata (sparse - to be enriched)
                "years_experience": years_exp,
                "current_company": current_company,
                "current_title": current_title,
                "skills": extracted_skills,
                "education": fake.random_element(["BSc Computer Science", "MSc Data Science", "MBA", "PhD Machine Learning", None]),
                "city": location["city"],
                "country": location["country"],
                # Social profiles (URLs to be discovered by AI)
                "linkedin_url": None,
                "github_url": None,
                "twitter_url": None,
                "personal_website": None,
                # AI enrichment status
                "ai_enriched": False,
                "enrichment_timestamp": None,
            })
        
        self._referrals = referrals
        return self._referrals
    
    def extract_ai_insights(self, referral_id: str) -> dict:
        """Simulate AI extraction from CV and web crawling"""
        if referral_id in self._referral_insights:
            return self._referral_insights[referral_id]
        
        # Find the referral
        referrals = self.generate_referrals()
        referral = next((r for r in referrals if r["referral_id"] == referral_id), None)
        
        if not referral:
            return {}
        
        name = referral["name"]
        first_name = name.split()[0]
        dept = referral["department"]
        
        # Skills by department for enrichment (IFS-specific)
        all_skills = {
            "R&D": ["Python", "JavaScript", "React", "AWS", "Kubernetes", "Go", "TypeScript", "Node.js", "PostgreSQL", "Docker", "CI/CD", "Terraform", "IFS Cloud", "Azure", "Microservices"],
            "Industrial AI": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Computer Vision", "NLP", "MLOps", "Spark", "Data Engineering", "Time Series Analysis", "Predictive Maintenance", "Deep Learning"],
            "ERP": ["ERP Implementation", "SAP", "Business Process Modeling", "SQL", "Data Migration", "Integration", "Financial Systems", "Supply Chain", "Change Management", "Requirements Analysis"],
            "FSM": ["Field Service Management", "Scheduling Optimization", "Mobile Development", "IoT", "Asset Tracking", "Customer Service", "Workforce Management", "Route Planning"],
            "EAM": ["Asset Management", "Predictive Maintenance", "CMMS", "IoT Sensors", "Reliability Engineering", "Work Order Management", "Capital Planning", "Compliance"],
            "Sales": ["Salesforce", "Negotiation", "Enterprise Sales", "Account Management", "CRM", "Solution Selling", "Pipeline Management", "Contract Negotiation"],
            "Customer Success": ["Customer Success", "Onboarding", "Retention", "Upselling", "Technical Support", "Relationship Management", "Health Scoring", "Churn Prevention"],
            # Fallback legacy departments
            "Engineering": ["Python", "JavaScript", "React", "AWS", "Kubernetes", "Go", "TypeScript", "Node.js", "PostgreSQL", "Docker", "CI/CD", "Terraform"],
            "Product": ["Product Strategy", "Roadmapping", "User Research", "Agile", "Data Analysis", "Stakeholder Management", "A/B Testing", "Figma", "SQL", "Jira"],
            "Data": ["Python", "SQL", "Machine Learning", "Spark", "TensorFlow", "Statistics", "Data Visualization", "Airflow", "dbt", "Snowflake", "PyTorch"],
        }
        
        # Get skills for dept or fallback to R&D
        dept_skills = all_skills.get(dept, all_skills.get("R&D", []))
        
        # Generate rich AI insights
        insights = {
            "referral_id": referral_id,
            "extraction_timestamp": datetime.now().isoformat(),
            
            # CV-extracted data (filled in missing fields)
            "cv_insights": {
                "years_experience": referral["years_experience"] or random.randint(5, 12),
                "current_company": referral["current_company"] or fake.company(),
                "current_title": referral["current_title"] or referral["role_title"],
                "previous_companies": [fake.company() for _ in range(random.randint(2, 4))],
                "skills": list(set(referral["skills"] + random.sample(dept_skills, k=min(random.randint(4, 8), len(dept_skills))))),
                "education": [
                    {
                        "degree": random.choice(["BSc", "MSc", "MBA", "PhD"]),
                        "field": random.choice(["Computer Science", "Data Science", "Business Administration", "Engineering"]),
                        "institution": random.choice(["University of Cambridge", "Imperial College London", "Stanford University", "MIT", "Oxford University"]),
                        "year": random.randint(2008, 2020),
                    }
                ],
                "certifications": random.sample([
                    "AWS Solutions Architect", "Google Cloud Professional", "PMP", 
                    "Scrum Master", "Kubernetes Administrator", "Databricks Certified",
                    "TensorFlow Developer", "Azure Data Engineer"
                ], k=random.randint(1, 3)),
                "languages": random.sample(["English (Native)", "Spanish (Fluent)", "French (Conversational)", "German (Basic)", "Mandarin (Basic)"], k=random.randint(1, 3)),
                "summary": f"{name} is a seasoned {referral['role_title']} with {referral.get('years_experience') or random.randint(5, 12)} years of experience in {dept}. Most recently at {referral.get('current_company') or fake.company()}, they led initiatives resulting in significant business impact. Known for technical excellence and collaborative leadership style.",
            },
            
            # LinkedIn insights
            "linkedin_insights": {
                "url": f"https://linkedin.com/in/{name.lower().replace(' ', '-')}-{random.randint(1000, 9999)}",
                "headline": f"{referral.get('current_title') or referral['role_title']} at {referral.get('current_company') or 'Leading Tech Company'}",
                "connections": random.randint(500, 5000),
                "followers": random.randint(200, 3000),
                "posts_last_month": random.randint(0, 8),
                "endorsements": {
                    skill: random.randint(10, 99) for skill in random.sample(dept_skills[:min(5, len(dept_skills))], k=min(3, len(dept_skills)))
                },
                "recommendations_count": random.randint(5, 25),
                "featured_recommendations": [
                    f'"{first_name} is an exceptional {random.choice(["leader", "engineer", "collaborator", "problem solver"])}. Their work on {random.choice(["the platform migration", "our ML pipeline", "the product launch", "scaling our team"])} was transformative." - {fake.name()}, {random.choice(["CTO", "VP Engineering", "Director", "Senior Manager"])}',
                    f'"I had the pleasure of working with {first_name} for {random.randint(2, 5)} years. {random.choice(["Highly recommend", "Would hire again in a heartbeat", "Top 5 percent of people I have worked with"])}." - {fake.name()}, {random.choice(["CEO", "Founder", "Engineering Lead"])}'
                ],
                "activity_highlights": [
                    f"Posted about {random.choice(['AI trends', 'team leadership', 'technical architecture', 'career growth'])} ({random.randint(50, 500)} likes)",
                    f"Shared article on {random.choice(['distributed systems', 'product strategy', 'data engineering', 'startup culture'])}",
                    f"Celebrated {random.choice(['work anniversary', 'new certification', 'team achievement'])}",
                ],
            },
            
            # GitHub insights (for technical roles)
            "github_insights": {
                "url": f"https://github.com/{first_name.lower()}{random.randint(100, 999)}",
                "public_repos": random.randint(15, 80),
                "stars_received": random.randint(50, 2000),
                "followers": random.randint(20, 500),
                "contributions_last_year": random.randint(200, 1500),
                "top_languages": random.sample(["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "SQL"], k=3),
                "notable_repos": [
                    {
                        "name": random.choice(["ml-pipeline", "api-gateway", "data-platform", "react-components", "terraform-modules"]),
                        "stars": random.randint(50, 500),
                        "description": f"A {random.choice(['scalable', 'production-ready', 'lightweight', 'enterprise-grade'])} {random.choice(['framework', 'library', 'tool', 'platform'])} for {random.choice(['ML workflows', 'API development', 'data processing', 'cloud infrastructure'])}",
                    },
                    {
                        "name": random.choice(["awesome-data", "learning-resources", "dotfiles", "utils"]),
                        "stars": random.randint(10, 100),
                        "description": f"Collection of {random.choice(['curated resources', 'utilities', 'templates', 'examples'])}",
                    },
                ],
                "open_source_contributions": [
                    f"Contributed to {random.choice(['tensorflow', 'kubernetes', 'react', 'pandas', 'dbt'])} ({random.randint(2, 20)} PRs merged)",
                ],
            } if dept in ["Engineering", "Data"] else None,
            
            # Speaking engagements (YouTube, conferences)
            "speaking_engagements": [
                {
                    "title": random.choice([
                        f"Building Scalable {dept} Teams",
                        f"From Zero to Production: {random.choice(['ML', 'Data', 'Platform'])} at Scale",
                        f"Lessons from {random.choice(['Hypergrowth', 'Startup', 'Enterprise'])} {dept}",
                        f"The Future of {random.choice(['AI', 'Data Engineering', 'Product Development', 'Tech Leadership'])}",
                    ]),
                    "event": random.choice(["QCon", "PyCon", "KubeCon", "Data Council", "ProductCon", "LeadDev", "Strata Data"]),
                    "year": random.randint(2021, 2024),
                    "youtube_url": f"https://youtube.com/watch?v={fake.uuid4()[:11]}",
                    "views": random.randint(1000, 50000),
                    "thumbnail": f"https://img.youtube.com/vi/{fake.uuid4()[:11]}/maxresdefault.jpg",
                }
                for _ in range(random.randint(1, 3))
            ] if random.random() > 0.4 else [],
            
            # Blog posts / Articles
            "blog_posts": [
                {
                    "title": random.choice([
                        f"How We Scaled Our {dept} Platform 10x",
                        f"Lessons Learned Building {random.choice(['ML Pipelines', 'Data Teams', 'Products', 'Engineering Culture'])}",
                        f"Why {random.choice(['Simplicity', 'Documentation', 'Testing', 'Mentorship'])} Matters More Than You Think",
                        f"A Deep Dive into {random.choice(['Our Architecture', 'System Design', 'Our Hiring Process', 'Remote Work'])}",
                    ]),
                    "platform": random.choice(["Medium", "Dev.to", "Personal Blog", "Company Blog", "Substack"]),
                    "url": f"https://medium.com/@{first_name.lower()}/{fake.slug()}",
                    "claps": random.randint(100, 5000),
                    "date": (datetime.now() - timedelta(days=random.randint(30, 365))).date().isoformat(),
                }
                for _ in range(random.randint(1, 4))
            ] if random.random() > 0.3 else [],
            
            # Predicted Thomas assessments (based on CV analysis)
            "predicted_assessments": {
                "ppa": {
                    "dominance": random.randint(40, 85),
                    "influence": random.randint(45, 90),
                    "steadiness": random.randint(35, 80),
                    "compliance": random.randint(40, 85),
                    "confidence": random.randint(60, 85),
                    "note": "Predicted from communication style in CV, LinkedIn activity, and public content",
                },
                "gia_estimated": {
                    "percentile": random.randint(70, 95),
                    "confidence": random.randint(50, 75),
                    "note": "Estimated from educational background and role complexity",
                },
                "hpti_predicted": {
                    "conscientiousness": random.randint(60, 90),
                    "adjustment": random.randint(50, 85),
                    "curiosity": random.randint(55, 95),
                    "risk_approach": random.randint(40, 80),
                    "ambiguity_acceptance": random.randint(45, 85),
                    "competitiveness": random.randint(50, 85),
                    "confidence": random.randint(55, 80),
                    "note": "Inferred from career trajectory, content themes, and public presence",
                },
            },
            
            # Work history summary
            "work_history": [
                {
                    "company": referral.get("current_company") or fake.company(),
                    "title": referral.get("current_title") or referral["role_title"],
                    "duration": f"{random.randint(1, 4)} years",
                    "current": True,
                    "highlights": [
                        f"Led team of {random.randint(3, 15)} {random.choice(['engineers', 'data scientists', 'product managers', 'professionals'])}",
                        f"Delivered {random.choice(['$5M', '$10M', '$20M', '3x', '5x'])} {random.choice(['revenue impact', 'cost savings', 'growth', 'efficiency improvement'])}",
                        f"Architected {random.choice(['platform', 'system', 'product', 'solution'])} serving {random.randint(1, 50)}M users",
                    ],
                },
                {
                    "company": fake.company(),
                    "title": f"Senior {referral['role_title'].replace('Staff ', '').replace('Senior ', '')}",
                    "duration": f"{random.randint(2, 4)} years",
                    "current": False,
                    "highlights": [
                        f"Promoted from {random.choice(['IC', 'junior', 'mid-level'])} to senior in {random.randint(1, 2)} years",
                        f"Key contributor to {random.choice(['Series B', 'IPO', 'acquisition', 'major launch'])}",
                    ],
                },
                {
                    "company": fake.company(),
                    "title": referral["role_title"].replace("Staff ", "").replace("Senior ", ""),
                    "duration": f"{random.randint(1, 3)} years",
                    "current": False,
                    "highlights": [
                        f"Started career in {random.choice(['fast-paced startup', 'Fortune 500', 'consulting', 'tech unicorn'])}",
                    ],
                },
            ],
            
            # Overall AI summary
            "ai_summary": f"""**Executive Summary**

{name} is a highly qualified candidate for the {referral['role_title']} position, referred by {referral['referred_by_name']}.

**Strengths Identified:**
• Strong technical depth with {random.randint(5, 12)}+ years of relevant experience
• Proven track record at {random.choice(['high-growth startups', 'enterprise companies', 'leading tech firms'])}
• Active contributor to the {dept.lower()} community through {random.choice(['speaking', 'open source', 'writing', 'mentorship'])}
• Excellent references and peer endorsements on LinkedIn

**Potential Concerns:**
• {random.choice(['May require senior-level compensation', 'Limited direct people management experience', 'Career progression suggests ambitious - ensure role is compelling', 'May have competing offers - act quickly'])}

**Thomas Profile Prediction:**
Based on their communication style, career choices, and public content, we predict a {random.choice(['high-D', 'high-I', 'balanced', 'analytical'])} profile with strong {random.choice(['leadership potential', 'collaborative tendencies', 'execution focus', 'strategic thinking'])}.

**Recommendation:** Strong candidate - recommend fast-tracking to initial screening.""",
        }
        
        # Cache the insights
        self._referral_insights[referral_id] = insights
        
        # Update the referral status
        for r in self._referrals:
            if r["referral_id"] == referral_id:
                r["ai_enriched"] = True
                r["enrichment_timestamp"] = insights["extraction_timestamp"]
                r["linkedin_url"] = insights["linkedin_insights"]["url"]
                r["github_url"] = insights["github_insights"]["url"] if insights["github_insights"] else None
                r["years_experience"] = insights["cv_insights"]["years_experience"]
                r["current_company"] = insights["cv_insights"]["current_company"]
                r["current_title"] = insights["cv_insights"]["current_title"]
                r["skills"] = insights["cv_insights"]["skills"]
                break
        
        return insights
    
    # ========================================
    # BIAS DETECTION
    # ========================================
    
    # Define bias types with descriptions
    BIAS_DEFINITIONS = {
        "similarity_bias": {
            "name": "Similarity Bias",
            "description": "Tendency to favor candidates who share similar backgrounds, interests, or experiences with yourself.",
            "mitigation": "Focus on job-relevant skills and competencies. Ask standardized questions for all candidates.",
            "icon": "users",
        },
        "affinity_bias": {
            "name": "Affinity Bias", 
            "description": "Unconscious preference for people who remind you of yourself or someone you like.",
            "mitigation": "Use structured interviews with consistent evaluation criteria across all candidates.",
            "icon": "heart",
        },
        "halo_effect": {
            "name": "Halo Effect",
            "description": "Letting one positive trait (like prestigious education or company) influence overall perception.",
            "mitigation": "Evaluate each competency independently. Don't let one strength compensate for gaps.",
            "icon": "star",
        },
        "horn_effect": {
            "name": "Horn Effect",
            "description": "Letting one negative trait overshadow all other qualities of the candidate.",
            "mitigation": "Consider each qualification separately. Look for evidence that contradicts first impressions.",
            "icon": "alert-triangle",
        },
        "confirmation_bias": {
            "name": "Confirmation Bias",
            "description": "Seeking information that confirms pre-existing beliefs about the candidate.",
            "mitigation": "Actively look for evidence that challenges your initial assessment.",
            "icon": "check-circle",
        },
        "anchoring_bias": {
            "name": "Anchoring Bias",
            "description": "Over-relying on the first piece of information encountered (like salary expectations or first impression).",
            "mitigation": "Gather all relevant information before forming conclusions. Re-evaluate initial anchors.",
            "icon": "anchor",
        },
        "contrast_effect": {
            "name": "Contrast Effect",
            "description": "Judging candidates relative to previous interviewees rather than against objective criteria.",
            "mitigation": "Use a standardized scorecard. Evaluate each candidate against job requirements, not each other.",
            "icon": "shuffle",
        },
        "beauty_bias": {
            "name": "Appearance Bias",
            "description": "Being influenced by physical appearance or presentation style rather than qualifications.",
            "mitigation": "Focus on competency-based questions. Consider blind resume reviews where possible.",
            "icon": "eye",
        },
        "gender_bias": {
            "name": "Gender Bias",
            "description": "Unconscious assumptions about capabilities or fit based on gender.",
            "mitigation": "Use gender-neutral language. Focus on demonstrated skills and achievements.",
            "icon": "users",
        },
        "name_bias": {
            "name": "Name Bias",
            "description": "Making assumptions about candidates based on their name, ethnicity, or cultural background.",
            "mitigation": "Focus on qualifications and experience. Consider blind resume screening.",
            "icon": "user",
        },
    }
    
    def detect_bias_pitfalls(self, candidate_id: str, interviewer_id: str) -> dict:
        """Detect potential unconscious biases based on candidate-interviewer similarities"""
        cache_key = f"{candidate_id}_{interviewer_id}"
        if cache_key in self._bias_cache:
            return self._bias_cache[cache_key]
        
        candidates = self.generate_candidates()
        employees = self.generate_employees()
        interactions = self.generate_interaction_logs()
        
        candidate = candidates[candidates['candidate_id'] == candidate_id]
        interviewer = employees[employees['employee_id'] == interviewer_id]
        
        if candidate.empty or interviewer.empty:
            return {"pitfalls": [], "overall_risk": "low"}
        
        candidate = candidate.iloc[0]
        interviewer = interviewer.iloc[0]
        
        pitfalls = []
        
        # Simulate detected similarities based on mock data
        # In production, this would analyze real CV, LinkedIn, interview transcripts
        
        # 1. Check for university similarity
        universities = ["Cambridge", "Oxford", "Stanford", "MIT", "Imperial", "LSE", "UCL", "Harvard", "Berkeley"]
        candidate_uni = random.choice(universities)
        interviewer_uni = random.choice(universities)
        if random.random() > 0.6:  # 40% chance of match
            interviewer_uni = candidate_uni
            pitfalls.append({
                "bias_type": "similarity_bias",
                "risk_level": "high",
                "detected_similarity": f"Both attended {candidate_uni}",
                "details": f"You and {candidate['name'].split()[0]} both studied at {candidate_uni}. This shared background may cause you to unconsciously favor them.",
                "specific_advice": "Focus on role-specific competencies rather than shared educational background. Ask yourself: Would I rate this answer the same if they went to a different university?",
            })
        
        # 2. Check for hobby/interest similarity (from LinkedIn/CV)
        hobbies = ["rock climbing", "running marathons", "playing chess", "photography", "cooking", "hiking", "guitar", "reading sci-fi", "gaming", "cycling"]
        if random.random() > 0.5:
            shared_hobby = random.choice(hobbies)
            pitfalls.append({
                "bias_type": "affinity_bias",
                "risk_level": "medium",
                "detected_similarity": f"Shared interest in {shared_hobby}",
                "details": f"Interview notes mention {candidate['name'].split()[0]} enjoys {shared_hobby}, which you also listed on your profile. This common interest may create unconscious favoritism.",
                "specific_advice": f"While rapport is valuable, be careful not to let shared enthusiasm for {shared_hobby} influence your assessment of their professional capabilities.",
            })
        
        # 3. Check for previous company overlap
        companies = ["Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Stripe", "Databricks", "Snowflake", "Salesforce"]
        if random.random() > 0.65:
            shared_company = random.choice(companies)
            pitfalls.append({
                "bias_type": "halo_effect",
                "risk_level": "medium",
                "detected_similarity": f"Previous {shared_company} experience",
                "details": f"Like you, {candidate['name'].split()[0]} previously worked at {shared_company}. You may unconsciously assume they have similar competencies to yourself.",
                "specific_advice": f"Verify specific achievements at {shared_company} rather than assuming transferable success. Different roles and teams have very different experiences.",
            })
        
        # 4. Check for similar career path
        if random.random() > 0.7:
            career_path = random.choice(["startup founder", "management consulting", "big tech", "academic research"])
            pitfalls.append({
                "bias_type": "similarity_bias",
                "risk_level": "low",
                "detected_similarity": f"Similar {career_path} background",
                "details": f"Both you and {candidate['name'].split()[0]} have {career_path} experience. This shared trajectory may influence your perception.",
                "specific_advice": "Evaluate their specific contributions and growth, not just the career path they've taken.",
            })
        
        # 5. Check for hometown/location similarity
        if random.random() > 0.75:
            location = random.choice(["London", "Manchester", "Edinburgh", "San Francisco", "New York", "Berlin"])
            pitfalls.append({
                "bias_type": "affinity_bias",
                "risk_level": "low",
                "detected_similarity": f"Both from {location}",
                "details": f"Interview transcript mentions {candidate['name'].split()[0]} grew up in {location}, which is also your hometown.",
                "specific_advice": "Regional connections are nice but shouldn't factor into hiring decisions. Focus on job-relevant qualifications.",
            })
        
        # 6. First impression / presentation bias
        if random.random() > 0.4:
            positive_trait = random.choice([
                "confident communication style",
                "impressive presentation skills",
                "articulate responses",
                "strong handshake and eye contact",
                "polished appearance"
            ])
            pitfalls.append({
                "bias_type": "halo_effect",
                "risk_level": "medium",
                "detected_similarity": f"Strong first impression: {positive_trait}",
                "details": f"Your interview notes highlight {candidate['name'].split()[0]}'s {positive_trait}. This positive first impression may overshadow other assessment areas.",
                "specific_advice": "Evaluate technical and role-specific competencies separately from presentation skills unless presentation is core to the role.",
            })
        
        # 7. Confirmation bias from referral
        if random.random() > 0.6:
            pitfalls.append({
                "bias_type": "confirmation_bias",
                "risk_level": "medium",
                "detected_similarity": "Referred by respected colleague",
                "details": f"{candidate['name'].split()[0]} was referred by a colleague you trust. You may unconsciously seek evidence that confirms your colleague's positive view.",
                "specific_advice": "Apply the same rigorous evaluation criteria as you would for any candidate. Your colleague's recommendation is one data point, not a conclusion.",
            })
        
        # 8. Contrast effect warning (if applicable)
        if random.random() > 0.5:
            pitfalls.append({
                "bias_type": "contrast_effect",
                "risk_level": "low",
                "detected_similarity": "Recent interview context",
                "details": f"You interviewed another candidate for this role yesterday. Be aware that your assessment of {candidate['name'].split()[0]} may be influenced by comparison.",
                "specific_advice": "Use the role's competency framework as your benchmark, not the previous candidate. Each candidate should be evaluated independently.",
            })
        
        # Limit to top 4 most relevant pitfalls (sorted by risk)
        risk_order = {"high": 0, "medium": 1, "low": 2}
        pitfalls = sorted(pitfalls, key=lambda x: risk_order.get(x["risk_level"], 2))[:4]
        
        # Calculate overall risk
        high_count = len([p for p in pitfalls if p["risk_level"] == "high"])
        medium_count = len([p for p in pitfalls if p["risk_level"] == "medium"])
        
        if high_count >= 2 or (high_count >= 1 and medium_count >= 2):
            overall_risk = "high"
        elif high_count >= 1 or medium_count >= 2:
            overall_risk = "medium"
        else:
            overall_risk = "low"
        
        # Add bias definitions to each pitfall
        for pitfall in pitfalls:
            bias_def = self.BIAS_DEFINITIONS.get(pitfall["bias_type"], {})
            pitfall["bias_name"] = bias_def.get("name", pitfall["bias_type"])
            pitfall["bias_description"] = bias_def.get("description", "")
            pitfall["general_mitigation"] = bias_def.get("mitigation", "")
            pitfall["icon"] = bias_def.get("icon", "alert-circle")
        
        result = {
            "candidate_id": candidate_id,
            "candidate_name": str(candidate["name"]),
            "interviewer_id": interviewer_id,
            "interviewer_name": str(interviewer["name"]),
            "pitfalls": pitfalls,
            "overall_risk": overall_risk,
            "total_detected": len(pitfalls),
            "disclaimer": "This analysis is private and visible only to you. It is designed to help you be aware of potential unconscious biases, not to suggest any bias exists.",
            "sources": ["CV Analysis", "LinkedIn Profile", "Interview Transcripts", "Internal HR Data"],
        }
        
        self._bias_cache[cache_key] = result
        return result


# Singleton instance
_mock_data_generator = None


def get_mock_data_generator() -> MockDataGenerator:
    """Get or create the mock data generator singleton"""
    global _mock_data_generator
    if _mock_data_generator is None:
        _mock_data_generator = MockDataGenerator()
    return _mock_data_generator
