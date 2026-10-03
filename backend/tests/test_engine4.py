"""Unit tests for Engine 4 - Validation & Reporting."""
import pytest
from datetime import date, time
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.student import Student
from app.models.room import Room
from app.models.plan import Plan
from app.models.schedule import ScheduledExam, ExamSession
from app.models.seating import SeatAssignment
from app.models.invigilator import InvigilatorAssignment, InvigilatorRole
from app.models.rule import Rule, ExamType, RuleCategory
from app.services.engine4 import (
    PlanValidator,
    ComplianceScorer,
    ConflictDashboard,
    ReportGenerator
)


@pytest.fixture
def valid_plan_setup(db: Session):
    """Create a valid plan setup."""
    # Rules
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
            description="Gap",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.SEATING,
            rule_key="students_per_bench",
            rule_value_int=2,
            description="Per bench",
            is_active=True
        ),
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
            description="Min",
            is_active=True
        )
    ]
    db.add_all(rules)
    
    # Create plan
    plan = Plan(
        plan_name="Valid Plan",
        exam_type=ExamType.ISA1,
        academic_year="2023-24",
        semester=3
    )
    db.add(plan)
    db.commit()
    
    return plan


class TestPlanValidator:
    """Test PlanValidator functionality."""
    
    def test_validate_empty_plan(self, db: Session, valid_plan_setup):
        """Test validating empty plan."""
        plan = valid_plan_setup
        
        validator = PlanValidator(db)
        is_valid, issues = validator.validate_plan(plan)
        
        # Should be invalid (no exams)
        assert is_valid is False
        assert any(i.rule_name == "PLAN_COMPLETENESS" for i in issues)
    
    def test_validate_with_exams(self, db: Session, valid_plan_setup):
        """Test validating plan with exams."""
        plan = valid_plan_setup
        
        # Create course and room
        course = Course(
            course_code="CS301",
            course_name="Data Structures",
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
        db.add_all([course, room])
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
            num_students=30
        )
        db.add(exam)
        db.commit()
        
        validator = PlanValidator(db)
        is_valid, issues = validator.validate_plan(plan)
        
        # Will have issues (no seats, no invigilators) but not empty
        assert len(issues) > 0


class TestComplianceScorer:
    """Test ComplianceScorer functionality."""
    
    def test_calculate_score(self, db: Session, valid_plan_setup):
        """Test calculating compliance score."""
        plan = valid_plan_setup
        
        scorer = ComplianceScorer(db)
        score_data = scorer.calculate_score(plan)
        
        assert "score" in score_data
        assert "grade" in score_data
        assert "compliance_level" in score_data
        assert 0 <= score_data["score"] <= 100
    
    def test_score_with_issues(self, db: Session, valid_plan_setup):
        """Test score decreases with issues."""
        plan = valid_plan_setup
        
        # Empty plan will have issues
        scorer = ComplianceScorer(db)
        score_data = scorer.calculate_score(plan)
        
        # Score should be less than 100 due to issues
        assert score_data["score"] < 100
        assert score_data["total_issues"] > 0


class TestConflictDashboard:
    """Test ConflictDashboard functionality."""
    
    def test_generate_dashboard(self, db: Session, valid_plan_setup):
        """Test generating dashboard data."""
        plan = valid_plan_setup
        
        dashboard = ConflictDashboard(db)
        data = dashboard.generate_dashboard(plan)
        
        assert "overview" in data
        assert "by_severity" in data
        assert "by_rule" in data
        assert "hot_spots" in data
        assert data["overview"]["plan_name"] == plan.plan_name


class TestReportGenerator:
    """Test ReportGenerator functionality."""
    
    def test_generate_json_report(self, db: Session, valid_plan_setup):
        """Test generating JSON report."""
        plan = valid_plan_setup
        
        generator = ReportGenerator(db)
        json_data = generator.generate_json_report(plan)
        
        assert "report_generated" in json_data
        assert "plan" in json_data
        assert "compliance" in json_data
        assert json_data["plan"]["id"] == plan.id
    
    def test_generate_pdf_report(self, db: Session, valid_plan_setup):
        """Test generating PDF report."""
        plan = valid_plan_setup
        
        generator = ReportGenerator(db)
        pdf_buffer = generator.generate_compliance_report_pdf(plan)
        
        # Check buffer has content
        assert pdf_buffer.tell() == 0  # At start
        content = pdf_buffer.read()
        assert len(content) > 0
        assert content.startswith(b'%PDF')  # PDF signature
    
    def test_generate_excel_schedule(self, db: Session, valid_plan_setup):
        """Test generating Excel schedule."""
        plan = valid_plan_setup
        
        generator = ReportGenerator(db)
        excel_buffer = generator.generate_exam_schedule_excel(plan)
        
        # Check buffer has content
        assert excel_buffer.tell() == 0
        content = excel_buffer.read()
        assert len(content) > 0
