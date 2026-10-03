"""Pydantic schemas for API request/response validation."""
from .rule import Rule, RuleCreate, RuleUpdate
from .user import (
    User, UserCreate, UserUpdate, UserPasswordUpdate,
    Token, TokenData, LoginRequest
)
from .course import Course, CourseCreate, CourseUpdate, CourseWithEnrollment
from .student import (
    Student, StudentCreate, StudentUpdate, StudentWithCourses,
    StudentCourseEnrollment
)
from .room import Room, RoomCreate, RoomUpdate, RoomWithBenches, Bench, BenchCreate
from .plan import Plan, PlanCreate, PlanUpdate, PlanWithStats
from .schedule import ScheduledExam, ScheduledExamCreate, ScheduledExamWithDetails
from .seating import SeatAssignment, SeatAssignmentCreate, SeatAssignmentWithDetails
from .invigilator import (
    FacultyAvailability, FacultyAvailabilityCreate,
    InvigilatorAssignment, InvigilatorAssignmentCreate,
    InvigilatorAssignmentWithDetails, InvigilatorConfirmation,
    InvigilatorReplacement
)
from .engine import (
    ScheduleGenerateRequest, ScheduleGenerateResponse,
    RoomAllocationRequest, SeatAllocationRequest, AllocationResponse,
    InvigilatorAssignmentRequest, InvigilatorAssignmentResponse,
    ValidationRequest, ValidationResponse, ValidationIssue,
    ReportGenerateRequest, ReportGenerateResponse,
    DashboardRequest, DashboardResponse
)

__all__ = [
    # Rule
    "Rule", "RuleCreate", "RuleUpdate",
    # User & Auth
    "User", "UserCreate", "UserUpdate", "UserPasswordUpdate",
    "Token", "TokenData", "LoginRequest",
    # Course
    "Course", "CourseCreate", "CourseUpdate", "CourseWithEnrollment",
    # Student
    "Student", "StudentCreate", "StudentUpdate", "StudentWithCourses",
    "StudentCourseEnrollment",
    # Room
    "Room", "RoomCreate", "RoomUpdate", "RoomWithBenches", "Bench", "BenchCreate",
    # Plan
    "Plan", "PlanCreate", "PlanUpdate", "PlanWithStats",
    # Schedule
    "ScheduledExam", "ScheduledExamCreate", "ScheduledExamWithDetails",
    # Seating
    "SeatAssignment", "SeatAssignmentCreate", "SeatAssignmentWithDetails",
    # Invigilator
    "FacultyAvailability", "FacultyAvailabilityCreate",
    "InvigilatorAssignment", "InvigilatorAssignmentCreate",
    "InvigilatorAssignmentWithDetails", "InvigilatorConfirmation",
    "InvigilatorReplacement",
    # Engine
    "ScheduleGenerateRequest", "ScheduleGenerateResponse",
    "RoomAllocationRequest", "SeatAllocationRequest", "AllocationResponse",
    "InvigilatorAssignmentRequest", "InvigilatorAssignmentResponse",
    "ValidationRequest", "ValidationResponse", "ValidationIssue",
    "ReportGenerateRequest", "ReportGenerateResponse",
    "DashboardRequest", "DashboardResponse",
]
