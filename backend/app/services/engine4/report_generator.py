"""
Report generator for PDF and Excel exports.

Generates compliance reports, exam schedules, and seating charts.
"""
from typing import Dict, List
from io import BytesIO
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.plan import Plan
from app.models.schedule import ScheduledExam
from app.services.engine4.validator import PlanValidator
from app.services.engine4.compliance_scorer import ComplianceScorer


class ReportGenerator:
    """
    Generates reports in various formats.
    
    Formats:
    - PDF: Compliance reports, exam schedules
    - Excel: Detailed data exports, seating charts
    - JSON: API-friendly data
    """
    
    def __init__(self, db: Session):
        """
        Initialize report generator.
        
        Args:
            db: Database session
        """
        self.db = db
        self.validator = PlanValidator(db)
        self.scorer = ComplianceScorer(db)
    
    def generate_compliance_report_pdf(self, plan: Plan) -> BytesIO:
        """
        Generate PDF compliance report.
        
        Args:
            plan: Plan to report on
            
        Returns:
            BytesIO buffer with PDF content
        """
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30
        )
        story.append(Paragraph(f"Compliance Report: {plan.plan_name}", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Get compliance score
        score_data = self.scorer.calculate_score(plan)
        
        # Summary section
        story.append(Paragraph("Executive Summary", styles['Heading2']))
        story.append(Spacer(1, 0.2*inch))
        
        summary_data = [
            ['Metric', 'Value'],
            ['Compliance Score', f"{score_data['score']}/100"],
            ['Grade', score_data['grade']],
            ['Compliance Level', score_data['compliance_level']],
            ['Status', 'VALID' if score_data['is_valid'] else 'INVALID'],
            ['Total Issues', str(score_data['total_issues'])],
            ['Critical Issues', str(score_data['critical_issues'])],
            ['Errors', str(score_data['errors'])],
            ['Warnings', str(score_data['warnings'])],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.5*inch))
        
        # Issues section
        if score_data['issues']:
            story.append(Paragraph("Issues Detected", styles['Heading2']))
            story.append(Spacer(1, 0.2*inch))
            
            for issue in score_data['issues'][:20]:  # Limit to first 20
                severity_color = {
                    'CRITICAL': colors.red,
                    'ERROR': colors.orange,
                    'WARNING': colors.yellow,
                    'INFO': colors.lightblue
                }.get(issue['severity'], colors.black)
                
                issue_text = f"<b>[{issue['severity']}]</b> {issue['rule_name']}: {issue['message']}"
                story.append(Paragraph(issue_text, styles['Normal']))
                story.append(Spacer(1, 0.1*inch))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def generate_exam_schedule_excel(self, plan: Plan) -> BytesIO:
        """
        Generate Excel exam schedule.
        
        Args:
            plan: Plan to export
            
        Returns:
            BytesIO buffer with Excel content
        """
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment
        
        # Create workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Exam Schedule"
        
        # Header
        headers = [
            'Course Code', 'Course Name', 'Date', 'Session',
            'Start Time', 'End Time', 'Room', 'Students', 'Invigilators'
        ]
        
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color="1e40af", end_color="1e40af", fill_type="solid")
            cell.alignment = Alignment(horizontal="center")
        
        # Get scheduled exams
        exams = self.db.query(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id
        ).order_by(ScheduledExam.exam_date, ScheduledExam.session).all()
        
        # Data rows
        for row_num, exam in enumerate(exams, 2):
            ws.cell(row=row_num, column=1, value=exam.course.course_code)
            ws.cell(row=row_num, column=2, value=exam.course.course_name)
            ws.cell(row=row_num, column=3, value=exam.exam_date.strftime('%Y-%m-%d') if exam.exam_date else '')
            ws.cell(row=row_num, column=4, value=exam.session.value if exam.session else '')
            ws.cell(row=row_num, column=5, value=exam.start_time.strftime('%H:%M') if exam.start_time else '')
            ws.cell(row=row_num, column=6, value=exam.end_time.strftime('%H:%M') if exam.end_time else '')
            ws.cell(row=row_num, column=7, value=exam.room.room_code if exam.room else 'TBA')
            ws.cell(row=row_num, column=8, value=exam.num_students)
            ws.cell(row=row_num, column=9, value=len(exam.invigilator_assignments))
        
        # Adjust column widths
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[openpyxl.utils.get_column_letter(col)].width = 15
        
        # Save to buffer
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer
    
    def generate_seating_chart_excel(self, scheduled_exam: ScheduledExam) -> BytesIO:
        """
        Generate Excel seating chart for an exam.
        
        Args:
            scheduled_exam: Exam to generate chart for
            
        Returns:
            BytesIO buffer with Excel content
        """
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Seating Chart"
        
        # Title
        ws.merge_cells('A1:F1')
        title_cell = ws['A1']
        title_cell.value = f"Seating Chart: {scheduled_exam.course.course_code}"
        title_cell.font = Font(bold=True, size=16)
        title_cell.alignment = Alignment(horizontal="center")
        
        # Exam info
        ws['A2'] = "Date:"
        ws['B2'] = scheduled_exam.exam_date.strftime('%Y-%m-%d') if scheduled_exam.exam_date else ''
        ws['A3'] = "Session:"
        ws['B3'] = scheduled_exam.session.value if scheduled_exam.session else ''
        ws['A4'] = "Room:"
        ws['B4'] = scheduled_exam.room.room_code if scheduled_exam.room else 'TBA'
        
        # Headers for seat list
        row = 6
        headers = ['Seat Code', 'Student USN', 'Student Name', 'Branch', 'Row', 'Column']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=row, column=col, value=header)
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="D3D3D3", end_color="D3D3D3", fill_type="solid")
        
        # Get seat assignments
        from app.models.seating import SeatAssignment
        assignments = self.db.query(SeatAssignment).filter(
            SeatAssignment.scheduled_exam_id == scheduled_exam.id
        ).order_by(SeatAssignment.seat_code).all()
        
        # Data
        for i, assignment in enumerate(assignments, row + 1):
            ws.cell(row=i, column=1, value=assignment.seat_code)
            ws.cell(row=i, column=2, value=assignment.student.usn)
            ws.cell(row=i, column=3, value=assignment.student.full_name)
            ws.cell(row=i, column=4, value=assignment.student.branch)
            ws.cell(row=i, column=5, value=assignment.row_number)
            ws.cell(row=i, column=6, value=assignment.column_number)
        
        # Adjust widths
        ws.column_dimensions['A'].width = 15
        ws.column_dimensions['B'].width = 15
        ws.column_dimensions['C'].width = 25
        ws.column_dimensions['D'].width = 10
        ws.column_dimensions['E'].width = 8
        ws.column_dimensions['F'].width = 8
        
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer
    
    def generate_json_report(self, plan: Plan) -> Dict:
        """
        Generate JSON report data.
        
        Args:
            plan: Plan to report on
            
        Returns:
            Dictionary with all report data
        """
        score_data = self.scorer.calculate_score(plan)
        is_valid, issues = self.validator.validate_plan(plan)
        
        # Get exams
        exams = self.db.query(ScheduledExam).filter(
            ScheduledExam.plan_id == plan.id
        ).all()
        
        return {
            "report_generated": datetime.utcnow().isoformat(),
            "plan": {
                "id": plan.id,
                "name": plan.plan_name,
                "exam_type": plan.exam_type.value,
                "status": plan.status.value,
                "version": plan.version
            },
            "compliance": score_data,
            "exams": [
                {
                    "id": exam.id,
                    "course_code": exam.course.course_code,
                    "date": exam.exam_date.isoformat() if exam.exam_date else None,
                    "session": exam.session.value if exam.session else None,
                    "room": exam.room.room_code if exam.room else None,
                    "students": exam.num_students
                }
                for exam in exams
            ],
            "validation_summary": self.validator.get_summary()
        }
