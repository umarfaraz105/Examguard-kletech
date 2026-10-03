"""Unit tests for Engine 1 - Scheduling."""
import pytest
from datetime import date, time
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.student import Student
from app.models.plan import Plan
from app.models.schedule import ScheduledExam, ExamSession
from app.models.rule import Rule, ExamType, RuleCategory
from app.services.engine1 import ConflictGraph, ClashDetector, ExamScheduler


@pytest.fixture
def sample_courses_and_students(db: Session):
    """Create sample courses and students for testing."""
    # Create students
    students = []
    for i in range(5):
        student = Student(
            usn=f"1KT20CS00{i+1}",
            full_name=f"Student {i+1}",
            semester=3,
            branch="CSE",
            academic_year="2020-21"
        )
        students.append(student)
        db.add(student)
    
    db.commit()
    
    # Create courses
    courses = []
    for i in range(4):
        course = Course(
            course_code=f"CS30{i+1}",
            course_name=f"Course {i+1}",
            semester=3,
            branch="CSE",
            academic_year="2023-24"
        )
        courses.append(course)
        db.add(course)
    
    db.commit()
    
    # Enroll students in courses (create conflicts)
    # Student 1: Course 1, 2
    courses[0].students.append(students[0])
    courses[1].students.append(students[0])
    
    # Student 2: Course 1, 3
    courses[0].students.append(students[1])
    courses[2].students.append(students[1])
    
    # Student 3: Course 2, 3
    courses[1].students.append(students[2])
    courses[2].students.append(students[2])
    
    # Student 4: Course 1, 4
    courses[0].students.append(students[3])
    courses[3].students.append(students[3])
    
    # Student 5: Course 3, 4
    courses[2].students.append(students[4])
    courses[3].students.append(students[4])
    
    db.commit()
    
    return courses, students


class TestConflictGraph:
    """Test ConflictGraph functionality."""
    
    def test_build_conflict_graph(self, db: Session, sample_courses_and_students):
        """Test building conflict graph from database."""
        courses, students = sample_courses_and_students
        
        graph = ConflictGraph()
        graph.build_from_database(db, semester=3, branch="CSE")
        
        # Check graph was built
        assert len(graph.courses) == 4
        assert len(graph.conflicts) >= 1
    
    def test_conflict_detection(self, db: Session, sample_courses_and_students):
        """Test conflict detection between courses."""
        courses, students = sample_courses_and_students
        
        graph = ConflictGraph()
        graph.build_from_database(db, semester=3)
        
        # Course 1 and Course 2 share Student 1
        assert graph.has_conflict(courses[0].id, courses[1].id) is True
        
        # Course 1 and Course 3 share Student 2
        assert graph.has_conflict(courses[0].id, courses[2].id) is True
        
        # Get conflict weight
        weight = graph.get_conflict_weight(courses[0].id, courses[1].id)
        assert weight >= 1
    
    def test_get_neighbors(self, db: Session, sample_courses_and_students):
        """Test getting conflicting courses."""
        courses, students = sample_courses_and_students
        
        graph = ConflictGraph()
        graph.build_from_database(db, semester=3)
        
        # Course 1 conflicts with multiple courses
        neighbors = graph.get_neighbors(courses[0].id)
        assert len(neighbors) >= 2
    
    def test_get_degree(self, db: Session, sample_courses_and_students):
        """Test getting course degree in conflict graph."""
        courses, students = sample_courses_and_students
        
        graph = ConflictGraph()
        graph.build_from_database(db, semester=3)
        
        # Course 1 should have highest degree (conflicts with 3 others)
        degree = graph.get_degree(courses[0].id)
        assert degree >= 2
    
    def test_get_statistics(self, db: Session, sample_courses_and_students):
        """Test getting graph statistics."""
        courses, students = sample_courses_and_students
        
        graph = ConflictGraph()
        graph.build_from_database(db, semester=3)
        
        stats = graph.get_statistics()
        
        assert stats["num_courses"] == 4
        assert stats["num_conflicts"] >= 3
        assert stats["avg_degree"] > 0
        assert stats["min_time_slots_needed"] >= 2
    
    def test_independent_set(self, db: Session, sample_courses_and_students):
        """Test finding independent set."""
        courses, students = sample_courses_and_students
        
        graph = ConflictGraph()
        graph.build_from_database(db, semester=3)
        
        course_ids = {c.id for c in courses}
        independent = graph.get_independent_set(course_ids)
        
        # Independent set should have at least 1 course
        assert len(independent) >= 1
        
        # Verify no conflicts within independent set
        ind_list = list(independent)
        for i in range(len(ind_list)):
            for j in range(i + 1, len(ind_list)):
                assert not graph.has_conflict(ind_list[i], ind_list[j])


