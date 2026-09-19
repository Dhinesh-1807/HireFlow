from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class JobRequirementBase(BaseModel):
    requirement_text: str
    category: str = "must-have"  # "must-have", "nice-to-have", "soft-skill", "qualification"
    weight: float = 1.0
    min_experience_years: Optional[float] = None


class JobRequirementCreate(JobRequirementBase):
    pass


class JobRequirementResponse(JobRequirementBase):
    id: int
    job_id: int

    model_config = ConfigDict(from_attributes=True)


class JobDescriptionBase(BaseModel):
    title: str
    company: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    raw_text: str
    summary: Optional[str] = None
    min_years_experience: Optional[float] = 0.0


class JobDescriptionCreate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    raw_text: str = Field(..., description="Full text of the Job Description")


class JobDescriptionResponse(JobDescriptionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    requirements: List[JobRequirementResponse] = []

    model_config = ConfigDict(from_attributes=True)
