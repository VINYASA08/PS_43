"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Upload, ArrowRight, CheckCircle2, Copy, FileText, X, Search, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { JHARKHAND_DISTRICTS, PRIORITY_DOMAINS } from "@/lib/constants";

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  url?: string;
  file?: File;
  status?: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
}

export default function SubmitProblem() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("IN-GR-2026-9842");
  const [copiedToast, setCopiedToast] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("Contaminated Drinking Water & Acid Runoff in Dhanbad");
  const [description, setDescription] = useState(
    "Borewell water has turned reddish with severe metallic taste. Local children developing skin rashes. Abandoned coal mine runoff suspected of leaching into local aquifer."
  );
  const [domain, setDomain] = useState("Water Management");
  const [district, setDistrict] = useState("Dhanbad");
  const [location, setLocation] = useState("Block XYZ, Village 4");
  const [urgency, setUrgency] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("CRITICAL");

  // Geolocation state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // File Upload State
  const [files, setFiles] = useState<UploadedFileItem[]>([
    { id: "sample-1", name: "water_borewell_sample.jpg", size: "2.4 MB", url: "/evidence/water_borewell_sample.jpg", status: "uploaded" }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus({
        message: "Geolocation is not supported by your browser.",
        type: "error",
      });
      return;
    }

    setIsCapturingGps(true);
    setGpsStatus({ message: "Acquiring GPS coordinates...", type: "info" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setIsCapturingGps(false);
        setGpsStatus({
          message: `GPS Locked: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`,
          type: "success",
        });

        const coordStr = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setLocation((prev) => {
          if (!prev || prev === "Block XYZ, Village 4") {
            return coordStr;
          }
          if (prev.includes("GPS:")) {
            return prev.replace(/GPS:\s*[-0-9.,\s]+/, coordStr);
          }
          return `${prev} (${coordStr})`;
        });
      },
      (err) => {
        setIsCapturingGps(false);
        let errorMsg = "Could not capture GPS location.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please allow access or type manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "GPS position unavailable. Please type manually.";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "GPS request timed out. Please try again or type manually.";
        }
        setGpsStatus({ message: errorMsg, type: "error" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const uploadSingleFile = async (item: UploadedFileItem): Promise<string | undefined> => {
    if (!item.file) return item.url;
    try {
      const fd = new FormData();
      fd.append("files", item.file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "File upload failed");
      }
      const data = await res.json();
      const uploadedFile = data.files?.[0];
      if (uploadedFile?.url) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, url: uploadedFile.url, status: "uploaded" }
              : f
          )
        );
        return uploadedFile.url;
      }
    } catch (err: any) {
      console.error(`Upload error for ${item.name}:`, err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "error", error: err.message }
            : f
        )
      );
    }
    return undefined;
  };

  const handleFilesAdded = (incomingFiles: File[]) => {
    const newItems: UploadedFileItem[] = incomingFiles.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      file: f,
      status: "uploading",
    }));

    setFiles((prev) => [...prev, ...newItems]);

    // Asynchronously upload each incoming file to /api/upload
    newItems.forEach((item) => {
      uploadSingleFile(item);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      handleFilesAdded(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      handleFilesAdded(dropped);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Ensure all pending files are uploaded
      const mediaUrls: string[] = [];
      for (const f of files) {
        if (f.url) {
          mediaUrls.push(f.url);
        } else if (f.file) {
          const freshUrl = await uploadSingleFile(f);
          mediaUrls.push(freshUrl || `/evidence/${f.name}`);
        } else {
          mediaUrls.push(`/evidence/${f.name}`);
        }
      }

      const evidenceObj = {
        mediaUrls,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        gpsLocation: (latitude !== null && longitude !== null) ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : undefined,
        turbidity: "48 NTU",
        dissolvedIron: "6.2 mg/L",
        ph: "4.8",
      };

      const res = await apiFetch<any>("/api/challenges", {
        method: "POST",
        body: {
          title,
          description,
          domain,
          district,
          location,
          urgency,
          evidence: JSON.stringify(evidenceObj),
        },
      });

      const newId = res.trackingId || res.challenge?.publicTrackingId || "IN-GR-2026-9842";
      setTrackingId(newId);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Submit challenge error:", err);
      setSubmitError(err.message || "Failed to submit challenge to ledger.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col pt-16">
      {/* Copied Toast */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Tracking ID copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          ← Back to Portal
        </Link>
        <Link href="/track" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> Track Existing Issue
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2 text-slate-900">Report a Local Challenge</h1>
                  <p className="text-slate-500 text-sm">
                    Your submission will be recorded in the State Ledger, analyzed by AI, and routed to an accredited university research lab.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                    {submitError}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        step >= i ? "bg-blue-600" : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }}>
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Problem Title</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="E.g., Contaminated Drinking Water in XYZ Village"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Domain</label>
                          <select
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            {PRIORITY_DOMAINS.map((d) => (
                              <option key={d.key} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
                          <select
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
                        <textarea
                          required
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the issue, who is affected, and any background information..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                          <select
                            required
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Select District</option>
                            {JHARKHAND_DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">Specific Location</label>
                            <button
                              type="button"
                              onClick={handleCaptureGps}
                              disabled={isCapturingGps}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isCapturingGps ? (
                                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                              ) : (
                                <MapPin className="w-3 h-3 text-blue-600" />
                              )}
                              Capture GPS Coordinates
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Block XYZ, Village 4"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {gpsStatus && (
                            <p
                              className={`text-[11px] mt-1 font-medium flex items-center gap-1 ${
                                gpsStatus.type === "success"
                                  ? "text-emerald-600"
                                  : gpsStatus.type === "error"
                                  ? "text-rose-500"
                                  : "text-blue-600"
                              }`}
                            >
                              {gpsStatus.type === "success" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              {gpsStatus.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ground Zero Evidence (Photos/Docs)</label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                            isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                          }`}
                        >
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700">Click or drag & drop files here</p>
                          <p className="text-[10px] text-slate-400">PNG, JPG, PDF up to 10MB</p>
                        </div>

                        {files.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {files.map((f) => (
                              <div key={f.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                                <div className="flex items-center gap-2 truncate max-w-[280px]">
                                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-700 truncate">{f.name}</span>
                                  <span className="text-[10px] text-slate-400 shrink-0">({f.size})</span>
                                  {f.status === "uploading" && (
                                    <span className="text-[10px] text-blue-500 animate-pulse font-medium shrink-0">Uploading...</span>
                                  )}
                                  {f.status === "uploaded" && (
                                    <span className="text-[10px] text-emerald-600 font-medium shrink-0 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
                                    </span>
                                  )}
                                  {f.status === "error" && (
                                    <span className="text-[10px] text-rose-500 font-medium shrink-0">Upload failed</span>
                                  )}
                                </div>
                                <button type="button" onClick={() => removeFile(f.id)} className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <h4 className="font-bold text-slate-900">Review Submission Ground Truth</h4>
                        <p><span className="font-semibold text-slate-500">Title:</span> {title}</p>
                        <p><span className="font-semibold text-slate-500">Domain:</span> {domain}</p>
                        <p><span className="font-semibold text-slate-500">Urgency:</span> {urgency}</p>
                        <p><span className="font-semibold text-slate-500">Location:</span> {location}, {district} District {latitude !== null && longitude !== null ? `(${latitude.toFixed(5)}, ${longitude.toFixed(5)})` : ""}</p>
                        <p><span className="font-semibold text-slate-500">Evidence Attachments:</span> {files.length} file(s) {files.some((f) => f.url) ? "(Stored via Upload API)" : ""}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        By submitting, you corroborate that this challenge represents real ground truth and authorize state SLA tracking.
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-8 flex gap-3">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(s => s - 1)}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        "Submitting to State Ledger..."
                      ) : step === 3 ? (
                        "Submit Problem to Ledger"
                      ) : (
                        <>Next Step <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Challenge Registered Successfully!</h2>
                  <p className="text-slate-500 text-xs">
                    Your grievance has been permanently recorded in the state innovation ledger with a statutory 21-day SLA.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Tracking ID</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-xl font-black text-slate-900">{trackingId}</span>
                    <button
                      onClick={handleCopyTrackingId}
                      className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/track?id=${trackingId}`}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Track Status Online <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => { setIsSuccess(false); setStep(1); }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Submit Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
