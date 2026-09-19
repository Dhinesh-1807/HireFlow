import React, { useState } from "react";
import { Server, Shield, Database, Save, Check } from "lucide-react";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || "http://localhost:8000");
  const [modelType, setModelType] = useState("FastAPI Backend / LLM Pipeline");
  const [strictMode, setStrictMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & API Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure FastAPI backend endpoints, AI evidence extraction parameters, and recruiter preferences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-sky-600" />
              <span>FastAPI Backend URL</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Local or remote endpoint for resume parsing and question generation.
            </p>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="mt-1.5 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Evidence Extraction Pipeline</span>
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="mt-1.5 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:bg-white focus:border-sky-500 transition-all"
            >
              <option value="FastAPI Backend / LLM Pipeline">FastAPI Backend (RAG / LLM Extractor)</option>
              <option value="Offline Mock Mode">Offline Demonstration Mode (Deterministic)</option>
            </select>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span>Strict Human-Review Guardrails</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Prevent AI from issuing automated rejection/offer decisions without explicit recruiter sign-off.
                </p>
              </div>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Settings saved successfully!
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/20 transition-all duration-150"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
