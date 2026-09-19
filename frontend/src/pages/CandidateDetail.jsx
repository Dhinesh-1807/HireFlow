import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquareText,
  FileText,
  ShieldCheck,
} from "lucide-react";
import EvidenceBadge from "../components/common/EvidenceBadge";
import SkillBadge from "../components/common/SkillBadge";
import api from "../services/api";

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCandidate(id).then((data) => {
      setCandidate(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !candidate) {
    return (
      <div className="text-center py-20 text-xs text-slate-400">
        Loading candidate intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={() => navigate("/candidates")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Database</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/interviews?candidate=${candidate.id}`)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/20 transition-all duration-150"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Generate Interview Questions</span>
          </button>
        </div>
      </div>

      {/* Candidate Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{candidate.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {candidate.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {candidate.role} • {candidate.experienceYears} Years Experience • {candidate.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EvidenceBadge type="evidence" count={candidate.evidenceFoundCount} />
            <EvidenceBadge type="validation" count={candidate.requiresValidationCount} />
            <EvidenceBadge type="missing" count={candidate.missingInfoCount} />
          </div>
        </div>

        {/* Skills & Summary */}
        <div className="mt-5 space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Identified Skills in Resume
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {candidate.skills?.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>

          <div className="bg-sky-50/50 rounded-xl p-3.5 sm:p-4 border border-sky-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>AI Screening Assessment (Auditable)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {candidate.overallAssessment}
            </p>
          </div>
        </div>
      </div>

      {/* Requirement Mapping Table / Deep Dive */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Target Requirement Evidence Mapping
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact quotes and source references parsed from the candidate's PDF resume.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            {candidate.requirements?.length || 0} Requirements Mapped
          </span>
        </div>

        <div className="space-y-4">
          {candidate.requirements?.map((req) => (
            <div
              key={req.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                req.status === "EVIDENCE_FOUND" || req.status === "fully_met"
                  ? "bg-emerald-50/40 border-emerald-200"
                  : req.status === "NEEDS_VALIDATION" || req.status === "partially_met"
                  ? "bg-amber-50/40 border-amber-200"
                  : "bg-rose-50/40 border-rose-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div className="font-semibold text-xs text-slate-900 flex items-center gap-2">
                  <span className="text-slate-500">Requirement:</span>
                  <span className="text-slate-800">{req.title}</span>
                </div>
                <div className="self-start sm:self-auto">
                  <EvidenceBadge type={req.status} />
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-700 bg-white p-3 sm:p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                <div className="font-semibold text-slate-900">Extracted Proof / Analysis:</div>
                <p className="italic text-slate-600">"{req.evidence}"</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  <span>Source: {req.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
