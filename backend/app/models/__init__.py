"""SQLAlchemy models for the application."""
from .user import User, UserRole
from .rule import Rule, ExamType, RuleCategory
from .course import Course
from .student import Student
from .room import Room, Bench
from .plan import Plan, PlanStatus
from .schedule import ScheduledExam, ExamSession
from .seating import SeatAssignment
from .invigilator import InvigilatorAssignment, FacultyAvailability, InvigilatorRole
from .audit_log import AuditLog
from .engine_execution import EngineExecution, EngineConfiguration, ExecutionStatus
from .department import Department
from .course_registration import CourseRegistration, CourseRegistrationUpload, RegistrationStatus

__all__ = [
    # User
    "User",
    "UserRole",
    # Department
    "Department",
    # Rule
    "Rule",
    "ExamType",
    "RuleCategory",
    # Course
    "Course",
    # Student
    "Student",
    # Course Registration
    "CourseRegistration",
    "CourseRegistrationUpload",
    "RegistrationStatus",
    # Room
    "Room",
    "Bench",
    # Plan
    "Plan",
    "PlanStatus",
    # Schedule
    "ScheduledExam",
    "ExamSession",
    # Seating
    "SeatAssignment",
    # Invigilator
    "InvigilatorAssignment",
    "FacultyAvailability",
    "InvigilatorRole",
    # Audit
    "AuditLog",
    # Engine
    "EngineExecution",
    "EngineConfiguration",
    "ExecutionStatus",
]
