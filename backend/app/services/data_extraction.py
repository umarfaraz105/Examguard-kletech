"""
Data extraction service for analyzing uploaded course registrations.

This service processes approved CSV uploads to:
1. Build student-course matrices
2. Detect scheduling conflicts
3. Extract course metadata
4. Generate statistics for engines
"""
from typing import Dict, List, Set, Tuple, Optional
from sqlalchemy.orm import Session
from collections import defaultdict
from datetime import datetime

from app.models.course_registration import CourseRegistration, CourseRegistrationUpload, RegistrationStatus
from app.models.student import Student
from app.models.course import Course
from app.models.department import Department


class StudentCourseMatrix:
    """
    Represents the student-course enrollment matrix.
    
    This is the core data structure for scheduling - shows which students
    are enrolled in which courses.
    """
    
    def __init__(self):
        self.student_courses: Dict[str, Set[str]] = defaultdict(set)  # usn -> {course_codes}
        self.course_students: Dict[str, Set[str]] = defaultdict(set)  # course_code -> {usns}
        self.course_metadata: Dict[str, Dict] = {}  # course_code -> {name, type, credits, duration, dept}
        self.student_metadata: Dict[str, Dict] = {}  # usn -> {name, email, dept, semester}
        
    def add_enrollment(self, usn: str, course_code: str, 
                      student_data: Dict, course_data: Dict):
        """Add a student-course enrollment."""
        self.student_courses[usn].add(course_code)
        self.course_students[course_code].add(usn)
        
        # Store metadata if not already present
        if usn not in self.student_metadata:
            self.student_metadata[usn] = student_data
        if course_code not in self.course_metadata:
            self.course_metadata[course_code] = course_data
    
    def get_conflicts(self) -> List[Dict]:
        """
        Detect scheduling conflicts.
        
        A conflict occurs when a student is enrolled in multiple courses
        that would need to be scheduled at the same time.
        
        Returns:
            List of conflict groups with student counts
        """
        conflicts = []
        
        # Find all course pairs that share students
        course_pairs_checked = set()
        
        for course1 in self.course_students.keys():
            for course2 in self.course_students.keys():
                if course1 >= course2:  # Skip self and duplicates
                    continue
                    
                pair_key = tuple(sorted([course1, course2]))
                if pair_key in course_pairs_checked:
                    continue
                course_pairs_checked.add(pair_key)
                
                # Find common students
                common_students = self.course_students[course1] & self.course_students[course2]
                
                if common_students:
                    conflicts.append({
                        'course1': course1,
                        'course2': course2,
                        'course1_name': self.course_metadata[course1]['name'],
                        'course2_name': self.course_metadata[course2]['name'],
                        'student_count': len(common_students),
                        'common_students': list(common_students)[:10]  # Sample
                    })
        
        # Sort by conflict severity (student count)
        conflicts.sort(key=lambda x: x['student_count'], reverse=True)
        
        return conflicts
    
    def get_statistics(self) -> Dict:
        """Get matrix statistics."""
        return {
            'total_students': len(self.student_courses),
            'total_courses': len(self.course_students),
            'total_enrollments': sum(len(courses) for courses in self.student_courses.values()),
            'avg_courses_per_student': sum(len(courses) for courses in self.student_courses.values()) / len(self.student_courses) if self.student_courses else 0,
            'avg_students_per_course': sum(len(students) for students in self.course_students.values()) / len(self.course_students) if self.course_students else 0,
            'largest_course': max(self.course_students.items(), key=lambda x: len(x[1]))[0] if self.course_students else None,
            'largest_course_size': max(len(students) for students in self.course_students.values()) if self.course_students else 0
        }
    
    def get_courses_by_department(self) -> Dict[str, List[str]]:
        """Group courses by department."""
        dept_courses = defaultdict(list)
        for course_code, metadata in self.course_metadata.items():
            dept_code = metadata.get('department_code', 'UNKNOWN')
            dept_courses[dept_code].append(course_code)
        return dict(dept_courses)
    
    def get_courses_by_semester(self) -> Dict[int, List[str]]:
        """Group courses by semester (based on enrolled students)."""
        semester_courses = defaultdict(set)
        
        for course_code, students in self.course_students.items():
            for usn in students:
                semester = self.student_metadata[usn].get('semester')
                if semester:
                    semester_courses[semester].add(course_code)
        
        return {sem: list(courses) for sem, courses in semester_courses.items()}
    
    def to_dict(self) -> Dict:
        """Export as dictionary for API responses."""
        return {
            'statistics': self.get_statistics(),
            'conflicts': self.get_conflicts()[:50],  # Top 50 conflicts
            'courses_by_department': self.get_courses_by_department(),
            'courses_by_semester': self.get_courses_by_semester(),
            'course_metadata': self.course_metadata,
            'matrix_preview': {
                'sample_students': list(self.student_courses.keys())[:10],
                'sample_courses': list(self.course_students.keys())[:10]
            }
        }


