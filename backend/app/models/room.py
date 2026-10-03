"""Room and seating infrastructure models."""
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Room(BaseModel):
    """
    Examination room model.
    
    Represents a physical room available for examinations.
    
    Attributes:
        room_code: Unique room identifier (e.g., "R-101", "LAB-205")
        room_name: Full room name/description
        building: Building name or identifier
        floor: Floor number
        capacity: Maximum student capacity
        num_benches: Number of benches in the room
        is_available: Whether room is available for exams
        room_type: Type of room (CLASSROOM, LAB, AUDITORIUM)
        has_projector: Whether room has projector
        has_ac: Whether room is air-conditioned
        remarks: Additional notes about the room
    """
    
    __tablename__ = "rooms"
    
    room_code = Column(String(20), unique=True, nullable=False, index=True)
    room_name = Column(String(255), nullable=False)
    building = Column(String(100), nullable=True, index=True)
    floor = Column(Integer, nullable=True)
    capacity = Column(Integer, nullable=False)
    num_benches = Column(Integer, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    room_type = Column(String(50), nullable=True)
    has_projector = Column(Boolean, default=False)
    has_ac = Column(Boolean, default=False)
    remarks = Column(String(500), nullable=True)
    
    # One-to-many with benches
    benches = relationship(
        "Bench",
        back_populates="room",
        cascade="all, delete-orphan"
    )
    
    # One-to-many with scheduled exams
    scheduled_exams = relationship(
        "ScheduledExam",
        back_populates="room"
    )
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<Room(code={self.room_code}, capacity={self.capacity}, benches={self.num_benches})>"
    
    @property
    def max_students_per_bench(self) -> int:
        """
        Calculate maximum students per bench based on capacity.
        
        This is an estimate; actual allocation uses rules from RuleProvider.
        """
        if self.num_benches == 0:
            return 0
        return self.capacity // self.num_benches


class Bench(BaseModel):
    """
    Bench model for granular seating arrangement.
    
    Each bench can hold multiple students (typically 1-3 based on exam type).
    
    Attributes:
        room_id: Foreign key to room
        bench_number: Bench number within room (e.g., 1, 2, 3...)
        row_number: Row number (for organizing benches in grid)
        column_number: Column number (for organizing benches in grid)
        is_available: Whether bench is usable
        remarks: Notes about the bench
    """
    
    __tablename__ = "benches"
    
    room_id = Column(Integer, ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    bench_number = Column(Integer, nullable=False)
    row_number = Column(Integer, nullable=True)
    column_number = Column(Integer, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    remarks = Column(String(255), nullable=True)
    
    # Relationships
    room = relationship("Room", back_populates="benches")
    
    # One-to-many with seat assignments
    seat_assignments = relationship(
        "SeatAssignment",
        back_populates="bench",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<Bench(room={self.room.room_code if self.room else 'N/A'}, bench={self.bench_number})>"
    
    def get_seat_code(self, position: str) -> str:
        """
        Generate seat code in format: R-101-B04-L
        
        Args:
            position: Position identifier (L=Left, R=Right, M=Middle)
            
        Returns:
            Formatted seat code
        """
        room_code = self.room.room_code if self.room else "UNKNOWN"
        return f"{room_code}-B{self.bench_number:02d}-{position}"
