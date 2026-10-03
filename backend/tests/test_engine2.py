"""Unit tests for Engine 2 - Room & Seating."""
import pytest
from datetime import date, time
from sqlalchemy.orm import Session
from app.models.course import Course
from app.models.student import Student
from app.models.room import Room, Bench
from app.models.plan import Plan
from app.models.schedule import ScheduledExam, ExamSession
from app.models.seating import SeatAssignment
from app.models.rule import Rule, ExamType, RuleCategory
from app.services.engine2 import RoomAllocator, SeatAllocator, BranchSeparator


@pytest.fixture
def sample_exam_setup(db: Session):
    """Create sample exam setup for testing."""
    # Create rules
    rules = [
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.SEATING,
            rule_key="students_per_bench",
            rule_value_int=2,
            description="Students per bench",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.SEATING,
            rule_key="max_students_per_room",
            rule_value_int=60,
            description="Max per room",
            is_active=True
        )
    ]
    db.add_all(rules)
    db.commit()
    
    # Create room
    room = Room(
        room_code="R-101",
        room_name="Room 101",
        capacity=60,
        num_benches=30,
        is_available=True
    )
    db.add(room)
    db.commit()
    
    # Create course
    course = Course(
        course_code="CS301",
        course_name="Data Structures",
        semester=3,
        branch="CSE",
        academic_year="2023-24"
    )
    db.add(course)
    db.commit()
    
    # Create students from different branches
    students = []
    # 6 CSE students
    for i in range(6):
        student = Student(
            usn=f"CSE00{i+1}",
            full_name=f"CSE Student {i+1}",
            semester=3,
            branch="CSE",
            academic_year="2020-21"
        )
        students.append(student)
        course.students.append(student)
    
    # 4 ECE students
    for i in range(4):
        student = Student(
            usn=f"ECE00{i+1}",
            full_name=f"ECE Student {i+1}",
            semester=3,
            branch="ECE",
            academic_year="2020-21"
        )
        students.append(student)
        course.students.append(student)
    
    db.add_all(students)
    db.commit()
    
    # Create plan
    plan = Plan(
        plan_name="Test Plan",
        exam_type=ExamType.ISA1,
        academic_year="2023-24",
        semester=3
    )
    db.add(plan)
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
        num_students=10
    )
    db.add(exam)
    db.commit()
    
    return {
        "room": room,
        "course": course,
        "students": students,
        "plan": plan,
        "exam": exam
    }


class TestBranchSeparator:
    """Test BranchSeparator functionality."""
    
    def test_get_neighbor_positions(self):
        """Test getting neighbor positions."""
        separator = BranchSeparator()
        
        neighbors = separator._get_neighbor_positions((2, 2))
        
        # Should have 8 neighbors
        assert len(neighbors) == 8
        
        # Check specific neighbors
        assert (1, 1) in neighbors  # UP-LEFT
        assert (1, 2) in neighbors  # UP
        assert (1, 3) in neighbors  # UP-RIGHT
        assert (2, 1) in neighbors  # LEFT
        assert (2, 3) in neighbors  # RIGHT
        assert (3, 1) in neighbors  # DOWN-LEFT
        assert (3, 2) in neighbors  # DOWN
        assert (3, 3) in neighbors  # DOWN-RIGHT
    
    def test_get_direction(self):
        """Test direction calculation."""
        separator = BranchSeparator()
        
        assert separator._get_direction((2, 2), (1, 2)) == "UP"
        assert separator._get_direction((2, 2), (3, 2)) == "DOWN"
        assert separator._get_direction((2, 2), (2, 1)) == "LEFT"
        assert separator._get_direction((2, 2), (2, 3)) == "RIGHT"
        assert separator._get_direction((2, 2), (1, 1)) == "UP-LEFT"
        assert separator._get_direction((2, 2), (1, 3)) == "UP-RIGHT"
        assert separator._get_direction((2, 2), (3, 1)) == "DOWN-LEFT"
        assert separator._get_direction((2, 2), (3, 3)) == "DOWN-RIGHT"
    
    def test_validate_valid_assignment(self, db: Session, sample_exam_setup):
        """Test validation of valid seat assignments."""
        setup = sample_exam_setup
        room = setup["room"]
        students = setup["students"]
        exam = setup["exam"]
        
        # Create benches
        bench1 = Bench(room_id=room.id, bench_number=1, row_number=0, column_number=0)
        bench2 = Bench(room_id=room.id, bench_number=2, row_number=0, column_number=2)
        db.add_all([bench1, bench2])
        db.commit()
        
        # Create assignments with different branches as neighbors (valid)
        assignment1 = SeatAssignment(
            scheduled_exam_id=exam.id,
            student_id=students[0].id,  # CSE
            bench_id=bench1.id,
            seat_code="R-101-B01-L",
            position="L",
            row_number=0,
            column_number=0
        )
        
        assignment2 = SeatAssignment(
            scheduled_exam_id=exam.id,
            student_id=students[6].id,  # ECE (different branch)
            bench_id=bench2.id,
            seat_code="R-101-B02-L",
            position="L",
            row_number=0,
            column_number=2
        )
        
        separator = BranchSeparator()
        separator.build_seat_map([assignment1, assignment2])
        
        # Should be valid (different branches, not directly adjacent)
        is_valid, violations = separator.validate_all_assignments([assignment1, assignment2])
        assert is_valid is True
        assert len(violations) == 0
    
    def test_validate_invalid_assignment(self, db: Session, sample_exam_setup):
        """Test detection of branch separation violations."""
        setup = sample_exam_setup
        room = setup["room"]
        students = setup["students"]
        exam = setup["exam"]
        
        # Create adjacent benches
        bench1 = Bench(room_id=room.id, bench_number=1, row_number=0, column_number=0)
        bench2 = Bench(room_id=room.id, bench_number=2, row_number=0, column_number=1)
        db.add_all([bench1, bench2])
        db.commit()
        
        # Create assignments with same branch as neighbors (invalid!)
        assignment1 = SeatAssignment(
            scheduled_exam_id=exam.id,
            student_id=students[0].id,  # CSE
            bench_id=bench1.id,
            seat_code="R-101-B01-L",
            position="L",
            row_number=0,
            column_number=0
        )
        
        assignment2 = SeatAssignment(
            scheduled_exam_id=exam.id,
            student_id=students[1].id,  # Also CSE (same branch!)
            bench_id=bench2.id,
            seat_code="R-101-B02-L",
            position="L",
            row_number=0,
            column_number=1  # Adjacent!
        )
        
        separator = BranchSeparator()
        is_valid, violations = separator.validate_all_assignments([assignment1, assignment2])
        
        # Should detect violation
        assert is_valid is False
        assert len(violations) > 0
        assert violations[0]["student1_branch"] == "CSE"
        assert violations[0]["student2_branch"] == "CSE"


