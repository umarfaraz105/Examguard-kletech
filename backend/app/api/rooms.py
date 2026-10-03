"""Room management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.models.room import Room as RoomModel, Bench as BenchModel
from app.schemas.room import Room, RoomCreate, RoomUpdate, RoomWithBenches, Bench, BenchCreate

router = APIRouter()


@router.get("/", response_model=List[Room])
def list_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all rooms."""
    return db.query(RoomModel).offset(skip).limit(limit).all()


@router.get("/{room_id}", response_model=RoomWithBenches)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get room with benches."""
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.post("/", response_model=Room, status_code=status.HTTP_201_CREATED)
def create_room(
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Create a new room."""
    db_room = RoomModel(**room_in.model_dump())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


@router.patch("/{room_id}", response_model=Room)
def update_room(
    room_id: int,
    room_update: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Update a room."""
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    update_data = room_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)
    
    db.commit()
    db.refresh(room)
    return room


@router.post("/{room_id}/benches", response_model=Bench, status_code=status.HTTP_201_CREATED)
def create_bench(
    room_id: int,
    bench_in: BenchCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Add a bench to a room."""
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    db_bench = BenchModel(**bench_in.model_dump())
    db.add(db_bench)
    db.commit()
    db.refresh(db_bench)
    return db_bench


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Delete a room."""
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()
    return None
