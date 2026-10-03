"""Pydantic schemas for rule configuration."""
from typing import Optional, Any, Union
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from app.models.rule import ExamType, RuleCategory


class RuleBase(BaseModel):
    """Base schema for rule data."""
    exam_type: ExamType
    category: RuleCategory
    rule_key: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    is_active: bool = True
    validation_rule: Optional[str] = Field(None, max_length=200)


class RuleCreate(RuleBase):
    """Schema for creating a new rule."""
    rule_value_int: Optional[int] = None
    rule_value_float: Optional[float] = None
    rule_value_str: Optional[str] = Field(None, max_length=500)
    rule_value_bool: Optional[bool] = None
    rule_value_json: Optional[dict] = None
    
    @field_validator('rule_key')
    @classmethod
    def validate_key_format(cls, v):
        """Validate rule key format (snake_case)."""
        if not v.replace('_', '').isalnum():
            raise ValueError('Rule key must be alphanumeric with underscores')
        return v.lower()
    
    def model_post_init(self, __context) -> None:
        """Ensure at least one value field is populated."""
        value_fields = [
            self.rule_value_int,
            self.rule_value_float,
            self.rule_value_str,
            self.rule_value_bool,
            self.rule_value_json
        ]
        if all(v is None for v in value_fields):
            raise ValueError('At least one rule_value field must be populated')


class RuleUpdate(BaseModel):
    """Schema for updating a rule."""
    rule_value_int: Optional[int] = None
    rule_value_float: Optional[float] = None
    rule_value_str: Optional[str] = Field(None, max_length=500)
    rule_value_bool: Optional[bool] = None
    rule_value_json: Optional[dict] = None
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None
    validation_rule: Optional[str] = Field(None, max_length=200)


class RuleResponse(RuleBase):
    """Schema for rule response."""
    id: int
    rule_value_int: Optional[int]
    rule_value_float: Optional[float]
    rule_value_str: Optional[str]
    rule_value_bool: Optional[bool]
    rule_value_json: Optional[dict]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic configuration."""
        from_attributes = True


# Alias for backwards compatibility
Rule = RuleResponse


class RuleValueResponse(BaseModel):
    """Simplified schema returning just the rule value."""
    exam_type: ExamType
    category: RuleCategory
    rule_key: str
    value: Union[int, float, str, bool, dict]
    description: str
    
    class Config:
        """Pydantic configuration."""
        from_attributes = True
