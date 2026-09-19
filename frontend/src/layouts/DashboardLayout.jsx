import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import MobileBottomNav from "../components/layout/MobileBottomNav";

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
    <div className="h-screen w-full flex overflow-hidden bg-slate-50">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area - only this container scrolls vertically */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto lg:ml-64 min-w-0">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
}
