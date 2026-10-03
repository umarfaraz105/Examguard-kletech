"""Rule configuration model - stores exam rules as data."""
from sqlalchemy import Column, String, Integer, Float, Boolean, Enum as SQLEnum
from app.models.base import BaseModel
import enum
import json


class ExamType(str, enum.Enum):
    """Exam type enumeration."""
    ISA1 = "ISA1"  # Internal Semester Assessment 1
    ISA2 = "ISA2"  # Internal Semester Assessment 2
    ESA = "ESA"    # End Semester Assessment
    MAKEUP = "MAKEUP"
    RETEST = "RETEST"


class RuleCategory(str, enum.Enum):
    """Rule category for organization."""
    TIMING = "TIMING"              # Duration, start/end times
    SEATING = "SEATING"            # Students per bench, spacing
    SCHEDULING = "SCHEDULING"      # Gap days, sessions
    INVIGILATION = "INVIGILATION"  # Ratios, requirements
    ELIGIBILITY = "ELIGIBILITY"    # Attendance, prerequisites
    GENERAL = "GENERAL"            # Other rules


class Rule(BaseModel):
    """
    Exam rule configuration model.
    
    Stores all exam-type specific rules as data (never hard-coded).
    All engines must read rules through RuleProvider.
    
    Example rules:
    - ISA1: duration=60min, students_per_bench=2, min_gap_days=1, invigilator_ratio=1:30
    - ESA: duration=180min, students_per_bench=1, min_gap_days=2, invigilator_ratio=1:24
    
    Attributes:
        exam_type: Type of exam (ISA1, ISA2, ESA, etc.)
        category: Rule category for organization
        rule_key: Unique identifier for the rule (e.g., 'duration_minutes')
        rule_value_int: Integer value (for counts, minutes, etc.)
        rule_value_float: Float value (for ratios, percentages, etc.)
        rule_value_str: String value (for text configurations)
        rule_value_bool: Boolean value (for flags)
        rule_value_json: JSON value (for complex configurations)
        description: Human-readable description
        is_active: Whether rule is currently active
        validation_rule: Optional validation expression
    """
    
    __tablename__ = "rules"
    
    exam_type = Column(SQLEnum(ExamType), nullable=False, index=True)
    category = Column(SQLEnum(RuleCategory), nullable=False, index=True)
    rule_key = Column(String(100), nullable=False, index=True)
    
    # Multiple value columns to support different data types
    rule_value_int = Column(Integer, nullable=True)
    rule_value_float = Column(Float, nullable=True)
    rule_value_str = Column(String(500), nullable=True)
    rule_value_bool = Column(Boolean, nullable=True)
    rule_value_json = Column(String(1000), nullable=True)  # JSON stored as text
    
    description = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    validation_rule = Column(String(200), nullable=True)
    
    def __repr__(self) -> str:
        """String representation."""
        return (
            f"<Rule(exam_type={self.exam_type}, category={self.category}, "
            f"key={self.rule_key})>"
        )
    
    def get_value(self):
        """
        Get the appropriate value based on which column is populated.
        
        Returns:
            The rule value in its appropriate type
        """
        if self.rule_value_int is not None:
            return self.rule_value_int
        elif self.rule_value_float is not None:
            return self.rule_value_float
        elif self.rule_value_bool is not None:
            return self.rule_value_bool
        elif self.rule_value_json is not None:
            return self.get_json_value()
        elif self.rule_value_str is not None:
            return self.rule_value_str
        return None
    
    def get_json_value(self):
        """Get JSON value as Python object."""
        if not self.rule_value_json:
            return None
        try:
            return json.loads(self.rule_value_json)
        except json.JSONDecodeError:
            return None
    
    def set_json_value(self, value):
        """Set JSON value from Python object."""
        if value is None:
            self.rule_value_json = None
        else:
            self.rule_value_json = json.dumps(value)
