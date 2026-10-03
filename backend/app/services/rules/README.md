# Rules & Configuration Layer

## Overview

The Rules & Configuration Layer is the **single source of truth** for all exam-related rules and parameters in ExamGuard. All four engines **must** access rules through the `RuleProvider` interface—never hard-code rule values.

## Design Principles

### 1. Rules as Data
All exam rules (duration, seating, gaps, ratios) are stored in the database, not in code. This allows:
- Rule changes without code deployment
- Different rules for different exam types
- Historical tracking of rule changes
- Easy testing with different rule sets

### 2. Type-Safe Access
RuleProvider provides type-specific methods:
- `get_int()` - for counts, durations, etc.
- `get_float()` - for ratios, percentages
- `get_str()` - for text values
- `get_bool()` - for flags
- `get_json()` - for complex configurations

### 3. Validation
RuleValidator ensures:
- Values are within acceptable ranges
- Cross-rule consistency
- Business logic compliance

## Usage Examples

### Engine Code (Correct ✅)

```python
from app.services.rules import RuleProvider
from app.models.rule import ExamType

def schedule_exam(db: Session, exam_type: ExamType):
    provider = RuleProvider(db)
    
    # Read duration from rules
    duration = provider.get_int(exam_type, "duration_minutes")
    
    # Read gap requirement from rules
    min_gap = provider.get_int(exam_type, "min_gap_days")
    
    # Use the values...
```

### Hard-Coding (Wrong ❌)

```python
# NEVER DO THIS!
def schedule_exam(exam_type: str):
    if exam_type == "ISA1":
        duration = 60  # WRONG: Hard-coded value
        min_gap = 1
    elif exam_type == "ESA":
        duration = 180  # WRONG: Hard-coded value
        min_gap = 2
```

## Standard Rules

### ISA-1 / ISA-2 Rules
- **Duration**: 60 minutes
- **Students per bench**: 2
- **Minimum gap**: 1 day
- **Invigilator ratio**: 1:30 (0.0333)
- **Min invigilators/room**: 1
- **Max students/room**: 60

### ESA Rules
- **Duration**: 180 minutes
- **Students per bench**: 1
- **Minimum gap**: 2 days
- **Invigilator ratio**: 1:24 (0.0417)
- **Min invigilators/room**: 2
- **Max students/room**: 48

## Rule Categories

- **TIMING**: Durations, session times
- **SEATING**: Students per bench, room capacity
- **SCHEDULING**: Gap days, sessions per day
- **INVIGILATION**: Ratios, minimum staff
- **ELIGIBILITY**: Attendance requirements
- **GENERAL**: Other configurations

## API Reference

### RuleProvider

#### `get_int(exam_type, rule_key, default=None) -> int`
Get integer rule value.

**Parameters:**
- `exam_type`: ExamType enum
- `rule_key`: String identifier (e.g., "duration_minutes")
- `default`: Optional default value if rule not found

**Returns:** Integer value

**Raises:** RuleNotFoundException if rule not found and no default

#### `get_float(exam_type, rule_key, default=None) -> float`
Get float rule value.

#### `get_str(exam_type, rule_key, default=None) -> str`
Get string rule value.

#### `get_bool(exam_type, rule_key, default=None) -> bool`
Get boolean rule value.

#### `get_json(exam_type, rule_key, default=None) -> dict`
Get JSON rule value (returns Python dict).

#### `get_all_for_exam_type(exam_type, category=None) -> List[RuleValueResponse]`
Get all active rules for an exam type.

**Parameters:**
- `exam_type`: ExamType enum
- `category`: Optional RuleCategory filter

**Returns:** List of RuleValueResponse objects

#### `clear_cache()`
Clear internal cache. Call after rule updates.

### RuleValidator

#### `validate_value(rule_key, value, exam_type=None)`
Validate a single rule value against constraints.

**Raises:** RuleValidationError if invalid

#### `validate_rule_set(exam_type, rules)`
Validate a complete set of rules for consistency.

**Parameters:**
- `exam_type`: ExamType enum
- `rules`: Dict of rule_key -> value

**Raises:** RuleValidationError if inconsistent

## Seeding Rules

To populate the database with default rules:

```bash
cd backend
python -m app.utils.seed_rules
```

Or programmatically:

```python
from app.utils.seed_rules import seed_default_rules
from app.core.database import SessionLocal

db = SessionLocal()
seed_default_rules(db)
db.close()
```

## Testing

Run rule provider tests:

```bash
pytest tests/test_rules.py -v
```

## Integration with Engines

### Engine 1 (Scheduling)
```python
provider = RuleProvider(db)
min_gap = provider.get_int(exam_type, "min_gap_days")
# Use min_gap in scheduling algorithm
```

### Engine 2 (Room & Seating)
```python
provider = RuleProvider(db)
students_per_bench = provider.get_int(exam_type, "students_per_bench")
max_per_room = provider.get_int(exam_type, "max_students_per_room")
# Use in seat allocation
```

### Engine 3 (Exam Management)
```python
provider = RuleProvider(db)
ratio = provider.get_float(exam_type, "invigilator_ratio")
min_invigs = provider.get_int(exam_type, "min_invigilators_per_room")
# Use in invigilator assignment
```

### Engine 4 (Validation)
```python
# Engine 4 validates independently
provider = RuleProvider(db)
expected_duration = provider.get_int(exam_type, "duration_minutes")
# Verify actual vs expected
```

## Adding New Rules

1. Add rule via API or directly to database:
```python
new_rule = Rule(
    exam_type=ExamType.ISA1,
    category=RuleCategory.TIMING,
    rule_key="grace_period_minutes",
    rule_value_int=15,
    description="Grace period for late entry",
    is_active=True
)
db.add(new_rule)
db.commit()
```

2. Add validation constraints in `rule_validator.py`:
```python
CONSTRAINTS = {
    "grace_period_minutes": {
        "min": 0,
        "max": 30,
        "type": int,
        "description": "Grace period must be 0-30 minutes"
    }
}
```

3. Use in engine code:
```python
grace_period = provider.get_int(exam_type, "grace_period_minutes", default=0)
```

## Important Notes

⚠️ **Never hard-code rule values in engine code**
⚠️ **Always use RuleProvider to access rules**
⚠️ **Engine 4 must not import Engine 1-3 code**
⚠️ **Call `clear_cache()` after updating rules**
