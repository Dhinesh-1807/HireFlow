from typing import Dict, Any, List
from app.services.llm_service import llm_service


class JobService:
    @staticmethod
    def process_job_description(raw_text: str, default_title: str = None) -> Dict[str, Any]:
        """
        Process raw Job Description text into structured metadata and granular requirements.
        Extracts title, company, department, min experience, summary, and classified requirements.
        """
        system_prompt = (
            "You are an expert technical recruiter. Analyze the following Job Description (JD) "
            "and extract structured information and distinct, measurable requirements. "
            "Return JSON matching this exact structure:\n"
            "{\n"
            '  "title": "string (Job Title)",\n'
            '  "company": "string or null",\n'
            '  "department": "string or null",\n'
            '  "location": "string or null",\n'
            '  "min_years_experience": number,\n'
            '  "summary": "concise 2-3 sentence role summary",\n'
            '  "requirements": [\n'
            '    {\n'
            '      "requirement_text": "granular requirement statement",\n'
            '      "category": "must-have | nice-to-have | soft-skill | qualification",\n'
            '      "weight": number between 0.5 and 2.0 (default 1.0),\n'
            '      "min_experience_years": number or null\n'
            "    }\n"
            "  ]\n"
            "}"
        )
        user_prompt = f"Job Description:\n---\n{raw_text[:8000]}\n---"

        def fallback_jd():
            lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
            title = default_title or (lines[0] if lines else "Software Engineer")
            if len(title) > 60:
                title = default_title or "Software Engineer"

            reqs = []
            for line in lines[1:]:
                clean_l = line.lstrip("-*•1234567890. ").strip()
                if len(clean_l) > 15 and len(clean_l) < 200:
                    category = "must-have" if any(w in clean_l.lower() for w in ["require", "must", "experience with", "proficien"]) else "nice-to-have"
                    reqs.append({
                        "requirement_text": clean_l,
                        "category": category,
                        "weight": 1.5 if category == "must-have" else 1.0,
                        "min_experience_years": 3.0 if "year" in clean_l.lower() else None
                    })
                if len(reqs) >= 8:
                    break

            if not reqs:
                reqs = [
                    {"requirement_text": "Proficiency in Python and REST API development", "category": "must-have", "weight": 1.5, "min_experience_years": 2.0},
                    {"requirement_text": "Experience with relational databases (PostgreSQL/SQL)", "category": "must-have", "weight": 1.2, "min_experience_years": 2.0},
                    {"requirement_text": "Familiarity with containerization using Docker", "category": "nice-to-have", "weight": 1.0, "min_experience_years": 1.0},
                    {"requirement_text": "Strong collaboration and communication skills", "category": "soft-skill", "weight": 0.8, "min_experience_years": None},
                ]

            return {
                "title": title,
                "company": "HireFlow Partner",
                "department": "Engineering",
                "location": "Remote",
                "min_years_experience": 3.0,
                "summary": f"Role focused on {title} responsibilities, building scalable backend services and AI integrations.",
                "requirements": reqs
            }

        return llm_service.generate_json(system_prompt, user_prompt, fallback_generator=fallback_jd)


job_service = JobService()
