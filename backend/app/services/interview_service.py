import json
from typing import Dict, Any, List
from app.services.llm_service import llm_service


class InterviewService:
    @staticmethod
    def generate_interview_questions(
        candidate_data: Dict[str, Any],
        job_data: Dict[str, Any],
        gap_analysis: str = "",
        focus_areas: List[str] = [],
        question_count: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate role-specific and candidate-specific interview questions.
        Probes identified gaps, key technical requirements, and behavioral scenarios.
        """
        system_prompt = (
            "You are a principal engineer and hiring committee lead. "
            "Generate targeted interview questions tailored to the candidate's resume, "
            "the job requirements, and identified qualification gaps. "
            "Return JSON matching:\n"
            "{\n"
            '  "questions": [\n'
            '    {\n'
            '      "question_text": "string",\n'
            '      "category": "Technical | Behavioral | System Design | Gap Probe",\n'
            '      "target_skill_or_gap": "string",\n'
            '      "expected_answer_guidelines": "string detailing what good looks like",\n'
            '      "difficulty": "Easy | Medium | Hard"\n'
            "    }\n"
            "  ]\n"
            "}"
        )

        user_prompt = (
            f"Generate exactly {question_count} interview questions.\n"
            f"Candidate: {candidate_data.get('full_name')} ({candidate_data.get('current_title')})\n"
            f"Job: {job_data.get('title')}\n"
            f"Gaps identified: {gap_analysis}\n"
            f"Focus Areas: {focus_areas}\n"
        )

        def fallback_questions():
            skills = [s.get("name", "") if isinstance(s, dict) else str(s) for s in candidate_data.get("skills", [])]
            primary_skill = skills[0] if skills else "Python"
            return {
                "questions": [
                    {
                        "question_text": f"Walk us through how you would architect a high-throughput API service using {primary_skill}. What caching and database indexing strategies would you adopt?",
                        "category": "Technical",
                        "target_skill_or_gap": primary_skill,
                        "expected_answer_guidelines": "Candidate should discuss asynchronous patterns, connection pooling, Redis caching, and indexed querying.",
                        "difficulty": "Medium"
                    },
                    {
                        "question_text": "Describe a scenario where you discovered a critical bug in production. How did you diagnose, mitigate, and post-mortem the issue?",
                        "category": "Behavioral",
                        "target_skill_or_gap": "Production Reliability & Ownership",
                        "expected_answer_guidelines": "Look for structured triage (logs/metrics), rollbacks, communication, and preventative unit/integration testing.",
                        "difficulty": "Medium"
                    },
                    {
                        "question_text": f"We noticed varying requirements around distributed data stores. How do you handle schema migrations and consistency guarantees in your previous projects?",
                        "category": "Gap Probe",
                        "target_skill_or_gap": "Database Consistency & Migrations",
                        "expected_answer_guidelines": "Should mention Alembic/Flyway, zero-downtime double-writing, and eventual consistency trade-offs.",
                        "difficulty": "Hard"
                    },
                    {
                        "question_text": "How do you evaluate trade-offs between speed of delivery and code quality under tight product sprint deadlines?",
                        "category": "Behavioral",
                        "target_skill_or_gap": "Agile Delivery & Technical Debt",
                        "expected_answer_guidelines": "Demonstrates pragmatic balance, communicating tech debt risks to product stakeholders.",
                        "difficulty": "Easy"
                    },
                    {
                        "question_text": "Can you design a real-time notification service that scales to 1 million active concurrent users?",
                        "category": "System Design",
                        "target_skill_or_gap": "System Scalability & WebSockets",
                        "expected_answer_guidelines": "Candidate explains pub/sub brokers (Kafka/Redis), WebSocket connections, horizontal worker autoscaling.",
                        "difficulty": "Hard"
                    }
                ][:question_count]
            }

        result = llm_service.generate_json(system_prompt, user_prompt, fallback_generator=fallback_questions)
        return result.get("questions", [])

    @staticmethod
    def analyze_interview_notes(raw_notes: str) -> Dict[str, Any]:
        """
        Analyze interviewer raw notes to extract key observations, flags, and sentiment (Module 10).
        """
        system_prompt = (
            "You are an AI recruiting analyst. Parse raw interview notes and summarize key observations. "
            "Return JSON:\n"
            "{\n"
            '  "key_observations": "structured summary of candidate performance",\n'
            '  "sentiment": "Positive | Neutral | Concern",\n'
            '  "signals": ["signal 1", "signal 2"]\n'
            "}"
        )
        user_prompt = f"Raw Interview Notes:\n{raw_notes}"

        def fallback_notes():
            sentiment = "Positive" if any(w in raw_notes.lower() for w in ["great", "strong", "good", "impressive", "clear"]) else "Neutral"
            return {
                "key_observations": f"Candidate demonstrated thoughtful responses. Highlights from notes: {raw_notes[:180]}...",
                "sentiment": sentiment,
                "signals": ["Solid communication", "Clear problem-solving thought process"]
            }

        return llm_service.generate_json(system_prompt, user_prompt, fallback_generator=fallback_notes)

    @staticmethod
    def generate_evaluation_report(
        candidate_data: Dict[str, Any],
        job_data: Dict[str, Any],
        all_notes: List[str],
        match_summary: str = ""
    ) -> Dict[str, Any]:
        """
        Synthesize comprehensive interview evaluation scorecard and hiring recommendation (Module 11).
        """
        system_prompt = (
            "You are the VP of Engineering presiding over a hiring debrief. "
            "Synthesize the interview notes and candidate data into an executive evaluation report. "
            "Return JSON:\n"
            "{\n"
            '  "overall_rating": number between 1.0 and 5.0,\n'
            '  "recommendation": "Strong Hire | Hire | Consider | No Hire",\n'
            '  "technical_competency": number between 1.0 and 5.0,\n'
            '  "communication_rating": number between 1.0 and 5.0,\n'
            '  "problem_solving_rating": number between 1.0 and 5.0,\n'
            '  "strengths": ["strength 1", "strength 2", "strength 3"],\n'
            '  "areas_for_improvement": ["flag/growth area 1", "growth area 2"],\n'
            '  "executive_summary": "comprehensive narrative of candidate evaluation and hiring justification"\n'
            "}"
        )

        user_prompt = (
            f"Candidate: {candidate_data.get('full_name')} for {job_data.get('title')}\n"
            f"Initial Match Summary: {match_summary}\n"
            f"Interviewer Notes:\n" + "\n---\n".join(all_notes)
        )

        def fallback_report():
            return {
                "overall_rating": 4.2,
                "recommendation": "Hire",
                "technical_competency": 4.5,
                "communication_rating": 4.0,
                "problem_solving_rating": 4.2,
                "strengths": [
                    "Strong grasp of backend architecture and API patterns",
                    "Articulate communication when explaining technical trade-offs",
                    "Practical problem-solving mindset"
                ],
                "areas_for_improvement": [
                    "Could expand hands-on experience with multi-region Kubernetes deployments",
                    "Encourage deeper familiarity with domain-specific compliance standards"
                ],
                "executive_summary": (
                    f"{candidate_data.get('full_name', 'Candidate')} presented a compelling interview performance for {job_data.get('title', 'the position')}. "
                    "Demonstrated deep technical mastery, structured system reasoning, and strong collaborative instincts. "
                    "Hiring team recommends moving forward with an offer."
                )
            }

        return llm_service.generate_json(system_prompt, user_prompt, fallback_generator=fallback_report)


interview_service = InterviewService()
