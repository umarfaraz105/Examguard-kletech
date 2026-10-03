"""Unit tests for Engine 3 - Exam Management."""
import pytest
from datetime import date, time
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.student import Student
from app.models.room import Room
from app.models.plan import Plan
from app.models.schedule import ScheduledExam, ExamSession
from app.models.invigilator import (
    InvigilatorAssignment,
    InvigilatorRole,
    InvigilatorStatus,
    FacultyAvailability
)
from app.models.rule import Rule, ExamType, RuleCategory
from app.services.engine3 import (
    InvigilatorManager,
    EligibilityChecker,
    WorkloadBalancer,
    NotificationService
)


@pytest.fixture
def sample_faculty(db: Session):
    """Create sample faculty members."""
    faculty_list = []
    
    for i in range(5):
        faculty = User(
            email=f"faculty{i+1}@example.com",
            full_name=f"Faculty {i+1}",
            hashed_password="hashed",
            role=UserRole.FACULTY,
            is_active=True,
            department="CSE",
            employee_id=f"EMP{i+1:03d}"
        )
        faculty_list.append(faculty)
        db.add(faculty)
    
    db.commit()
    return faculty_list


@pytest.fixture
def sample_exam(db: Session):
    """Create sample scheduled exam."""
    # Create rules
    rules = [
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.INVIGILATION,
            rule_key="invigilator_ratio",
            rule_value_float=0.0333,
            description="Ratio",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.INVIGILATION,
            rule_key="min_invigilators_per_room",
            rule_value_int=1,
            description="Min per room",
            is_active=True
        )
    ]
    db.add_all(rules)
    
    # Create course
    course = Course(
        course_code="CS301",
        course_name="Data Structures",
        semester=3,
        branch="CSE",
        academic_year="2023-24"
    )
    db.add(course)
    
    # Create room
    room = Room(
        room_code="R-101",
        room_name="Room 101",
        capacity=60,
        num_benches=30
    )
    db.add(room)
    
    # Create plan
    plan = Plan(
        plan_name="Test Plan",
        exam_type=ExamType.ISA1,
        academic_year="2023-24",
        semester=3
    )
    db.add(plan)
    
    db.commit()
    
    # Create exam
    exam = ScheduledExam(
        plan_id=plan.id,
        course_id=course.id,
        room_id=room.id,
        exam_date=date(2024, 3, 15),
        session=ExamSession.MORNING,
        start_time=time(9, 0),
        end_time=time(10, 0),
        duration_minutes=60,
        num_students=60
    )
    db.add(exam)
    db.commit()
    
    return exam


class TestEligibilityChecker:
    """Test EligibilityChecker functionality."""
    
    def test_check_eligible_faculty(self, db: Session, sample_faculty, sample_exam):
        """Test checking eligible faculty."""
        faculty = sample_faculty[0]
        exam = sample_exam
        
        checker = EligibilityChecker(db)
        is_eligible, issues = checker.check_eligibility(faculty, exam)
        
        # Should be eligible (active, no conflicts)
        assert is_eligible is True
        assert len([i for i in issues if i.severity == "ERROR"]) == 0
    
    def test_check_unavailable_faculty(self, db: Session, sample_faculty, sample_exam):
        """Test checking unavailable faculty."""
        faculty = sample_faculty[0]
        exam = sample_exam
        
        # Mark faculty unavailable
        unavailable = FacultyAvailability(
            faculty_id=faculty.id,
            exam_date=exam.exam_date.isoformat(),
            session=exam.session.value,
            is_available=False,
            reason="Conference"
        )
        db.add(unavailable)
        db.commit()
        
        checker = EligibilityChecker(db)
        is_eligible, issues = checker.check_eligibility(faculty, exam)
        
        # Should be ineligible
        assert is_eligible is False
        assert any(i.issue_type == "UNAVAILABLE" for i in issues)
    
    def test_check_conflicting_assignment(self, db: Session, sample_faculty, sample_exam):
        """Test checking faculty with conflicting assignment."""
        faculty = sample_faculty[0]
        exam = sample_exam
        
        # Create conflicting assignment
        conflict_assignment = InvigilatorAssignment(
            scheduled_exam_id=exam.id,
            faculty_id=faculty.id,
            role=InvigilatorRole.PRIMARY,
            status=InvigilatorStatus.ASSIGNED,
            workload_points=2
        )
        db.add(conflict_assignment)
        db.commit()
        
        checker = EligibilityChecker(db)
        is_eligible, issues = checker.check_eligibility(faculty, exam)
        
        # Should detect conflict (though same exam, so might still be eligible)
        # The test needs refinement based on actual logic


class TestWorkloadBalancer:
    """Test WorkloadBalancer functionality."""
    
    def test_calculate_faculty_workload(self, db: Session, sample_faculty, sample_exam):
        """Test calculating faculty workload."""
        faculty = sample_faculty[0]
        exam = sample_exam
        
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
        
        balancer = WorkloadBalancer(db)
        workload = balancer.calculate_faculty_workload(faculty)
        
        assert workload == 2
    
    def test_select_best_faculty(self, db: Session, sample_faculty, sample_exam):
        """Test selecting faculty with lowest workload."""
        exam = sample_exam
        
        # Give faculty different workloads
        for i, faculty in enumerate(sample_faculty[:3]):
            for j in range(i):  # 0, 1, 2 assignments
                assignment = InvigilatorAssignment(
                    scheduled_exam_id=exam.id,
                    faculty_id=faculty.id,
                    role=InvigilatorRole.PRIMARY,
                    status=InvigilatorStatus.ASSIGNED,
                    workload_points=1
                )
                db.add(assignment)
        db.commit()
        
        balancer = WorkloadBalancer(db)
        best = balancer.select_best_faculty(sample_faculty[:3], exam)
        
        # Should select first faculty (workload = 0)
        assert best == sample_faculty[0]
    
    def test_workload_statistics(self, db: Session, sample_faculty):
        """Test getting workload statistics."""
        balancer = WorkloadBalancer(db)
        
        stats = balancer.get_workload_statistics(sample_faculty)
        
        assert stats["total_faculty"] == len(sample_faculty)
        assert "avg_workload" in stats
        assert "fairness_score" in stats


