"""
Seat allocation algorithm with branch separation.

Assigns exact seats to students ensuring no same-branch neighbors.
"""
from typing import List, Dict, Optional, Set, Tuple
from collections import defaultdict
import random
from sqlalchemy.orm import Session

from app.models.schedule import ScheduledExam
from app.models.student import Student
from app.models.room import Room, Bench
from app.models.seating import SeatAssignment
from app.models.rule import ExamType
from app.models.audit_log import AuditLog, AuditAction, AuditEntity
from app.services.rules import RuleProvider
from app.services.engine2.branch_separator import BranchSeparator


class SeatingResult:
    """Result of seat allocation."""
    
    def __init__(
        self,
        success: bool,
        seat_assignments: List[SeatAssignment],
        message: str,
        statistics: Dict,
        violations: List[Dict] = None
    ):
        """
        Initialize seating result.
        
        Args:
            success: Whether seating succeeded
            seat_assignments: List of seat assignments
            message: Result message
            statistics: Seating statistics
            violations: List of branch separation violations
        """
        self.success = success
        self.seat_assignments = seat_assignments
        self.message = message
        self.statistics = statistics
        self.violations = violations or []


class SeatAllocator:
    """
    Allocates exact seats to students.
    
    Key constraints:
    1. Each student gets exactly one seat
    2. No two students from same branch are neighbors (8 directions)
    3. Seats are within allocated room
    4. Respect students_per_bench rule
    """
    
    def __init__(self, db: Session):
        """
        Initialize seat allocator.
        
        Args:
            db: Database session
        """
        self.db = db
        self.rule_provider = RuleProvider(db)
        self.branch_separator = BranchSeparator()
    
    def allocate_seats(
        self,
        scheduled_exam: ScheduledExam,
        exam_type: ExamType,
        user_id: int = None
    ) -> SeatingResult:
        """
        Allocate seats for a scheduled exam.
        
        Args:
            scheduled_exam: Exam to create seating for
            exam_type: Type of exam (for rules)
            user_id: User performing the allocation
            
        Returns:
            SeatingResult with assignments or error
        """
        # Validate exam has room
        if not scheduled_exam.room_id:
            return SeatingResult(
                success=False,
                seat_assignments=[],
                message="Exam has no room allocated",
                statistics={}
            )
        
        # Get rules
        students_per_bench = self.rule_provider.get_int(
            exam_type,
            "students_per_bench"
        )
        
        # Get room and benches
        room = self.db.query(Room).filter(Room.id == scheduled_exam.room_id).first()
        if not room:
            return SeatingResult(
                success=False,
                seat_assignments=[],
                message="Room not found",
                statistics={}
            )
        
        # Get students enrolled in this course
        students = scheduled_exam.course.students
        if not students:
            return SeatingResult(
                success=False,
                seat_assignments=[],
                message="No students enrolled in course",
                statistics={}
            )
        
        # Check capacity
        available_seats = room.num_benches * students_per_bench
        if len(students) > available_seats:
            return SeatingResult(
                success=False,
                seat_assignments=[],
                message=f"Not enough seats: need {len(students)}, have {available_seats}",
                statistics={
                    "students": len(students),
                    "available_seats": available_seats
                }
            )
        
        # Get or create benches for the room
        benches = self.db.query(Bench).filter(
            Bench.room_id == room.id,
            Bench.is_available == True
        ).order_by(Bench.bench_number).all()
        
        if not benches:
            # Create benches if they don't exist
            benches = self._create_benches_for_room(room)
        
        # Allocate seats with branch separation
        seat_assignments = self._allocate_with_branch_separation(
            scheduled_exam=scheduled_exam,
            students=students,
            benches=benches,
            students_per_bench=students_per_bench
        )
        
        if not seat_assignments:
            return SeatingResult(
                success=False,
                seat_assignments=[],
                message="Failed to allocate seats with branch separation",
                statistics={}
            )
        
        # Validate branch separation
        is_valid, violations = self.branch_separator.validate_all_assignments(
            seat_assignments
        )
        
        # Log to audit
        if user_id:
            AuditLog.log_action(
                db=self.db,
                user_id=user_id,
                action=AuditAction.ASSIGN,
                entity_type=AuditEntity.SEAT_ASSIGNMENT,
                description=f"Allocated {len(seat_assignments)} seats for exam {scheduled_exam.course.course_code}",
                new_values={
                    "exam_id": scheduled_exam.id,
                    "num_assignments": len(seat_assignments),
                    "num_violations": len(violations)
                }
            )
        
        # Statistics
        statistics = {
            "num_students": len(students),
            "num_seats_assigned": len(seat_assignments),
            "num_benches_used": len(set(a.bench_id for a in seat_assignments)),
            "room_code": room.room_code,
            "branch_separation_valid": is_valid,
            "num_violations": len(violations)
        }
        
        return SeatingResult(
            success=True,
            seat_assignments=seat_assignments,
            message=f"Allocated {len(seat_assignments)} seats",
            statistics=statistics,
            violations=violations
        )
    
    def _create_benches_for_room(self, room: Room) -> List[Bench]:
        """
        Create benches for a room.
        
        Args:
            room: Room to create benches for
            
        Returns:
            List of created benches
        """
        benches = []
        
        # Arrange benches in a grid
        # Assume approximately square arrangement
        cols = int((room.num_benches ** 0.5) + 0.5)
        rows = (room.num_benches + cols - 1) // cols
        
        bench_num = 1
        for row in range(rows):
            for col in range(cols):
                if bench_num > room.num_benches:
                    break
                
                bench = Bench(
                    room_id=room.id,
                    bench_number=bench_num,
                    row_number=row,
                    column_number=col,
                    is_available=True
                )
                benches.append(bench)
                self.db.add(bench)
                bench_num += 1
        
        self.db.commit()
        
        # Refresh to get IDs
        for bench in benches:
            self.db.refresh(bench)
        
        return benches
    
    def _allocate_with_branch_separation(
        self,
        scheduled_exam: ScheduledExam,
        students: List[Student],
        benches: List[Bench],
        students_per_bench: int
    ) -> List[SeatAssignment]:
        """
        Allocate seats ensuring branch separation.
        
        Uses greedy algorithm with backtracking if needed.
        
        Args:
            scheduled_exam: Exam being seated
            students: List of students to seat
            benches: List of available benches
            students_per_bench: Number of students per bench
            
        Returns:
            List of seat assignments
        """
        # Group students by branch
        students_by_branch = defaultdict(list)
        for student in students:
            students_by_branch[student.branch].append(student)
        
        # Sort branches by student count (largest first)
        sorted_branches = sorted(
            students_by_branch.keys(),
            key=lambda b: len(students_by_branch[b]),
            reverse=True
        )
        
        # Create position to bench mapping
        bench_grid = self._create_bench_grid(benches)
        
        # Allocate seats
        seat_assignments = []
        used_positions = set()
        
        # Position codes: "L", "R", "M" for Left, Right, Middle
        position_codes = ["L", "R", "M"][:students_per_bench]
        
        # Try to allocate seats branch by branch
        for branch in sorted_branches:
            branch_students = students_by_branch[branch]
            
            for student in branch_students:
                # Find a suitable seat
                assigned = False
                
                for bench in benches:
                    if bench.row_number is None or bench.column_number is None:
                        continue
                    
                    for pos_code in position_codes:
                        pos_key = (bench.row_number, bench.column_number, pos_code)
                        
                        if pos_key in used_positions:
                            continue
                        
                        # Check if this position is valid (branch separation)
                        if self._can_place_student_at_position(
                            student.branch,
                            bench.row_number,
                            bench.column_number,
                            seat_assignments
                        ):
                            # Assign seat
                            seat_code = bench.get_seat_code(pos_code)
                            
                            assignment = SeatAssignment(
                                scheduled_exam_id=scheduled_exam.id,
                                student_id=student.id,
                                bench_id=bench.id,
                                seat_code=seat_code,
                                position=pos_code,
                                row_number=bench.row_number,
                                column_number=bench.column_number,
                                is_confirmed=True
                            )
                            
                            seat_assignments.append(assignment)
                            used_positions.add(pos_key)
                            assigned = True
                            break
                    
                    if assigned:
                        break
                
                if not assigned:
                    # Could not seat this student - allocation failed
                    return []
        
        return seat_assignments
    
    def _create_bench_grid(
        self,
        benches: List[Bench]
    ) -> Dict[Tuple[int, int], Bench]:
        """
        Create grid mapping of benches.
        
        Args:
            benches: List of benches
            
        Returns:
            Dictionary mapping (row, col) to bench
        """
        grid = {}
        for bench in benches:
            if bench.row_number is not None and bench.column_number is not None:
                grid[(bench.row_number, bench.column_number)] = bench
        return grid
    
    def _can_place_student_at_position(
        self,
        student_branch: str,
        row: int,
        col: int,
        existing_assignments: List[SeatAssignment]
    ) -> bool:
        """
        Check if student can be placed at position without violating branch separation.
        
        Args:
            student_branch: Student's branch
            row: Row position
            col: Column position
            existing_assignments: List of existing assignments
            
        Returns:
            True if placement is valid, False otherwise
        """
        # Check all 8 neighbors
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                
                neighbor_row = row + dr
                neighbor_col = col + dc
                
                # Check if any existing assignment is at this neighbor position
                for assignment in existing_assignments:
                    if (assignment.row_number == neighbor_row and
                        assignment.column_number == neighbor_col):
                        # Found a neighbor - check branch
                        if assignment.student.branch == student_branch:
                            return False
        
        return True
    
    def allocate_seats_for_multiple_exams(
        self,
        scheduled_exams: List[ScheduledExam],
        exam_type: ExamType,
        user_id: int = None
    ) -> Dict[int, SeatingResult]:
        """
        Allocate seats for multiple exams.
        
        Args:
            scheduled_exams: List of exams
            exam_type: Type of exam
            user_id: User performing allocation
            
        Returns:
            Dictionary mapping exam_id to SeatingResult
        """
        results = {}
        
        for exam in scheduled_exams:
            result = self.allocate_seats(exam, exam_type, user_id)
            results[exam.id] = result
        
        return results