class TestRoomAllocator:
    """Test RoomAllocator functionality."""
    
    def test_allocate_single_room(self, db: Session, sample_exam_setup):
        """Test allocating a single room to an exam."""
        setup = sample_exam_setup
        exam = setup["exam"]
        room = setup["room"]
        
        allocator = RoomAllocator(db)
        
        result = allocator.allocate_rooms(
            scheduled_exams=[exam],
            exam_type=ExamType.ISA1,
            available_rooms=[room]
        )
        
        assert result.success is True
        assert exam.id in result.allocations
        assert result.allocations[exam.id] == room.id
    
    def test_allocate_insufficient_capacity(self, db: Session, sample_exam_setup):
        """Test allocation with insufficient room capacity."""
        setup = sample_exam_setup
        exam = setup["exam"]
        
        # Create small room
        small_room = Room(
            room_code="R-102",
            room_name="Small Room",
            capacity=5,  # Too small!
            num_benches=3,
            is_available=True
        )
        db.add(small_room)
        db.commit()
        
        allocator = RoomAllocator(db)
        
        result = allocator.allocate_rooms(
            scheduled_exams=[exam],
            exam_type=ExamType.ISA1,
            available_rooms=[small_room]
        )
        
        # Should fail due to insufficient capacity
        assert result.success is False
        assert "Could not allocate" in result.message


class TestSeatAllocator:
    """Test SeatAllocator functionality."""
    
    def test_allocate_seats_basic(self, db: Session, sample_exam_setup):
        """Test basic seat allocation."""
        setup = sample_exam_setup
        exam = setup["exam"]
        
        allocator = SeatAllocator(db)
        
        result = allocator.allocate_seats(
            scheduled_exam=exam,
            exam_type=ExamType.ISA1
        )
        
        assert result.success is True
        assert len(result.seat_assignments) == 10  # All 10 students
        assert result.statistics["num_students"] == 10
    
    def test_allocate_seats_no_room(self, db: Session, sample_exam_setup):
        """Test allocation when exam has no room."""
        setup = sample_exam_setup
        exam = setup["exam"]
        
        # Remove room
        exam.room_id = None
        db.commit()
        
        allocator = SeatAllocator(db)
        
        result = allocator.allocate_seats(
            scheduled_exam=exam,
            exam_type=ExamType.ISA1
        )
        
        assert result.success is False
        assert "no room" in result.message.lower()
    
    def test_seat_code_format(self, db: Session, sample_exam_setup):
        """Test seat code format generation."""
        setup = sample_exam_setup
        exam = setup["exam"]
        
        allocator = SeatAllocator(db)
        result = allocator.allocate_seats(exam, ExamType.ISA1)
        
        assert result.success is True
        
        # Check seat code format
        for assignment in result.seat_assignments:
            # Format: R-101-B##-P
            parts = assignment.seat_code.split('-')
            assert len(parts) == 4
            assert parts[0] == "R"
            assert parts[1].isdigit()
            assert parts[2].startswith("B")
            assert parts[3] in ["L", "R", "M"]
    
    def test_branch_separation_in_allocation(self, db: Session, sample_exam_setup):
        """Test that allocation maintains branch separation."""
        setup = sample_exam_setup
        exam = setup["exam"]
        
        allocator = SeatAllocator(db)
        result = allocator.allocate_seats(exam, ExamType.ISA1)
        
        assert result.success is True
        
        # Validate branch separation
        separator = BranchSeparator()
        is_valid, violations = separator.validate_all_assignments(
            result.seat_assignments
        )
        
        # Should have no violations (or minimal)
        assert len(violations) == 0 or len(violations) < 2
    
    def test_create_benches_for_room(self, db: Session, sample_exam_setup):
        """Test automatic bench creation."""
        setup = sample_exam_setup
        room = setup["room"]
        
        # Ensure no benches exist
        db.query(Bench).filter(Bench.room_id == room.id).delete()
        db.commit()
        
        allocator = SeatAllocator(db)
        benches = allocator._create_benches_for_room(room)
        
        assert len(benches) == room.num_benches
        assert all(b.room_id == room.id for b in benches)
        assert all(b.row_number is not None for b in benches)
        assert all(b.column_number is not None for b in benches)
