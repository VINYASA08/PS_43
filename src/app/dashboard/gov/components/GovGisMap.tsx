"use client";

import { useState, useRef, useMemo } from "react";
import { DistrictData, GisMapPin, MapLayer, DepartmentFilterType } from "../types";
import { 
  Plus, 
  Minus, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Compass, 
  IndianRupee,
  Map as MapIcon
} from "lucide-react";
import { PinDetailModal } from "./PinDetailModal";
import { SeedGrantModal } from "./SeedGrantModal";

interface GovGisMapProps {
  districts: DistrictData[];
  pins: GisMapPin[];
  onGrantAllocated: (pinId: string, amountCr: number) => void;
  totalDeployedCr: number;
}

export function GovGisMap({ districts, pins, onGrantAllocated, totalDeployedCr }: GovGisMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayer>("density");
  const [activeDept, setActiveDept] = useState<DepartmentFilterType>("All");
  
  // Tooltip tracking
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Modals
  const [selectedPin, setSelectedPin] = useState<GisMapPin | null>(null);
  const [isSeedGrantOpen, setIsSeedGrantOpen] = useState(false);
  const [isPinDetailOpen, setIsPinDetailOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 2.75));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 1));
  const handleResetOrientation = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Color calculation by layer
  const getDistrictFill = (d: DistrictData) => {
    if (activeLayer === "density") {
      if (d.civicBacklogCount >= 14 && d.activeBuilds < 10) return "#d97706"; // Amber backlog
      if (d.activeBuilds >= 20) return "#047857"; // Dark Emerald
      if (d.activeBuilds >= 10) return "#059669"; // Medium Emerald
      if (d.activeBuilds >= 5) return "#10b981"; // Light Emerald
      return "#6ee7b7"; // Pale Mint
    }

    if (activeLayer === "csr") {
      if (d.csrDeployedCr >= 0.8) return "#065f46"; // Deep CSR
      if (d.csrDeployedCr >= 0.3) return "#0d9488"; // Medium CSR
      if (d.csrDeployedCr >= 0.1) return "#2dd4bf"; // Light CSR
      return "#99f6e4"; // Minimal CSR
    }

    if (activeLayer === "civic") {
      if (d.civicBacklogCount >= 15) return "#be123c"; // Crimson distress
      if (d.civicBacklogCount >= 9) return "#f59e0b"; // Amber moderate
      return "#10b981"; // Stable
    }

    return "#10b981";
  };

  // Filter pins based on Department selection
  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      if (activeDept === "All") return true;
      return p.department === activeDept;
    });
  }, [pins, activeDept]);

  // Handle pin click
  const handlePinClick = (pin: GisMapPin) => {
    setSelectedPin(pin);
    if (pin.type === "amber_alert") {
      setIsSeedGrantOpen(true);
    } else {
      setIsPinDetailOpen(true);
    }
  };

  // SVG mouse move for tooltip positioning
  const handleSvgMouseMove = (e: React.MouseEvent<SVGElement>, d: DistrictData) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const clampedX = Math.min(Math.max(rawX + 14, 10), rect.width - 270);
    const clampedY = Math.min(Math.max(rawY - 120, 10), rect.height - 180);
    setTooltipPos({ x: clampedX, y: clampedY });
    setHoveredDistrict(d);
  };

  const handleSvgMouseLeave = () => {
    setHoveredDistrict(null);
  };

  // Funding gauge values
  const targetFundsCr = 5.8;
  const utilizationPct = Math.min(Math.round((totalDeployedCr / targetFundsCr) * 100), 100);

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "relative"
      }`}
    >
      {/* Top Map Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur z-20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              Regional GIS Telemetry Map
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                24 Districts Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Interactive vector telemetry across academic labs, testing grounds & civic distress zones
            </p>
          </div>
        </div>

        {/* Filters & Control Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Layer Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            {(
              [
                { id: "density", label: "Innovation Density" },
                { id: "csr", label: "CSR Escrow Capital" },
                { id: "civic", label: "Civic Influx" },
              ] as const
            ).map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                  activeLayer === layer.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative">
            <select
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value as DepartmentFilterType)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Water">Drinking Water & Sanitation</option>
              <option value="Roads">Road Construction</option>
              <option value="Energy">Energy & Power</option>
              <option value="Urban">Urban Development</option>
            </select>
          </div>

          {/* Compass Reset */}
          <button
            onClick={handleResetOrientation}
            title="Reset to True North (1.0x Macro View)"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Command Wall"}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Canvas Workspace */}
      <div className="flex-1 bg-slate-900 relative min-h-[460px] overflow-hidden select-none">
        
        {/* Zoom Controls Overlay (Top-Left) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col bg-slate-800/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-700 overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 hover:bg-slate-700 text-slate-200 border-b border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Pin Legend Banner (Top-Center) */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Academic Labs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Corporate Sponsors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Active Trials</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <span className="text-rose-300 font-bold">Civic Distress (Seed Grant)</span>
          </div>
        </div>

        {/* SVG Map of Jharkhand */}
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full object-contain transition-transform duration-300 cursor-grab"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: "center center",
          }}
          onMouseLeave={handleSvgMouseLeave}
        >
          {/* Subtle Geographic Background Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#0b1329" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* District Polygons */}
          <g>
            {districts.map((d) => {
              const isHovered = hoveredDistrict?.id === d.id;
              const fillColor = getDistrictFill(d);

              return (
                <g key={d.id} className="transition-all duration-200">
                  <path
                    d={d.path}
                    fill={fillColor}
                    stroke={isHovered ? "#ffffff" : "#1e293b"}
                    strokeWidth={isHovered ? "3" : "1.5"}
                    fillOpacity={isHovered ? 1 : 0.85}
                    className="cursor-pointer transition-all duration-150 hover:brightness-125"
                    onMouseMove={(e) => handleSvgMouseMove(e, d)}
                  />
                  {/* District Name Label */}
                  <text
                    x={d.center[0]}
                    y={d.center[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    letterSpacing="0.5"
                    pointerEvents="none"
                    className="select-none drop-shadow-md"
                  >
                    {d.name}
                  </text>
                  <text
                    x={d.center[0]}
                    y={d.center[1] + 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#e2e8f0"
                    fontSize="8"
                    opacity="0.9"
                    pointerEvents="none"
                    className="font-mono select-none"
                  >
                    {activeLayer === "density" && `${d.activeBuilds} builds`}
                    {activeLayer === "csr" && `₹${d.csrDeployedCr} Cr`}
                    {activeLayer === "civic" && `${d.civicBacklogCount} backlog`}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Interactive GIS Pins */}
          <g>
            {filteredPins.map((pin) => {
              const isAmber = pin.type === "amber_alert";
              return (
                <g
                  key={pin.id}
                  transform={`translate(${pin.x}, ${pin.y})`}
                  onClick={() => handlePinClick(pin)}
                  className="cursor-pointer group"
                >
                  {/* Pulse circle for Amber Alert pins */}
                  {isAmber && (
                    <circle
                      r="16"
                      fill="#ef4444"
                      opacity="0.35"
                      className="animate-ping"
                    />
                  )}

                  {/* Pin Background Bubble */}
                  <circle
                    r="12"
                    fill={
                      pin.type === "academic"
                        ? "#4f46e5"
                        : pin.type === "corporate"
                        ? "#059669"
                        : pin.type === "bench_trial"
                        ? "#d97706"
                        : "#dc2626"
                    }
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-transform duration-150 group-hover:scale-125 drop-shadow-lg"
                  />

                  {/* Icon Representation */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {pin.type === "academic" && "🎓"}
                    {pin.type === "corporate" && "🏭"}
                    {pin.type === "bench_trial" && "⚗️"}
                    {pin.type === "amber_alert" && "⚠️"}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 4-Data-Point Interactive Hover Telemetry Tooltip */}
        {hoveredDistrict && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >
            <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 w-64 space-y-2.5 text-xs animate-in fade-in zoom-in-95 duration-100">
              {/* Header */}
              <div className="border-b border-slate-800 pb-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-emerald-400">
                    {hoveredDistrict.name} District
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {hoveredDistrict.division}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Nodal: {hoveredDistrict.nodalOfficer.name}
                </p>
              </div>

              {/* 4 Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">1. Active Builds</span>
                  <strong className="text-white text-sm">{hoveredDistrict.activeBuilds} Labs</strong>
                </div>
                <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">2. CSR Deployed</span>
                  <strong className="text-emerald-400 text-sm font-mono">₹{hoveredDistrict.csrDeployedCr} Cr</strong>
                </div>
              </div>

              <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">3. Triage Ratio</span>
                  <span className="font-mono text-blue-400 font-bold">
                    {hoveredDistrict.triageMunicipalPercent}% Muni / {hoveredDistrict.triageAcademicPercent}% Acad
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-500 h-full" 
                    style={{ width: `${hoveredDistrict.triageMunicipalPercent}%` }} 
                  />
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${hoveredDistrict.triageAcademicPercent}%` }} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>4. Citizen Backlog:</span>
                <span className={`font-bold ${
                  hoveredDistrict.civicBacklogCount > 12 ? "text-rose-400" : "text-emerald-400"
                }`}>
                  {hoveredDistrict.civicBacklogCount} unresolved issues
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom-Right Dynamic Legend */}
        <div className="absolute bottom-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white text-[11px] space-y-2 shadow-2xl">
          <div className="font-bold flex items-center justify-between gap-3 text-slate-300 text-xs">
            <span>
              {activeLayer === "density" && "Innovation Density (Builds)"}
              {activeLayer === "csr" && "CSR Escrow Tranches (Cr)"}
              {activeLayer === "civic" && "Civic Backlog Severity"}
            </span>
          </div>

          <div className="space-y-1">
            {activeLayer === "density" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#047857]" />
                  <span className="text-slate-300">20+ Active Builds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#059669]" />
                  <span className="text-slate-300">10-19 Active Builds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#6ee7b7]" />
                  <span className="text-slate-300">1-9 Active Builds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#d97706]" />
                  <span className="text-amber-300">High Civic Backlog (&gt;12)</span>
                </div>
              </>
            )}

            {activeLayer === "csr" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#065f46]" />
                  <span className="text-slate-300">≥ ₹0.80 Cr Escrow</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#0d9488]" />
                  <span className="text-slate-300">₹0.30 - 0.79 Cr</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#99f6e4]" />
                  <span className="text-slate-300">&lt; ₹0.30 Cr</span>
                </div>
              </>
            )}

            {activeLayer === "civic" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#be123c]" />
                  <span className="text-rose-300">Critical Backlog (&gt;15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
                  <span className="text-amber-300">Moderate Backlog (8-15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#10b981]" />
                  <span className="text-emerald-300">Low Backlog (&lt;8)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom-Left Live Funding Utilization Gauge */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 text-white w-64 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              Statewide CSR Funding Gauge
            </span>
            <span className="text-xs font-black text-emerald-400 font-mono">
              {utilizationPct}%
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${utilizationPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Deployed: <strong>₹{totalDeployedCr.toFixed(2)} Cr</strong></span>
            <span>Target: <strong>₹{targetFundsCr.toFixed(1)} Cr</strong></span>
          </div>
        </div>

      </div>

      {/* Modals for Pins */}
      <SeedGrantModal
        pin={selectedPin}
        isOpen={isSeedGrantOpen}
        onClose={() => setIsSeedGrantOpen(false)}
        onGrantAllocated={onGrantAllocated}
      />

      <PinDetailModal
        pin={selectedPin}
        isOpen={isPinDetailOpen}
        onClose={() => setIsPinDetailOpen(false)}
      />
    </div>
  );
}
