"use client";

import { useState, Suspense } from "react";
import { 
  FolderKanban, 
  MapPin, 
  FileSignature, 
  IndianRupee
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { StatsSkeleton } from "@/components/ui/Skeletons";

import { 
  JHARKHAND_DISTRICTS, 
  GIS_PINS, 
  INITIAL_IP_QUEUE, 
  MASTER_PROJECTS_DATA, 
  IP_REGISTRY_LEDGER, 
  REPORT_TEMPLATES 
} from "./mockData";
import { DistrictData, GisMapPin, IpQueueItem, IpRegistryItem } from "./types";

import { GovNavbar } from "./components/GovNavbar";
import { GovGisMap } from "./components/GovGisMap";
import { GovIpQueue } from "./components/GovIpQueue";
import { GovProjectsView } from "./components/GovProjectsView";
import { GovDistrictsView } from "./components/GovDistrictsView";
import { GovIpRegistryView } from "./components/GovIpRegistryView";
import { GovReportsView } from "./components/GovReportsView";
import { GovSettingsModal } from "./components/GovSettingsModal";

function GovDashboardContent() {
  const { isLoading: isAuthLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dynamic state that responds to user actions across tabs
  const [districts, setDistricts] = useState<DistrictData[]>(JHARKHAND_DISTRICTS);
  const [pins, setPins] = useState<GisMapPin[]>(GIS_PINS);
  const [ipQueue, setIpQueue] = useState<IpQueueItem[]>(INITIAL_IP_QUEUE);
  const [ipLedger, setIpLedger] = useState<IpRegistryItem[]>(IP_REGISTRY_LEDGER);
  const [totalDeployedCr, setTotalDeployedCr] = useState(4.2);

  if (isAuthLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <StatsSkeleton count={4} />
      </div>
    );
  }

  // Handle Seed Grant Allocation on Amber Alert pins
  const handleGrantAllocated = (pinId: string, amountCr: number) => {
    setPins((prev) =>
      prev.map((p) => {
        if (p.id === pinId) {
          return {
            ...p,
            subtitle: "State Seed Grant Allocated (₹25 Lakhs Active)",
            details: {
              ...p.details,
              urgency: "Medium",
            },
          };
        }
        return p;
      })
    );
    setTotalDeployedCr((prev) => +(prev + amountCr).toFixed(2));
  };

  // Handle IP Certificate Issuance from Queue
  const handleCertificateIssued = (itemId: string) => {
    const itemToRegister = ipQueue.find((i) => i.id === itemId);

    setIpQueue((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            registered: true,
            status: "Bilateral DSC Verified",
            compliant: true,
          };
        }
        return item;
      })
    );

    if (itemToRegister && !ipLedger.some((l) => l.id === `REG-${itemToRegister.id}`)) {
      setIpLedger((prev) => [
        {
          id: `REG-${itemToRegister.id}`,
          title: itemToRegister.projectName,
          hostUniversity: itemToRegister.hostUniversity,
          ttoSignatory: "Prof. Dean (R&D)",
          corporateSponsor: itemToRegister.corporatePartner,
          corporateLegalOfficer: "Head Corporate Legal",
          negotiatedSplit: "50% University / 50% Industry",
          uniSharePercent: 50,
          corpSharePercent: 50,
          hash: itemToRegister.hash,
          status: "Registered & Locked",
          licenseType: "Commercial Co-Ownership License",
          royaltiesDistributedCr: 0.1,
          registrationDate: new Date().toISOString().split("T")[0],
          patentNumber: `IN-2026-JH-${Math.floor(10000 + Math.random() * 90000)}`,
        },
        ...prev,
      ]);
    }
  };

  // Handle DNO update from Settings
  const handleUpdateOfficer = (districtId: string, officerName: string, email: string, phone: string) => {
    setDistricts((prev) =>
      prev.map((d) => {
        if (d.id === districtId) {
          return {
            ...d,
            nodalOfficer: {
              ...d.nodalOfficer,
              name: officerName,
              email: email,
              phone: phone,
            },
          };
        }
        return d;
      })
    );
  };

  const kpis = [
    { 
      label: "Districts Monitored", 
      value: `${districts.length}`, 
      subtitle: "100% Administrative Coverage",
      icon: <MapPin className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 border-blue-100"
    },
    { 
      label: "Active Civic R&D Projects", 
      value: "186", 
      subtitle: "University Lab Prototypes",
      icon: <FolderKanban className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-100"
    },
    { 
      label: "CSR Milestone Funds Deployed", 
      value: `₹${totalDeployedCr.toFixed(2)} Cr`, 
      subtitle: "Escrow Milestone Tranches",
      icon: <IndianRupee className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50 border-purple-100"
    },
    { 
      label: "Patents & Commercial Licenses Logged", 
      value: "38", 
      subtitle: "Tripartite Legal Deeds",
      icon: <FileSignature className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 border-amber-100"
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Sub-tab Navigation Bar */}
      <GovNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace based on activeTab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* 4 Statewide Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`p-3.5 rounded-2xl border ${kpi.bg}`}>
                  {kpi.icon}
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    {kpi.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {kpi.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2-Column Telemetry Grid: GIS Map (Left) & IP Compliance Queue (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left 2 Cols: Regional GIS Telemetry Map */}
            <div className="xl:col-span-2">
              <GovGisMap
                districts={districts}
                pins={pins}
                onGrantAllocated={handleGrantAllocated}
                totalDeployedCr={totalDeployedCr}
              />
            </div>

            {/* Right 1 Col: State IP Compliance & Registration Queue */}
            <div className="xl:col-span-1 min-h-[520px]">
              <GovIpQueue
                queue={ipQueue}
                onCertificateIssued={handleCertificateIssued}
              />
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <GovProjectsView projects={MASTER_PROJECTS_DATA} />
      )}

      {/* Districts Tab */}
      {activeTab === "districts" && (
        <GovDistrictsView
          districts={districts}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* IP Registry Tab */}
      {activeTab === "ip" && (
        <GovIpRegistryView ledger={ipLedger} />
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <GovReportsView
          reportTemplates={REPORT_TEMPLATES}
          projects={MASTER_PROJECTS_DATA}
          districts={districts}
          totalDeployedCr={totalDeployedCr}
        />
      )}

      {/* DNO Settings & Credential Management Modal */}
      <GovSettingsModal
        districts={districts}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateOfficer={handleUpdateOfficer}
      />
    </div>
  );
}

export default function GovDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <StatsSkeleton count={4} />
        </div>
      }
    >
      <GovDashboardContent />
    </Suspense>
  );
}
