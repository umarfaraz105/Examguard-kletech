"""API router aggregation."""
from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .rules import router as rules_router
from .courses import router as courses_router
from .students import router as students_router
from .rooms import router as rooms_router
from .plans import router as plans_router
from .schedules import router as schedules_router
from .seating import router as seating_router
from .invigilators import router as invigilators_router
from .engines import router as engines_router
from .engines_v2 import router as engines_v2_router
from .course_registrations import router as course_registrations_router
from .data_extraction import router as data_extraction_router

api_router = APIRouter()

# Include all sub-routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(rules_router, prefix="/rules", tags=["rules"])
api_router.include_router(courses_router, prefix="/courses", tags=["courses"])
api_router.include_router(students_router, prefix="/students", tags=["students"])
api_router.include_router(rooms_router, prefix="/rooms", tags=["rooms"])
api_router.include_router(plans_router, prefix="/plans", tags=["plans"])
api_router.include_router(schedules_router, prefix="/schedules", tags=["schedules"])
api_router.include_router(seating_router, prefix="/seating", tags=["seating"])
api_router.include_router(invigilators_router, prefix="/invigilators", tags=["invigilators"])
api_router.include_router(engines_router, prefix="/engines", tags=["engines"])
api_router.include_router(engines_v2_router, prefix="/engines/v2", tags=["engines-v2"])
api_router.include_router(course_registrations_router, prefix="/course-registrations", tags=["course-registrations"])
api_router.include_router(data_extraction_router, prefix="/data-extraction", tags=["data-extraction"])
