import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

export default function Resumes() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successResult, setSuccessResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (selectedFiles) => {
    setErrorMessage("");
    const validPdfs = [];
    let hasInvalid = false;

    for (const file of selectedFiles) {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        validPdfs.push(file);
      } else {
        hasInvalid = true;
      }
    }

    if (hasInvalid) {
      setErrorMessage("Only PDF documents are accepted for AI parsing.");
    }

    setFiles((prev) => [...prev, ...validPdfs]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    files.forEach((file) => formData.append("resumes", file));

    try {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 20 : prev));
      }, 300);

      const res = await api.uploadResumes(formData, (p) => setProgress(p));
      clearInterval(interval);
      setProgress(100);
      setSuccessResult(res);
    } catch (err) {
      setErrorMessage("Failed to upload resumes. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Batch Resume Ingestion</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload candidate PDF resumes. HireFlow extracts text, maps against target job requirements, and identifies evidence.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/50"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          Drag & Drop Candidate Resumes Here
        </h3>
        <p className="text-xs text-slate-500 mt-1">Supports multiple PDF files up to 15MB each</p>

        <div className="mt-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-sm transition-all">
            <span>Browse Files</span>
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Selected Resumes ({files.length})
            </h4>
            {!uploading && (
              <button
                onClick={() => setFiles([])}
                className="text-xs text-slate-400 hover:text-rose-600"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {files.map((file, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{file.name}</span>
                  <span className="text-[11px] text-slate-400">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Ingesting and parsing resume text...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {!successResult && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{uploading ? "Analyzing Resumes..." : "Process Resumes with AI"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success Result Card */}
      {successResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-900">
                Resumes Processed Successfully!
              </h4>
              <p className="text-xs text-emerald-800/80 mt-1">
                Extracted skills, job history, and matched against job competencies. Evidence mapping is now ready for recruiter inspection.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => navigate("/candidates")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
                >
                  <span>View Candidate Mappings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setFiles([]);
                    setSuccessResult(null);
                  }}
                  className="text-xs font-medium text-emerald-800 hover:underline"
                >
                  Upload more resumes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
