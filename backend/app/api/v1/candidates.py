from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateResponse, CandidateSummaryResponse
from app.services.candidate_service import candidate_service

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/", response_model=List[CandidateResponse], summary="List all candidates")
def get_candidates(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve all parsed candidates with their skills, experience, and education."""
    candidates = db.query(Candidate).offset(skip).limit(limit).all()
    return candidates


@router.get("/{candidate_id}", response_model=CandidateResponse, summary="Get candidate details by ID")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Retrieve full details of a specific candidate."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.get("/{candidate_id}/summary", response_model=CandidateSummaryResponse, summary="Generate executive summary for candidate")
def get_candidate_summary(candidate_id: int, db: Session = Depends(get_db)):
    """
    Generate or retrieve candidate executive summary, top skills, and key strengths (Module 8).
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate_dict = {
        "full_name": candidate.full_name,
        "current_title": candidate.current_title,
        "total_experience_years": candidate.total_experience_years,
        "skills": [{"name": s.name, "proficiency": s.proficiency} for s in candidate.skills],
        "experiences": [{"title": e.job_title, "company": e.company} for e in candidate.experiences],
    }

    ai_summary = candidate_service.generate_candidate_summary(candidate_dict)

    return CandidateSummaryResponse(
        candidate_id=candidate.id,
        full_name=candidate.full_name,
        current_title=candidate.current_title,
        total_experience_years=candidate.total_experience_years,
        summary=ai_summary.get("summary") or candidate.summary or "Summary not available",
        key_strengths=ai_summary.get("key_strengths", []),
        top_skills=ai_summary.get("top_skills", [s.name for s in candidate.skills[:5]]),
    )


@router.delete("/{candidate_id}", summary="Delete candidate")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Delete a candidate and all associated data."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
    return {"message": f"Candidate {candidate_id} successfully deleted"}
