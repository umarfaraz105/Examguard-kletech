"""Unit tests for database models."""
import pytest
from datetime import date, time
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.student import Student
from app.models.room import Room, Bench
from app.models.plan import Plan, PlanStatus
from app.models.schedule import ScheduledExam, ExamSession
from app.models.seating import SeatAssignment
from app.models.invigilator import InvigilatorAssignment, InvigilatorRole, InvigilatorStatus
from app.models.audit_log import AuditLog, AuditAction, AuditEntity
from app.models.rule import ExamType


class TestUserModel:
    """Test User model."""
    
    def test_create_user(self, db: Session):
        """Test creating a user."""
        user = User(
            email="test@example.com",
            full_name="Test User",
            hashed_password="hashed_pwd",
            role=UserRole.FACULTY,
            department="CSE",
            employee_id="EMP001"
        )
        db.add(user)
        db.commit()
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.role == UserRole.FACULTY
        assert user.is_active is True
    
    def test_user_role_properties(self, db: Session):
        """Test user role check properties."""
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password="pwd",
            role=UserRole.ADMIN
        )
        
        assert admin.is_admin is True
        assert admin.is_exam_cell is True
        assert admin.can_manage_plans is True
        assert admin.can_approve_plans is True
        
        faculty = User(
            email="faculty@example.com",
            full_name="Faculty",
            hashed_password="pwd",
            role=UserRole.FACULTY
        )
        
        assert faculty.is_admin is False
        assert faculty.can_manage_plans is False


class TestCourseModel:
    """Test Course model."""
    
    def test_create_course(self, db: Session):
        """Test creating a course."""
        course = Course(
            course_code="CS101",
            course_name="Introduction to Programming",
            semester=1,
            branch="CSE",
            credits=4,
            academic_year="2023-24"
        )
        db.add(course)
        db.commit()
        
        assert course.id is not None
        assert course.course_code == "CS101"
        assert course.full_code == "CS101"
    
    def test_course_with_section(self, db: Session):
        """Test course with section."""
        course = Course(
            course_code="CS101",
            course_name="Introduction to Programming",
            semester=1,
            branch="CSE",
            credits=4,
            section="A",
            academic_year="2023-24"
        )
        db.add(course)
        db.commit()
        
        assert course.full_code == "CS101-A"


class TestStudentModel:
    """Test Student model."""
    
    def test_create_student(self, db: Session):
        """Test creating a student."""
        student = Student(
            usn="1KT20CS001",
            full_name="John Doe",
            semester=3,
            branch="CSE",
            section="A",
            email="john@example.com",
            attendance_percentage=85.5,
            academic_year="2020-21"
        )
        db.add(student)
        db.commit()
        
        assert student.id is not None
        assert student.usn == "1KT20CS001"
        assert student.is_eligible is True
        assert student.display_name == "John Doe (1KT20CS001)"
    
    def test_student_eligibility(self, db: Session):
        """Test student eligibility check."""
        # Eligible student
        eligible = Student(
            usn="USN001",
            full_name="Eligible Student",
            semester=1,
            branch="CSE",
            attendance_percentage=80.0,
            academic_year="2023-24"
        )
        assert eligible.is_eligible is True
        
        # Ineligible student
        ineligible = Student(
            usn="USN002",
            full_name="Ineligible Student",
            semester=1,
            branch="CSE",
            attendance_percentage=60.0,
            academic_year="2023-24"
        )
        assert ineligible.is_eligible is False


class TestRoomModels:
    """Test Room and Bench models."""
    
    def test_create_room(self, db: Session):
        """Test creating a room."""
        room = Room(
            room_code="R-101",
            room_name="Room 101",
            building="Main Block",
            floor=1,
            capacity=60,
            num_benches=30,
            room_type="CLASSROOM"
        )
        db.add(room)
        db.commit()
        
        assert room.id is not None
        assert room.room_code == "R-101"
        assert room.max_students_per_bench == 2
    
    def test_create_bench(self, db: Session):
        """Test creating a bench."""
        room = Room(
            room_code="R-101",
            room_name="Room 101",
            capacity=60,
            num_benches=30
        )
        db.add(room)
        db.commit()
        
        bench = Bench(
            room_id=room.id,
            bench_number=1,
            row_number=1,
            column_number=1
        )
        db.add(bench)
        db.commit()
        
        assert bench.id is not None
        assert bench.get_seat_code("L") == "R-101-B01-L"
        assert bench.get_seat_code("R") == "R-101-B01-R"


class TestPlanModel:
    """Test Plan model."""
    
    def test_create_plan(self, db: Session):
        """Test creating an exam plan."""
        user = User(
            email="creator@example.com",
            full_name="Creator",
            hashed_password="pwd",
            role=UserRole.EXAM_CELL
        )
        db.add(user)
        db.commit()
        
        plan = Plan(
            plan_name="ISA-1 Sem 3 Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3,
            version=1,
            created_by_id=user.id
        )
        db.add(plan)
        db.commit()
        
        assert plan.id is not None
        assert plan.status == PlanStatus.DRAFT
        assert plan.is_editable is True
        assert plan.can_be_published is False
        assert plan.is_active is False
    
    def test_plan_workflow(self, db: Session):
        """Test plan status workflow."""
        plan = Plan(
            plan_name="Test Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3
        )
        
        # Draft - editable, not publishable
        assert plan.status == PlanStatus.DRAFT
        assert plan.is_editable is True
        assert plan.can_be_published is False
        
        # Approved - not editable, can be published
        plan.status = PlanStatus.APPROVED
        assert plan.is_editable is False
        assert plan.can_be_published is True
        
        # Published - active
        plan.status = PlanStatus.PUBLISHED
        assert plan.is_active is True


