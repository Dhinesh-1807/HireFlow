import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hocxdxtpdfsssmtmuhlz.supabase.co/rest/v1")
API_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

HEADERS = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

def post(endpoint, data):
    if not API_KEY:
        print("Missing SUPABASE_KEY in environment.")
        return None
    url = f"{SUPABASE_URL}/{endpoint}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:
        error_msg = e.read().decode("utf-8") if hasattr(e, "read") else str(e)
        print(f"Error on {endpoint}: {error_msg}")
        return None

def get(endpoint):
    url = f"{SUPABASE_URL}/{endpoint}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        return []

def seed_full():
    print("Fetching seeded jobs and candidates...")
    jobs = get("job_descriptions?select=id,title")
    candidates = get("candidates?select=id,full_name")

    if not jobs or not candidates:
        print("Jobs or candidates missing.")
        return

    job1_id = jobs[0]["id"]
    cand1_id = candidates[0]["id"]

    print(f"Seeding Job Requirements for Job ID {job1_id}...")
    reqs = post("job_requirements", [
        {"job_id": job1_id, "requirement_text": "5+ years backend systems architecture in Python / FastAPI", "category": "must-have", "weight": 1.0, "min_experience_years": 5.0},
        {"job_id": job1_id, "requirement_text": "PostgreSQL query optimization & relational schema modeling", "category": "must-have", "weight": 1.0, "min_experience_years": 4.0},
        {"job_id": job1_id, "requirement_text": "Hands-on experience deploying to Kubernetes clusters", "category": "nice-to-have", "weight": 0.8, "min_experience_years": 2.0},
        {"job_id": job1_id, "requirement_text": "Team mentorship and sprint leadership of junior engineers", "category": "soft-skill", "weight": 0.6, "min_experience_years": 2.0},
    ])

    print(f"Seeding Candidate Skills for Candidate ID {cand1_id}...")
    skills = post("candidate_skills", [
        {"candidate_id": cand1_id, "name": "Python", "category": "Technical", "proficiency": "Expert", "years_of_experience": 6.0, "source_snippet": "Core backend development in Python for 6+ years.", "source_page": 1},
        {"candidate_id": cand1_id, "name": "FastAPI", "category": "Technical", "proficiency": "Expert", "years_of_experience": 4.0, "source_snippet": "Designed high-throughput REST APIs handling 15k req/sec with FastAPI.", "source_page": 1},
        {"candidate_id": cand1_id, "name": "PostgreSQL", "category": "Technical", "proficiency": "Advanced", "years_of_experience": 5.0, "source_snippet": "Partitioned PostgreSQL databases and query optimization.", "source_page": 2},
    ])

    print("Seeding Candidate Job Match & Evidence...")
    match = post("candidate_job_matches", [
        {
            "candidate_id": cand1_id,
            "job_id": job1_id,
            "overall_match_score": 88.5,
            "skills_match_score": 92.0,
            "experience_match_score": 85.0,
            "status": "reviewed",
            "summary_analysis": "Strong technical alignment on FastAPI and PostgreSQL criteria; recruiter interview needed to validate team leadership scope.",
            "strengths": "FastAPI microservices, Kafka event streaming, PostgreSQL performance tuning.",
            "gaps": "Direct Kubernetes cluster admin is ambiguous.",
        }
    ])

    if match and reqs:
        match_id = match[0]["id"]
        post("requirement_evidence", [
            {
                "match_id": match_id,
                "requirement_id": reqs[0]["id"],
                "status": "fully_met",
                "score": 0.95,
                "evidence_quote": "Engineered high-throughput event processing pipelines handling 15k req/sec with FastAPI across 4 years at Stripe.",
                "source_page": 1,
                "reasoning": "Candidate has 4 continuous years with FastAPI in high-scale production."
            },
            {
                "match_id": match_id,
                "requirement_id": reqs[1]["id"],
                "status": "fully_met",
                "score": 0.90,
                "evidence_quote": "Optimized database connection pools and partitioned tables resulting in 40% p99 latency reduction.",
                "source_page": 2,
                "reasoning": "Concrete database indexing track record."
            },
            {
                "match_id": match_id,
                "requirement_id": reqs[2]["id"],
                "status": "partially_met",
                "score": 0.60,
                "evidence_quote": "Mentions Docker and containerized builds, but specific Kubernetes cluster administration remains unverified.",
                "source_page": 2,
                "reasoning": "Needs interview verification on cluster operations."
            }
        ])

    print("SUCCESS: Full database records (Jobs, Requirements, Candidates, Skills, Matches, Evidence) seeded to Supabase Cloud!")

if __name__ == "__main__":
    seed_full()
