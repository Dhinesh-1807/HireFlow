import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    
    # AI-generated candidate summary
    summary = Column(Text, nullable=True)
    total_experience_years = Column(Float, nullable=True, default=0.0)
    current_title = Column(String(255), nullable=True)
    current_company = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="candidate", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="candidate", cascade="all, delete-orphan")
    matches = relationship("CandidateJobMatch", back_populates="candidate", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="candidate", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    extracted_text = Column(Text, nullable=False)
    page_count = Column(Integer, default=1)
    
    # Store page-by-page JSON structure for grounded evidence citation
    pages_data = Column(Text, nullable=True)  # JSON string of [{page: int, text: str}]

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=True)  # e.g., "Technical", "Soft Skill", "Framework", "Cloud"
    years_of_experience = Column(Float, nullable=True)
    proficiency = Column(String(50), nullable=True)  # "Beginner", "Intermediate", "Expert"
    
    # Source / Evidence reference from resume
    source_snippet = Column(Text, nullable=True)
    source_page = Column(Integer, nullable=True)

    candidate = relationship("Candidate", back_populates="skills")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)  # "Present" or date
    is_current = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    technologies_used = Column(Text, nullable=True)  # comma separated or json list

    # Source / Evidence reference from resume
    source_snippet = Column(Text, nullable=True)
    source_page = Column(Integer, nullable=True)

    candidate = relationship("Candidate", back_populates="experiences")


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    degree = Column(String(255), nullable=True)
    institution = Column(String(255), nullable=False)
    field_of_study = Column(String(255), nullable=True)
    graduation_year = Column(String(50), nullable=True)
    gpa = Column(String(50), nullable=True)

    candidate = relationship("Candidate", back_populates="educations")
