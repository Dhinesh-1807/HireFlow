from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class RequirementEvidenceResponse(BaseModel):
    id: int
    requirement_id: int
    requirement_text: Optional[str] = None
    category: Optional[str] = None
    status: str  # "fully_met", "partially_met", "unmet"
    score: float
    evidence_quote: Optional[str] = None
    source_page: Optional[int] = None
    reasoning: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CandidateJobMatchResponse(BaseModel):
    id: int
    candidate_id: int
    candidate_name: Optional[str] = None
    job_id: int
    job_title: Optional[str] = None
    overall_match_score: float
    skills_match_score: Optional[float] = 0.0
    experience_match_score: Optional[float] = 0.0
    status: str
    summary_analysis: Optional[str] = None
    strengths: Optional[str] = None
    gaps: Optional[str] = None
    created_at: datetime
    evidence_items: List[RequirementEvidenceResponse] = []

    model_config = ConfigDict(from_attributes=True)


class MatchRequest(BaseModel):
    candidate_id: int
    job_id: int
    force_recalculate: bool = False
