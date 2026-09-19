import json
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.candidate import Candidate, Resume
from app.models.job import JobDescription, JobRequirement
from app.models.evaluation import CandidateJobMatch, RequirementEvidence
from app.schemas.matching import (
    MatchRequest,
    CandidateJobMatchResponse,
    RequirementEvidenceResponse,
)
from app.services.matching_service import matching_service

router = APIRouter(tags=["Matching & Grounded Evidence"])


def _serialize_match(match: CandidateJobMatch) -> CandidateJobMatchResponse:
    evidence_list = []
    for ev in match.evidence_items:
        evidence_list.append(
            RequirementEvidenceResponse(
                id=ev.id,
                requirement_id=ev.requirement_id,
                requirement_text=ev.requirement.requirement_text if ev.requirement else None,
                category=ev.requirement.category if ev.requirement else None,
                status=ev.status,
                score=ev.score,
                evidence_quote=ev.evidence_quote,
                source_page=ev.source_page,
                reasoning=ev.reasoning,
            )
        )

    return CandidateJobMatchResponse(
        id=match.id,
        candidate_id=match.candidate_id,
        candidate_name=match.candidate.full_name if match.candidate else None,
        job_id=match.job_id,
        job_title=match.job.title if match.job else None,
        overall_match_score=match.overall_match_score,
        skills_match_score=match.skills_match_score,
        experience_match_score=match.experience_match_score,
        status=match.status,
        summary_analysis=match.summary_analysis,
        strengths=match.strengths,
        gaps=match.gaps,
        created_at=match.created_at,
        evidence_items=evidence_list,
    )


@router.post("/match", response_model=CandidateJobMatchResponse, summary="Match candidate to job requirement with evidence tracking")
def match_candidate(match_req: MatchRequest, db: Session = Depends(get_db)):
    """
    Candidate-to-Job Requirement Mapping & Evidence Tracking:
    1. Evaluates candidate against every job requirement.
    2. Extracts verbatim evidence quotes from the resume.
    3. Cites the exact page number where evidence was found.
    4. Computes overall, skill, and experience scores.
    """
    candidate = db.query(Candidate).filter(Candidate.id == match_req.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = db.query(JobDescription).filter(JobDescription.id == match_req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    # Check for existing match unless force_recalculate is requested
    existing_match = (
        db.query(CandidateJobMatch)
        .filter(
            CandidateJobMatch.candidate_id == match_req.candidate_id,
            CandidateJobMatch.job_id == match_req.job_id,
        )
        .first()
    )

    if existing_match and not match_req.force_recalculate:
        return _serialize_match(existing_match)

    # If recalculating, remove old match
    if existing_match and match_req.force_recalculate:
        db.delete(existing_match)
        db.commit()

    # Prepare data for AI matching
    candidate_dict = {
        "full_name": candidate.full_name,
        "current_title": candidate.current_title,
        "total_experience_years": candidate.total_experience_years,
        "skills": [{"name": s.name, "category": s.category, "proficiency": s.proficiency} for s in candidate.skills],
        "experiences": [
            {
                "job_title": e.job_title,
                "company": e.company,
                "technologies": e.technologies_used,
                "description": e.description,
            }
            for e in candidate.experiences
        ],
        "educations": [{"degree": ed.degree, "institution": ed.institution} for ed in candidate.educations],
    }

    job_dict = {
        "title": job.title,
        "min_years_experience": job.min_years_experience,
        "summary": job.summary,
        "requirements": [
            {
                "id": req.id,
                "requirement_text": req.requirement_text,
                "category": req.category,
                "weight": req.weight,
                "min_experience_years": req.min_experience_years,
            }
            for req in job.requirements
        ],
    }

    # Retrieve resume pages for citation
    resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).order_by(Resume.created_at.desc()).first()
    resume_pages = json.loads(resume.pages_data) if (resume and resume.pages_data) else []

    # Run matching service
    result = matching_service.match_candidate_to_job(candidate_dict, job_dict, resume_pages)

    # Persist CandidateJobMatch
    new_match = CandidateJobMatch(
        candidate_id=candidate.id,
        job_id=job.id,
        overall_match_score=result.get("overall_match_score", 0.0),
        skills_match_score=result.get("skills_match_score", 0.0),
        experience_match_score=result.get("experience_match_score", 0.0),
        status=result.get("status", "reviewed"),
        summary_analysis=result.get("summary_analysis"),
        strengths=result.get("strengths"),
        gaps=result.get("gaps"),
    )
    db.add(new_match)
    db.flush()

    # Persist RequirementEvidence items
    for ev in result.get("requirement_evaluations", []):
        req_id = ev.get("requirement_id")
        # Ensure requirement_id belongs to this job
        valid_req = db.query(JobRequirement).filter(JobRequirement.id == req_id, JobRequirement.job_id == job.id).first()
        if not valid_req:
            # Fallback to matching by text or first available req
            valid_req = next((r for r in job.requirements if r.requirement_text.lower() in ev.get("requirement_text", "").lower()), None)
            if not valid_req and job.requirements:
                valid_req = job.requirements[0]

        if valid_req:
            evidence = RequirementEvidence(
                match_id=new_match.id,
                requirement_id=valid_req.id,
                status=ev.get("status", "unmet"),
                score=ev.get("score", 0.0),
                evidence_quote=ev.get("evidence_quote"),
                source_page=ev.get("source_page", 1),
                reasoning=ev.get("reasoning"),
            )
            db.add(evidence)

    db.commit()
    db.refresh(new_match)

    return _serialize_match(new_match)


@router.get("/match/{candidate_id}/{job_id}", response_model=CandidateJobMatchResponse, summary="Get match result by candidate and job ID")
def get_match(candidate_id: int, job_id: int, db: Session = Depends(get_db)):
    """Retrieve existing match analysis and evidence items."""
    match = (
        db.query(CandidateJobMatch)
        .filter(
            CandidateJobMatch.candidate_id == candidate_id,
            CandidateJobMatch.job_id == job_id,
        )
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="Match not found. Please run POST /match first.")
    return _serialize_match(match)


@router.get("/matches/job/{job_id}", response_model=List[CandidateJobMatchResponse], summary="Get ranked candidates for a specific job")
def get_job_candidates(job_id: int, db: Session = Depends(get_db)):
    """Retrieve all candidates evaluated for a job, ranked descending by match score."""
    matches = (
        db.query(CandidateJobMatch)
        .filter(CandidateJobMatch.job_id == job_id)
        .order_by(CandidateJobMatch.overall_match_score.desc())
        .all()
    )
    return [_serialize_match(m) for m in matches]
