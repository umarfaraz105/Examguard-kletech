"""Base repository pattern for data access abstraction."""
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

# Generic type for model classes
ModelType = TypeVar('ModelType')
CreateSchemaType = TypeVar('CreateSchemaType')
UpdateSchemaType = TypeVar('UpdateSchemaType')


class BaseRepository(Generic[ModelType], ABC):
    """
    Base repository class providing common data access patterns.
    
    This abstracts database operations and provides a consistent
    interface for engines to interact with data without tight
    coupling to specific models or SQLAlchemy details.
    """
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy session
        """
        self.db = db
    
    @property
    @abstractmethod
    def model(self) -> type:
        """Return the model class this repository manages."""
        pass
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        """
        Get entity by ID.
        
        Args:
            id: Entity ID
            
        Returns:
            Entity or None if not found
        """
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """
        Get all entities with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of entities
        """
        return self.db.query(self.model).offset(skip).limit(limit).all()
    
    def get_by_filters(self, filters: Dict[str, Any]) -> List[ModelType]:
        """
        Get entities by filter conditions.
        
        Args:
            filters: Dictionary of field->value filters
            
        Returns:
            List of matching entities
        """
        query = self.db.query(self.model)
        
        for field, value in filters.items():
            if hasattr(self.model, field):
                if isinstance(value, list):
                    query = query.filter(getattr(self.model, field).in_(value))
                else:
                    query = query.filter(getattr(self.model, field) == value)
        
        return query.all()
    
    def create(self, obj_data: Dict[str, Any]) -> ModelType:
        """
        Create new entity.
        
        Args:
            obj_data: Dictionary with entity data
            
        Returns:
            Created entity
        """
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def update(self, db_obj: ModelType, update_data: Dict[str, Any]) -> ModelType:
        """
        Update existing entity.
        
        Args:
            db_obj: Entity to update
            update_data: Dictionary with update data
            
        Returns:
            Updated entity
        """
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: int) -> bool:
        """
        Delete entity by ID.
        
        Args:
            id: Entity ID
            
        Returns:
            True if deleted, False if not found
        """
        db_obj = self.get_by_id(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count entities with optional filters.
        
        Args:
            filters: Optional filter conditions
            
        Returns:
            Number of matching entities
        """
        query = self.db.query(self.model)
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)
        
        return query.count()
    
    def exists(self, id: int) -> bool:
        """
        Check if entity exists.
        
        Args:
            id: Entity ID
            
        Returns:
            True if exists
        """
        return self.db.query(self.model).filter(self.model.id == id).count() > 0
    
    def get_or_create(self, defaults: Dict[str, Any], **kwargs) -> tuple[ModelType, bool]:
        """
        Get entity or create if not exists.
        
        Args:
            defaults: Default values for creation
            **kwargs: Lookup fields
            
        Returns:
            Tuple of (entity, created_flag)
        """
        instance = self.db.query(self.model).filter_by(**kwargs).first()
        
        if instance:
            return instance, False
        else:
            params = dict((k, v) for k, v in kwargs.items())
            params.update(defaults)
            instance = self.create(params)
            return instance, True


class PlanRepository(BaseRepository):
    """Repository for Plan entities."""
    
    @property
    def model(self):
        from app.models.plan import Plan
        return Plan
    
    def get_with_courses(self, plan_id: int):
        """Get plan with associated courses."""
        from sqlalchemy.orm import joinedload
        from app.models.plan import Plan
        
        return self.db.query(Plan).options(
            joinedload(Plan.courses)
        ).filter(Plan.id == plan_id).first()
    
    def get_active_plans(self):
        """Get all active plans."""
        from app.models.plan import Plan, PlanStatus
        
        return self.db.query(Plan).filter(
            Plan.status.in_([PlanStatus.APPROVED, PlanStatus.PUBLISHED])
        ).all()


class CourseRepository(BaseRepository):
    """Repository for Course entities."""
    
    @property
    def model(self):
        from app.models.course import Course
        return Course
    
    def get_by_exam_type(self, exam_type: str):
        """Get courses by exam type."""
        from app.models.course import Course
        
        return self.db.query(Course).filter(
            Course.exam_type == exam_type
        ).all()
    
    def get_by_branch_and_semester(self, branch: str, semester: int):
        """Get courses by branch and semester."""
        from app.models.course import Course
        
        return self.db.query(Course).filter(
            and_(
                Course.branch == branch,
                Course.semester == semester
            )
        ).all()


class StudentRepository(BaseRepository):
    """Repository for Student entities."""
    
    @property
    def model(self):
        from app.models.student import Student
        return Student
    
    def get_enrolled_in_course(self, course_id: int):
        """Get students enrolled in a specific course."""
        from app.models.student import Student
        from app.models.course import Course, student_course
        
        return self.db.query(Student).join(
            student_course,
            Student.id == student_course.c.student_id
        ).filter(
            student_course.c.course_id == course_id
        ).all()
    
    def get_by_branch_semester(self, branch: str, semester: int):
        """Get students by branch and semester."""
        from app.models.student import Student
        
        return self.db.query(Student).filter(
            and_(
                Student.branch == branch,
                Student.semester == semester
            )
        ).all()


class RoomRepository(BaseRepository):
    """Repository for Room entities."""
    
    @property
    def model(self):
        from app.models.room import Room
        return Room
    
    def get_available_rooms(self):
        """Get all available rooms."""
        from app.models.room import Room
        
        return self.db.query(Room).filter(
            Room.is_available == True
        ).all()
    
    def get_with_benches(self, room_id: int):
        """Get room with associated benches."""
        from sqlalchemy.orm import joinedload
        from app.models.room import Room
        
        return self.db.query(Room).options(
            joinedload(Room.benches)
        ).filter(Room.id == room_id).first()
    
    def get_by_capacity_range(self, min_capacity: int, max_capacity: int):
        """Get rooms within capacity range."""
        from app.models.room import Room
        
        return self.db.query(Room).filter(
            and_(
                Room.capacity >= min_capacity,
                Room.capacity <= max_capacity,
                Room.is_available == True
            )
        ).all()


class RepositoryManager:
    """
    Factory for creating repository instances.
    
    This provides a centralized way for engines to access
    data repositories without importing specific classes.
    """
    
    def __init__(self, db: Session):
        """
        Initialize repository manager.
        
        Args:
            db: Database session
        """
        self.db = db
        self._repositories = {}
    
    def get_plan_repository(self) -> PlanRepository:
        """Get plan repository instance."""
        if 'plan' not in self._repositories:
            self._repositories['plan'] = PlanRepository(self.db)
        return self._repositories['plan']
    
    def get_course_repository(self) -> CourseRepository:
        """Get course repository instance."""
        if 'course' not in self._repositories:
            self._repositories['course'] = CourseRepository(self.db)
        return self._repositories['course']
    
    def get_student_repository(self) -> StudentRepository:
        """Get student repository instance."""
        if 'student' not in self._repositories:
            self._repositories['student'] = StudentRepository(self.db)
        return self._repositories['student']
    
    def get_room_repository(self) -> RoomRepository:
        """Get room repository instance."""
        if 'room' not in self._repositories:
            self._repositories['room'] = RoomRepository(self.db)
        return self._repositories['room']