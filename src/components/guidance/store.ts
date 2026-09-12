import { create } from "zustand";
import { GuidanceRole, GUIDANCE_STORAGE_KEYS } from "./types";

function getStoredItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore in private browsing or storage quota errors
  }
}

function removeStoredItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export interface GuidanceState {
  // Layer 1 Onboarding
  isOnboardingOpen: boolean;
  activeOnboardingRole: GuidanceRole;
  completedOnboardings: Record<GuidanceRole, boolean>;
  openOnboarding: (role?: GuidanceRole) => void;
  closeOnboarding: () => void;
  completeOnboarding: (role: GuidanceRole) => void;
  resetOnboarding: (role?: GuidanceRole) => void;

  // Layer 2 Informational Modals
  isWhatHappensModalOpen: boolean;
  isIpRightsModalOpen: boolean;
  isFundingTiersModalOpen: boolean;
  openWhatHappensModal: () => void;
  closeWhatHappensModal: () => void;
  openIpRightsModal: () => void;
  closeIpRightsModal: () => void;
  openFundingTiersModal: () => void;
  closeFundingTiersModal: () => void;

  // Layer 4 Legal Modals
  isPrivacyPolicyModalOpen: boolean;
  isTermsModalOpen: boolean;
  openPrivacyPolicyModal: () => void;
  closePrivacyPolicyModal: () => void;
  openTermsModal: () => void;
  closeTermsModal: () => void;

  // Layer 5 Checklists & Guidance Cards
  checklistStates: Record<string, Record<string, boolean>>;
  collapsedCards: Record<string, boolean>;
  toggleChecklistItem: (cardKey: string, itemId: string) => void;
  setChecklistItem: (cardKey: string, itemId: string, completed: boolean) => void;
  resetChecklist: (cardKey: string) => void;
  toggleCardCollapse: (cardKey: string) => void;
  setCardCollapse: (cardKey: string, collapsed: boolean) => void;

  // Hydration & Persistence
  isHydrated: boolean;
  initFromStorage: () => void;
}

const DEFAULT_COMPLETED_ONBOARDINGS: Record<GuidanceRole, boolean> = {
  citizen: false,
  university: false,
  industry: false,
  government: false,
  local_body: false,
};

