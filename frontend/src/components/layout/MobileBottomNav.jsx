import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UploadCloud,
  Menu,
} from "lucide-react";

export default function MobileBottomNav({ onOpenMenu }) {
  const navTabs = [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/jobs", label: "Jobs", icon: Briefcase },
    { to: "/candidates", label: "Candidates", icon: Users },
    { to: "/resumes", label: "Upload", icon: UploadCloud },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden print:hidden shadow-lg shadow-slate-900/5 safe-area-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors py-1 ${
                  isActive
                    ? "text-sky-600 font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-lg transition-all ${
                      isActive ? "bg-sky-100 text-sky-600" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full" />
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Menu button to open sidebar drawer */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 transition-colors py-1"
          aria-label="Open menu drawer"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100 transition-all">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
