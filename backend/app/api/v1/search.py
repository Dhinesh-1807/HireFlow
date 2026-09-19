from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.search import SearchQueryRequest, SearchQueryResponse
from app.services.search_service import search_service

router = APIRouter(prefix="/search", tags=["Natural-Language Search"])


@router.post("/", response_model=SearchQueryResponse, summary="Natural language candidate search")
def search_candidates(payload: SearchQueryRequest, db: Session = Depends(get_db)):
    """
    Module 12: Natural-language candidate search.
    Understands plain English search queries (e.g. 'Senior Python developer with AWS and 4+ years'),
    extracts target criteria, computes relevance scores, and highlights matching credentials.
    """
    return search_service.search_candidates(
        db=db,
        query=payload.query,
        job_id=payload.job_id,
        min_experience_years=payload.min_experience_years,
        limit=payload.limit,
    )
