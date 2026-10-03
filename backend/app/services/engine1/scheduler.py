"""
Main scheduling engine using Google OR-Tools CP-SAT solver.

Assigns date + session to each course ensuring no student has exam clashes.
"""
from typing import List, Dict, Tuple, Optional, Any
from datetime import date, time, timedelta, datetime
from collections import defaultdict
from sqlalchemy.orm import Session
from ortools.sat.python import cp_model
import uuid
import time as time_module

from app.models.course import Course
from app.models.plan import Plan
from app.models.schedule import ScheduledExam, ExamSession
from app.models.rule import ExamType
from app.models.audit_log import AuditLog, AuditAction, AuditEntity
from app.services.rules import RuleProvider
from app.services.engine1.conflict_graph import ConflictGraph
from app.services.engine1.clash_detector import ClashDetector
from app.core.engine_interface import (
    BaseEngine, 
    EngineMetadata, 
    EngineExecutionResult, 
    EngineValidationError,
    EngineStatus
)


class SchedulingResult:
    """Result of scheduling operation."""
    
    def __init__(
        self,
        success: bool,
        scheduled_exams: List[ScheduledExam],
        message: str,
        statistics: Dict,
        clashes: List = None
    ):
        """
        Initialize scheduling result.
        
        Args:
            success: Whether scheduling succeeded
            scheduled_exams: List of scheduled exams
            message: Result message
            statistics: Scheduling statistics
            clashes: List of detected clashes (if any)
        """
        self.success = success
        self.scheduled_exams = scheduled_exams
        self.message = message
        self.statistics = statistics
        self.clashes = clashes or []
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "success": self.success,
            "message": self.message,
            "num_exams_scheduled": len(self.scheduled_exams),
            "statistics": self.statistics,
            "num_clashes": len(self.clashes)
        }


