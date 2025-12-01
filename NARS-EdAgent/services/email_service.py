"""
Заглушка для email сервиса.
В продакшене заменить на реальную интеграцию с SendGrid/Mailgun/SMTP.
"""
import os
from typing import Dict

def send_email(to_email: str, company_name: str) -> Dict:
    """
    Отправка первоначального письма компании
    """
    print(f"📤 [EMAIL] Отправка письма для {company_name} на {to_email}")

    return {
        "status": "sent",
        "message_id": "simulated_123",
        "to": to_email
    }

def send_followup_email(to_email: str, company_name: str, days_after: int = 7) -> Dict:
    """
    Отправка фоллоу-апа
    """
    print(f"📤 [FOLLOWUP] Отправка фоллоу-апа для {company_name} через {days_after} дней")
    return {
        "status": "sent",
        "message_id": f"followup_{company_name}",
        "to": to_email
    }

def check_email_status(email: str) -> Dict:
    """
    Проверка статуса email (доставлено/открыто)
    """
    return {
        "delivered": True,
        "opened": True,
        "opened_at": "2024-03-20T10:30:00"
    }