# Engine 3: Exam Management Engine

Manages invigilator assignments, eligibility, workload fairness, and notifications.

## Overview

Engine 3 takes scheduled exams with rooms (from Engines 1 & 2) and:
1. **Assigns invigilators** based on rules and availability
2. **Checks eligibility** (availability, conflicts, workload)
3. **Balances workload** fairly across faculty
4. **Sends notifications** for assignments and changes

## Key Components

1. **InvigilatorManager**: Main assignment engine
2. **EligibilityChecker**: Validates faculty availability
3. **WorkloadBalancer**: Ensures fair distribution
4. **NotificationService**: Alerts and reminders

## Workflow

```
ScheduledExam (from Engines 1 & 2)
       ↓
Get Rules (ratio, min invigilators)
       ↓
Calculate Required Invigilators
       ↓
Check Faculty Eligibility
       ↓
Select Based on Workload Balance
       ↓
Assign PRIMARY + RELIEF + RESERVE
       ↓
Send Notifications
       ↓
Create InvigilatorAssignment Records
```

## Invigilator Roles

### PRIMARY
- Main invigilators during exam
- Required based on student:invigilator ratio
- Workload: 2 points (if first) or 1 point

### RELIEF
- Break replacement during long exams
- Optional but recommended
- Workload: 1 point

### RESERVE
- Backup in case of no-show
- Optional
- Workload: 0 points (only counts if activated)

## Eligibility Checks

### 1. Active & Role
- Faculty must be active
- Must have FACULTY role

### 2. Availability
- Not marked unavailable for date/session
- Checked via `FacultyAvailability` table

### 3. No Conflicts
- Not already assigned to another exam at same time
- Checked via existing `InvigilatorAssignment` records

### 4. Not Teaching
- Warning if faculty is teaching the course
- Doesn't block assignment but flagged

### 5. Workload Limit
- Warning if daily limit exceeded
- Default: 3 assignments per day

## Workload Balancing

### Calculation

```python
workload_points = sum of:
  - PRIMARY assignments: 2 points (first) or 1 point
  - RELIEF assignments: 1 point
  - RESERVE assignments: 0 points (unless activated)
```

### Selection Strategy

1. **Get eligible faculty**
2. **Calculate current workload** for each
3. **Select faculty with minimum workload**
4. **Bonus for same department** (optional preference)

### Fairness Metrics

- **Average Workload**: Total points / Number of faculty
- **Standard Deviation**: Measure of distribution fairness
- **Fairness Score**: 0-100 scale (100 = perfectly balanced)

## Usage

### Assign Invigilators to Single Exam

```python
from app.services.engine3 import InvigilatorManager

manager = InvigilatorManager(db)

result = manager.assign_invigilators(
    scheduled_exam=exam,
    exam_type=ExamType.ISA1,
    user_id=current_user.id,
    include_relief=True,
    include_reserve=True
)

if result.success:
    # Save assignments
    for assignment in result.assignments:
        db.add(assignment)
    db.commit()
    
    print(f"Assigned {result.statistics['assigned']} primary invigilators")
    print(f"Relief: {result.statistics['relief']}")
    print(f"Reserve: {result.statistics['reserve']}")
    
    # Check warnings
    for warning in result.warnings:
        print(f"Warning: {warning}")
else:
    print(f"Failed: {result.message}")
```

### Bulk Assignment with Balanced Workload

```python
results = manager.assign_invigilators_bulk(
    scheduled_exams=all_exams,
    exam_type=ExamType.ISA1,
    user_id=current_user.id
)

success_count = sum(1 for r in results.values() if r.success)
print(f"Successfully assigned invigilators to {success_count}/{len(all_exams)} exams")
```

### Check Faculty Eligibility

```python
from app.services.engine3 import EligibilityChecker

checker = EligibilityChecker(db)

is_eligible, issues = checker.check_eligibility(
    faculty=faculty_member,
    scheduled_exam=exam
)

if is_eligible:
    print("Faculty is eligible")
else:
    for issue in issues:
        print(f"{issue.severity}: {issue.message}")
```

### Get Eligible Faculty List

```python
eligible_results = checker.get_eligible_faculty(
    scheduled_exam=exam,
    department="CSE"  # Optional filter
)

for faculty, issues in eligible_results:
    error_count = len([i for i in issues if i.severity == "ERROR"])
    print(f"{faculty.full_name}: {error_count} errors, {len(issues)} total issues")
```

### Check Workload Balance

```python
from app.services.engine3 import WorkloadBalancer

balancer = WorkloadBalancer(db)

stats = balancer.get_workload_statistics()

print(f"Average workload: {stats['avg_workload']:.1f} points")
print(f"Min: {stats['min_workload']}, Max: {stats['max_workload']}")
print(f"Fairness score: {stats['fairness_score']:.0f}/100")
```

### Replace Invigilator

```python
replacement = manager.replace_invigilator(
    original_assignment=original,
    replacement_faculty=new_faculty,
    reason="Original faculty on medical leave",
    user_id=current_user.id
)

print(f"Replaced: {original.faculty.full_name} → {new_faculty.full_name}")
```

