import io
import fitz
from starlette.testclient import TestClient


def create_sample_pdf_bytes(name: str = "Alice Walker") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    content = f"""
    {name}
    Senior Full-Stack Engineer
    Email: {name.lower().replace(' ', '.')}@example.com
    Phone: +1 (555) 432-1098
    Location: Seattle, WA
    Summary: Experienced engineer with 6 years building high-performance cloud backends.

    Skills:
    - Python, FastAPI, Django, SQLAlchemy, PostgreSQL, Docker, AWS, React, TypeScript

    Experience:
    - Senior Engineer at TechCorp (2020 - Present)
      Architected distributed microservices and optimized PostgreSQL database queries.
    - Software Engineer at DataInc (2018 - 2020)
      Built RESTful APIs and background workers in Python.

    Education:
    - B.S. in Software Engineering, Washington University (2018)
    """
    page.insert_text((50, 72), content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_health_check(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "HireFlow API"


def test_create_and_get_job(client: TestClient):
    jd_payload = {
        "title": "Senior Python Backend Engineer",
        "company": "NextGen AI",
        "department": "Platform Engineering",
        "location": "Remote",
        "raw_text": """
        We are seeking a Senior Python Backend Engineer with 4+ years of experience.
        Requirements:
        - Must have deep proficiency in Python and FastAPI or Django.
        - Must have solid experience with PostgreSQL and relational data modeling.
        - Experience with Docker and AWS cloud deployments is strongly preferred.
        - Strong communication and architectural leadership.
        """
    }
    response = client.post("/api/v1/jobs/", json=jd_payload)
    assert response.status_code == 200
    job = response.json()
    assert job["id"] is not None
    assert "Python" in job["title"]
    assert len(job["requirements"]) >= 1

    # Verify GET /jobs/{id}
    get_res = client.get(f"/api/v1/jobs/{job['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == job["id"]


def test_upload_resume_and_candidate_profile(client: TestClient):
    pdf_bytes = create_sample_pdf_bytes("Alice Walker")
    files = {"file": ("alice_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

    response = client.post("/api/v1/resumes/upload", files=files)
    assert response.status_code == 200
    candidate = response.json()
    assert candidate["id"] is not None
    assert candidate["full_name"] == "Alice Walker"
    assert len(candidate["skills"]) >= 1
    assert len(candidate["experiences"]) >= 1

    # Test candidate summary endpoint (Module 8)
    summary_res = client.get(f"/api/v1/candidates/{candidate['id']}/summary")
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["candidate_id"] == candidate["id"]
    assert len(summary_data["summary"]) > 10


def test_candidate_matching_and_evidence_tracking(client: TestClient):
    # 1. Create Job
    jd_res = client.post("/api/v1/jobs/", json={
        "title": "Backend Python Developer",
        "raw_text": "Requirements: Proficiency in Python, FastAPI, and PostgreSQL. Docker experience required."
    })
    job = jd_res.json()

    # 2. Upload Candidate
    pdf_bytes = create_sample_pdf_bytes("Bob Martin")
    files = {"file": ("bob_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    cand_res = client.post("/api/v1/resumes/upload", files=files)
    candidate = cand_res.json()

    # 3. Match candidate to job
    match_payload = {
        "candidate_id": candidate["id"],
        "job_id": job["id"],
        "force_recalculate": True
    }
    match_res = client.post("/api/v1/match", json=match_payload)
    assert match_res.status_code == 200
    match_data = match_res.json()

    assert match_data["overall_match_score"] > 0
    assert match_data["status"] in ["strong_fit", "moderate_fit", "unlikely_fit"]
    assert len(match_data["evidence_items"]) >= 1

    # Check evidence citation
    first_evidence = match_data["evidence_items"][0]
    assert first_evidence["status"] in ["fully_met", "partially_met", "unmet"]
    assert first_evidence["source_page"] is not None


def test_interview_intelligence_flow(client: TestClient):
    # Setup candidate & job
    jd_res = client.post("/api/v1/jobs/", json={
        "title": "AI Platform Engineer",
        "raw_text": "Requirements: Experience building scalable LLM pipelines in Python and FastAPI."
    })
    job = jd_res.json()

    pdf_bytes = create_sample_pdf_bytes("Clara Oswald")
    files = {"file": ("clara_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    cand_res = client.post("/api/v1/resumes/upload", files=files)
    candidate = cand_res.json()

    # 1. Generate interview questions (Module 9)
    gen_payload = {
        "candidate_id": candidate["id"],
        "job_id": job["id"],
        "question_count": 3
    }
    session_res = client.post("/api/v1/interviews/generate-questions", json=gen_payload)
    assert session_res.status_code == 200
    session_data = session_res.json()
    assert session_data["id"] is not None
    assert len(session_data["questions"]) == 3
    session_id = session_data["id"]

    # 2. Add interviewer notes (Module 10)
    note_payload = {
        "interviewer_name": "Lead Architect",
        "raw_notes": "Candidate displayed great understanding of concurrency and caching. Very articulate communication."
    }
    note_res = client.post(f"/api/v1/interviews/sessions/{session_id}/notes", json=note_payload)
    assert note_res.status_code == 200
    note_data = note_res.json()
    assert note_data["session_id"] == session_id
    assert note_data["sentiment"] in ["Positive", "Neutral", "Concern"]

    # 3. Generate evaluation report (Module 11)
    eval_res = client.post(f"/api/v1/interviews/sessions/{session_id}/evaluate")
    assert eval_res.status_code == 200
    eval_report = eval_res.json()
    assert eval_report["overall_rating"] >= 1.0
    assert eval_report["recommendation"] in ["Strong Hire", "Hire", "Consider", "No Hire"]
    assert len(eval_report["strengths"]) >= 1


def test_natural_language_search(client: TestClient):
    # Upload candidate with Python skills
    pdf_bytes = create_sample_pdf_bytes("Devon Vance")
    files = {"file": ("devon_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    client.post("/api/v1/resumes/upload", files=files)

    # Search via natural language (Module 12)
    search_payload = {
        "query": "Find a Python engineer with 3+ years experience and FastAPI knowledge",
        "limit": 5
    }
    search_res = client.post("/api/v1/search/", json=search_payload)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total_results"] >= 1
    assert search_data["results"][0]["relevance_score"] > 0