class DataExtractionService:
    """Service for extracting and analyzing course registration data."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def extract_from_upload(self, upload_id: int) -> StudentCourseMatrix:
        """
        Extract student-course matrix from an approved upload.
        
        Args:
            upload_id: ID of the CourseRegistrationUpload
            
        Returns:
            StudentCourseMatrix with all enrollments and metadata
            
        Raises:
            ValueError: If upload not found or not approved
        """
        # Get upload
        upload = self.db.query(CourseRegistrationUpload).filter(
            CourseRegistrationUpload.id == upload_id
        ).first()
        
        if not upload:
            raise ValueError(f"Upload {upload_id} not found")
        
        if upload.status != RegistrationStatus.APPROVED:
            raise ValueError(f"Upload {upload_id} is not approved (status: {upload.status.value})")
        
        # Get all valid registrations
        registrations = self.db.query(CourseRegistration).filter(
            CourseRegistration.upload_id == upload_id,
            CourseRegistration.is_valid == True
        ).all()
        
        # Build matrix
        matrix = StudentCourseMatrix()
        
        for reg in registrations:
            student_data = {
                'name': reg.student_name,
                'email': reg.email,
                'department_code': reg.department_code,
                'semester': reg.semester,
                'academic_year': reg.academic_year
            }
            
            course_data = {
                'name': reg.course_name,
                'type': reg.course_type,
                'credits': reg.credits,
                'duration_minutes': reg.exam_duration_minutes,
                'department_code': reg.department_code
            }
            
            matrix.add_enrollment(reg.usn, reg.course_code, student_data, course_data)
        
        return matrix
    
    def extract_from_department(self, department_id: int) -> StudentCourseMatrix:
        """
        Extract all approved registrations for a department.
        
        Args:
            department_id: Department ID
            
        Returns:
            StudentCourseMatrix with all department enrollments
        """
        # Get all approved uploads for department
        uploads = self.db.query(CourseRegistrationUpload).filter(
            CourseRegistrationUpload.department_id == department_id,
            CourseRegistrationUpload.status == RegistrationStatus.APPROVED
        ).all()
        
        matrix = StudentCourseMatrix()
        
        for upload in uploads:
            registrations = self.db.query(CourseRegistration).filter(
                CourseRegistration.upload_id == upload.id,
                CourseRegistration.is_valid == True
            ).all()
            
            for reg in registrations:
                student_data = {
                    'name': reg.student_name,
                    'email': reg.email,
                    'department_code': reg.department_code,
                    'semester': reg.semester,
                    'academic_year': reg.academic_year
                }
                
                course_data = {
                    'name': reg.course_name,
                    'type': reg.course_type,
                    'credits': reg.credits,
                    'duration_minutes': reg.exam_duration_minutes,
                    'department_code': reg.department_code
                }
                
                matrix.add_enrollment(reg.usn, reg.course_code, student_data, course_data)
        
        return matrix
    
    def extract_all_approved(self) -> StudentCourseMatrix:
        """
        Extract ALL approved registrations across all departments.
        
        Returns:
            StudentCourseMatrix with all system-wide enrollments
        """
        # Get all approved uploads
        uploads = self.db.query(CourseRegistrationUpload).filter(
            CourseRegistrationUpload.status == RegistrationStatus.APPROVED
        ).all()
        
        matrix = StudentCourseMatrix()
        
        for upload in uploads:
            registrations = self.db.query(CourseRegistration).filter(
                CourseRegistration.upload_id == upload.id,
                CourseRegistration.is_valid == True
            ).all()
            
            for reg in registrations:
                student_data = {
                    'name': reg.student_name,
                    'email': reg.email,
                    'department_code': reg.department_code,
                    'semester': reg.semester,
                    'academic_year': reg.academic_year
                }
                
                course_data = {
                    'name': reg.course_name,
                    'type': reg.course_type,
                    'credits': reg.credits,
                    'duration_minutes': reg.exam_duration_minutes,
                    'department_code': reg.department_code
                }
                
                matrix.add_enrollment(reg.usn, reg.course_code, student_data, course_data)
        
        return matrix
    
    def sync_to_database(self, matrix: StudentCourseMatrix) -> Dict[str, int]:
        """
        Sync extracted data to Student and Course tables.
        
        This creates missing students and courses from the registration data.
        
        Args:
            matrix: StudentCourseMatrix to sync
            
        Returns:
            Dictionary with counts of created records
        """
        students_created = 0
        courses_created = 0
        
        # Sync students
        for usn, metadata in matrix.student_metadata.items():
            existing = self.db.query(Student).filter(Student.usn == usn).first()
            if not existing:
                # Get department
                dept = self.db.query(Department).filter(
                    Department.code == metadata['department_code']
                ).first()
                
                student = Student(
                    usn=usn,
                    name=metadata['name'],
                    email=metadata.get('email'),
                    semester=metadata['semester'],
                    department_id=dept.id if dept else None,
                    branch_legacy=metadata['department_code']
                )
                self.db.add(student)
                students_created += 1
        
        # Sync courses
        for course_code, metadata in matrix.course_metadata.items():
            existing = self.db.query(Course).filter(Course.course_code == course_code).first()
            if not existing:
                # Get department
                dept = self.db.query(Department).filter(
                    Department.code == metadata['department_code']
                ).first()
                
                course = Course(
                    course_code=course_code,
                    course_name=metadata['name'],
                    course_type=metadata['type'],
                    credits=metadata['credits'],
                    department_id=dept.id if dept else None,
                    branch_legacy=metadata['department_code']
                )
                self.db.add(course)
                courses_created += 1
        
        self.db.commit()
        
        return {
            'students_created': students_created,
            'courses_created': courses_created
        }
