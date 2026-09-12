"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { PrivacyPolicyModal } from "./Layer4_LegalFooter/PrivacyPolicyModal";
import { TermsModal } from "./Layer4_LegalFooter/TermsModal";
import { CitizenOnboardingModal } from "./Layer1_Onboarding/CitizenOnboardingModal";
import { RoleOnboardingModal } from "./Layer1_Onboarding/RoleOnboardingModal";
import { WhatHappensAfterSubmitModal } from "./Layer2_Tooltips/WhatHappensAfterSubmitModal";
import { IpRightsModal } from "./Layer2_Tooltips/IpRightsModal";
import { FundingTiersModal } from "./Layer2_Tooltips/FundingTiersModal";
import { useGuidanceStore } from "./store";
import { GUIDANCE_STORAGE_KEYS } from "./types";

const emptySubscribe = () => () => {};

/**
 * SSR-safe mounted hook using React 19's useSyncExternalStore.
 * Avoids cascading renders or setState inside useEffect.
 */
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * GuidanceHost is the global client component mounted in RootLayout.
 * It ensures:
 * 1. Safe SSR hydration via useSyncExternalStore.
 * 2. Automatic synchronization of user preferences, onboarding completion,
 *    and checklist states from `localStorage`.
 * 3. Mounting of global statutory dialogs (Privacy Policy Modal, Terms Modal).
 * 4. Mounting of Layer 1 First-Time User Onboarding Modals (Citizen & Role).
 * 5. Mounting of Layer 2 Informational Modals (What Happens, IP Rights, Funding Tiers).
 * 6. Automated first-time visit onboarding detection.
 */
export function GuidanceHost() {
  const isMounted = useIsMounted();
  const initFromStorage = useGuidanceStore((state) => state.initFromStorage);

  useEffect(() => {
    initFromStorage();

    // Automatic first-visit onboarding check per route
    if (typeof window !== "undefined") {
      try {
        const pathname = window.location.pathname;

        if (pathname.startsWith("/dashboard/university")) {
          const isUnivOnboarded =
            window.localStorage.getItem(`${GUIDANCE_STORAGE_KEYS.ONBOARDING_ROLE_PREFIX}university`) === "true";
          if (!isUnivOnboarded) {
            useGuidanceStore.getState().openOnboarding("university");
          }
        } else if (pathname.startsWith("/dashboard/industry")) {
          const isIndOnboarded =
            window.localStorage.getItem(`${GUIDANCE_STORAGE_KEYS.ONBOARDING_ROLE_PREFIX}industry`) === "true";
          if (!isIndOnboarded) {
            useGuidanceStore.getState().openOnboarding("industry");
          }
        } else if (pathname.startsWith("/dashboard/state") || pathname.startsWith("/dashboard/gov")) {
          const isGovOnboarded =
            window.localStorage.getItem(`${GUIDANCE_STORAGE_KEYS.ONBOARDING_ROLE_PREFIX}government`) === "true";
          if (!isGovOnboarded) {
            useGuidanceStore.getState().openOnboarding("government");
          }
        } else if (pathname === "/submit" || pathname === "/" || pathname === "/track") {
          const isCitizenOnboarded =
            window.localStorage.getItem(GUIDANCE_STORAGE_KEYS.CITIZEN_ONBOARDED) === "true";
          if (!isCitizenOnboarded) {
            useGuidanceStore.getState().openOnboarding("citizen");
          }
        }
      } catch {
        // Ignore local storage security errors in private browsing
      }
    }
  }, [initFromStorage]);

  if (!isMounted) return null;

  return (
    <>
      <CitizenOnboardingModal />
      <RoleOnboardingModal />
      <WhatHappensAfterSubmitModal />
      <IpRightsModal />
      <FundingTiersModal />
      <PrivacyPolicyModal />
      <TermsModal />
    </>
  );
}
