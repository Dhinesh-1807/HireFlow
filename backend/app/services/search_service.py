import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateResponse
from app.services.llm_service import llm_service


class SearchService:
    @staticmethod
    def parse_search_intent(query: str) -> Dict[str, Any]:
        """
        Use LLM or regex to parse natural language search intent into structured filters.
        """
        system_prompt = (
            "You are an AI search parser for a candidate database. "
            "Extract structured criteria from natural language recruiter queries. "
            "Return JSON:\n"
            "{\n"
            '  "required_skills": ["string"],\n'
            '  "target_roles": ["string"],\n'
            '  "min_years_experience": number or null,\n'
            '  "keywords": ["string"]\n'
            "}"
        )
        user_prompt = f"Query: {query}"

        def fallback_parser():
            years_match = re.search(r"(\d+)\+?\s*(?:year|yr)", query, re.IGNORECASE)
            min_years = float(years_match.group(1)) if years_match else None

            sample_techs = ["python", "fastapi", "react", "sql", "postgresql", "aws", "docker", "javascript", "node", "kubernetes"]
            found_skills = [t for t in sample_techs if t in query.lower()]

            return {
                "required_skills": found_skills,
                "target_roles": [query.strip()],
                "min_years_experience": min_years,
                "keywords": [w for w in query.split() if len(w) > 3]
            }

        return llm_service.generate_json(system_prompt, user_prompt, fallback_generator=fallback_parser)

    @staticmethod
    def search_candidates(
        db: Session,
        query: str,
        job_id: int = None,
        min_experience_years: float = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Execute natural language candidate search across candidates, skills, and resumes.
        """
        intent = SearchService.parse_search_intent(query)
        target_skills = [s.lower() for s in intent.get("required_skills", [])]
        req_min_years = min_experience_years or intent.get("min_years_experience") or 0.0

        candidates = db.query(Candidate).all()
        results = []

        query_terms = [t.lower() for t in query.split() if len(t) > 2]

        for cand in candidates:
            cand_skills_names = [s.name.lower() for s in cand.skills]
            cand_exp_years = cand.total_experience_years or 0.0

            # Compute score components
            score = 50.0  # baseline
            highlights = []
            matched_skills = []

            # Experience alignment
            if req_min_years > 0:
                if cand_exp_years >= req_min_years:
                    score += 20.0
                    highlights.append(f"Meets experience requirement ({cand_exp_years} yrs >= {req_min_years} yrs)")
                else:
                    score -= 15.0

            # Skill matches
            for s in target_skills:
                if s in cand_skills_names:
                    score += 15.0
                    matched_skills.append(s.title())
                    highlights.append(f"Matched target skill '{s.title()}'")

            # Keyword matches in summary or title
            cand_full_profile = f"{cand.full_name} {cand.current_title} {cand.summary} {' '.join(cand_skills_names)}".lower()
            for term in query_terms:
                if term in cand_full_profile and term not in target_skills:
                    score += 5.0

            # Normalize score between 10 and 99
            final_score = max(10.0, min(98.0, round(score, 1)))

            # If user queried for specific skills, filter or prioritize
            if target_skills and not matched_skills and score < 60:
                continue

            results.append({
                "candidate": CandidateResponse.model_validate(cand),
                "relevance_score": final_score,
                "matching_highlights": highlights or ["General profile match against query terms"],
                "matched_skills": matched_skills,
                "explanation": f"Candidate aligns with query '{query}' based on verified skills and background."
            })

        # Sort descending by relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)

        return {
            "query": query,
            "parsed_intent": intent,
            "total_results": len(results[:limit]),
            "results": results[:limit]
        }


search_service = SearchService()
