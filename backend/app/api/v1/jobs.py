from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.job import JobDescription, JobRequirement
from app.schemas.job import JobDescriptionCreate, JobDescriptionResponse
from app.services.job_service import job_service

router = APIRouter(prefix="/jobs", tags=["Job Descriptions"])


@router.post("/", response_model=JobDescriptionResponse, summary="Process and create Job Description")
def create_job_description(job_in: JobDescriptionCreate, db: Session = Depends(get_db)):
    """
    Process raw job description text via AI:
    - Extracts title, department, company, experience requirements
    - Automatically categorizes distinct requirements (must-have, nice-to-have, soft-skill)
    - Persists structured job description and requirements to DB.
    """
    if not job_in.raw_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    # Process JD through AI service
    parsed_jd = job_service.process_job_description(job_in.raw_text, default_title=job_in.title)

    job = JobDescription(
        title=job_in.title or parsed_jd.get("title") or "Untitled Position",
        company=job_in.company or parsed_jd.get("company"),
        department=job_in.department or parsed_jd.get("department"),
        location=job_in.location or parsed_jd.get("location"),
        raw_text=job_in.raw_text,
        summary=parsed_jd.get("summary"),
        min_years_experience=parsed_jd.get("min_years_experience", 0.0),
    )
    db.add(job)
    db.flush()

    # Save granular requirements
    for req in parsed_jd.get("requirements", []):
        job_req = JobRequirement(
            job_id=job.id,
            requirement_text=req.get("requirement_text"),
            category=req.get("category", "must-have"),
            weight=req.get("weight", 1.0),
            min_experience_years=req.get("min_experience_years"),
        )
        db.add(job_req)

    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=List[JobDescriptionResponse], summary="List all job descriptions")
def get_jobs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve all stored job descriptions."""
    jobs = db.query(JobDescription).offset(skip).limit(limit).all()
    return jobs


@router.get("/{job_id}", response_model=JobDescriptionResponse, summary="Get job description by ID")
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Retrieve job details including all categorized requirements."""
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
    return job


@router.delete("/{job_id}", summary="Delete job description")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a job description and all its requirements and match records."""
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
    db.delete(job)
    db.commit()
    return {"message": f"Job {job_id} successfully deleted"}
