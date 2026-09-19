# HireFlow Frontend 🚀

AI-powered Candidate Screening & Interview Intelligence Platform built for Hackathons.

## 🛠️ Tech Stack
- **React 19** + **Vite**
- **Tailwind CSS** (Custom theme & components)
- **React Router v7**
- **Lucide Icons**
- **Axios** (Centralized API client with offline mock fallback)

## 📁 Architecture & Highlights
- **Human-In-The-Loop Architecture:** Emphasizes evidence-based requirement mapping, missing information flagging, and interview probe questions rather than opaque automated rejections.
- **Three-Pillar Evidence Indicators:**
  - 🟢 **Evidence Found:** Concrete quotes & source references from candidate CVs.
  - 🟡 **Requires Validation:** Ambiguous points queued for interview probes.
  - 🔴 **Missing Information:** Requirements absent from CV text.
- **Centralized API Client (`src/services/api.js`):** Fully integrated with fallback mock data, enabling offline development or live FastAPI backend connection via `VITE_API_URL`.

## 🚀 Getting Started

### 1. Navigate to frontend
```bash
cd frontend
```

### 2. Install Dependencies (if not already installed)
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell
cp .env.example .env
```
Default configuration:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
```
