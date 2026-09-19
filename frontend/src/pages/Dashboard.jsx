import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  FileCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  UploadCloud,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import StatCard from "../components/common/StatCard";
import EvidenceBadge from "../components/common/EvidenceBadge";
import SkillBadge from "../components/common/SkillBadge";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentCandidates: [],
    recentActivity: [],
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const { stats = {}, recentCandidates = [], recentActivity = [] } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Recruiter Intelligence Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Assisted Evidence Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Screen with Evidence, Not Keyword Guesses.
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            HireFlow maps candidate resumes directly against your job requirements, extracting concrete proof, flagging missing competencies, and preparing interview questions for human recruiter validation.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/resumes")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Resumes</span>
            </button>
            <button
              onClick={() => navigate("/jobs?action=new")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Description</span>
            </button>
            <button
              onClick={() => navigate("/candidates")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-transparent hover:bg-white/5 text-slate-300 transition-all"
            >
              <span>Explore All Candidates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs ?? 6}
          change={`${stats.activeJobs ?? 4} Active`}
          subtitle="Roles currently receiving applicants"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates ?? 34}
          change="+8 this week"
          subtitle="Resumes parsed and indexed"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Candidates Analyzed"
          value={stats.candidatesAnalyzed ?? 29}
          change={`${stats.evidenceVerifiedRate ?? "82%"} verified`}
          subtitle="Requirement mappings generated"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Interviews Pending"
          value={stats.interviewsPending ?? 8}
          change="Needs Recruiter Note"
          subtitle="Questions ready for interviewer"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* AI Philosophy & Three-Pillar Evidence Indicator */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Evidence-First Screening Principle</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              HireFlow never produces opaque single-number scores. Every match is grounded in verifiable resume excerpts.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Recruiter Review Status:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Audit-Ready
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">1. Evidence Found</div>
              <p className="text-[11px] text-emerald-800/80 mt-1 leading-relaxed">
                Direct textual proof in projects, responsibilities, and quantified achievements matching JD requirements.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <div className="p-2 rounded-md bg-amber-100 text-amber-700 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">2. Requires Validation</div>
              <p className="text-[11px] text-amber-800/80 mt-1 leading-relaxed">
                Ambiguous claims or general mentions. HireFlow generates targeted probe questions for the interview.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200/80 flex items-start gap-3">
            <div className="p-2 rounded-md bg-rose-100 text-rose-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900">3. Missing Information</div>
              <p className="text-[11px] text-rose-800/80 mt-1 leading-relaxed">
                Criteria not found in the CV. Recruiters quickly see gaps before committing interview hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Candidates & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Candidates Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Candidate Intelligence</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated candidates with requirement evidence breakdown
              </p>
            </div>
            <Link
              to="/candidates"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all ({recentCandidates.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role Applied</th>
                  <th className="py-3 px-4">Requirement Mapping</th>
                  <th className="py-3 px-4">Key Skills</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {candidate.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{candidate.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{candidate.role}</div>
                      <div className="text-[11px] text-slate-400">
                        {candidate.experienceYears} yrs experience
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <EvidenceBadge type="evidence" count={candidate.evidenceFoundCount} />
                        {candidate.requiresValidationCount > 0 && (
                          <EvidenceBadge
                            type="validation"
                            count={candidate.requiresValidationCount}
                          />
                        )}
                        {candidate.missingInfoCount > 0 && (
                          <EvidenceBadge type="missing" count={candidate.missingInfoCount} />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {candidate.skills.slice(0, 3).map((s) => (
                          <SkillBadge key={s} skill={s} />
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Timeline */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audit trail of pipeline events</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="mt-4 space-y-4 flex-1">
            {recentActivity.map((activity, idx) => (
              <div key={activity.id} className="relative flex gap-3">
                {/* Timeline vertical connector */}
                {idx !== recentActivity.length - 1 && (
                  <span
                    className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 z-10">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {activity.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {activity.description}
                  </p>
                  <div className="mt-1.5">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {activity.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate("/search")}
              className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Search Candidate Database</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
