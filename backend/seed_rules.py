#!/usr/bin/env python
"""Seed default rules for ExamGuard."""
from app.core.database import SessionLocal
from app.models.rule import Rule, ExamType, RuleCategory

db = SessionLocal()

# Default rules for different exam types
DEFAULT_RULES = [
    # ISA1 (Internal Semester Assessment 1) Rules
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.TIMING,
        'rule_key': 'duration_minutes',
        'rule_value_int': 60,
        'description': 'ISA1 exam duration in minutes'
    },
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.SEATING,
        'rule_key': 'students_per_bench',
        'rule_value_int': 2,
        'description': 'Maximum students allowed per bench for ISA1'
    },
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.SCHEDULING,
        'rule_key': 'min_gap_days',
        'rule_value_int': 1,
        'description': 'Minimum days between ISA1 exams for same student'
    },
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.INVIGILATION,
        'rule_key': 'invigilator_ratio',
        'rule_value_int': 30,
        'description': 'Students per invigilator for ISA1'
    },
    
    # ISA2 Rules
    {
        'exam_type': ExamType.ISA2,
        'category': RuleCategory.TIMING,
        'rule_key': 'duration_minutes',
        'rule_value_int': 90,
        'description': 'ISA2 exam duration in minutes'
    },
    {
        'exam_type': ExamType.ISA2,
        'category': RuleCategory.SEATING,
        'rule_key': 'students_per_bench',
        'rule_value_int': 2,
        'description': 'Maximum students allowed per bench for ISA2'
    },
    {
        'exam_type': ExamType.ISA2,
        'category': RuleCategory.SCHEDULING,
        'rule_key': 'min_gap_days',
        'rule_value_int': 1,
        'description': 'Minimum days between ISA2 exams for same student'
    },
    
    # ESA (End Semester Assessment) Rules - More Strict
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.TIMING,
        'rule_key': 'duration_minutes',
        'rule_value_int': 180,
        'description': 'ESA exam duration in minutes (3 hours)'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.SEATING,
        'rule_key': 'students_per_bench',
        'rule_value_int': 1,
        'description': 'Maximum students allowed per bench for ESA (stricter)'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.SEATING,
        'rule_key': 'min_seat_gap',
        'rule_value_int': 1,
        'description': 'Minimum empty seats between students for ESA'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.SCHEDULING,
        'rule_key': 'min_gap_days',
        'rule_value_int': 2,
        'description': 'Minimum days between ESA exams for same student'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.INVIGILATION,
        'rule_key': 'invigilator_ratio',
        'rule_value_int': 24,
        'description': 'Students per invigilator for ESA (stricter)'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.INVIGILATION,
        'rule_key': 'chief_invigilator_required',
        'rule_value_bool': True,
        'description': 'Chief invigilator required for ESA'
    },
    
    # General Rules (Apply to all exam types)
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.ELIGIBILITY,
        'rule_key': 'min_attendance_percent',
        'rule_value_float': 75.0,
        'description': 'Minimum attendance required for ISA1'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.ELIGIBILITY,
        'rule_key': 'min_attendance_percent',
        'rule_value_float': 75.0,
        'description': 'Minimum attendance required for ESA'
    },
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.GENERAL,
        'rule_key': 'hall_ticket_required',
        'rule_value_bool': True,
        'description': 'Hall ticket required for entry to ISA1'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.GENERAL,
        'rule_key': 'hall_ticket_required',
        'rule_value_bool': True,
        'description': 'Hall ticket required for entry to ESA'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.GENERAL,
        'rule_key': 'id_verification_required',
        'rule_value_bool': True,
        'description': 'ID verification required for ESA'
    },
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.GENERAL,
        'rule_key': 'mobile_phones_allowed',
        'rule_value_bool': False,
        'description': 'Mobile phones not allowed in examination hall'
    },
    
    # Scheduling Configuration
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.SCHEDULING,
        'rule_key': 'max_exams_per_day',
        'rule_value_int': 2,
        'description': 'Maximum ESA exams that can be scheduled per day'
    },
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.SCHEDULING,
        'rule_key': 'max_exams_per_day',
        'rule_value_int': 4,
        'description': 'Maximum ISA1 exams that can be scheduled per day'
    },
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.SCHEDULING,
        'rule_key': 'sessions_per_day',
        'rule_value_int': 2,
        'description': 'Number of examination sessions per day for ESA'
    },
    
    # Hall Capacity Rules
    {
        'exam_type': ExamType.ESA,
        'category': RuleCategory.SEATING,
        'rule_key': 'hall_capacity_percent',
        'rule_value_float': 50.0,
        'description': 'Maximum hall capacity usage for ESA (50% for social distancing)'
    },
    {
        'exam_type': ExamType.ISA1,
        'category': RuleCategory.SEATING,
        'rule_key': 'hall_capacity_percent',
        'rule_value_float': 75.0,
        'description': 'Maximum hall capacity usage for ISA1'
    },
    
    # Makeup and Retest Rules
    {
        'exam_type': ExamType.MAKEUP,
        'category': RuleCategory.TIMING,
        'rule_key': 'duration_minutes',
        'rule_value_int': 180,
        'description': 'Makeup exam duration (same as regular exam)'
    },
    {
        'exam_type': ExamType.RETEST,
        'category': RuleCategory.TIMING,
        'rule_key': 'duration_minutes',
        'rule_value_int': 180,
        'description': 'Retest exam duration'
    },
    {
        'exam_type': ExamType.MAKEUP,
        'category': RuleCategory.ELIGIBILITY,
        'rule_key': 'allow_detained_students',
        'rule_value_bool': True,
        'description': 'Allow detained students for makeup exams'
    }
]

try:
    print("Seeding default rules...")
    
    rules_created = 0
    rules_skipped = 0
    
    for rule_data in DEFAULT_RULES:
        # Check if rule already exists
        existing = db.query(Rule).filter(
            Rule.exam_type == rule_data['exam_type'],
            Rule.rule_key == rule_data['rule_key']
        ).first()
        
        if existing:
            print(f"⚠️  Rule exists: {rule_data['exam_type'].value}.{rule_data['rule_key']}")
            rules_skipped += 1
            continue
        
        # Create new rule
        rule = Rule(**rule_data)
        db.add(rule)
        rules_created += 1
        print(f"✓ Created: {rule_data['exam_type'].value}.{rule_data['rule_key']} = {rule.get_value()}")
    
    db.commit()
    
    print(f"\n✅ Rule seeding complete!")
    print(f"   Created: {rules_created} rules")
    print(f"   Skipped: {rules_skipped} existing rules")
    
    # Summary by exam type
    print(f"\n📊 Rules by Exam Type:")
    for exam_type in ExamType:
        count = db.query(Rule).filter(Rule.exam_type == exam_type).count()
        print(f"   {exam_type.value}: {count} rules")

except Exception as e:
    print(f"❌ Error seeding rules: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()