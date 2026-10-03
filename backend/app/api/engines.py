"""Engine integration endpoints - orchestrates all 4 engines."""
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.models.plan import Plan as PlanModel
from app.models.course import Course as CourseModel
from app.models.schedule import ScheduledExam as ScheduledExamModel
from app.schemas.engine import (
    ScheduleGenerateRequest, ScheduleGenerateResponse,
    RoomAllocationRequest, SeatAllocationRequest, AllocationResponse,
    InvigilatorAssignmentRequest, InvigilatorAssignmentResponse,
    ValidationRequest, ValidationResponse, ValidationIssue,
    ReportGenerateRequest, ReportGenerateResponse,
    DashboardRequest, DashboardResponse
)

# Import engines
from app.services.engine1.scheduler import ExamScheduler
from app.services.engine2.room_allocator import RoomAllocator
from app.services.engine2.seat_allocator import SeatAllocator
from app.services.engine3.invigilator_manager import InvigilatorManager
from app.services.engine4.validator import PlanValidator
from app.services.engine4.compliance_scorer import ComplianceScorer
from app.services.engine4.conflict_dashboard import ConflictDashboard
from app.services.engine4.report_generator import ReportGenerator

router = APIRouter()


# ===== ENGINE 1: SCHEDULING =====

@router.post("/schedule/generate", response_model=ScheduleGenerateResponse)
def generate_schedule(
    request: ScheduleGenerateRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """
    Generate exam schedule using OR-Tools CP-SAT solver.
    Creates ScheduledExam records for the plan.
    """
    # Verify plan exists
    plan = db.query(PlanModel).filter(PlanModel.id == request.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get courses
    courses = db.query(CourseModel).filter(CourseModel.id.in_(request.course_ids)).all()
    if len(courses) != len(request.course_ids):
        raise HTTPException(status_code=404, detail="One or more courses not found")
    
    try:
        # Run Engine 1
        scheduler = ExamScheduler(db, plan.exam_type)
        result = scheduler.schedule_exams(
            plan=plan,
            courses=courses,
            timeout_seconds=request.timeout_seconds
        )
        
        return ScheduleGenerateResponse(
            success=result["success"],
            message=result["message"],
            scheduled_exams=result.get("scheduled_count", 0),
            status=result.get("status", "UNKNOWN"),
            conflicts=result.get("conflicts", [])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scheduling failed: {str(e)}"
        )


# ===== ENGINE 2: ROOM & SEATING =====

@router.post("/rooms/allocate", response_model=AllocationResponse)
def allocate_rooms(
    request: RoomAllocationRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """
    Allocate rooms for a scheduled exam.
    Uses First-Fit Decreasing algorithm.
    """
    # Verify scheduled exam exists
    exam = db.query(ScheduledExamModel).filter(
        ScheduledExamModel.id == request.scheduled_exam_id
    ).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Scheduled exam not found")
    
    try:
        # Run Engine 2 - Room Allocation
        allocator = RoomAllocator(db, exam.plan.exam_type)
        result = allocator.allocate_rooms(exam)
        
        return AllocationResponse(
            success=result["success"],
            message=result["message"],
            allocated_count=result.get("room_count", 0),
            details=result.get("details", {})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Room allocation failed: {str(e)}"
        )


@router.post("/seats/allocate", response_model=AllocationResponse)
def allocate_seats(
    request: SeatAllocationRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """
    Allocate seats for a scheduled exam.
    Ensures branch separation using 8-direction neighbor check.
    """
    # Verify scheduled exam exists
    exam = db.query(ScheduledExamModel).filter(
        ScheduledExamModel.id == request.scheduled_exam_id
    ).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Scheduled exam not found")
    
    try:
        # Run Engine 2 - Seat Allocation
        allocator = SeatAllocator(db, exam.plan.exam_type)
        result = allocator.allocate_seats(exam)
        
        return AllocationResponse(
            success=result["success"],
            message=result["message"],
            allocated_count=result.get("seat_count", 0),
            details=result.get("details", {})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Seat allocation failed: {str(e)}"
        )


# ===== ENGINE 3: INVIGILATOR MANAGEMENT =====

@router.post("/invigilators/assign", response_model=InvigilatorAssignmentResponse)
def assign_invigilators(
    request: InvigilatorAssignmentRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """
    Assign invigilators to a scheduled exam.
    Uses workload balancing and eligibility checking.
    """
    # Verify scheduled exam exists
    exam = db.query(ScheduledExamModel).filter(
        ScheduledExamModel.id == request.scheduled_exam_id
    ).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Scheduled exam not found")
    
    try:
        # Run Engine 3
        manager = InvigilatorManager(db, exam.plan.exam_type)
        
        if request.auto_assign:
            result = manager.auto_assign_invigilators(exam)
        else:
            # Manual assignment would need additional parameters
            raise HTTPException(
                status_code=400,
                detail="Manual assignment not yet implemented via API"
            )
        
        return InvigilatorAssignmentResponse(
            success=result["success"],
            message=result["message"],
            assigned_count=result.get("assigned_count", 0),
            required_count=result.get("required_count", 0),
            details=result.get("details", {})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invigilator assignment failed: {str(e)}"
        )


# ===== ENGINE 4: VALIDATION & REPORTING =====

@router.post("/validate", response_model=ValidationResponse)
def validate_plan(
    request: ValidationRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Validate a plan independently.
    Checks scheduling, seating, invigilation rules and completeness.
    """
    # Verify plan exists
    plan = db.query(PlanModel).filter(PlanModel.id == request.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    try:
        # Run Engine 4 - Validation
        validator = PlanValidator(db, plan.exam_type)
        issues = validator.validate_plan(plan)
        
        # Calculate compliance score
        scorer = ComplianceScorer()
        score, grade = scorer.calculate_score(issues)
        
        # Build response
        issues_by_severity = {
            "CRITICAL": 0,
            "ERROR": 0,
            "WARNING": 0,
            "INFO": 0
        }
        for issue in issues:
            issues_by_severity[issue["severity"]] += 1
        
        response_issues = []
        if request.include_details:
            response_issues = [
                ValidationIssue(**issue)
                for issue in issues
            ]
        
        return ValidationResponse(
            plan_id=plan.id,
            compliance_score=score,
            grade=grade,
            total_issues=len(issues),
            issues_by_severity=issues_by_severity,
            issues=response_issues
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation failed: {str(e)}"
        )


@router.post("/reports/generate", response_model=ReportGenerateResponse)
def generate_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Generate reports in various formats (PDF, Excel, JSON).
    """
    # Verify plan exists
    plan = db.query(PlanModel).filter(PlanModel.id == request.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    try:
        # Run Engine 4 - Report Generation
        generator = ReportGenerator(db)
        
        if request.report_type == "compliance":
            if request.format == "pdf":
                path = generator.generate_compliance_pdf(plan)
                return ReportGenerateResponse(
                    success=True,
                    message="Compliance report generated",
                    report_path=path
                )
            elif request.format == "json":
                data = generator.generate_compliance_json(plan)
                return ReportGenerateResponse(
                    success=True,
                    message="Compliance report generated",
                    report_data=data
                )
        
        elif request.report_type == "schedule":
            if request.format == "excel":
                path = generator.generate_schedule_excel(plan)
                return ReportGenerateResponse(
                    success=True,
                    message="Schedule report generated",
                    report_path=path
                )
        
        elif request.report_type == "seating":
            if request.format == "excel":
                path = generator.generate_seating_excel(plan)
                return ReportGenerateResponse(
                    success=True,
                    message="Seating report generated",
                    report_path=path
                )
        
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported report type '{request.report_type}' or format '{request.format}'"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}"
        )


@router.post("/dashboard", response_model=DashboardResponse)
def get_conflict_dashboard(
    request: DashboardRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get conflict dashboard data for a plan.
    Provides overview, groupings, hot spots, and timeline.
    """
    # Verify plan exists
    plan = db.query(PlanModel).filter(PlanModel.id == request.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    try:
        # Run Engine 4 - Dashboard
        dashboard = ConflictDashboard(db, plan.exam_type)
        
        validator = PlanValidator(db, plan.exam_type)
        issues = validator.validate_plan(plan)
        
        overview = dashboard.get_overview(issues)
        by_severity = dashboard.group_by_severity(issues)
        by_rule = dashboard.group_by_rule(issues)
        by_entity = dashboard.group_by_entity(issues)
        hot_spots = dashboard.identify_hot_spots(plan, issues)
        timeline = dashboard.get_timeline(plan, issues)
        
        return DashboardResponse(
            overview=overview,
            by_severity=by_severity,
            by_rule=by_rule,
            by_entity=by_entity,
            hot_spots=hot_spots,
            timeline=timeline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dashboard generation failed: {str(e)}"
        )
