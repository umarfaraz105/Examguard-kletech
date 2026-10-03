"""
Conflict graph builder for exam scheduling.

Builds a graph where nodes are courses and edges represent conflicts
(i.e., two courses share at least one common student).
"""
from typing import Dict, Set, List, Tuple
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.course import Course
from app.models.student import Student


class ConflictGraph:
    """
    Conflict graph for exam scheduling.
    
    A graph where:
    - Nodes: Courses
    - Edges: Conflict between courses (share students)
    - Edge weight: Number of students shared between courses
    
    This graph is used to:
    1. Identify which courses cannot be scheduled at the same time
    2. Apply graph coloring algorithms for initial scheduling
    3. Optimize schedule to minimize student conflicts
    """
    
    def __init__(self):
        """Initialize empty conflict graph."""
        self.courses: Dict[int, Course] = {}  # course_id -> Course
        self.conflicts: Dict[int, Set[int]] = defaultdict(set)  # course_id -> set of conflicting course_ids
        self.conflict_weights: Dict[Tuple[int, int], int] = {}  # (course_id1, course_id2) -> num_students
        self.student_courses: Dict[int, Set[int]] = defaultdict(set)  # student_id -> set of course_ids
    
    def build_from_database(
        self,
        db: Session,
        semester: int,
        branch: str = None,
        academic_year: str = None
    ) -> None:
        """
        Build conflict graph from database.
        
        Args:
            db: Database session
            semester: Semester number to filter courses
            branch: Optional branch filter
            academic_year: Optional academic year filter
        """
        # Query courses
        query = db.query(Course).filter(Course.semester == semester)
        if branch:
            query = query.filter(Course.branch == branch)
        if academic_year:
            query = query.filter(Course.academic_year == academic_year)
        
        courses = query.all()
        
        # Build graph
        for course in courses:
            self.add_course(course)
            
            # Get students enrolled in this course
            for student in course.students:
                self.student_courses[student.id].add(course.id)
        
        # Build conflict edges
        self._build_conflict_edges()
    
    def add_course(self, course: Course) -> None:
        """
        Add a course to the graph.
        
        Args:
            course: Course to add
        """
        self.courses[course.id] = course
        if course.id not in self.conflicts:
            self.conflicts[course.id] = set()
    
    def _build_conflict_edges(self) -> None:
        """Build conflict edges based on shared students."""
        # For each student, create conflicts between their courses
        for student_id, course_ids in self.student_courses.items():
            course_list = list(course_ids)
            
            # Create pairwise conflicts
            for i in range(len(course_list)):
                for j in range(i + 1, len(course_list)):
                    course1_id = course_list[i]
                    course2_id = course_list[j]
                    
                    # Add bidirectional edge
                    self.conflicts[course1_id].add(course2_id)
                    self.conflicts[course2_id].add(course1_id)
                    
                    # Increment weight (number of shared students)
                    key = tuple(sorted([course1_id, course2_id]))
                    self.conflict_weights[key] = self.conflict_weights.get(key, 0) + 1
    
    def has_conflict(self, course1_id: int, course2_id: int) -> bool:
        """
        Check if two courses have a conflict.
        
        Args:
            course1_id: First course ID
            course2_id: Second course ID
            
        Returns:
            True if courses conflict (share students), False otherwise
        """
        return course2_id in self.conflicts.get(course1_id, set())
    
    def get_conflict_weight(self, course1_id: int, course2_id: int) -> int:
        """
        Get the weight of conflict between two courses.
        
        Args:
            course1_id: First course ID
            course2_id: Second course ID
            
        Returns:
            Number of students shared between courses (0 if no conflict)
        """
        key = tuple(sorted([course1_id, course2_id]))
        return self.conflict_weights.get(key, 0)
    
    def get_neighbors(self, course_id: int) -> Set[int]:
        """
        Get all courses that conflict with the given course.
        
        Args:
            course_id: Course ID
            
        Returns:
            Set of conflicting course IDs
        """
        return self.conflicts.get(course_id, set())
    
    def get_degree(self, course_id: int) -> int:
        """
        Get the degree of a course in the conflict graph.
        
        Degree = number of conflicting courses.
        Courses with higher degree are harder to schedule.
        
        Args:
            course_id: Course ID
            
        Returns:
            Number of conflicting courses
        """
        return len(self.conflicts.get(course_id, set()))
    
    def get_chromatic_number_lower_bound(self) -> int:
        """
        Get lower bound for chromatic number (minimum colors needed).
        
        This is the size of the maximum clique, which gives us the
        minimum number of time slots needed.
        
        Returns:
            Lower bound for chromatic number
        """
        if not self.courses:
            return 0
        
        # Use maximum degree + 1 as a simple lower bound
        # (More sophisticated algorithms exist but this is sufficient)
        max_degree = max(self.get_degree(cid) for cid in self.courses.keys())
        return max_degree + 1
    
    def get_sorted_courses_by_degree(self) -> List[int]:
        """
        Get courses sorted by degree (descending).
        
        Courses with higher degree should be scheduled first
        as they have more constraints.
        
        Returns:
            List of course IDs sorted by degree (highest first)
        """
        return sorted(
            self.courses.keys(),
            key=lambda cid: self.get_degree(cid),
            reverse=True
        )
    
    def get_independent_set(self, course_ids: Set[int]) -> Set[int]:
        """
        Find an independent set from given courses.
        
        An independent set is a set of courses with no conflicts
        (can be scheduled at the same time).
        
        Uses greedy algorithm.
        
        Args:
            course_ids: Set of course IDs to consider
            
        Returns:
            Set of course IDs that don't conflict with each other
        """
        independent = set()
        remaining = set(course_ids)
        
        # Sort by degree (schedule high-degree courses first)
        sorted_courses = [
            cid for cid in self.get_sorted_courses_by_degree()
            if cid in remaining
        ]
        
        for course_id in sorted_courses:
            if course_id not in remaining:
                continue
            
            # Check if this course conflicts with any in independent set
            conflicts_with_independent = any(
                self.has_conflict(course_id, ind_course)
                for ind_course in independent
            )
            
            if not conflicts_with_independent:
                independent.add(course_id)
                remaining.remove(course_id)
        
        return independent
    
    def get_statistics(self) -> Dict:
        """
        Get conflict graph statistics.
        
        Returns:
            Dictionary with graph statistics
        """
        num_courses = len(self.courses)
        num_edges = sum(len(neighbors) for neighbors in self.conflicts.values()) // 2
        
        if num_courses == 0:
            return {
                "num_courses": 0,
                "num_conflicts": 0,
                "avg_degree": 0,
                "max_degree": 0,
                "min_time_slots_needed": 0
            }
        
        degrees = [self.get_degree(cid) for cid in self.courses.keys()]
        
        return {
            "num_courses": num_courses,
            "num_conflicts": num_edges,
            "avg_degree": sum(degrees) / len(degrees),
            "max_degree": max(degrees),
            "min_degree": min(degrees),
            "min_time_slots_needed": self.get_chromatic_number_lower_bound()
        }
    
    def __repr__(self) -> str:
        """String representation."""
        stats = self.get_statistics()
        return (
            f"<ConflictGraph(courses={stats['num_courses']}, "
            f"conflicts={stats['num_conflicts']}, "
            f"avg_degree={stats['avg_degree']:.2f})>"
        )
