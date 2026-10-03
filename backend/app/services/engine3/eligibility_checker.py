"""
Faculty eligibility checker for invigilator assignments.

Validates faculty availability, department policies, and constraints.
"""
from typing import List, Dict, Tuple
from datetime import date
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.schedule import ScheduledExam
from app.models.invigilator import FacultyAvailability, InvigilatorAssignment
from app.models.course import Course


class EligibilityIssue:
    """Represents an eligibility issue."""
    
    def __init__(self, issue_type: str, message: str, severity: str = "ERROR"):
        """
        Initialize eligibility issue.
        
        Args:
            issue_type: Type of issue (UNAVAILABLE, CONFLICT, OVERLOADED, etc.)
            message: Description of the issue
            severity: Severity level (ERROR, WARNING, INFO)
        """
        self.issue_type = issue_type
        self.message = message
        self.severity = severity
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<EligibilityIssue({self.severity}: {self.issue_type} - {self.message})>"


class EligibilityChecker:
    """
    Checks faculty eligibility for invigilator assignments.
    
    Checks:
    1. Faculty is active and has FACULTY role
    2. Faculty is available on the exam date/session
    3. No conflicting assignments
    4. Not already teaching a course at that time
    5. Workload limits not exceeded
    """
    
    def __init__(self, db: Session):
        """
        Initialize eligibility checker.
        
        Args:
            db: Database session
        """
        self.db = db
    
    def check_eligibility(
        self,
        faculty: User,
        scheduled_exam: ScheduledExam,
        max_assignments_per_day: int = 3
    ) -> Tuple[bool, List[EligibilityIssue]]:
        """
        Check if faculty is eligible for assignment.
        
        Args:
            faculty: Faculty member to check
            scheduled_exam: Exam to assign to
            max_assignments_per_day: Maximum assignments per day
            
        Returns:
            Tuple of (is_eligible, list of issues)
        """
        issues = []
        
        # Check 1: Faculty role and active status
        if not faculty.is_active:
            issues.append(EligibilityIssue(
                "INACTIVE",
                f"Faculty {faculty.full_name} is inactive",
                "ERROR"
            ))
        
        if faculty.role != UserRole.FACULTY:
            issues.append(EligibilityIssue(
                "NOT_FACULTY",
                f"{faculty.full_name} does not have FACULTY role",
                "ERROR"
            ))
        
        # Check 2: Availability
        if not self._is_available(faculty, scheduled_exam):
            issues.append(EligibilityIssue(
                "UNAVAILABLE",
                f"{faculty.full_name} is marked unavailable for {scheduled_exam.exam_date} {scheduled_exam.session.value}",
                "ERROR"
            ))
        
        # Check 3: No conflicting assignments
        conflicts = self._get_conflicting_assignments(faculty, scheduled_exam)
        if conflicts:
            conflict_details = ", ".join([
                f"{c.scheduled_exam.course.course_code}"
                for c in conflicts[:3]
            ])
            issues.append(EligibilityIssue(
                "CONFLICT",
                f"{faculty.full_name} already assigned to: {conflict_details}",
                "ERROR"
            ))
        
        # Check 4: Not teaching at that time
        if self._is_teaching_during_exam(faculty, scheduled_exam):
            issues.append(EligibilityIssue(
                "TEACHING",
                f"{faculty.full_name} is teaching {scheduled_exam.course.course_code} at this time",
                "WARNING"
            ))
        
        # Check 5: Daily workload
        daily_count = self._get_daily_assignment_count(
            faculty,
            scheduled_exam.exam_date
        )
        if daily_count >= max_assignments_per_day:
            issues.append(EligibilityIssue(
                "OVERLOADED",
                f"{faculty.full_name} already has {daily_count} assignments on {scheduled_exam.exam_date}",
                "WARNING"
            ))
        
        # Determine eligibility (only ERROR issues block assignment)
        error_issues = [i for i in issues if i.severity == "ERROR"]
        is_eligible = len(error_issues) == 0
        
        return is_eligible, issues
    
    def _is_available(
        self,
        faculty: User,
        scheduled_exam: ScheduledExam
    ) -> bool:
        """
        Check if faculty is available.
        
        Args:
            faculty: Faculty member
            scheduled_exam: Exam to check
            
        Returns:
            True if available, False otherwise
        """
        # Check if faculty marked unavailable for this date/session
        unavailability = self.db.query(FacultyAvailability).filter(
            FacultyAvailability.faculty_id == faculty.id,
            FacultyAvailability.exam_date == scheduled_exam.exam_date.isoformat(),
            FacultyAvailability.is_available == False
        ).first()
        
        if unavailability:
            # Check if session-specific or all-day
            if (unavailability.session is None or 
                unavailability.session == scheduled_exam.session.value):
                return False
        
        return True
    
    def _get_conflicting_assignments(
        self,
        faculty: User,
        scheduled_exam: ScheduledExam
    ) -> List[InvigilatorAssignment]:
        """
        Get conflicting invigilator assignments.
        
        Args:
            faculty: Faculty member
            scheduled_exam: Exam to check against
            
        Returns:
            List of conflicting assignments
        """
        # Find assignments at same date+session
        conflicts = self.db.query(InvigilatorAssignment).join(
            ScheduledExam
        ).filter(
            InvigilatorAssignment.faculty_id == faculty.id,
            ScheduledExam.exam_date == scheduled_exam.exam_date,
            ScheduledExam.session == scheduled_exam.session,
            ScheduledExam.id != scheduled_exam.id  # Exclude current exam
        ).all()
        
        return conflicts
    
    def _is_teaching_during_exam(
        self,
        faculty: User,
        scheduled_exam: ScheduledExam
    ) -> bool:
        """
        Check if faculty is teaching the course.
        
        Args:
            faculty: Faculty member
            scheduled_exam: Exam to check
            
        Returns:
            True if faculty teaches this course, False otherwise
        """
        return scheduled_exam.course.faculty_id == faculty.id
    
    def _get_daily_assignment_count(
        self,
        faculty: User,
        exam_date: date
    ) -> int:
        """
        Get number of assignments for faculty on a specific date.
        
        Args:
            faculty: Faculty member
            exam_date: Date to check
            
        Returns:
            Number of assignments
        """
        count = self.db.query(InvigilatorAssignment).join(
            ScheduledExam
        ).filter(
            InvigilatorAssignment.faculty_id == faculty.id,
            ScheduledExam.exam_date == exam_date
        ).count()
        
        return count
    
    def get_eligible_faculty(
        self,
        scheduled_exam: ScheduledExam,
        department: str = None
    ) -> List[Tuple[User, List[EligibilityIssue]]]:
        """
        Get all eligible faculty for an exam with their issues.
        
        Args:
            scheduled_exam: Exam to assign for
            department: Optional department filter
            
        Returns:
            List of (faculty, issues) tuples, sorted by eligibility
        """
        # Get all faculty
        query = self.db.query(User).filter(
            User.role == UserRole.FACULTY,
            User.is_active == True
        )
        
        if department:
            query = query.filter(User.department == department)
        
        all_faculty = query.all()
        
        # Check eligibility for each
        results = []
        for faculty in all_faculty:
            is_eligible, issues = self.check_eligibility(faculty, scheduled_exam)
            results.append((faculty, issues))
        
        # Sort: eligible first, then by number of issues
        results.sort(key=lambda x: (
            len([i for i in x[1] if i.severity == "ERROR"]),  # Errors first
            len(x[1])  # Then total issues
        ))
        
        return results
