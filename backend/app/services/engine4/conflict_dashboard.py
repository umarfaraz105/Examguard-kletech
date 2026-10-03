"""
Conflict dashboard for visualizing issues.

Provides aggregated view of conflicts and issues across plans.
"""
from typing import Dict, List, Any
from collections import defaultdict
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.models.plan import Plan
from app.services.engine4.validator import PlanValidator


class ConflictDashboard:
    """
    Generates conflict dashboard data.
    
    Provides:
    - Issue heatmap by date
    - Conflict by student/course
    - Issue trends
    - Hot spots
    """
    
    def __init__(self, db: Session):
        """
        Initialize conflict dashboard.
        
        Args:
            db: Database session
        """
        self.db = db
        self.validator = PlanValidator(db)
    
    def generate_dashboard(self, plan: Plan) -> Dict:
        """
        Generate dashboard data for a plan.
        
        Args:
            plan: Plan to analyze
            
        Returns:
            Dashboard data dictionary
        """
        is_valid, issues = self.validator.validate_plan(plan)
        
        return {
            "overview": self._get_overview(plan, issues),
            "by_severity": self._group_by_severity(issues),
            "by_rule": self._group_by_rule(issues),
            "by_entity": self._group_by_entity(issues),
            "hot_spots": self._identify_hot_spots(issues),
            "timeline": self._generate_timeline(plan, issues)
        }
    
    def _get_overview(self, plan: Plan, issues: List) -> Dict:
        """Generate overview statistics."""
        from app.models.schedule import ScheduledExam
        
        exams = self.db.query(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id
        ).all()
        
        return {
            "plan_name": plan.plan_name,
            "plan_status": plan.status.value,
            "total_exams": len(exams),
            "total_issues": len(issues),
            "critical_issues": len([i for i in issues if i.severity == "CRITICAL"]),
            "error_issues": len([i for i in issues if i.severity == "ERROR"]),
            "warning_issues": len([i for i in issues if i.severity == "WARNING"])
        }
    
    def _group_by_severity(self, issues: List) -> Dict:
        """Group issues by severity."""
        grouped = defaultdict(list)
        for issue in issues:
            grouped[issue.severity].append(issue.to_dict())
        return dict(grouped)
    
    def _group_by_rule(self, issues: List) -> Dict:
        """Group issues by rule name."""
        grouped = defaultdict(list)
        for issue in issues:
            grouped[issue.rule_name].append(issue.to_dict())
        return dict(grouped)
    
    def _group_by_entity(self, issues: List) -> Dict:
        """Group issues by entity type."""
        grouped = defaultdict(list)
        for issue in issues:
            entity_type = issue.entity_type or "GENERAL"
            grouped[entity_type].append(issue.to_dict())
        return dict(grouped)
    
    def _identify_hot_spots(self, issues: List) -> List[Dict]:
        """Identify hot spots (entities with multiple issues)."""
        entity_counts = defaultdict(int)
        
        for issue in issues:
            if issue.entity_type and issue.entity_id:
                key = f"{issue.entity_type}:{issue.entity_id}"
                entity_counts[key] += 1
        
        # Get top 10 hot spots
        hot_spots = sorted(
            entity_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        return [
            {"entity": entity, "issue_count": count}
            for entity, count in hot_spots
        ]
    
    def _generate_timeline(self, plan: Plan, issues: List) -> List[Dict]:
        """Generate timeline of issues (if date-related)."""
        from app.models.schedule import ScheduledExam
        
        # Get exams with issues
        exam_issues = defaultdict(list)
        for issue in issues:
            if issue.entity_type == "EXAM" and issue.entity_id:
                exam_issues[issue.entity_id].append(issue)
        
        # Build timeline
        timeline = []
        for exam_id, exam_issue_list in exam_issues.items():
            exam = self.db.query(ScheduledExam).filter(
                ScheduledExam.id == exam_id
            ).first()
            
            if exam and exam.exam_date:
                timeline.append({
                    "date": exam.exam_date.isoformat(),
                    "exam": exam.course.course_code,
                    "issues": len(exam_issue_list),
                    "severities": [i.severity for i in exam_issue_list]
                })
        
        # Sort by date
        timeline.sort(key=lambda x: x["date"])
        
        return timeline
    
    # ================== ADVANCED DASHBOARD FUNCTIONS ==================
    
    def generate_real_time_dashboard(self, plan: Plan) -> Dict[str, Any]:
        """
        Generate real-time dashboard with live metrics.
        
        Args:
            plan: Plan to monitor
            
        Returns:
            Real-time dashboard data
        """
        is_valid, issues = self.validator.validate_plan(plan)
        
        # Current status metrics
        from app.models.schedule import ScheduledExam
        from app.models.invigilator import InvigilatorAssignment, InvigilatorStatus
        from app.models.seating import SeatAssignment
        from app.models.user import User, UserRole
        from datetime import datetime, date
        
        total_exams = self.db.query(ScheduledExam).filter(ScheduledExam.plan_id == plan.id).count()
        
        scheduled_exams = self.db.query(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id,
            ScheduledExam.exam_date.isnot(None)
        ).count()
        
        rooms_assigned = self.db.query(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id,
            ScheduledExam.room_id.isnot(None)
        ).count()
        
        invigilators_assigned = self.db.query(InvigilatorAssignment).join(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id,
            InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED
        ).count()
        
        seats_assigned = self.db.query(SeatAssignment).join(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id
        ).count()
        
        # Progress calculations
        progress_metrics = {
            "scheduling": {
                "completed": scheduled_exams,
                "total": total_exams,
                "percentage": round((scheduled_exams / total_exams * 100), 2) if total_exams > 0 else 0
            },
            "room_allocation": {
                "completed": rooms_assigned,
                "total": scheduled_exams,
                "percentage": round((rooms_assigned / scheduled_exams * 100), 2) if scheduled_exams > 0 else 0
            },
            "seat_assignment": {
                "completed": seats_assigned,
                "total": sum(exam.num_students for exam in self.db.query(ScheduledExam).filter(ScheduledExam.plan_id == plan.id).all()),
                "percentage": 0  # Would need to calculate based on actual seat assignments
            },
            "invigilator_assignment": {
                "completed": invigilators_assigned,
                "total": total_exams * 2,  # Estimate 2 invigilators per exam
                "percentage": round((invigilators_assigned / (total_exams * 2) * 100), 2) if total_exams > 0 else 0
            }
        }
        
        # Overall completion
        completion_stages = ["scheduling", "room_allocation", "invigilator_assignment"]
        overall_completion = sum(progress_metrics[stage]["percentage"] for stage in completion_stages) / len(completion_stages)
        
        # Issue categorization
        critical_issues = [i for i in issues if i.severity == "CRITICAL"]
        blocking_issues = len(critical_issues)
        
        # Status determination
        if overall_completion >= 100 and blocking_issues == 0:
            plan_status = "READY"
        elif overall_completion >= 80:
            plan_status = "NEAR_COMPLETION"
        elif blocking_issues > 0:
            plan_status = "BLOCKED"
        elif overall_completion >= 50:
            plan_status = "IN_PROGRESS"
        else:
            plan_status = "PLANNING"
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "plan_overview": {
                "id": plan.id,
                "name": plan.plan_name,
                "status": plan_status,
                "overall_completion": round(overall_completion, 2)
            },
            "progress_tracking": progress_metrics,
            "issue_summary": {
                "total_issues": len(issues),
                "critical": len([i for i in issues if i.severity == "CRITICAL"]),
                "errors": len([i for i in issues if i.severity == "ERROR"]),
                "warnings": len([i for i in issues if i.severity == "WARNING"]),
                "blocking_issues": blocking_issues
            },
            "next_actions": self._determine_next_actions(progress_metrics, critical_issues),
            "alerts": self._generate_alerts(progress_metrics, issues, plan_status),
            "timeline_status": self._assess_timeline_status(plan)
        }
    
    def _determine_next_actions(self, progress: Dict, critical_issues: List) -> List[str]:
        """Determine recommended next actions based on current progress."""
        actions = []
        
        if critical_issues:
            actions.append(f"URGENT: Resolve {len(critical_issues)} critical issues")
        
        if progress["scheduling"]["percentage"] < 100:
            actions.append("Complete exam scheduling")
        elif progress["room_allocation"]["percentage"] < 100:
            actions.append("Allocate rooms for scheduled exams")
        elif progress["invigilator_assignment"]["percentage"] < 100:
            actions.append("Assign invigilators to exams")
        else:
            actions.append("Review and finalize plan")
        
        return actions
    
    def _generate_alerts(self, progress: Dict, issues: List, status: str) -> List[Dict]:
        """Generate alerts based on current state."""
        alerts = []
        
        # Critical issue alerts
        critical_count = len([i for i in issues if i.severity == "CRITICAL"])
        if critical_count > 0:
            alerts.append({
                "type": "CRITICAL",
                "message": f"{critical_count} critical issues require immediate attention",
                "action": "Review validation report"
            })
        
        # Progress alerts
        for stage, data in progress.items():
            if data["percentage"] < 50 and data["total"] > 0:
                alerts.append({
                    "type": "WARNING",
                    "message": f"{stage.replace('_', ' ').title()} is only {data['percentage']:.1f}% complete",
                    "action": f"Focus on {stage} completion"
                })
        
        # Status alerts
        if status == "BLOCKED":
            alerts.append({
                "type": "ERROR",
                "message": "Plan is blocked due to critical issues",
                "action": "Resolve blocking issues immediately"
            })
        
        return alerts
    
    def _assess_timeline_status(self, plan: Plan) -> Dict[str, Any]:
        """Assess timeline status and deadlines."""
        if not plan.start_date:
            return {"status": "NO_TIMELINE", "message": "No exam dates set"}
        
        days_until_exams = (plan.start_date - date.today()).days
        
        if days_until_exams < 0:
            timeline_status = "OVERDUE"
            urgency = "CRITICAL"
        elif days_until_exams < 7:
            timeline_status = "URGENT"
            urgency = "HIGH"
        elif days_until_exams < 14:
            timeline_status = "APPROACHING"
            urgency = "MEDIUM"
        else:
            timeline_status = "ON_TRACK"
            urgency = "LOW"
        
        return {
            "status": timeline_status,
            "days_remaining": days_until_exams,
            "urgency": urgency,
            "start_date": plan.start_date.isoformat(),
            "end_date": plan.end_date.isoformat() if plan.end_date else None
        }
    
    # ================== ANALYTICS FUNCTIONS ==================
    
    def generate_performance_analytics(self, plan: Plan) -> Dict[str, Any]:
        """
        Generate detailed performance analytics for the plan.
        
        Args:
            plan: Plan to analyze
            
        Returns:
            Performance analytics data
        """
        is_valid, issues = self.validator.validate_plan(plan)
        
        # Performance metrics calculation
        from app.models.schedule import ScheduledExam
        from app.models.room import Room
        from app.models.user import User, UserRole
        from app.models.invigilator import InvigilatorAssignment, InvigilatorStatus
        
        scheduled_exams = self.db.query(ScheduledExam).filter(ScheduledExam.plan_id == plan.id).all()
        
        # Scheduling efficiency
        if scheduled_exams:
            exam_dates = [exam.exam_date for exam in scheduled_exams if exam.exam_date]
            if len(exam_dates) >= 2:
                exam_period = (max(exam_dates) - min(exam_dates)).days + 1
                scheduling_efficiency = len(exam_dates) / exam_period if exam_period > 0 else 0
            else:
                scheduling_efficiency = 0
        else:
            scheduling_efficiency = 0
        
        # Resource utilization
        total_rooms = self.db.query(Room).filter(Room.is_available == True).count()
        used_rooms = len(set(exam.room_id for exam in scheduled_exams if exam.room_id))
        room_utilization = (used_rooms / total_rooms * 100) if total_rooms > 0 else 0
        
        # Faculty utilization
        total_faculty = self.db.query(User).filter(User.role == UserRole.FACULTY).count()
        assigned_faculty = self.db.query(InvigilatorAssignment).join(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id,
            InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED
        ).distinct(InvigilatorAssignment.faculty_id).count()
        faculty_utilization = (assigned_faculty / total_faculty * 100) if total_faculty > 0 else 0
        
        # Quality metrics
        total_issues = len(issues)
        quality_score = max(0, 100 - (total_issues * 5))  # Deduct 5 points per issue
        
        # Efficiency ratings
        efficiency_ratings = {
            "scheduling": self._rate_efficiency(scheduling_efficiency * 100),
            "room_utilization": self._rate_efficiency(room_utilization),
            "faculty_utilization": self._rate_efficiency(faculty_utilization),
            "overall_quality": self._rate_efficiency(quality_score)
        }
        
        return {
            "performance_summary": {
                "overall_rating": self._calculate_overall_rating(efficiency_ratings),
                "key_strengths": self._identify_strengths(efficiency_ratings),
                "improvement_areas": self._identify_weaknesses(efficiency_ratings)
            },
            "efficiency_metrics": {
                "scheduling_efficiency": round(scheduling_efficiency * 100, 2),
                "room_utilization": round(room_utilization, 2),
                "faculty_utilization": round(faculty_utilization, 2),
                "quality_score": quality_score
            },
            "efficiency_ratings": efficiency_ratings,
            "resource_analysis": {
                "rooms": {
                    "total_available": total_rooms,
                    "used": used_rooms,
                    "utilization_percentage": round(room_utilization, 2)
                },
                "faculty": {
                    "total_available": total_faculty,
                    "assigned": assigned_faculty,
                    "utilization_percentage": round(faculty_utilization, 2)
                }
            },
            "recommendations": self._generate_performance_recommendations(efficiency_ratings, room_utilization, faculty_utilization)
        }
    
    def _rate_efficiency(self, percentage: float) -> str:
        """Rate efficiency based on percentage."""
        if percentage >= 90:
            return "EXCELLENT"
        elif percentage >= 80:
            return "GOOD"
        elif percentage >= 70:
            return "FAIR"
        elif percentage >= 60:
            return "POOR"
        else:
            return "VERY_POOR"
    
    def _calculate_overall_rating(self, ratings: Dict[str, str]) -> str:
        """Calculate overall rating from individual ratings."""
        rating_scores = {
            "EXCELLENT": 5, "GOOD": 4, "FAIR": 3, "POOR": 2, "VERY_POOR": 1
        }
        
        scores = [rating_scores.get(rating, 1) for rating in ratings.values()]
        avg_score = sum(scores) / len(scores)
        
        if avg_score >= 4.5:
            return "EXCELLENT"
        elif avg_score >= 3.5:
            return "GOOD"
        elif avg_score >= 2.5:
            return "FAIR"
        elif avg_score >= 1.5:
            return "POOR"
        else:
            return "VERY_POOR"
    
    def _identify_strengths(self, ratings: Dict[str, str]) -> List[str]:
        """Identify strengths based on ratings."""
        return [
            area.replace('_', ' ').title() 
            for area, rating in ratings.items() 
            if rating in ["EXCELLENT", "GOOD"]
        ]
    
    def _identify_weaknesses(self, ratings: Dict[str, str]) -> List[str]:
        """Identify areas needing improvement."""
        return [
            area.replace('_', ' ').title()
            for area, rating in ratings.items()
            if rating in ["POOR", "VERY_POOR"]
        ]
    
    def _generate_performance_recommendations(self, ratings: Dict, room_util: float, faculty_util: float) -> List[str]:
        """Generate performance improvement recommendations."""
        recommendations = []
        
        if ratings["scheduling"] in ["POOR", "VERY_POOR"]:
            recommendations.append("Improve scheduling efficiency by optimizing exam distribution")
        
        if room_util < 70:
            recommendations.append("Increase room utilization or reduce available room pool")
        elif room_util > 95:
            recommendations.append("Room utilization very high - consider expanding room availability")
        
        if faculty_util < 60:
            recommendations.append("Better faculty utilization - involve more faculty members")
        elif faculty_util > 90:
            recommendations.append("Faculty workload high - consider recruiting additional invigilators")
        
        if ratings["overall_quality"] in ["POOR", "VERY_POOR"]:
            recommendations.append("Focus on quality improvement - address validation issues")
        
        return recommendations
    
    # ================== VISUALIZATION FUNCTIONS ==================
    
    def generate_heatmap_data(self, plan: Plan) -> Dict[str, Any]:
        """
        Generate heatmap data for visualization.
        
        Args:
            plan: Plan to analyze
            
        Returns:
            Heatmap visualization data
        """
        is_valid, issues = self.validator.validate_plan(plan)
        
        from app.models.schedule import ScheduledExam
        
        # Get all scheduled exams
        scheduled_exams = self.db.query(ScheduledExam).filter(ScheduledExam.plan_id == plan.id).all()
        
        # Create date-session grid
        exam_grid = defaultdict(lambda: defaultdict(int))
        issue_grid = defaultdict(lambda: defaultdict(int))
        
        # Map exam issues to grid
        exam_issues = defaultdict(list)
        for issue in issues:
            if issue.entity_type == "EXAM" and issue.entity_id:
                exam_issues[issue.entity_id].append(issue)
        
        # Populate grids
        for exam in scheduled_exams:
            if exam.exam_date and exam.session:
                date_str = exam.exam_date.isoformat()
                session_str = exam.session.value
                
                exam_grid[date_str][session_str] += 1
                
                # Add issue count for this exam
                exam_issue_count = len(exam_issues.get(exam.id, []))
                issue_grid[date_str][session_str] += exam_issue_count
        
        # Convert to list format for visualization
        heatmap_data = []
        all_dates = sorted(exam_grid.keys())
        all_sessions = ["MORNING", "AFTERNOON", "EVENING"]
        
        for date_str in all_dates:
            for session in all_sessions:
                exam_count = exam_grid[date_str].get(session, 0)
                issue_count = issue_grid[date_str].get(session, 0)
                
                heatmap_data.append({
                    "date": date_str,
                    "session": session,
                    "exam_count": exam_count,
                    "issue_count": issue_count,
                    "intensity": exam_count + (issue_count * 2),  # Weight issues higher
                    "status": self._determine_cell_status(exam_count, issue_count)
                })
        
        return {
            "heatmap_data": heatmap_data,
            "date_range": {
                "start": min(all_dates) if all_dates else None,
                "end": max(all_dates) if all_dates else None
            },
            "sessions": all_sessions,
            "statistics": {
                "total_cells": len(heatmap_data),
                "active_cells": len([cell for cell in heatmap_data if cell["exam_count"] > 0]),
                "problem_cells": len([cell for cell in heatmap_data if cell["issue_count"] > 0]),
                "max_intensity": max([cell["intensity"] for cell in heatmap_data], default=0)
            }
        }
    
    def _determine_cell_status(self, exam_count: int, issue_count: int) -> str:
        """Determine status color for heatmap cell."""
        if issue_count > 0:
            return "PROBLEMATIC"
        elif exam_count == 0:
            return "EMPTY"
        elif exam_count <= 2:
            return "NORMAL"
        elif exam_count <= 4:
            return "BUSY"
        else:
            return "OVERLOADED"
