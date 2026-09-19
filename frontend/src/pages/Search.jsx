import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Sparkles, ArrowRight, User } from "lucide-react";
import EvidenceBadge from "../components/common/EvidenceBadge";
import SkillBadge from "../components/common/SkillBadge";
import api from "../services/api";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (term) => {
    setLoading(true);
    try {
      const data = await api.searchCandidates(term);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(query);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Natural Language Candidate Search</h2>
        <p className="text-xs text-slate-500 mt-1">
          Search candidates using conversational queries like "Engineers with FastAPI experience" or "DevOps who know Terraform".
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: 'FastAPI microservices', 'Staff DevOps', or 'React Next.js'..."
            className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-2.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Found {results.length} candidate matches</span>
          {query && <span>Showing matches for: "{query}"</span>}
        </div>

        {results.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => navigate(`/candidates/${candidate.id}`)}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                  {candidate.name}
                </h3>
                <span className="text-xs text-slate-400">• {candidate.role}</span>
              </div>
              <p className="text-xs text-slate-600 italic">"{candidate.topEvidence}"</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {candidate.skills.map((s) => (
                  <SkillBadge key={s} skill={s} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col gap-1 text-right">
                <EvidenceBadge type="evidence" count={candidate.evidenceFoundCount} />
                <span className="text-[10px] text-slate-400">{candidate.experienceYears} yrs exp</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}

        {results.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No candidates found matching your criteria. Try broader keywords.
          </div>
        )}
      </div>
    </div>
  );
}
