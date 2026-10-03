"""Seat assignment model - output of Engine 2."""
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SeatAssignment(BaseModel):
    """
    Seat assignment model.
    
    Represents the exact seat allocated to a student for an exam.
    This is the output of Engine 2 (Room & Seating).
    
    Seat code format: R-101-B04-L
    - R-101: Room code
    - B04: Bench number (zero-padded)
    - L: Position (L=Left, R=Right, M=Middle)
    
    Attributes:
        scheduled_exam_id: Foreign key to scheduled exam
        student_id: Foreign key to student
        bench_id: Foreign key to bench
        seat_code: Unique seat identifier (e.g., "R-101-B04-L")
        position: Position on bench (L, R, M)
        row_number: Row number in room (for visualization)
        column_number: Column number in room (for visualization)
        is_confirmed: Whether assignment is confirmed
        remarks: Additional notes
    """
    
    __tablename__ = "seat_assignments"
    
    # Foreign keys
    scheduled_exam_id = Column(
        Integer, 
        ForeignKey('scheduled_exams.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
    )
    student_id = Column(
        Integer, 
        ForeignKey('students.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
    )
    bench_id = Column(
        Integer, 
        ForeignKey('benches.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
    )
    
    # Seat details
    seat_code = Column(String(50), nullable=False, index=True)
    position = Column(String(1), nullable=False)  # L, R, M
    row_number = Column(Integer, nullable=True)
    column_number = Column(Integer, nullable=True)
    is_confirmed = Column(Boolean, default=False, nullable=False)
    remarks = Column(String(500), nullable=True)
    
    # Relationships
    scheduled_exam = relationship("ScheduledExam", back_populates="seat_assignments")
    student = relationship("Student", back_populates="seat_assignments")
    bench = relationship("Bench", back_populates="seat_assignments")
    
    def __repr__(self) -> str:
        """String representation."""
        student_usn = self.student.usn if self.student else "N/A"
        return f"<SeatAssignment(student={student_usn}, seat={self.seat_code})>"
    
    @property
    def room_code(self) -> str:
        """Extract room code from seat code."""
        # Seat code format: R-101-B04-L
        parts = self.seat_code.split('-')
        if len(parts) >= 2:
            return f"{parts[0]}-{parts[1]}"
        return "UNKNOWN"
    
    @property
    def bench_number(self) -> int:
        """Extract bench number from seat code."""
        # Seat code format: R-101-B04-L
        parts = self.seat_code.split('-')
        if len(parts) >= 3:
            bench_part = parts[2]  # "B04"
            return int(bench_part[1:])  # Remove 'B', get number
        return 0
    
    def get_neighbor_positions(self) -> list[tuple[int, int]]:
        """
        Get positions of all 8 neighbors (for branch separation check).
        
        Returns:
            List of (row, col) tuples for all 8 surrounding positions
        """
        if self.row_number is None or self.column_number is None:
            return []
        
        neighbors = []
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue  # Skip self
                neighbors.append((self.row_number + dr, self.column_number + dc))
        
        return neighbors
