"""
Workload balancer for fair invigilator duty distribution.

Ensures fair distribution of invigilation duties across faculty.
"""
from typing import List, Dict, Tuple
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.schedule import ScheduledExam
from app.models.invigilator import InvigilatorAssignment


class WorkloadBalancer:
    """
    Balances invigilator workload across faculty.
    
    Strategies:
    1. Round-robin assignment
    2. Prefer faculty with lower current workload
    3. Distribute across departments
    4. Consider historical assignments
    """
    
    def __init__(self, db: Session):
        """
        Initialize workload balancer.
        
        Args:
            db: Database session
        """
        self.db = db
        self.workload_cache: Dict[int, int] = {}
    
    def calculate_faculty_workload(
        self,
        faculty: User,
        include_pending: bool = True
    ) -> int:
        """
        Calculate total workload points for a faculty member.
        
        Args:
            faculty: Faculty member
            include_pending: Whether to include ASSIGNED (not confirmed) duties
            
        Returns:
            Total workload points
        """
        # Check cache first
        if faculty.id in self.workload_cache:
            return self.workload_cache[faculty.id]
        
        # Query assignments
        query = self.db.query(InvigilatorAssignment).filter(
            InvigilatorAssignment.faculty_id == faculty.id
        )
        
        if not include_pending:
            from app.models.invigilator import InvigilatorStatus
            query = query.filter(
                InvigilatorAssignment.status == InvigilatorStatus.CONFIRMED
            )
        
        assignments = query.all()
        
        # Sum workload points
        total_workload = sum(a.workload_points for a in assignments)
        
        # Cache result
        self.workload_cache[faculty.id] = total_workload
        
        return total_workload
    
    def get_workload_distribution(
        self,
        faculty_list: List[User]
    ) -> Dict[int, int]:
        """
        Get workload distribution for a list of faculty.
        
        Args:
            faculty_list: List of faculty members
            
        Returns:
            Dictionary mapping faculty_id to workload points
        """
        distribution = {}
        
        for faculty in faculty_list:
            distribution[faculty.id] = self.calculate_faculty_workload(faculty)
        
        return distribution
    
    def select_best_faculty(
        self,
        eligible_faculty: List[User],
        scheduled_exam: ScheduledExam,
        prefer_same_department: bool = False
    ) -> User:
        """
        Select best faculty member based on workload balancing.
        
        Args:
            eligible_faculty: List of eligible faculty
            scheduled_exam: Exam to assign for
            prefer_same_department: Prefer faculty from exam's department
            
        Returns:
            Selected faculty member
        """
        if not eligible_faculty:
            return None
        
        # Get workload for all eligible faculty
        workload_scores = []
        
        for faculty in eligible_faculty:
            workload = self.calculate_faculty_workload(faculty)
            
            # Calculate score (lower is better)
            score = workload
            
            # Bonus for same department (reduce score)
            if prefer_same_department and faculty.department == scheduled_exam.course.branch:
                score -= 5  # Preference bonus
            
            workload_scores.append((faculty, score))
        
        # Sort by score (ascending - lower workload first)
        workload_scores.sort(key=lambda x: x[1])
        
        # Return faculty with lowest workload
        return workload_scores[0][0]
    
    def balance_assignments(
        self,
        scheduled_exams: List[ScheduledExam],
        available_faculty: List[User],
        assignments_per_exam: int = 2
    ) -> Dict[int, List[User]]:
        """
        Balance assignments across all exams fairly.
        
        Args:
            scheduled_exams: List of exams needing invigilators
            available_faculty: List of available faculty
            assignments_per_exam: Number of invigilators per exam
            
        Returns:
            Dictionary mapping exam_id to list of assigned faculty
        """
        # Initialize workload tracking
        faculty_workload = {f.id: 0 for f in available_faculty}
        assignments = defaultdict(list)
        
        # Sort exams by date (assign earlier exams first)
        sorted_exams = sorted(scheduled_exams, key=lambda e: (e.exam_date, e.session.value))
        
        # Assign faculty to each exam
        for exam in sorted_exams:
            # Select faculty with lowest workload
            for _ in range(assignments_per_exam):
                # Get faculty not yet assigned to this exam
                already_assigned = set(assignments[exam.id])
                available = [
                    f for f in available_faculty
                    if f not in already_assigned
                ]
                
                if not available:
                    break  # No more faculty available
                
                # Select faculty with minimum workload
                selected = min(available, key=lambda f: faculty_workload[f.id])
                
                # Assign
                assignments[exam.id].append(selected)
                faculty_workload[selected.id] += 1
        
        return dict(assignments)
    
    def get_workload_statistics(
        self,
        faculty_list: List[User] = None
    ) -> Dict:
        """
        Get workload statistics.
        
        Args:
            faculty_list: Optional list of faculty (None = all faculty)
            
        Returns:
            Dictionary with statistics
        """
        if faculty_list is None:
            from app.models.user import UserRole
            faculty_list = self.db.query(User).filter(
                User.role == UserRole.FACULTY,
                User.is_active == True
            ).all()
        
        if not faculty_list:
            return {
                "total_faculty": 0,
                "total_workload": 0,
                "avg_workload": 0,
                "min_workload": 0,
                "max_workload": 0,
                "std_deviation": 0
            }
        
        workloads = [
            self.calculate_faculty_workload(f)
            for f in faculty_list
        ]
        
        total = sum(workloads)
        avg = total / len(workloads) if workloads else 0
        
        # Calculate standard deviation
        if len(workloads) > 1:
            variance = sum((w - avg) ** 2 for w in workloads) / len(workloads)
            std_dev = variance ** 0.5
        else:
            std_dev = 0
        
        return {
            "total_faculty": len(faculty_list),
            "total_workload": total,
            "avg_workload": avg,
            "min_workload": min(workloads) if workloads else 0,
            "max_workload": max(workloads) if workloads else 0,
            "std_deviation": std_dev,
            "fairness_score": 100 - min(100, std_dev * 10)  # 0-100 scale
        }
    
    def clear_cache(self) -> None:
        """Clear workload cache."""
        self.workload_cache.clear()
