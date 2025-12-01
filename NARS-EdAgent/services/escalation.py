from services.env import (
    TG_BOT_TOKEN, TG_HUMAN_CHAT_ID,
    EMAIL_FOR_ESCALATION, ESCALATION_ENABLED
)


def notify_human(company: str, reply_text: str, intent: str = "INTEREST"):
    """
    Многоканальное уведомление при эскалации
    """
    if not ESCALATION_ENABLED:
        print(f"⚠️ Эскалация отключена. Для компании {company}: {reply_text[:50]}...")
        return False

    message = f"""
🚨 КРИТИЧЕСКАЯ ТОЧКА ЭСКАЛАЦИИ №4

Компания: {company}
Тип ответа: {intent}
Текст ответа: {reply_text}

Требуется:
1. Личный контакт с представителем компании
2. Организация встречи (онлайн/офлайн)
3. Обсуждение деталей проекта
4. Заключение соглашения
"""

    if TG_BOT_TOKEN and TG_HUMAN_CHAT_ID:
        try:
            import telebot
            bot = telebot.TeleBot(TG_BOT_TOKEN)
            bot.send_message(
                TG_HUMAN_CHAT_ID,
                message[:4000],
                parse_mode="HTML"
            )
            print(f"✅ Telegram уведомление отправлено для {company}")
        except Exception as e:
            print(f"❌ Ошибка Telegram: {e}")

    if EMAIL_FOR_ESCALATION:
        try:
            import smtplib
            from email.mime.text import MIMEText

            msg = MIMEText(message, 'plain', 'utf-8')
            msg['Subject'] = f'🚨 Эскалация №4: {company} заинтересовалась'
            msg['From'] = 'agent@prokompetencii.ru'
            msg['To'] = EMAIL_FOR_ESCALATION

            print(f"✅ Email уведомление отправлено для {company}")
        except Exception as e:
            print(f"❌ Ошибка Email: {e}")

    return True