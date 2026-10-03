"""CSV parser for course registration uploads."""
import csv
from io import StringIO, BytesIO
from typing import List, Tuple, Dict, Any
from app.models.course_registration import CourseRegistration, RegistrationStatus
from app.schemas.course_registration import RegistrationError


class CSVParser:
    """Parse and validate course registration CSV files."""
    
    # Required columns in CSV
    REQUIRED_COLUMNS = {
        'usn': 'University Seat Number',
        'student_name': 'Student Name',
        'department_code': 'Department Code',
        'semester': 'Semester',
        'academic_year': 'Academic Year',
        'course_code': 'Course Code',
        'course_name': 'Course Name',
        'course_type': 'Course Type (THEORY/LAB/ELECTIVE)',
    }
    
    # Optional columns
    OPTIONAL_COLUMNS = {
        'credits': 'Credits',
        'exam_duration_minutes': 'Exam Duration (minutes)',
        'email': 'Email',
    }
    
    def __init__(self):
        """Initialize CSV parser."""
        self.errors: List[RegistrationError] = []
        self.warnings: List[str] = []
        self.row_number = 0
    
    def parse_file(self, file_content: bytes) -> Tuple[List[Dict[str, Any]], List[RegistrationError], List[str]]:
        """
        Parse CSV file and return list of records.
        
        Args:
            file_content: File content as bytes
            
        Returns:
            Tuple of (records, errors, warnings)
        """
        self.errors = []
        self.warnings = []
        self.row_number = 0
        records = []
        
        try:
            # Try to decode as UTF-8 first
            try:
                text_content = file_content.decode('utf-8')
            except UnicodeDecodeError:
                # Try UTF-16
                text_content = file_content.decode('utf-16')
            
            # Parse CSV
            csv_reader = csv.DictReader(StringIO(text_content))
            
            # Validate headers
            if not csv_reader.fieldnames:
                self.errors.append(RegistrationError(
                    row_number=0,
                    usn="N/A",
                    field="headers",
                    message="No headers found in CSV",
                    error_type="MISSING_FIELD"
                ))
                return records, self.errors, self.warnings
            
            missing_columns = self._validate_headers(csv_reader.fieldnames)
            if missing_columns:
                for col in missing_columns:
                    self.errors.append(RegistrationError(
                        row_number=0,
                        usn="N/A",
                        field=col,
                        message=f"Missing required column: {col}",
                        error_type="MISSING_FIELD"
                    ))
                return records, self.errors, self.warnings
            
            # Parse rows
            for row_num, row in enumerate(csv_reader, start=2):
                self.row_number = row_num
                record, is_valid = self._parse_row(row)
                if record:
                    record['_row_number'] = row_num
                    record['_is_valid'] = is_valid
                    records.append(record)
            
        except Exception as e:
            self.errors.append(RegistrationError(
                row_number=0,
                usn="N/A",
                field="file",
                message=f"Failed to parse file: {str(e)}",
                error_type="INVALID_FORMAT"
            ))
        
        return records, self.errors, self.warnings
    
    def _validate_headers(self, headers: List[str]) -> List[str]:
        """Validate CSV headers."""
        headers_lower = [h.lower().strip() for h in headers]
        missing = []
        
        for required_col in self.REQUIRED_COLUMNS.keys():
            if required_col not in headers_lower:
                missing.append(required_col)
        
        return missing
    
    def _parse_row(self, row: Dict[str, str]) -> Tuple[Dict[str, Any], bool]:
        """Parse a single row."""
        record = {}
        is_valid = True
        row_errors = []
        
        # Normalize keys
        row_normalized = {k.lower().strip(): v.strip() if v else "" for k, v in row.items()}
        
        # Parse required fields
        usn = row_normalized.get('usn', '').strip()
        if not usn:
            is_valid = False
            row_errors.append("USN is required")
        record['usn'] = usn
        
        student_name = row_normalized.get('student_name', '').strip()
        if not student_name:
            is_valid = False
            row_errors.append("Student name is required")
        record['student_name'] = student_name
        
        department_code = row_normalized.get('department_code', '').strip().upper()
        if not department_code:
            is_valid = False
            row_errors.append("Department code is required")
        record['department_code'] = department_code
        
        # Parse semester
        try:
            semester = int(row_normalized.get('semester', 0))
            if not 1 <= semester <= 8:
                is_valid = False
                row_errors.append("Semester must be between 1 and 8")
            record['semester'] = semester
        except (ValueError, TypeError):
            is_valid = False
            row_errors.append("Semester must be a number between 1 and 8")
            record['semester'] = 0
        
        academic_year = row_normalized.get('academic_year', '').strip()
        if not academic_year:
            is_valid = False
            row_errors.append("Academic year is required")
        record['academic_year'] = academic_year
        
        course_code = row_normalized.get('course_code', '').strip().upper()
        if not course_code:
            is_valid = False
            row_errors.append("Course code is required")
        record['course_code'] = course_code
        
        course_name = row_normalized.get('course_name', '').strip()
        if not course_name:
            is_valid = False
            row_errors.append("Course name is required")
        record['course_name'] = course_name
        
        course_type = row_normalized.get('course_type', '').strip().upper()
        if course_type not in ['THEORY', 'LAB', 'ELECTIVE']:
            is_valid = False
            row_errors.append("Course type must be THEORY, LAB, or ELECTIVE")
        record['course_type'] = course_type
        
        # Parse optional fields
        try:
            credits = int(row_normalized.get('credits', 3))
            if not 1 <= credits <= 6:
                self.warnings.append(f"Row {self.row_number}: Credits {credits} unusual (expected 1-6)")
            record['credits'] = credits
        except (ValueError, TypeError):
            record['credits'] = 3
        
        try:
            exam_duration = int(row_normalized.get('exam_duration_minutes', 180))
            if not 30 <= exam_duration <= 480:
                self.warnings.append(f"Row {self.row_number}: Exam duration {exam_duration} min unusual (expected 30-480)")
            record['exam_duration_minutes'] = exam_duration
        except (ValueError, TypeError):
            record['exam_duration_minutes'] = 180
        
        email = row_normalized.get('email', '').strip()
        if email and not self._validate_email(email):
            self.warnings.append(f"Row {self.row_number}: Invalid email format: {email}")
            email = None
        record['email'] = email
        
        # Store validation errors
        if row_errors:
            record['validation_errors'] = "; ".join(row_errors)
            error_msg = "; ".join(row_errors)
            self.errors.append(RegistrationError(
                row_number=self.row_number,
                usn=usn,
                field="row",
                message=error_msg,
                error_type="INVALID_FORMAT"
            ))
        
        record['is_valid'] = is_valid
        return record, is_valid
    
    def _validate_email(self, email: str) -> bool:
        """Simple email validation."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def generate_template() -> bytes:
        """Generate CSV template for download."""
        output = StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=list(CSVParser.REQUIRED_COLUMNS.keys()) + list(CSVParser.OPTIONAL_COLUMNS.keys())
        )
        
        # Write headers with descriptions
        writer.writeheader()
        
        # Write sample row 1
        writer.writerow({
            'usn': '1KS21CS001',
            'student_name': 'John Doe',
            'department_code': 'CSE',
            'semester': 4,
            'academic_year': '2024-25',
            'course_code': 'CS301',
            'course_name': 'Data Structures',
            'course_type': 'THEORY',
            'credits': 3,
            'exam_duration_minutes': 180,
            'email': 'john@example.com'
        })
        
        # Write sample row 2
        writer.writerow({
            'usn': '1KS21CS002',
            'student_name': 'Jane Smith',
            'department_code': 'CSE',
            'semester': 4,
            'academic_year': '2024-25',
            'course_code': 'CS302',
            'course_name': 'Database Management',
            'course_type': 'THEORY',
            'credits': 3,
            'exam_duration_minutes': 180,
            'email': 'jane@example.com'
        })
        
        return output.getvalue().encode('utf-8')