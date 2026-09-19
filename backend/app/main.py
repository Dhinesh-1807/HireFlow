import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import Base, engine
import app.models  # Ensure all models are registered
from app.api.router import api_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("hireflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables are created
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
    yield
    # Shutdown
    logger.info("HireFlow API shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# HireFlow API 🚀
AI-powered Candidate Screening & Interview Intelligence Agent for recruitment teams.

### Core Capabilities:
1. **Resume Processing**: PyMuPDF-based text extraction with page citations.
2. **Job Description Parsing**: Granular requirement extraction with weighting & categorization.
3. **Candidate Profiles**: Extraction of structured experience, skills, contact info, and summaries.
4. **Candidate-to-Job Matching**: Multi-dimensional scoring with verbatim evidence snippets and source page references.
5. **Interview Intelligence**: AI question generation, interviewer notes analysis, and evaluation reports.
6. **Natural-Language Search**: Query candidate database using conversational natural language.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for seamless integration with React / Vite frontends
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please verify backend logs."},
    )


# Root health check endpoint
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to HireFlow AI Screening & Interview Intelligence API",
        "status": "online",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
    }


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)
