import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Printer,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

export default function Evaluations() {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate") || "c-101";

  const [evaluation, setEvaluation] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [recruiterDecision, setRecruiterDecision] = useState("Advance to Final Round");

  useEffect(() => {
    Promise.all([
      api.getCandidate(candidateId),
      api.generateEvaluation(candidateId),
    ]).then(([candData, evalData]) => {
      setCandidate(candData);
      setEvaluation(evalData.evaluationReport);
    });
  }, [candidateId]);

  if (!evaluation || !candidate) {
    return (
      <div className="text-center py-20 text-xs text-slate-400">
        Synthesizing interview evaluation report...
      </div>
    );
  }

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Structured Evaluation Report</h2>
          <p className="text-xs text-slate-500 mt-1">
            Candidate: <span className="font-semibold text-slate-800">{candidate.name}</span> • Role: {candidate.role}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>

      {/* Human Recruiter Decision Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Human Recruiter Final Determination
              </h3>
              <p className="text-xs text-slate-500">
                AI provides structured evidence synthesis. The hiring action is strictly your human decision.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={recruiterDecision}
              onChange={(e) => setRecruiterDecision(e.target.value)}
              className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg px-3 py-2 outline-none"
            >
              <option value="Advance to Final Round">Advance to Final Round</option>
              <option value="Hold for Follow-up">Hold for Follow-up</option>
              <option value="Route to Different Role">Route to Different Role</option>
              <option value="Not Moving Forward">Not Moving Forward</option>
            </select>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interview Synthesis Summary
          </h4>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {evaluation.summary}
          </p>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Confirmed Evidence */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Evidence Confirmed</span>
            </div>
            <ul className="text-[11px] text-emerald-800/90 space-y-1.5 list-disc list-inside">
              {evaluation.evidenceFound?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Validated in Interview */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Validated During Interview</span>
            </div>
            <ul className="text-[11px] text-amber-800/90 space-y-1.5 list-disc list-inside">
              {evaluation.areasValidatedInInterview?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Unresolved / Missing */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Unresolved Gaps</span>
            </div>
            <ul className="text-[11px] text-rose-800/90 space-y-1.5 list-disc list-inside">
              {evaluation.unresolvedConcerns?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
