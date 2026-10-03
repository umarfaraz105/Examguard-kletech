"""
Compliance scorer for exam plans.

Calculates compliance scores and provides metrics.
"""
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.plan import Plan
from app.models.user import User, UserRole
from app.services.engine4.validator import PlanValidator


class ComplianceScorer:
    """
    Calculates compliance scores for exam plans.
    
    Scores range from 0-100:
    - 100: Perfect compliance, no issues
    - 80-99: Minor issues (warnings only)
    - 60-79: Moderate issues (some errors)
    - 40-59: Major issues (critical issues present)
    - 0-39: Severe non-compliance
    """
    
    def __init__(self, db: Session):
        """
        Initialize compliance scorer.
        
        Args:
            db: Database session
        """
        self.db = db
        self.validator = PlanValidator(db)
    
    def calculate_score(self, plan: Plan) -> Dict:
        """
        Calculate compliance score for a plan.
        
        Args:
            plan: Plan to score
            
        Returns:
            Dictionary with score and details
        """
        # Validate plan
        is_valid, issues = self.validator.validate_plan(plan)
        
        # Count issues by severity
        critical_count = len([i for i in issues if i.severity == "CRITICAL"])
        error_count = len([i for i in issues if i.severity == "ERROR"])
        warning_count = len([i for i in issues if i.severity == "WARNING"])
        info_count = len([i for i in issues if i.severity == "INFO"])
        
        # Calculate score
        score = 100
        
        # Deduct for issues
        score -= critical_count * 20  # Each critical: -20 points
        score -= error_count * 10      # Each error: -10 points
        score -= warning_count * 3     # Each warning: -3 points
        score -= info_count * 1        # Each info: -1 point
        
        # Clamp to 0-100
        score = max(0, min(100, score))
        
        # Determine grade
        if score >= 95:
            grade = "A+"
        elif score >= 90:
            grade = "A"
        elif score >= 85:
            grade = "B+"
        elif score >= 80:
            grade = "B"
        elif score >= 75:
            grade = "C+"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"
        
        # Categorize compliance level
        if score >= 95:
            compliance_level = "EXCELLENT"
        elif score >= 80:
            compliance_level = "GOOD"
        elif score >= 60:
            compliance_level = "ACCEPTABLE"
        elif score >= 40:
            compliance_level = "NEEDS_IMPROVEMENT"
        else:
            compliance_level = "NON_COMPLIANT"
        
        return {
            "score": score,
            "grade": grade,
            "compliance_level": compliance_level,
            "is_valid": is_valid,
            "total_issues": len(issues),
            "critical_issues": critical_count,
            "errors": error_count,
            "warnings": warning_count,
            "info": info_count,
            "issues": [issue.to_dict() for issue in issues]
        }
    
    def compare_plans(
        self,
        plan1: Plan,
        plan2: Plan
    ) -> Dict:
        """
        Compare two plans (e.g., what-if scenarios).
        
        Args:
            plan1: First plan
            plan2: Second plan
            
        Returns:
            Comparison dictionary
        """
        score1 = self.calculate_score(plan1)
        score2 = self.calculate_score(plan2)
        
        return {
            "plan1": {
                "id": plan1.id,
                "name": plan1.plan_name,
                "score": score1["score"],
                "grade": score1["grade"],
                "compliance_level": score1["compliance_level"]
            },
            "plan2": {
                "id": plan2.id,
                "name": plan2.plan_name,
                "score": score2["score"],
                "grade": score2["grade"],
                "compliance_level": score2["compliance_level"]
            },
            "score_difference": score2["score"] - score1["score"],
            "better_plan": plan2.id if score2["score"] > score1["score"] else plan1.id,
            "recommendation": self._generate_recommendation(score1, score2)
        }
    
    def _generate_recommendation(
        self,
        score1: Dict,
        score2: Dict
    ) -> str:
        """Generate recommendation based on comparison."""
        diff = score2["score"] - score1["score"]
        
        if abs(diff) < 5:
            return "Both plans are comparable in compliance. Choose based on other factors."
        elif diff > 0:
            return f"Plan 2 is better with {diff} points higher compliance score."
        else:
            return f"Plan 1 is better with {abs(diff)} points higher compliance score."
    
    def get_rule_compliance_breakdown(self, plan: Plan) -> Dict:
        """
        Get compliance breakdown by rule category.
        
        Args:
            plan: Plan to analyze
            
        Returns:
            Dictionary with category-wise breakdown
        """
        is_valid, issues = self.validator.validate_plan(plan)
        
        # Group issues by rule name
        rule_issues = {}
        for issue in issues:
            if issue.rule_name not in rule_issues:
                rule_issues[issue.rule_name] = []
            rule_issues[issue.rule_name].append(issue)
        
        # Calculate compliance per rule
        rule_compliance = {}
        for rule_name, rule_issue_list in rule_issues.items():
            critical = len([i for i in rule_issue_list if i.severity == "CRITICAL"])
            errors = len([i for i in rule_issue_list if i.severity == "ERROR"])
            warnings = len([i for i in rule_issue_list if i.severity == "WARNING"])
            
            # Compliant if no critical/errors
            is_compliant = critical == 0 and errors == 0
            
            rule_compliance[rule_name] = {
                "compliant": is_compliant,
                "issues": len(rule_issue_list),
                "critical": critical,
                "errors": errors,
                "warnings": warnings
            }
        
        return {
            "total_rules_checked": len(rule_compliance),
            "rules_compliant": sum(1 for r in rule_compliance.values() if r["compliant"]),
            "rules_non_compliant": sum(1 for r in rule_compliance.values() if not r["compliant"]),
            "breakdown": rule_compliance
        }
    
    # ================== ADVANCED COMPLIANCE ANALYSIS ==================
    
    def analyze_compliance_trends(self, plans: List[Plan]) -> Dict[str, Any]:
        """
        Analyze compliance trends across multiple plans.
        
        Args:
            plans: List of plans to analyze
            
        Returns:
            Trend analysis with insights
        """
        trend_data = {}
        
        for plan in plans:
            score_data = self.calculate_score(plan)
            trend_data[plan.id] = {
                "plan_name": plan.plan_name,
                "score": score_data["score"],
                "grade": score_data["grade"],
                "compliance_level": score_data["compliance_level"],
                "total_issues": score_data["total_issues"],
                "critical_issues": score_data["critical_issues"],
                "created_date": plan.created_at
            }
        
        # Calculate trends
        scores = [data["score"] for data in trend_data.values()]
        if len(scores) >= 2:
            # Simple linear trend
            x_values = list(range(len(scores)))
            n = len(scores)
            sum_x = sum(x_values)
            sum_y = sum(scores)
            sum_xy = sum(x * y for x, y in zip(x_values, scores))
            sum_x2 = sum(x * x for x in x_values)
            
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x) if (n * sum_x2 - sum_x * sum_x) != 0 else 0
            trend_direction = "IMPROVING" if slope > 0.5 else "DECLINING" if slope < -0.5 else "STABLE"
        else:
            slope = 0
            trend_direction = "INSUFFICIENT_DATA"
        
        # Identify best and worst performing plans
        best_plan = max(trend_data.values(), key=lambda x: x["score"]) if trend_data else None
        worst_plan = min(trend_data.values(), key=lambda x: x["score"]) if trend_data else None
        
        return {
            "total_plans_analyzed": len(plans),
            "average_score": round(sum(scores) / len(scores), 2) if scores else 0,
            "score_range": {
                "highest": max(scores) if scores else 0,
                "lowest": min(scores) if scores else 0
            },
            "trend_analysis": {
                "direction": trend_direction,
                "slope": round(slope, 3),
                "interpretation": self._interpret_trend(trend_direction, slope)
            },
            "performance_leaders": {
                "best_plan": best_plan,
                "worst_plan": worst_plan
            },
            "plan_details": trend_data,
            "recommendations": self._generate_trend_recommendations(trend_direction, best_plan, worst_plan)
        }
    
    def _interpret_trend(self, direction: str, slope: float) -> str:
        """Interpret trend direction and slope."""
        if direction == "IMPROVING":
            return f"Compliance scores are improving (trend: +{abs(slope):.2f} points per plan)"
        elif direction == "DECLINING":
            return f"Compliance scores are declining (trend: -{abs(slope):.2f} points per plan)"
        elif direction == "STABLE":
            return "Compliance scores remain stable across plans"
        else:
            return "Insufficient data to determine trend"
    
    def _generate_trend_recommendations(self, direction: str, best_plan: Dict, worst_plan: Dict) -> List[str]:
        """Generate recommendations based on trend analysis."""
        recommendations = []
        
        if direction == "DECLINING":
            recommendations.append("Compliance is declining - review processes and increase quality checks")
        elif direction == "IMPROVING":
            recommendations.append("Good improvement trend - continue current practices")
        
        if best_plan and worst_plan:
            score_gap = best_plan["score"] - worst_plan["score"]
            if score_gap > 20:
                recommendations.append(f"Large score variation ({score_gap:.1f} points) - standardize planning processes")
        
        if best_plan and best_plan["score"] > 90:
            recommendations.append(f"Use '{best_plan['plan_name']}' as a template for future plans")
        
        return recommendations
    
    # ================== PREDICTIVE ANALYSIS FUNCTIONS ==================
    
    def predict_compliance_issues(self, plan: Plan) -> Dict[str, Any]:
        """
        Predict potential compliance issues before they occur.
        
        Args:
            plan: Plan to analyze for predictive insights
            
        Returns:
            Predictive analysis with risk assessment
        """
        predictions = []
        risk_factors = []
        
        # Analyze plan characteristics
        courses = self.db.query(Course).filter(Course.plan_id == plan.id).all()
        
        # Risk Factor 1: Course count vs time available
        if plan.start_date and plan.end_date:
            available_days = (plan.end_date - plan.start_date).days + 1
            courses_per_day = len(courses) / available_days if available_days > 0 else 0
            
            if courses_per_day > 3:
                risk_factors.append({
                    "factor": "HIGH_COURSE_DENSITY",
                    "risk_level": "HIGH",
                    "description": f"High course density ({courses_per_day:.1f} courses/day) may cause scheduling conflicts"
                })
                predictions.append("Expect scheduling conflicts due to high course density")
        
        # Risk Factor 2: Student enrollment patterns
        total_students = sum(len(course.students) for course in courses)
        if total_students > 0:
            avg_students_per_course = total_students / len(courses) if courses else 0
            
            if avg_students_per_course > 50:
                risk_factors.append({
                    "factor": "LARGE_COURSE_SIZES",
                    "risk_level": "MEDIUM",
                    "description": f"Large average course size ({avg_students_per_course:.1f} students) may strain room capacity"
                })
                predictions.append("Room capacity issues likely due to large course sizes")
        
        # Risk Factor 3: Faculty availability
        available_faculty = self.db.query(User).filter(
            User.role == UserRole.FACULTY,
            User.is_active == True
        ).count()
        
        required_invigilations = len(courses) * 2  # Estimate 2 invigilators per exam
        faculty_load_ratio = required_invigilations / available_faculty if available_faculty > 0 else 0
        
        if faculty_load_ratio > 1.5:
            risk_factors.append({
                "factor": "INSUFFICIENT_FACULTY",
                "risk_level": "HIGH", 
                "description": f"High faculty load ratio ({faculty_load_ratio:.1f}) may cause invigilator shortages"
            })
            predictions.append("Invigilator assignment challenges expected")
        
        # Risk Factor 4: Room availability
        available_rooms = self.db.query(Room).filter(Room.is_available == True).count()
        if available_rooms < len(courses) * 0.5:  # Need at least 50% of courses worth of rooms
            risk_factors.append({
                "factor": "LIMITED_ROOM_CAPACITY",
                "risk_level": "MEDIUM",
                "description": "Limited room availability may require multi-room exams"
            })
            predictions.append("Room allocation complexity due to limited availability")
        
        # Calculate overall risk score
        risk_weights = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
        total_risk_score = sum(risk_weights.get(rf["risk_level"], 1) for rf in risk_factors)
        max_possible_risk = len(risk_factors) * 3
        risk_percentage = (total_risk_score / max_possible_risk * 100) if max_possible_risk > 0 else 0
        
        # Determine overall risk level
        if risk_percentage >= 70:
            overall_risk = "HIGH"
        elif risk_percentage >= 40:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"
        
        return {
            "overall_risk_level": overall_risk,
            "risk_score": round(risk_percentage, 1),
            "predictions": predictions,
            "risk_factors": risk_factors,
            "mitigation_strategies": self._generate_mitigation_strategies(risk_factors),
            "confidence": self._calculate_prediction_confidence(plan, risk_factors)
        }
    
    def _generate_mitigation_strategies(self, risk_factors: List[Dict]) -> List[str]:
        """Generate mitigation strategies for identified risk factors."""
        strategies = []
        
        factor_types = [rf["factor"] for rf in risk_factors]
        
        if "HIGH_COURSE_DENSITY" in factor_types:
            strategies.append("Extend exam period or use multiple sessions per day")
        
        if "LARGE_COURSE_SIZES" in factor_types:
            strategies.append("Arrange larger rooms or split exams across multiple rooms")
        
        if "INSUFFICIENT_FACULTY" in factor_types:
            strategies.append("Recruit external invigilators or adjust invigilator ratios")
        
        if "LIMITED_ROOM_CAPACITY" in factor_types:
            strategies.append("Secure additional rooms or schedule exams in multiple shifts")
        
        if not strategies:
            strategies.append("No specific mitigation required - proceed with standard planning")
        
        return strategies
    
    def _calculate_prediction_confidence(self, plan: Plan, risk_factors: List[Dict]) -> Dict[str, Any]:
        """Calculate confidence in predictions."""
        confidence_score = 70  # Base confidence
        
        # Increase confidence with more data points
        courses_count = self.db.query(Course).filter(Course.plan_id == plan.id).count()
        if courses_count > 10:
            confidence_score += 10
        
        # Increase confidence with historical data
        # (In real system, compare with similar past plans)
        confidence_score += len(risk_factors) * 5  # More factors = better analysis
        
        confidence_score = min(95, confidence_score)  # Cap at 95%
        
        confidence_level = "HIGH" if confidence_score >= 80 else "MEDIUM" if confidence_score >= 60 else "LOW"
        
        return {
            "score": confidence_score,
            "level": confidence_level,
            "factors_analyzed": len(risk_factors),
            "data_quality": "GOOD" if courses_count > 5 else "LIMITED"
        }
    
    # ================== BENCHMARK COMPARISON FUNCTIONS ==================
    
    def compare_against_benchmarks(self, plan: Plan, benchmark_plans: List[Plan] = None) -> Dict[str, Any]:
        """
        Compare plan compliance against benchmarks.
        
        Args:
            plan: Plan to evaluate
            benchmark_plans: Plans to use as benchmarks (None = use all historical plans)
            
        Returns:
            Benchmark comparison results
        """
        if benchmark_plans is None:
            # Get all plans from same exam type as benchmarks
            benchmark_plans = self.db.query(Plan).filter(
                Plan.exam_type == plan.exam_type,
                Plan.id != plan.id
            ).all()
        
        current_score = self.calculate_score(plan)
        
        # Calculate benchmark statistics
        benchmark_scores = []
        for bp in benchmark_plans:
            bp_score = self.calculate_score(bp)
            benchmark_scores.append({
                "plan_id": bp.id,
                "plan_name": bp.plan_name,
                "score": bp_score["score"],
                "grade": bp_score["grade"]
            })
        
        if not benchmark_scores:
            return {
                "comparison_available": False,
                "message": "No benchmark plans available for comparison"
            }
        
        scores_only = [bs["score"] for bs in benchmark_scores]
        avg_benchmark_score = sum(scores_only) / len(scores_only)
        
        # Calculate percentile ranking
        better_than_count = sum(1 for score in scores_only if current_score["score"] > score)
        percentile_rank = (better_than_count / len(scores_only)) * 100
        
        # Find similar performers
        score_range = 5  # Within 5 points
        similar_performers = [
            bs for bs in benchmark_scores 
            if abs(bs["score"] - current_score["score"]) <= score_range
        ]
        
        return {
            "comparison_available": True,
            "current_plan": {
                "score": current_score["score"],
                "grade": current_score["grade"]
            },
            "benchmark_statistics": {
                "total_benchmarks": len(benchmark_scores),
                "average_score": round(avg_benchmark_score, 2),
                "highest_score": max(scores_only),
                "lowest_score": min(scores_only)
            },
            "performance_ranking": {
                "percentile": round(percentile_rank, 1),
                "rank_description": self._describe_percentile_rank(percentile_rank),
                "better_than": better_than_count,
                "total_compared": len(scores_only)
            },
            "score_comparison": {
                "vs_average": round(current_score["score"] - avg_benchmark_score, 2),
                "performance": "ABOVE_AVERAGE" if current_score["score"] > avg_benchmark_score else "BELOW_AVERAGE"
            },
            "similar_performers": similar_performers,
            "improvement_potential": max(scores_only) - current_score["score"] if scores_only else 0,
            "recommendations": self._generate_benchmark_recommendations(
                current_score["score"], avg_benchmark_score, max(scores_only), percentile_rank
            )
        }
    
    def _describe_percentile_rank(self, percentile: float) -> str:
        """Describe percentile ranking in human terms."""
        if percentile >= 90:
            return "EXCELLENT - Top 10% of all plans"
        elif percentile >= 75:
            return "GOOD - Top 25% of all plans"
        elif percentile >= 50:
            return "AVERAGE - Above median performance"
        elif percentile >= 25:
            return "BELOW_AVERAGE - Bottom 50% of plans"
        else:
            return "POOR - Bottom 25% of plans"
    
    def _generate_benchmark_recommendations(self, current_score: float, avg_score: float, max_score: float, percentile: float) -> List[str]:
        """Generate recommendations based on benchmark comparison."""
        recommendations = []
        
        if percentile >= 90:
            recommendations.append("Excellent performance - consider sharing best practices")
        elif percentile >= 75:
            recommendations.append("Good performance - minor improvements could push to top tier")
        elif percentile < 50:
            recommendations.append("Below average performance - review successful plans for improvement ideas")
        
        if current_score < avg_score:
            gap = avg_score - current_score
            recommendations.append(f"Focus on closing {gap:.1f} point gap to reach average performance")
        
        if max_score - current_score > 20:
            recommendations.append("Significant improvement potential - analyze top-performing plans")
        
        return recommendations
