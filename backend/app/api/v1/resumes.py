import os
import json
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.candidate import Candidate, Resume, CandidateSkill, Experience, Education
from app.schemas.candidate import CandidateResponse
from app.services.pdf_service import pdf_service
from app.services.candidate_service import candidate_service

router = APIRouter(prefix="/resumes", tags=["Resumes & PDF Extraction"])


@router.post("/upload", response_model=CandidateResponse, summary="Upload resume PDF and extract candidate profile")
async def upload_resume(
    file: UploadFile = File(..., description="Resume PDF file"),
    db: Session = Depends(get_db),
):
    """
    1. Upload and validate resume PDF file.
    2. Extract clean text and page-by-page index via PyMuPDF.
    3. Extract candidate profile, skills, experience, education, and source citations via AI.
    4. Persist to database and return full candidate representation.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Generate unique filename to avoid collisions
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    saved_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    content = await file.read()
    file_size = len(content)
    with open(saved_path, "wb") as f:
        f.write(content)

    # 1. PyMuPDF text extraction
    try:
        pdf_data = pdf_service.extract_text_from_pdf(saved_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

    full_text = pdf_data["full_text"]
    pages_data = pdf_data["pages_data"]

    if not full_text.strip():
        raise HTTPException(
            status_code=422,
            detail="The uploaded PDF does not contain extractable text (it may be scanned/image-only)."
        )

    # 2. AI-driven Candidate Extraction
    candidate_profile = candidate_service.extract_candidate_data(full_text, pages_data)

    # 3. Create Candidate DB Record
    candidate = Candidate(
        full_name=candidate_profile.get("full_name") or "Candidate",
        email=candidate_profile.get("email"),
        phone=candidate_profile.get("phone"),
        location=candidate_profile.get("location"),
        linkedin_url=candidate_profile.get("linkedin_url"),
        github_url=candidate_profile.get("github_url"),
        portfolio_url=candidate_profile.get("portfolio_url"),
        summary=candidate_profile.get("summary"),
        total_experience_years=candidate_profile.get("total_experience_years", 0.0),
        current_title=candidate_profile.get("current_title"),
        current_company=candidate_profile.get("current_company"),
    )
    db.add(candidate)
    db.flush()  # assign candidate.id

    # 4. Save Resume Record
    resume = Resume(
        candidate_id=candidate.id,
        file_name=file.filename,
        file_path=saved_path,
        file_size_bytes=file_size,
        extracted_text=full_text,
        page_count=pdf_data["page_count"],
        pages_data=json.dumps(pages_data),
    )
    db.add(resume)

    # 5. Save Skills with source tracking
    for s in candidate_profile.get("skills", []):
        skill = CandidateSkill(
            candidate_id=candidate.id,
            name=s.get("name"),
            category=s.get("category", "Technical"),
            years_of_experience=s.get("years_of_experience"),
            proficiency=s.get("proficiency", "Intermediate"),
            source_snippet=s.get("source_snippet"),
            source_page=s.get("source_page", 1),
        )
        db.add(skill)

    # 6. Save Experiences
    for exp in candidate_profile.get("experiences", []):
        experience = Experience(
            candidate_id=candidate.id,
            job_title=exp.get("job_title", "Engineer"),
            company=exp.get("company", "Company"),
            location=exp.get("location"),
            start_date=exp.get("start_date"),
            end_date=exp.get("end_date"),
            is_current=exp.get("is_current", 0),
            description=exp.get("description"),
            technologies_used=exp.get("technologies_used"),
            source_snippet=exp.get("source_snippet"),
            source_page=exp.get("source_page", 1),
        )
        db.add(experience)

    # 7. Save Educations
    for edu in candidate_profile.get("educations", []):
        education = Education(
            candidate_id=candidate.id,
            degree=edu.get("degree"),
            institution=edu.get("institution", "University"),
            field_of_study=edu.get("field_of_study"),
            graduation_year=edu.get("graduation_year"),
            gpa=edu.get("gpa"),
        )
        db.add(education)

    db.commit()
    db.refresh(candidate)

    return candidate
