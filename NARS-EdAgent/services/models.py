from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ReplyLog(Base):
    __tablename__ = 'reply_logs'
    id = Column(Integer, primary_key=True)
    company = Column(String, nullable=False)
    reply_text = Column(Text, nullable=False)
    predicted_intent = Column(String, nullable=False)
    confidence = Column(String, nullable=False)
    human_involved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class OutreachLog(Base):
    __tablename__ = 'outreach_logs'
    id = Column(Integer, primary_key=True)
    company = Column(String, nullable=False)
    email = Column(String, nullable=False)
    status = Column(String, default="pending")
    email_sent_at = Column(DateTime)
    followup_scheduled = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class FollowupLog(Base):
    __tablename__ = 'followup_logs'
    id = Column(Integer, primary_key=True)
    company = Column(String, nullable=False)
    email = Column(String, nullable=False)
    days_after = Column(Integer, default=7)
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="sent")

class PartnerAgreement(Base):
    __tablename__ = "partner_agreements"
    id = Column(Integer, primary_key=True)
    company = Column(String, nullable=False, unique=True)
    project_description = Column(Text, nullable=False)
    contact_person = Column(String)
    contact_email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="confirmed")


class ProjectTask(Base):
    __tablename__ = "project_tasks"
    id = Column(Integer, primary_key=True)
    company = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    expected_duration_weeks = Column(Integer, default=8)
    created_at = Column(DateTime, default=datetime.utcnow)
    agreement_id = Column(Integer, nullable=False)


class ProjectRole(Base):
    __tablename__ = "project_roles"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, nullable=False)
    role_name = Column(String, nullable=False)
    required_skills = Column(Text)
    workload_hours = Column(Integer, default=80)


class ProjectCompetency(Base):
    __tablename__ = "project_competencies"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, nullable=False)
    competency_code = Column(String, nullable=False)
    competency_name = Column(String, nullable=False)