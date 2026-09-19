import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True)
    department = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    min_years_experience = Column(Float, nullable=True, default=0.0)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    requirements = relationship("JobRequirement", back_populates="job", cascade="all, delete-orphan")
    matches = relationship("CandidateJobMatch", back_populates="job", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="job", cascade="all, delete-orphan")


class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    requirement_text = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="must-have")  # "must-have", "nice-to-have", "soft-skill", "qualification"
    weight = Column(Float, default=1.0)  # Importance weighting (e.g. 1.0 = normal, 1.5 = critical)
    min_experience_years = Column(Float, nullable=True)

    job = relationship("JobDescription", back_populates="requirements")
    evidence_items = relationship("RequirementEvidence", back_populates="requirement", cascade="all, delete-orphan")
