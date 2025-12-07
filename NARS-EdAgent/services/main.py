from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from .models import ReplyLog, Base, OutreachLog, FollowupLog, PartnerAgreement, ProjectTask, ProjectRole, \
    ProjectCompetency
from .schemas import ReplyIn, ReplyOut, DashboardStats, AgreementIn, AgreementOut
from .db import get_db, engine
from .classifier import classify_intent
from .escalation import notify_human
from .email_service import check_email_status
from .project_generator import generate_project_task

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Phase 4 Backend — Outreach & Escalation",
    description="API для обработки ответов компаний, эскалации и управления коммуникациями",
    version="1.0.0"
)


@app.post("/classify", response_model=ReplyOut, tags=["Классификация"])
def classify_reply(reply: ReplyIn, db: Session = Depends(get_db)):
    """
    Классификация одного ответа компании

    - FR-4.3: Мониторинг и категоризация ответов
    - FR-4.6: Эскалация положительных ответов
    """
    try:
        predicted_intent, confidence = classify_intent(reply.reply_text)
        human_involved = (predicted_intent == "INTEREST")

        # Сохраняем в БД
        log = ReplyLog(
            company=reply.company,
            reply_text=reply.reply_text,
            predicted_intent=predicted_intent,
            confidence=str(confidence),
            human_involved=human_involved
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        # Эскалация при положительном ответе
        if human_involved:
            notify_human(
                company=reply.company,
                reply_text=reply.reply_text,
                intent=predicted_intent
            )

        return ReplyOut(
            company=log.company,
            reply_text=log.reply_text,
            predicted_intent=log.predicted_intent,
            confidence=float(log.confidence),
            human_involved=log.human_involved
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка классификации: {str(e)}")


@app.get("/logs", tags=["Логи"])
def get_logs(
        skip: int = 0,
        limit: int = 100,
        intent: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    Получение логов ответов с пагинацией и фильтрацией
    """
    query = db.query(ReplyLog)

    if intent:
        query = query.filter(ReplyLog.predicted_intent == intent)

    logs = query.order_by(ReplyLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs


@app.post("/outreach/send", tags=["Outreach"])
async def send_outreach(
        company: str,
        email: str,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    """
    FR-4.1: Отправка писем через email API

    - Отправляет первоначальное письмо компании
    - Запланирует фоллоу-ап
    """
    try:
        # Симуляция отправки email (в продакшене - интеграция с SendGrid/Mailgun)
        print(f"📧 Отправка письма компании {company} на {email}")

        # Здесь реальная отправка через email сервис
        # send_email(to_email=email, company_name=company)

        # Логируем отправку
        outreach_log = OutreachLog(
            company=company,
            email=email,
            status="sent",
            email_sent_at=datetime.utcnow(),
            followup_scheduled=datetime.utcnow() + timedelta(days=7)
        )
        db.add(outreach_log)
        db.commit()

        # Планируем фоллоу-ап в фоновом режиме
        background_tasks.add_task(
            schedule_followup,
            company=company,
            email=email,
            days_after=7
        )

        return {
            "status": "success",
            "company": company,
            "email": email,
            "message": "Email отправлен успешно",
            "followup_scheduled": outreach_log.followup_scheduled.isoformat()
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка отправки письма: {str(e)}")


@app.get("/outreach/status", tags=["Outreach"])
async def get_outreach_status(
        company: Optional[str] = None,
        status: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    FR-4.2: Отслеживание статусов доставки писем
    """
    query = db.query(OutreachLog)

    if company:
        query = query.filter(OutreachLog.company.ilike(f"%{company}%"))

    if status:
        query = query.filter(OutreachLog.status == status)

    logs = query.order_by(OutreachLog.email_sent_at.desc()).all()

    # В реальности здесь нужно получать статусы из email сервиса
    enhanced_logs = []
    for log in logs:
        # Симуляция проверки статуса
        email_status = check_email_status(log.email)  # Заглушка

        enhanced_logs.append({
            "company": log.company,
            "email": log.email,
            "status": log.status,
            "email_sent_at": log.email_sent_at.isoformat() if log.email_sent_at else None,
            "followup_scheduled": log.followup_scheduled.isoformat() if log.followup_scheduled else None,
            "delivery_status": email_status.get("delivered", True),
            "opened": email_status.get("opened", False),
            "opened_at": email_status.get("opened_at")
        })

    return enhanced_logs


@app.post("/responses/bulk", tags=["Классификация"])
async def process_bulk_responses(
        responses: List[ReplyIn],
        db: Session = Depends(get_db)
):
    """
    FR-4.3: Массовая обработка ответов компаний
    """
    results = []
    escalated_companies = []

    for resp in responses:
        try:
            # Классификация
            predicted_intent, confidence = classify_intent(resp.reply_text)
            human_involved = (predicted_intent == "INTEREST")

            # Сохраняем в БД
            log = ReplyLog(
                company=resp.company,
                reply_text=resp.reply_text,
                predicted_intent=predicted_intent,
                confidence=str(confidence),
                human_involved=human_involved
            )
            db.add(log)

            # Эскалация
            if human_involved:
                notify_human(resp.company, resp.reply_text, predicted_intent)
                escalated_companies.append(resp.company)

            results.append({
                "company": resp.company,
                "predicted_intent": predicted_intent,
                "confidence": float(confidence),
                "human_involved": human_involved,
                "status": "processed"
            })

        except Exception as e:
            results.append({
                "company": resp.company,
                "predicted_intent": "ERROR",
                "confidence": 0.0,
                "human_involved": False,
                "status": f"error: {str(e)}"
            })

    db.commit()

    return {
        "total_processed": len(responses),
        "successful": len([r for r in results if r["status"] == "processed"]),
        "escalated": len(escalated_companies),
        "escalated_companies": escalated_companies,
        "results": results
    }


@app.post("/followup/send", tags=["Outreach"])
async def send_followup(
        company: str,
        email: str,
        days_after: int = 7,
        db: Session = Depends(get_db)
):
    """
    FR-4.5: Отправка автоматических фоллоу-апов
    """
    try:
        print(f"⏰ Отправка фоллоу-апа компании {company} через {days_after} дней")

        # Отправка фоллоу-апа через email сервис
        # send_followup_email(to_email=email, company_name=company, days_after=days_after)

        # Логируем отправку фоллоу-апа
        followup_log = FollowupLog(
            company=company,
            email=email,
            days_after=days_after,
            sent_at=datetime.utcnow()
        )
        db.add(followup_log)
        db.commit()

        return {
            "status": "success",
            "company": company,
            "days_after": days_after,
            "message": "Фоллоу-ап запланирован",
            "sent_at": followup_log.sent_at.isoformat()
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка отправки фоллоу-апа: {str(e)}")


@app.get("/followup/pending", tags=["Outreach"])
async def get_pending_followups(db: Session = Depends(get_db)):
    """
    Получение списка компаний, которым нужно отправить фоллоу-ап
    """
    # Находим компании, которым письмо было отправлено более 7 дней назад
    # и которые еще не ответили
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    pending = db.query(OutreachLog).filter(
        OutreachLog.email_sent_at <= seven_days_ago,
        ~OutreachLog.company.in_(
            db.query(ReplyLog.company).distinct()
        )
    ).all()

    return [{
        "company": log.company,
        "email": log.email,
        "email_sent_at": log.email_sent_at.isoformat(),
        "days_since_sent": (datetime.utcnow() - log.email_sent_at).days
    } for log in pending]


@app.get("/dashboard", response_model=DashboardStats, tags=["Аналитика"])
async def get_dashboard(db: Session = Depends(get_db)):
    """
    FR-7.1: Дашборд с аналитикой по коммуникациям
    """
    # Получаем все логи
    logs = db.query(ReplyLog).all()
    outreach_logs = db.query(OutreachLog).all()

    # Базовая статистика
    total_sent = len(outreach_logs)
    total_responses = len(logs)

    if total_sent > 0:
        response_rate = (total_responses / total_sent) * 100
    else:
        response_rate = 0.0

    # Статистика по интентам
    intent_counts = {}
    for log in logs:
        intent_counts[log.predicted_intent] = intent_counts.get(log.predicted_intent, 0) + 1

    # Распределение по времени
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)

    recent_logs = [log for log in logs if log.created_at.date() >= week_ago]

    return DashboardStats(
        total_emails_sent=total_sent,
        total_responses=total_responses,
        response_rate=round(response_rate, 1),
        interest_count=intent_counts.get("INTEREST", 0),
        decline_count=intent_counts.get("DECLINE", 0),
        faq_count=intent_counts.get("FAQ_REQUEST", 0),
        other_count=intent_counts.get("OWN_INTERNSHIP", 0),
        escalations=sum(1 for log in logs if log.human_involved),
        recent_responses=len(recent_logs),
        top_companies=[log.company for log in logs[:5] if log.predicted_intent == "INTEREST"]
    )


@app.get("/dashboard/details", tags=["Аналитика"])
async def get_dashboard_details(
        days: int = 30,
        db: Session = Depends(get_db)
):
    """
    Детальная аналитика за указанный период
    """
    since_date = datetime.utcnow() - timedelta(days=days)

    # Ответы за период
    responses = db.query(ReplyLog).filter(
        ReplyLog.created_at >= since_date
    ).all()

    # Отправленные письма за период
    outreach = db.query(OutreachLog).filter(
        OutreachLog.email_sent_at >= since_date
    ).all()

    # Группировка по дням
    daily_stats = {}
    for log in responses:
        date_str = log.created_at.date().isoformat()
        if date_str not in daily_stats:
            daily_stats[date_str] = {
                "date": date_str,
                "responses": 0,
                "interest": 0,
                "decline": 0,
                "faq": 0
            }

        daily_stats[date_str]["responses"] += 1
        if log.predicted_intent == "INTEREST":
            daily_stats[date_str]["interest"] += 1
        elif log.predicted_intent == "DECLINE":
            daily_stats[date_str]["decline"] += 1
        elif log.predicted_intent == "FAQ_REQUEST":
            daily_stats[date_str]["faq"] += 1

    return {
        "period_days": days,
        "total_responses": len(responses),
        "total_emails_sent": len(outreach),
        "daily_stats": list(daily_stats.values()),
        "escalation_rate": round(len([r for r in responses if r.human_involved]) / max(len(responses), 1) * 100, 1),
        "avg_confidence": round(sum(float(r.confidence) for r in responses) / max(len(responses), 1), 2)
    }


@app.get("/health", tags=["Система"])
async def health_check():
    """
    Проверка работоспособности сервиса
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "Phase 4 Outreach API"
    }


@app.post("/agreements", tags=["Фаза 5: Соглашения"])
def create_agreement(agreement: AgreementIn, db: Session = Depends(get_db)):
    existing = db.query(PartnerAgreement).filter(PartnerAgreement.company == agreement.company).first()
    if existing:
        raise HTTPException(status_code=400, detail="Соглашение для этой компании уже существует")

    db_agreement = PartnerAgreement(
        company=agreement.company,
        project_description=agreement.project_description,
        contact_person=agreement.contact_person,
        contact_email=agreement.contact_email
    )
    db.add(db_agreement)
    db.commit()
    db.refresh(db_agreement)
    return AgreementOut.from_orm(db_agreement)


@app.post("/projects/generate/{agreement_id}", tags=["Фаза 5: Проекты"])
def generate_project_from_agreement(agreement_id: int, db: Session = Depends(get_db)):
    agreement = db.query(PartnerAgreement).filter(PartnerAgreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(status_code=404, detail="Соглашение не найдено")

    task_data = generate_project_task(agreement.company, agreement.project_description)

    project_task = ProjectTask(
        company=agreement.company,
        title=task_data["title"],
        description=task_data["description"],
        expected_duration_weeks=task_data["expected_duration_weeks"],
        agreement_id=agreement.id
    )
    db.add(project_task)
    db.commit()
    db.refresh(project_task)

    for role in task_data["roles"]:
        db_role = ProjectRole(
            project_id=project_task.id,
            role_name=role["role_name"],
            required_skills=", ".join(role["required_skills"]),
            workload_hours=80
        )
        db.add(db_role)

    for comp in task_data["competencies"]:
        db_comp = ProjectCompetency(
            project_id=project_task.id,
            competency_code=comp,
            competency_name=comp
        )
        db.add(db_comp)

    db.commit()

    return {
        "project_id": project_task.id,
        "title": project_task.title,
        "roles": task_data["roles"],
        "competencies": task_data["competencies"]
    }


@app.get("/projects/catalog", tags=["Фаза 5: Проекты"])
def get_project_catalog(db: Session = Depends(get_db)):
    projects = db.query(ProjectTask).all()
    catalog = []
    for p in projects:
        roles = db.query(ProjectRole).filter(ProjectRole.project_id == p.id).all()
        comps = db.query(ProjectCompetency).filter(ProjectCompetency.project_id == p.id).all()
        catalog.append({
            "id": p.id,
            "company": p.company,
            "title": p.title,
            "description": p.description,
            "duration_weeks": p.expected_duration_weeks,
            "roles": [{"role": r.role_name, "skills": r.required_skills.split(", ")} for r in roles],
            "competencies": [c.competency_code for c in comps]
        })
    return catalog

async def schedule_followup(company: str, email: str, days_after: int):
    import asyncio
    await asyncio.sleep(days_after * 24 * 3600)

    # Отправляем фоллоу-ап
    try:
        print(f"🤖 Автоматическая отправка фоллоу-апа компании {company}")
        # Здесь реальная отправка
        # send_followup_email(to_email=email, company_name=company)
    except Exception as e:
        print(f"❌ Ошибка отправки фоллоу-апа для {company}: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)