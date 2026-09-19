import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquareText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  ExternalLink,
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate("/candidates")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Database</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/interviews?candidate=${candidate.id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Generate Interview Questions</span>
          </button>
        </div>
      </div>

      {/* Candidate Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{candidate.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {candidate.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {candidate.role} • {candidate.experienceYears} Years Experience • {candidate.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
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

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>AI Screening Assessment (Auditable)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {candidate.overallAssessment}
            </p>
          </div>
        </div>
      </div>

      {/* Requirement Mapping Table / Deep Dive */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Target Requirement Evidence Mapping
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact quotes and source references parsed from the candidate's PDF resume.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {candidate.requirements?.length || 0} Requirements Mapped
          </span>
        </div>

        <div className="space-y-4">
          {candidate.requirements?.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-xl border transition-all ${
                req.status === "EVIDENCE_FOUND"
                  ? "bg-emerald-50/40 border-emerald-200"
                  : req.status === "NEEDS_VALIDATION"
                  ? "bg-amber-50/40 border-amber-200"
                  : "bg-rose-50/40 border-rose-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div className="font-semibold text-xs text-slate-900 flex items-center gap-2">
                  <span>Requirement:</span>
                  <span className="text-slate-700">{req.title}</span>
                </div>
                <EvidenceBadge type={req.status} />
              </div>

              <div className="mt-2 text-xs text-slate-700 bg-white/80 p-3 rounded-lg border border-slate-200/60 space-y-1.5">
                <div className="font-medium text-slate-900">Extracted Proof / Analysis:</div>
                <p className="italic text-slate-600">"{req.evidence}"</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
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
