"""
Rule validation utilities.

Validates rule values against constraints and business logic.
"""
from typing import Optional, Dict, Any
from app.models.rule import ExamType, RuleCategory


class RuleValidationError(Exception):
    """Raised when rule validation fails."""
    pass


class RuleValidator:
    """
    Validator for rule configurations.
    
    Ensures rule values are consistent and meet business requirements.
    """
    
    # Validation constraints for specific rule keys
    CONSTRAINTS = {
        "duration_minutes": {
            "min": 15,
            "max": 240,
            "type": int,
            "description": "Exam duration must be between 15 and 240 minutes"
        },
        "students_per_bench": {
            "min": 1,
            "max": 3,
            "type": int,
            "description": "Students per bench must be between 1 and 3"
        },
        "min_gap_days": {
            "min": 0,
            "max": 14,
            "type": int,
            "description": "Minimum gap days must be between 0 and 14"
        },
        "invigilator_ratio": {
            "min": 0.01,
            "max": 1.0,
            "type": float,
            "description": "Invigilator ratio must be between 0.01 and 1.0"
        },
        "min_invigilators_per_room": {
            "min": 1,
            "max": 10,
            "type": int,
            "description": "Minimum invigilators per room must be between 1 and 10"
        },
        "max_students_per_room": {
            "min": 10,
            "max": 200,
            "type": int,
            "description": "Maximum students per room must be between 10 and 200"
        },
        "min_attendance_percent": {
            "min": 0,
            "max": 100,
            "type": int,
            "description": "Minimum attendance percentage must be between 0 and 100"
        }
    }
    
    @classmethod
    def validate_value(
        cls,
        rule_key: str,
        value: Any,
        exam_type: Optional[ExamType] = None
    ) -> None:
        """
        Validate a rule value against constraints.
        
        Args:
            rule_key: Rule identifier
            value: Value to validate
            exam_type: Optional exam type for context
            
        Raises:
            RuleValidationError: If validation fails
        """
        if rule_key not in cls.CONSTRAINTS:
            # No specific constraints defined for this key
            return
        
        constraint = cls.CONSTRAINTS[rule_key]
        
        # Check type
        expected_type = constraint["type"]
        if not isinstance(value, expected_type):
            raise RuleValidationError(
                f"Rule '{rule_key}' must be of type {expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
        
        # Check range
        if "min" in constraint and value < constraint["min"]:
            raise RuleValidationError(
                f"Rule '{rule_key}' value {value} is below minimum "
                f"{constraint['min']}: {constraint['description']}"
            )
        
        if "max" in constraint and value > constraint["max"]:
            raise RuleValidationError(
                f"Rule '{rule_key}' value {value} exceeds maximum "
                f"{constraint['max']}: {constraint['description']}"
            )
    
    @classmethod
    def validate_rule_set(
        cls,
        exam_type: ExamType,
        rules: Dict[str, Any]
    ) -> None:
        """
        Validate a complete set of rules for consistency.
        
        Args:
            exam_type: Type of exam
            rules: Dictionary of rule_key -> value
            
        Raises:
            RuleValidationError: If rules are inconsistent
        """
        # Validate each rule individually
        for rule_key, value in rules.items():
            cls.validate_value(rule_key, value, exam_type)
        
        # Cross-rule validations
        cls._validate_seating_capacity(rules)
        cls._validate_invigilation_requirements(rules)
    
    @classmethod
    def _validate_seating_capacity(cls, rules: Dict[str, Any]) -> None:
        """
        Validate seating-related rules are consistent.
        
        Args:
            rules: Dictionary of rule_key -> value
            
        Raises:
            RuleValidationError: If seating rules are inconsistent
        """
        if "students_per_bench" in rules and "max_students_per_room" in rules:
            students_per_bench = rules["students_per_bench"]
            max_students = rules["max_students_per_room"]
            
            # Ensure max students is divisible by students per bench
            if max_students % students_per_bench != 0:
                raise RuleValidationError(
                    f"max_students_per_room ({max_students}) should be "
                    f"divisible by students_per_bench ({students_per_bench})"
                )
    
    @classmethod
    def _validate_invigilation_requirements(cls, rules: Dict[str, Any]) -> None:
        """
        Validate invigilation-related rules are consistent.
        
        Args:
            rules: Dictionary of rule_key -> value
            
        Raises:
            RuleValidationError: If invigilation rules are inconsistent
        """
        if all(k in rules for k in ["invigilator_ratio", "min_invigilators_per_room"]):
            ratio = rules["invigilator_ratio"]
            min_invigilators = rules["min_invigilators_per_room"]
            
            # Calculate minimum students needed to satisfy both constraints
            min_students_for_ratio = min_invigilators / ratio
            
            if "max_students_per_room" in rules:
                max_students = rules["max_students_per_room"]
                
                if min_students_for_ratio > max_students:
                    raise RuleValidationError(
                        f"Invigilator constraints are impossible: "
                        f"min_invigilators_per_room={min_invigilators} and "
                        f"invigilator_ratio={ratio} require at least "
                        f"{min_students_for_ratio:.0f} students, but "
                        f"max_students_per_room={max_students}"
                    )
    
    @classmethod
    def get_required_rules(cls, exam_type: ExamType) -> list[str]:
        """
        Get list of required rule keys for an exam type.
        
        Args:
            exam_type: Type of exam
            
        Returns:
            List of required rule keys
        """
        # Core rules required for all exam types
        core_rules = [
            "duration_minutes",
            "students_per_bench",
            "min_gap_days",
            "invigilator_ratio",
            "min_invigilators_per_room"
        ]
        
        return core_rules
