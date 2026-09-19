import axios from "axios";
import {
  mockDashboardStats,
  mockRecentCandidates,
  mockRecentActivity,
  mockJobs,
} from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach auth token if available in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("hireflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Centralized API Service for HireFlow
 * Provides methods for authentication, job management, resume ingestion,
 * requirement-evidence mapping, interview preparation, and evaluation reports.
 */
export const api = {
  // Authentication
  async login(credentials) {
    try {
      const response = await apiClient.post("/api/auth/login", credentials);
      return response.data;
    } catch {
      // Realistic mock fallback
      console.warn("Backend API not reachable. Using mock authentication.");
      const mockUser = {
        token: "mock-jwt-token-hireflow",
        user: {
          id: "user-1",
          name: "Recruiter Admin",
          email: credentials.email || "recruiter@hireflow.ai",
          role: "Lead Technical Recruiter",
        },
      };
      localStorage.setItem("hireflow_token", mockUser.token);
      return mockUser;
    }
  },

  // Dashboard Stats & Activity
  async getDashboardData() {
    try {
      const response = await apiClient.get("/api/dashboard");
      return response.data;
    } catch {
      return {
        stats: mockDashboardStats,
        recentCandidates: mockRecentCandidates,
        recentActivity: mockRecentActivity,
      };
    }
  },

  // Jobs
  async getJobs() {
    try {
      const response = await apiClient.get("/api/jobs");
      return response.data;
    } catch {
      return mockJobs;
    }
  },

  async createJob(jobData) {
    try {
      const response = await apiClient.post("/api/jobs", jobData);
      return response.data;
    } catch {
      return { id: `job-${Date.now()}`, ...jobData, status: "Active", candidatesCount: 0 };
    }
  },

  async uploadJobDescription(formData) {
    try {
      const response = await apiClient.post("/api/jobs/upload-jd", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch {
      return {
        success: true,
        extractedJob: {
          title: "Senior AI Full Stack Engineer",
          requiredSkills: ["React", "FastAPI", "PostgreSQL", "LangChain"],
          experienceMin: "4+ years",
          education: "Bachelor's Degree in Computer Science or related field",
        },
      };
    }
  },

  // Resumes
  async uploadResumes(formData, onProgress) {
    try {
      const response = await apiClient.post("/api/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch {
      return {
        success: true,
        filesUploaded: 3,
        candidatesQueued: ["Alex Rivera.pdf", "Priya Sharma.pdf", "Marcus Chen.pdf"],
        message: "Resumes received and queued for AI requirement matching",
      };
    }
  },

  // Candidates
  async getCandidates(params = {}) {
    try {
      const response = await apiClient.get("/api/candidates", { params });
      return response.data;
    } catch {
      return mockRecentCandidates;
    }
  },

  async getCandidate(id) {
    try {
      const response = await apiClient.get(`/api/candidates/${id}`);
      return response.data;
    } catch {
      const found = mockRecentCandidates.find((c) => c.id === id) || mockRecentCandidates[0];
      return {
        ...found,
        // Detailed Requirement Mapping
        requirements: [
          {
            id: "req-1",
            title: "5+ years backend systems architecture in Python / FastAPI",
            status: "EVIDENCE_FOUND",
            confidence: "High",
            evidence:
              "Engineered high-throughput event processing pipelines handling 15k req/sec with FastAPI and Kafka across 4 years at Stripe.",
            source: "Resume: Work Experience - Stripe (2022-2026)",
          },
          {
            id: "req-2",
            title: "PostgreSQL query optimization & relational schema modeling",
            status: "EVIDENCE_FOUND",
            confidence: "High",
            evidence:
              "Optimized database connection pools and partitioned tables resulting in 40% p99 latency reduction.",
            source: "Resume: Work Experience - Stripe (2022-2026)",
          },
          {
            id: "req-3",
            title: "Hands-on experience deploying to Kubernetes clusters",
            status: "NEEDS_VALIDATION",
            confidence: "Medium",
            evidence:
              "Mentions Docker and containerized builds, but specific Kubernetes manifest authoring or cluster operations are vague.",
            source: "Resume: Skills & Tools section",
          },
          {
            id: "req-4",
            title: "Team mentorship or engineering tech leadership",
            status: "MISSING_INFO",
            confidence: "Unverified",
            evidence:
              "No explicit mention of junior engineer mentorship or agile sprint leadership found in resume text.",
            source: "Entire Document",
          },
        ],
        // Interview Questions Pre-generated
        suggestedQuestions: [
          {
            id: "q-1",
            category: "Architecture & Evidence Validation",
            question:
              "You mentioned handling 15k req/sec with FastAPI and Kafka at Stripe. How did you handle backpressure and consumer lag during traffic spikes?",
            targetRequirement: "5+ years backend systems architecture",
          },
          {
            id: "q-2",
            category: "Addressing Missing Information",
            question:
              "Can you walk us through your hands-on experience with Kubernetes production deployments and helm chart maintenance?",
            targetRequirement: "Hands-on experience deploying to Kubernetes",
          },
          {
            id: "q-3",
            category: "Leadership & Collaboration",
            question:
              "Describe a scenario where you led a cross-functional technical project or mentored other backend engineers.",
            targetRequirement: "Team mentorship or engineering tech leadership",
          },
        ],
      };
    }
  },

  async analyzeCandidate(candidateId) {
    try {
      const response = await apiClient.post(`/api/candidates/${candidateId}/analyze`);
      return response.data;
    } catch {
      return {
        status: "success",
        candidateId,
        message: "Requirement-evidence mapping completed.",
      };
    }
  },

  // Interviews
  async generateInterviewQuestions(candidateId) {
    try {
      const response = await apiClient.post(
        `/api/candidates/${candidateId}/generate-questions`
      );
      return response.data;
    } catch {
      return {
        candidateId,
        generatedAt: new Date().toISOString(),
        questions: [
          {
            id: "q-gen-1",
            category: "Technical Deep Dive",
            question: "How did you design error handling and idempotency in distributed microservices?",
            purpose: "Validates resilience claims in resume.",
          },
          {
            id: "q-gen-2",
            category: "Missing Skill Verification",
            question: "Have you worked with Kubernetes statefulsets or service meshes directly?",
            purpose: "Checks requirement not documented in CV.",
          },
        ],
      };
    }
  },

  async saveInterviewNotes(candidateId, notes) {
    try {
      const response = await apiClient.post(`/api/interviews/${candidateId}/notes`, {
        notes,
      });
      return response.data;
    } catch {
      return { success: true, candidateId, savedAt: new Date().toISOString() };
    }
  },

  // Evaluations
  async generateEvaluation(candidateId) {
    try {
      const response = await apiClient.post(`/api/evaluations/${candidateId}/generate`);
      return response.data;
    } catch {
      return {
        candidateId,
        evaluationReport: {
          summary:
            "Candidate demonstrated deep expertise in FastAPI and distributed systems during technical probes. Leadership experience was clarified during the interview as acting squad lead for 6 months.",
          evidenceFound: [
            "Provided granular breakdown of Kafka partition keys and deduplication strategies.",
            "Demonstrated clear understanding of PostgreSQL MVCC and indexing trade-offs.",
          ],
          areasValidatedInInterview: [
            "Kubernetes: Has practical exposure writing deployment manifests, though cluster admin was handled by DevOps.",
            "Mentorship: Guided 2 junior developers through onboarding and code reviews.",
          ],
          unresolvedConcerns: [
            "Limited experience with multi-region database replication.",
          ],
          recruiterRecommendation: "Proceed to Technical Final Round",
        },
      };
    }
  },

  // Natural Language Candidate Search
  async searchCandidates(query) {
    try {
      const response = await apiClient.get("/api/search", { params: { q: query } });
      return response.data;
    } catch {
      const q = query.toLowerCase();
      return mockRecentCandidates.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
  },
};

export default api;
