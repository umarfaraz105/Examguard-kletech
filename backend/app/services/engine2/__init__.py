"""
Engine 2: Room & Seating Allocation Engine

Allocates rooms and assigns exact seats to students.
Ensures no two students from the same branch are neighbors (8 directions).
"""
from app.services.engine2.room_allocator import RoomAllocator, Engine2RoomSeatingEngine
from app.services.engine2.seat_allocator import SeatAllocator
from app.services.engine2.branch_separator import BranchSeparator

__all__ = ["RoomAllocator", "SeatAllocator", "BranchSeparator", "Engine2RoomSeatingEngine"]
