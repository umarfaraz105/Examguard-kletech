"""
Independent plan validator.

Validates exam plans against all rules WITHOUT importing from other engines.
This ensures audit independence - Engine 4 checks what others produce.
"""
from typing import List, Dict, Tuple
from collections import defaultdict
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.plan import Plan
from app.models.schedule import ScheduledExam
from app.models.seating import SeatAssignment
from app.models.invigilator import InvigilatorAssignment
from app.models.student import Student
from app.models.rule import ExamType
from app.services.rules import RuleProvider


class ValidationIssue:
    """Represents a validation issue."""
    
    def __init__(
        self,
        rule_name: str,
        severity: str,
        message: str,
        entity_type: str = None,
        entity_id: int = None,
        expected: any = None,
        actual: any = None
    ):
        """
        Initialize validation issue.
        
        Args:
            rule_name: Name of rule violated
            severity: CRITICAL, ERROR, WARNING, INFO
            message: Description of issue
            entity_type: Type of entity (EXAM, SEAT, INVIGILATOR, etc.)
            entity_id: ID of affected entity
            expected: Expected value per rule
            actual: Actual value found
        """
        self.rule_name = rule_name
        self.severity = severity
        self.message = message
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.expected = expected
        self.actual = actual
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<ValidationIssue({self.severity}: {self.rule_name} - {self.message})>"
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "rule_name": self.rule_name,
            "severity": self.severity,
            "message": self.message,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "expected": self.expected,
            "actual": self.actual
        }


