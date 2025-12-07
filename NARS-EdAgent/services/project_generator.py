import re
from typing import List, Dict

SKILL_TO_COMPETENCY = {
    "python": "SW_DEV_001",
    "java": "SW_DEV_002",
    "sql": "DATA_001",
    "ml": "AI_001",
    "react": "FRONT_001",
    "postgresql": "DB_001",
}


def generate_task_title(company: str, description: str) -> str:
    words = re.sub(r'[^\w\s]', '', description).split()[:5]
    return f"Проект от {company}: {' '.join(words)}"


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found = []
    for skill in SKILL_TO_COMPETENCY:
        if skill in text_lower:
            found.append(skill)
    return found


def infer_roles(skills: List[str]) -> List[Dict]:
    roles = []
    backend_skills = {"python", "java", "spring", "postgresql", "sql"}
    frontend_skills = {"react", "vue", "javascript"}
    ds_skills = {"ml", "pandas", "tensorflow", "pytorch"}

    has_backend = any(s in skills for s in backend_skills)
    has_frontend = any(s in skills for s in frontend_skills)
    has_ds = any(s in skills for s in ds_skills)

    if has_backend:
        roles.append({"role_name": "Backend Developer", "required_skills": [s for s in skills if s in backend_skills]})
    if has_frontend:
        roles.append(
            {"role_name": "Frontend Developer", "required_skills": [s for s in skills if s in frontend_skills]})
    if has_ds:
        roles.append({"role_name": "Data Scientist", "required_skills": [s for s in skills if s in ds_skills]})

    if not roles:
        roles.append({"role_name": "Fullstack Developer", "required_skills": skills})

    return roles


def generate_project_task(company: str, description: str) -> Dict:
    title = generate_task_title(company, description)
    skills = extract_skills(description)
    roles = infer_roles(skills)
    competencies = list(set(SKILL_TO_COMPETENCY.get(s, "GENERIC") for s in skills))

    return {
        "title": title,
        "description": description,
        "skills": skills,
        "roles": roles,
        "competencies": competencies,
        "expected_duration_weeks": 8
    }