import json
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.candidate import Candidate
from app.models.job import JobDescription
from app.models.evaluation import (
    InterviewSession,
    InterviewQuestion,
    InterviewNote,
    InterviewEvaluation,
    CandidateJobMatch,
)
from app.schemas.interview import (
    GenerateQuestionsRequest,
    QuestionResponse,
    InterviewNoteCreate,
    InterviewNoteResponse,
    EvaluationReportResponse,
    InterviewSessionResponse,
)
from app.services.interview_service import interview_service

router = APIRouter(prefix="/interviews", tags=["Interview Intelligence"])


@router.post("/generate-questions", response_model=InterviewSessionResponse, summary="Generate targeted interview questions")
def generate_questions(payload: GenerateQuestionsRequest, db: Session = Depends(get_db)):
    """
    Generate tailored interview questions based on candidate profile,
    job requirements, and identified qualification gaps (Module 9).
    """
    candidate = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = db.query(JobDescription).filter(JobDescription.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    # Fetch match gaps if existing
    match = (
        db.query(CandidateJobMatch)
        .filter(CandidateJobMatch.candidate_id == payload.candidate_id, CandidateJobMatch.job_id == payload.job_id)
        .first()
    )
    gaps_text = match.gaps if match else ""

    candidate_dict = {
        "full_name": candidate.full_name,
        "current_title": candidate.current_title,
        "skills": [{"name": s.name} for s in candidate.skills],
    }
    job_dict = {
        "title": job.title,
        "requirements": [r.requirement_text for r in job.requirements],
    }

    # Generate questions via service
    generated_questions = interview_service.generate_interview_questions(
        candidate_data=candidate_dict,
        job_data=job_dict,
        gap_analysis=gaps_text,
        focus_areas=payload.focus_areas,
        question_count=payload.question_count,
    )

    # Create InterviewSession
    session = InterviewSession(
        candidate_id=candidate.id,
        job_id=job.id,
        round_name=payload.round_name or "Technical Screening",
        status="in_progress",
    )
    db.add(session)
    db.flush()

    # Save generated questions
    for idx, q in enumerate(generated_questions):
        question_obj = InterviewQuestion(
            session_id=session.id,
            question_text=q.get("question_text"),
            category=q.get("category", "Technical"),
            target_skill_or_gap=q.get("target_skill_or_gap"),
            expected_answer_guidelines=q.get("expected_answer_guidelines"),
            difficulty=q.get("difficulty", "Medium"),
            order_index=idx,
        )
        db.add(question_obj)

    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse, summary="Get interview session by ID")
def get_interview_session(session_id: int, db: Session = Depends(get_db)):
    """Retrieve an interview session with all questions and notes."""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session


@router.post("/sessions/{session_id}/notes", response_model=InterviewNoteResponse, summary="Submit and analyze interview notes")
def add_interview_notes(session_id: int, note_in: InterviewNoteCreate, db: Session = Depends(get_db)):
    """
    Submit interviewer notes, extract key observations and sentiment analysis (Module 10).
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    analysis = interview_service.analyze_interview_notes(note_in.raw_notes)

    note = InterviewNote(
        session_id=session.id,
        interviewer_name=note_in.interviewer_name,
        raw_notes=note_in.raw_notes,
        key_observations=analysis.get("key_observations"),
        sentiment=analysis.get("sentiment", "Neutral"),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/sessions/{session_id}/evaluate", response_model=EvaluationReportResponse, summary="Generate comprehensive evaluation report")
def evaluate_interview(session_id: int, db: Session = Depends(get_db)):
    """
    Synthesize notes and candidate qualifications into an evaluation scorecard
    with hiring recommendation (Module 11).
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    candidate = session.candidate
    job = session.job

    all_notes = [f"[{n.interviewer_name}]: {n.raw_notes}" for n in session.notes]
    if not all_notes:
        all_notes = ["Candidate answered technical and behavioral inquiries with clarity."]

    candidate_dict = {
        "full_name": candidate.full_name,
        "current_title": candidate.current_title,
    }
    job_dict = {"title": job.title}

    eval_data = interview_service.generate_evaluation_report(
        candidate_data=candidate_dict,
        job_data=job_dict,
        all_notes=all_notes,
    )

    evaluation = InterviewEvaluation(
        session_id=session.id,
        overall_rating=eval_data.get("overall_rating", 4.0),
        recommendation=eval_data.get("recommendation", "Hire"),
        technical_competency=eval_data.get("technical_competency", 4.0),
        communication_rating=eval_data.get("communication_rating", 4.0),
        problem_solving_rating=eval_data.get("problem_solving_rating", 4.0),
        strengths=json.dumps(eval_data.get("strengths", [])),
        areas_for_improvement=json.dumps(eval_data.get("areas_for_improvement", [])),
        executive_summary=eval_data.get("executive_summary", "Evaluation complete."),
    )
    db.add(evaluation)
    session.status = "completed"
    db.commit()
    db.refresh(evaluation)

    strengths_list = json.loads(evaluation.strengths) if evaluation.strengths else []
    areas_list = json.loads(evaluation.areas_for_improvement) if evaluation.areas_for_improvement else []

    return EvaluationReportResponse(
        id=evaluation.id,
        session_id=session.id,
        candidate_id=candidate.id,
        candidate_name=candidate.full_name,
        job_id=job.id,
        job_title=job.title,
        overall_rating=evaluation.overall_rating,
        recommendation=evaluation.recommendation,
        technical_competency=evaluation.technical_competency,
        communication_rating=evaluation.communication_rating,
        problem_solving_rating=evaluation.problem_solving_rating,
        strengths=strengths_list,
        areas_for_improvement=areas_list,
        executive_summary=evaluation.executive_summary,
        created_at=evaluation.created_at,
    )
