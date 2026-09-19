# HireFlow Backend 🚀

AI-Powered Candidate Screening & Interview Intelligence Platform backend built with **FastAPI**, **SQLAlchemy**, **PyMuPDF**, **Pydantic**, and **OpenAI API**.

Designed for seamless integration with modern React/Vite frontends.

---

## 📂 Project Architecture

```text
HireFlow/
└── backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py                 # FastAPI application, CORS, lifespan & error handlers
    │   ├── core/
    │   │   ├── config.py           # Pydantic BaseSettings & environment variables
    │   │   └── database.py         # SQLAlchemy engine, session maker, get_db dependency
    │   ├── models/                 # SQLAlchemy ORM database models
    │   │   ├── candidate.py        # Candidate, Resume, CandidateSkill, Experience, Education
    │   │   ├── job.py              # JobDescription, JobRequirement
    │   │   └── evaluation.py       # CandidateJobMatch, RequirementEvidence, Interview models
    │   ├── schemas/                # Pydantic schemas (Request/Response validation)
    │   │   ├── candidate.py
    │   │   ├── job.py
    │   │   ├── matching.py
    │   │   ├── interview.py
    │   │   └── search.py
    │   ├── services/               # AI & business logic layer
    │   │   ├── pdf_service.py      # PyMuPDF text & page extraction with citation index
    │   │   ├── llm_service.py      # OpenAI JSON client with offline fallback modes
    │   │   ├── candidate_service.py# Candidate profile & summary generator
    │   │   ├── job_service.py      # Job description & requirements parsing
    │   │   ├── matching_service.py # Grounded requirement matching with page evidence
    │   │   ├── interview_service.py# AI questions, notes analysis & evaluation scorecard
    │   │   └── search_service.py   # Natural language search intent & candidate ranking
    │   ├── api/                    # REST API endpoints (v1)
    │   │   ├── router.py           # Master router aggregating subrouters
    │   │   └── v1/
    │   │       ├── resumes.py      # Upload PDF & automated extraction
    │   │       ├── candidates.py   # Candidate management & summaries
    │   │       ├── jobs.py         # Job description processing
    │   │       ├── matching.py     # Candidate-to-job matching & evidence
    │   │       ├── interviews.py   # Interview intelligence & evaluation
    │   │       └── search.py       # Natural-language candidate search
    │   └── utils/
    │       └── text_cleaner.py     # Text cleaning & quotation page locator
    ├── uploads/                    # Local storage for uploaded PDF resumes
    ├── tests/                      # Automated test suite
    │   ├── test_pdf.py             # PyMuPDF extraction tests
    │   └── test_api.py             # End-to-end integration tests for all 12 modules
    ├── .env.example                # Template configuration
    ├── .env                        # Local environment configuration
    ├── requirements.txt            # Python dependencies
    └── README.md                   # Documentation & integration guide
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+ installed
- (Optional) PostgreSQL database (defaults to instant SQLite `sqlite:///./hireflow.db` if PostgreSQL is not specified)

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to configure your keys:
```env
PROJECT_NAME="HireFlow API"
DATABASE_URL="sqlite:///./hireflow.db" # Or postgresql+psycopg2://postgres:postgres@localhost:5432/hireflow
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"
CORS_ORIGINS="http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
```

> **Note**: If `OPENAI_API_KEY` is not provided or set to a placeholder, HireFlow runs in intelligent offline fallback mode with realistic domain data, ensuring zero crashes during local UI development or hackathon staging!

### 4. Run Development Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```

- **Interactive API Docs (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative Docs (ReDoc)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 🧪 Running Tests

Run the full automated test suite covering all 12 core backend modules:
```bash
python -m pytest -v
```

---

## 📡 Core API Modules & Endpoints

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **1. Resume Upload** | `POST` | `/api/v1/resumes/upload` | Upload PDF, extract clean text via PyMuPDF, parse candidate & skills |
| **2. Job Processing** | `POST` | `/api/v1/jobs/` | Process raw JD text into categorized, weighted requirements |
| **3. Candidate Info** | `GET` | `/api/v1/candidates/{id}` | Get structured candidate profile with skills, experience, education |
| **4. Candidate List** | `GET` | `/api/v1/candidates/` | List all candidates |
| **5. Job Requirements** | `GET` | `/api/v1/jobs/{id}` | Get job details and granular requirements (must-have, nice-to-have) |
| **6 & 7. Matching & Evidence** | `POST` | `/api/v1/match` | Map candidate against JD requirements with **exact quote & page citation** |
| **6. Job Ranking** | `GET` | `/api/v1/matches/job/{job_id}` | Get all candidates ranked by match score for a job |
| **8. Candidate Summary** | `GET` | `/api/v1/candidates/{id}/summary` | AI-generated executive candidate summary & key strengths |
| **9. Interview Questions** | `POST` | `/api/v1/interviews/generate-questions` | Generate role-specific questions targeting candidate qualification gaps |
| **10. Interview Notes** | `POST` | `/api/v1/interviews/sessions/{id}/notes` | Ingest interviewer notes and compute sentiment/observations |
| **11. Evaluation Report** | `POST` | `/api/v1/interviews/sessions/{id}/evaluate` | Synthesize notes into executive scorecard and hire recommendation |
| **12. Natural Language Search** | `POST` | `/api/v1/search/` | Search candidates using conversational English queries |

---

## 💻 Frontend (React / Vite) Integration Examples

### 1. Upload Resume PDF
```typescript
const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:8000/api/v1/resumes/upload", {
    method: "POST",
    body: formData,
  });
  return await res.json();
};
```

### 2. Match Candidate to Job (with Source Citations)
```typescript
const matchCandidate = async (candidateId: number, jobId: number) => {
  const res = await fetch("http://127.0.0.1:8000/api/v1/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate_id: candidateId, job_id: jobId }),
  });
  const data = await res.json();
  
  // Contains:
  // data.overall_match_score (e.g. 88.5)
  // data.evidence_items: [
  //   {
  //      requirement_text: "Proficiency in Python...",
  //      status: "fully_met",
  //      evidence_quote: "5 years building Python APIs...",
  //      source_page: 1
  //   }
  // ]
  return data;
};
```

### 3. Natural Language Search
```typescript
const searchCandidates = async (query: string) => {
  const res = await fetch("http://127.0.0.1:8000/api/v1/search/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return await res.json();
};
```
