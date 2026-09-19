import React, { useState, useEffect } from "react";
import { Plus, Briefcase, Users, Calendar, Sparkles, Check, ArrowRight } from "lucide-react";
import SkillBadge from "../components/common/SkillBadge";
import api from "../services/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    department: "Engineering",
    experienceMin: "3+ years",
    education: "Bachelor's Degree in CS or related field",
    requiredSkills: "Python, FastAPI, Docker, PostgreSQL",
  });

  useEffect(() => {
    api.getJobs().then(setJobs);
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const skillsArray = newJob.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const created = await api.createJob({
      ...newJob,
      requiredSkills: skillsArray,
    });
    setJobs([created, ...jobs]);
    setShowModal(false);
    setNewJob({
      title: "",
      department: "Engineering",
      experienceMin: "3+ years",
      education: "Bachelor's Degree in CS or related field",
      requiredSkills: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job Descriptions & Requirements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Define role competencies. HireFlow extracts evidence against these requirements.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Job</span>
        </button>
      </div>

      {/* Jobs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {job.department}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {job.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3">{job.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{job.location || "Remote / Hybrid"}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-medium text-slate-800">{job.experienceMin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Education:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[180px]" title={job.education}>
                    {job.education}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Target Competencies
                </span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {job.requiredSkills?.map((s) => (
                    <SkillBadge key={s} skill={s} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>{job.candidatesCount || 0} Candidates</span>
              </div>
              <button
                onClick={() => alert(`Reviewing candidates for ${job.title}`)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>Screen Resumes</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating Job */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Define New Job Requirements</h3>
            <p className="text-xs text-slate-500 mt-1">
              Specify skills and criteria for automated requirement-evidence mapping.
            </p>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Machine Learning Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Min Experience</label>
                  <input
                    type="text"
                    value={newJob.experienceMin}
                    onChange={(e) => setNewJob({ ...newJob, experienceMin: e.target.value })}
                    className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Education Requirement</label>
                <input
                  type="text"
                  value={newJob.education}
                  onChange={(e) => setNewJob({ ...newJob, education: e.target.value })}
                  className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Required Skills (Comma separated)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Python, PyTorch, LangChain, Transformers, Kubernetes"
                  value={newJob.requiredSkills}
                  onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                  className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Save Job & Requirements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
