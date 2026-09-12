import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Study and Innovation Portal | Solve Real Challenges",
  description: "A digital platform crowdsourcing local challenges and facilitating collaborative problem solving across Jharkhand.",
  manifest: "/manifest.json",
};

import { NetworkBanner } from "@/components/ui/NetworkBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <NetworkBanner />
        {children}
      </body>
    </html>
  );
}
