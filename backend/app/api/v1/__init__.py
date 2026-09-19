from app.api.v1.resumes import router as resumes_router
from app.api.v1.candidates import router as candidates_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.matching import router as matching_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.search import router as search_router

__all__ = [
    "resumes_router",
    "candidates_router",
    "jobs_router",
    "matching_router",
    "interviews_router",
    "search_router",
]
