import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/phase4.db")

TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
TG_HUMAN_CHAT_ID = os.getenv("TG_HUMAN_CHAT_ID")
EMAIL_FOR_ESCALATION = os.getenv("EMAIL_FOR_ESCALATION")
ESCALATION_ENABLED = os.getenv("ESCALATION_ENABLED", "true").lower() == "true"