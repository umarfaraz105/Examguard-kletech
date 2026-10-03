# Engine 4: Validation & Reporting Engine

Independent rule checker and compliance auditor for exam plans.

## Overview

Engine 4 is the **independent auditor** that validates outputs from Engines 1-3.

### Critical Design Principle

**Engine 4 does NOT import from Engines 1-3.**

This ensures audit independence - Engine 4 checks what others produce without being influenced by their implementation.

## Key Components

1. **PlanValidator**: Independent rule checker
2. **ComplianceScorer**: Calculates compliance scores (0-100)
3. **ConflictDashboard**: Visualizes issues and conflicts
4. **ReportGenerator**: Exports PDF/Excel reports

## Workflow

```
Published Plan
       ↓
Read Data (Independently)
       ↓
Validate Against Rules
       ↓
Calculate Compliance Score
       ↓
Generate Reports
```

## Validation Checks

### 1. Scheduling Rules

- **NO_SAME_SLOT_CLASH**: Students don't have overlapping exams
- **MIN_GAP_DAYS**: Adequate spacing between exams
- **EXAM_DURATION**: Duration matches rules

### 2. Seating Rules

- **ROOM_ASSIGNED**: All exams have rooms
- **SEATING_COMPLETE**: All students have seats
- **ALL_STUDENTS_SEATED**: No missing students
- **MAX_STUDENTS_PER_ROOM**: Capacity not exceeded
- **BRANCH_SEPARATION**: No same-branch neighbors (8 directions)

### 3. Invigilation Rules

- **MIN_INVIGILATORS**: Minimum staff per room
- **INVIGILATOR_RATIO**: Student:invigilator ratio met

### 4. Completeness

- **EXAM_DATE_ASSIGNED**: All exams scheduled
- **EXAM_SESSION_ASSIGNED**: Sessions assigned

## Severity Levels

- **CRITICAL**: Blocks plan execution
- **ERROR**: Major issues requiring fix
- **WARNING**: Minor issues, may proceed with caution
- **INFO**: Informational notes

## Usage

### Validate Plan

```python
from app.services.engine4 import PlanValidator

validator = PlanValidator(db)
is_valid, issues = validator.validate_plan(plan)

if is_valid:
    print("Plan is valid!")
else:
    for issue in issues:
        print(f"{issue.severity}: {issue.message}")
```

### Calculate Compliance Score

```python
from app.services.engine4 import ComplianceScorer

scorer = ComplianceScorer(db)
score_data = scorer.calculate_score(plan)

print(f"Score: {score_data['score']}/100")
print(f"Grade: {score_data['grade']}")
print(f"Level: {score_data['compliance_level']}")
```

### Compare What-If Scenarios

```python
comparison = scorer.compare_plans(current_plan, what_if_plan)

print(f"Current: {comparison['plan1']['score']}")
print(f"What-if: {comparison['plan2']['score']}")
print(f"Recommendation: {comparison['recommendation']}")
```

### Generate Dashboard

```python
from app.services.engine4 import ConflictDashboard

dashboard = ConflictDashboard(db)
data = dashboard.generate_dashboard(plan)

print(f"Total issues: {data['overview']['total_issues']}")
print(f"Hot spots: {data['hot_spots']}")
```

### Export Reports

```python
from app.services.engine4 import ReportGenerator

generator = ReportGenerator(db)

# PDF compliance report
pdf_buffer = generator.generate_compliance_report_pdf(plan)
with open('compliance_report.pdf', 'wb') as f:
    f.write(pdf_buffer.read())

# Excel exam schedule
excel_buffer = generator.generate_exam_schedule_excel(plan)
with open('exam_schedule.xlsx', 'wb') as f:
    f.write(excel_buffer.read())

# JSON data
json_data = generator.generate_json_report(plan)
```

## Compliance Scoring

### Score Calculation

```
Base Score = 100

Deductions:
- Each CRITICAL: -20 points
- Each ERROR: -10 points
- Each WARNING: -3 points
- Each INFO: -1 point

Final Score = max(0, min(100, Base - Deductions))
```

### Grades

| Score    | Grade | Compliance Level    |
|----------|-------|---------------------|
| 95-100   | A+    | EXCELLENT           |
| 90-94    | A     | EXCELLENT           |
| 85-89    | B+    | GOOD                |
| 80-84    | B     | GOOD                |
| 75-79    | C+    | ACCEPTABLE          |
| 70-74    | C     | ACCEPTABLE          |
| 60-69    | D     | NEEDS_IMPROVEMENT   |
| 0-59     | F     | NON_COMPLIANT       |

## Independence Guarantee

Engine 4 validates by:

1. **Direct database queries** (not using Engine 1-3 code)
2. **Independent calculations** (recalculates everything)
3. **Rule-based checks** (only imports RuleProvider)

This ensures:
- Catches errors in other engines
- Provides objective validation
- Can't be influenced by implementation bugs

## Report Formats

### PDF Compliance Report

Includes:
- Executive summary
- Compliance score and grade
- List of issues by severity
- Recommendations

### Excel Exam Schedule

Columns:
- Course Code, Name
- Date, Session, Time
- Room
- Students, Invigilators

### Excel Seating Chart

Per exam:
- Seat code
- Student USN, Name, Branch
- Row, Column positions

### JSON Report

Complete data structure for API/integration use.

## Testing

```bash
# Run Engine 4 tests
pytest backend/tests/test_engine4.py -v
```

## Integration

Engine 4 runs **after** all other engines:

```
Engine 1 (Schedule) →
Engine 2 (Seating) →
Engine 3 (Invigilators) →
Engine 4 (Validate) → REPORTS
```

## Best Practices

1. **Run before publishing** plans
2. **Address CRITICAL issues** before proceeding
3. **Fix ERROR issues** for best results
4. **Review WARNINGS** and decide acceptance
5. **Use for what-if** scenario comparison
6. **Export reports** for documentation

## Performance

| Plans | Exams | Validation Time |
|-------|-------|-----------------|
| 1     | 50    | < 2s            |
| 1     | 100   | < 5s            |
| 1     | 200   | < 10s           |
| 5     | 50    | < 10s           |

## Common Issues Detected

1. **Student Clashes**: Same student, multiple exams at once
2. **Insufficient Gap**: Exams too close together
3. **Missing Seats**: Students not assigned seats
4. **Branch Violations**: Same-branch neighbors
5. **Understaffed**: Too few invigilators
6. **Capacity Exceeded**: Too many students in room

## References

- Independent Verification: https://en.wikipedia.org/wiki/Independent_verification_and_validation
- Compliance Scoring: https://en.wikipedia.org/wiki/Compliance_(psychology)
- Audit Trail: https://en.wikipedia.org/wiki/Audit_trail
