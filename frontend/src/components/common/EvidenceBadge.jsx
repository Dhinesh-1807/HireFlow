import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export default function EvidenceBadge({ type, count, label }) {
  if (type === "evidence" || type === "EVIDENCE_FOUND" || type === "fully_met") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>{count !== undefined ? `${count} Evidence` : label || "Evidence Found"}</span>
      </span>
    );
  }

  if (type === "missing" || type === "MISSING_INFO" || type === "unmet") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>{count !== undefined ? `${count} Missing` : label || "Missing Info"}</span>
      </span>
    );
  }

  // validation / NEEDS_VALIDATION / partially_met
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-sm">
      <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>{count !== undefined ? `${count} To Validate` : label || "Requires Validation"}</span>
    </span>
  );
}
