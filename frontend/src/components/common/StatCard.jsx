import React from "react";

export default function StatCard({ title, value, change, icon: Icon, color = "sky", subtitle }) {
  const colorMap = {
    sky: {
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100",
    },
    cyan: {
      bg: "bg-sky-100/70",
      text: "text-sky-500",
      border: "border-sky-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
    },
    purple: {
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100",
    },
    indigo: {
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100",
    },
  };

  const currentTheme = colorMap[color] || colorMap.sky;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover hover:border-sky-300 transition-all duration-200 group hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border} transition-colors group-hover:bg-sky-100/80`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {change && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
