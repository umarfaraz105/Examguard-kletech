# Engine 2: Room & Seating Allocation

Allocates rooms and assigns exact seats to students with branch separation.

## Overview

Engine 2 takes scheduled exams (from Engine 1) and:
1. **Allocates rooms** based on student count and capacity
2. **Assigns exact seats** to each student
3. **Ensures branch separation**: No two students from same branch are neighbors

## Key Components

1. **RoomAllocator**: Assigns rooms to exams
2. **SeatAllocator**: Assigns exact seats with bench positions
3. **BranchSeparator**: Validates 8-direction branch separation

## Workflow

```
ScheduledExam (from Engine 1)
       ↓
Room Allocation (capacity check)
       ↓
Bench Grid Creation
       ↓
Seat Assignment (greedy + branch separation)
       ↓
Validation (8-direction check)
       ↓
Create SeatAssignment Records
```

## Seat Code Format

`R-101-B04-L`

- `R-101`: Room code
- `B04`: Bench number (zero-padded, e.g., B01, B04, B15)
- `L`: Position (L=Left, R=Right, M=Middle)

## Branch Separation

### 8 Directions

No same-branch students in any of:

```
UL  U  UR
 ↖  ↑  ↗
L  ← X →  R
 ↙  ↓  ↘
DL  D  DR
```

- **U**: Up (Front)
- **D**: Down (Back)
- **L**: Left
- **R**: Right
- **UL, UR, DL, DR**: Four diagonals

### Algorithm

1. **Group by branch**: Sort students by branch
2. **Greedy allocation**: Place students one by one
3. **Validation**: Check each placement against 8 neighbors
4. **Backtrack if needed**: Try different positions if blocked

## Room Allocation

### Capacity Calculation

```python
effective_capacity = min(
    room.capacity,          # Physical capacity
    max_students_per_room,  # Rule-based limit
    num_benches * students_per_bench  # Seating constraint
)
```

### Algorithm

**First-Fit Decreasing (FFD)**:
1. Sort exams by student count (largest first)
2. Sort rooms by capacity (largest first)
3. Assign each exam to first room with enough capacity
4. Check room availability (no conflict at same date+session)

Time Complexity: O(E × R) where E=exams, R=rooms

## Seat Allocation

### Greedy with Branch Separation

```python
for each branch (sorted by size, largest first):
    for each student in branch:
        for each available position:
            if can_place_without_violating_branch_separation():
                assign_seat()
                break
```

### Position Grid

Benches arranged in grid:

```
Row 0: B01[L,R]  B02[L,R]  B03[L,R]
Row 1: B04[L,R]  B05[L,R]  B06[L,R]
Row 2: B07[L,R]  B08[L,R]  B09[L,R]
```

Each bench can hold `students_per_bench` students.

Example with 2 students/bench:
- Position L (Left)
- Position R (Right)

Example with 3 students/bench:
- Position L (Left)
- Position M (Middle)
- Position R (Right)

## Usage

### Room Allocation

```python
from app.services.engine2 import RoomAllocator

allocator = RoomAllocator(db)

result = allocator.allocate_rooms(
    scheduled_exams=exams_from_engine1,
    exam_type=ExamType.ISA1,
    available_rooms=None  # None = all available rooms
)

if result.success:
    # Apply allocations
    allocator.apply_allocations(exams_from_engine1, result.allocations)
    
    for exam in exams_from_engine1:
        print(f"{exam.course.course_code}: Room {exam.room.room_code}")
else:
    print(f"Allocation failed: {result.message}")
```

### Seat Allocation

```python
from app.services.engine2 import SeatAllocator

allocator = SeatAllocator(db)

result = allocator.allocate_seats(
    scheduled_exam=exam,
    exam_type=ExamType.ISA1,
    user_id=current_user.id
)

if result.success:
    # Save seat assignments
    for assignment in result.seat_assignments:
        db.add(assignment)
    db.commit()
    
    print(f"Assigned {len(result.seat_assignments)} seats")
    print(f"Violations: {len(result.violations)}")
else:
    print(f"Seating failed: {result.message}")
```

### Branch Separation Validation

```python
from app.services.engine2 import BranchSeparator

separator = BranchSeparator()

is_valid, violations = separator.validate_all_assignments(seat_assignments)

if not is_valid:
    summary = separator.get_violations_summary()
    print(f"Found {summary['total_violations']} violations")
    print(f"Affected students: {summary['affected_students']}")
    
    for violation in violations:
        print(f"{violation['student1_usn']} ({violation['student1_seat']}) "
              f"adjacent to {violation['student2_usn']} ({violation['student2_seat']}) "
              f"in direction {violation['direction']}")
```

## Constraints from Rules

All parameters come from RuleProvider:

```python
rule_provider = RuleProvider(db)

# Students per bench
students_per_bench = rule_provider.get_int(ExamType.ISA1, "students_per_bench")
# ISA: 2, ESA: 1

# Maximum students per room
max_per_room = rule_provider.get_int(ExamType.ISA1, "max_students_per_room")
# ISA: 60, ESA: 48
```

