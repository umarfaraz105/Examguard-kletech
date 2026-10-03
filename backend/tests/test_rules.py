"""Unit tests for rule provider and validator."""
import pytest
from sqlalchemy.orm import Session
from app.models.rule import Rule, ExamType, RuleCategory
from app.services.rules.rule_provider import RuleProvider, RuleNotFoundException
from app.services.rules.rule_validator import RuleValidator, RuleValidationError


class TestRuleProvider:
    """Test cases for RuleProvider."""
    
    def test_get_int_rule(self, db: Session):
        """Test getting integer rule value."""
        # Create test rule
        rule = Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.TIMING,
            rule_key="duration_minutes",
            rule_value_int=60,
            description="Exam duration in minutes",
            is_active=True
        )
        db.add(rule)
        db.commit()
        
        # Test retrieval
        provider = RuleProvider(db)
        duration = provider.get_int(ExamType.ISA1, "duration_minutes")
        
        assert duration == 60
    
    def test_get_float_rule(self, db: Session):
        """Test getting float rule value."""
        # Create test rule (1:30 ratio = 0.0333)
        rule = Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.INVIGILATION,
            rule_key="invigilator_ratio",
            rule_value_float=0.0333,
            description="Invigilator to student ratio",
            is_active=True
        )
        db.add(rule)
        db.commit()
        
        # Test retrieval
        provider = RuleProvider(db)
        ratio = provider.get_float(ExamType.ISA1, "invigilator_ratio")
        
        assert ratio == pytest.approx(0.0333, rel=1e-4)
    
    def test_get_str_rule(self, db: Session):
        """Test getting string rule value."""
        rule = Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.GENERAL,
            rule_key="exam_format",
            rule_value_str="written",
            description="Exam format type",
            is_active=True
        )
        db.add(rule)
        db.commit()
        
        provider = RuleProvider(db)
        format_type = provider.get_str(ExamType.ESA, "exam_format")
        
        assert format_type == "written"
    
    def test_get_bool_rule(self, db: Session):
        """Test getting boolean rule value."""
        rule = Rule(
            exam_type=ExamType.ESA,
            category=RuleCategory.ELIGIBILITY,
            rule_key="allow_calculator",
            rule_value_bool=False,
            description="Whether calculators are allowed",
            is_active=True
        )
        db.add(rule)
        db.commit()
        
        provider = RuleProvider(db)
        allow_calc = provider.get_bool(ExamType.ESA, "allow_calculator")
        
        assert allow_calc is False
    
    def test_get_json_rule(self, db: Session):
        """Test getting JSON rule value."""
        test_json = {"morning": "09:00-12:00", "afternoon": "14:00-17:00"}
        rule = Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.TIMING,
            rule_key="session_timings",
            rule_value_json=test_json,
            description="Session time slots",
            is_active=True
        )
        db.add(rule)
        db.commit()
        
        provider = RuleProvider(db)
        timings = provider.get_json(ExamType.ISA1, "session_timings")
        
        assert timings == test_json
    
    def test_rule_not_found(self, db: Session):
        """Test exception when rule doesn't exist."""
        provider = RuleProvider(db)
        
        with pytest.raises(RuleNotFoundException):
            provider.get_int(ExamType.ISA1, "nonexistent_rule")
    
    def test_inactive_rule_not_returned(self, db: Session):
        """Test that inactive rules are not returned."""
        rule = Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.TIMING,
            rule_key="duration_minutes",
            rule_value_int=60,
            description="Exam duration",
            is_active=False  # Inactive
        )
        db.add(rule)
        db.commit()
        
        provider = RuleProvider(db)
        
        with pytest.raises(RuleNotFoundException):
            provider.get_int(ExamType.ISA1, "duration_minutes")
    
    def test_get_with_default(self, db: Session):
        """Test getting rule with default value."""
        provider = RuleProvider(db)
        
        # Rule doesn't exist, should return default
        duration = provider.get_int(
            ExamType.ISA1, 
            "nonexistent_rule", 
            default=90
        )
        
        assert duration == 90
    
    def test_get_all_for_exam_type(self, db: Session):
        """Test getting all rules for an exam type."""
        # Create multiple rules
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
                category=RuleCategory.SEATING,
                rule_key="students_per_bench",
                rule_value_int=2,
                description="Students per bench",
                is_active=True
            ),
            Rule(
                exam_type=ExamType.ESA,  # Different exam type
                category=RuleCategory.TIMING,
                rule_key="duration_minutes",
                rule_value_int=180,
                description="Duration",
                is_active=True
            )
        ]
        db.add_all(rules)
        db.commit()
        
        provider = RuleProvider(db)
        isa1_rules = provider.get_all_for_exam_type(ExamType.ISA1)
        
        assert len(isa1_rules) == 2
        assert all(r.exam_type == ExamType.ISA1 for r in isa1_rules)
    
    def test_cache_functionality(self, db: Session):
        """Test that caching works correctly."""
        rule = Rule(
            exam_type=ExamType.ISA1,
            category=RuleCategory.TIMING,
            rule_key="duration_minutes",
            rule_value_int=60,
            description="Duration",
            is_active=True
        )
        db.add(rule)
        db.commit()
        
        provider = RuleProvider(db)
        
        # First call - should query database
        duration1 = provider.get_int(ExamType.ISA1, "duration_minutes")
        
        # Second call - should use cache
        duration2 = provider.get_int(ExamType.ISA1, "duration_minutes")
        
        assert duration1 == duration2 == 60
        
        # Clear cache
        provider.clear_cache()
        
        # Should query database again
        duration3 = provider.get_int(ExamType.ISA1, "duration_minutes")
        assert duration3 == 60


