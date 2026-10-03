## Engine 1: Scheduling Engine

Assigns date + session to each course ensuring no student has exam clashes.

## Overview

Engine 1 uses **conflict graph theory** and **Google OR-Tools CP-SAT solver** to create optimal exam schedules.

### Key Components

1. **ConflictGraph**: Models course conflicts (shared students)
2. **ClashDetector**: Validates schedules for conflicts
3. **ExamScheduler**: Main scheduling engine using CP-SAT

## Workflow

```
Courses + Students
       ↓
Build Conflict Graph
       ↓
Generate Time Slots
       ↓
CP-SAT Solver (Constraint Programming)
       ↓
Assign Date + Session to each Course
       ↓
Verify No Clashes
       ↓
Create ScheduledExam Records
```

## Conflict Graph

A graph where:
- **Nodes**: Courses
- **Edges**: Conflicts (courses share students)
- **Edge Weight**: Number of shared students

### Properties

- **Degree**: Number of conflicting courses
- **Chromatic Number**: Minimum colors (time slots) needed
- **Independent Set**: Courses that can be scheduled together

### Example

```python
from app.services.engine1 import ConflictGraph

graph = ConflictGraph()
graph.build_from_database(db, semester=3, branch="CSE")

# Get statistics
stats = graph.get_statistics()
# {
#   "num_courses": 8,
#   "num_conflicts": 15,
#   "avg_degree": 3.75,
#   "max_degree": 6,
#   "min_time_slots_needed": 7
# }

# Check if two courses conflict
has_conflict = graph.has_conflict(course1_id, course2_id)
```

## CP-SAT Solver

Uses Google OR-Tools CP-SAT (Constraint Programming - Satisfiability) solver.

### Variables

- `course_vars[course_id]`: Integer variable for slot assignment

### Constraints

1. **No Same-Slot Conflicts**
   ```
   If courses conflict: course_vars[c1] ≠ course_vars[c2]
   ```

2. **Minimum Gap Days**
   ```
   |slot[c1] - slot[c2]| ≥ min_gap_days * slots_per_day
   ```

3. **Valid Slot Range**
   ```
   0 ≤ course_vars[c] ≤ num_slots - 1
   ```

### Objective

Minimize maximum slot index used (creates compact schedule).

### Solver Status

- **OPTIMAL**: Best possible solution found
- **FEASIBLE**: Valid solution found (may not be optimal)
- **INFEASIBLE**: No solution exists with given constraints
- **UNKNOWN**: Timeout or other issue

## Usage

### Basic Scheduling

```python
from app.services.engine1 import ExamScheduler
from datetime import date

scheduler = ExamScheduler(db)

result = scheduler.schedule_exams(
    plan=exam_plan,
    courses=course_list,
    start_date=date(2024, 3, 10),
    end_date=date(2024, 3, 25),
    sessions=[ExamSession.MORNING, ExamSession.AFTERNOON],
    user_id=current_user.id
)

if result.success:
    print(f"Scheduled {len(result.scheduled_exams)} exams")
    print(f"Statistics: {result.statistics}")
    
    # Save to database
    for exam in result.scheduled_exams:
        db.add(exam)
    db.commit()
else:
    print(f"Scheduling failed: {result.message}")
```

### Clash Detection

```python
from app.services.engine1 import ClashDetector

detector = ClashDetector(db, min_gap_days=1)
clashes = detector.detect_clashes_in_schedule(scheduled_exams)

if detector.has_clashes():
    summary = detector.get_clash_summary()
    print(f"Found {summary['total_clashes']} clashes")
    print(f"Affected students: {summary['affected_students']}")
    
    # Get specific clash types
    same_slot = detector.get_clashes_by_type("SAME_SLOT")
    insufficient_gap = detector.get_clashes_by_type("INSUFFICIENT_GAP")
```

## Constraints from Rules

All scheduling parameters come from RuleProvider (never hard-coded):

