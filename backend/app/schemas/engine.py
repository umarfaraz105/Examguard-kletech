"""Engine operation schemas for request/response validation."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


# Engine 1: Scheduling
class ScheduleGenerateRequest(BaseModel):
    """Request to generate exam schedule."""
    plan_id: int
    course_ids: List[int]
    timeout_seconds: int = 60


class ScheduleGenerateResponse(BaseModel):
    """Response from schedule generation."""
    success: bool
    message: str
    scheduled_exams: int
    status: str  # OPTIMAL, FEASIBLE, INFEASIBLE
    conflicts: List[Dict[str, Any]] = []


# Engine 2: Room & Seating
class RoomAllocationRequest(BaseModel):
    """Request to allocate rooms."""
    scheduled_exam_id: int


class SeatAllocationRequest(BaseModel):
    """Request to allocate seats."""
    scheduled_exam_id: int


class AllocationResponse(BaseModel):
    """Response from allocation."""
    success: bool
    message: str
    allocated_count: int
    details: Dict[str, Any] = {}


# Engine 3: Invigilator Management
class InvigilatorAssignmentRequest(BaseModel):
    """Request to assign invigilators."""
    scheduled_exam_id: int
    auto_assign: bool = True


class InvigilatorAssignmentResponse(BaseModel):
    """Response from invigilator assignment."""
    success: bool
    message: str
    assigned_count: int
    required_count: int
    details: Dict[str, Any] = {}


# Engine 4: Validation & Reporting
class ValidationRequest(BaseModel):
    """Request to validate plan."""
    plan_id: int
    include_details: bool = True


class ValidationIssue(BaseModel):
    """Validation issue."""
    severity: str
    rule_code: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None


class ValidationResponse(BaseModel):
    """Response from validation."""
    plan_id: int
    compliance_score: float
    grade: str
    total_issues: int
    issues_by_severity: Dict[str, int]
    issues: List[ValidationIssue] = []


class ReportGenerateRequest(BaseModel):
    """Request to generate report."""
    plan_id: int
    report_type: str  # compliance, schedule, seating, invigilator
    format: str  # pdf, excel, json


class ReportGenerateResponse(BaseModel):
    """Response from report generation."""
    success: bool
    message: str
    report_path: Optional[str] = None
    report_data: Optional[Dict[str, Any]] = None


class DashboardRequest(BaseModel):
    """Request for conflict dashboard."""
    plan_id: int


class DashboardResponse(BaseModel):
    """Response with dashboard data."""
    overview: Dict[str, Any]
    by_severity: Dict[str, int]
    by_rule: Dict[str, int]
    by_entity: Dict[str, int]
    hot_spots: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]
