import type { Metadata } from "next";

import "./globals.css";
import { NetworkBanner } from "@/components/ui/NetworkBanner";
import { GovernmentHeader } from "@/components/layout/GovernmentHeader";
import { GovernmentFooter } from "@/components/layout/GovernmentFooter";
import { GuidanceHost } from "@/components/guidance/GuidanceHost";





export const metadata: Metadata = {
  title: "PRAGATI / JSICP | Solve Real Challenges",
  description:
    "A digital platform crowdsourcing local challenges and facilitating collaborative problem solving across Jharkhand.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
        <NetworkBanner />
        <GovernmentHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
          {children}
        </main>
        <GovernmentFooter />
        <GuidanceHost />
      </body>
    </html>
  );
}