```python
rule_provider = RuleProvider(db)

# Get minimum gap days
min_gap = rule_provider.get_int(ExamType.ISA1, "min_gap_days")  # 1 day

# Get exam duration
duration = rule_provider.get_int(ExamType.ISA1, "duration_minutes")  # 60 min

# Get session timings
timings = rule_provider.get_json(ExamType.ISA1, "session_timings")
# {"morning": {"start": "09:00", "end": "12:00"}, ...}
```

## Output

Engine 1 creates `ScheduledExam` records with:
- `plan_id`: Parent exam plan
- `course_id`: Course being examined
- `exam_date`: Date of exam
- `session`: MORNING/AFTERNOON/EVENING
- `start_time`, `end_time`: Exact times
- `duration_minutes`: Duration
- `num_students`: Number of students
- `room_id`: NULL (assigned by Engine 2)

## Algorithm Details

### Phase 1: Conflict Graph Construction

Time Complexity: O(S × C²)
- S = number of students
- C = number of courses

For each student:
- Get their courses
- Create pairwise conflicts

### Phase 2: CP-SAT Solving

Time Complexity: Varies (NP-hard problem)
- Typical: O(2^(C/k)) where k is a branching factor
- Timeout: 60 seconds
- Uses heuristics and branch-and-bound

Worst case: Exponential
Practical: Polynomial for most real-world cases

### Phase 3: Verification

Time Complexity: O(S × C² × log C)
- For each student: O(C² × log C) for sorted comparisons
- S students total

## Handling Infeasibility

If solver returns INFEASIBLE:

1. **Increase time slots**: Extend date range or add evening sessions
2. **Reduce constraints**: Lower min_gap_days (requires rule change)
3. **Split sections**: Schedule different sections separately
4. **Reduce course load**: Remove some courses from this plan

## Optimization Tips

1. **Compact Dates**: Use minimum date range that satisfies constraints
2. **Pre-filtering**: Remove courses with no students
3. **Graph Partitioning**: Schedule independent sub-graphs separately
4. **Solver Tuning**: Adjust timeout, parallelism, search heuristics

## Testing

```bash
# Run Engine 1 tests
pytest backend/tests/test_engine1.py -v

# Test specific component
pytest backend/tests/test_engine1.py::TestConflictGraph -v
```

## Integration with Other Engines

**→ Engine 2 (Room & Seating)**
- Input: ScheduledExam records from Engine 1
- Engine 2 assigns rooms and seats

**→ Engine 3 (Exam Management)**
- Input: ScheduledExam records from Engine 1
- Engine 3 assigns invigilators

**→ Engine 4 (Validation)**
- Input: ScheduledExam records from Engine 1
- Engine 4 validates schedule compliance

## Performance Benchmarks

Typical performance on standard hardware:

| Courses | Students | Conflicts | Solve Time |
|---------|----------|-----------|------------|
| 10      | 100      | 20        | < 1s       |
| 50      | 500      | 200       | < 5s       |
| 100     | 1000     | 800       | < 30s      |
| 200     | 2000     | 3000      | < 60s      |

Highly depends on graph density and constraint tightness.

## Common Issues

### Issue: Infeasible Solution

**Cause**: Too many conflicts, not enough time slots

**Solution**:
- Increase date range
- Add more sessions per day
- Reduce min_gap_days (if allowed by policy)

### Issue: Slow Solving

**Cause**: Complex conflict graph, many constraints

**Solution**:
- Partition problem into smaller sub-problems
- Increase solver timeout
- Use greedy heuristics for initial solution

### Issue: Gap Constraint Violations

**Cause**: Slot-based gap calculation is approximate

**Solution**:
- Verification phase catches these
- Adjust solution or increase min_slot_gap multiplier

## References

- OR-Tools CP-SAT: https://developers.google.com/optimization/cp/cp_solver
- Graph Coloring: https://en.wikipedia.org/wiki/Graph_coloring
- Constraint Programming: https://en.wikipedia.org/wiki/Constraint_programming
