import imaplib
import email
from email.header import decode_header
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os
from typing import List, Tuple, Dict

logger = logging.getLogger(__name__)

class IMAPClient:
    def __init__(self):
        self.host = os.getenv("IMAP_HOST")
        self.user = os.getenv("IMAP_USER")
        self.password = os.getenv("IMAP_PASS")
        self.mail = None

    def connect(self):
        if not all([self.host, self.user, self.password]):
            raise ValueError("❌ IMAP: Не заданы IMAP_HOST, IMAP_USER или IMAP_PASS в .env")
        try:
            self.mail = imaplib.IMAP4_SSL(self.host)
            self.mail.login(self.user, self.password)
            self.mail.select("inbox")
            logger.info(f"✅ IMAP: подключено к {self.user}")
        except Exception as e:
            logger.error(f"❌ IMAP: ошибка подключения: {e}")
            raise

    def fetch_unread(self) -> List[Tuple[str, str, str]]:
        if not self.mail:
            self.connect()

        try:
            status, messages = self.mail.search(None, 'UNSEEN')
            if status != "OK" or not messages[0]:
                return []

            uids = messages[0].split()
            results = []

            for uid in uids:
                status, data = self.mail.fetch(uid, "(RFC822)")
                if status != "OK":
                    continue

                msg = email.message_from_bytes(data[0][1])
                sender = self._decode_header(msg.get("From", ""))
                subject = self._decode_header(msg.get("Subject", ""))

                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            payload = part.get_payload(decode=True)
                            if payload:
                                body = payload.decode("utf-8", errors="ignore")
                            break
                else:
                    payload = msg.get_payload(decode=True)
                    if payload:
                        body = payload.decode("utf-8", errors="ignore")

                # Помечаем как прочитанное
                self.mail.store(uid, '+FLAGS', '\\Seen')
                results.append((sender, subject, body.strip()))

            return results
        except Exception as e:
            logger.error(f"❌ IMAP: ошибка чтения писем: {e}")
            return []

    @staticmethod
    def _decode_header(header: str) -> str:
        try:
            decoded_parts = decode_header(header)
            decoded_str = "".join(
                part[0].decode(part[1] or "utf-8") if isinstance(part[0], bytes) else str(part[0])
                for part in decoded_parts
            )
            return decoded_str.strip()
        except Exception as e:
            logger.warning(f"⚠️ Ошибка декодирования заголовка '{header}': {e}")
            return header.strip()


class SMTPClient:
    def __init__(self):
        self.host = os.getenv("SMTP_HOST")
        self.port = int(os.getenv("SMTP_PORT", "587"))
        self.user = os.getenv("SMTP_USER")
        self.password = os.getenv("SMTP_PASS")

        if not all([self.host, self.user, self.password]):
            raise ValueError("❌ SMTP: Не заданы SMTP_HOST, SMTP_USER или SMTP_PASS в .env")

    def send(self, to_email: str, subject: str, body: str, html: bool = False) -> Dict:
        msg = MIMEMultipart("alternative")
        msg["From"] = self.user
        msg["To"] = to_email
        msg["Subject"] = subject

        part = MIMEText(body, "html" if html else "plain", "utf-8")
        msg.attach(part)

        try:
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.user, to_email, msg.as_string())
            logger.info(f"✅ Email → {to_email}: {subject[:40]}...")
            return {"status": "sent", "message_id": "generated"}
        except Exception as e:
            logger.error(f"❌ SMTP ошибка при отправке в {to_email}: {e}")
            return {"status": "error", "message": str(e)}


# === Публичные функции API ===

def send_email(to_email: str, company_name: str) -> Dict:
    """Отправка первоначального письма компании"""
    smtp = SMTPClient()
    subject = f"Предложение о сотрудничестве от ПроКомпетенций"
    body = f"""
Здравствуйте!

Мы хотели бы предложить вашей компании участие в программе стажировок для студентов.

Подробности: https://prokompetencii.ru

С уважением,  
AI-агент ПроКомпетенций
    """.strip()
    return smtp.send(to_email, subject, body, html=True)


def send_followup_email(to_email: str, company_name: str, days_after: int = 7) -> Dict:
    """Отправка фоллоу-апа"""
    smtp = SMTPClient()
    subject = f"Напоминание: Предложение о сотрудничестве"
    body = f"""
Добрый день!

Напоминаем, что мы предлагаем вашей компании участие в программе стажировок.

Если интересно — дайте знать, назначим встречу.

С уважением,  
AI-агент ПроКомпетенций
    """.strip()
    return smtp.send(to_email, subject, body, html=True)


def check_email_status(email: str) -> Dict:
    """
    Заглушка для совместимости.
    В продакшене: интеграция с SendGrid/Mailgun API.
    """
    return {
        "delivered": True,
        "opened": False,
        "opened_at": None
    }


def get_new_replies() -> List[Dict]:
    """Возвращает список новых писем в формате, понятном для main.py"""
    try:
        imap = IMAPClient()
        emails = imap.fetch_unread()
        results = []
        for sender, subject, body in emails:
            company = extract_company_from_sender(sender)
            results.append({
                "company": company,
                "reply_text": body,
                "raw_sender": sender,
                "raw_subject": subject
            })
        return results
    except Exception as e:
        logger.error(f"❌ Ошибка при получении новых писем: {e}")
        return []


def extract_company_from_sender(sender: str) -> str:
    """Извлекает название компании из поля 'From'"""
    try:
        if "@" in sender:
            domain = sender.split("@")[-1].split(">")[0].strip().lower()
            domain = domain.split(".")[0]
            return domain.capitalize() or "Неизвестная компания"
    except Exception as e:
        logger.warning(f"⚠️ Не удалось извлечь компанию из '{sender}': {e}")
    return "Неизвестная компания"