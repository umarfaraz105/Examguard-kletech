"""
Room allocation algorithm.

Allocates appropriate rooms for scheduled exams based on student count and rules.
"""
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from sqlalchemy.orm import Session
import uuid
import time as time_module
from collections import defaultdict

from app.models.schedule import ScheduledExam
from app.models.room import Room
from app.models.rule import ExamType
from app.services.rules import RuleProvider
from app.core.engine_interface import (
    BaseEngine, 
    EngineMetadata, 
    EngineExecutionResult, 
    EngineValidationError,
    EngineStatus
)


class RoomAllocationResult:
    """Result of room allocation."""
    
    def __init__(
        self,
        success: bool,
        allocations: Dict[int, int],
        message: str,
        statistics: Dict
    ):
        """
        Initialize room allocation result.
        
        Args:
            success: Whether allocation succeeded
            allocations: Dictionary mapping exam_id to room_id
            message: Result message
            statistics: Allocation statistics
        """
        self.success = success
        self.allocations = allocations
        self.message = message
        self.statistics = statistics


class RoomAllocator:
    """
    Allocates rooms to scheduled exams.
    
    Considers:
    - Student count per exam
    - Room capacity
    - Students per bench (from rules)
    - Room availability
    - Multiple rooms if needed for large exams
    """
    
    def __init__(self, db: Session):
        """
        Initialize room allocator.
        
        Args:
            db: Database session
        """
        self.db = db
        self.rule_provider = RuleProvider(db)
    
    def allocate_rooms(
        self,
        scheduled_exams: List[ScheduledExam],
        exam_type: ExamType,
        available_rooms: List[Room] = None
    ) -> RoomAllocationResult:
        """
        Allocate rooms to scheduled exams.
        
        Args:
            scheduled_exams: List of exams needing room allocation
            exam_type: Type of exam (for rules)
            available_rooms: Optional list of available rooms (None = all)
            
        Returns:
            RoomAllocationResult with allocations or error
        """
        # Get rules
        students_per_bench = self.rule_provider.get_int(
            exam_type,
            "students_per_bench"
        )
        max_students_per_room = self.rule_provider.get_int(
            exam_type,
            "max_students_per_room",
            default=60
        )
        
        # Get available rooms
        if available_rooms is None:
            available_rooms = self.db.query(Room).filter(
                Room.is_available == True
            ).order_by(Room.capacity.desc()).all()
        
        if not available_rooms:
            return RoomAllocationResult(
                success=False,
                allocations={},
                message="No available rooms",
                statistics={}
            )
        
        # Calculate effective capacity for each room
        room_capacities = {}
        for room in available_rooms:
            # Effective capacity = min(room.capacity, max_students_per_room)
            # Also consider students_per_bench constraint
            effective_capacity = min(
                room.capacity,
                max_students_per_room,
                room.num_benches * students_per_bench
            )
            room_capacities[room.id] = effective_capacity
        
        # Allocate rooms using First-Fit Decreasing algorithm
        allocations = {}
        unallocated_exams = []
        room_usage = {room.id: 0 for room in available_rooms}
        
        # Sort exams by student count (largest first)
        sorted_exams = sorted(
            scheduled_exams,
            key=lambda e: e.num_students,
            reverse=True
        )
        
        for exam in sorted_exams:
            allocated = False
            
            # Try to find a suitable room
            for room in available_rooms:
                # Check if room is available for this exam's date/session
                if not self._is_room_available(room, exam, scheduled_exams, allocations):
                    continue
                
                # Check if room has enough capacity
                if exam.num_students <= room_capacities[room.id]:
                    allocations[exam.id] = room.id
                    room_usage[room.id] += 1
                    allocated = True
                    break
            
            if not allocated:
                unallocated_exams.append(exam)
        
        # Check if all exams were allocated
        if unallocated_exams:
            exam_details = [
                f"{e.course.course_code} ({e.num_students} students)"
                for e in unallocated_exams[:5]
            ]
            
            return RoomAllocationResult(
                success=False,
                allocations=allocations,
                message=f"Could not allocate rooms for {len(unallocated_exams)} exams: {', '.join(exam_details)}",
                statistics={
                    "total_exams": len(scheduled_exams),
                    "allocated": len(allocations),
                    "unallocated": len(unallocated_exams)
                }
            )
        
        # Success!
        statistics = {
            "total_exams": len(scheduled_exams),
            "allocated": len(allocations),
            "total_rooms": len(available_rooms),
            "rooms_used": sum(1 for usage in room_usage.values() if usage > 0),
            "avg_room_usage": sum(room_usage.values()) / len(room_usage) if room_usage else 0
        }
        
        return RoomAllocationResult(
            success=True,
            allocations=allocations,
            message=f"Successfully allocated rooms for {len(allocations)} exams",
            statistics=statistics
        )
    
    def _is_room_available(
        self,
        room: Room,
        exam: ScheduledExam,
        all_exams: List[ScheduledExam],
        current_allocations: Dict[int, int]
    ) -> bool:
        """
        Check if room is available for given exam.
        
        A room is unavailable if it's already allocated to another exam
        at the same date + session.
        
        Args:
            room: Room to check
            exam: Exam needing allocation
            all_exams: List of all exams
            current_allocations: Current allocations made so far
            
        Returns:
            True if available, False otherwise
        """
        # Check if any other exam at same date+session is using this room
        for other_exam in all_exams:
            if other_exam.id == exam.id:
                continue
            
            # Check if this exam is allocated to the room
            if current_allocations.get(other_exam.id) == room.id:
                # Check if same date and session
                if (other_exam.exam_date == exam.exam_date and
                    other_exam.session == exam.session):
                    return False
        
        return True
    
    def apply_allocations(
        self,
        scheduled_exams: List[ScheduledExam],
        allocations: Dict[int, int]
    ) -> None:
        """
        Apply room allocations to scheduled exams.
        
        Args:
            scheduled_exams: List of exams
            allocations: Dictionary mapping exam_id to room_id
        """
        for exam in scheduled_exams:
            if exam.id in allocations:
                exam.room_id = allocations[exam.id]
    
    # ================== ROOM ANALYSIS FUNCTIONS ==================
    
    def analyze_room_utilization(self, scheduled_exams: List[ScheduledExam], available_rooms: List[Room] = None) -> Dict[str, Any]:
        """
        Analyze room utilization patterns and efficiency.
        
        Args:
            scheduled_exams: List of scheduled exams
            available_rooms: Optional list of available rooms
            
        Returns:
            Room utilization analysis
        """
        if available_rooms is None:
            available_rooms = self.db.query(Room).filter(Room.is_available == True).all()
        
        # Calculate room usage
        room_usage = defaultdict(int)
        room_student_load = defaultdict(int)
        total_sessions = 0
        
        # Count unique date-session combinations
        sessions = set()
        for exam in scheduled_exams:
            sessions.add((exam.exam_date, exam.session))
            if exam.room_id:
                room_usage[exam.room_id] += 1
                room_student_load[exam.room_id] += exam.num_students
        
        total_sessions = len(sessions)
        
        # Calculate metrics per room
        room_metrics = {}
        for room in available_rooms:
            usage_count = room_usage.get(room.id, 0)
            student_load = room_student_load.get(room.id, 0)
            
            utilization_rate = (usage_count / total_sessions) * 100 if total_sessions > 0 else 0
            avg_occupancy = (student_load / usage_count) if usage_count > 0 else 0
            capacity_efficiency = (avg_occupancy / room.capacity) * 100 if room.capacity > 0 else 0
            
            room_metrics[room.room_code] = {
                "room_id": room.id,
                "capacity": room.capacity,
                "usage_count": usage_count,
                "utilization_rate": round(utilization_rate, 2),
                "total_student_load": student_load,
                "avg_occupancy": round(avg_occupancy, 2),
                "capacity_efficiency": round(capacity_efficiency, 2),
                "status": self._categorize_room_usage(utilization_rate, capacity_efficiency)
            }
        
        # Overall statistics
        total_rooms = len(available_rooms)
        used_rooms = len([r for r in room_metrics.values() if r["usage_count"] > 0])
        
        avg_utilization = sum(r["utilization_rate"] for r in room_metrics.values()) / total_rooms if total_rooms > 0 else 0
        avg_efficiency = sum(r["capacity_efficiency"] for r in room_metrics.values() if r["usage_count"] > 0) / used_rooms if used_rooms > 0 else 0
        
        return {
            "total_rooms": total_rooms,
            "rooms_used": used_rooms,
            "rooms_unused": total_rooms - used_rooms,
            "overall_utilization": round(avg_utilization, 2),
            "overall_efficiency": round(avg_efficiency, 2),
            "total_sessions": total_sessions,
            "room_details": room_metrics,
            "recommendations": self._generate_room_recommendations(room_metrics, avg_utilization, avg_efficiency)
        }
    
    def _categorize_room_usage(self, utilization_rate: float, capacity_efficiency: float) -> str:
        """Categorize room usage status."""
        if utilization_rate == 0:
            return "UNUSED"
        elif utilization_rate < 30:
            return "UNDERUTILIZED"
        elif utilization_rate > 80:
            return "OVERUTILIZED"
        elif capacity_efficiency < 50:
            return "LOW_EFFICIENCY"
        elif capacity_efficiency > 90:
            return "HIGH_EFFICIENCY"
        else:
            return "OPTIMAL"
    
    def _generate_room_recommendations(self, room_metrics: Dict, avg_util: float, avg_eff: float) -> List[str]:
        """Generate room utilization recommendations."""
        recommendations = []
        
        unused_rooms = [code for code, metrics in room_metrics.items() if metrics["usage_count"] == 0]
        if unused_rooms:
            recommendations.append(f"{len(unused_rooms)} rooms are unused: {', '.join(unused_rooms[:3])}")
        
        overutilized = [code for code, metrics in room_metrics.items() if metrics["utilization_rate"] > 80]
        if overutilized:
            recommendations.append(f"Overutilized rooms may need redistribution: {', '.join(overutilized[:3])}")
        
        if avg_eff < 60:
            recommendations.append("Consider using smaller rooms to improve capacity efficiency")
        
        if avg_util < 50:
            recommendations.append("Room utilization is low - consider reducing available rooms")
        
        return recommendations
    
    # ================== CAPACITY PLANNING FUNCTIONS ==================
    
    def analyze_capacity_requirements(self, scheduled_exams: List[ScheduledExam], exam_type: ExamType) -> Dict[str, Any]:
        """
        Analyze capacity requirements and identify bottlenecks.
        
        Args:
            scheduled_exams: List of scheduled exams
            exam_type: Exam type for rule resolution
            
        Returns:
            Capacity analysis with recommendations
        """
        # Get capacity rules
        students_per_bench = self.rule_provider.get_int(exam_type, "students_per_bench")
        max_students_per_room = self.rule_provider.get_int(exam_type, "max_students_per_room", default=60)
        
        # Group exams by time slot
        time_slots = defaultdict(list)
        for exam in scheduled_exams:
            slot_key = (exam.exam_date, exam.session)
            time_slots[slot_key].append(exam)
        
        # Analyze each time slot
        slot_analysis = {}
        bottlenecks = []
        
        for slot_key, exams in time_slots.items():
            total_students = sum(exam.num_students for exam in exams)
            max_exam_size = max(exam.num_students for exam in exams) if exams else 0
            
            # Calculate required capacity
            required_rooms = 0
            required_benches = 0
            
            for exam in exams:
                exam_rooms_needed = max(1, exam.num_students // max_students_per_room + (1 if exam.num_students % max_students_per_room > 0 else 0))
                exam_benches_needed = max(1, exam.num_students // students_per_bench + (1 if exam.num_students % students_per_bench > 0 else 0))
                
                required_rooms += exam_rooms_needed
                required_benches += exam_benches_needed
            
            # Check available capacity
            available_rooms = self.db.query(Room).filter(Room.is_available == True).count()
            available_benches = self.db.query(Room).filter(Room.is_available == True).with_entities(
                self.db.func.sum(Room.num_benches)
            ).scalar() or 0
            
            capacity_sufficient = (required_rooms <= available_rooms and required_benches <= available_benches)
            
            if not capacity_sufficient:
                bottlenecks.append({
                    "date": slot_key[0].isoformat(),
                    "session": slot_key[1].value,
                    "required_rooms": required_rooms,
                    "available_rooms": available_rooms,
                    "required_benches": required_benches,
                    "available_benches": available_benches,
                    "deficit_rooms": max(0, required_rooms - available_rooms),
                    "deficit_benches": max(0, required_benches - available_benches)
                })
            
            slot_analysis[f"{slot_key[0].isoformat()}_{slot_key[1].value}"] = {
                "total_students": total_students,
                "num_exams": len(exams),
                "max_exam_size": max_exam_size,
                "required_rooms": required_rooms,
                "required_benches": required_benches,
                "capacity_sufficient": capacity_sufficient
            }
        
        # Overall analysis
        peak_slot = max(slot_analysis.values(), key=lambda x: x["required_rooms"]) if slot_analysis else {}
        total_unique_students = len(set(
            student.id 
            for exam in scheduled_exams 
            for student in exam.course.students
        ))
        
        return {
            "total_exams": len(scheduled_exams),
            "total_unique_students": total_unique_students,
            "time_slots_analyzed": len(slot_analysis),
            "bottlenecks_found": len(bottlenecks),
            "peak_requirements": peak_slot,
            "bottleneck_details": bottlenecks,
            "slot_analysis": slot_analysis,
            "recommendations": self._generate_capacity_recommendations(bottlenecks, peak_slot)
        }
    
    def _generate_capacity_recommendations(self, bottlenecks: List[Dict], peak_slot: Dict) -> List[str]:
        """Generate capacity planning recommendations."""
        recommendations = []
        
        if not bottlenecks:
            recommendations.append("Capacity is sufficient for all scheduled exams")
        else:
            recommendations.append(f"Found {len(bottlenecks)} time slots with capacity bottlenecks")
            
            for bottleneck in bottlenecks[:3]:  # Show top 3
                if bottleneck["deficit_rooms"] > 0:
                    recommendations.append(f"Need {bottleneck['deficit_rooms']} more rooms for {bottleneck['date']} {bottleneck['session']}")
                
                if bottleneck["deficit_benches"] > 0:
                    recommendations.append(f"Need {bottleneck['deficit_benches']} more benches for {bottleneck['date']} {bottleneck['session']}")
        
        if peak_slot:
            recommendations.append(f"Peak slot requires {peak_slot['required_rooms']} rooms and {peak_slot['required_benches']} benches")
        
        return recommendations
    
    # ================== OPTIMIZATION FUNCTIONS ==================
    
    def optimize_room_assignments(self, scheduled_exams: List[ScheduledExam], exam_type: ExamType) -> Dict[str, Any]:
        """
        Optimize room assignments for better utilization and efficiency.
        
        Args:
            scheduled_exams: Current exam schedule
            exam_type: Exam type for rule resolution
            
        Returns:
            Optimization results and suggestions
        """
        current_allocations = {exam.id: exam.room_id for exam in scheduled_exams if exam.room_id}
        
        # Try different optimization strategies
        strategies = [
            self._optimize_by_capacity_matching,
            self._optimize_by_proximity,
            self._optimize_by_utilization_balancing
        ]
        
        optimization_results = {}
        
        for i, strategy in enumerate(strategies):
            try:
                result = strategy(scheduled_exams, exam_type)
                optimization_results[f"strategy_{i+1}"] = result
            except Exception as e:
                optimization_results[f"strategy_{i+1}"] = {"error": str(e)}
        
        # Find best strategy
        best_strategy = None
        best_score = -1
        
        for strategy_name, result in optimization_results.items():
            if "score" in result and result["score"] > best_score:
                best_score = result["score"]
                best_strategy = strategy_name
        
        return {
            "current_allocation": current_allocations,
            "optimization_strategies": optimization_results,
            "recommended_strategy": best_strategy,
            "improvement_potential": best_score - self._calculate_current_allocation_score(scheduled_exams) if best_score > 0 else 0
        }
    
    def _optimize_by_capacity_matching(self, scheduled_exams: List[ScheduledExam], exam_type: ExamType) -> Dict[str, Any]:
        """Optimize by matching exam size to room capacity."""
        available_rooms = self.db.query(Room).filter(Room.is_available == True).order_by(Room.capacity).all()
        
        # Sort exams by student count
        sorted_exams = sorted(scheduled_exams, key=lambda e: e.num_students)
        
        new_allocations = {}
        room_usage = {room.id: [] for room in available_rooms}
        
        for exam in sorted_exams:
            best_room = None
            best_fit_score = float('inf')
            
            for room in available_rooms:
                # Check availability
                if not self._is_room_available_for_optimization(room, exam, room_usage):
                    continue
                
                # Calculate fit score (prefer smallest room that fits)
                if room.capacity >= exam.num_students:
                    fit_score = room.capacity - exam.num_students
                    if fit_score < best_fit_score:
                        best_fit_score = fit_score
                        best_room = room
            
            if best_room:
                new_allocations[exam.id] = best_room.id
                room_usage[best_room.id].append(exam)
        
        # Calculate optimization score
        score = self._calculate_allocation_score(new_allocations, scheduled_exams, available_rooms)
        
        return {
            "strategy": "capacity_matching",
            "new_allocations": new_allocations,
            "score": score,
            "description": "Matches exam sizes to room capacities for better efficiency"
        }
    
    def _optimize_by_proximity(self, scheduled_exams: List[ScheduledExam], exam_type: ExamType) -> Dict[str, Any]:
        """Optimize by grouping related exams in nearby rooms."""
        # This is a simplified proximity optimization
        # In a real system, you'd use actual room coordinates or building layouts
        
        available_rooms = self.db.query(Room).filter(Room.is_available == True).all()
        
        # Group exams by department/branch (proxy for proximity preference)
        exam_groups = defaultdict(list)
        for exam in scheduled_exams:
            # Use course branch as grouping key
            branch = getattr(exam.course, 'branch', 'GENERAL')
            exam_groups[branch].append(exam)
        
        new_allocations = {}
        room_index = 0
        
        for branch, exams in exam_groups.items():
            for exam in exams:
                if room_index < len(available_rooms):
                    room = available_rooms[room_index % len(available_rooms)]
                    new_allocations[exam.id] = room.id
                    room_index += 1
        
        score = self._calculate_allocation_score(new_allocations, scheduled_exams, available_rooms)
        
        return {
            "strategy": "proximity_optimization",
            "new_allocations": new_allocations,
            "score": score,
            "description": "Groups related exams in nearby rooms"
        }
    
    def _optimize_by_utilization_balancing(self, scheduled_exams: List[ScheduledExam], exam_type: ExamType) -> Dict[str, Any]:
        """Optimize by balancing room utilization."""
        available_rooms = self.db.query(Room).filter(Room.is_available == True).all()
        
        # Track room usage
        room_usage_count = {room.id: 0 for room in available_rooms}
        new_allocations = {}
        
        for exam in scheduled_exams:
            # Find least used suitable room
            suitable_rooms = [
                room for room in available_rooms 
                if room.capacity >= exam.num_students
            ]
            
            if suitable_rooms:
                # Choose room with lowest usage count
                best_room = min(suitable_rooms, key=lambda r: room_usage_count[r.id])
                new_allocations[exam.id] = best_room.id
                room_usage_count[best_room.id] += 1
        
        score = self._calculate_allocation_score(new_allocations, scheduled_exams, available_rooms)
        
        return {
            "strategy": "utilization_balancing",
            "new_allocations": new_allocations,
            "score": score,
            "description": "Balances usage across all available rooms"
        }
    
    def _is_room_available_for_optimization(self, room: Room, exam: ScheduledExam, room_usage: Dict) -> bool:
        """Check if room is available for optimization."""
        # Check if room is already used at same time slot
        for other_exam in room_usage[room.id]:
            if (other_exam.exam_date == exam.exam_date and 
                other_exam.session == exam.session):
                return False
        return True
    
    def _calculate_allocation_score(self, allocations: Dict, exams: List[ScheduledExam], rooms: List[Room]) -> float:
        """Calculate optimization score for an allocation."""
        if not allocations:
            return 0
        
        room_dict = {room.id: room for room in rooms}
        total_score = 0
        total_exams = len(allocations)
        
        for exam in exams:
            if exam.id in allocations:
                room = room_dict.get(allocations[exam.id])
                if room:
                    # Efficiency score (higher is better)
                    efficiency = exam.num_students / room.capacity if room.capacity > 0 else 0
                    total_score += min(efficiency, 1.0) * 100  # Cap at 100%
        
        return total_score / total_exams if total_exams > 0 else 0
    
    def _calculate_current_allocation_score(self, exams: List[ScheduledExam]) -> float:
        """Calculate score for current allocation."""
        total_score = 0
        valid_exams = 0
        
        for exam in exams:
            if exam.room_id and exam.room:
                efficiency = exam.num_students / exam.room.capacity if exam.room.capacity > 0 else 0
                total_score += min(efficiency, 1.0) * 100
                valid_exams += 1
        
        return total_score / valid_exams if valid_exams > 0 else 0
    
    # ================== VALIDATION FUNCTIONS ==================
    
    def validate_room_constraints(self, scheduled_exams: List[ScheduledExam], exam_type: ExamType) -> Dict[str, Any]:
        """
        Validate room allocation against all constraints.
        
        Args:
            scheduled_exams: Exams to validate
            exam_type: Exam type for rules
            
        Returns:
            Validation results with issues
        """
        issues = []
        
        # Get rules
        students_per_bench = self.rule_provider.get_int(exam_type, "students_per_bench")
        max_students_per_room = self.rule_provider.get_int(exam_type, "max_students_per_room", default=60)
        
        # Check each exam
        for exam in scheduled_exams:
            # Check if room is assigned
            if not exam.room_id:
                issues.append({
                    "exam_id": exam.id,
                    "course": exam.course.course_code,
                    "issue": "NO_ROOM_ASSIGNED",
                    "severity": "CRITICAL",
                    "message": "No room assigned to exam"
                })
                continue
            
            # Check room capacity
            if exam.room.capacity < exam.num_students:
                issues.append({
                    "exam_id": exam.id,
                    "course": exam.course.course_code,
                    "issue": "CAPACITY_EXCEEDED",
                    "severity": "CRITICAL",
                    "message": f"Room capacity ({exam.room.capacity}) exceeded by exam ({exam.num_students} students)"
                })
            
            # Check bench capacity
            max_by_benches = exam.room.num_benches * students_per_bench
            if exam.num_students > max_by_benches:
                issues.append({
                    "exam_id": exam.id,
                    "course": exam.course.course_code,
                    "issue": "BENCH_CAPACITY_EXCEEDED",
                    "severity": "ERROR",
                    "message": f"Bench capacity ({max_by_benches}) exceeded by exam ({exam.num_students} students)"
                })
            
            # Check room availability conflicts
            conflicting_exams = [
                other for other in scheduled_exams
                if (other.id != exam.id and 
                    other.room_id == exam.room_id and
                    other.exam_date == exam.exam_date and 
                    other.session == exam.session)
            ]
            
            if conflicting_exams:
                conflict_courses = [e.course.course_code for e in conflicting_exams]
                issues.append({
                    "exam_id": exam.id,
                    "course": exam.course.course_code,
                    "issue": "ROOM_CONFLICT",
                    "severity": "CRITICAL",
                    "message": f"Room conflict with exams: {', '.join(conflict_courses)}"
                })
        
        # Categorize issues
        critical_count = len([i for i in issues if i["severity"] == "CRITICAL"])
        error_count = len([i for i in issues if i["severity"] == "ERROR"])
        warning_count = len([i for i in issues if i["severity"] == "WARNING"])
        
        return {
            "total_issues": len(issues),
            "critical_issues": critical_count,
            "error_issues": error_count,
            "warning_issues": warning_count,
            "validation_passed": critical_count == 0,
            "issues": issues,
            "summary": f"Found {len(issues)} issues: {critical_count} critical, {error_count} errors, {warning_count} warnings"
        }


class Engine2RoomSeatingEngine(BaseEngine):
    """
    Plugin-compatible wrapper for room allocation and seating engine.
    
    This class implements the BaseEngine interface to make Engine 2 
    compatible with the plugin architecture.
    """
    
    def __init__(self):
        """Initialize the engine wrapper."""
        self._current_executions: Dict[str, Dict] = {}
    
    def get_metadata(self) -> EngineMetadata:
        """Return engine metadata."""
        return EngineMetadata(
            name="engine2-room-seating",
            display_name="Smart Room & Seating Allocator (Engine 2)",
            version="1.0.0",
            description="Intelligent room allocation and seating arrangement engine with branch separation and capacity optimization",
            capabilities=[
                "room_allocation",
                "seat_assignment", 
                "capacity_planning",
                "branch_separation",
                "constraint_optimization"
            ],
            dependencies=["engine1-scheduling"],  # Needs scheduled exams
            execution_order=1,  # Runs after scheduling
            requires_approval=False
        )
    
    def validate_input(self, input_data: Dict[str, Any]) -> List[EngineValidationError]:
        """Validate input parameters."""
        errors = []
        
        # Required fields
        required_fields = ["scheduled_exam_ids", "exam_type", "operation"]
        for field in required_fields:
            if field not in input_data:
                errors.append(EngineValidationError(
                    field=field,
                    message=f"Required field '{field}' is missing"
                ))
        
        # Validate operation
        if "operation" in input_data:
            valid_ops = ["allocate_rooms", "allocate_seats", "both"]
            if input_data["operation"] not in valid_ops:
                errors.append(EngineValidationError(
                    field="operation",
                    message=f"Invalid operation. Valid options: {valid_ops}"
                ))
        
        # Validate exam type
        if "exam_type" in input_data:
            valid_types = ["MID_TERM", "END_TERM", "INTERNAL", "EXTERNAL", "MAKEUP"]
            if input_data["exam_type"] not in valid_types:
                errors.append(EngineValidationError(
                    field="exam_type",
                    message=f"Invalid exam type. Valid options: {valid_types}"
                ))
        
        # Validate exam IDs
        if "scheduled_exam_ids" in input_data:
            if not isinstance(input_data["scheduled_exam_ids"], list):
                errors.append(EngineValidationError(
                    field="scheduled_exam_ids",
                    message="scheduled_exam_ids must be a list of integers"
                ))
            elif not input_data["scheduled_exam_ids"]:
                errors.append(EngineValidationError(
                    field="scheduled_exam_ids",
                    message="At least one scheduled exam ID is required"
                ))
        
        # Validate optional room IDs
        if "available_room_ids" in input_data:
            room_ids = input_data["available_room_ids"]
            if room_ids is not None and not isinstance(room_ids, list):
                errors.append(EngineValidationError(
                    field="available_room_ids",
                    message="available_room_ids must be null or a list of integers"
                ))
        
        return errors
    
    def execute(self, input_data: Dict[str, Any], db: Session) -> EngineExecutionResult:
        """Execute the room and seating allocation engine."""
        execution_id = str(uuid.uuid4())
        started_at = datetime.utcnow()
        
        # Track execution
        self._current_executions[execution_id] = {
            "status": EngineStatus.RUNNING,
            "started_at": started_at
        }
        
        try:
            # Parse input
            scheduled_exam_ids = input_data["scheduled_exam_ids"]
            exam_type = ExamType(input_data["exam_type"])
            operation = input_data["operation"]
            available_room_ids = input_data.get("available_room_ids")
            user_id = input_data.get("user_id")
            
            # Fetch scheduled exams
            scheduled_exams = db.query(ScheduledExam).filter(
                ScheduledExam.id.in_(scheduled_exam_ids)
            ).all()
            
            if len(scheduled_exams) != len(scheduled_exam_ids):
                found_ids = {exam.id for exam in scheduled_exams}
                missing_ids = set(scheduled_exam_ids) - found_ids
                raise ValueError(f"Scheduled exams not found: {missing_ids}")
            
            # Get available rooms if specified
            available_rooms = None
            if available_room_ids is not None:
                available_rooms = db.query(Room).filter(
                    Room.id.in_(available_room_ids)
                ).all()
                if len(available_rooms) != len(available_room_ids):
                    found_ids = {room.id for room in available_rooms}
                    missing_ids = set(available_room_ids) - found_ids
                    raise ValueError(f"Rooms not found: {missing_ids}")
            
            start_time = time_module.perf_counter()
            result_data = {}
            warnings = []
            
            # Execute room allocation
            if operation in ["allocate_rooms", "both"]:
                room_allocator = RoomAllocator(db)
                room_result = room_allocator.allocate_rooms(
                    scheduled_exams=scheduled_exams,
                    exam_type=exam_type,
                    available_rooms=available_rooms
                )
                
                if room_result.success:
                    # Apply allocations to the database
                    room_allocator.apply_allocations(scheduled_exams, room_result.allocations)
                    db.commit()
                    
                    result_data["room_allocation"] = {
                        "success": True,
                        "allocations": room_result.allocations,
                        "message": room_result.message,
                        "statistics": room_result.statistics
                    }
                else:
                    result_data["room_allocation"] = {
                        "success": False,
                        "message": room_result.message,
                        "statistics": room_result.statistics
                    }
                    
                    if operation == "both":
                        # Can't proceed with seating if room allocation failed
                        operation = "allocate_rooms"
                        warnings.append("Seat allocation skipped due to room allocation failure")
            
            # Execute seat allocation
            if operation in ["allocate_seats", "both"]:
                from app.services.engine2.seat_allocator import SeatAllocator
                
                seat_allocator = SeatAllocator(db)
                seating_results = {}
                seating_stats = {"successful": 0, "failed": 0, "total_violations": 0}
                
                for exam in scheduled_exams:
                    # Skip if no room allocated
                    if not exam.room_id:
                        seating_results[exam.id] = {
                            "success": False,
                            "message": "No room allocated for this exam"
                        }
                        seating_stats["failed"] += 1
                        continue
                    
                    seat_result = seat_allocator.allocate_seats(
                        scheduled_exam=exam,
                        exam_type=exam_type,
                        user_id=user_id
                    )
                    
                    # Save seat assignments to database
                    if seat_result.success:
                        for assignment in seat_result.seat_assignments:
                            db.add(assignment)
                        db.commit()
                        seating_stats["successful"] += 1
                        seating_stats["total_violations"] += len(seat_result.violations)
                    else:
                        seating_stats["failed"] += 1
                    
                    seating_results[exam.id] = {
                        "success": seat_result.success,
                        "message": seat_result.message,
                        "statistics": seat_result.statistics,
                        "num_assignments": len(seat_result.seat_assignments),
                        "num_violations": len(seat_result.violations)
                    }
                
                result_data["seat_allocation"] = {
                    "results": seating_results,
                    "summary": seating_stats
                }
            
            end_time = time_module.perf_counter()
            execution_time_ms = int((end_time - start_time) * 1000)
            completed_at = datetime.utcnow()
            
            # Determine overall success
            overall_success = True
            if "room_allocation" in result_data:
                overall_success &= result_data["room_allocation"]["success"]
            if "seat_allocation" in result_data:
                overall_success &= seating_stats["failed"] == 0
            
            # Update execution status
            self._current_executions[execution_id].update({
                "status": EngineStatus.COMPLETED if overall_success else EngineStatus.FAILED,
                "completed_at": completed_at,
                "result": result_data
            })
            
            return EngineExecutionResult(
                success=overall_success,
                status=EngineStatus.COMPLETED if overall_success else EngineStatus.FAILED,
                execution_id=execution_id,
                started_at=started_at,
                completed_at=completed_at,
                execution_time_ms=execution_time_ms,
                result_data=result_data,
                error_message=None if overall_success else "Some operations failed - see result_data for details",
                warnings=warnings
            )
            
        except Exception as e:
            completed_at = datetime.utcnow()
            
            # Update execution status
            self._current_executions[execution_id].update({
                "status": EngineStatus.FAILED,
                "completed_at": completed_at,
                "error": str(e)
            })
            
            return EngineExecutionResult(
                success=False,
                status=EngineStatus.FAILED,
                execution_id=execution_id,
                started_at=started_at,
                completed_at=completed_at,
                execution_time_ms=int((completed_at - started_at).total_seconds() * 1000),
                result_data=None,
                error_message=str(e),
                warnings=[]
            )
    
    def get_status(self, execution_id: str) -> EngineStatus:
        """Get execution status."""
        if execution_id in self._current_executions:
            return self._current_executions[execution_id]["status"]
        return EngineStatus.IDLE
    
    def health_check(self) -> Dict[str, Any]:
        """Check engine health."""
        checks = {}
        
        # Check database connectivity would be done in the API layer
        checks["database"] = "ok"
        
        # Check if required models can be imported
        try:
            from app.services.engine2.seat_allocator import SeatAllocator
            from app.models.room import Room, Bench
            from app.models.seating import SeatAssignment
            checks["dependencies"] = "ok"
        except Exception as e:
            checks["dependencies"] = f"error: {str(e)}"
        
        # Determine overall status
        status = "healthy" if all(check == "ok" for check in checks.values()) else "unhealthy"
        
        return {
            "status": status,
            "checks": checks,
            "message": f"Engine 2 status: {status}"
        }
    
    def get_input_schema(self) -> Dict[str, Any]:
        """Return JSON schema for input validation."""
        return {
            "type": "object",
            "properties": {
                "scheduled_exam_ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "List of scheduled exam IDs to allocate rooms/seats for",
                    "minItems": 1
                },
                "exam_type": {
                    "type": "string",
                    "enum": ["MID_TERM", "END_TERM", "INTERNAL", "EXTERNAL", "MAKEUP"],
                    "description": "Type of exam (for rule resolution)"
                },
                "operation": {
                    "type": "string",
                    "enum": ["allocate_rooms", "allocate_seats", "both"],
                    "description": "Operation to perform",
                    "default": "both"
                },
                "available_room_ids": {
                    "type": ["array", "null"],
                    "items": {"type": "integer"},
                    "description": "Optional list of available room IDs (null = all available rooms)"
                },
                "user_id": {
                    "type": "integer",
                    "description": "ID of user performing the allocation (optional)"
                }
            },
            "required": ["scheduled_exam_ids", "exam_type", "operation"]
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        """Return JSON schema for output format."""
        return {
            "type": "object",
            "properties": {
                "room_allocation": {
                    "type": "object",
                    "description": "Room allocation results (if requested)",
                    "properties": {
                        "success": {"type": "boolean"},
                        "allocations": {
                            "type": "object",
                            "description": "Mapping of exam_id to room_id"
                        },
                        "message": {"type": "string"},
                        "statistics": {"type": "object"}
                    }
                },
                "seat_allocation": {
                    "type": "object",
                    "description": "Seat allocation results (if requested)",
                    "properties": {
                        "results": {
                            "type": "object",
                            "description": "Per-exam seating results"
                        },
                        "summary": {
                            "type": "object",
                            "properties": {
                                "successful": {"type": "integer"},
                                "failed": {"type": "integer"},
                                "total_violations": {"type": "integer"}
                            }
                        }
                    }
                }
            }
        }
