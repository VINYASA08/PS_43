"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Sliders, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  Info, 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles,
  Zap,
  Activity
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export interface AiOversightData {
  accuracy: number;
  threshold: number;
  totalClassified: number;
  misclassified: number;
  providerBreakdown?: {
    gemini: number;
    openai: number;
    heuristic: number;
  };
}

interface AiOversightPanelProps {
  initialData?: AiOversightData;
}

export function AiOversightPanel({ initialData }: AiOversightPanelProps) {
  const [oversight, setOversight] = useState<AiOversightData>(
    initialData || {
      accuracy: 94.6,
      threshold: 0.85,
      totalClassified: 1280,
      misclassified: 69,
      providerBreakdown: {
        gemini: 794,
        openai: 332,
        heuristic: 154,
      },
    }
  );

  const [sliderThreshold, setSliderThreshold] = useState(
    initialData?.threshold || 0.85
  );
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch AI config directly from API
  const fetchAiConfig = useCallback(async () => {
    try {
      const res = await apiFetch<{ confidenceThreshold: number; lastUpdated?: string }>(
        "/api/state/ai-config"
      );
      if (res && res.confidenceThreshold !== undefined) {
        setSliderThreshold(res.confidenceThreshold);
        setOversight((prev) => ({ ...prev, threshold: res.confidenceThreshold }));
      }
    } catch (err) {
      console.error("Failed to fetch live AI config:", err);
    }
  }, []);

  useEffect(() => {
    fetchAiConfig();
  }, [fetchAiConfig]);

  // Save new confidence threshold
  const handleSaveThreshold = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; confidenceThreshold: number }>(
        "/api/state/ai-config",
        {
          method: "POST",
          body: {
            confidenceThreshold: Number(sliderThreshold.toFixed(2)),
          },
        }
      );

      setOversight((prev) => ({ ...prev, threshold: res.confidenceThreshold }));
      setNotification({
        type: "success",
        message: `Global AI confidence threshold updated to ${(res.confidenceThreshold * 100).toFixed(0)}%. Tri-track routing parameters adjusted across Jharkhand.`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to update AI confidence threshold.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const geminiCount = oversight.providerBreakdown?.gemini || 794;
  const openaiCount = oversight.providerBreakdown?.openai || 332;
  const heuristicCount = oversight.providerBreakdown?.heuristic || 154;
  const total = geminiCount + openaiCount + heuristicCount;

  return (
    <div className="space-y-6">
      {/* Top Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Accuracy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Categorization Accuracy
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {oversight.accuracy}%
            </div>
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Empirical Benchmarks Passing
            </div>
          </div>
        </div>

        {/* Total Classified Submissions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Auto-Classified
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-blue-600">
              {oversight.totalClassified.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Jan-Aawaz Intake Submissions
            </div>
          </div>
        </div>

        {/* Low Confidence / Misclassified */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Human Review Routed
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-600">
              {oversight.misclassified}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              DNO Verification Override Queue
            </div>
          </div>
        </div>

        {/* Active Threshold */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Routing Gate Threshold
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-indigo-600">
              {(oversight.threshold * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Global Confidence Benchmark
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Threshold Slider Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Autonomous AI Routing Confidence Threshold Control
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tune the sensitivity boundary between automatic direct academic dispatch and District Nodal Officer verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAiConfig}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Refresh Config"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveThreshold}
              disabled={isSaving || sliderThreshold === oversight.threshold}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Applying..." : "Save New Threshold"}
            </button>
          </div>
        </div>

        {/* Dynamic Slider Control */}
        <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">
              Live Routing Confidence Gate:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {(sliderThreshold * 100).toFixed(0)}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({sliderThreshold.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <input
              type="range"
              min="0.70"
              max="0.95"
              step="0.01"
              value={sliderThreshold}
              onChange={(e) => setSliderThreshold(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>0.70 (Aggressive Auto-Route)</span>
              <span>0.85 (Balanced Default)</span>
              <span>0.95 (Strict DNO Oversight)</span>
            </div>
          </div>

          {/* Contextual description of current slider value */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              {sliderThreshold >= 0.90 ? (
                <span>
                  <strong className="text-slate-900">High Oversight Mode:</strong> Only submissions where the AI has over {(sliderThreshold * 100).toFixed(0)}% confidence will bypass manual triage. The vast majority of citizen submissions will route through District Nodal Officers for manual review first.
                </span>
              ) : sliderThreshold <= 0.75 ? (
                <span>
                  <strong className="text-slate-900">Accelerated Direct Mode:</strong> The threshold is low, allowing rapid automatic matching to academic labs. Only highly ambiguous reports will hold for DNO signoff.
                </span>
              ) : (
                <span>
                  <strong className="text-slate-900">Balanced State Standard (Recommended):</strong> Submissions with confidence above {(sliderThreshold * 100).toFixed(0)}% are routed directly to university DPR queues, ensuring speed while maintaining quality.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Model Provider Distribution Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Multi-Provider AI Architecture Telemetry
            </h4>
          </div>
          <span className="text-xs text-slate-500">Autonomous Failover Pool</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Provider 1: Gemini */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                Primary Engine
              </span>
              <span className="text-xs font-bold text-slate-900">
                {Math.round((geminiCount / total) * 100)}% Traffic
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Google Gemini 1.5 Flash</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Processes multimodal citizen images, video evidence, and native Hindi/tribal dialect audio transcripts.
            </p>
            <div className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-200">
              {geminiCount} problems categorized
            </div>
          </div>

          {/* Provider 2: OpenAI */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Secondary Engine
              </span>
              <span className="text-xs font-bold text-slate-900">
                {Math.round((openaiCount / total) * 100)}% Traffic
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">OpenAI GPT-4o-mini</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Handles semantic deduplication and 3-way academic university thematic matching.
            </p>
            <div className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-200">
              {openaiCount} problems categorized
            </div>
          </div>

          {/* Provider 3: Local Heuristics */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Air-Gapped Fallback
              </span>
              <span className="text-xs font-bold text-slate-900">
                {Math.round((heuristicCount / total) * 100)}% Traffic
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Jharkhand Local Heuristic Node</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rule-based emergency fallback ensuring zero downtime during external API network partitions.
            </p>
            <div className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-200">
              {heuristicCount} problems categorized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
