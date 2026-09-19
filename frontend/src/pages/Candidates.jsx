import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  Eye,
} from "lucide-react";
import EvidenceBadge from "../components/common/EvidenceBadge";
import SkillBadge from "../components/common/SkillBadge";
import api from "../services/api";

export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  useEffect(() => {
    api.getCandidates().then(setCandidates);
  }, []);

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || c.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roles = ["ALL", ...new Set(candidates.map((c) => c.role))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Screening & Intelligence</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review requirement proof, missing criteria, and validation flags before scheduling interviews.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by name, skill, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter Role:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 outline-none focus:border-sky-500 transition-colors"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === "ALL" ? "All Roles" : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates List / Cards */}
      <div className="space-y-4">
        {filtered.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover hover:border-sky-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            {/* Left: Bio & Skills */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">{candidate.name}</h3>
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                  {candidate.role}
                </span>
                <span className="text-xs text-slate-400">
                  {candidate.experienceYears} yrs experience
                </span>
              </div>

              <p className="text-xs text-slate-600 italic">
                "{candidate.topEvidence}"
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {candidate.skills.map((s) => (
                  <SkillBadge key={s} skill={s} />
                ))}
              </div>
            </div>

            {/* Middle: Three-pillar Requirement Badges */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Requirement Evidence
              </div>
              <div className="flex flex-wrap gap-2">
                <EvidenceBadge type="evidence" count={candidate.evidenceFoundCount} />
                {candidate.requiresValidationCount > 0 && (
                  <EvidenceBadge type="validation" count={candidate.requiresValidationCount} />
                )}
                {candidate.missingInfoCount > 0 && (
                  <EvidenceBadge type="missing" count={candidate.missingInfoCount} />
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="shrink-0 flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
              <button
                onClick={() => navigate(`/candidates/${candidate.id}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-sky-700 hover:text-white hover:bg-sky-500 bg-sky-50 border border-sky-200 rounded-lg transition-all duration-150"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Evidence & Detail</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs shadow-card">
            No candidates matched your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