class TestScheduledExamModel:
    """Test ScheduledExam model."""
    
    def test_create_scheduled_exam(self, db: Session):
        """Test creating a scheduled exam."""
        # Create dependencies
        plan = Plan(
            plan_name="Test Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3
        )
        course = Course(
            course_code="CS101",
            course_name="Programming",
            semester=3,
            branch="CSE",
            academic_year="2023-24"
        )
        room = Room(
            room_code="R-101",
            room_name="Room 101",
            capacity=60,
            num_benches=30
        )
        db.add_all([plan, course, room])
        db.commit()
        
        # Create scheduled exam
        exam = ScheduledExam(
            plan_id=plan.id,
            course_id=course.id,
            room_id=room.id,
            exam_date=date(2024, 3, 15),
            session=ExamSession.MORNING,
            start_time=time(9, 0),
            end_time=time(10, 0),
            duration_minutes=60,
            num_students=50
        )
        db.add(exam)
        db.commit()
        
        assert exam.id is not None
        assert exam.is_room_assigned is True
        assert exam.has_seating is False
        assert exam.has_invigilators is False


class TestSeatAssignmentModel:
    """Test SeatAssignment model."""
    
    def test_create_seat_assignment(self, db: Session):
        """Test creating a seat assignment."""
        # Create dependencies
        student = Student(
            usn="1KT20CS001",
            full_name="Student",
            semester=3,
            branch="CSE",
            academic_year="2020-21"
        )
        room = Room(
            room_code="R-101",
            room_name="Room 101",
            capacity=60,
            num_benches=30
        )
        db.add_all([student, room])
        db.commit()
        
        bench = Bench(
            room_id=room.id,
            bench_number=4,
            row_number=2,
            column_number=1
        )
        db.add(bench)
        db.commit()
        
        plan = Plan(
            plan_name="Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3
        )
        course = Course(
            course_code="CS101",
            course_name="Programming",
            semester=3,
            branch="CSE",
            academic_year="2023-24"
        )
        db.add_all([plan, course])
        db.commit()
        
        exam = ScheduledExam(
            plan_id=plan.id,
            course_id=course.id,
            room_id=room.id,
            exam_date=date(2024, 3, 15),
            session=ExamSession.MORNING,
            start_time=time(9, 0),
            end_time=time(10, 0),
            duration_minutes=60,
            num_students=50
        )
        db.add(exam)
        db.commit()
        
        # Create seat assignment
        seat = SeatAssignment(
            scheduled_exam_id=exam.id,
            student_id=student.id,
            bench_id=bench.id,
            seat_code="R-101-B04-L",
            position="L",
            row_number=2,
            column_number=1
        )
        db.add(seat)
        db.commit()
        
        assert seat.id is not None
        assert seat.room_code == "R-101"
        assert seat.bench_number == 4
        assert len(seat.get_neighbor_positions()) == 8


class TestInvigilatorModels:
    """Test Invigilator models."""
    
    def test_create_invigilator_assignment(self, db: Session):
        """Test creating an invigilator assignment."""
        # Create faculty
        faculty = User(
            email="faculty@example.com",
            full_name="Faculty Member",
            hashed_password="pwd",
            role=UserRole.FACULTY,
            department="CSE"
        )
        db.add(faculty)
        db.commit()
        
        # Create exam
        plan = Plan(
            plan_name="Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3
        )
        course = Course(
            course_code="CS101",
            course_name="Programming",
            semester=3,
            branch="CSE",
            academic_year="2023-24"
        )
        db.add_all([plan, course])
        db.commit()
        
        exam = ScheduledExam(
            plan_id=plan.id,
            course_id=course.id,
            exam_date=date(2024, 3, 15),
            session=ExamSession.MORNING,
            start_time=time(9, 0),
            end_time=time(10, 0),
            duration_minutes=60,
            num_students=50
        )
        db.add(exam)
        db.commit()
        
        # Create assignment
        assignment = InvigilatorAssignment(
            scheduled_exam_id=exam.id,
            faculty_id=faculty.id,
            role=InvigilatorRole.PRIMARY,
            status=InvigilatorStatus.ASSIGNED,
            workload_points=2
        )
        db.add(assignment)
        db.commit()
        
        assert assignment.id is not None
        assert assignment.is_confirmed is False
        assert assignment.needs_replacement is False
        
        # Confirm assignment
        assignment.status = InvigilatorStatus.CONFIRMED
        assert assignment.is_confirmed is True


class TestAuditLogModel:
    """Test AuditLog model."""
    
    def test_create_audit_log(self, db: Session):
        """Test creating an audit log entry."""
        user = User(
            email="user@example.com",
            full_name="User",
            hashed_password="pwd",
            role=UserRole.EXAM_CELL
        )
        db.add(user)
        db.commit()
        
        log = AuditLog.log_action(
            db=db,
            user_id=user.id,
            action=AuditAction.CREATE,
            entity_type=AuditEntity.PLAN,
            entity_id=1,
            description="Created new exam plan",
            new_values={"name": "ISA-1 Plan", "status": "DRAFT"}
        )
        
        assert log.id is not None
        assert log.user_id == user.id
        assert log.action == AuditAction.CREATE
        assert log.entity_type == AuditEntity.PLAN
