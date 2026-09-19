import sys
import os
from datetime import datetime

# Ensure backend root is in pythonpath
sys.path.insert(0, os.path.abspath("."))

from app.core.database import Base, engine, SessionLocal
import app.models
from app.models.job import JobDescription, JobRequirement
from app.models.candidate import Candidate, Resume, CandidateSkill, Experience, Education
from app.models.evaluation import CandidateJobMatch, RequirementEvidence, InterviewSession, InterviewQuestion

def init_database():
    print("[1/3] Creating all tables in database...")
    Base.metadata.create_all(bind=engine)
    print("      Tables created successfully!")

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(JobDescription).count() > 0:
            print("[2/3] Database already seeded. Skipping initial data.")
            return

        print("[2/3] Seeding initial Jobs and Requirements...")
        job1 = JobDescription(
            title="Senior Backend Engineer",
            company="HireFlow Tech",
            department="Engineering",
            location="Remote / Hybrid",
            raw_text="Job Title: Senior Backend Engineer\nDepartment: Engineering\nRequired: 5+ years building distributed Python microservices, FastAPI, PostgreSQL, Redis, Kafka.",
            summary="Lead core transaction processing and microservices architecture.",
            min_years_experience=5.0,
        )
        job2 = JobDescription(
            title="Full Stack AI Engineer",
            company="HireFlow Tech",
            department="AI Products",
            location="San Francisco, CA (or Remote)",
            raw_text="Job Title: Full Stack AI Engineer\nDepartment: AI Products\nRequired: React, TypeScript, Python, LLM orchestration (LangChain), Vector DBs.",
            summary="Build AI candidate screening agents and conversational recruiter workflows.",
            min_years_experience=3.0,
        )
        job3 = JobDescription(
            title="Staff DevOps Engineer",
            company="HireFlow Tech",
            department="Infrastructure",
            location="Remote",
            raw_text="Job Title: Staff DevOps Engineer\nDepartment: Infrastructure\nRequired: Kubernetes multi-cluster management, Terraform, AWS, Prometheus, CI/CD pipelines.",
            summary="Design zero-downtime multi-region cloud infrastructure and automated rollouts.",
            min_years_experience=7.0,
        )
        db.add_all([job1, job2, job3])
        db.flush()

        # Job Requirements for Job 1
        req1 = JobRequirement(job_id=job1.id, requirement_text="5+ years backend systems architecture in Python / FastAPI", category="must-have", weight=1.0, min_experience_years=5.0)
        req2 = JobRequirement(job_id=job1.id, requirement_text="PostgreSQL query optimization & relational schema modeling", category="must-have", weight=1.0, min_experience_years=4.0)
        req3 = JobRequirement(job_id=job1.id, requirement_text="Hands-on experience deploying to Kubernetes clusters", category="nice-to-have", weight=0.8, min_experience_years=2.0)
        req4 = JobRequirement(job_id=job1.id, requirement_text="Team mentorship and sprint leadership of junior engineers", category="soft-skill", weight=0.6, min_experience_years=2.0)
        db.add_all([req1, req2, req3, req4])

        print("[3/3] Seeding Candidate profiles with evidence...")
        cand1 = Candidate(
            full_name="Alex Rivera",
            email="alex.rivera@example.com",
            phone="+1 (555) 234-5678",
            location="San Francisco, CA",
            summary="Senior Backend Engineer with 6.5 years building high-throughput distributed microservices with FastAPI and Kafka.",
            total_experience_years=6.5,
            current_title="Senior Backend Engineer",
            current_company="Stripe",
        )
        cand2 = Candidate(
            full_name="Priya Sharma",
            email="priya.s@example.com",
            phone="+1 (555) 987-6543",
            location="Seattle, WA",
            summary="Full Stack AI Engineer with 4 years building RAG pipelines, FastAPI services, and React frontends.",
            total_experience_years=4.0,
            current_title="Full Stack AI Engineer",
            current_company="Scale AI",
        )
        cand3 = Candidate(
            full_name="Marcus Chen",
            email="m.chen@example.com",
            phone="+1 (555) 456-7890",
            location="Austin, TX",
            summary="Staff DevOps Engineer with 8 years architecting multi-region EKS Kubernetes clusters and Terraform infrastructure.",
            total_experience_years=8.0,
            current_title="Staff DevOps Engineer",
            current_company="Datadog",
        )
        db.add_all([cand1, cand2, cand3])
        db.flush()

        # Skills for Alex Rivera
        s1 = CandidateSkill(candidate_id=cand1.id, name="Python", category="Technical", proficiency="Expert", years_of_experience=6.0, source_snippet="Core backend development in Python for 6+ years across Stripe and Razorpay.", source_page=1)
        s2 = CandidateSkill(candidate_id=cand1.id, name="FastAPI", category="Technical", proficiency="Expert", years_of_experience=4.0, source_snippet="Designed high-throughput REST APIs handling 15k req/sec with FastAPI.", source_page=1)
        s3 = CandidateSkill(candidate_id=cand1.id, name="PostgreSQL", category="Technical", proficiency="Advanced", years_of_experience=5.0, source_snippet="Partitioned PostgreSQL databases and optimized indexing trade-offs.", source_page=2)
        db.add_all([s1, s2, s3])

        # Match record for Alex Rivera to Job 1
        match1 = CandidateJobMatch(
            candidate_id=cand1.id,
            job_id=job1.id,
            overall_match_score=88.5,
            skills_match_score=92.0,
            experience_match_score=85.0,
            status="reviewed",
            summary_analysis="Strong technical alignment on FastAPI and PostgreSQL criteria; recruiter interview needed to validate team leadership scope.",
            strengths="FastAPI microservices, high-throughput Kafka event streaming, PostgreSQL performance tuning.",
            gaps="Direct Kubernetes cluster admin experience is ambiguous; no junior developer mentoring explicitly stated in resume.",
        )
        db.add(match1)
        db.flush()

        # Evidence records
        ev1 = RequirementEvidence(
            match_id=match1.id,
            requirement_id=req1.id,
            status="fully_met",
            score=0.95,
            evidence_quote="Engineered high-throughput event processing pipelines handling 15k req/sec with FastAPI and Kafka across 4 years at Stripe.",
            source_page=1,
            reasoning="Candidate has 4 continuous years with FastAPI in high-scale production.",
        )
        ev2 = RequirementEvidence(
            match_id=match1.id,
            requirement_id=req2.id,
            status="fully_met",
            score=0.90,
            evidence_quote="Optimized database connection pools and partitioned tables resulting in 40% p99 latency reduction.",
            source_page=2,
            reasoning="Concrete database indexing and query tuning track record.",
        )
        ev3 = RequirementEvidence(
            match_id=match1.id,
            requirement_id=req3.id,
            status="partially_met",
            score=0.60,
            evidence_quote="Mentions Docker and containerized builds, but specific Kubernetes manifest authoring remains unverified.",
            source_page=2,
            reasoning="Needs interview verification on cluster operations.",
        )
        ev4 = RequirementEvidence(
            match_id=match1.id,
            requirement_id=req4.id,
            status="unmet",
            score=0.20,
            evidence_quote="No direct mention of team lead or mentoring responsibilities found in parsed text.",
            source_page=1,
            reasoning="Requirement not found in CV.",
        )
        db.add_all([ev1, ev2, ev3, ev4])

        db.commit()
        print("SUCCESS: Database fully populated with initial jobs, candidates, and evidence mappings!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