class TestRuleValidator:
    """Test cases for RuleValidator."""
    
    def test_validate_duration_within_range(self):
        """Test duration validation within valid range."""
        RuleValidator.validate_value("duration_minutes", 60)
        RuleValidator.validate_value("duration_minutes", 180)
        # Should not raise exception
    
    def test_validate_duration_below_min(self):
        """Test duration validation below minimum."""
        with pytest.raises(RuleValidationError):
            RuleValidator.validate_value("duration_minutes", 10)
    
    def test_validate_duration_above_max(self):
        """Test duration validation above maximum."""
        with pytest.raises(RuleValidationError):
            RuleValidator.validate_value("duration_minutes", 300)
    
    def test_validate_students_per_bench(self):
        """Test students per bench validation."""
        RuleValidator.validate_value("students_per_bench", 1)
        RuleValidator.validate_value("students_per_bench", 2)
        
        with pytest.raises(RuleValidationError):
            RuleValidator.validate_value("students_per_bench", 5)
    
    def test_validate_invigilator_ratio(self):
        """Test invigilator ratio validation."""
        RuleValidator.validate_value("invigilator_ratio", 0.0333)
        RuleValidator.validate_value("invigilator_ratio", 0.5)
        
        with pytest.raises(RuleValidationError):
            RuleValidator.validate_value("invigilator_ratio", 1.5)
    
    def test_validate_type_mismatch(self):
        """Test validation with wrong type."""
        with pytest.raises(RuleValidationError):
            RuleValidator.validate_value("duration_minutes", 60.5)  # Should be int
    
    def test_validate_rule_set_consistent(self):
        """Test validation of consistent rule set."""
        rules = {
            "duration_minutes": 60,
            "students_per_bench": 2,
            "max_students_per_room": 60,
            "invigilator_ratio": 0.05,  # 1:20
            "min_invigilators_per_room": 2
        }
        
        RuleValidator.validate_rule_set(ExamType.ISA1, rules)
        # Should not raise exception
    
    def test_validate_seating_capacity_inconsistent(self):
        """Test validation catches inconsistent seating rules."""
        rules = {
            "students_per_bench": 2,
            "max_students_per_room": 61  # Not divisible by 2
        }
        
        with pytest.raises(RuleValidationError, match="divisible"):
            RuleValidator.validate_rule_set(ExamType.ISA1, rules)
    
    def test_validate_invigilation_impossible(self):
        """Test validation catches impossible invigilation constraints."""
        rules = {
            "invigilator_ratio": 0.1,  # 1:10 ratio
            "min_invigilators_per_room": 3,  # Need 3 invigilators
            "max_students_per_room": 20  # But only 20 students (would need 30)
        }
        
        with pytest.raises(RuleValidationError, match="impossible"):
            RuleValidator.validate_rule_set(ExamType.ISA1, rules)
    
    def test_get_required_rules(self):
        """Test getting required rules for exam type."""
        required = RuleValidator.get_required_rules(ExamType.ISA1)
        
        assert "duration_minutes" in required
        assert "students_per_bench" in required
        assert "invigilator_ratio" in required
        assert len(required) >= 5