## Output

Engine 2 creates `SeatAssignment` records with:
- `scheduled_exam_id`: Parent exam
- `student_id`: Student being seated
- `bench_id`: Bench assigned
- `seat_code`: Unique identifier (e.g., "R-101-B04-L")
- `position`: L/R/M
- `row_number`, `column_number`: Grid coordinates
- `is_confirmed`: Confirmation status

## Integration

**From Engine 1**:
- Input: `ScheduledExam` with `room_id=NULL`
- Engine 2 sets `room_id`

**To Engine 3**:
- Input: `ScheduledExam` with `room_id` and `SeatAssignment` records
- Engine 3 uses room info for invigilator allocation

**To Engine 4**:
- Engine 4 validates:
  - All students have seats
  - Branch separation is correct
  - Capacity limits respected

## Algorithm Complexity

### Room Allocation

Time: O(E × R)
- E = number of exams
- R = number of rooms

Space: O(E + R)

### Seat Allocation

Time: O(S × B × P)
- S = number of students
- B = number of benches
- P = positions per bench (typically 2-3)

Worst case: O(S²) if many backtracks needed

Space: O(S + B)

### Branch Separation Validation

Time: O(S × 8) = O(S)
- Check 8 neighbors per student

Space: O(S)

## Handling Failures

### Insufficient Room Capacity

**Problem**: Not enough rooms for all exams

**Solutions**:
1. Add more rooms to inventory
2. Use multiple rooms per exam (split students)
3. Schedule exams across more days
4. Reduce `max_students_per_room` (not recommended)

### Cannot Achieve Branch Separation

**Problem**: Branch distribution makes separation impossible

**Solutions**:
1. Use larger room (more spacing)
2. Reduce `students_per_bench` (more spread out)
3. Split section into multiple exam sessions
4. Relax requirement (policy decision)

**Note**: With proper room size, branch separation is usually achievable unless one branch dominates heavily (>70% of class).

## Bench Grid Layout

### Standard Layout (6 benches, 3×2 grid)

```
Front of Room
─────────────────
[B01] [B02] [B03]
[B04] [B05] [B06]
─────────────────
Back of Room
```

### Large Room (30 benches, 5×6 grid)

```
Front
──────────────────────────────────
[B01] [B02] [B03] [B04] [B05] [B06]
[B07] [B08] [B09] [B10] [B11] [B12]
[B13] [B14] [B15] [B16] [B17] [B18]
[B19] [B20] [B21] [B22] [B23] [B24]
[B25] [B26] [B27] [B28] [B29] [B30]
──────────────────────────────────
Back
```

## Example Scenarios

### Scenario 1: Small Exam (ISA)

- **Students**: 40
- **Branches**: CSE (25), ECE (15)
- **Rules**: 2 students/bench
- **Room**: 60 capacity, 30 benches

**Allocation**:
1. 30 benches × 2 positions = 60 seats available
2. Need 40 seats
3. Arrange CSE and ECE students alternately
4. Result: All seated with branch separation

### Scenario 2: Large Exam (ESA)

- **Students**: 120
- **Branches**: CSE (50), ECE (40), MECH (30)
- **Rules**: 1 student/bench
- **Rooms**: Multiple rooms needed

**Allocation**:
1. Split across 3 rooms (48 students each)
2. Room 1: 25 CSE + 23 ECE
3. Room 2: 25 CSE + 17 ECE + 6 MECH
4. Room 3: 17 ECE + 24 MECH
5. Within each room: branch separation maintained

## Testing

```bash
# Run Engine 2 tests
pytest backend/tests/test_engine2.py -v

# Test specific component
pytest backend/tests/test_engine2.py::TestBranchSeparator -v
```

## Performance Benchmarks

| Students | Branches | Benches | Allocation Time |
|----------|----------|---------|-----------------|
| 30       | 2        | 20      | < 0.1s          |
| 60       | 3        | 40      | < 0.5s          |
| 120      | 4        | 80      | < 2s            |
| 200      | 5        | 150     | < 5s            |

Performance depends on:
- Number of students
- Branch distribution
- Room layout
- Backtracking needed

## Common Issues

### Issue: Branch Separation Violations

**Cause**: Greedy algorithm didn't find valid arrangement

**Solution**:
- Increase room size (more spacing)
- Reduce students per bench
- Manual seat swaps after initial allocation

### Issue: Uneven Room Utilization

**Cause**: FFD algorithm fills rooms sequentially

**Solution**:
- Use load balancing algorithm (distribute evenly)
- Manual room reassignment

### Issue: Bench Grid Not Created

**Cause**: Benches don't have row/column positions

**Solution**:
- Engine 2 auto-creates benches if missing
- Pre-populate benches in room setup

## References

- First-Fit Decreasing: https://en.wikipedia.org/wiki/Bin_packing_problem
- Graph Coloring (branch separation): https://en.wikipedia.org/wiki/Graph_coloring
- Constraint Satisfaction: https://en.wikipedia.org/wiki/Constraint_satisfaction_problem
