"""
Clash detector for validating exam schedules.

Detects if any student has conflicting exam schedules.
"""
from typing import List, Dict, Set, Tuple
from datetime import date, timedelta
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.schedule import ScheduledExam
from app.models.student import Student
from app.models.course import Course


class Clash:
    """Represents a scheduling clash."""
    
    def __init__(
        self,
        student_id: int,
        student_usn: str,
        course1_id: int,
        course1_code: str,
        course2_id: int,
        course2_code: str,
        clash_type: str,
        details: str
    ):
        """
        Initialize clash.
        
        Args:
            student_id: Student ID
            student_usn: Student USN
            course1_id: First course ID
            course1_code: First course code
            course2_id: Second course ID
            course2_code: Second course code
            clash_type: Type of clash (SAME_SLOT, INSUFFICIENT_GAP)
            details: Additional details
        """
        self.student_id = student_id
        self.student_usn = student_usn
        self.course1_id = course1_id
        self.course1_code = course1_code
        self.course2_id = course2_id
        self.course2_code = course2_code
        self.clash_type = clash_type
        self.details = details
    
    def __repr__(self) -> str:
        """String representation."""
        return (
            f"<Clash(student={self.student_usn}, "
            f"courses={self.course1_code} vs {self.course2_code}, "
            f"type={self.clash_type})>"
        )
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "student_id": self.student_id,
            "student_usn": self.student_usn,
            "course1_id": self.course1_id,
            "course1_code": self.course1_code,
            "course2_id": self.course2_id,
            "course2_code": self.course2_code,
            "clash_type": self.clash_type,
            "details": self.details
        }


class ClashDetector:
    """
    Detects scheduling clashes for students.
    
    Two types of clashes:
    1. SAME_SLOT: Student has two exams at same date+session
    2. INSUFFICIENT_GAP: Student has two exams with gap less than minimum required
    """
    
    def __init__(self, db: Session, min_gap_days: int = 1):
        """
        Initialize clash detector.
        
        Args:
            db: Database session
            min_gap_days: Minimum gap days required between exams
        """
        self.db = db
        self.min_gap_days = min_gap_days
        self.clashes: List[Clash] = []
    
    def detect_clashes_in_schedule(
        self,
        scheduled_exams: List[ScheduledExam]
    ) -> List[Clash]:
        """
        Detect all clashes in a given schedule.
        
        Args:
            scheduled_exams: List of scheduled exams to check
            
        Returns:
            List of detected clashes
        """
        self.clashes = []
        
        # Build student schedule mapping
        student_schedules = self._build_student_schedules(scheduled_exams)
        
        # Check each student's schedule for clashes
        for student_id, exams in student_schedules.items():
            self._detect_student_clashes(student_id, exams)
        
        return self.clashes
    
    def _build_student_schedules(
        self,
        scheduled_exams: List[ScheduledExam]
    ) -> Dict[int, List[ScheduledExam]]:
        """
        Build mapping of student to their scheduled exams.
        
        Args:
            scheduled_exams: List of scheduled exams
            
        Returns:
            Dictionary mapping student_id to list of their exams
        """
        student_schedules = defaultdict(list)
        
        for exam in scheduled_exams:
            # Get all students enrolled in this course
            course = exam.course
            for student in course.students:
                student_schedules[student.id].append(exam)
        
        return student_schedules
    
    def _detect_student_clashes(
        self,
        student_id: int,
        exams: List[ScheduledExam]
    ) -> None:
        """
        Detect clashes for a specific student.
        
        Args:
            student_id: Student ID
            exams: List of exams scheduled for this student
        """
        # Get student info
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return
        
        # Sort exams by date and session
        sorted_exams = sorted(
            exams,
            key=lambda e: (e.exam_date, e.session.value)
        )
        
        # Check for clashes between each pair of exams
        for i in range(len(sorted_exams)):
            for j in range(i + 1, len(sorted_exams)):
                exam1 = sorted_exams[i]
                exam2 = sorted_exams[j]
                
                # Check same slot clash
                if exam1.exam_date == exam2.exam_date and exam1.session == exam2.session:
                    self.clashes.append(Clash(
                        student_id=student.id,
                        student_usn=student.usn,
                        course1_id=exam1.course_id,
                        course1_code=exam1.course.course_code,
                        course2_id=exam2.course_id,
                        course2_code=exam2.course.course_code,
                        clash_type="SAME_SLOT",
                        details=f"Both exams on {exam1.exam_date} {exam1.session.value}"
                    ))
                
                # Check insufficient gap
                days_gap = (exam2.exam_date - exam1.exam_date).days
                if 0 < days_gap < self.min_gap_days:
                    self.clashes.append(Clash(
                        student_id=student.id,
                        student_usn=student.usn,
                        course1_id=exam1.course_id,
                        course1_code=exam1.course.course_code,
                        course2_id=exam2.course_id,
                        course2_code=exam2.course.course_code,
                        clash_type="INSUFFICIENT_GAP",
                        details=f"Only {days_gap} day(s) gap (minimum {self.min_gap_days} required)"
                    ))
    
    def has_clashes(self) -> bool:
        """
        Check if any clashes were detected.
        
        Returns:
            True if clashes exist, False otherwise
        """
        return len(self.clashes) > 0
    
    def get_clash_summary(self) -> Dict:
        """
        Get summary of detected clashes.
        
        Returns:
            Dictionary with clash statistics
        """
        if not self.clashes:
            return {
                "total_clashes": 0,
                "same_slot_clashes": 0,
                "insufficient_gap_clashes": 0,
                "affected_students": 0
            }
        
        same_slot = sum(1 for c in self.clashes if c.clash_type == "SAME_SLOT")
        insufficient_gap = sum(1 for c in self.clashes if c.clash_type == "INSUFFICIENT_GAP")
        affected_students = len(set(c.student_id for c in self.clashes))
        
        return {
            "total_clashes": len(self.clashes),
            "same_slot_clashes": same_slot,
            "insufficient_gap_clashes": insufficient_gap,
            "affected_students": affected_students
        }
    
    def get_clashes_by_type(self, clash_type: str) -> List[Clash]:
        """
        Get clashes of a specific type.
        
        Args:
            clash_type: Type of clash (SAME_SLOT or INSUFFICIENT_GAP)
            
        Returns:
            List of clashes of specified type
        """
        return [c for c in self.clashes if c.clash_type == clash_type]
    
    def get_clashes_for_student(self, student_id: int) -> List[Clash]:
        """
        Get all clashes for a specific student.
        
        Args:
            student_id: Student ID
            
        Returns:
            List of clashes affecting this student
        """
        return [c for c in self.clashes if c.student_id == student_id]
