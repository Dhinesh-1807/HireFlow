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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white tracking-tight">HireFlow</span>
                <span className="text-[10px] font-semibold uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Recruitment Intelligence</p>
            </div>
          </div>
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
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Recruiter Review Principle Reminder Card */}
          <div className="pt-6 px-2">
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Human-In-The-Loop</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AI extracts evidence and missing data. Final decisions require recruiter validation.
              </p>
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">Recruiter Admin</p>
                <p className="text-[11px] text-slate-400 truncate">recruiter@hireflow.ai</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
