"""
Engine 1: Scheduling Engine

Assigns date + session to each course ensuring no student has exam clashes.
Uses conflict graph and Google OR-Tools CP-SAT solver for optimization.
"""
from app.services.engine1.scheduler import ExamScheduler, Engine1SchedulingEngine
from app.services.engine1.conflict_graph import ConflictGraph
from app.services.engine1.clash_detector import ClashDetector

__all__ = ["ExamScheduler", "Engine1SchedulingEngine", "ConflictGraph", "ClashDetector"]
