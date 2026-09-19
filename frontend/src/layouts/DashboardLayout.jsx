import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page header title & subtitle based on path
  const getPageMeta = () => {
    const path = location.pathname;
    if (path.startsWith("/jobs")) {
      return { title: "Job Descriptions", subtitle: "Define role requirements and competencies" };
    }
    if (path.startsWith("/resumes")) {
      return { title: "Resume Upload", subtitle: "Batch ingest PDF resumes for AI parsing" };
    }
    if (path.startsWith("/candidates")) {
      return { title: "Candidate Intelligence", subtitle: "Requirement-matched candidate profiles & evidence" };
    }
    if (path.startsWith("/interviews")) {
      return { title: "Interview Intelligence", subtitle: "AI-generated questions & structured interview notes" };
    }
    if (path.startsWith("/evaluations")) {
      return { title: "Evaluation Reports", subtitle: "Auditable evidence summaries & recruiter decisions" };
    }
    if (path.startsWith("/search")) {
      return { title: "Candidate Search", subtitle: "Natural language criteria and skill discovery" };
    }
    if (path.startsWith("/settings")) {
      return { title: "System Settings", subtitle: "API configuration and recruitment thresholds" };
    }
    return { title: "Dashboard Overview", subtitle: "Candidate screening pipeline and evidence metrics" };
  };

  const meta = getPageMeta();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
