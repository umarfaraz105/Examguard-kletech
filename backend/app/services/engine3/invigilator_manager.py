"""
Invigilator manager for exam duty assignments.

Assigns invigilators to exams based on rules, eligibility, and workload.
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
import uuid
import time as time_module
from collections import defaultdict

from app.models.schedule import ScheduledExam
from app.models.user import User
from app.models.invigilator import (
    InvigilatorAssignment,
    InvigilatorRole,
    InvigilatorStatus
)
from app.models.rule import ExamType
from app.models.audit_log import AuditLog, AuditAction, AuditEntity
from app.services.rules import RuleProvider
from app.services.engine3.eligibility_checker import EligibilityChecker
from app.services.engine3.workload_balancer import WorkloadBalancer
from app.core.engine_interface import (
    BaseEngine, 
    EngineMetadata, 
    EngineExecutionResult, 
    EngineValidationError,
    EngineStatus
)


class InvigilatorResult:
    """Result of invigilator assignment."""
    
    def __init__(
        self,
        success: bool,
        assignments: List[InvigilatorAssignment],
        message: str,
        statistics: Dict,
        warnings: List[str] = None
    ):
        """
        Initialize invigilator result.
        
        Args:
            success: Whether assignment succeeded
            assignments: List of invigilator assignments
            message: Result message
            statistics: Assignment statistics
            warnings: List of warning messages
        """
        self.success = success
        self.assignments = assignments
        self.message = message
        self.statistics = statistics
        self.warnings = warnings or []


class InvigilatorManager:
    """
    Manages invigilator assignments for exams.
    
    Responsibilities:
    1. Assign appropriate number of invigilators per exam
    2. Ensure eligibility (availability, no conflicts)
    3. Balance workload fairly across faculty
    4. Maintain invigilator:student ratio from rules
    5. Assign primary, relief, and reserve invigilators
    """
    
    def __init__(self, db: Session):
        """
        Initialize invigilator manager.
        
        Args:
            db: Database session
        """
        self.db = db
        self.rule_provider = RuleProvider(db)
        self.eligibility_checker = EligibilityChecker(db)
        self.workload_balancer = WorkloadBalancer(db)
    
    def assign_invigilators(
        self,
        scheduled_exam: ScheduledExam,
        exam_type: ExamType,
        user_id: int = None,
        include_relief: bool = True,
        include_reserve: bool = True
    ) -> InvigilatorResult:
        """
        Assign invigilators to a scheduled exam.
        
        Args:
            scheduled_exam: Exam to assign invigilators for
            exam_type: Type of exam (for rules)
            user_id: User performing the assignment
            include_relief: Whether to assign relief invigilator
            include_reserve: Whether to assign reserve invigilator
            
        Returns:
            InvigilatorResult with assignments or error
        """
        warnings = []
        
        # Get rules
        ratio = self.rule_provider.get_float(exam_type, "invigilator_ratio")
        min_invigilators = self.rule_provider.get_int(
            exam_type,
            "min_invigilators_per_room"
        )
        
        # Calculate required invigilators
        num_students = scheduled_exam.num_students
        required_by_ratio = int(num_students * ratio) or 1
        required = max(required_by_ratio, min_invigilators)
        
        # Get eligible faculty
        eligible_results = self.eligibility_checker.get_eligible_faculty(
            scheduled_exam,
            department=None  # Can filter by department if needed
        )
        
        # Filter to truly eligible (no ERROR issues)
        eligible_faculty = [
            faculty for faculty, issues in eligible_results
            if not any(i.severity == "ERROR" for i in issues)
        ]
        
        if len(eligible_faculty) < required:
            return InvigilatorResult(
                success=False,
                assignments=[],
                message=f"Insufficient eligible faculty: need {required}, have {len(eligible_faculty)}",
                statistics={
                    "required": required,
                    "eligible": len(eligible_faculty),
                    "num_students": num_students
                }
            )
        
        # Assign primary invigilators
        assignments = []
        
        for i in range(required):
            # Select best faculty based on workload
            faculty = self.workload_balancer.select_best_faculty(
                eligible_faculty,
                scheduled_exam,
                prefer_same_department=True
            )
            
            if not faculty:
                break
            
            # Create assignment
            assignment = InvigilatorAssignment(
                scheduled_exam_id=scheduled_exam.id,
                faculty_id=faculty.id,
                role=InvigilatorRole.PRIMARY,
                status=InvigilatorStatus.ASSIGNED,
                workload_points=2 if i == 0 else 1  # Primary gets more points
            )
            
            assignments.append(assignment)
            eligible_faculty.remove(faculty)  # Don't assign twice
        
        # Assign relief invigilator (optional)
        if include_relief and eligible_faculty:
            faculty = self.workload_balancer.select_best_faculty(
                eligible_faculty,
                scheduled_exam
            )
            
            if faculty:
                assignment = InvigilatorAssignment(
                    scheduled_exam_id=scheduled_exam.id,
                    faculty_id=faculty.id,
                    role=InvigilatorRole.RELIEF,
                    status=InvigilatorStatus.ASSIGNED,
                    workload_points=1
                )
                assignments.append(assignment)
                eligible_faculty.remove(faculty)
            else:
                warnings.append("Could not assign relief invigilator")
        
        # Assign reserve invigilator (optional)
        if include_reserve and eligible_faculty:
            faculty = self.workload_balancer.select_best_faculty(
                eligible_faculty,
                scheduled_exam
            )
            
            if faculty:
                assignment = InvigilatorAssignment(
                    scheduled_exam_id=scheduled_exam.id,
                    faculty_id=faculty.id,
                    role=InvigilatorRole.RESERVE,
                    status=InvigilatorStatus.ASSIGNED,
                    workload_points=0  # Reserve doesn't count unless activated
                )
                assignments.append(assignment)
            else:
                warnings.append("Could not assign reserve invigilator")
        
        # Log to audit
        if user_id:
            AuditLog.log_action(
                db=self.db,
                user_id=user_id,
                action=AuditAction.ASSIGN,
                entity_type=AuditEntity.INVIGILATOR_ASSIGNMENT,
                description=f"Assigned {len(assignments)} invigilators to exam {scheduled_exam.course.course_code}",
                new_values={
                    "exam_id": scheduled_exam.id,
                    "num_assignments": len(assignments),
                    "required": required
                }
            )
        
        # Statistics
        statistics = {
            "num_students": num_students,
            "required_invigilators": required,
            "assigned": len([a for a in assignments if a.role == InvigilatorRole.PRIMARY]),
            "relief": len([a for a in assignments if a.role == InvigilatorRole.RELIEF]),
            "reserve": len([a for a in assignments if a.role == InvigilatorRole.RESERVE]),
            "total_assignments": len(assignments),
            "ratio_achieved": len(assignments) / num_students if num_students > 0 else 0
        }
        
        return InvigilatorResult(
            success=True,
            assignments=assignments,
            message=f"Assigned {len(assignments)} invigilators",
            statistics=statistics,
            warnings=warnings
        )
    
    def assign_invigilators_bulk(
        self,
        scheduled_exams: List[ScheduledExam],
        exam_type: ExamType,
        user_id: int = None
    ) -> Dict[int, InvigilatorResult]:
        """
        Assign invigilators to multiple exams with balanced workload.
        
        Args:
            scheduled_exams: List of exams
            exam_type: Type of exam
            user_id: User performing assignments
            
        Returns:
            Dictionary mapping exam_id to InvigilatorResult
        """
        # Clear workload cache for fresh calculation
        self.workload_balancer.clear_cache()
        
        results = {}
        
        for exam in scheduled_exams:
            result = self.assign_invigilators(
                exam,
                exam_type,
                user_id,
                include_relief=True,
                include_reserve=True
            )
            results[exam.id] = result
            
            # Clear cache after each assignment to reflect updated workload
            self.workload_balancer.clear_cache()
        
        return results
    
    def replace_invigilator(
        self,
        original_assignment: InvigilatorAssignment,
        replacement_faculty: User,
        reason: str,
        user_id: int = None
    ) -> InvigilatorAssignment:
        """
        Replace an invigilator with another faculty member.
        
        Args:
            original_assignment: Original assignment to replace
            replacement_faculty: New faculty member
            reason: Reason for replacement
            user_id: User performing the replacement
            
        Returns:
            New InvigilatorAssignment
        """
        # Mark original as replaced
        original_assignment.status = InvigilatorStatus.REPLACED
        original_assignment.remarks = f"Replaced: {reason}"
        
        # Create replacement assignment
        replacement = InvigilatorAssignment(
            scheduled_exam_id=original_assignment.scheduled_exam_id,
            faculty_id=replacement_faculty.id,
            role=original_assignment.role,
            status=InvigilatorStatus.ASSIGNED,
            workload_points=original_assignment.workload_points,
            replacement_for_id=original_assignment.id,
            remarks=f"Replacement for {original_assignment.faculty.full_name}: {reason}"
        )
        
        self.db.add(replacement)
        self.db.commit()
        
        # Log to audit
        if user_id:
            AuditLog.log_action(
                db=self.db,
                user_id=user_id,
                action=AuditAction.UPDATE,
                entity_type=AuditEntity.INVIGILATOR_ASSIGNMENT,
                description=f"Replaced invigilator: {original_assignment.faculty.full_name} → {replacement_faculty.full_name}",
                old_values={"faculty_id": original_assignment.faculty_id},
                new_values={"faculty_id": replacement_faculty.id, "reason": reason}
            )
        
        return replacement
    
    def get_faculty_schedule(
        self,
        faculty: User,
        start_date,
        end_date
    ) -> List[InvigilatorAssignment]:
        """
        Get faculty's invigilator schedule for a date range.
        
        Args:
            faculty: Faculty member
            start_date: Start date
            end_date: End date
            
        Returns:
            List of assignments in date range
        """
        assignments = self.db.query(InvigilatorAssignment).join(
            ScheduledExam
        ).filter(
            InvigilatorAssignment.faculty_id == faculty.id,
            ScheduledExam.exam_date >= start_date,
            ScheduledExam.exam_date <= end_date
        ).order_by(ScheduledExam.exam_date, ScheduledExam.session).all()
        
        return assignments
    
    # ================== ADVANCED ASSIGNMENT FUNCTIONS ==================
    
    def analyze_faculty_workload_distribution(self, date_range: tuple = None) -> Dict[str, Any]:
        """
        Analyze workload distribution across all faculty members.
        
        Args:
            date_range: Optional (start_date, end_date) tuple
            
        Returns:
            Comprehensive workload analysis
        """
        query = self.db.query(InvigilatorAssignment).join(ScheduledExam)
        
        if date_range:
            start_date, end_date = date_range
            query = query.filter(
                ScheduledExam.exam_date >= start_date,
                ScheduledExam.exam_date <= end_date
            )
        
        assignments = query.filter(
            InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED
        ).all()
        
        # Calculate workload per faculty
        faculty_workload = defaultdict(lambda: {
            "total_points": 0,
            "primary_duties": 0,
            "relief_duties": 0,
            "reserve_duties": 0,
            "total_duties": 0,
            "departments": set(),
            "exam_dates": set()
        })
        
        for assignment in assignments:
            faculty_id = assignment.faculty_id
            workload = faculty_workload[faculty_id]
            
            workload["total_points"] += assignment.workload_points
            workload["total_duties"] += 1
            workload["departments"].add(assignment.faculty.department)
            workload["exam_dates"].add(assignment.scheduled_exam.exam_date)
            
            if assignment.role == InvigilatorRole.PRIMARY:
                workload["primary_duties"] += 1
            elif assignment.role == InvigilatorRole.RELIEF:
                workload["relief_duties"] += 1
            elif assignment.role == InvigilatorRole.RESERVE:
                workload["reserve_duties"] += 1
        
        # Calculate statistics
        workloads = [data["total_points"] for data in faculty_workload.values()]
        if workloads:
            avg_workload = sum(workloads) / len(workloads)
            max_workload = max(workloads)
            min_workload = min(workloads)
            variance = sum((w - avg_workload) ** 2 for w in workloads) / len(workloads)
            std_deviation = variance ** 0.5
        else:
            avg_workload = max_workload = min_workload = variance = std_deviation = 0
        
        # Identify imbalances
        overloaded_faculty = []
        underutilized_faculty = []
        
        for faculty_id, data in faculty_workload.items():
            if data["total_points"] > avg_workload + std_deviation:
                faculty = self.db.query(User).get(faculty_id)
                overloaded_faculty.append({
                    "faculty_id": faculty_id,
                    "name": faculty.full_name if faculty else "Unknown",
                    "workload": data["total_points"],
                    "excess": data["total_points"] - avg_workload
                })
            elif data["total_points"] < avg_workload - std_deviation and data["total_points"] > 0:
                faculty = self.db.query(User).get(faculty_id)
                underutilized_faculty.append({
                    "faculty_id": faculty_id,
                    "name": faculty.full_name if faculty else "Unknown", 
                    "workload": data["total_points"],
                    "deficit": avg_workload - data["total_points"]
                })
        
        return {
            "total_faculty_assigned": len(faculty_workload),
            "total_assignments": len(assignments),
            "workload_statistics": {
                "average": round(avg_workload, 2),
                "maximum": max_workload,
                "minimum": min_workload,
                "standard_deviation": round(std_deviation, 2),
                "variance": round(variance, 2)
            },
            "imbalance_analysis": {
                "overloaded_count": len(overloaded_faculty),
                "underutilized_count": len(underutilized_faculty),
                "overloaded_faculty": overloaded_faculty,
                "underutilized_faculty": underutilized_faculty
            },
            "distribution_quality": self._assess_distribution_quality(std_deviation, avg_workload),
            "recommendations": self._generate_workload_recommendations(overloaded_faculty, underutilized_faculty, std_deviation, avg_workload)
        }
    
    def _assess_distribution_quality(self, std_dev: float, avg_workload: float) -> str:
        """Assess the quality of workload distribution."""
        if avg_workload == 0:
            return "NO_DATA"
        
        coefficient_of_variation = (std_dev / avg_workload) * 100
        
        if coefficient_of_variation < 15:
            return "EXCELLENT"
        elif coefficient_of_variation < 25:
            return "GOOD"
        elif coefficient_of_variation < 40:
            return "FAIR"
        else:
            return "POOR"
    
    def _generate_workload_recommendations(self, overloaded: List, underutilized: List, std_dev: float, avg: float) -> List[str]:
        """Generate workload balancing recommendations."""
        recommendations = []
        
        if not overloaded and not underutilized:
            recommendations.append("Workload distribution is well balanced")
        
        if overloaded:
            recommendations.append(f"Consider redistributing duties from {len(overloaded)} overloaded faculty members")
            
        if underutilized:
            recommendations.append(f"Utilize {len(underutilized)} underutilized faculty members more effectively")
        
        if std_dev > avg * 0.3:
            recommendations.append("High workload variance detected - implement systematic balancing")
        
        return recommendations
    
    # ================== CONFLICT DETECTION FUNCTIONS ==================
    
    def detect_assignment_conflicts(self, scheduled_exams: List[ScheduledExam]) -> Dict[str, Any]:
        """
        Detect conflicts in invigilator assignments.
        
        Args:
            scheduled_exams: List of scheduled exams to analyze
            
        Returns:
            Conflict analysis results
        """
        conflicts = []
        faculty_schedules = defaultdict(list)
        
        # Build faculty schedule map
        for exam in scheduled_exams:
            assignments = self.db.query(InvigilatorAssignment).filter(
                InvigilatorAssignment.scheduled_exam_id == exam.id,
                InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED
            ).all()
            
            for assignment in assignments:
                faculty_schedules[assignment.faculty_id].append({
                    "assignment": assignment,
                    "exam": exam
                })
        
        # Check for conflicts
        for faculty_id, assignments in faculty_schedules.items():
            # Sort by date and session
            sorted_assignments = sorted(
                assignments,
                key=lambda x: (x["exam"].exam_date, x["exam"].session.value)
            )
            
            # Check for same-slot conflicts
            for i in range(len(sorted_assignments)):
                for j in range(i + 1, len(sorted_assignments)):
                    exam1 = sorted_assignments[i]["exam"]
                    exam2 = sorted_assignments[j]["exam"]
                    
                    if (exam1.exam_date == exam2.exam_date and 
                        exam1.session == exam2.session):
                        
                        faculty = self.db.query(User).get(faculty_id)
                        conflicts.append({
                            "type": "SAME_SLOT_CONFLICT",
                            "severity": "CRITICAL",
                            "faculty_id": faculty_id,
                            "faculty_name": faculty.full_name if faculty else "Unknown",
                            "exam1": f"{exam1.course.course_code} ({exam1.exam_date})",
                            "exam2": f"{exam2.course.course_code} ({exam2.exam_date})",
                            "date": exam1.exam_date.isoformat(),
                            "session": exam1.session.value
                        })
            
            # Check for excessive daily load
            daily_loads = defaultdict(int)
            for assignment_data in sorted_assignments:
                exam = assignment_data["exam"]
                daily_loads[exam.exam_date] += 1
            
            for exam_date, load in daily_loads.items():
                if load > 2:  # More than 2 exams per day
                    faculty = self.db.query(User).get(faculty_id)
                    conflicts.append({
                        "type": "EXCESSIVE_DAILY_LOAD",
                        "severity": "WARNING",
                        "faculty_id": faculty_id,
                        "faculty_name": faculty.full_name if faculty else "Unknown",
                        "date": exam_date.isoformat(),
                        "exam_count": load,
                        "message": f"Faculty assigned to {load} exams on same day"
                    })
        
        # Categorize conflicts
        critical_conflicts = [c for c in conflicts if c["severity"] == "CRITICAL"]
        warning_conflicts = [c for c in conflicts if c["severity"] == "WARNING"]
        
        return {
            "total_conflicts": len(conflicts),
            "critical_conflicts": len(critical_conflicts),
            "warning_conflicts": len(warning_conflicts),
            "conflicts_by_faculty": len(set(c["faculty_id"] for c in conflicts)),
            "conflict_details": conflicts,
            "resolution_required": len(critical_conflicts) > 0,
            "recommendations": self._generate_conflict_recommendations(critical_conflicts, warning_conflicts)
        }
    
    def _generate_conflict_recommendations(self, critical: List, warnings: List) -> List[str]:
        """Generate conflict resolution recommendations."""
        recommendations = []
        
        if critical:
            recommendations.append(f"URGENT: Resolve {len(critical)} critical scheduling conflicts immediately")
            
        if warnings:
            recommendations.append(f"Review {len(warnings)} faculty members with heavy daily loads")
        
        if not critical and not warnings:
            recommendations.append("No scheduling conflicts detected")
        
        return recommendations
    
    # ================== NOTIFICATION & COMMUNICATION FUNCTIONS ==================
    
    def generate_duty_notifications(self, scheduled_exams: List[ScheduledExam], notification_type: str = "assignment") -> Dict[str, Any]:
        """
        Generate duty notifications for assigned faculty.
        
        Args:
            scheduled_exams: List of exams to generate notifications for
            notification_type: Type of notification ("assignment", "reminder", "change")
            
        Returns:
            Notification generation results
        """
        notifications = []
        faculty_notifications = defaultdict(list)
        
        for exam in scheduled_exams:
            assignments = self.db.query(InvigilatorAssignment).filter(
                InvigilatorAssignment.scheduled_exam_id == exam.id,
                InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED
            ).all()
            
            for assignment in assignments:
                # Generate notification content
                if notification_type == "assignment":
                    subject = f"Exam Duty Assignment - {exam.course.course_code}"
                    message = self._create_assignment_notification(assignment, exam)
                elif notification_type == "reminder":
                    subject = f"Exam Duty Reminder - {exam.course.course_code}"
                    message = self._create_reminder_notification(assignment, exam)
                elif notification_type == "change":
                    subject = f"Exam Duty Change - {exam.course.course_code}"
                    message = self._create_change_notification(assignment, exam)
                else:
                    subject = f"Exam Duty Notification - {exam.course.course_code}"
                    message = f"You have been assigned duty for {exam.course.course_code}"
                
                notification = {
                    "faculty_id": assignment.faculty_id,
                    "faculty_name": assignment.faculty.full_name,
                    "faculty_email": assignment.faculty.email,
                    "subject": subject,
                    "message": message,
                    "exam_details": {
                        "course_code": exam.course.course_code,
                        "exam_date": exam.exam_date.isoformat(),
                        "session": exam.session.value,
                        "start_time": exam.start_time.strftime("%H:%M"),
                        "room": exam.room.room_code if exam.room else "TBD",
                        "role": assignment.role.value
                    },
                    "priority": "HIGH" if assignment.role == InvigilatorRole.PRIMARY else "MEDIUM"
                }
                
                notifications.append(notification)
                faculty_notifications[assignment.faculty_id].append(notification)
        
        # Generate summary statistics
        return {
            "total_notifications": len(notifications),
            "faculty_count": len(faculty_notifications),
            "notifications_by_role": {
                "PRIMARY": len([n for n in notifications if n["exam_details"]["role"] == "PRIMARY"]),
                "RELIEF": len([n for n in notifications if n["exam_details"]["role"] == "RELIEF"]),
                "RESERVE": len([n for n in notifications if n["exam_details"]["role"] == "RESERVE"])
            },
            "notifications": notifications,
            "faculty_summaries": {
                faculty_id: {
                    "faculty_name": notifications_list[0]["faculty_name"],
                    "total_duties": len(notifications_list),
                    "notifications": notifications_list
                }
                for faculty_id, notifications_list in faculty_notifications.items()
            }
        }
    
    def _create_assignment_notification(self, assignment: InvigilatorAssignment, exam: ScheduledExam) -> str:
        """Create assignment notification message."""
        return f"""