export const useGuidanceStore = create<GuidanceState>((set, get) => ({
  // Layer 1 Onboarding
  isOnboardingOpen: false,
  activeOnboardingRole: "citizen",
  completedOnboardings: { ...DEFAULT_COMPLETED_ONBOARDINGS },

  openOnboarding: (role = "citizen") =>
    set({
      isOnboardingOpen: true,
      activeOnboardingRole: role,
    }),

  closeOnboarding: () =>
    set({
      isOnboardingOpen: false,
    }),

  completeOnboarding: (role: GuidanceRole) => {
    const updated = {
      ...get().completedOnboardings,
      [role]: true,
    };
    set({
      completedOnboardings: updated,
      isOnboardingOpen: false,
    });
    setStoredItem(`${GUIDANCE_STORAGE_KEYS.ONBOARDING_ROLE_PREFIX}${role}`, "true");
    if (role === "citizen") {
      setStoredItem(GUIDANCE_STORAGE_KEYS.CITIZEN_ONBOARDED, "true");
    }
  },

  resetOnboarding: (role?: GuidanceRole) => {
    if (role) {
      const updated = {
        ...get().completedOnboardings,
        [role]: false,
      };
      set({ completedOnboardings: updated });
      removeStoredItem(`${GUIDANCE_STORAGE_KEYS.ONBOARDING_ROLE_PREFIX}${role}`);
      if (role === "citizen") {
        removeStoredItem(GUIDANCE_STORAGE_KEYS.CITIZEN_ONBOARDED);
      }
    } else {
      set({ completedOnboardings: { ...DEFAULT_COMPLETED_ONBOARDINGS } });
      (Object.keys(DEFAULT_COMPLETED_ONBOARDINGS) as GuidanceRole[]).forEach((r) => {
        removeStoredItem(`${GUIDANCE_STORAGE_KEYS.ONBOARDING_ROLE_PREFIX}${r}`);
      });
      removeStoredItem(GUIDANCE_STORAGE_KEYS.CITIZEN_ONBOARDED);
    }
  },

  // Layer 2 Informational Modals
  isWhatHappensModalOpen: false,
  isIpRightsModalOpen: false,
  isFundingTiersModalOpen: false,

  openWhatHappensModal: () => set({ isWhatHappensModalOpen: true }),
  closeWhatHappensModal: () => set({ isWhatHappensModalOpen: false }),

  openIpRightsModal: () => set({ isIpRightsModalOpen: true }),
  closeIpRightsModal: () => set({ isIpRightsModalOpen: false }),

  openFundingTiersModal: () => set({ isFundingTiersModalOpen: true }),
  closeFundingTiersModal: () => set({ isFundingTiersModalOpen: false }),

  // Layer 4 Legal Modals
  isPrivacyPolicyModalOpen: false,
  isTermsModalOpen: false,

  openPrivacyPolicyModal: () => set({ isPrivacyPolicyModalOpen: true }),
  closePrivacyPolicyModal: () => set({ isPrivacyPolicyModalOpen: false }),

  openTermsModal: () => set({ isTermsModalOpen: true }),
  closeTermsModal: () => set({ isTermsModalOpen: false }),

  // Layer 5 Checklists
  checklistStates: {},
  collapsedCards: {},

  toggleChecklistItem: (cardKey: string, itemId: string) => {
    const currentCard = get().checklistStates[cardKey] || {};
    const updatedCard = {
      ...currentCard,
      [itemId]: !currentCard[itemId],
    };
    const updatedAll = {
      ...get().checklistStates,
      [cardKey]: updatedCard,
    };
    set({ checklistStates: updatedAll });
    setStoredItem(cardKey, JSON.stringify(updatedCard));
  },

  setChecklistItem: (cardKey: string, itemId: string, completed: boolean) => {
    const currentCard = get().checklistStates[cardKey] || {};
    const updatedCard = {
      ...currentCard,
      [itemId]: completed,
    };
    const updatedAll = {
      ...get().checklistStates,
      [cardKey]: updatedCard,
    };
    set({ checklistStates: updatedAll });
    setStoredItem(cardKey, JSON.stringify(updatedCard));
  },

  resetChecklist: (cardKey: string) => {
    const updatedAll = {
      ...get().checklistStates,
      [cardKey]: {},
    };
    set({ checklistStates: updatedAll });
    removeStoredItem(cardKey);
  },

  toggleCardCollapse: (cardKey: string) => {
    const current = !!get().collapsedCards[cardKey];
    const updated = {
      ...get().collapsedCards,
      [cardKey]: !current,
    };
    set({ collapsedCards: updated });
    setStoredItem(`${GUIDANCE_STORAGE_KEYS.CARD_COLLAPSED_PREFIX}${cardKey}`, String(!current));
  },

  setCardCollapse: (cardKey: string, collapsed: boolean) => {
    const updated = {
      ...get().collapsedCards,
      [cardKey]: collapsed,
    };
    set({ collapsedCards: updated });
    setStoredItem(`${GUIDANCE_STORAGE_KEYS.CARD_COLLAPSED_PREFIX}${cardKey}`, String(collapsed));
  },

  // Hydration initialization from browser localStorage
  isHydrated: false,

  initFromStorage: () => {
    if (get().isHydrated || typeof window === "undefined") return;

    try {
      // 1. Recover completed onboardings
      const roles: GuidanceRole[] = ["citizen", "university", "industry", "government", "local_body"];
      const loadedOnboardings: Record<GuidanceRole, boolean> = { ...DEFAULT_COMPLETED_ONBOARDINGS };

      roles.forEach((r) => {
        const directKey = getStoredItem(`${GUIDANCE_STORAGE_KEYS.ONBOARDING_ROLE_PREFIX}${r}`);
        const citizenAlias = r === "citizen" ? getStoredItem(GUIDANCE_STORAGE_KEYS.CITIZEN_ONBOARDED) : null;
        loadedOnboardings[r] = directKey === "true" || citizenAlias === "true";
      });

      // 2. Recover known checklist states
      const checklistKeys = [
        GUIDANCE_STORAGE_KEYS.CHECKLIST_UNIVERSITY,
        GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY,
        GUIDANCE_STORAGE_KEYS.CHECKLIST_GOV,
        GUIDANCE_STORAGE_KEYS.CHECKLIST_TRACK,
      ];

      const loadedChecklists: Record<string, Record<string, boolean>> = {};
      checklistKeys.forEach((key) => {
        const raw = getStoredItem(key);
        if (raw) {
          try {
            loadedChecklists[key] = JSON.parse(raw);
          } catch {
            // ignore JSON parse error
          }
        }
      });

      // 3. Recover collapsed cards
      const loadedCollapsed: Record<string, boolean> = {};
      checklistKeys.forEach((key) => {
        const raw = getStoredItem(`${GUIDANCE_STORAGE_KEYS.CARD_COLLAPSED_PREFIX}${key}`);
        if (raw === "true") {
          loadedCollapsed[key] = true;
        }
      });

      set({
        completedOnboardings: loadedOnboardings,
        checklistStates: loadedChecklists,
        collapsedCards: loadedCollapsed,
        isHydrated: true,
      });
    } catch (err) {
      console.warn("Could not synchronize guidance store with localStorage:", err);
      set({ isHydrated: true });
    }
  },
}));
