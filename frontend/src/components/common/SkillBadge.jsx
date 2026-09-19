import React from "react";

export default function SkillBadge({ skill }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors">
      {skill}
    </span>
  );
}
