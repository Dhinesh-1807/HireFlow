import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class CandidateJobMatch(Base):
    __tablename__ = "candidate_job_matches"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)

    # Match scores
    overall_match_score = Column(Float, nullable=False, default=0.0)  # 0 to 100
    skills_match_score = Column(Float, nullable=True, default=0.0)    # 0 to 100
    experience_match_score = Column(Float, nullable=True, default=0.0)# 0 to 100
    
    status = Column(String(50), default="reviewed")  # e.g., "strong_fit", "moderate_fit", "unlikely_fit"
    summary_analysis = Column(Text, nullable=True)   # AI narrative justifying match
    strengths = Column(Text, nullable=True)          # JSON or bulleted strengths
    gaps = Column(Text, nullable=True)               # Missing qualifications / gap analysis

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="matches")
    job = relationship("JobDescription", back_populates="matches")
    evidence_items = relationship("RequirementEvidence", back_populates="match", cascade="all, delete-orphan")


class RequirementEvidence(Base):
    __tablename__ = "requirement_evidence"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("candidate_job_matches.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("job_requirements.id"), nullable=False)

    status = Column(String(50), nullable=False, default="unmet")  # "fully_met", "partially_met", "unmet"
    score = Column(Float, default=0.0)  # 0 to 100 individual requirement score

    # Grounded evidence extracted directly from resume
    evidence_quote = Column(Text, nullable=True)
    source_page = Column(Integer, nullable=True)
    reasoning = Column(Text, nullable=True)

    match = relationship("CandidateJobMatch", back_populates="evidence_items")
    requirement = relationship("JobRequirement", back_populates="evidence_items")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    round_name = Column(String(100), default="Technical Screening")
    scheduled_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="created")  # "created", "in_progress", "completed"

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interview_sessions")
    job = relationship("JobDescription", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")
    notes = relationship("InterviewNote", back_populates="session", cascade="all, delete-orphan")
    evaluations = relationship("InterviewEvaluation", back_populates="session", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), default="Technical")  # "Technical", "Behavioral", "System Design", "Gap Probe"
    target_skill_or_gap = Column(String(255), nullable=True)
    expected_answer_guidelines = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Medium")  # "Easy", "Medium", "Hard"
    order_index = Column(Integer, default=0)

    session = relationship("InterviewSession", back_populates="questions")


class InterviewNote(Base):
    __tablename__ = "interview_notes"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    interviewer_name = Column(String(100), default="Interviewer")
    raw_notes = Column(Text, nullable=False)
    key_observations = Column(Text, nullable=True)  # AI-extracted key points
    sentiment = Column(String(50), nullable=True)    # "Positive", "Neutral", "Concern"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("InterviewSession", back_populates="notes")


class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    overall_rating = Column(Float, nullable=False, default=0.0)  # 1.0 to 5.0 scale
    recommendation = Column(String(50), default="Consider")      # "Strong Hire", "Hire", "Consider", "No Hire"
    technical_competency = Column(Float, nullable=True)
    communication_rating = Column(Float, nullable=True)
    problem_solving_rating = Column(Float, nullable=True)

    strengths = Column(Text, nullable=True)   # JSON array of strengths
    areas_for_improvement = Column(Text, nullable=True) # JSON array of flags/gaps
    executive_summary = Column(Text, nullable=True)     # Synthesized executive report

    # Report Email Delivery Tracking (Section 14)
    report_sent = Column(Integer, default=0)
    report_sent_at = Column(DateTime, nullable=True)
    report_recipient = Column(String(255), nullable=True)
    report_send_status = Column(String(50), default="NOT_SENT")  # NOT_SENT, SENDING, SENT, FAILED

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("InterviewSession", back_populates="evaluations")
