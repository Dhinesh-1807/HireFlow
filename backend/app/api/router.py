from fastapi import APIRouter
from app.api.v1.resumes import router as resumes_router
from app.api.v1.candidates import router as candidates_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.matching import router as matching_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.evaluations import router as evaluations_router
from app.api.v1.search import router as search_router

api_router = APIRouter()

# Health check at API root
@api_router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "HireFlow API",
        "version": "1.0.0"
    }

api_router.include_router(resumes_router)
api_router.include_router(candidates_router)
api_router.include_router(jobs_router)
api_router.include_router(matching_router)
api_router.include_router(interviews_router)
api_router.include_router(evaluations_router)
api_router.include_router(search_router)

