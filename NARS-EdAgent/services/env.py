import os
from dotenv import load_dotenv

load_dotenv()

# База данных
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/phase4.db")

# Почта: отправка (SMTP)
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

# Почта: получение (IMAP)
IMAP_HOST = os.getenv("IMAP_HOST")
IMAP_USER = os.getenv("IMAP_USER")
IMAP_PASS = os.getenv("IMAP_PASS")

# Telegram для эскалаций
TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
TG_HUMAN_CHAT_ID = os.getenv("TG_HUMAN_CHAT_ID")

# Email и флаги
EMAIL_FOR_ESCALATION = os.getenv("EMAIL_FOR_ESCALATION")
ESCALATION_ENABLED = os.getenv("ESCALATION_ENABLED", "true").lower() == "true"

# Режим (опционально — можно использовать)
SIMULATION_MODE = os.getenv("SIMULATION_MODE", "false").lower() == "true"