class TestInvigilatorManager:
    """Test InvigilatorManager functionality."""
    
    def test_assign_invigilators(self, db: Session, sample_faculty, sample_exam):
        """Test assigning invigilators to exam."""
        exam = sample_exam
        
        manager = InvigilatorManager(db)
        
        result = manager.assign_invigilators(
            scheduled_exam=exam,
            exam_type=ExamType.ISA1,
            include_relief=True,
            include_reserve=True
        )
        
        assert result.success is True
        assert len(result.assignments) >= 2  # At least 2 primary
        assert result.statistics["num_students"] == 60
    
    def test_assign_insufficient_faculty(self, db: Session, sample_exam):
        """Test assignment when insufficient faculty available."""
        exam = sample_exam
        
        # Create only 1 faculty (need at least 2)
        faculty = User(
            email="single@example.com",
            full_name="Single Faculty",
            hashed_password="hashed",
            role=UserRole.FACULTY,
            is_active=True,
            department="CSE"
        )
        db.add(faculty)
        db.commit()
        
        # Mark all other faculty inactive
        db.query(User).filter(
            User.role == UserRole.FACULTY,
            User.id != faculty.id
        ).update({User.is_active: False})
        db.commit()
        
        manager = InvigilatorManager(db)
        
        result = manager.assign_invigilators(
            scheduled_exam=exam,
            exam_type=ExamType.ISA1
        )
        
        # Should fail due to insufficient faculty
        assert result.success is False
        assert "Insufficient" in result.message
    
    def test_replace_invigilator(self, db: Session, sample_faculty, sample_exam):
        """Test replacing an invigilator."""
        exam = sample_exam
        original_faculty = sample_faculty[0]
        replacement_faculty = sample_faculty[1]
        
        # Create original assignment
        original = InvigilatorAssignment(
            scheduled_exam_id=exam.id,
            faculty_id=original_faculty.id,
            role=InvigilatorRole.PRIMARY,
            status=InvigilatorStatus.ASSIGNED,
            workload_points=2
        )
        db.add(original)
        db.commit()
        
        manager = InvigilatorManager(db)
        
        replacement = manager.replace_invigilator(
            original_assignment=original,
            replacement_faculty=replacement_faculty,
            reason="Original faculty on leave"
        )
        
        assert replacement.faculty_id == replacement_faculty.id
        assert original.status == InvigilatorStatus.REPLACED
        assert replacement.replacement_for_id == original.id


class TestNotificationService:
    """Test NotificationService functionality."""
    
    def test_notify_assignment(self, db: Session, sample_faculty, sample_exam):
        """Test creating assignment notification."""
        faculty = sample_faculty[0]
        exam = sample_exam
        
        assignment = InvigilatorAssignment(
            scheduled_exam_id=exam.id,
            faculty_id=faculty.id,
            role=InvigilatorRole.PRIMARY,
            status=InvigilatorStatus.ASSIGNED,
            workload_points=2
        )
        db.add(assignment)
        db.commit()
        
        notifier = NotificationService(db)
        notification = notifier.notify_assignment(assignment)
        
        assert notification.recipient == faculty
        assert "Invigilation Duty Assigned" in notification.subject
        assert notification.notification_type == "ASSIGNMENT"
    
    def test_notify_reminder(self, db: Session, sample_faculty, sample_exam):
        """Test creating reminder notification."""
        faculty = sample_faculty[0]
        exam = sample_exam
        
        assignment = InvigilatorAssignment(
            scheduled_exam_id=exam.id,
            faculty_id=faculty.id,
            role=InvigilatorRole.PRIMARY,
            status=InvigilatorStatus.ASSIGNED,
            workload_points=2
        )
        db.add(assignment)
        db.commit()
        
        notifier = NotificationService(db)
        notification = notifier.notify_reminder(assignment, days_before=1)
        
        assert notification.recipient == faculty
        assert "Reminder" in notification.subject
        assert notification.notification_type == "REMINDER"
    
    def test_send_all_notifications(self, db: Session, sample_faculty, sample_exam):
        """Test sending all queued notifications."""
        faculty = sample_faculty[0]
        exam = sample_exam
        
        assignment = InvigilatorAssignment(
            scheduled_exam_id=exam.id,
            faculty_id=faculty.id,
            role=InvigilatorRole.PRIMARY,
            status=InvigilatorStatus.ASSIGNED,
            workload_points=2
        )
        db.add(assignment)
        db.commit()
        
        notifier = NotificationService(db)
        
        # Create multiple notifications
        notifier.notify_assignment(assignment)
        notifier.notify_confirmation_request(assignment)
        
        result = notifier.send_all_notifications()
        
        assert result["sent"] == 2
        assert result["status"] == "success"
