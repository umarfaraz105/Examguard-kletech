"""
Branch separation validator.

Ensures no two students from the same branch are neighbors in any of 8 directions.
"""
from typing import Dict, Set, Tuple, List
from app.models.seating import SeatAssignment


class BranchSeparator:
    """
    Validates and enforces branch separation in seating.
    
    No two students from the same branch should be neighbors in:
    - Front, Back, Left, Right (4 directions)
    - 4 Diagonals
    
    Total: 8 directions to check
    """
    
    def __init__(self):
        """Initialize branch separator."""
        self.seat_map: Dict[Tuple[int, int], SeatAssignment] = {}
        self.violations: List[Dict] = []
    
    def build_seat_map(self, assignments: List[SeatAssignment]) -> None:
        """
        Build map of seat positions.
        
        Args:
            assignments: List of seat assignments
        """
        self.seat_map.clear()
        
        for assignment in assignments:
            if assignment.row_number is not None and assignment.column_number is not None:
                pos = (assignment.row_number, assignment.column_number)
                self.seat_map[pos] = assignment
    
    def validate_assignment(self, assignment: SeatAssignment) -> bool:
        """
        Validate a single seat assignment for branch separation.
        
        Args:
            assignment: Seat assignment to validate
            
        Returns:
            True if valid (no same-branch neighbors), False otherwise
        """
        if assignment.row_number is None or assignment.column_number is None:
            return True  # Cannot validate without position
        
        student_branch = assignment.student.branch
        pos = (assignment.row_number, assignment.column_number)
        
        # Check all 8 neighbors
        for neighbor_pos in self._get_neighbor_positions(pos):
            if neighbor_pos in self.seat_map:
                neighbor = self.seat_map[neighbor_pos]
                neighbor_branch = neighbor.student.branch
                
                if student_branch == neighbor_branch:
                    # Same branch violation!
                    return False
        
        return True
    
    def validate_all_assignments(
        self,
        assignments: List[SeatAssignment]
    ) -> Tuple[bool, List[Dict]]:
        """
        Validate all seat assignments for branch separation.
        
        Args:
            assignments: List of all seat assignments
            
        Returns:
            Tuple of (is_valid, list of violations)
        """
        self.violations.clear()
        self.build_seat_map(assignments)
        
        for assignment in assignments:
            if not self.validate_assignment(assignment):
                # Find which neighbor(s) violate
                violations = self._find_violations(assignment)
                self.violations.extend(violations)
        
        return len(self.violations) == 0, self.violations
    
    def _find_violations(self, assignment: SeatAssignment) -> List[Dict]:
        """
        Find specific branch separation violations for an assignment.
        
        Args:
            assignment: Seat assignment to check
            
        Returns:
            List of violation details
        """
        violations = []
        
        if assignment.row_number is None or assignment.column_number is None:
            return violations
        
        student_branch = assignment.student.branch
        pos = (assignment.row_number, assignment.column_number)
        
        for neighbor_pos in self._get_neighbor_positions(pos):
            if neighbor_pos in self.seat_map:
                neighbor = self.seat_map[neighbor_pos]
                neighbor_branch = neighbor.student.branch
                
                if student_branch == neighbor_branch:
                    direction = self._get_direction(pos, neighbor_pos)
                    
                    violations.append({
                        "student1_usn": assignment.student.usn,
                        "student1_seat": assignment.seat_code,
                        "student1_branch": student_branch,
                        "student2_usn": neighbor.student.usn,
                        "student2_seat": neighbor.seat_code,
                        "student2_branch": neighbor_branch,
                        "direction": direction,
                        "row1": assignment.row_number,
                        "col1": assignment.column_number,
                        "row2": neighbor.row_number,
                        "col2": neighbor.column_number
                    })
        
        return violations
    
    def _get_neighbor_positions(
        self,
        pos: Tuple[int, int]
    ) -> List[Tuple[int, int]]:
        """
        Get all 8 neighbor positions.
        
        Args:
            pos: Current position (row, col)
            
        Returns:
            List of neighbor positions
        """
        row, col = pos
        neighbors = []
        
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue  # Skip self
                neighbors.append((row + dr, col + dc))
        
        return neighbors
    
    def _get_direction(
        self,
        pos1: Tuple[int, int],
        pos2: Tuple[int, int]
    ) -> str:
        """
        Get direction from pos1 to pos2.
        
        Args:
            pos1: First position
            pos2: Second position
            
        Returns:
            Direction string
        """
        dr = pos2[0] - pos1[0]
        dc = pos2[1] - pos1[1]
        
        if dr == -1 and dc == 0:
            return "UP"
        elif dr == 1 and dc == 0:
            return "DOWN"
        elif dr == 0 and dc == -1:
            return "LEFT"
        elif dr == 0 and dc == 1:
            return "RIGHT"
        elif dr == -1 and dc == -1:
            return "UP-LEFT"
        elif dr == -1 and dc == 1:
            return "UP-RIGHT"
        elif dr == 1 and dc == -1:
            return "DOWN-LEFT"
        elif dr == 1 and dc == 1:
            return "DOWN-RIGHT"
        else:
            return "UNKNOWN"
    
    def can_place_student(
        self,
        student_branch: str,
        row: int,
        col: int
    ) -> bool:
        """
        Check if a student can be placed at given position.
        
        Args:
            student_branch: Student's branch
            row: Row position
            col: Column position
            
        Returns:
            True if placement is valid, False otherwise
        """
        pos = (row, col)
        
        # Check all neighbors
        for neighbor_pos in self._get_neighbor_positions(pos):
            if neighbor_pos in self.seat_map:
                neighbor = self.seat_map[neighbor_pos]
                if neighbor.student.branch == student_branch:
                    return False
        
        return True
    
    def get_violations_summary(self) -> Dict:
        """
        Get summary of branch separation violations.
        
        Returns:
            Dictionary with violation statistics
        """
        if not self.violations:
            return {
                "total_violations": 0,
                "affected_students": 0,
                "by_branch": {}
            }
        
        affected_students = set()
        by_branch = {}
        
        for violation in self.violations:
            affected_students.add(violation["student1_usn"])
            affected_students.add(violation["student2_usn"])
            
            branch = violation["student1_branch"]
            by_branch[branch] = by_branch.get(branch, 0) + 1
        
        return {
            "total_violations": len(self.violations),
            "affected_students": len(affected_students),
            "by_branch": by_branch
        }