### Send Notifications

```python
from app.services.engine3 import NotificationService

notifier = NotificationService(db)

# Notify new assignment
notification = notifier.notify_assignment(assignment)

# Request confirmation
notifier.notify_confirmation_request(assignment)

# Send reminder 1 day before
notifier.notify_reminder(assignment, days_before=1)

# Send all notifications
result = notifier.send_all_notifications()
print(f"Sent {result['sent']} notifications")
```

## Rules from RuleProvider

All parameters come from RuleProvider:

```python
rule_provider = RuleProvider(db)

# Invigilator ratio
ratio = rule_provider.get_float(ExamType.ISA1, "invigilator_ratio")
# ISA: 0.0333 (1:30), ESA: 0.0417 (1:24)

# Minimum invigilators per room
min_invigs = rule_provider.get_int(ExamType.ISA1, "min_invigilators_per_room")
# ISA: 1, ESA: 2
```

## Assignment Calculation

### Example: ISA-1 Exam

- **Students**: 60
- **Ratio**: 0.0333 (1:30)
- **Min per room**: 1

**Calculation**:
```
required_by_ratio = 60 × 0.0333 = 2
required = max(2, 1) = 2 invigilators
```

**Assignment**:
- 2 PRIMARY invigilators
- 1 RELIEF (optional)
- 1 RESERVE (optional)
- **Total**: 4 assignments

### Example: ESA Exam

- **Students**: 48
- **Ratio**: 0.0417 (1:24)
- **Min per room**: 2

**Calculation**:
```
required_by_ratio = 48 × 0.0417 = 2
required = max(2, 2) = 2 invigilators
```

**Assignment**:
- 2 PRIMARY invigilators
- 1 RELIEF
- 1 RESERVE
- **Total**: 4 assignments

## Notification Types

### ASSIGNMENT
Sent when duty is initially assigned.

### CONFIRMATION
Request to confirm availability (7 days before exam).

### REMINDER
Sent 1-2 days before exam.

### CHANGE
Sent when schedule or room changes.

### REPLACEMENT
Sent to both original and replacement faculty.

### CANCELLATION
Sent when exam is cancelled.

## Faculty Availability Management

Faculty can mark themselves unavailable:

```python
from app.models.invigilator import FacultyAvailability

# Mark unavailable for specific date
unavailable = FacultyAvailability(
    faculty_id=faculty.id,
    exam_date="2024-03-15",
    session="MORNING",  # or None for all-day
    is_available=False,
    reason="Conference attendance"
)
db.add(unavailable)
db.commit()
```

## Integration

**From Engines 1 & 2**:
- Input: `ScheduledExam` with room and seats assigned
- Engine 3 uses num_students, room info

**To Engine 4**:
- Engine 4 validates:
  - Correct number of invigilators
  - Ratio compliance
  - No conflicts
  - Workload fairness

## Algorithm Complexity

### Eligibility Check
Time: O(F × E)
- F = faculty count
- E = exams per day (to check conflicts)

Space: O(F)

### Workload Calculation
Time: O(F × A)
- A = average assignments per faculty

Space: O(F) for cache

### Assignment
Time: O(E × F × log F)
- Sorting by workload: O(F log F)
- E exams processed

Space: O(E + F)

## Performance Benchmarks

| Exams | Faculty | Assignment Time |
|-------|---------|-----------------|
| 10    | 50      | < 0.5s          |
| 50    | 100     | < 2s            |
| 100   | 200     | < 5s            |
| 200   | 500     | < 15s           |

## Common Issues

### Issue: Insufficient Eligible Faculty

**Cause**: Too many conflicts or unavailability

**Solutions**:
1. Relax date constraints
2. Import faculty from other departments
3. Reduce simultaneous exams
4. Increase faculty pool

### Issue: Unbalanced Workload

**Cause**: Sequential assignment without global optimization

**Solutions**:
1. Use bulk assignment (balances across all exams)
2. Manually adjust high-workload faculty
3. Clear workload cache between assignments

### Issue: Faculty Not Confirming

**Cause**: Notifications not reaching or ignored

**Solutions**:
1. Send multiple reminders
2. Escalate to HOD
3. Auto-confirm after deadline
4. Replace with reserve

## Testing

```bash
# Run Engine 3 tests
pytest backend/tests/test_engine3.py -v

# Test specific component
pytest backend/tests/test_engine3.py::TestEligibilityChecker -v
```

## Best Practices

1. **Always check eligibility** before assignment
2. **Balance workload** across all exams (use bulk assignment)
3. **Include relief and reserve** for robustness
4. **Send notifications immediately** after assignment
5. **Track confirmations** and follow up
6. **Log all changes** to audit trail
7. **Clear workload cache** when recalculating

## References

- Load Balancing: https://en.wikipedia.org/wiki/Load_balancing_(computing)
- Fair Division: https://en.wikipedia.org/wiki/Fair_division
- Scheduling Theory: https://en.wikipedia.org/wiki/Scheduling_(computing)
