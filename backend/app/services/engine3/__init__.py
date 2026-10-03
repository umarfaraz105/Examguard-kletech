"""
Engine 3: Exam Management Engine

Manages invigilator assignments, eligibility, workload fairness, and notifications.
"""
from app.services.engine3.invigilator_manager import InvigilatorManager, Engine3InvigilatorEngine
from app.services.engine3.workload_balancer import WorkloadBalancer
from app.services.engine3.eligibility_checker import EligibilityChecker
from app.services.engine3.notification_service import NotificationService

__all__ = [
    "InvigilatorManager",
    "WorkloadBalancer", 
    "EligibilityChecker",
    "NotificationService",
    "Engine3InvigilatorEngine"
]
