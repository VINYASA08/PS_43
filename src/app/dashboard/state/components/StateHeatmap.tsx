"use client";

import { useState, useRef, useMemo } from "react";
import { 
  Map as MapIcon, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Compass, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Building2, 
  IndianRupee, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink,
  Grid,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

export interface DistrictMetric {
  id: string;
  name: string;
  division: string;
  challenges: number;
  density: "critical" | "high" | "medium" | "low";
  avgResolutionDays: number;
  triageHours: number;
  activeBuilds: number;
  csrDeployedCr: number;
  civicBacklogCount: number;
  complaintsLogged: number;
  complaintsResolved: number;
  center?: [number, number];
  path?: string;
  nodalOfficer?: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    dscVerified: boolean;
  };
}

export type HeatmapMetricLayer = "density" | "backlog" | "csr" | "speed";

interface StateHeatmapProps {
  districts: DistrictMetric[];
  onSelectDistrictForOverride?: (districtName: string) => void;
  isLoading?: boolean;
}

export function StateHeatmap({
  districts,
  onSelectDistrictForOverride,
  isLoading = false,
}: StateHeatmapProps) {
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [activeLayer, setActiveLayer] = useState<HeatmapMetricLayer>("density");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictMetric | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictMetric | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  // Compute color based on layer
  const getDistrictColor = (d: DistrictMetric) => {
    if (activeLayer === "density") {
      if (d.challenges >= 350 || d.density === "critical") return "#be123c"; // Crimson
      if (d.challenges >= 250 || d.density === "high") return "#ea580c";     // Amber / Orange
      if (d.challenges >= 150 || d.density === "medium") return "#0d9488";   // Teal
      return "#10b981";                                                      // Emerald
    }

    if (activeLayer === "backlog") {
      if (d.civicBacklogCount >= 14) return "#be123c"; // Crimson distress
      if (d.civicBacklogCount >= 8) return "#d97706";  // Amber warning
      return "#059669";                                // Calm green
    }

    if (activeLayer === "csr") {
      if (d.csrDeployedCr >= 0.8) return "#047857";  // Deep Emerald
      if (d.csrDeployedCr >= 0.3) return "#0d9488";  // Teal
      if (d.csrDeployedCr >= 0.1) return "#38bdf8";  // Light Blue
      return "#94a3b8";                              // Neutral slate
    }

    if (activeLayer === "speed") {
      if (d.triageHours >= 5.0) return "#e11d48";    // Slow (Rose)
      if (d.triageHours >= 4.0) return "#f59e0b";    // Moderate (Amber)
      return "#10b981";                              // Fast (Emerald)
    }

    return "#059669";
  };

  // Tooltip tracking
  const handleSvgMouseMove = (e: React.MouseEvent<SVGElement>, d: DistrictMetric) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const clampedX = Math.min(Math.max(rawX + 16, 12), rect.width - 240);
    const clampedY = Math.min(Math.max(rawY - 110, 12), rect.height - 130);
    setTooltipPos({ x: clampedX, y: clampedY });
    setHoveredDistrict(d);
  };

  const handleSvgMouseLeave = () => {
    setHoveredDistrict(null);
  };

  // Summary statistics across 24 districts
  const stats = useMemo(() => {
    if (!districts.length) return { totalChallenges: 0, criticalDistricts: 0, totalCsr: 0, avgSpeed: 0 };
    const totalChallenges = districts.reduce((acc, d) => acc + d.challenges, 0);
    const criticalDistricts = districts.filter((d) => d.density === "critical" || d.civicBacklogCount >= 14).length;
    const totalCsr = districts.reduce((acc, d) => acc + d.csrDeployedCr, 0);
    const avgSpeed = (districts.reduce((acc, d) => acc + d.triageHours, 0) / districts.length).toFixed(1);
    return { totalChallenges, criticalDistricts, totalCsr: totalCsr.toFixed(2), avgSpeed };
  }, [districts]);

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "relative"
      }`}
    >
      {/* Top Header & Layer Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-white shadow-sm">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Statewide 24-District GIS Command Map
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                24 Statutory Districts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time choropleth telemetry covering civic backlogs, innovation density, and DNO resolution velocity
            </p>
          </div>
        </div>

        {/* View mode toggle & Metric Layer Selector */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Map vs Grid toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              SVG Map
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Geo Grid
            </button>
          </div>

          {/* Metric Layer Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
            {(
              [
                { id: "density", label: "Challenge Density" },
                { id: "backlog", label: "Civic Backlog" },
                { id: "csr", label: "CSR Deployed" },
                { id: "speed", label: "Triage Speed" },
              ] as const
            ).map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                  activeLayer === layer.id
                    ? "bg-amber-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Map / Grid Viewport */}
      <div className="relative flex-1 min-h-[520px] bg-slate-950 flex flex-col md:flex-row overflow-hidden">
        {/* Left GIS Telemetry Canvas (70%) */}
        <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden select-none">
          {viewMode === "map" ? (
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 820 580"
                className="w-full h-full max-h-[500px] drop-shadow-2xl"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter id="state-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.4" floodColor="#f59e0b" />
                  </filter>
                  <pattern id="state-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.4" />
                  </pattern>
                </defs>

                {/* Subtle Grid Background */}
                <rect width="820" height="580" fill="url(#state-grid)" />

                {/* District Vector Paths */}
                {districts.map((district) => {
                  if (!district.path) return null;
                  const isHovered = hoveredDistrict?.id === district.id;
                  const isSelected = selectedDistrict?.id === district.id;
                  const fill = getDistrictColor(district);

                  return (
                    <g key={district.id} className="cursor-pointer transition-all duration-150">
                      <path
                        d={district.path}
                        fill={fill}
                        fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.7}
                        stroke={isSelected ? "#ffffff" : isHovered ? "#fef08a" : "#0f172a"}
                        strokeWidth={isSelected ? 3 : isHovered ? 2.2 : 1.2}
                        onMouseMove={(e) => handleSvgMouseMove(e, district)}
                        onMouseLeave={handleSvgMouseLeave}
                        onClick={() => setSelectedDistrict(district)}
                        className="transition-all hover:brightness-110"
                      />
                      {/* District Labels */}
                      {district.center && (
                        <text
                          x={district.center[0]}
                          y={district.center[1]}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9.5"
                          fontWeight="700"
                          pointerEvents="none"
                          className="drop-shadow-md select-none font-sans"
                        >
                          {district.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {hoveredDistrict && (
                <div
                  className="pointer-events-none absolute z-40 bg-slate-900/95 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md transition-all text-xs"
                  style={{
                    left: `${tooltipPos.x}px`,
                    top: `${tooltipPos.y}px`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1.5">
                    <span className="font-bold text-amber-400 text-sm">{hoveredDistrict.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {hoveredDistrict.division}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
                    <div>
                      Challenges: <span className="font-semibold text-white">{hoveredDistrict.challenges}</span>
                    </div>
                    <div>
                      Backlog: <span className={`font-semibold ${hoveredDistrict.civicBacklogCount >= 10 ? "text-rose-400" : "text-emerald-400"}`}>{hoveredDistrict.civicBacklogCount}</span>
                    </div>
                    <div>
                      Resolution: <span className="font-semibold text-white">{hoveredDistrict.avgResolutionDays}d</span>
                    </div>
                    <div>
                      CSR Deployed: <span className="font-semibold text-amber-400">₹{hoveredDistrict.csrDeployedCr}Cr</span>
                    </div>
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-400 italic">
                    Click to inspect District Nodal Officer & override
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 24-District Geo Grid View */
            <div className="w-full h-full max-h-[500px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {districts.map((district) => {
                const isSelected = selectedDistrict?.id === district.id;
                const fill = getDistrictColor(district);

                return (
                  <div
                    key={district.id}
                    onClick={() => setSelectedDistrict(district)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-amber-400 shadow-md ring-2 ring-amber-400/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs truncate max-w-[120px]">
                        {district.name}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: fill }}
                        title={`Status indicator for ${district.name}`}
                      />
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Challenges:</span>
                        <span className="font-semibold text-white">{district.challenges}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backlog:</span>
                        <span className={district.civicBacklogCount >= 10 ? "font-semibold text-rose-400" : "text-slate-300"}>
                          {district.civicBacklogCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Triage Speed:</span>
                        <span className="text-amber-400 font-medium">{district.triageHours}h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Zoom & Map Controls */}
          {viewMode === "map" && (
            <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg z-30">
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Reset Map Orientation"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Map Color Legend */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl shadow-lg z-30 text-[10px] text-slate-300">
            <div className="font-semibold text-slate-200 mb-1.5 flex items-center justify-between gap-2">
              <span>{activeLayer.toUpperCase()} SCALE</span>
              <span className="text-[9px] text-slate-400">24 Districts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#10b981]" />
              <span>Low</span>
              <span className="w-3 h-3 rounded-sm bg-[#0d9488] ml-1" />
              <span>Med</span>
              <span className="w-3 h-3 rounded-sm bg-[#ea580c] ml-1" />
              <span>High</span>
              <span className="w-3 h-3 rounded-sm bg-[#be123c] ml-1" />
              <span>Critical</span>
            </div>
          </div>
        </div>

        {/* Right District Inspector Drawer (30% on desktop) */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col p-4 sm:p-5 text-white overflow-y-auto">
          {selectedDistrict ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                    {selectedDistrict.name}
                    <span className="text-xs px-2 py-0.5 rounded font-normal bg-slate-800 text-slate-300">
                      {selectedDistrict.division}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">District Administrative Unit</p>
                </div>
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* District Vital Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-medium">Logged Submissions</div>
                  <div className="text-lg font-bold text-white mt-0.5">{selectedDistrict.challenges}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {selectedDistrict.complaintsResolved} resolved
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-medium">Civic Backlog (SLA)</div>
                  <div className={`text-lg font-bold mt-0.5 ${selectedDistrict.civicBacklogCount >= 10 ? "text-rose-400" : "text-amber-400"}`}>
                    {selectedDistrict.civicBacklogCount}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {selectedDistrict.civicBacklogCount >= 10 ? "SLA Breached" : "Within Norms"}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-medium">Avg Triage Speed</div>
                  <div className="text-lg font-bold text-amber-300 mt-0.5 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    {selectedDistrict.triageHours} hrs
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">48h State Benchmark</div>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-medium">CSR Capital Inflow</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {selectedDistrict.csrDeployedCr} Cr
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{selectedDistrict.activeBuilds} Academic Builds</div>
                </div>
              </div>

              {/* Nodal Officer Details */}
              {selectedDistrict.nodalOfficer && (
                <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      District Nodal Officer (DNO)
                    </span>
                    {selectedDistrict.nodalOfficer.dscVerified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        DSC Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white">{selectedDistrict.nodalOfficer.name}</div>
                  <div className="text-xs text-slate-400">{selectedDistrict.nodalOfficer.designation}</div>

                  <div className="pt-2 border-t border-slate-700/60 space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${selectedDistrict.nodalOfficer.email}`} className="hover:text-amber-400 underline decoration-slate-600">
                        {selectedDistrict.nodalOfficer.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedDistrict.nodalOfficer.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* God-Mode Override CTA */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onSelectDistrictForOverride) {
                      onSelectDistrictForOverride(selectedDistrict.name);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Inspect & Override in Master Console
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 mb-3">
                <Building2 className="w-8 h-8 text-amber-500/70" />
              </div>
              <h5 className="font-bold text-white text-sm">District Inspection Console</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Click any district on the vector map or geo grid to inspect nodal officer details, civic backlogs, and trigger sovereign master overrides.
              </p>
              <div className="mt-5 p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-left w-full space-y-1.5 text-xs">
                <div className="text-slate-400 text-[11px] font-medium">Jharkhand Apex Overview:</div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Logged Issues:</span>
                  <span className="font-bold text-white">{stats.totalChallenges}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Distress / Critical:</span>
                  <span className="font-bold text-rose-400">{stats.criticalDistricts} Districts</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total CSR Capital:</span>
                  <span className="font-bold text-emerald-400">₹{stats.totalCsr} Cr</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Avg Triage Velocity:</span>
                  <span className="font-bold text-amber-400">{stats.avgSpeed} Hours</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
