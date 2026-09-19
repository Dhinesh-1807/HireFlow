import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Plus,
  UploadCloud,
  Bell,
  Server,
} from "lucide-react";
import api from "../../services/api";

export default function Header({ onMenuClick, title = "Dashboard Overview", subtitle }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isBackendLive, setIsBackendLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.checkHealth().then((health) => {
      if (isMounted) {
        setIsBackendLive(!!health);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Hamburger + Titles */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h1>
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
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-150"
          />
        </div>
      </form>

      {/* Right side: Actions & Status */}
      <div className="flex items-center gap-2.5">
        {/* Backend Status Badge */}
        {isBackendLive ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FastAPI: Connected</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Demo Mock Mode</span>
          </div>
        )}

        {/* Upload Resumes Button */}
        <button
          onClick={() => navigate("/resumes")}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-sky-700 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 hover:border-sky-300 shadow-sm transition-all duration-150"
        >
          <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
          <span>Upload Resumes</span>
        </button>

        {/* New Job Primary Sky-Blue Button */}
        <button
          onClick={() => navigate("/jobs?action=new")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/20 transition-all duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Job</span>
        </button>

        {/* Notification indicator */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
