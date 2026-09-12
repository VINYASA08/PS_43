"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2 mx-auto">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>
          You are currently offline. Actions will be synchronized when connection to Jharkhand Portal is restored.
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    </div>
  );
}
