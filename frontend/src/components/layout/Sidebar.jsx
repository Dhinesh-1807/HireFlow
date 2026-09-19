import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UploadCloud,
  MessageSquareText,
  FileCheck2,
  Search,
  Settings,
  Sparkles,
  ShieldCheck,
  LogOut,
  UserCheck,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/jobs", label: "Jobs", icon: Briefcase },
    { to: "/resumes", label: "Resume Upload", icon: UploadCloud },
    { to: "/candidates", label: "Candidates", icon: Users },
    { to: "/interviews", label: "Interviews", icon: MessageSquareText },
    { to: "/evaluations", label: "Evaluations", icon: FileCheck2 },
    { to: "/search", label: "Search", icon: Search },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("hireflow_token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-200"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 sm:w-64 max-w-[85vw] bg-white text-slate-800 flex flex-col border-r border-slate-200 transition-transform duration-250 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none ${
          isOpen ? "translate-x-0 z-50" : "-translate-x-full z-40"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-5 sm:px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900 tracking-tight">HireFlow</span>
                <span className="text-[10px] font-semibold uppercase bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200">
                  AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Recruitment Intelligence</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-2 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-sky-100 text-sky-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-sky-600" : "text-slate-400 group-hover:text-sky-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Recruiter Review Principle Reminder Card */}
          <div className="pt-6 px-2">
            <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100">
              <div className="flex items-center gap-2 text-sky-700 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Human-In-The-Loop</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                AI extracts evidence and missing data. Final decisions require recruiter validation.
              </p>
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-100 shrink-0 bg-white">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">Recruiter Admin</p>
                <p className="text-[11px] text-slate-500 truncate">recruiter@hireflow.ai</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
