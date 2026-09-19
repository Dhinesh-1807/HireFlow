import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MessageSquareText,
  Save,
  FileCheck2,
  Sparkles,
  HelpCircle,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Interview Intelligence & Notes</h2>
          <p className="text-xs text-slate-500 mt-1">
            Interviewing: <span className="font-semibold text-slate-800">{candidate.name}</span> ({candidate.role})
          </p>
        </div>
        <button
          onClick={handleGenerateEvaluation}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Generate Evaluation Report</span>
        </button>
      </div>

      {/* AI-Generated Target Questions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              AI-Generated Interview Questions (Targeting Ambiguity & Evidence)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            Auditable Probes
          </span>
        </div>

        <div className="space-y-3">
          {candidate.suggestedQuestions?.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {q.category}
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: {q.targetRequirement}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 mt-2">
                {q.question}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter Live Interview Notes Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interviewer Notes & Evidence Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record answers to validate or refute claims from the resume analysis.
            </p>
          </div>
          {savedStatus && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Notes Saved!
            </span>
          )}
        </div>

        <textarea
          rows={7}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record candidate responses and observations..."
          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed"
        />

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400">
            Notes will be synthesized into the final structured evaluation report.
          </span>
          <button
            onClick={handleSaveNotes}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Interview Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
