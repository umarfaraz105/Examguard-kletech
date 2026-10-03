"""
Seed default exam rules into the database.

This script populates the database with standard rule configurations
for ISA1, ISA2, and ESA exams as per university guidelines.
"""
from sqlalchemy.orm import Session
from app.models.rule import Rule, ExamType, RuleCategory
from app.core.database import SessionLocal


def seed_default_rules(db: Session) -> None:
    """
    Seed database with default exam rules.
    
    Args:
        db: Database session
    """
    rules = [
        # ===== ISA-1 Rules =====
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.TIMING,
            rule_key="duration_minutes",
            rule_value_int=60,
            description="ISA-1 exam duration: 1 hour",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.SEATING,
            rule_key="students_per_bench",
            rule_value_int=2,
            description="ISA-1: 2 students per bench",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.SCHEDULING,
            rule_key="min_gap_days",
            rule_value_int=1,
            description="ISA-1: Minimum 1 day gap between exams for same student",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.INVIGILATION,
            rule_key="invigilator_ratio",
            rule_value_float=0.0333,  # 1/30 = 0.0333
            description="ISA-1: 1 invigilator per 30 students",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.INVIGILATION,
            rule_key="min_invigilators_per_room",
            rule_value_int=1,
            description="ISA-1: Minimum 1 invigilator per room",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.SEATING,
            rule_key="max_students_per_room",
            rule_value_int=60,
            description="ISA-1: Maximum 60 students per room",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.ELIGIBILITY,
            rule_key="min_attendance_percent",
            rule_value_int=75,
            description="ISA-1: Minimum 75% attendance required",
            is_active=True
        ),
        
        # ===== ISA-2 Rules =====
        Rule(
            exam_type=ExamType.ISA2,
            category=RuleCategory.TIMING,
            rule_key="duration_minutes",
            rule_value_int=60,
            description="ISA-2 exam duration: 1 hour",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA2,
            category=RuleCategory.SEATING,
            rule_key="students_per_bench",
            rule_value_int=2,
            description="ISA-2: 2 students per bench",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA2,
            category=RuleCategory.SCHEDULING,
            rule_key="min_gap_days",
            rule_value_int=1,
            description="ISA-2: Minimum 1 day gap between exams for same student",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA2,
            category=RuleCategory.INVIGILATION,
            rule_key="invigilator_ratio",
            rule_value_float=0.0333,  # 1/30
            description="ISA-2: 1 invigilator per 30 students",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA2,
            category=RuleCategory.INVIGILATION,
            rule_key="min_invigilators_per_room",
            rule_value_int=1,
            description="ISA-2: Minimum 1 invigilator per room",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA2,
            category=RuleCategory.SEATING,
            rule_key="max_students_per_room",
            rule_value_int=60,
            description="ISA-2: Maximum 60 students per room",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ISA2,
            category=RuleCategory.ELIGIBILITY,
            rule_key="min_attendance_percent",
            rule_value_int=75,
            description="ISA-2: Minimum 75% attendance required",
            is_active=True
        ),
        
        # ===== ESA Rules =====
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.TIMING,
            rule_key="duration_minutes",
            rule_value_int=180,
            description="ESA exam duration: 3 hours",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.SEATING,
            rule_key="students_per_bench",
            rule_value_int=1,
            description="ESA: 1 student per bench (no sharing)",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.SCHEDULING,
            rule_key="min_gap_days",
            rule_value_int=2,
            description="ESA: Minimum 2 day gap between exams for same student",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.INVIGILATION,
            rule_key="invigilator_ratio",
            rule_value_float=0.0417,  # 1/24 = 0.0417
            description="ESA: 1 invigilator per 24 students",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.INVIGILATION,
            rule_key="min_invigilators_per_room",
            rule_value_int=2,
            description="ESA: Minimum 2 invigilators per room",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.SEATING,
            rule_key="max_students_per_room",
            rule_value_int=48,
            description="ESA: Maximum 48 students per room",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.ELIGIBILITY,
            rule_key="min_attendance_percent",
            rule_value_int=75,
            description="ESA: Minimum 75% attendance required",
            is_active=True
        ),
        
        # ===== General Timing Rules =====
        Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.TIMING,
            rule_key="session_timings",
            rule_value_json={
                "morning": {"start": "09:00", "end": "12:00"},
                "afternoon": {"start": "14:00", "end": "17:00"}
            },
            description="ISA-1 session time slots",
            is_active=True
        ),
        Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.TIMING,
            rule_key="session_timings",
            rule_value_json={
                "morning": {"start": "09:00", "end": "12:00"},
                "afternoon": {"start": "14:00", "end": "17:00"}
            },
            description="ESA session time slots",
            is_active=True
        ),
    ]
    
    # Check if rules already exist
    existing_count = db.query(Rule).count()
    if existing_count > 0:
        print(f"Rules already seeded ({existing_count} rules exist). Skipping.")
        return
    
    # Add all rules
    db.add_all(rules)
    db.commit()
    
    print(f"Successfully seeded {len(rules)} default rules into the database.")


def main():
    """Main entry point for seeding rules."""
    db = SessionLocal()
    try:
        seed_default_rules(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
