import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );
}
