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