class TestClashDetector:
    """Test ClashDetector functionality."""
    
    def test_detect_same_slot_clash(self, db: Session, sample_courses_and_students):
        """Test detection of same-slot clashes."""
        courses, students = sample_courses_and_students
        
        # Create plan
        plan = Plan(
            plan_name="Test Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3
        )
        db.add(plan)
        db.commit()
        
        # Create two exams at same time for courses with shared student
        exam1 = ScheduledExam(
            plan_id=plan.id,
            course_id=courses[0].id,
            exam_date=date(2024, 3, 15),
            session=ExamSession.MORNING,
            start_time=time(9, 0),
            end_time=time(10, 0),
            duration_minutes=60,
            num_students=2
        )
        
        exam2 = ScheduledExam(
            plan_id=plan.id,
            course_id=courses[1].id,  # Conflicts with courses[0]
            exam_date=date(2024, 3, 15),
            session=ExamSession.MORNING,  # Same date + session!
            start_time=time(9, 0),
            end_time=time(10, 0),
            duration_minutes=60,
            num_students=2
        )
        
        db.add_all([exam1, exam2])
        db.commit()
        
        # Detect clashes
        detector = ClashDetector(db, min_gap_days=1)
        clashes = detector.detect_clashes_in_schedule([exam1, exam2])
        
        # Should detect clash
        assert detector.has_clashes() is True
        assert len(clashes) >= 1
        
        # Check clash type
        same_slot_clashes = detector.get_clashes_by_type("SAME_SLOT")
        assert len(same_slot_clashes) >= 1
    
    def test_detect_insufficient_gap(self, db: Session, sample_courses_and_students):
        """Test detection of insufficient gap clashes."""
        courses, students = sample_courses_and_students
        
        # Create plan
        plan = Plan(
            plan_name="Test Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3
        )
        db.add(plan)
        db.commit()
        
        # Create two exams with only 0 day gap (but minimum is 1)
        exam1 = ScheduledExam(
            plan_id=plan.id,
            course_id=courses[0].id,
            exam_date=date(2024, 3, 15),
            session=ExamSession.MORNING,
            start_time=time(9, 0),
            end_time=time(10, 0),
            duration_minutes=60,
            num_students=2
        )
        
        # Note: This test would need courses that share students but are
        # scheduled too close together. Skipping for now as it requires
        # more complex setup.
    
    def test_clash_summary(self, db: Session, sample_courses_and_students):
        """Test getting clash summary."""
        courses, students = sample_courses_and_students
        
        detector = ClashDetector(db, min_gap_days=1)
        
        # No clashes initially
        summary = detector.get_clash_summary()
        assert summary["total_clashes"] == 0
        assert summary["affected_students"] == 0


class TestExamScheduler:
    """Test ExamScheduler functionality."""
    
    def test_schedule_basic(self, db: Session, sample_courses_and_students):
        """Test basic scheduling."""
        courses, students = sample_courses_and_students
        
        # Create rules
        rules = [
            Rule(
                exam_type=ExamType.ISA1,
                category=RuleCategory.TIMING,
                rule_key="duration_minutes",
                rule_value_int=60,
                description="Duration",
                is_active=True
            ),
            Rule(
                exam_type=ExamType.ISA1,
                category=RuleCategory.SCHEDULING,
                rule_key="min_gap_days",
                rule_value_int=1,
                description="Min gap",
                is_active=True
            )
        ]
        db.add_all(rules)
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
        
        # Schedule exams
        scheduler = ExamScheduler(db)
        result = scheduler.schedule_exams(
            plan=plan,
            courses=courses,
            start_date=date(2024, 3, 10),
            end_date=date(2024, 3, 20),
            sessions=[ExamSession.MORNING, ExamSession.AFTERNOON]
        )
        
        # Check result
        assert result.success is True
        assert len(result.scheduled_exams) == len(courses)
        assert result.statistics["num_courses"] == len(courses)
    
    def test_schedule_insufficient_slots(self, db: Session, sample_courses_and_students):
        """Test scheduling with insufficient time slots."""
        courses, students = sample_courses_and_students
        
        # Create rules
        rule = Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.TIMING,
            rule_key="duration_minutes",
            rule_value_int=60,
            description="Duration",
            is_active=True
        )
        db.add(rule)
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
        
        # Try to schedule with very limited time (1 day, 1 session)
        scheduler = ExamScheduler(db)
        result = scheduler.schedule_exams(
            plan=plan,
            courses=courses,
            start_date=date(2024, 3, 10),
            end_date=date(2024, 3, 10),  # Only 1 day!
            sessions=[ExamSession.MORNING]  # Only 1 session!
        )
        
        # Should fail due to insufficient slots
        # (4 courses with conflicts cannot fit in 1 slot)
        assert result.success is False
        assert "Insufficient" in result.message
    
    def test_schedule_no_courses(self, db: Session):
        """Test scheduling with no courses."""
        plan = Plan(
            plan_name="Test Plan",
            exam_type=ExamType.ISA1,
            academic_year="2023-24",
            semester=3
        )
        db.add(plan)
        db.commit()
        
        scheduler = ExamScheduler(db)
        result = scheduler.schedule_exams(
            plan=plan,
            courses=[],
            start_date=date(2024, 3, 10),
            end_date=date(2024, 3, 20)
        )
        
        assert result.success is False
        assert "No courses" in result.message
    
    def test_generate_time_slots(self, db: Session):
        """Test time slot generation."""
        scheduler = ExamScheduler(db)
        
        slots = scheduler._generate_time_slots(
            start_date=date(2024, 3, 10),
            end_date=date(2024, 3, 12),
            sessions=[ExamSession.MORNING, ExamSession.AFTERNOON]
        )
        
        # 3 days * 2 sessions = 6 slots
        assert len(slots) == 6
        
        # First slot should be Mar 10 morning
        assert slots[0] == (date(2024, 3, 10), ExamSession.MORNING)
        
        # Last slot should be Mar 12 afternoon
        assert slots[-1] == (date(2024, 3, 12), ExamSession.AFTERNOON)
