"""
Rule Provider - Central interface for accessing exam rules.

All engines MUST use RuleProvider to access rules (never hard-code values).
This ensures rule changes propagate across all engines without code changes.
"""
from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.rule import Rule, ExamType, RuleCategory
from app.schemas.rule import RuleValueResponse


class RuleNotFoundException(Exception):
    """Raised when a requested rule is not found."""
    pass


class RuleProvider:
    """
    Central provider for accessing exam configuration rules.
    
    All engines must use this provider to read rules.
    Never hard-code rule values in engine code.
    
    Usage:
        provider = RuleProvider(db)
        duration = provider.get_int(ExamType.ISA1, "duration_minutes")
        ratio = provider.get_float(ExamType.ESA, "invigilator_ratio")
    """
    
    def __init__(self, db: Session):
        """
        Initialize rule provider with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self._cache: Dict[str, Any] = {}
    
    def _get_rule(
        self, 
        exam_type: ExamType, 
        rule_key: str,
        category: Optional[RuleCategory] = None
    ) -> Rule:
        """
        Internal method to fetch a rule from database.
        
        Args:
            exam_type: Type of exam
            rule_key: Rule identifier
            category: Optional category filter
            
        Returns:
            Rule object
            
        Raises:
            RuleNotFoundException: If rule not found or inactive
        """
        cache_key = f"{exam_type.value}:{rule_key}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        query = self.db.query(Rule).filter(
            and_(
                Rule.exam_type == exam_type,
                Rule.rule_key == rule_key,
                Rule.is_active == True
            )
        )
        
        if category:
            query = query.filter(Rule.category == category)
        
        rule = query.first()
        
        if not rule:
            raise RuleNotFoundException(
                f"Rule not found: exam_type={exam_type.value}, "
                f"key={rule_key}, category={category}"
            )
        
        self._cache[cache_key] = rule
        return rule
    
    def get_int(
        self, 
        exam_type: ExamType, 
        rule_key: str,
        default: Optional[int] = None
    ) -> int:
        """
        Get integer rule value.
        
        Args:
            exam_type: Type of exam
            rule_key: Rule identifier
            default: Default value if rule not found (None raises exception)
            
        Returns:
            Integer rule value
            
        Example:
            duration = provider.get_int(ExamType.ISA1, "duration_minutes")
            # Returns 60
        """
        try:
            rule = self._get_rule(exam_type, rule_key)
            if rule.rule_value_int is None:
                raise ValueError(
                    f"Rule {rule_key} for {exam_type.value} is not an integer"
                )
            return rule.rule_value_int
        except RuleNotFoundException:
            if default is not None:
                return default
            raise
    
    def get_float(
        self, 
        exam_type: ExamType, 
        rule_key: str,
        default: Optional[float] = None
    ) -> float:
        """
        Get float rule value.
        
        Args:
            exam_type: Type of exam
            rule_key: Rule identifier
            default: Default value if rule not found
            
        Returns:
            Float rule value
            
        Example:
            ratio = provider.get_float(ExamType.ESA, "invigilator_ratio")
            # Returns 0.0417 (1/24)
        """
        try:
            rule = self._get_rule(exam_type, rule_key)
            if rule.rule_value_float is None:
                raise ValueError(
                    f"Rule {rule_key} for {exam_type.value} is not a float"
                )
            return rule.rule_value_float
        except RuleNotFoundException:
            if default is not None:
                return default
            raise
    
    def get_str(
        self, 
        exam_type: ExamType, 
        rule_key: str,
        default: Optional[str] = None
    ) -> str:
        """
        Get string rule value.
        
        Args:
            exam_type: Type of exam
            rule_key: Rule identifier
            default: Default value if rule not found
            
        Returns:
            String rule value
        """
        try:
            rule = self._get_rule(exam_type, rule_key)
            if rule.rule_value_str is None:
                raise ValueError(
                    f"Rule {rule_key} for {exam_type.value} is not a string"
                )
            return rule.rule_value_str
        except RuleNotFoundException:
            if default is not None:
                return default
            raise
    
    def get_bool(
        self, 
        exam_type: ExamType, 
        rule_key: str,
        default: Optional[bool] = None
    ) -> bool:
        """
        Get boolean rule value.
        
        Args:
            exam_type: Type of exam
            rule_key: Rule identifier
            default: Default value if rule not found
            
        Returns:
            Boolean rule value
        """
        try:
            rule = self._get_rule(exam_type, rule_key)
            if rule.rule_value_bool is None:
                raise ValueError(
                    f"Rule {rule_key} for {exam_type.value} is not a boolean"
                )
            return rule.rule_value_bool
        except RuleNotFoundException:
            if default is not None:
                return default
            raise
    
    def get_json(
        self, 
        exam_type: ExamType, 
        rule_key: str,
        default: Optional[dict] = None
    ) -> dict:
        """
        Get JSON rule value.
        
        Args:
            exam_type: Type of exam
            rule_key: Rule identifier
            default: Default value if rule not found
            
        Returns:
            Dictionary rule value
        """
        try:
            rule = self._get_rule(exam_type, rule_key)
            if rule.rule_value_json is None:
                raise ValueError(
                    f"Rule {rule_key} for {exam_type.value} is not JSON"
                )
            return rule.rule_value_json
        except RuleNotFoundException:
            if default is not None:
                return default
            raise
    
    def get_value(
        self, 
        exam_type: ExamType, 
        rule_key: str
    ) -> Union[int, float, str, bool, dict]:
        """
        Get rule value in its native type.
        
        Args:
            exam_type: Type of exam
            rule_key: Rule identifier
            
        Returns:
            Rule value in appropriate type
        """
        rule = self._get_rule(exam_type, rule_key)
        return rule.get_value()
    
    def get_all_for_exam_type(
        self, 
        exam_type: ExamType,
        category: Optional[RuleCategory] = None
    ) -> List[RuleValueResponse]:
        """
        Get all active rules for a specific exam type.
        
        Args:
            exam_type: Type of exam
            category: Optional category filter
            
        Returns:
            List of rule value responses
        """
        query = self.db.query(Rule).filter(
            and_(
                Rule.exam_type == exam_type,
                Rule.is_active == True
            )
        )
        
        if category:
            query = query.filter(Rule.category == category)
        
        rules = query.all()
        
        return [
            RuleValueResponse(
                exam_type=rule.exam_type,
                category=rule.category,
                rule_key=rule.rule_key,
                value=rule.get_value(),
                description=rule.description
            )
            for rule in rules
        ]
    
    def get_all_by_category(
        self, 
        category: RuleCategory,
        exam_type: Optional[ExamType] = None
    ) -> List[RuleValueResponse]:
        """
        Get all active rules in a category.
        
        Args:
            category: Rule category
            exam_type: Optional exam type filter
            
        Returns:
            List of rule value responses
        """
        query = self.db.query(Rule).filter(
            and_(
                Rule.category == category,
                Rule.is_active == True
            )
        )
        
        if exam_type:
            query = query.filter(Rule.exam_type == exam_type)
        
        rules = query.all()
        
        return [
            RuleValueResponse(
                exam_type=rule.exam_type,
                category=rule.category,
                rule_key=rule.rule_key,
                value=rule.get_value(),
                description=rule.description
            )
            for rule in rules
        ]
    
    def clear_cache(self) -> None:
        """Clear the internal cache. Useful after rule updates."""
        self._cache.clear()
