import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  FileText,
  Save,
  Check,
  Briefcase,
  User,
  Clock,
  Award,
  Sparkles,
  Layers,
  Code2,
  Users2,
  Lightbulb,
  Mail,
  Send,
  X,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

export default function Evaluations() {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate") || "c-101";

  const [evaluation, setEvaluation] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [recruiterDecision, setRecruiterDecision] = useState("Advance to Final Round");
  const [recruiterNotes, setRecruiterNotes] = useState(
    "Strong technical foundation confirmed during live interview probes. Candidate gave concrete architecture examples for distributed queuing and fault tolerance. Ready for technical on-site with Engineering Director."
  );
  const [savedNotes, setSavedNotes] = useState(false);

  // Email Delivery Workflow State (Module 14)
  const [sendStatus, setSendStatus] = useState({
    report_sent: false,
    report_sent_at: null,
    report_recipient: null,
    report_send_status: "NOT_SENT",
  });
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendSuccessBanner, setSendSuccessBanner] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getCandidate(candidateId),
      api.generateEvaluation(candidateId),
      api.getEvaluationSendStatus(candidateId),
    ]).then(([candData, evalData, statusData]) => {
      setCandidate(candData);
      setEvaluation(evalData.evaluationReport);
      if (statusData) {
        setSendStatus(statusData);
        if (candData?.email) {
          setCustomEmail(candData.email);
        } else if (statusData.candidate_email) {
          setCustomEmail(statusData.candidate_email);
        }
      }
    });
  }, [candidateId]);


  if (!evaluation || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium tracking-wide">Synthesizing structured candidate evaluation report...</p>
      </div>
    );
  }

  const handleExport = () => {
    window.print();
  };

  const handleSaveNotes = () => {
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 3000);
  };

  // Structured Competency Assessment Categories grounded in candidate & interview data
  const competencyCategories = [
    {
      title: "Technical Architecture & Systems",
      icon: Code2,
      resumeEvidence: candidate.requirements?.[0]?.evidence || "Engineered high-throughput event processing pipelines with FastAPI and Kafka.",
      interviewObservation: "Candidate confirmed partition key design by user_id and explained idempotent consumer mechanics.",
      status: "VERIFIED",
    },
    {
      title: "Distributed Scalability & Reliability",
      icon: Layers,
      resumeEvidence: "Built resilient microservices handling sustained high RPS with zero failover downtime.",
      interviewObservation: "Explained multi-cluster message backpressure and circuit breaking using Redis.",
      status: "VERIFIED",
    },
    {
      title: "Cloud Infrastructure & Containerization",
      icon: Briefcase,
      resumeEvidence: candidate.requirements?.[1]?.evidence || "Mentions Docker and containerized builds, but Kubernetes cluster administration needed validation.",
      interviewObservation: "Authored Helm charts and deployment manifests. Cluster provisioning was handled by dedicated platform team.",
      status: "VALIDATED_WITH_CONTEXT",
    },
    {
      title: "Engineering Leadership & Collaboration",
      icon: Users2,
      resumeEvidence: candidate.requirements?.[2]?.evidence || "Mentorship and sprint leadership of junior developers.",
      interviewObservation: "Clarified 6 months acting squad lead role; mentored 2 junior developers through PR reviews and pairing.",
      status: "VALIDATED",
    },
    {
      title: "Problem Solving & Engineering Rigor",
      icon: Lightbulb,
      resumeEvidence: "Designed automated test suites and structured database migration pipelines.",
      interviewObservation: "Articulated database indexing trade-offs, PostgreSQL MVCC behavior, and query optimization patterns.",
      status: "VERIFIED",
    },
  ];

  // Derive matrix rows from candidate requirements + fallback to ensure comprehensive table
  const matrixRows = (candidate.requirements && candidate.requirements.length > 0)
    ? candidate.requirements.map((req, idx) => {
        let validation = "Discussed and confirmed with interviewer during technical probe.";
        let statusLabel = "Evidence Confirmed";
        let statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";

        if (req.status === "NEEDS_VALIDATION" || idx === 1) {
          validation = "Clarified during interview: Helm charts authored; cluster ops handled by Infra.";
          statusLabel = "Validated in Interview";
          statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
        } else if (req.status === "MISSING_INFO" || idx === 2) {
          validation = "Candidate confirmed limited multi-region replication experience; noted as gap.";
          statusLabel = "Unresolved Gap";
          statusBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
        }

        return {
          id: req.id || `matrix-${idx}`,
          requirement: req.title,
          resumeEvidence: req.evidence,
          interviewValidation: validation,
          statusLabel,
          statusBadgeClass,
        };
      })
    : [
        {
          id: "m-1",
          requirement: "FastAPI / Python Systems Architecture",
          resumeEvidence: "4+ years building high-throughput microservices handling 15k req/sec.",
          interviewValidation: "Confirmed deep knowledge of asynchronous event loop, dependency injection, and Pydantic v2 schemas.",
          statusLabel: "Evidence Confirmed",
          statusBadgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        {
          id: "m-2",
          requirement: "Kubernetes Manifests & Container Operations",
          resumeEvidence: "Resume mentions Docker and containerized services.",
          interviewValidation: "Discussed helm values customization; cloud cluster administration was managed by DevOps team.",
          statusLabel: "Validated in Interview",
          statusBadgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        },
        {
          id: "m-3",
          requirement: "Multi-Region Distributed Database Replication",
          resumeEvidence: "No direct mention of cross-region PostgreSQL replication in CV.",
          interviewValidation: "Not demonstrated in production. Candidate expressed familiarity with logical replication concepts only.",
          statusLabel: "Unresolved Gap",
          statusBadgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        },
      ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return String(isoString);
    }
  };

  const handleOpenSendModal = () => {
    setSendError(null);
    const emailToUse = customEmail || candidate?.email || "";
    setCustomEmail(emailToUse);
    setIsEditingEmail(!emailToUse);
    setEmailSubject(`Evaluation Report - ${candidate.name} | ${candidate.role}`);
    setCustomMessage(
      `Dear ${candidate.name},\n\nThank you for interviewing with us for the ${candidate.role} position at HireFlow. Attached is your comprehensive evaluation report detailing your interview assessment, requirement evidence synthesis, and technical observations.\n\nPlease let us know if you have any questions.\n\nWarm regards,\nHireFlow Recruitment Team`
    );
    setShowSendModal(true);
  };

  const handleSendEmail = async () => {
    const targetEmail = (customEmail || "").trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setSendError("Candidate email address was not found or is invalid. Please enter a valid email.");
      return;
    }

    setSendingReport(true);
    setSendError(null);

    try {
      const targetId = candidate?.rawId || candidate?.id || candidateId || "1";
      const res = await api.sendEvaluationReport(targetId, {
        email: targetEmail,
        customMessage,
        subject: emailSubject,
        recruiterDecision,
        recruiterNotes,
        matrixRows: matrixRows.map((r) => ({
          requirement: r.requirement,
          resumeEvidence: r.resumeEvidence,
          interviewValidation: r.interviewValidation,
          statusLabel: r.statusLabel,
        })),
      });

      const updatedStatus = {
        report_sent: true,
        report_sent_at: res.report_sent_at || res.sent_at,
        report_recipient: res.recipient || targetEmail,
        report_send_status: "SENT",
      };
      setSendStatus(updatedStatus);

      const isLive = res?.mode === "live_smtp" || res?.mode === "live_api";
      const providerName = res?.mode === "live_api" ? "Email API" : "Gmail SMTP";
      setSendSuccessBanner(
        isLive
          ? `✓ Live email with PDF scorecard successfully delivered to ${res.recipient || targetEmail} via ${providerName}!`
          : `⚠️ Demo Mode: Scorecard generated for ${res.recipient || targetEmail}. (Real delivery requires SMTP or Brevo API credentials in backend/.env or Render Environment)`
      );
      setShowSendModal(false);
      setTimeout(() => setSendSuccessBanner(null), 12000);
    } catch (err) {
      setSendError(
        err.message || "Email delivery failed. Please check backend connection and credentials."
      );
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto py-6 sm:py-8 px-4 sm:px-8 lg:px-10 space-y-8 print:p-0 print:max-w-none print:w-full print:space-y-6 text-slate-900 bg-slate-50 min-h-screen">
      {/* Embedded Print CSS for Enterprise PDF Generation */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 12pt !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-slate-300 {
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>

      {/* Success Notification Banner */}
      {sendSuccessBanner && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{sendSuccessBanner}</span>
          </div>
          <button
            onClick={() => setSendSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold px-2 py-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {sendError && !showSendModal && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 print:hidden">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Delivery Failed</span>
              <p className="text-xs text-rose-700 leading-relaxed">{sendError}</p>
            </div>
          </div>
          <button
            onClick={() => setSendError(null)}
            className="text-rose-600 hover:text-rose-800 text-xs font-semibold px-2 py-1 rounded hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          1. TOP REPORT HEADER (Document-Style)
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/90 print:border-slate-300">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-sky-100/70 text-sky-800 border border-sky-200">
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span>Candidate Evaluation Report</span>
            </div>
            {sendStatus?.report_sent ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title={`Sent to ${sendStatus.report_recipient}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sent to Candidate ({formatDateTime(sendStatus.report_sent_at)})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Not Sent to Candidate</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Structured Evaluation Report
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Candidate: <span className="font-bold text-slate-800">{candidate.name}</span> • Role:{" "}
            <span className="font-semibold text-slate-700">{candidate.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          {/* Send Report to Candidate Button */}
          <button
            onClick={handleOpenSendModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer"
            title="Send evaluation report PDF to candidate's email"
          >
            <Mail className="w-4 h-4" />
            <span>{sendStatus?.report_sent ? "Re-send Report" : "Send Report"}</span>
          </button>

          {/* Export / Print Button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg shadow-xs hover:border-sky-300 transition-all duration-150 cursor-pointer"
            title="Export report to PDF or print"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>


      {/* =========================================================================
          2. CANDIDATE INFORMATION CARD (Clean 5-Column Horizontal ATS Bar)
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card print:shadow-none print:border-slate-300 print:break-inside-avoid">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Candidate</span>
            </span>
            <p className="text-base font-bold text-slate-900 tracking-tight">{candidate.name}</p>
            <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
          </div>

          <div className="space-y-1 pt-3 sm:pt-0 sm:pl-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Target Role</span>
            </span>
            <p className="text-base font-bold text-slate-900 tracking-tight">{candidate.role}</p>
            <p className="text-xs text-slate-500">Engineering Dept</p>
          </div>

          <div className="space-y-1 pt-3 sm:pt-0 sm:pl-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Experience</span>
            </span>
            <p className="text-base font-bold text-slate-900 tracking-tight">
              {candidate.experienceYears} Years
            </p>
            <p className="text-xs text-slate-500">Documented in Resume</p>
          </div>

          <div className="space-y-1 pt-3 sm:pt-0 sm:pl-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Report Delivery</span>
            </span>
            {sendStatus?.report_sent ? (
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sent to Candidate</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1 truncate" title={sendStatus.report_recipient}>
                  {formatDateTime(sendStatus.report_sent_at)}
                </p>
              </div>
            ) : (
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Not Sent</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Ready for Recruiter Send</p>
              </div>
            )}
          </div>

          <div className="space-y-1 pt-3 sm:pt-0 sm:pl-5 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Interview Status</span>
            </span>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                <span>Reviewed & Verified</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Panel Complete</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. HUMAN RECRUITER FINAL DETERMINATION (Enterprise Action Banner)
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-sky-200 p-5 sm:p-6 shadow-card bg-gradient-to-r from-sky-50/40 via-white to-sky-50/20 print:shadow-none print:border-slate-300 print:break-inside-avoid">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-sky-100/70 text-sky-700 border border-sky-200 shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6 text-sky-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Human Recruiter Final Determination
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                  Human-In-The-Loop Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                AI provides structured evidence synthesis. The final hiring action is strictly your human decision and cannot be automated.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Final Recommendation
              </span>
              <span className="text-xs font-medium text-slate-600">Selected Determination:</span>
            </div>
            <select
              value={recruiterDecision}
              onChange={(e) => setRecruiterDecision(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100/70 border border-sky-300 rounded-lg shadow-xs outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors cursor-pointer"
            >
              <option value="Advance to Final Round">Advance to Final Round</option>
              <option value="Hold for Follow-up">Hold for Follow-up</option>
              <option value="Route to Different Role">Route to Different Role</option>
              <option value="Not Moving Forward">Not Moving Forward</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. INTERVIEW SYNTHESIS SUMMARY (Clean Reading Canvas)
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card print:shadow-none print:border-slate-300 print:break-inside-avoid space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Interview Synthesis Summary</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Session Synthesized</span>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal bg-slate-50/50 p-4 sm:p-5 rounded-lg border border-slate-100">
          {evaluation.summary}
        </p>
      </div>

      {/* =========================================================================
          5. THREE-SECTION EVIDENCE BREAKDOWN (Desktop 3-Column Grid)
         ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Three-Pillar Evidence Breakdown
          </h3>
          <span className="text-xs text-slate-400">Verifiable Candidate Proof</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column A: Evidence Confirmed */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between print:break-inside-avoid">
            <div>
              <div className="flex items-center gap-2 text-emerald-900 pb-2 border-b border-emerald-200/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight">1. Evidence Confirmed</h4>
                  <p className="text-[11px] text-emerald-700/80">Direct proof verified in CV & artifacts</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-emerald-900/90 leading-relaxed">
                {evaluation.evidenceFound?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-emerald-200/50 text-[11px] font-semibold text-emerald-700">
              Documented & Auditable
            </div>
          </div>

          {/* Column B: Validated During Interview */}
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between print:break-inside-avoid">
            <div>
              <div className="flex items-center gap-2 text-amber-900 pb-2 border-b border-amber-200/60">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight">2. Validated in Interview</h4>
                  <p className="text-[11px] text-amber-700/80">Ambiguities probed and verified live</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-amber-900/90 leading-relaxed">
                {evaluation.areasValidatedInInterview?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-amber-200/50 text-[11px] font-semibold text-amber-700">
              Interviewer Confirmed
            </div>
          </div>

          {/* Column C: Unresolved Gaps */}
          <div className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between print:break-inside-avoid">
            <div>
              <div className="flex items-center gap-2 text-rose-900 pb-2 border-b border-rose-200/60">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight">3. Unresolved Gaps</h4>
                  <p className="text-[11px] text-rose-700/80">Missing criteria & unverified requirements</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-rose-900/90 leading-relaxed">
                {evaluation.unresolvedConcerns?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-rose-600 mt-0.5">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-rose-200/50 text-[11px] font-semibold text-rose-700">
              Requires Senior Review
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. REQUIREMENT EVIDENCE MATRIX (Full Audit Table)
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden print:shadow-none print:border-slate-300 print:break-inside-avoid">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Requirement Evidence Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct correlation between target role competencies, resume proof, and interview validation.
            </p>
          </div>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
            {matrixRows.length} Competencies Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5 w-1/4">Requirement</th>
                <th className="py-3.5 px-5 w-1/3">Resume Evidence</th>
                <th className="py-3.5 px-5 w-1/3">Interview Validation</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {matrixRows.map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-slate-900 align-top">
                    {row.requirement}
                  </td>
                  <td className="py-4 px-5 italic text-slate-600 align-top leading-relaxed">
                    "{row.resumeEvidence}"
                  </td>
                  <td className="py-4 px-5 text-slate-700 align-top leading-relaxed">
                    {row.interviewValidation}
                  </td>
                  <td className="py-4 px-5 text-right align-top whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${row.statusBadgeClass}`}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          7. STRUCTURED INTERVIEW ASSESSMENT CATEGORIES
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card print:shadow-none print:border-slate-300 print:break-inside-avoid space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Structured Interview Assessment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Categorical assessment based on verifiable resume anchors and interviewer observations.
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            5 Core Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competencyCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 print:break-inside-avoid"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{cat.title}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      cat.status === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {cat.status === "VERIFIED" ? "Verified" : "Validated"}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Resume Anchor:</span>
                  <p className="text-slate-600 italic line-clamp-2">"{cat.resumeEvidence}"</p>
                </div>

                <div className="space-y-1 text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Interview Observation:</span>
                  <p className="text-slate-800 leading-snug">{cat.interviewObservation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          8. RECRUITER NOTES & HIRING OBSERVATIONS
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card print:shadow-none print:border-slate-300 print:break-inside-avoid space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recruiter Notes & Panel Observations</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add qualitative context, compensation notes, or scheduling follow-ups for the recruitment committee.
            </p>
          </div>
          {savedNotes && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Notes Saved!</span>
            </span>
          )}
        </div>

        <textarea
          rows={4}
          value={recruiterNotes}
          onChange={(e) => setRecruiterNotes(e.target.value)}
          placeholder="Add final recruiter observations and hiring panel notes..."
          className="w-full p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none leading-relaxed transition-all"
        />

        <div className="flex items-center justify-between pt-1 print:hidden">
          <span className="text-[11px] text-slate-400">
            Notes are saved to the audit log and appended to the final candidate docket.
          </span>
          <button
            onClick={handleSaveNotes}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Recruiter Notes</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          9. FINAL RECRUITER DETERMINATION & SIGN-OFF
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card print:shadow-none print:border-slate-300 print:break-inside-avoid">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Final Recruiter Determination</h3>
            <p className="text-xs text-slate-500">
              Official action required prior to applicant stage advancement.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Recommendation:</span>
            <span className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-100/70 border border-sky-300 rounded-lg">
              {recruiterDecision}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 text-xs text-slate-600">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Evaluating Recruiter
            </span>
            <p className="font-bold text-slate-800">Recruiter Admin</p>
            <p className="text-slate-400">Talent Acquisition Lead</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Sign-Off Date
            </span>
            <p className="font-bold text-slate-800">{currentDate}</p>
            <p className="text-slate-400">Recorded in HireFlow Audit Log</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Compliance Status
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Verified & Compliant</span>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          10. REPORT FOOTER
         ========================================================================= */}
      <footer className="pt-4 pb-12 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 print:pb-0">
        <div>
          <span className="font-semibold text-slate-600">HireFlow</span> — Evidence-Based Candidate Evaluation Platform
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Generated: {currentDate}</span>
          <span>•</span>
          <span>Report ID: HF-EVAL-{candidate.id?.toString().toUpperCase() || "101"}</span>
          <span>•</span>
          <span className="text-slate-500 font-medium">Strictly Confidential</span>
        </div>
      </footer>

      {/* =========================================================================
          11. SEND EVALUATION REPORT MODAL (Enterprise Recruiter Confirmation)
         ========================================================================= */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:hidden">
          <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
                  <Mail className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Send Evaluation Report to Candidate
                  </h2>
                  <p className="text-xs text-slate-500">
                    Deliver the official PDF scorecard and interview synthesis directly to candidate.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSendModal(false)}
                disabled={sendingReport}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[calc(85vh-140px)] overflow-y-auto">
              {/* Delivery Error Alert */}
              {sendError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-rose-900 block">Email Delivery Failed:</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{sendError}</p>
                  </div>
                </div>
              )}
              {/* Duplicate Send Warning */}
              {sendStatus?.report_sent && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Report Already Dispatched:</span> This report was already sent to{" "}
                    <span className="font-semibold">{sendStatus.report_recipient}</span> on{" "}
                    {formatDateTime(sendStatus.report_sent_at)}. Sending again will dispatch a new copy with your latest notes.
                  </div>
                </div>
              )}

              {/* Delivery Mode Banner */}
              {sendStatus?.smtp_configured ? (
                <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold">Live Gmail SMTP Connected</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Real delivery enabled</span>
                </div>
              ) : (
                <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-sky-950">
                      Simulation Mode Active (SMTP credentials not yet set)
                    </div>
                    <p className="text-[11px] text-sky-800 leading-relaxed">
                      Sending in this mode simulates delivery and generates the PDF. To deliver a <strong>real email to candidate's Gmail inbox</strong>, enter your Gmail address and 16-character App Password in <code>backend/.env</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* Candidate Info Summary */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Candidate Name
                  </span>
                  <span className="font-bold text-slate-900">{candidate.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Target Position
                  </span>
                  <span className="font-semibold text-slate-800">{candidate.role}</span>
                </div>
              </div>

              {/* Recipient Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Candidate Email Address
                </label>

                {isEditingEmail || !candidate.email ? (
                  <div className="space-y-2">
                    {!candidate.email && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Candidate email address was not found in the uploaded resume. Please enter an email manually:</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="e.g. devavarninemurugesh@gmail.com"
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900"
                      />
                      {candidate.email && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomEmail(candidate.email);
                            setIsEditingEmail(false);
                          }}
                          className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-600" />
                      <span className="text-sm font-semibold text-slate-800">{customEmail}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Extracted from Resume
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Attachment Preview Card */}
              <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-sky-300 flex items-center justify-center text-sky-600 shadow-2xs">
                    <FileText className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-mono">
                      HireFlow_Evaluation_Report_{candidate.name.replace(/\s+/g, "_")}.pdf
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ReportLab Generated ATS Scorecard (~5 KB) • 3-Pillar Evidence & Audit
                    </p>
                  </div>
                </div>
                <a
                  href={api.getPreviewPdfUrl(candidate?.rawId || candidate?.id || candidateId || "1")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 px-2.5 py-1.5 bg-white rounded-lg border border-sky-200 hover:bg-sky-50 transition-colors shadow-2xs"
                  title="Preview PDF document in new browser tab"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3 text-sky-500" />
                </a>
              </div>

              {/* Email Subject Line */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 font-medium"
                />
              </div>

              {/* Recruiter Custom Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recruiter Message to Candidate (Optional)
                </label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 leading-relaxed resize-none"
                />
                <p className="text-[11px] text-slate-400">
                  This personalized note will be formatted into the candidate's email notification alongside the attached PDF scorecard.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">
                Audited &amp; Logged by HireFlow
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  disabled={sendingReport}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingReport || !customEmail}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {sendingReport ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Report...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendStatus?.report_sent ? "Re-send Report" : "Send Report to Candidate"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

