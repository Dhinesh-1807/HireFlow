import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Plus,
  UploadCloud,
  Bell,
  Sparkles,
  Server,
} from "lucide-react";

export default function Header({ onMenuClick, title = "Dashboard", subtitle }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Hamburger + Titles */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Middle: Natural language quick search */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center flex-1 max-w-md mx-4"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by skill, experience, or requirement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </form>

      {/* Right side: Actions & Status */}
      <div className="flex items-center gap-2.5">
        {/* Backend / AI Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Server className="w-3 h-3" />
          <span>API Ready</span>
        </div>

        {/* Upload Resumes Quick Button */}
        <button
          onClick={() => navigate("/resumes")}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
          <span>Upload Resumes</span>
        </button>

        {/* Create Job Primary Button */}
        <button
          onClick={() => navigate("/jobs?action=new")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Job</span>
        </button>

        {/* Notification indicator */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
