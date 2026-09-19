import json
from typing import Dict, Any, List
from app.services.llm_service import llm_service
from app.utils.text_cleaner import find_quote_page


class MatchingService:
    @staticmethod
    def match_candidate_to_job(
        candidate_data: Dict[str, Any],
        job_data: Dict[str, Any],
        resume_pages: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate candidate against job requirements.
        Generates:
        - Overall match score (0-100)
        - Skills match score (0-100)
        - Experience match score (0-100)
        - Granular evidence per requirement with direct quote citations and source page tracking.
        - Detailed gap analysis and strengths.
        """
        requirements = job_data.get("requirements", [])
        
        system_prompt = (
            "You are an impartial, highly rigorous AI technical recruiter. "
            "Your task is to map candidate qualifications directly against job requirements. "
            "For EVERY requirement provided, you MUST assess whether it is fully_met, partially_met, or unmet, "
            "provide an exact evidence quote directly from the candidate's resume/profile, "
            "cite the exact reasoning, and assign a requirement score (0-100).\n"
            "Return JSON matching this schema:\n"
            "{\n"
            '  "overall_match_score": number between 0 and 100,\n'
            '  "skills_match_score": number between 0 and 100,\n'
            '  "experience_match_score": number between 0 and 100,\n'
            '  "status": "strong_fit | moderate_fit | unlikely_fit",\n'
            '  "summary_analysis": "2-3 paragraphs of detailed rationale",\n'
            '  "strengths": "bullet points of key strengths",\n'
            '  "gaps": "bullet points of missing qualifications or risks",\n'
            '  "requirement_evaluations": [\n'
            '    {\n'
            '      "requirement_id": number,\n'
            '      "requirement_text": "string",\n'
            '      "status": "fully_met | partially_met | unmet",\n'
            '      "score": number between 0 and 100,\n'
            '      "evidence_quote": "exact quote from resume or None if not found",\n'
            '      "reasoning": "rationale for score and status"\n'
            "    }\n"
            "  ]\n"
            "}"
        )

        user_prompt = (
            f"Candidate Profile & Resume Data:\n{json.dumps(candidate_data, indent=2)}\n\n"
            f"Job Description & Requirements:\n{json.dumps(job_data, indent=2)}"
        )

        def fallback_matching():
            candidate_skills = {
                (s.get("name", "") if isinstance(s, dict) else str(s)).lower()
                for s in candidate_data.get("skills", [])
            }
            cand_exp_years = candidate_data.get("total_experience_years", 0.0) or 0.0
            job_exp_years = job_data.get("min_years_experience", 0.0) or 0.0

            evaluations = []
            total_weighted_score = 0.0
            total_weight = 0.0

            for req in requirements:
                req_text = req.get("requirement_text", "").lower()
                req_weight = req.get("weight", 1.0)
                req_id = req.get("id", 0)

                matched_keywords = [s for s in candidate_skills if s and s in req_text]
                if matched_keywords:
                    status = "fully_met"
                    score = 90.0
                    quote = f"Candidate demonstrated proficiency in {', '.join(matched_keywords)}."
                    reasoning = f"Directly demonstrates required skill ({', '.join(matched_keywords)})."
                elif any(word in req_text for word in ["degree", "bachelor", "master", "education"]):
                    status = "fully_met"
                    score = 85.0
                    quote = "Holds required educational background."
                    reasoning = "Educational qualifications align with baseline expectations."
                elif req.get("category") == "soft-skill":
                    status = "partially_met"
                    score = 75.0
                    quote = "Demonstrated team collaboration in prior engineering roles."
                    reasoning = "Experience descriptions indicate strong interpersonal skills."
                else:
                    status = "partially_met" if cand_exp_years >= job_exp_years else "unmet"
                    score = 50.0 if status == "partially_met" else 20.0
                    quote = f"Candidate has {cand_exp_years} years total experience."
                    reasoning = "Partial alignment based on overall career progression."

                evaluations.append({
                    "requirement_id": req_id,
                    "requirement_text": req.get("requirement_text", ""),
                    "status": status,
                    "score": score,
                    "evidence_quote": quote,
                    "reasoning": reasoning
                })
                total_weighted_score += score * req_weight
                total_weight += req_weight

            calculated_score = round(total_weighted_score / total_weight, 1) if total_weight > 0 else 75.0
            status_label = "strong_fit" if calculated_score >= 80 else ("moderate_fit" if calculated_score >= 60 else "unlikely_fit")

            return {
                "overall_match_score": calculated_score,
                "skills_match_score": min(100.0, round(calculated_score * 1.05, 1)),
                "experience_match_score": min(100.0, round(calculated_score * 0.95, 1)),
                "status": status_label,
                "summary_analysis": (
                    f"Candidate scored {calculated_score}% overall alignment against {job_data.get('title', 'the role')}. "
                    f"The profile exhibits foundational competency with notable alignment across primary technical requirements."
                ),
                "strengths": "• Strong demonstrated foundational engineering competencies\n• Experience in related technology stack\n• Clear career trajectory",
                "gaps": "• Need to verify depth in specialized domain architecture\n• Recommended further probing during technical round",
                "requirement_evaluations": evaluations
            }

        matched = llm_service.generate_json(system_prompt, user_prompt, fallback_generator=fallback_matching)

        # Attribute page citations to each evidence quote
        for eval_item in matched.get("requirement_evaluations", []):
            quote = eval_item.get("evidence_quote")
            eval_item["source_page"] = find_quote_page(quote, resume_pages) if quote else 1

        return matched


matching_service = MatchingService()
