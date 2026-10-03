"""Room and Bench schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class BenchBase(BaseModel):
    """Base bench schema."""
    bench_number: str
    row: int
    column: int
    positions: int = 2


class BenchCreate(BenchBase):
    """Bench creation schema."""
    room_id: int


class Bench(BenchBase):
    """Bench response schema."""
    id: int
    room_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoomBase(BaseModel):
    """Base room schema."""
    name: str
    building: Optional[str] = None
    floor: Optional[int] = None
    capacity: int
    rows: int
    columns: int


class RoomCreate(RoomBase):
    """Room creation schema."""
    pass


class RoomUpdate(BaseModel):
    """Room update schema."""
    name: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    rows: Optional[int] = None
    columns: Optional[int] = None


class Room(RoomBase):
    """Room response schema."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoomWithBenches(Room):
    """Room with benches."""
    benches: List[Bench] = []
