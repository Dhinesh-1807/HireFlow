import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Save,
  FileCheck2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

export default function Interviews() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const candidateId = searchParams.get("candidate") || "c-101";

  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState("");
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    api.getCandidate(candidateId).then((data) => {
      setCandidate(data);
      setNotes(
        "Candidate confirmed handling 15k req/sec at Stripe during Black Friday. Used Kafka topic partitioning by user_id to maintain ordering. For Kubernetes, they wrote Helm charts but cluster administration was managed by Platform team."
      );
    });
  }, [candidateId]);

  const handleSaveNotes = async () => {
    await api.saveInterviewNotes(candidateId, notes);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const handleGenerateEvaluation = () => {
    navigate(`/evaluations?candidate=${candidateId}`);
  };

  if (!candidate) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading interview...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interview Intelligence & Notes</h2>
          <p className="text-xs text-slate-500 mt-1">
            Interviewing: <span className="font-semibold text-slate-800">{candidate.name}</span> ({candidate.role})
          </p>
        </div>
        <button
          onClick={handleGenerateEvaluation}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/20 transition-all duration-150"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Generate Evaluation Report</span>
        </button>
      </div>

      {/* AI-Generated Target Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              AI-Generated Interview Questions (Evidence Validation)
            </h3>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md">
            Auditable Probes
          </span>
        </div>

        <div className="space-y-3">
          {candidate.suggestedQuestions?.map((q) => (
            <div
              key={q.id}
              className="p-3.5 sm:p-4 rounded-xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50/80 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded-md border border-sky-200">
                  {q.category}
                </span>
                <span className="text-[11px] text-slate-500">
                  Target: {q.targetRequirement}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 mt-2 leading-relaxed">
                {q.question}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter Live Interview Notes Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interviewer Notes & Evidence Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record answers to validate or refute claims from the resume analysis.
            </p>
          </div>
          {savedStatus && (
            <span className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Notes Saved!
            </span>
          )}
        </div>

        <textarea
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record candidate responses and observations..."
          className="w-full p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none leading-relaxed transition-all"
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <span className="text-[11px] sm:text-xs text-slate-400">
            Notes will be synthesized into the final structured evaluation report.
          </span>
          <button
            onClick={handleSaveNotes}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg shadow-xs transition-all duration-150"
          >
            <Save className="w-3.5 h-3.5 text-sky-600" />
            <span>Save Interview Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
