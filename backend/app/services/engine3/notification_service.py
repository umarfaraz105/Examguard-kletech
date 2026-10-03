"""
Notification service for exam management.

Sends notifications to faculty about duty assignments, changes, and reminders.
"""
from typing import List, Dict, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.schedule import ScheduledExam
from app.models.invigilator import InvigilatorAssignment, InvigilatorStatus


class Notification:
    """Represents a notification."""
    
    def __init__(
        self,
        recipient: User,
        subject: str,
        message: str,
        notification_type: str,
        priority: str = "NORMAL"
    ):
        """
        Initialize notification.
        
        Args:
            recipient: User to notify
            subject: Notification subject
            message: Notification message
            notification_type: Type (ASSIGNMENT, REMINDER, CHANGE, etc.)
            priority: Priority level (LOW, NORMAL, HIGH)
        """
        self.recipient = recipient
        self.subject = subject
        self.message = message
        self.notification_type = notification_type
        self.priority = priority
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<Notification(to={self.recipient.email}, type={self.notification_type})>"


class NotificationService:
    """
    Manages notifications for exam management.
    
    Notification types:
    - ASSIGNMENT: New invigilator duty assigned
    - CONFIRMATION: Request to confirm availability
    - REMINDER: Upcoming duty reminder
    - CHANGE: Schedule or assignment change
    - CANCELLATION: Duty cancelled
    - REPLACEMENT: Replacement assigned
    """
    
    def __init__(self, db: Session):
        """
        Initialize notification service.
        
        Args:
            db: Database session
        """
        self.db = db
        self.notifications: List[Notification] = []
    
    def notify_assignment(
        self,
        assignment: InvigilatorAssignment
    ) -> Notification:
        """
        Notify faculty of new assignment.
        
        Args:
            assignment: Invigilator assignment
            
        Returns:
            Created notification
        """
        faculty = assignment.faculty
        exam = assignment.scheduled_exam
        
        subject = f"Invigilation Duty Assigned: {exam.course.course_code}"
        
        message = f"""
Dear {faculty.full_name},

You have been assigned as {assignment.role.value} invigilator for:

Course: {exam.course.course_code} - {exam.course.course_name}
Date: {exam.exam_date.strftime('%d %B %Y')}
Session: {exam.session.value}
Time: {exam.start_time.strftime('%H:%M')} - {exam.end_time.strftime('%H:%M')}
Room: {exam.room.room_code if exam.room else 'TBA'}
Students: {exam.num_students}

Please confirm your availability by logging into the ExamGuard system.

If you have any conflicts or concerns, please contact the Exam Cell immediately.

Thank you for your cooperation.

Best regards,
Exam Cell
KLE Technological University
"""
        
        notification = Notification(
            recipient=faculty,
            subject=subject,
            message=message,
            notification_type="ASSIGNMENT",
            priority="HIGH"
        )
        
        self.notifications.append(notification)
        return notification
    
    def notify_confirmation_request(
        self,
        assignment: InvigilatorAssignment
    ) -> Notification:
        """
        Request confirmation from faculty.
        
        Args:
            assignment: Invigilator assignment
            
        Returns:
            Created notification
        """
        faculty = assignment.faculty
        exam = assignment.scheduled_exam
        
        subject = f"Confirmation Required: Invigilation Duty on {exam.exam_date.strftime('%d %b')}"
        
        message = f"""
Dear {faculty.full_name},

Please confirm your availability for invigilation duty:

Course: {exam.course.course_code}
Date: {exam.exam_date.strftime('%d %B %Y')}
Session: {exam.session.value}
Room: {exam.room.room_code if exam.room else 'TBA'}

ACTION REQUIRED: Please log in to ExamGuard and confirm or decline this assignment.

Deadline for confirmation: {(exam.exam_date - timedelta(days=7)).strftime('%d %B %Y')}

Best regards,
Exam Cell
"""
        
        notification = Notification(
            recipient=faculty,
            subject=subject,
            message=message,
            notification_type="CONFIRMATION",
            priority="HIGH"
        )
        
        self.notifications.append(notification)
        return notification
    
    def notify_reminder(
        self,
        assignment: InvigilatorAssignment,
        days_before: int = 1
    ) -> Notification:
        """
        Send reminder before exam.
        
        Args:
            assignment: Invigilator assignment
            days_before: Days before exam to send reminder
            
        Returns:
            Created notification
        """
        faculty = assignment.faculty
        exam = assignment.scheduled_exam
        
        subject = f"Reminder: Invigilation Duty Tomorrow" if days_before == 1 else f"Reminder: Invigilation Duty in {days_before} days"
        
        message = f"""
Dear {faculty.full_name},

This is a reminder of your upcoming invigilation duty:

Course: {exam.course.course_code} - {exam.course.course_name}
Date: {exam.exam_date.strftime('%d %B %Y')}
Session: {exam.session.value}
Time: {exam.start_time.strftime('%H:%M')} - {exam.end_time.strftime('%H:%M')}
Room: {exam.room.room_code if exam.room else 'TBA'}
Role: {assignment.role.value}

Please arrive 15 minutes before the scheduled start time.

Thank you.

Best regards,
Exam Cell
"""
        
        notification = Notification(
            recipient=faculty,
            subject=subject,
            message=message,
            notification_type="REMINDER",
            priority="NORMAL"
        )
        
        self.notifications.append(notification)
        return notification
    
    def notify_change(
        self,
        assignment: InvigilatorAssignment,
        change_details: str
    ) -> Notification:
        """
        Notify faculty of schedule change.
        
        Args:
            assignment: Invigilator assignment
            change_details: Description of changes
            
        Returns:
            Created notification
        """
        faculty = assignment.faculty
        exam = assignment.scheduled_exam
        
        subject = f"Schedule Change: {exam.course.course_code} Invigilation"
        
        message = f"""
Dear {faculty.full_name},

There has been a change to your invigilation duty:

Course: {exam.course.course_code}
Original Schedule: [Details in system]

CHANGE: {change_details}

New Schedule:
Date: {exam.exam_date.strftime('%d %B %Y')}
Session: {exam.session.value}
Time: {exam.start_time.strftime('%H:%M')} - {exam.end_time.strftime('%H:%M')}
Room: {exam.room.room_code if exam.room else 'TBA'}

Please acknowledge this change in the ExamGuard system.

If you have any concerns, please contact the Exam Cell immediately.

Best regards,
Exam Cell
"""
        
        notification = Notification(
            recipient=faculty,
            subject=subject,
            message=message,
            notification_type="CHANGE",
            priority="HIGH"
        )
        
        self.notifications.append(notification)
        return notification
    
    def notify_replacement(
        self,
        original_faculty: User,
        replacement_faculty: User,
        exam: ScheduledExam,
        reason: str
    ) -> List[Notification]:
        """
        Notify both faculty about replacement.
        
        Args:
            original_faculty: Original faculty being replaced
            replacement_faculty: New faculty taking over
            exam: Scheduled exam
            reason: Reason for replacement
            
        Returns:
            List of notifications sent
        """
        notifications = []
        
        # Notify original faculty
        subject1 = f"Invigilation Duty Reassigned: {exam.course.course_code}"
        message1 = f"""
Dear {original_faculty.full_name},

Your invigilation duty for the following exam has been reassigned:

Course: {exam.course.course_code}
Date: {exam.exam_date.strftime('%d %B %Y')}
Session: {exam.session.value}

Reason: {reason}

Replacement: {replacement_faculty.full_name}

Thank you for your understanding.

Best regards,
Exam Cell
"""
        
        notification1 = Notification(
            recipient=original_faculty,
            subject=subject1,
            message=message1,
            notification_type="REPLACEMENT",
            priority="HIGH"
        )
        notifications.append(notification1)
        
        # Notify replacement faculty
        subject2 = f"Replacement Duty Assigned: {exam.course.course_code}"
        message2 = f"""
Dear {replacement_faculty.full_name},

You have been assigned as a replacement invigilator for:

Course: {exam.course.course_code}
Date: {exam.exam_date.strftime('%d %B %Y')}
Session: {exam.session.value}
Time: {exam.start_time.strftime('%H:%M')} - {exam.end_time.strftime('%H:%M')}
Room: {exam.room.room_code if exam.room else 'TBA'}

Original Faculty: {original_faculty.full_name}
Reason for Replacement: {reason}

Please confirm your availability immediately.

Thank you for your cooperation.

Best regards,
Exam Cell
"""
        
        notification2 = Notification(
            recipient=replacement_faculty,
            subject=subject2,
            message=message2,
            notification_type="REPLACEMENT",
            priority="HIGH"
        )
        notifications.append(notification2)
        
        self.notifications.extend(notifications)
        return notifications
    
    def send_all_notifications(self) -> Dict:
        """
        Send all queued notifications.
        
        In a real system, this would integrate with email service,
        SMS gateway, or push notification service.
        
        Returns:
            Dictionary with send statistics
        """
        # TODO: Integrate with actual email/SMS service
        # For now, just log the notifications
        
        sent_count = len(self.notifications)
        
        for notification in self.notifications:
            # Simulate sending
            print(f"[NOTIFICATION] To: {notification.recipient.email}")
            print(f"Subject: {notification.subject}")
            print(f"Type: {notification.notification_type}")
            print(f"Priority: {notification.priority}")
            print("-" * 50)
        
        # Clear queue
        self.notifications.clear()
        
        return {
            "sent": sent_count,
            "failed": 0,
            "status": "success"
        }
    
    def get_pending_confirmations(
        self,
        days_threshold: int = 7
    ) -> List[InvigilatorAssignment]:
        """
        Get assignments pending confirmation.
        
        Args:
            days_threshold: Days until exam to check
            
        Returns:
            List of unconfirmed assignments
        """
        from datetime import date
        threshold_date = date.today() + timedelta(days=days_threshold)
        
        pending = self.db.query(InvigilatorAssignment).join(
            ScheduledExam
        ).filter(
            InvigilatorAssignment.status == InvigilatorStatus.ASSIGNED,
            InvigilatorAssignment.is_available.is_(None),  # Not responded
            ScheduledExam.exam_date <= threshold_date
        ).all()
        
        return pending