Dear {assignment.faculty.full_name},

You have been assigned as {assignment.role.value} invigilator for the following exam:

Course: {exam.course.course_code} - {exam.course.course_name}
Date: {exam.exam_date.strftime('%A, %B %d, %Y')}
Session: {exam.session.value}
Time: {exam.start_time.strftime('%H:%M')} - {exam.end_time.strftime('%H:%M')}
Room: {exam.room.room_code if exam.room else 'To be assigned'}
Students: {exam.num_students}

Please ensure you are available 15 minutes before the exam starts.

For any queries or conflicts, please contact the Exam Section immediately.

Thank you for your cooperation.

Exam Section
        """.strip()
    
    def _create_reminder_notification(self, assignment: InvigilatorAssignment, exam: ScheduledExam) -> str:
        """Create reminder notification message."""
        return f"""
Dear {assignment.faculty.full_name},

This is a reminder for your upcoming exam duty:

Course: {exam.course.course_code} - {exam.course.course_name}
Date: {exam.exam_date.strftime('%A, %B %d, %Y')}
Session: {exam.session.value}
Time: {exam.start_time.strftime('%H:%M')} - {exam.end_time.strftime('%H:%M')}
Room: {exam.room.room_code if exam.room else 'To be assigned'}
Role: {assignment.role.value}