class PlanValidator:
    """
    Independent validator for exam plans.
    
    Validates:
    1. Scheduling rules (no clashes, proper gaps)
    2. Seating rules (capacity, branch separation)
    3. Invigilation rules (ratios, minimum staff)
    4. Completeness (all students seated, all exams staffed)
    
    IMPORTANT: Does NOT import from Engines 1-3 to maintain independence.
    """
    
    def __init__(self, db: Session):
        """
        Initialize plan validator.
        
        Args:
            db: Database session
        """
        self.db = db
        self.rule_provider = RuleProvider(db)
        self.issues: List[ValidationIssue] = []
    
    def validate_plan(self, plan: Plan) -> Tuple[bool, List[ValidationIssue]]:
        """
        Validate entire exam plan.
        
        Args:
            plan: Plan to validate
            
        Returns:
            Tuple of (is_valid, list of issues)
        """
        self.issues.clear()
        
        # Get all scheduled exams for this plan
        scheduled_exams = self.db.query(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id
        ).all()
        
        if not scheduled_exams:
            self.issues.append(ValidationIssue(
                rule_name="PLAN_COMPLETENESS",
                severity="ERROR",
                message="Plan has no scheduled exams"
            ))
            return False, self.issues
        
        # Validate scheduling
        self._validate_scheduling(scheduled_exams, plan.exam_type)
        
        # Validate seating
        self._validate_seating(scheduled_exams, plan.exam_type)
        
        # Validate invigilation
        self._validate_invigilation(scheduled_exams, plan.exam_type)
        
        # Validate completeness
        self._validate_completeness(scheduled_exams)
        
        # Determine if valid (no CRITICAL or ERROR issues)
        critical_or_error = [
            i for i in self.issues
            if i.severity in ["CRITICAL", "ERROR"]
        ]
        
        is_valid = len(critical_or_error) == 0
        
        return is_valid, self.issues
    
    def _validate_scheduling(
        self,
        scheduled_exams: List[ScheduledExam],
        exam_type: ExamType
    ) -> None:
        """Validate scheduling rules independently."""
        # Get rules
        min_gap_days = self.rule_provider.get_int(
            exam_type,
            "min_gap_days",
            default=1
        )
        duration_minutes = self.rule_provider.get_int(
            exam_type,
            "duration_minutes"
        )
        
        # Build student schedule map (independent calculation)
        student_schedules = defaultdict(list)
        
        for exam in scheduled_exams:
            for student in exam.course.students:
                student_schedules[student.id].append(exam)
        
        # Check each student's schedule
        for student_id, exams in student_schedules.items():
            # Sort by date and session
            sorted_exams = sorted(exams, key=lambda e: (e.exam_date, e.session.value))
            
            for i in range(len(sorted_exams)):
                for j in range(i + 1, len(sorted_exams)):
                    exam1 = sorted_exams[i]
                    exam2 = sorted_exams[j]
                    
                    # Check same slot clash
                    if (exam1.exam_date == exam2.exam_date and
                        exam1.session == exam2.session):
                        
                        student = self.db.query(Student).filter(
                            Student.id == student_id
                        ).first()
                        
                        self.issues.append(ValidationIssue(
                            rule_name="NO_SAME_SLOT_CLASH",
                            severity="CRITICAL",
                            message=f"Student {student.usn} has exams at same time: "
                                    f"{exam1.course.course_code} and {exam2.course.course_code}",
                            entity_type="STUDENT",
                            entity_id=student_id
                        ))
                    
                    # Check gap requirement
                    days_diff = (exam2.exam_date - exam1.exam_date).days
                    if 0 < days_diff < min_gap_days:
                        student = self.db.query(Student).filter(
                            Student.id == student_id
                        ).first()
                        
                        self.issues.append(ValidationIssue(
                            rule_name="MIN_GAP_DAYS",
                            severity="ERROR",
                            message=f"Student {student.usn} has exams with only "
                                    f"{days_diff} day(s) gap (min: {min_gap_days})",
                            entity_type="STUDENT",
                            entity_id=student_id,
                            expected=min_gap_days,
                            actual=days_diff
                        ))
        
        # Validate duration matches
        for exam in scheduled_exams:
            if exam.duration_minutes != duration_minutes:
                self.issues.append(ValidationIssue(
                    rule_name="EXAM_DURATION",
                    severity="WARNING",
                    message=f"Exam {exam.course.course_code} duration mismatch",
                    entity_type="EXAM",
                    entity_id=exam.id,
                    expected=duration_minutes,
                    actual=exam.duration_minutes
                ))
    
    def _validate_seating(
        self,
        scheduled_exams: List[ScheduledExam],
        exam_type: ExamType
    ) -> None:
        """Validate seating rules independently."""
        # Get rules
        students_per_bench = self.rule_provider.get_int(
            exam_type,
            "students_per_bench"
        )
        max_per_room = self.rule_provider.get_int(
            exam_type,
            "max_students_per_room",
            default=60
        )
        
        for exam in scheduled_exams:
            # Check room assigned
            if not exam.room_id:
                self.issues.append(ValidationIssue(
                    rule_name="ROOM_ASSIGNED",
                    severity="CRITICAL",
                    message=f"Exam {exam.course.course_code} has no room assigned",
                    entity_type="EXAM",
                    entity_id=exam.id
                ))
                continue
            
            # Check seat assignments exist
            seat_assignments = self.db.query(SeatAssignment).filter(
                SeatAssignment.scheduled_exam_id == exam.id
            ).all()
            
            if not seat_assignments:
                self.issues.append(ValidationIssue(
                    rule_name="SEATING_COMPLETE",
                    severity="CRITICAL",
                    message=f"Exam {exam.course.course_code} has no seat assignments",
                    entity_type="EXAM",
                    entity_id=exam.id
                ))
                continue
            
            # Check all students have seats
            enrolled_students = set(s.id for s in exam.course.students)
            seated_students = set(sa.student_id for sa in seat_assignments)
            
            missing_students = enrolled_students - seated_students
            if missing_students:
                self.issues.append(ValidationIssue(
                    rule_name="ALL_STUDENTS_SEATED",
                    severity="CRITICAL",
                    message=f"Exam {exam.course.course_code}: {len(missing_students)} students not seated",
                    entity_type="EXAM",
                    entity_id=exam.id,
                    expected=len(enrolled_students),
                    actual=len(seated_students)
                ))
            
            # Check room capacity
            if len(seat_assignments) > max_per_room:
                self.issues.append(ValidationIssue(
                    rule_name="MAX_STUDENTS_PER_ROOM",
                    severity="ERROR",
                    message=f"Exam {exam.course.course_code} exceeds room capacity",
                    entity_type="EXAM",
                    entity_id=exam.id,
                    expected=max_per_room,
                    actual=len(seat_assignments)
                ))
            
            # Check branch separation (independent calculation)
            self._check_branch_separation(seat_assignments, exam)
    
    def _check_branch_separation(
        self,
        seat_assignments: List[SeatAssignment],
        exam: ScheduledExam
    ) -> None:
        """Check branch separation independently."""
        # Build position map
        position_map = {}
        for assignment in seat_assignments:
            if assignment.row_number is not None and assignment.column_number is not None:
                pos = (assignment.row_number, assignment.column_number)
                position_map[pos] = assignment
        
        # Check each assignment
        for assignment in seat_assignments:
            if assignment.row_number is None or assignment.column_number is None:
                continue
            
            student_branch = assignment.student.branch
            row, col = assignment.row_number, assignment.column_number
            
            # Check all 8 neighbors
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    if dr == 0 and dc == 0:
                        continue
                    
                    neighbor_pos = (row + dr, col + dc)
                    if neighbor_pos in position_map:
                        neighbor = position_map[neighbor_pos]
                        if neighbor.student.branch == student_branch:
                            self.issues.append(ValidationIssue(
                                rule_name="BRANCH_SEPARATION",
                                severity="ERROR",
                                message=f"Same branch neighbors in exam {exam.course.course_code}: "
                                        f"{assignment.student.usn} ({student_branch}) adjacent to "
                                        f"{neighbor.student.usn}",
                                entity_type="SEAT",
                                entity_id=assignment.id
                            ))
    
    def _validate_invigilation(
        self,
        scheduled_exams: List[ScheduledExam],
        exam_type: ExamType
    ) -> None:
        """Validate invigilation rules independently."""
        # Get rules
        ratio = self.rule_provider.get_float(
            exam_type,
            "invigilator_ratio"
        )
        min_invigs = self.rule_provider.get_int(
            exam_type,
            "min_invigilators_per_room"
        )
        
        for exam in scheduled_exams:
            # Get invigilator assignments
            assignments = self.db.query(InvigilatorAssignment).filter(
                InvigilatorAssignment.scheduled_exam_id == exam.id
            ).all()
            
            # Count primary invigilators only
            from app.models.invigilator import InvigilatorRole
            primary_count = len([
                a for a in assignments
                if a.role == InvigilatorRole.PRIMARY
            ])
            
            # Check minimum
            if primary_count < min_invigs:
                self.issues.append(ValidationIssue(
                    rule_name="MIN_INVIGILATORS",
                    severity="CRITICAL",
                    message=f"Exam {exam.course.course_code} has insufficient invigilators",
                    entity_type="EXAM",
                    entity_id=exam.id,
                    expected=min_invigs,
                    actual=primary_count
                ))
            
            # Check ratio
            required_by_ratio = max(int(exam.num_students * ratio), min_invigs)
            if primary_count < required_by_ratio:
                self.issues.append(ValidationIssue(
                    rule_name="INVIGILATOR_RATIO",
                    severity="WARNING",
                    message=f"Exam {exam.course.course_code} may need more invigilators for ratio",
                    entity_type="EXAM",
                    entity_id=exam.id,
                    expected=required_by_ratio,
                    actual=primary_count
                ))
    
    def _validate_completeness(
        self,
        scheduled_exams: List[ScheduledExam]
    ) -> None:
        """Validate plan completeness."""
        # Check all exams have dates
        for exam in scheduled_exams:
            if exam.exam_date is None:
                self.issues.append(ValidationIssue(
                    rule_name="EXAM_DATE_ASSIGNED",
                    severity="CRITICAL",
                    message=f"Exam {exam.course.course_code} has no date assigned",
                    entity_type="EXAM",
                    entity_id=exam.id
                ))
            
            if exam.session is None:
                self.issues.append(ValidationIssue(
                    rule_name="EXAM_SESSION_ASSIGNED",
                    severity="CRITICAL",
                    message=f"Exam {exam.course.course_code} has no session assigned",
                    entity_type="EXAM",
                    entity_id=exam.id
                ))
    
    def get_issues_by_severity(self, severity: str) -> List[ValidationIssue]:
        """Get issues of specific severity."""
        return [i for i in self.issues if i.severity == severity]
    
    def get_issues_by_rule(self, rule_name: str) -> List[ValidationIssue]:
        """Get issues for specific rule."""
        return [i for i in self.issues if i.rule_name == rule_name]
    
    def get_summary(self) -> Dict:
        """Get validation summary."""
        severity_counts = defaultdict(int)
        for issue in self.issues:
            severity_counts[issue.severity] += 1
        
        return {
            "total_issues": len(self.issues),
            "critical": severity_counts.get("CRITICAL", 0),
            "errors": severity_counts.get("ERROR", 0),
            "warnings": severity_counts.get("WARNING", 0),
            "info": severity_counts.get("INFO", 0),
            "is_valid": severity_counts.get("CRITICAL", 0) == 0 and severity_counts.get("ERROR", 0) == 0
        }
