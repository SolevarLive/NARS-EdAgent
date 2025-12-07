from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ReplyIn(BaseModel):
    company: str
    reply_text: str

class ReplyOut(BaseModel):
    company: str
    reply_text: str
    predicted_intent: str
    confidence: float
    human_involved: bool

    class Config:
        from_attributes = True

class CompanyOutreach(BaseModel):
    company: str
    email: str
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None
    status: str = "pending"
    followup_scheduled: Optional[datetime] = None

class BulkResponse(BaseModel):
    responses: List[ReplyIn]

class DashboardStats(BaseModel):
    total_emails_sent: int
    total_responses: int
    response_rate: float
    interest_count: int
    decline_count: int
    faq_count: int
    other_count: int
    escalations: int
    recent_responses: int
    top_companies: List[str]

class AgreementIn(BaseModel):
    company: str
    project_description: str
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None

class AgreementOut(BaseModel):
    id: int
    company: str
    project_description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectTaskOut(BaseModel):
    id: int
    company: str
    title: str
    description: str
    expected_duration_weeks: int
    roles: List[dict]
    competencies: List[str]

    class Config:
        from_attributes = True