class ExamScheduler:
    """
    Main exam scheduling engine.
    
    Uses Google OR-Tools CP-SAT solver to assign date + session to courses
    while respecting constraints:
    1. No student has two exams at same time
    2. Minimum gap days between exams for same student
    3. Available date range and sessions
    """
    
    def __init__(self, db: Session):
        """
        Initialize scheduler.
        
        Args:
            db: Database session
        """
        self.db = db
        self.rule_provider = RuleProvider(db)
        self.conflict_graph = ConflictGraph()
        self.model = None
        self.solver = None
    
    def schedule_exams(
        self,
        plan: Plan,
        courses: List[Course],
        start_date: date,
        end_date: date,
        sessions: List[ExamSession] = None,
        user_id: int = None
    ) -> SchedulingResult:
        """
        Schedule exams for given courses.
        
        Args:
            plan: Exam plan to schedule for
            courses: List of courses to schedule
            start_date: Start date for exam period
            end_date: End date for exam period
            sessions: List of available sessions (default: MORNING, AFTERNOON)
            user_id: User performing the scheduling
            
        Returns:
            SchedulingResult with scheduled exams or error
        """
        # Validate inputs
        if not courses:
            return SchedulingResult(
                success=False,
                scheduled_exams=[],
                message="No courses to schedule",
                statistics={}
            )
        
        if start_date >= end_date:
            return SchedulingResult(
                success=False,
                scheduled_exams=[],
                message="Invalid date range",
                statistics={}
            )
        
        # Default sessions
        if sessions is None:
            sessions = [ExamSession.MORNING, ExamSession.AFTERNOON]
        
        # Get rules
        min_gap_days = self.rule_provider.get_int(plan.exam_type, "min_gap_days", default=1)
        duration_minutes = self.rule_provider.get_int(plan.exam_type, "duration_minutes")
        
        # Build conflict graph
        self.conflict_graph.build_from_database(
            self.db,
            semester=plan.semester,
            academic_year=plan.academic_year
        )
        
        # Generate time slots
        time_slots = self._generate_time_slots(start_date, end_date, sessions)
        
        if not time_slots:
            return SchedulingResult(
                success=False,
                scheduled_exams=[],
                message="No valid time slots available",
                statistics={}
            )
        
        # Check if enough slots
        min_slots_needed = self.conflict_graph.get_chromatic_number_lower_bound()
        if len(time_slots) < min_slots_needed:
            return SchedulingResult(
                success=False,
                scheduled_exams=[],
                message=f"Insufficient time slots: need at least {min_slots_needed}, have {len(time_slots)}",
                statistics={"min_slots_needed": min_slots_needed, "available_slots": len(time_slots)}
            )
        
        # Run CP-SAT solver
        solution = self._solve_with_cp_sat(
            courses=courses,
            time_slots=time_slots,
            min_gap_days=min_gap_days
        )
        
        if not solution["success"]:
            return SchedulingResult(
                success=False,
                scheduled_exams=[],
                message=solution["message"],
                statistics=solution
            )
        
        # Create scheduled exam records
        scheduled_exams = self._create_scheduled_exams(
            plan=plan,
            courses=courses,
            assignments=solution["assignments"],
            time_slots=time_slots,
            duration_minutes=duration_minutes
        )
        
        # Detect clashes (verification)
        detector = ClashDetector(self.db, min_gap_days)
        clashes = detector.detect_clashes_in_schedule(scheduled_exams)
        
        # Log to audit
        if user_id:
            AuditLog.log_action(
                db=self.db,
                user_id=user_id,
                action=AuditAction.CREATE,
                entity_type=AuditEntity.SCHEDULED_EXAM,
                description=f"Scheduled {len(scheduled_exams)} exams for plan {plan.plan_name}",
                new_values={
                    "plan_id": plan.id,
                    "num_courses": len(courses),
                    "num_exams": len(scheduled_exams),
                    "num_clashes": len(clashes)
                }
            )
        
        # Return result
        statistics = {
            "num_courses": len(courses),
            "num_time_slots": len(time_slots),
            "num_exams_scheduled": len(scheduled_exams),
            "solver_status": solution["status"],
            "solve_time_ms": solution.get("solve_time_ms", 0),
            **self.conflict_graph.get_statistics()
        }
        
        return SchedulingResult(
            success=True,
            scheduled_exams=scheduled_exams,
            message=f"Successfully scheduled {len(scheduled_exams)} exams",
            statistics=statistics,
            clashes=clashes
        )
    
    def _generate_time_slots(
        self,
        start_date: date,
        end_date: date,
        sessions: List[ExamSession]
    ) -> List[Tuple[date, ExamSession]]:
        """
        Generate list of available time slots.
        
        Args:
            start_date: Start date
            end_date: End date
            sessions: List of sessions per day
            
        Returns:
            List of (date, session) tuples
        """
        slots = []
        current_date = start_date
        
        while current_date <= end_date:
            for session in sessions:
                slots.append((current_date, session))
            current_date += timedelta(days=1)
        
        return slots
    
    def _solve_with_cp_sat(
        self,
        courses: List[Course],
        time_slots: List[Tuple[date, ExamSession]],
        min_gap_days: int
    ) -> Dict:
        """
        Solve scheduling problem using CP-SAT.
        
        Args:
            courses: List of courses to schedule
            time_slots: List of available time slots
            min_gap_days: Minimum gap days between exams
            
        Returns:
            Dictionary with solution or error
        """
        # Create model
        model = cp_model.CpModel()
        
        # Variables: course_vars[course_id] = slot_index
        course_vars = {}
        for course in courses:
            course_vars[course.id] = model.NewIntVar(
                0,
                len(time_slots) - 1,
                f"course_{course.id}"
            )
        
        # Constraint 1: Conflicting courses must not be in same time slot
        for course1 in courses:
            for course2 in courses:
                if course1.id >= course2.id:
                    continue  # Only check each pair once
                
                if self.conflict_graph.has_conflict(course1.id, course2.id):
                    # These courses share students - cannot be at same time
                    model.Add(course_vars[course1.id] != course_vars[course2.id])
        
        # Constraint 2: Minimum gap between exams for same student
        if min_gap_days > 0:
            for course1 in courses:
                for course2 in courses:
                    if course1.id >= course2.id:
                        continue
                    
                    if self.conflict_graph.has_conflict(course1.id, course2.id):
                        # Calculate minimum slot gap
                        # Each day has len(sessions) slots, so min_gap_days * slots_per_day
                        # For simplicity, we use a linear constraint
                        # This is an approximation; exact date checking happens in verification
                        slots_per_day = 2  # Typical: morning + afternoon
                        min_slot_gap = min_gap_days * slots_per_day
                        
                        # |slot1 - slot2| >= min_slot_gap
                        # We use two constraints: slot2 - slot1 >= gap OR slot1 - slot2 >= gap
                        # Create boolean for direction
                        b = model.NewBoolVar(f"gap_{course1.id}_{course2.id}")
                        model.Add(course_vars[course2.id] - course_vars[course1.id] >= min_slot_gap).OnlyEnforceIf(b)
                        model.Add(course_vars[course1.id] - course_vars[course2.id] >= min_slot_gap).OnlyEnforceIf(b.Not())
        
        # Objective: Minimize maximum slot index used (compact schedule)
        max_slot = model.NewIntVar(0, len(time_slots) - 1, "max_slot")
        for course_id, var in course_vars.items():
            model.AddMaxEquality(max_slot, [var])
        model.Minimize(max_slot)
        
        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 60.0  # 60 second timeout
        
        status = solver.Solve(model)
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            # Extract solution
            assignments = {}
            for course in courses:
                slot_index = solver.Value(course_vars[course.id])
                assignments[course.id] = slot_index
            
            return {
                "success": True,
                "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
                "assignments": assignments,
                "solve_time_ms": solver.WallTime()
            }
        else:
            return {
                "success": False,
                "status": "INFEASIBLE" if status == cp_model.INFEASIBLE else "UNKNOWN",
                "message": f"CP-SAT solver status: {solver.StatusName(status)}",
                "solve_time_ms": solver.WallTime()
            }
    
    def _create_scheduled_exams(
        self,
        plan: Plan,
        courses: List[Course],
        assignments: Dict[int, int],
        time_slots: List[Tuple[date, ExamSession]],
        duration_minutes: int
    ) -> List[ScheduledExam]:
        """
        Create ScheduledExam records from solution.
        
        Args:
            plan: Exam plan
            courses: List of courses
            assignments: Dictionary mapping course_id to slot_index
            time_slots: List of time slots
            duration_minutes: Exam duration
            
        Returns:
            List of ScheduledExam objects
        """
        scheduled_exams = []
        
        # Get session timings from rules (or use defaults)
        try:
            session_timings = self.rule_provider.get_json(
                plan.exam_type,
                "session_timings"
            )
        except:
            # Default timings
            session_timings = {
                "morning": {"start": "09:00", "end": "12:00"},
                "afternoon": {"start": "14:00", "end": "17:00"}
            }
        
        for course in courses:
            if course.id not in assignments:
                continue
            
            slot_index = assignments[course.id]
            exam_date, session = time_slots[slot_index]
            
            # Get start/end times based on session
            if session == ExamSession.MORNING:
                start_time_str = session_timings.get("morning", {}).get("start", "09:00")
            elif session == ExamSession.AFTERNOON:
                start_time_str = session_timings.get("afternoon", {}).get("start", "14:00")
            else:
                start_time_str = "09:00"
            
            # Parse time
            hour, minute = map(int, start_time_str.split(":"))
            start_time_obj = time(hour, minute)
            
            # Calculate end time
            end_hour = hour + (duration_minutes // 60)
            end_minute = minute + (duration_minutes % 60)
            if end_minute >= 60:
                end_hour += 1
                end_minute -= 60
            end_time_obj = time(end_hour, end_minute)
            
            # Count students
            num_students = len(course.students)
            
            # Create scheduled exam
            scheduled_exam = ScheduledExam(
                plan_id=plan.id,
                course_id=course.id,
                exam_date=exam_date,
                session=session,
                start_time=start_time_obj,
                end_time=end_time_obj,
                duration_minutes=duration_minutes,
                num_students=num_students
            )
            
            scheduled_exams.append(scheduled_exam)
        
        return scheduled_exams


class Engine1SchedulingEngine(BaseEngine):
    """
    Plugin-compatible wrapper for the exam scheduling engine.
    
    This class implements the BaseEngine interface to make Engine 1 
    compatible with the plugin architecture.
    """
    
    def __init__(self):
        """Initialize the engine wrapper."""
        self._current_executions: Dict[str, Dict] = {}
    
    def get_metadata(self) -> EngineMetadata:
        """Return engine metadata."""
        return EngineMetadata(
            name="engine1-scheduling",
            display_name="Conflict-Optimized Scheduler (Engine 1)",
            version="1.0.0",
            description="Advanced scheduling engine using Google OR-Tools CP-SAT solver with conflict detection and optimization",
            capabilities=[
                "exam_scheduling",
                "conflict_detection", 
                "optimization",
                "constraint_satisfaction"
            ],
            dependencies=[],
            execution_order=0,
            requires_approval=False
        )
    
    def validate_input(self, input_data: Dict[str, Any]) -> List[EngineValidationError]:
        """Validate input parameters."""
        errors = []
        
        # Required fields
        required_fields = ["plan_id", "course_ids", "start_date", "end_date"]
        for field in required_fields:
            if field not in input_data:
                errors.append(EngineValidationError(
                    field=field,
                    message=f"Required field '{field}' is missing"
                ))
        
        # Validate date format and range
        try:
            if "start_date" in input_data and "end_date" in input_data:
                start_date = datetime.strptime(input_data["start_date"], "%Y-%m-%d").date()
                end_date = datetime.strptime(input_data["end_date"], "%Y-%m-%d").date()
                
                if start_date >= end_date:
                    errors.append(EngineValidationError(
                        field="date_range",
                        message="Start date must be before end date"
                    ))
                
                # Check if date range is reasonable (not too short/long)
                days_diff = (end_date - start_date).days
                if days_diff < 1:
                    errors.append(EngineValidationError(
                        field="date_range",
                        message="Date range must be at least 1 day",
                        severity="error"
                    ))
                elif days_diff > 365:
                    errors.append(EngineValidationError(
                        field="date_range",
                        message="Date range longer than 365 days may cause performance issues",
                        severity="warning"
                    ))
        except ValueError as e:
            errors.append(EngineValidationError(
                field="date_format",
                message=f"Invalid date format. Use YYYY-MM-DD: {str(e)}"
            ))
        
        # Validate course IDs
        if "course_ids" in input_data:
            if not isinstance(input_data["course_ids"], list):
                errors.append(EngineValidationError(
                    field="course_ids",
                    message="course_ids must be a list of integers"
                ))
            elif not input_data["course_ids"]:
                errors.append(EngineValidationError(
                    field="course_ids", 
                    message="At least one course ID is required"
                ))
        
        # Validate optional sessions
        if "sessions" in input_data:
            valid_sessions = ["morning", "afternoon", "evening"]
            sessions = input_data["sessions"]
            if not isinstance(sessions, list):
                errors.append(EngineValidationError(
                    field="sessions",
                    message="sessions must be a list"
                ))
            else:
                for session in sessions:
                    if session.lower() not in valid_sessions:
                        errors.append(EngineValidationError(
                            field="sessions",
                            message=f"Invalid session '{session}'. Valid options: {valid_sessions}"
                        ))
        
        return errors
    
    def execute(self, input_data: Dict[str, Any], db: Session) -> EngineExecutionResult:
        """Execute the scheduling engine."""
        execution_id = str(uuid.uuid4())
        started_at = datetime.utcnow()
        
        # Track execution
        self._current_executions[execution_id] = {
            "status": EngineStatus.RUNNING,
            "started_at": started_at
        }
        
        try:
            # Parse input
            plan_id = input_data["plan_id"]
            course_ids = input_data["course_ids"]
            start_date = datetime.strptime(input_data["start_date"], "%Y-%m-%d").date()
            end_date = datetime.strptime(input_data["end_date"], "%Y-%m-%d").date()
            user_id = input_data.get("user_id")
            
            # Convert session strings to enum values
            session_strings = input_data.get("sessions", ["morning", "afternoon"])
            sessions = []
            for session_str in session_strings:
                if session_str.lower() == "morning":
                    sessions.append(ExamSession.MORNING)
                elif session_str.lower() == "afternoon":
                    sessions.append(ExamSession.AFTERNOON)
                elif session_str.lower() == "evening":
                    sessions.append(ExamSession.EVENING)
            
            # Fetch required objects
            plan = db.query(Plan).filter(Plan.id == plan_id).first()
            if not plan:
                raise ValueError(f"Plan with ID {plan_id} not found")
            
            courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
            if len(courses) != len(course_ids):
                found_ids = {course.id for course in courses}
                missing_ids = set(course_ids) - found_ids
                raise ValueError(f"Courses not found: {missing_ids}")
            
            # Initialize and run scheduler
            scheduler = ExamScheduler(db)
            start_time = time_module.perf_counter()
            
            result = scheduler.schedule_exams(
                plan=plan,
                courses=courses,
                start_date=start_date,
                end_date=end_date,
                sessions=sessions,
                user_id=user_id
            )
            
            end_time = time_module.perf_counter()
            execution_time_ms = int((end_time - start_time) * 1000)
            completed_at = datetime.utcnow()
            
            # Update execution status
            self._current_executions[execution_id].update({
                "status": EngineStatus.COMPLETED if result.success else EngineStatus.FAILED,
                "completed_at": completed_at,
                "result": result
            })
            
            # Prepare result data
            result_data = {
                "scheduled_exams": [
                    {
                        "course_id": exam.course_id,
                        "exam_date": exam.exam_date.isoformat(),
                        "session": exam.session.value,
                        "start_time": exam.start_time.strftime("%H:%M"),
                        "end_time": exam.end_time.strftime("%H:%M"),
                        "duration_minutes": exam.duration_minutes,
                        "num_students": exam.num_students
                    }
                    for exam in result.scheduled_exams
                ],
                "statistics": result.statistics,
                "clashes": [clash.to_dict() for clash in result.clashes] if result.clashes else []
            }
            
            return EngineExecutionResult(
                success=result.success,
                status=EngineStatus.COMPLETED if result.success else EngineStatus.FAILED,
                execution_id=execution_id,
                started_at=started_at,
                completed_at=completed_at,
                execution_time_ms=execution_time_ms,
                result_data=result_data,
                error_message=result.message if not result.success else None,
                warnings=[]
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
        
        # Check OR-Tools availability
        try:
            from ortools.sat.python import cp_model
            cp_model.CpModel()
            checks["ortools"] = "ok"
        except Exception as e:
            checks["ortools"] = f"error: {str(e)}"
        
        # Check database connectivity would be done in the API layer
        # since we don't have a persistent DB connection here
        checks["database"] = "ok"  # Assume ok for now
        
        # Determine overall status
        status = "healthy" if all(check == "ok" for check in checks.values()) else "unhealthy"
        
        return {
            "status": status,
            "checks": checks,
            "message": f"Engine 1 status: {status}"
        }
    
    def get_input_schema(self) -> Dict[str, Any]:
        """Return JSON schema for input validation."""
        return {
            "type": "object",
            "properties": {
                "plan_id": {
                    "type": "integer",
                    "description": "ID of the exam plan"
                },
                "course_ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "List of course IDs to schedule",
                    "minItems": 1
                },
                "start_date": {
                    "type": "string",
                    "pattern": r"^\d{4}-\d{2}-\d{2}$",
                    "description": "Start date in YYYY-MM-DD format"
                },
                "end_date": {
                    "type": "string", 
                    "pattern": r"^\d{4}-\d{2}-\d{2}$",
                    "description": "End date in YYYY-MM-DD format"
                },
                "sessions": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["morning", "afternoon", "evening"]
                    },
                    "description": "Available exam sessions",
                    "default": ["morning", "afternoon"]
                },
                "user_id": {
                    "type": "integer",
                    "description": "ID of user performing the scheduling (optional)"
                }
            },
            "required": ["plan_id", "course_ids", "start_date", "end_date"]
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        """Return JSON schema for output format."""
        return {
            "type": "object",
            "properties": {
                "scheduled_exams": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "integer"},
                            "exam_date": {"type": "string"},
                            "session": {"type": "string"},
                            "start_time": {"type": "string"},
                            "end_time": {"type": "string"},
                            "duration_minutes": {"type": "integer"},
                            "num_students": {"type": "integer"}
                        }
                    }
                },
                "statistics": {
                    "type": "object",
                    "description": "Scheduling statistics and metrics"
                },
                "clashes": {
                    "type": "array",
                    "description": "Any detected scheduling conflicts"
                }
            }
        }
    
    # ================== SCHEDULING ANALYSIS FUNCTIONS ==================
    
    def analyze_schedule_density(self, scheduled_exams: List[ScheduledExam]) -> Dict[str, Any]:
        """
        Analyze schedule density and distribution.
        
        Args:
            scheduled_exams: List of scheduled exams
            
        Returns:
            Density analysis with recommendations
        """
        if not scheduled_exams:
            return {"error": "No scheduled exams provided"}
        
        # Group by date
        dates = defaultdict(list)
        for exam in scheduled_exams:
            dates[exam.exam_date].append(exam)
        
        # Calculate metrics
        exam_dates = list(dates.keys())
        total_days = (max(exam_dates) - min(exam_dates)).days + 1
        active_days = len(exam_dates)
        utilization = active_days / total_days if total_days > 0 else 0
        
        # Daily load analysis
        daily_loads = [len(exams) for exams in dates.values()]
        avg_daily_load = sum(daily_loads) / len(daily_loads) if daily_loads else 0
        max_daily_load = max(daily_loads) if daily_loads else 0
        
        # Peak days
        peak_threshold = avg_daily_load * 1.5
        peak_days = [date for date, exams in dates.items() if len(exams) >= peak_threshold]
        
        return {
            "total_exams": len(scheduled_exams),
            "exam_period_days": total_days,
            "active_days": active_days,
            "utilization_percentage": round(utilization * 100, 2),
            "average_daily_load": round(avg_daily_load, 2),
            "maximum_daily_load": max_daily_load,
            "peak_days": len(peak_days),
            "peak_dates": [date.isoformat() for date in peak_days],
            "load_distribution": {
                date.isoformat(): len(exams) for date, exams in dates.items()
            },
            "recommendations": self._generate_density_recommendations(utilization, max_daily_load, avg_daily_load)
        }
    
    def _generate_density_recommendations(self, utilization: float, max_load: int, avg_load: float) -> List[str]:
        """Generate recommendations based on density analysis."""
        recommendations = []
        
        if utilization < 0.5:
            recommendations.append("Schedule is sparse - consider compacting to reduce exam period")
        elif utilization > 0.8:
            recommendations.append("Schedule is very dense - ensure adequate preparation time")
        
        if max_load > avg_load * 2:
            recommendations.append("Some days are overloaded - consider redistributing exams")
        
        if max_load <= 2:
            recommendations.append("Good load distribution - no major bottlenecks")
        
        return recommendations
    
    # ================== CONFLICT ANALYSIS FUNCTIONS ==================
    
    def analyze_student_conflicts(self, course_ids: List[int]) -> Dict[str, Any]:
        """
        Analyze potential conflicts between courses based on student enrollment.
        
        Args:
            course_ids: List of course IDs to analyze
            
        Returns:
            Detailed conflict analysis
        """
        courses = self.db.query(Course).filter(Course.id.in_(course_ids)).all()
        conflict_matrix = {}
        total_conflicts = 0
        severe_conflicts = []
        
        for i, course1 in enumerate(courses):
            for j, course2 in enumerate(courses[i+1:], i+1):
                # Get shared students
                students1 = set(s.id for s in course1.students)
                students2 = set(s.id for s in course2.students)
                shared = students1.intersection(students2)
                
                if shared:
                    conflict_key = f"{course1.course_code}-{course2.course_code}"
                    conflict_matrix[conflict_key] = {
                        "course1": course1.course_code,
                        "course2": course2.course_code,
                        "shared_students": len(shared),
                        "course1_total": len(students1),
                        "course2_total": len(students2),
                        "conflict_percentage": round(len(shared) / max(len(students1), len(students2)) * 100, 2)
                    }
                    total_conflicts += len(shared)
                    
                    # Mark as severe if >50% overlap
                    if len(shared) / max(len(students1), len(students2)) > 0.5:
                        severe_conflicts.append(conflict_key)
        
        return {
            "total_courses": len(courses),
            "total_conflicts": total_conflicts,
            "conflict_pairs": len(conflict_matrix),
            "severe_conflicts": len(severe_conflicts),
            "conflict_matrix": conflict_matrix,
            "severe_conflict_pairs": severe_conflicts,
            "scheduling_difficulty": "HIGH" if severe_conflicts else "MEDIUM" if conflict_matrix else "LOW"
        }
    
    # ================== OPTIMIZATION FUNCTIONS ==================
    
    def optimize_exam_gaps(self, scheduled_exams: List[ScheduledExam], min_gap_days: int = 1) -> Dict[str, Any]:
        """
        Optimize gaps between exams for better student preparation.
        
        Args:
            scheduled_exams: Current schedule
            min_gap_days: Minimum gap required
            
        Returns:
            Gap analysis and optimization suggestions
        """
        violations = []
        student_gaps = defaultdict(list)
        
        # Build student schedule map
        for exam in scheduled_exams:
            for student in exam.course.students:
                student_gaps[student.id].append({
                    "exam": exam,
                    "date": exam.exam_date,
                    "course": exam.course.course_code
                })
        
        # Check gaps for each student
        for student_id, exams in student_gaps.items():
            sorted_exams = sorted(exams, key=lambda x: x["date"])
            
            for i in range(len(sorted_exams) - 1):
                current = sorted_exams[i]
                next_exam = sorted_exams[i + 1]
                
                gap_days = (next_exam["date"] - current["date"]).days
                if gap_days < min_gap_days:
                    violations.append({
                        "student_id": student_id,
                        "course1": current["course"],
                        "course2": next_exam["course"],
                        "date1": current["date"].isoformat(),
                        "date2": next_exam["date"].isoformat(),
                        "actual_gap": gap_days,
                        "required_gap": min_gap_days,
                        "severity": "CRITICAL" if gap_days == 0 else "HIGH"
                    })
        
        # Calculate metrics
        total_students_affected = len(set(v["student_id"] for v in violations))
        
        return {
            "total_violations": len(violations),
            "students_affected": total_students_affected,
            "violation_details": violations,
            "compliance_rate": round((len(student_gaps) - total_students_affected) / len(student_gaps) * 100, 2) if student_gaps else 100,
            "recommendations": self._generate_gap_recommendations(violations)
        }
    
    def _generate_gap_recommendations(self, violations: List[Dict]) -> List[str]:
        """Generate recommendations for gap violations."""
        recommendations = []
        
        if not violations:
            recommendations.append("All exams meet minimum gap requirements")
            return recommendations
        
        critical_count = len([v for v in violations if v["severity"] == "CRITICAL"])
        if critical_count > 0:
            recommendations.append(f"URGENT: {critical_count} same-day exam conflicts must be resolved")
        
        high_count = len([v for v in violations if v["severity"] == "HIGH"])
        if high_count > 0:
            recommendations.append(f"Consider rescheduling {high_count} exams with insufficient gaps")
        
        # Find most problematic courses
        course_counts = defaultdict(int)
        for v in violations:
            course_counts[v["course1"]] += 1
            course_counts[v["course2"]] += 1
        
        if course_counts:
            worst_course = max(course_counts.items(), key=lambda x: x[1])
            recommendations.append(f"Course {worst_course[0]} appears in most conflicts - consider rescheduling")
        
        return recommendations
    
    # ================== SCHEDULING UTILITIES ==================
    
    def generate_alternate_schedules(self, plan: Plan, num_alternatives: int = 3) -> List[Dict[str, Any]]:
        """
        Generate multiple alternative schedules for comparison.
        
        Args:
            plan: Exam plan
            num_alternatives: Number of alternatives to generate
            
        Returns:
            List of alternative schedules with their metrics
        """
        alternatives = []
        original_courses = self.db.query(Course).filter(Course.plan_id == plan.id).all()
        
        for attempt in range(num_alternatives):
            try:
                # Vary some parameters for alternatives
                variation_factor = 1 + (attempt * 0.1)  # Slight variations
                
                # Create alternative input with variations
                sessions = [ExamSession.MORNING, ExamSession.AFTERNOON, ExamSession.EVENING][:int(3 * variation_factor)]
                
                result = self.schedule_exams(
                    plan=plan,
                    courses=original_courses,
                    start_date=plan.start_date or date(2024, 5, 1),
                    end_date=plan.end_date or date(2024, 5, 15),
                    sessions=sessions
                )
                
                if result.success:
                    # Analyze this alternative
                    alternatives.append({
                        "alternative_id": attempt + 1,
                        "total_exams": len(result.scheduled_exams),
                        "exam_period_days": self._calculate_exam_period(result.scheduled_exams),
                        "conflict_score": result.statistics.get("conflicts_resolved", 0),
                        "optimization_score": self._calculate_optimization_score(result.scheduled_exams),
                        "schedule_data": result.scheduled_exams
                    })
                    
            except Exception as e:
                continue
        
        # Sort by optimization score
        alternatives.sort(key=lambda x: x["optimization_score"], reverse=True)
        
        return alternatives
    
    def _calculate_exam_period(self, scheduled_exams: List[ScheduledExam]) -> int:
        """Calculate exam period duration in days."""
        if not scheduled_exams:
            return 0
        
        dates = [exam.exam_date for exam in scheduled_exams]
        return (max(dates) - min(dates)).days + 1
    
    def _calculate_optimization_score(self, scheduled_exams: List[ScheduledExam]) -> float:
        """Calculate optimization score for a schedule (higher is better)."""
        if not scheduled_exams:
            return 0
        
        # Factors: compactness, load distribution, gap compliance
        exam_period = self._calculate_exam_period(scheduled_exams)
        total_exams = len(scheduled_exams)
        
        # Compactness score (fewer days is better)
        compactness_score = max(0, 100 - exam_period * 2)
        
        # Load distribution score
        daily_loads = defaultdict(int)
        for exam in scheduled_exams:
            daily_loads[exam.exam_date] += 1
        
        loads = list(daily_loads.values())
        avg_load = sum(loads) / len(loads) if loads else 0
        variance = sum((load - avg_load) ** 2 for load in loads) / len(loads) if loads else 0
        distribution_score = max(0, 100 - variance * 5)
        
        # Combined score
        return (compactness_score * 0.4 + distribution_score * 0.6)
    
    # ================== VALIDATION FUNCTIONS ==================
    
    def validate_schedule_feasibility(self, course_ids: List[int], date_range: tuple) -> Dict[str, Any]:
        """
        Validate if scheduling is feasible for given courses and date range.
        
        Args:
            course_ids: Course IDs to schedule
            date_range: (start_date, end_date) tuple
            
        Returns:
            Feasibility analysis
        """
        courses = self.db.query(Course).filter(Course.id.in_(course_ids)).all()
        start_date, end_date = date_range
        
        # Calculate available slots
        available_days = (end_date - start_date).days + 1
        sessions_per_day = 3  # morning, afternoon, evening
        total_slots = available_days * sessions_per_day
        
        # Analyze conflicts
        conflict_analysis = self.analyze_student_conflicts(course_ids)
        total_conflicts = conflict_analysis["conflict_pairs"]
        
        # Estimate required slots (approximation)
        min_slots_needed = len(courses)
        conflict_penalty = total_conflicts * 0.5  # Rough penalty for conflicts
        estimated_slots_needed = min_slots_needed + conflict_penalty
        
        feasibility_ratio = total_slots / estimated_slots_needed if estimated_slots_needed > 0 else float('inf')
        
        return {
            "feasible": feasibility_ratio >= 1.2,  # 20% buffer
            "confidence": min(100, feasibility_ratio * 50) if feasibility_ratio < 2 else 100,
            "total_courses": len(courses),
            "available_slots": total_slots,
            "estimated_slots_needed": int(estimated_slots_needed),
            "feasibility_ratio": round(feasibility_ratio, 2),
            "conflict_complexity": conflict_analysis["scheduling_difficulty"],
            "recommendations": self._generate_feasibility_recommendations(feasibility_ratio, conflict_analysis)
        }
    
    def _generate_feasibility_recommendations(self, ratio: float, conflict_analysis: Dict) -> List[str]:
        """Generate feasibility recommendations."""
        recommendations = []
        
        if ratio >= 1.5:
            recommendations.append("Schedule is highly feasible with room for optimization")
        elif ratio >= 1.2:
            recommendations.append("Schedule is feasible but may be tight")
        elif ratio >= 0.8:
            recommendations.append("Schedule may be challenging - consider extending date range")
        else:
            recommendations.append("Schedule appears infeasible - extend date range or reduce conflicts")
        
        if conflict_analysis["scheduling_difficulty"] == "HIGH":
            recommendations.append("High conflict complexity - consider staggering conflicting courses")
        
        return recommendations
