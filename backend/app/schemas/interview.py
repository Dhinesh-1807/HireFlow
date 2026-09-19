from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class QuestionBase(BaseModel):
    question_text: str
    category: str = "Technical"  # "Technical", "Behavioral", "System Design", "Gap Probe"
    target_skill_or_gap: Optional[str] = None
    expected_answer_guidelines: Optional[str] = None
    difficulty: str = "Medium"
    order_index: int = 0


class QuestionResponse(QuestionBase):
    id: int
    session_id: int

    model_config = ConfigDict(from_attributes=True)


class GenerateQuestionsRequest(BaseModel):
    candidate_id: int
    job_id: int
    round_name: Optional[str] = "Technical Screening"
    focus_areas: Optional[List[str]] = Field(default=[], description="Optional specific areas to focus questions on")
    question_count: int = Field(default=5, ge=1, le=15)


class InterviewNoteCreate(BaseModel):
    interviewer_name: str = "Interviewer"
    raw_notes: str = Field(..., description="Raw interview notes taken during or after the interview")


class InterviewNoteResponse(BaseModel):
    id: int
    session_id: int
    interviewer_name: str
    raw_notes: str
    key_observations: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvaluationReportResponse(BaseModel):
    id: int
    session_id: int
    candidate_id: int
    candidate_name: Optional[str] = None
    job_id: int
    job_title: Optional[str] = None
    overall_rating: float  # 1.0 - 5.0
    recommendation: str    # "Strong Hire", "Hire", "Consider", "No Hire"
    technical_competency: Optional[float] = None
    communication_rating: Optional[float] = None
    problem_solving_rating: Optional[float] = None
    strengths: List[str] = []
    areas_for_improvement: List[str] = []
    executive_summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    round_name: str
    status: str
    created_at: datetime
    questions: List[QuestionResponse] = []
    notes: List[InterviewNoteResponse] = []

    model_config = ConfigDict(from_attributes=True)


class SendEvaluationReportRequest(BaseModel):
    email: Optional[str] = Field(None, description="Candidate recipient email address")
    custom_message: Optional[str] = Field(None, description="Optional custom recruiter message")
    subject: Optional[str] = Field(None, description="Optional email subject line")
    recruiter_decision: Optional[str] = Field(None, description="Recruiter decision to include in PDF")
    recruiter_notes: Optional[str] = Field(None, description="Recruiter notes to include in PDF")
    matrix_rows: Optional[List[dict]] = Field(None, description="Evidence matrix items for PDF report")


class SendEvaluationReportResponse(BaseModel):
    success: bool
    mode: str
    recipient: str
    sent_at: Optional[str] = None
    message: str
    report_sent: bool = True
    report_sent_at: Optional[datetime] = None
    report_recipient: Optional[str] = None


class EvaluationSendStatusResponse(BaseModel):
    evaluation_id: int
    report_sent: bool
    report_sent_at: Optional[datetime] = None
    report_recipient: Optional[str] = None
    report_send_status: str = "NOT_SENT"
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    smtp_configured: bool = False