Please report to the exam room 15 minutes early.

Exam Section
        """.strip()
    
    def _create_change_notification(self, assignment: InvigilatorAssignment, exam: ScheduledExam) -> str:
        """Create change notification message."""
        return f"""
Dear {assignment.faculty.full_name},

There has been a change in your exam duty assignment:

Course: {exam.course.course_code} - {exam.course.course_name}
Date: {exam.exam_date.strftime('%A, %B %d, %Y')}
Session: {exam.session.value}
Time: {exam.start_time.strftime('%H:%M')} - {exam.end_time.strftime('%H:%M')}
Room: {exam.room.room_code if exam.room else 'To be assigned'}
New Role: {assignment.role.value}

Please note this change and confirm your availability.

Exam Section
        """.strip()
    
    # ================== FACULTY MANAGEMENT FUNCTIONS ==================
    
    def get_faculty_availability_analysis(self, faculty_ids: List[int] = None, date_range: tuple = None) -> Dict[str, Any]:
        """
        Analyze faculty availability patterns and constraints.
        
        Args:
            faculty_ids: Optional list of faculty IDs to analyze (None = all)
            date_range: Optional (start_date, end_date) tuple
            
        Returns:
            Faculty availability analysis
        """
        # Get faculty query
        faculty_query = self.db.query(User).filter(User.role == UserRole.FACULTY)
        if faculty_ids:
            faculty_query = faculty_query.filter(User.id.in_(faculty_ids))
        
        faculty_list = faculty_query.all()
        
        # Get assignments in date range
        assignment_query = self.db.query(InvigilatorAssignment).join(ScheduledExam)
        if date_range:
            start_date, end_date = date_range
            assignment_query = assignment_query.filter(
                ScheduledExam.exam_date >= start_date,
                ScheduledExam.exam_date <= end_date
            )
        
        assignments = assignment_query.filter(
            InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED
        ).all()
        
        # Analyze each faculty member
        faculty_analysis = {}
        
        for faculty in faculty_list:
            faculty_assignments = [a for a in assignments if a.faculty_id == faculty.id]
            
            # Calculate availability metrics
            assigned_dates = set(a.scheduled_exam.exam_date for a in faculty_assignments)
            assigned_sessions = len(faculty_assignments)
            
            # Check eligibility issues using eligibility checker
            sample_exam = assignments[0].scheduled_exam if assignments else None
            if sample_exam:
                eligibility_results = self.eligibility_checker.get_eligible_faculty(sample_exam)
                faculty_issues = []
                for f, issues in eligibility_results:
                    if f.id == faculty.id:
                        faculty_issues = issues
                        break
            else:
                faculty_issues = []
            
            # Calculate availability score
            availability_score = self._calculate_availability_score(
                faculty, faculty_assignments, faculty_issues
            )
            
            faculty_analysis[faculty.id] = {
                "faculty_name": faculty.full_name,
                "department": faculty.department,
                "total_assignments": len(faculty_assignments),
                "unique_dates": len(assigned_dates),
                "availability_score": availability_score,
                "eligibility_issues": [
                    {
                        "type": issue.issue_type,
                        "message": issue.message,
                        "severity": issue.severity
                    }
                    for issue in faculty_issues
                ],
                "assignment_pattern": self._analyze_assignment_pattern(faculty_assignments),
                "recommendation": self._generate_faculty_recommendation(
                    faculty, len(faculty_assignments), availability_score, faculty_issues
                )
            }
        
        # Overall statistics
        total_faculty = len(faculty_list)
        assigned_faculty = len([f for f in faculty_analysis.values() if f["total_assignments"] > 0])
        avg_assignments = sum(f["total_assignments"] for f in faculty_analysis.values()) / total_faculty if total_faculty > 0 else 0
        
        return {
            "total_faculty": total_faculty,
            "assigned_faculty": assigned_faculty,
            "unassigned_faculty": total_faculty - assigned_faculty,
            "average_assignments_per_faculty": round(avg_assignments, 2),
            "faculty_details": faculty_analysis,
            "utilization_summary": {
                "high_utilization": len([f for f in faculty_analysis.values() if f["availability_score"] > 80]),
                "medium_utilization": len([f for f in faculty_analysis.values() if 40 <= f["availability_score"] <= 80]),
                "low_utilization": len([f for f in faculty_analysis.values() if f["availability_score"] < 40])
            }
        }
    
    def _calculate_availability_score(self, faculty: User, assignments: List, issues: List) -> float:
        """Calculate availability score for a faculty member."""
        base_score = 100
        
        # Deduct for assignments (more assignments = lower availability)
        assignment_penalty = min(len(assignments) * 10, 50)  # Max 50 points deduction
        base_score -= assignment_penalty
        
        # Deduct for eligibility issues
        for issue in issues:
            if issue.severity == "ERROR":
                base_score -= 30
            elif issue.severity == "WARNING":
                base_score -= 10
        
        return max(0, base_score)
    
    def _analyze_assignment_pattern(self, assignments: List[InvigilatorAssignment]) -> Dict[str, Any]:
        """Analyze assignment pattern for a faculty member."""
        if not assignments:
            return {"pattern": "NO_ASSIGNMENTS"}
        
        # Group by role
        role_counts = defaultdict(int)
        for assignment in assignments:
            role_counts[assignment.role.value] += 1
        
        # Group by date
        date_counts = defaultdict(int)
        for assignment in assignments:
            date_counts[assignment.scheduled_exam.exam_date] += 1
        
        max_daily_load = max(date_counts.values()) if date_counts else 0
        
        return {
            "pattern": "REGULAR" if len(assignments) > 0 else "NONE",
            "role_distribution": dict(role_counts),
            "max_daily_assignments": max_daily_load,
            "total_exam_days": len(date_counts),
            "primary_role_percentage": round((role_counts.get("PRIMARY", 0) / len(assignments)) * 100, 1) if assignments else 0
        }
    
    def _generate_faculty_recommendation(self, faculty: User, assignment_count: int, availability_score: float, issues: List) -> str:
        """Generate recommendation for a faculty member."""
        if issues and any(issue.severity == "ERROR" for issue in issues):
            return "Address eligibility issues before further assignments"
        
        if assignment_count == 0:
            return "Available for assignments - good candidate"
        elif assignment_count > 5:
            return "High workload - consider reducing assignments"
        elif availability_score > 80:
            return "Excellent availability - can handle more assignments"
        elif availability_score > 60:
            return "Good availability - moderate assignments recommended"
        else:
            return "Limited availability - use sparingly"


class Engine3InvigilatorEngine(BaseEngine):
    """
    Plugin-compatible wrapper for invigilator management engine.
    
    This class implements the BaseEngine interface to make Engine 3 
    compatible with the plugin architecture.
    """
    
    def __init__(self):
        """Initialize the engine wrapper."""
        self._current_executions: Dict[str, Dict] = {}
    
    def get_metadata(self) -> EngineMetadata:
        """Return engine metadata."""
        return EngineMetadata(
            name="engine3-invigilator",
            display_name="Intelligent Invigilator Manager (Engine 3)",
            version="1.0.0",
            description="Comprehensive invigilator management engine with eligibility checking, workload balancing, and notification services",
            capabilities=[
                "invigilator_assignment",
                "eligibility_checking", 
                "workload_balancing",
                "duty_scheduling",
                "notification_management",
                "faculty_management"
            ],
            dependencies=["engine1-scheduling", "engine2-room-seating"],  # Needs exams and rooms
            execution_order=2,  # Runs after scheduling and room allocation
            requires_approval=False
        )
    
    def validate_input(self, input_data: Dict[str, Any]) -> List[EngineValidationError]:
        """Validate input parameters."""
        errors = []
        
        # Required fields
        required_fields = ["scheduled_exam_ids", "exam_type", "operation"]
        for field in required_fields:
            if field not in input_data:
                errors.append(EngineValidationError(
                    field=field,
                    message=f"Required field '{field}' is missing"
                ))
        
        # Validate operation
        if "operation" in input_data:
            valid_ops = ["assign_invigilators", "check_eligibility", "balance_workload", "send_notifications", "bulk_assign"]
            if input_data["operation"] not in valid_ops:
                errors.append(EngineValidationError(
                    field="operation",
                    message=f"Invalid operation. Valid options: {valid_ops}"
                ))
        
        # Validate exam type
        if "exam_type" in input_data:
            valid_types = ["MID_TERM", "END_TERM", "INTERNAL", "EXTERNAL", "MAKEUP"]
            if input_data["exam_type"] not in valid_types:
                errors.append(EngineValidationError(
                    field="exam_type",
                    message=f"Invalid exam type. Valid options: {valid_types}"
                ))
        
        # Validate exam IDs
        if "scheduled_exam_ids" in input_data:
            if not isinstance(input_data["scheduled_exam_ids"], list):
                errors.append(EngineValidationError(
                    field="scheduled_exam_ids",
                    message="scheduled_exam_ids must be a list of integers"
                ))
            elif not input_data["scheduled_exam_ids"]:
                errors.append(EngineValidationError(
                    field="scheduled_exam_ids",
                    message="At least one scheduled exam ID is required"
                ))
        
        # Validate optional parameters
        if "include_relief" in input_data and not isinstance(input_data["include_relief"], bool):
            errors.append(EngineValidationError(
                field="include_relief",
                message="include_relief must be a boolean"
            ))
        
        if "include_reserve" in input_data and not isinstance(input_data["include_reserve"], bool):
            errors.append(EngineValidationError(
                field="include_reserve",
                message="include_reserve must be a boolean"
            ))
        
        if "department_filter" in input_data:
            dept = input_data["department_filter"]
            if dept is not None and not isinstance(dept, str):
                errors.append(EngineValidationError(
                    field="department_filter",
                    message="department_filter must be null or a string"
                ))
        
        return errors
    
    def execute(self, input_data: Dict[str, Any], db: Session) -> EngineExecutionResult:
        """Execute the invigilator management engine."""
        execution_id = str(uuid.uuid4())
        started_at = datetime.utcnow()
        
        # Track execution
        self._current_executions[execution_id] = {
            "status": EngineStatus.RUNNING,
            "started_at": started_at
        }
        
        try:
            # Parse input
            scheduled_exam_ids = input_data["scheduled_exam_ids"]
            exam_type = ExamType(input_data["exam_type"])
            operation = input_data["operation"]
            include_relief = input_data.get("include_relief", True)
            include_reserve = input_data.get("include_reserve", True)
            department_filter = input_data.get("department_filter")
            user_id = input_data.get("user_id")
            
            # Fetch scheduled exams
            scheduled_exams = db.query(ScheduledExam).filter(
                ScheduledExam.id.in_(scheduled_exam_ids)
            ).all()
            
            if len(scheduled_exams) != len(scheduled_exam_ids):
                found_ids = {exam.id for exam in scheduled_exams}
                missing_ids = set(scheduled_exam_ids) - found_ids
                raise ValueError(f"Scheduled exams not found: {missing_ids}")
            
            start_time = time_module.perf_counter()
            result_data = {}
            warnings = []
            
            # Initialize managers
            manager = InvigilatorManager(db)
            eligibility_checker = EligibilityChecker(db)
            workload_balancer = WorkloadBalancer(db)
            
            # Execute based on operation
            if operation == "check_eligibility":
                eligibility_results = {}
                
                for exam in scheduled_exams:
                    eligible_results = eligibility_checker.get_eligible_faculty(
                        exam, department=department_filter
                    )
                    
                    eligibility_summary = {
                        "total_faculty": len(eligible_results),
                        "fully_eligible": len([
                            f for f, issues in eligible_results
                            if not any(i.severity == "ERROR" for i in issues)
                        ]),
                        "with_warnings": len([
                            f for f, issues in eligible_results
                            if any(i.severity == "WARNING" for i in issues) and
                            not any(i.severity == "ERROR" for i in issues)
                        ]),
                        "ineligible": len([
                            f for f, issues in eligible_results
                            if any(i.severity == "ERROR" for i in issues)
                        ]),
                        "faculty_details": [
                            {
                                "faculty_id": faculty.id,
                                "faculty_name": faculty.full_name,
                                "eligible": not any(i.severity == "ERROR" for i in issues),
                                "issues": [
                                    {
                                        "type": i.issue_type,
                                        "message": i.message,
                                        "severity": i.severity
                                    }
                                    for i in issues
                                ]
                            }
                            for faculty, issues in eligible_results
                        ]
                    }
                    eligibility_results[exam.id] = eligibility_summary
                
                result_data["eligibility_check"] = eligibility_results
            
            elif operation == "balance_workload":
                workload_data = workload_balancer.get_workload_distribution()
                
                result_data["workload_analysis"] = {
                    "faculty_workloads": {
                        faculty.id: {
                            "faculty_name": faculty.full_name,
                            "total_points": workload,
                            "assignments_count": len([
                                a for a in faculty.invigilator_assignments
                                if a.status == InvigilatorStatus.ASSIGNED
                            ])
                        }
                        for faculty, workload in workload_data.items()
                    },
                    "statistics": {
                        "total_faculty": len(workload_data),
                        "average_workload": sum(workload_data.values()) / len(workload_data) if workload_data else 0,
                        "max_workload": max(workload_data.values()) if workload_data else 0,
                        "min_workload": min(workload_data.values()) if workload_data else 0
                    }
                }
            
            elif operation in ["assign_invigilators", "bulk_assign"]:
                assignment_results = {}
                total_assignments = 0
                successful_exams = 0
                failed_exams = 0
                
                if operation == "bulk_assign":
                    # Use bulk assignment for better workload balancing
                    results = manager.assign_invigilators_bulk(
                        scheduled_exams=scheduled_exams,
                        exam_type=exam_type,
                        user_id=user_id
                    )
                    
                    for exam_id, result in results.items():
                        if result.success:
                            # Save assignments to database
                            for assignment in result.assignments:
                                db.add(assignment)
                            successful_exams += 1
                            total_assignments += len(result.assignments)
                        else:
                            failed_exams += 1
                        
                        assignment_results[exam_id] = {
                            "success": result.success,
                            "message": result.message,
                            "statistics": result.statistics,
                            "assignments": [
                                {
                                    "faculty_id": a.faculty_id,
                                    "faculty_name": a.faculty.full_name,
                                    "role": a.role.value,
                                    "workload_points": a.workload_points
                                }
                                for a in result.assignments
                            ],
                            "warnings": result.warnings
                        }
                        
                        if result.warnings:
                            warnings.extend(result.warnings)
                
                else:
                    # Individual assignment
                    for exam in scheduled_exams:
                        result = manager.assign_invigilators(
                            scheduled_exam=exam,
                            exam_type=exam_type,
                            user_id=user_id,
                            include_relief=include_relief,
                            include_reserve=include_reserve
                        )
                        
                        if result.success:
                            # Save assignments to database
                            for assignment in result.assignments:
                                db.add(assignment)
                            successful_exams += 1
                            total_assignments += len(result.assignments)
                        else:
                            failed_exams += 1
                        
                        assignment_results[exam.id] = {
                            "success": result.success,
                            "message": result.message,
                            "statistics": result.statistics,
                            "assignments": [
                                {
                                    "faculty_id": a.faculty_id,
                                    "faculty_name": a.faculty.full_name,
                                    "role": a.role.value,
                                    "workload_points": a.workload_points
                                }
                                for a in result.assignments
                            ],
                            "warnings": result.warnings
                        }
                        
                        if result.warnings:
                            warnings.extend(result.warnings)
                
                # Commit all assignments
                db.commit()
                
                result_data["invigilator_assignments"] = {
                    "results": assignment_results,
                    "summary": {
                        "total_exams": len(scheduled_exams),
                        "successful": successful_exams,
                        "failed": failed_exams,
                        "total_assignments": total_assignments
                    }
                }
            
            elif operation == "send_notifications":
                from app.services.engine3.notification_service import NotificationService
                
                notification_service = NotificationService(db)
                notification_results = {}
                
                for exam in scheduled_exams:
                    # Get assignments for this exam
                    assignments = db.query(InvigilatorAssignment).filter(
                        InvigilatorAssignment.scheduled_exam_id == exam.id,
                        InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED
                    ).all()
                    
                    notifications_sent = []
                    for assignment in assignments:
                        # Create notification (in real system, this would send email/SMS)
                        notification = f"You have been assigned as {assignment.role.value} invigilator for {exam.course.course_code} on {exam.exam_date} at {exam.session.value}"
                        notifications_sent.append({
                            "faculty_id": assignment.faculty_id,
                            "faculty_name": assignment.faculty.full_name,
                            "role": assignment.role.value,
                            "notification": notification
                        })
                    
                    notification_results[exam.id] = {
                        "exam_details": f"{exam.course.course_code} - {exam.exam_date}",
                        "notifications_sent": len(notifications_sent),
                        "details": notifications_sent
                    }
                
                result_data["notifications"] = {
                    "results": notification_results,
                    "total_notifications": sum(
                        r["notifications_sent"] for r in notification_results.values()
                    )
                }
            
            end_time = time_module.perf_counter()
            execution_time_ms = int((end_time - start_time) * 1000)
            completed_at = datetime.utcnow()
            
            # Determine overall success
            overall_success = True
            if "invigilator_assignments" in result_data:
                overall_success = result_data["invigilator_assignments"]["summary"]["failed"] == 0
            
            # Update execution status
            self._current_executions[execution_id].update({
                "status": EngineStatus.COMPLETED if overall_success else EngineStatus.FAILED,
                "completed_at": completed_at,
                "result": result_data
            })
            
            return EngineExecutionResult(
                success=overall_success,
                status=EngineStatus.COMPLETED if overall_success else EngineStatus.FAILED,
                execution_id=execution_id,
                started_at=started_at,
                completed_at=completed_at,
                execution_time_ms=execution_time_ms,
                result_data=result_data,
                error_message=None if overall_success else "Some operations failed - see result_data for details",
                warnings=warnings
            )
            
        except Exception as e:
            completed_at = datetime.utcnow()
            
            # Update execution status
            self._current_executions[execution_id].update({
                "status": EngineStatus.FAILED,
                "completed_at": completed_at,
                "error": str(e)
            })
            
            return EngineExecutionResult(
                success=False,
                status=EngineStatus.FAILED,
                execution_id=execution_id,
                started_at=started_at,
                completed_at=completed_at,
                execution_time_ms=int((completed_at - started_at).total_seconds() * 1000),
                result_data=None,
                error_message=str(e),
                warnings=[]
            )
    
    def get_status(self, execution_id: str) -> EngineStatus:
        """Get execution status."""
        if execution_id in self._current_executions:
            return self._current_executions[execution_id]["status"]
        return EngineStatus.IDLE
    
    def health_check(self) -> Dict[str, Any]:
        """Check engine health."""
        checks = {}
        
        # Check database connectivity would be done in the API layer
        checks["database"] = "ok"
        
        # Check if required models can be imported
        try:
            from app.services.engine3.eligibility_checker import EligibilityChecker
            from app.services.engine3.workload_balancer import WorkloadBalancer  
            from app.services.engine3.notification_service import NotificationService
            from app.models.invigilator import InvigilatorAssignment
            checks["dependencies"] = "ok"
        except Exception as e:
            checks["dependencies"] = f"error: {str(e)}"
        
        # Determine overall status
        status = "healthy" if all(check == "ok" for check in checks.values()) else "unhealthy"
        
        return {
            "status": status,
            "checks": checks,
            "message": f"Engine 3 status: {status}"
        }
    
    def get_input_schema(self) -> Dict[str, Any]:
        """Return JSON schema for input validation."""
        return {
            "type": "object",
            "properties": {
                "scheduled_exam_ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "List of scheduled exam IDs to manage invigilators for",
                    "minItems": 1
                },
                "exam_type": {
                    "type": "string",
                    "enum": ["MID_TERM", "END_TERM", "INTERNAL", "EXTERNAL", "MAKEUP"],
                    "description": "Type of exam (for rule resolution)"
                },
                "operation": {
                    "type": "string",
                    "enum": ["assign_invigilators", "check_eligibility", "balance_workload", "send_notifications", "bulk_assign"],
                    "description": "Operation to perform"
                },
                "include_relief": {
                    "type": "boolean",
                    "description": "Whether to assign relief invigilators",
                    "default": True
                },
                "include_reserve": {
                    "type": "boolean",
                    "description": "Whether to assign reserve invigilators", 
                    "default": True
                },
                "department_filter": {
                    "type": ["string", "null"],
                    "description": "Optional department filter for faculty selection"
                },
                "user_id": {
                    "type": "integer",
                    "description": "ID of user performing the operation (optional)"
                }
            },
            "required": ["scheduled_exam_ids", "exam_type", "operation"]
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        """Return JSON schema for output format."""
        return {
            "type": "object",
            "properties": {
                "invigilator_assignments": {
                    "type": "object",
                    "description": "Invigilator assignment results (if requested)",
                    "properties": {
                        "results": {
                            "type": "object",
                            "description": "Per-exam assignment results"
                        },
                        "summary": {
                            "type": "object",
                            "properties": {
                                "total_exams": {"type": "integer"},
                                "successful": {"type": "integer"},
                                "failed": {"type": "integer"},
                                "total_assignments": {"type": "integer"}
                            }
                        }
                    }
                },
                "eligibility_check": {
                    "type": "object",
                    "description": "Faculty eligibility analysis (if requested)"
                },
                "workload_analysis": {
                    "type": "object",
                    "description": "Faculty workload distribution (if requested)"
                },
                "notifications": {
                    "type": "object",
                    "description": "Notification results (if requested)"
                }
            }
        }
