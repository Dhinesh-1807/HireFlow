from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.candidate import CandidateResponse


class SearchQueryRequest(BaseModel):
    query: str = Field(..., description="Natural language search query e.g. 'Senior Python engineer with AWS and 5+ years experience'")
    job_id: Optional[int] = Field(None, description="Optional job ID to rank candidates specifically against")
    min_experience_years: Optional[float] = None
    limit: int = Field(default=10, ge=1, le=50)


class SearchCandidateResult(BaseModel):
    candidate: CandidateResponse
    relevance_score: float = Field(..., description="Score between 0 and 100")
    matching_highlights: List[str] = Field(default=[], description="Reasons or matching skills")
    matched_skills: List[str] = []
    explanation: Optional[str] = None


class SearchQueryResponse(BaseModel):
    query: str
    parsed_intent: Optional[dict] = None
    total_results: int
    results: List[SearchCandidateResult]
