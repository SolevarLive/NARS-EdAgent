import os
import requests
import logging
from .email_service import SMTPClient

logger = logging.getLogger(__name__)

def notify_human(company: str, reply_text: str, intent: str = "INTEREST"):
    """
    Многоканальное уведомление при эскалации (только при INTEREST).
    Все параметры берутся из .env — никаких хардкодов.
    """
    escalation_enabled = os.getenv("ESCALATION_ENABLED", "true").lower() == "true"
    if not escalation_enabled:
        logger.warning(f"⚠️ Эскалация отключена в .env. Пропускаем {company}.")
        return False

    emoji = {
        "INTEREST": "✅",
        "FAQ_REQUEST": "❓",
        "OWN_INTERNSHIP": "🛠",
        "DECLINE": "❌"
    }.get(intent, "📄")

    message = (
        f"{emoji} *Ответ от компании*\n\n"
        f"**{company}**\n"
        f"_({intent})_\n\n"
        f"\"{reply_text[:150]}{'...' if len(reply_text) > 150 else ''}\"\n\n"
        f"📌 Действие: {'Срочно созвонитесь' if intent == 'INTEREST' else 'Ответьте шаблоном'}"
    )

    tg_token = os.getenv("TG_BOT_TOKEN")
    tg_chat_id = os.getenv("TG_HUMAN_CHAT_ID")

    if tg_token and tg_chat_id:
        try:

            url = f"https://api.telegram.org/bot{tg_token}/sendMessage"
            resp = requests.post(url, json={
                "chat_id": tg_chat_id,
                "text": message,
                "parse_mode": "Markdown",
                "disable_web_page_preview": True
            })
            if resp.status_code == 200:
                logger.info(f"✅ Telegram: уведомление отправлено для {company}")
            else:
                logger.error(f"❌ TG API error ({resp.status_code}): {resp.text}")
        except Exception as e:
            logger.error(f"❌ Ошибка Telegram: {e}")

    email_to = os.getenv("EMAIL_FOR_ESCALATION")
    if email_to:
        try:
            smtp = SMTPClient()
            subject = f"[ПроКомпетенции] Ответ от {company}: {intent}"
            body = f"""
Добрый день!

Компания **{company}** ответила:

> {reply_text}

**Рекомендуемое действие**:
- ✅ **INTEREST** → созвонитесь в течение 24 ч, предложите слоты (Zoom/офис).
- ❓ **FAQ_REQUEST** → пришлите презентацию и FAQ: https://prokompetentsii.ru/faq.pdf  
- 🛠 **OWN_INTERNSHIP** → предложите интеграцию в их трек.
- ❌ **DECLINE** → внести в CRM для анализа.

С уважением,  
AI-агент ПроКомпетенций (Фаза 4)
            """.strip()

            success = smtp.send(email_to, subject, body, html=True)
            if success:
                logger.info(f"✅ Email: уведомление отправлено для {company}")
        except Exception as e:
            logger.error(f"❌ Ошибка Email: {e}")

    return True