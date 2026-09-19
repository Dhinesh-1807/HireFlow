from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class SkillBase(BaseModel):
    name: str
    category: Optional[str] = "Technical"
    years_of_experience: Optional[float] = None
    proficiency: Optional[str] = "Intermediate"
    source_snippet: Optional[str] = None
    source_page: Optional[int] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    candidate_id: int

    model_config = ConfigDict(from_attributes=True)


class ExperienceBase(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[int] = 0
    description: Optional[str] = None
    technologies_used: Optional[str] = None
    source_snippet: Optional[str] = None
    source_page: Optional[int] = None


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceResponse(ExperienceBase):
    id: int
    candidate_id: int

    model_config = ConfigDict(from_attributes=True)


class EducationBase(BaseModel):
    degree: Optional[str] = None
    institution: str
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None


class EducationCreate(EducationBase):
    pass


class EducationResponse(EducationBase):
    id: int
    candidate_id: int

    model_config = ConfigDict(from_attributes=True)


class ResumePage(BaseModel):
    page_number: int
    text: str


class ResumeResponse(BaseModel):
    id: int
    candidate_id: int
    file_name: str
    file_path: str
    file_size_bytes: Optional[int]
    page_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None
    total_experience_years: Optional[float] = 0.0
    current_title: Optional[str] = None
    current_company: Optional[str] = None


class CandidateCreate(CandidateBase):
    pass


class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    skills: List[SkillResponse] = []
    experiences: List[ExperienceResponse] = []
    educations: List[EducationResponse] = []
    resumes: List[ResumeResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CandidateSummaryResponse(BaseModel):
    candidate_id: int
    full_name: str
    current_title: Optional[str]
    total_experience_years: Optional[float]
    summary: str
    key_strengths: List[str] = []
    top_skills: List[str] = []
