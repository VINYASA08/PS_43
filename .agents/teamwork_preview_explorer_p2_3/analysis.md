# Frontend Mock Data Replacement, Route Guards & UX States Architecture

**Explorer 3 Investigation Report**  
**Target Workspace:** `a:\Development\Antigravity\SIH26043\web`  
**Date:** 2026-09-04  
**Status:** Complete Read-Only Exploration  

---

## 1. Executive Summary & Architecture Overview

The Jharkhand Societal Innovation Portal frontend (`web`) is built with **Next.js 16.3.4 (App Router)**, **React 19.2.8**, **Tailwind CSS v4**, **Framer Motion 13.2.0**, **Lucide React 1.41.0**, and **Zustand 5.0.15**.

Currently, all 16 pages across `src/app` render client-side interactive UI components populated entirely with static, hardcoded mock datasets, simulated `setTimeout` delays, and mock state transitions. No real API routes or database queries are yet invoked. Furthermore, the dashboard layout determines the user's role purely through URL substring matching (`pathname.includes("/dashboard/gov")`) rather than an authenticated session token, and route navigation has zero backend or client-side role guards.

This report establishes the complete blueprint for:
1. **Systematic Mock Data Replacement**: Mapping all 16 pages to concrete database models and planned RESTful JSON API endpoints.
2. **Global Authentication State & RBAC Route Guards**: Integrating Zustand (`useAuthStore`) with HttpOnly session cookies, `/api/auth/me`, automated 401 session expiration banners, and zero-flash role-based redirect guards.
3. **Dynamic UI Rendering**: Granular permission checks controlling action buttons (e.g. "Fund Project", "Draft Proposal", "SLA Escalation") and navigation links.
4. **UX Edge States**: Production-grade skeleton loading screens, tailored empty states with clear CTAs, network resilience/offline queuing, and CSRF token propagation.

---

## 2. Exhaustive Page-by-Page Audit & Mapping

Below is the exhaustive mapping for all 16 routes in `web/src/app`.

---

### 2.1 `/` — Public Landing Page
- **File:** `src/app/page.tsx`
- **Current Mock Data:**
  - `baseChallenges` & `additionalChallenges` (lines 10–19): Array of 6 items (`id`, `title`, `location`, `domain`, `urgency`, `status`).
  - Live Impact Metrics (lines 118–134): Total Submissions (`1,248`), Active Prototypes (`156`), Problems Resolved (`342`), Engaged Experts (`89`).
  - Top Navigation (lines 25–53): Static buttons for "Portal Login" and "Submit a Problem" without auth state.
- **Target Database Tables & Fields:**
  - `Challenges`: `id`, `title`, `district`, `domain`, `urgency`, `status`, `createdAt`.
  - Aggregations from `Challenges`, `Proposals`, `Users`:
    - Total Submissions: `SELECT COUNT(*) FROM "Challenges" WHERE "deletedAt" IS NULL;`
    - Active Prototypes: `SELECT COUNT(*) FROM "Proposals" WHERE "status" IN ('shortlisted', 'approved', 'funded');`
    - Problems Resolved: `SELECT COUNT(*) FROM "Challenges" WHERE "status" = 'resolved';`
    - Engaged Experts: `SELECT COUNT(*) FROM "Users" WHERE "role" = 'expert' AND "status" = 'active';`
- **Planned API Endpoints:**
  - `GET /api/analytics/public-impact`
    - Response: `{ totalSubmissions: number, activePrototypes: number, problemsResolved: number, engagedExperts: number }`
  - `GET /api/challenges?status=open&limit=6`
    - Response: `{ challenges: Array<{ id: string, title: string, location: string, domain: string, urgency: string, status: string }> }`
- **Frontend Hook Specification:**
  ```typescript
  // src/hooks/useLandingData.ts
  export function usePublicImpactMetrics(): {
    metrics: { totalSubmissions: number; activePrototypes: number; problemsResolved: number; engagedExperts: number } | null;
    isLoading: boolean;
    error: Error | null;
  };

  export function useFeaturedChallenges(limit: number = 6): {
    challenges: Array<ChallengeListItem>;
    isLoading: boolean;
    error: Error | null;
  };
  ```

---

### 2.2 `/login` — Tiered Authentication & Persona Gateway
- **File:** `src/app/login/page.tsx`
- **Current Mock Data:**
  - `roles` array (lines 25–96): 5 persona cards (`gov`, `university`, `industry`, `expert`, `citizen`) with mock email credentials (`nodal.innovation@jharkhand.gov.in`, `pi.water@iitism.ac.in`, `csr.director@tatasteel.com`, `dr.sen.mentor@isro-alumni.res.in`, `citizen.reporter@jharkhand.org`).
  - `handleSeamlessLogin` (lines 98–104): A mock timer `setTimeout(() => router.push(role.href), 1200)`.
- **Target Database Tables & Fields:**
  - `Users`: `id`, `email`, `phone`, `passwordHash`, `role`, `status`, `organization`, `designation`, `twoFactorEnabled`, `twoFactorSecret`, `failedLoginAttempts`, `lockoutUntil`.
  - `AuditLogs`: `userId`, `action` (`LOGIN_ATTEMPT`, `LOGIN_SUCCESS`, `LOGIN_FAILED`), `ipAddress`, `userAgent`.
- **Planned API Endpoints:**
  - `POST /api/auth/login`:
    - Request: `{ emailOrPhone: string, password?: string, role?: string }`
    - Response: `{ requiresOtp?: boolean, requires2FA?: boolean, user?: UserProfile }`
  - `POST /api/auth/verify-otp`:
    - Request: `{ phoneOrEmail: string, otp: string }`
    - Response: `{ user: UserProfile }` (Sets HttpOnly session cookie)
  - `POST /api/auth/totp-verify`:
    - Request: `{ email: string, totpCode: string }`
    - Response: `{ user: UserProfile }` (Sets HttpOnly session cookie)
  - `POST /api/auth/demo-switch` *(Dev Mode Only)*:
    - Request: `{ role: 'gov' | 'university' | 'industry' | 'expert' | 'citizen' }`
    - Response: `{ user: UserProfile }` (Sets authentic JWT cookie for quick verification)
- **Frontend Hook Specification:**
  ```typescript
  // src/hooks/useAuth.ts
  export function useAuth(): {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginInput) => Promise<AuthResult>;
    verifyOtp: (phone: string, code: string) => Promise<void>;
    verifyTotp: (code: string) => Promise<void>;
    demoLogin: (role: UserRole) => Promise<void>;
    logout: () => Promise<void>;
  };
  ```

---

### 2.3 `/dashboard` — Central Innovation Router & Multi-Tenant Gateway
- **File:** `src/app/dashboard/page.tsx`
- **Current Mock Data:**
  - `portals` array (lines 21–76): Static stats for Government (`Total Intake: 1,248`, `Active Triages: 156`, `SLA: 94.2%`), University (`Tasks: 12`, `Teams: 8`, `Proposals: 4`), Industry (`Proposals: 24`, `Committed: ₹8.5L`).
  - `recentChallenges` (lines 78–104): 3 static challenge rows (`JHR-2026-842`, `821`, `805`).
- **Target Database Tables & Fields:**
  - Aggregated across `Challenges`, `Proposals`, `FundingCommitments`.
  - `Challenges`: `id`, `title`, `domain`, `urgency`, `assignedTo`.
- **Planned API Endpoints:**
  - `GET /api/analytics/gateway-overview`
    - Response: `{ govStats: {...}, universityStats: {...}, industryStats: {...} }`
  - `GET /api/challenges?recent=true&limit=3`
    - Response: `{ challenges: Array<ChallengeSummary> }`
- **Frontend Hook Specification:**
  ```typescript
  export function useGatewayOverview(): {
    data: GatewayOverviewData | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  ```

---

### 2.4 `/dashboard/layout.tsx` — Dashboard Navigation Shell
- **File:** `src/app/dashboard/layout.tsx`
- **Current Mock Data:**
  - Lines 24–28: `isGov = pathname.includes("/dashboard/gov")`, `isUni`, `isInd`.
  - Static navigation lists (lines 38–74).
  - Sign Out link simply points to `/login` without clearing session state or calling logout.
- **Target Database Tables & Fields:**
  - Current authenticated user from `Users` via `/api/auth/me`.
- **Planned API Endpoints:**
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- **Frontend Integration:**
  - Connect to `useAuthStore` to dynamically render navigation items matching `user.role`.
  - Hide cross-role switcher links for non-admin accounts.
  - Implement real async `logout()` with redirect to `/login`.

---

### 2.5 `/dashboard/gov` — Government State Analytics & Challenge Ledger
- **File:** `src/app/dashboard/gov/page.tsx`
- **Current Mock Data:**
  - `stats` array (lines 37–42): Total Reported (`1,248`), Resolved (`342`), Prototyping (`156`), SLA Breaches (`42`).
  - `domainDistribution` (lines 44–50): Water Management (`420`), Agriculture (`310`), Healthcare (`245`), Education (`180`), Urban Infrastructure (`93`).
  - AI Triage Alert (line 259): `"12 new citizen issues have < 85% AI routing confidence"`.
  - Recent Updates list (lines 272–291): 3 hardcoded activity logs.
  - `allChallenges` ledger (lines 52–59): 6 static challenge items.
  - Export Triage Summary (lines 66–77): Pure client-side CSV string concatenation.
- **Target Database Tables & Fields:**
  - `Challenges`: `id`, `title`, `domain`, `district`, `status`, `urgency`, `assignedTo`, `slaDeadline`, `citizenVerified`, `escalationLevel`, `createdAt`.
  - `AuditLogs`: `action`, `resource`, `resourceId`, `createdAt`, `metadata`.
- **Planned API Endpoints:**
  - `GET /api/analytics/gov-metrics`
    - Response: `{ total: 1248, resolved: 342, prototyping: 156, slaBreaches: 42, trends: {...} }`
  - `GET /api/analytics/domains`
    - Response: `Array<{ domain: string, count: number }>`
  - `GET /api/challenges?domain={domain}&status={status}&search={search}&page={page}&limit={limit}`
    - Response: `{ challenges: Challenge[], total: number, page: number, totalPages: number }`
  - `GET /api/challenges/export?format=csv` (Streamed CSV download generated server-side)
  - `GET /api/audit-logs?limit=5`
    - Response: `Array<{ id: string, action: string, note: string, timeAgo: string }>`
- **Frontend Hook Specification:**
  ```typescript
  export function useGovDashboard(filters: { domain?: string; status?: string; page?: number }): {
    metrics: GovMetrics | null;
    domains: DomainStat[];
    challenges: ChallengeItem[];
    recentLogs: ActivityLog[];
    isLoading: boolean;
    isExporting: boolean;
    exportSummaryCsv: () => Promise<void>;
  };
  ```

---

### 2.6 `/dashboard/university` — Higher Education R&D Console
- **File:** `src/app/dashboard/university/page.tsx`
- **Current Mock Data:**
  - Metric counts (lines 145, 161, 177): Pending Review (`12`), Active Teams (`8`), Solutions Proposed (`4`).
  - `initialChallenges` (lines 33–70): 4 items (`CH-842`, `CH-843`, `CH-821`, `CH-809`) with priority and status.
- **Target Database Tables & Fields:**
  - `Challenges`: `id`, `title`, `domain`, `urgency`, `status`, `assignedTo`, `createdAt`.
  - `Proposals`: `id`, `challengeId`, `submittedBy`, `universityId`, `status`.
- **Planned API Endpoints:**
  - `GET /api/university/metrics`
    - Response: `{ pendingReview: number, activeTeams: number, solutionsProposed: number }`
  - `GET /api/university/challenges?search={search}&priority={priority}`
    - Response: `Array<AssignedChallenge>`
- **Frontend Hook Specification:**
  ```typescript
  export function useUniversityHub(searchQuery?: string, priorityOnly?: boolean): {
    metrics: { pendingReview: number; activeTeams: number; solutionsProposed: number } | null;
    assignedChallenges: AssignedChallenge[];
    isLoading: boolean;
    error: Error | null;
  };
  ```

---

### 2.7 `/dashboard/industry` — Corporate CSR & Mentorship Hub
- **File:** `src/app/dashboard/industry/page.tsx`
- **Current Mock Data:**
  - KPI cards (lines 157, 173, 189): Active Proposals (`24`), Your Mentorships (`3`), Total Funded (`₹8.5L`).
  - `proposals` array (lines 38–79): 4 proposals (`PR-102`, `PR-104`, `PR-109`, `PR-115`) with budget, stage, and university name.
- **Target Database Tables & Fields:**
  - `Proposals`: `id`, `title`, `abstract`, `budget`, `status`, `universityId`.
  - `FundingCommitments`: `amount`, `type` (`CSR`, `grant`), `status`, `industryUserId`.
- **Planned API Endpoints:**
  - `GET /api/industry/metrics`
    - Response: `{ activeProposals: number, userMentorships: number, totalFunded: number }`
  - `GET /api/proposals?status=approved,shortlisted&domain={domain}&stage={stage}&budgetBracket={budgetBracket}`
    - Response: `Array<ProposalListItem>`
- **Frontend Hook Specification:**
  ```typescript
  export function useIndustryHub(filters: ProposalFilters): {
    metrics: IndustryMetrics | null;
    proposals: ProposalListItem[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  ```

---

### 2.8 `/challenge/[id]` — Detailed Challenge & Evidence View
- **File:** `src/app/challenge/[id]/page.tsx`
- **Current Mock Data:**
  - Lines 32–49: Hardcoded ternary `isWater = challengeId.includes("842")` generating a mock title and description.
  - `aiAnalysis`: Hardcoded tags, hypothesis, and required expertise.
  - Lightbox media (lines 58–81): Mock telemetry and fake citizen quotes.
  - Action buttons (lines 294–305): Mock buttons opening static modals.
- **Target Database Tables & Fields:**
  - `Challenges`: `id`, `title`, `description`, `domain`, `district`, `location`, `urgency`, `status`, `assignedTo`, `evidence` (JSON array with photos, videos, telemetry, hash), `citizenVerified`, `escalationLevel`, `slaDeadline`, `createdAt`.
  - `Users`: `reportedBy` join (masked or anonymous if citizen).
- **Planned API Endpoints:**
  - `GET /api/challenges/[id]`
    - Response: Full `ChallengeDetailResponse` including SLA countdown, evidence attachments, and AI root cause hypothesis.
- **Frontend Hook Specification:**
  ```typescript
  export function useChallengeDetail(id: string): {
    challenge: ChallengeDetail | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  ```

---

### 2.9 `/whatsapp-intake` — Omnichannel Intake Simulator
- **File:** `src/app/whatsapp-intake/page.tsx`
- **Current Mock Data:**
  - Lines 33–115: Hardcoded conversational message queue and static timeout generation yielding `JHR-2026-842`.
- **Target Database Tables & Fields:**
  - `Challenges`: newly inserted challenge with `channel: 'WHATSAPP'`, `evidence`, and geo-coordinates.
- **Planned API Endpoints:**
  - `POST /api/intake/whatsapp-simulate`:
    - Request: `{ text?: string, photoUrl?: string, location?: { lat: number, lng: number, address: string } }`
    - Response: `{ nextPrompt: string, challengeId?: string, trackingUrl?: string }`
- **Frontend Hook Specification:**
  ```typescript
  export function useWhatsAppSimulator(): {
    messages: Message[];
    isTyping: boolean;
    sendMessage: (text: string) => Promise<void>;
    sendAttachment: (type: 'photo' | 'location') => Promise<void>;
  };
  ```

---

### 2.10 `/accountability` — Public Accountability Leaderboard (GRAI)
- **File:** `src/app/accountability/page.tsx`
- **Current Mock Data:**
  - `leaderboard` (lines 35–43): 7 static institutions (`IIT ISM Dhanbad`, `Dept. of Water Resources`, `NIT Jamshedpur`, etc.) with `resolved`, `rejected`, `avgTime`, `satisfaction`, `escalated`, and `score`.
  - State average satisfaction: `85.4%`.
- **Target Database Tables & Fields:**
  - Aggregate metrics from `Challenges` grouped by `assignedTo` or government department.
- **Planned API Endpoints:**
  - `GET /api/analytics/accountability-index?type={all|gov|uni}&search={query}`
    - Response: `{ averageSatisfaction: number, leaderboard: LeaderboardItem[] }`
- **Frontend Hook Specification:**
  ```typescript
  export function useAccountabilityIndex(tab: 'all' | 'gov' | 'uni', search: string): {
    data: LeaderboardItem[];
    stateAverage: number;
    isLoading: boolean;
    error: Error | null;
  };
  ```

---

### 2.11 `/submit` — Citizen Problem Submission Wizard
- **File:** `src/app/submit/page.tsx`
- **Current Mock Data:**
  - Lines 176–212: Prefilled input values for title, description, location.
  - Dropzone: Static array with `water_borewell_sample.jpg`.
  - `handleSubmit`: `setTimeout` generating random `IN-GR-2026-...` and saving to `localStorage`.
- **Target Database Tables & Fields:**
  - `Challenges`: `id`, `title`, `description`, `domain`, `district`, `location`, `urgency: 'under_review'`, `status: 'reported'`, `evidence` (file URLs, metadata), `reportedBy` (null or user ID).
- **Planned API Endpoints:**
  - `POST /api/submit`:
    - Request (Multipart/form-data or JSON with presigned S3 URLs):
      `{ title: string, description: string, district: string, location: string, files: File[], reporterName?: string, reporterEmail?: string }`
    - Response: `{ id: string, trackingId: string, trackingUrl: string, estimatedSlaDays: number }`
- **Frontend Hook Specification:**
  ```typescript
  export function useSubmitChallenge(): {
    submitProblem: (formData: ProblemSubmissionInput) => Promise<SubmissionResult>;
    isSubmitting: boolean;
    error: Error | null;
  };
  ```

---

### 2.12 `/track` — Citizen Issue Tracker & Telemetry Ledger
- **File:** `src/app/track/page.tsx`
- **Current Mock Data:**
  - `SAMPLE_ISSUES` dictionary (lines 63–230): Static data for `IN-GR-2026-9842`, `IN-DL-2026-3104`, `IN-MH-2026-7712`.
  - Includes static telemetry array, 5 timeline stages, and 4 audit logs.
  - SMS subscription modal only displays local toast.
- **Target Database Tables & Fields:**
  - `Challenges` joined with `Proposals`, `FundingCommitments`, and `AuditLogs`.
  - `IssueSubscriptions`: `challengeId`, `phone`, `createdAt`.
- **Planned API Endpoints:**
  - `GET /api/track/[trackingId]`
    - Response: `{ id, title, domain, location, urgency, statusText, slaStatus, telemetry: [...], timeline: [...], logs: [...] }`
  - `POST /api/track/[trackingId]/subscribe`:
    - Request: `{ phone: string }`
    - Response: `{ success: true, message: string }`
- **Frontend Hook Specification:**
  ```typescript
  export function useTrackIssue(trackingId: string): {
    issue: IssueData | null;
    isLoading: boolean;
    error: Error | null;
    subscribeSms: (phone: string) => Promise<void>;
  };
  ```

---

### 2.13 `/guidelines` — Statutory Guidelines & Policy Pillars
- **File:** `src/app/guidelines/page.tsx`
- **Current Mock Data:**
  - `handleDownloadPdf` (lines 31–72): Concatenates in-memory text string and triggers browser text file download.
  - `faqs` (lines 74–99): 6 hardcoded questions and answers.
- **Target Database / Content Model:**
  - Static or headless markdown / policy documents.
- **Planned API Endpoints:**
  - `GET /api/content/guidelines.pdf`: Direct binary download of the official Gazette PDF with correct HTTP headers (`Content-Disposition: attachment; filename="..."`).

---

### 2.14 `/dashboard/settings` — Profile, Notifications, 2FA & API Keys
- **File:** `src/app/dashboard/settings/page.tsx`
- **Current Mock Data:**
  - `profile` state (lines 29–37): Hardcoded IAS officer details.
  - `activeSessions` (lines 51–54): 2 static session items.
  - `apiKey` and `webhookUrl` (lines 58–59): Fake client state.
- **Target Database Tables & Fields:**
  - `Users`: `name`, `organization`, `designation`, `phone`, `officeAddress`, `twoFactorEnabled`, `twoFactorSecret`.
  - `UserSessions`: `id`, `userId`, `device`, `ipAddress`, `lastActive`, `isCurrent`.
  - `ApiKeys` / `Webhooks`: `keyHash`, `webhookUrl`.
- **Planned API Endpoints:**
  - `GET /api/users/profile` & `PUT /api/users/profile`
  - `GET /api/users/sessions` & `DELETE /api/users/sessions/[id]`
  - `POST /api/auth/totp-setup` & `POST /api/auth/totp-verify`
  - `GET /api/users/api-keys` & `POST /api/users/api-keys/rotate`
  - `POST /api/users/webhook/test-ping`
- **Frontend Hook Specification:**
  ```typescript
  export function useSettings(): {
    profile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    sessions: SessionItem[];
    revokeSession: (id: string) => Promise<void>;
    totpEnabled: boolean;
    enableTotp: (token: string) => Promise<void>;
    disableTotp: () => Promise<void>;
  };
  ```

---

### 2.15 `/apply/[challengeId]` — Expert & NGO Application Wizard
- **File:** `src/app/apply/[challengeId]/page.tsx`
- **Current Mock Data:**
  - Lines 15–22: Form submit does `setTimeout(() => setIsSuccess(true), 1500)`.
- **Target Database Tables & Fields:**
  - `ExpertApplications`: `id`, `challengeId`, `applicantName`, `email`, `linkedin`, `contributionProposal`, `status` (`pending`, `accepted`, `rejected`), `createdAt`.
- **Planned API Endpoints:**
  - `POST /api/challenges/[challengeId]/apply-expert`:
    - Request: `{ name: string, email: string, linkedinUrl: string, contribution: string }`
    - Response: `{ success: true, applicationId: string }`
- **Frontend Hook Specification:**
  ```typescript
  export function useApplyExpert(challengeId: string): {
    submitApplication: (data: ExpertApplicationInput) => Promise<void>;
    isSubmitting: boolean;
    isSuccess: boolean;
    error: Error | null;
  };
  ```

---

### 2.16 `/dashboard/university/proposal/[id]` — Proposal Drafting Console
- **File:** `src/app/dashboard/university/proposal/[id]/page.tsx`
- **Current Mock Data:**
  - Lines 18–28: Prefilled title, summary, timeline, funding (`₹3,50,000`), mock document attachment.
  - Draft save writes to browser `localStorage`.
- **Target Database Tables & Fields:**
  - `Proposals`: `id`, `challengeId`, `submittedBy`, `universityId`, `title`, `abstract`, `methodology`, `budget`, `timelineMonths`, `dprDocumentUrl`, `status` (`draft` | `submitted`), `createdAt`, `updatedAt`.
- **Planned API Endpoints:**
  - `GET /api/proposals/[id]`
  - `POST /api/proposals` (Create / update draft: `{ challengeId, title, abstract, budget, timelineMonths, dprDocumentUrl, isDraft: boolean }`)
  - `POST /api/upload` (Upload DPR PDF/DOCX to storage, returns URL)
- **Frontend Hook Specification:**
  ```typescript
  export function useProposalEditor(challengeId: string): {
    proposal: ProposalDraft | null;
    saveDraft: (data: ProposalInput) => Promise<void>;
    submitFinal: (data: ProposalInput) => Promise<void>;
    uploadDocument: (file: File) => Promise<string>;
    isSaving: boolean;
    lastSaved: string | null;
    error: Error | null;
  };
  ```

---

### 2.17 `/dashboard/industry/fund/[id]` — Corporate Escrow Funding Console
- **File:** `src/app/dashboard/industry/fund/[id]/page.tsx`
- **Current Mock Data:**
  - Lines 38–41: Hardcoded pledged amount (`₹3,50,000`), fake notes, static escrow ref `JH-ESCROW-2026-CSR-9842`.
  - Download receipt concatenates an ASCII string in browser memory.
- **Target Database Tables & Fields:**
  - `FundingCommitments`: `id`, `proposalId`, `industryUserId`, `amount`, `type` (`CSR` | `grant` | `equity`), `status` (`pledged` | `escrowed`), `escrowRef`, `corporateNotes`, `mouAcceptedAt`, `createdAt`.
  - `AuditLogs`: `action: 'FUNDING_COMMITMENT_PLEDGED'`.
- **Planned API Endpoints:**
  - `POST /api/funds/commit`:
    - Request: `{ proposalId: string, amount: number, commitmentType: 'funding' | 'mentorship' | 'both', notes: string, mouAccepted: boolean }`
    - Response: `{ escrowRef: string, receiptDownloadUrl: string, status: 'escrowed' }`
  - `GET /api/funds/receipt/[escrowRef]` (Generates official signed receipt PDF)
- **Frontend Hook Specification:**
  ```typescript
  export function useCommitFunding(proposalId: string): {
    commitFunds: (payload: FundingCommitmentInput) => Promise<{ escrowRef: string }>;
    downloadReceipt: (escrowRef: string) => Promise<void>;
    isSubmitting: boolean;
    error: Error | null;
  };
  ```

---

## 3. Frontend Authentication State Integration

### 3.1 Global Auth Store Architecture (`useAuthStore`)

Using `zustand` (already in `web/package.json`), we establish a single source of truth for user credentials, permissions, and session health.

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';

export type UserRole = 'gov' | 'university' | 'industry' | 'expert' | 'citizen';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: 'active' | 'pending' | 'locked' | 'suspended';
  organization?: string;
  designation?: string;
  district?: string;
  name: string;
  twoFactorEnabled: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setSessionExpired: (expired: boolean) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpired: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isLoading: false,
    sessionExpired: false,
  }),

  setSessionExpired: (expired) => set({
    sessionExpired: expired,
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false, sessionExpired: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
      window.location.href = '/login';
    }
  },
}));
```

### 3.2 Centralized API Client with Automatic 401 Interception

All frontend data requests must pass through an authenticated client wrapper (`apiFetch`) located in `src/lib/api-client.ts`. When an API endpoint responds with `401 Unauthorized`:
1. It flags `sessionExpired: true` in `useAuthStore`.
2. Clears the cached session.
3. Redirects the user to `/login?expired=true`.

```typescript
// src/lib/api-client.ts
import { useAuthStore } from '@/stores/authStore';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  // Include CSRF token if present in document cookies
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    if (match && !headers.has('X-CSRF-Token')) {
      headers.set('X-CSRF-Token', decodeURIComponent(match[1]));
    }
  }

  // Ensure JSON content-type if body is an object
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Ensure HttpOnly cookies are passed
  });

  if (response.status === 401) {
    useAuthStore.getState().setSessionExpired(true);
    if (typeof window !== 'undefined') {
      window.location.href = '/login?expired=true';
    }
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
```

### 3.3 Role-Based Route Guards (`RoleGuard`)

To prevent unauthorized cross-tenant browsing (e.g. a University user navigating to `/dashboard/gov` or an unauthenticated visitor hitting `/dashboard/*`), we specify a declarative client guard:

```typescript
// src/components/auth/RoleGuard.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/stores/authStore';
import { SkeletonPage } from '@/components/ui/Skeletons';

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Direct user to their own valid dashboard
      const homeForRole: Record<UserRole, string> = {
        gov: '/dashboard/gov',
        university: '/dashboard/university',
        industry: '/dashboard/industry',
        expert: '/dashboard/industry',
        citizen: '/submit',
      };
      router.replace(homeForRole[user.role] || '/dashboard');
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, router]);

  if (isLoading || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return <SkeletonPage />;
  }

  return <>{children}</>;
}
```

### 3.4 Dynamic UI Element Rendering Matrix

| UI Element | Route | Gov | University | Industry | Expert | Citizen | Guest (Unauth) |
|---|---|---|---|---|---|---|---|
| **"Portal Login" link** | `/` (Navbar) | Hidden | Hidden | Hidden | Hidden | Hidden | **Visible** |
| **"Go to Dashboard" badge** | `/` (Navbar) | **Visible** | **Visible** | **Visible** | **Visible** | **Visible** | Hidden |
| **"Fund Project" CTA** | `/challenge/[id]` | Hidden | Hidden | **Active** | Hidden | Hidden | Redirects to `/login` |
| **"Draft Proposal" CTA** | `/challenge/[id]` | Hidden | **Active** | Hidden | Hidden | Hidden | Redirects to `/login` |
| **"Collaborate as Expert"** | `/challenge/[id]` | Hidden | Hidden | Hidden | **Active** | **Active** | Redirects to `/login` |
| **"Verify & SLA Escalate"** | `/challenge/[id]` | **Active** | Hidden | Hidden | Hidden | Hidden | Hidden |
| **"Switch Portal" link** | `/dashboard/layout` | **Active** | Hidden | Hidden | Hidden | Hidden | Hidden |
| **"Export Triage CSV"** | `/dashboard/gov` | **Active** | Hidden | Hidden | Hidden | Hidden | Hidden |

---

## 4. UX Edge States Design System

### 4.1 Skeleton Loading Screens
To replace raw spinners and blank layout shifts, implement tailored skeleton layouts using Tailwind's `animate-pulse` pattern:

1. **`MetricsSkeleton`** (for Dashboard KPI rows):
   - 4-column responsive grid.
   - Rounded 2xl cards with top badge placeholder, text line, and large 3xl stat placeholder (`h-9 w-24 bg-slate-200 rounded-lg`).
2. **`TableSkeleton`** (for Gov Ledger & University Assigned lists):
   - Table header bar with 5 gray columns.
   - 6 repeating rows with varying cell widths (`w-16`, `w-48`, `w-28`, `w-20`) to emulate realistic data.
3. **`DetailSkeleton`** (for `/challenge/[id]`):
   - Full-width hero banner skeleton.
   - 2-column grid: left side has 2 large media aspect-ratio boxes (`aspect-video bg-slate-200 rounded-xl`) + paragraph blocks; right side has vertical timeline node placeholders.

### 4.2 Empty Data States with Actionable CTAs
When datasets are empty (zero results found or user has no records), display structured empty cards featuring Lucide icons and distinct recovery actions:

```tsx
// Pattern for EmptyState
<div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
    <Inbox className="w-8 h-8" />
  </div>
  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
  <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
  {actionLabel && onAction && (
    <button onClick={onAction} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all">
      {actionLabel}
    </button>
  )}
</div>
```

### 4.3 Network Failure & Offline/Retry Architecture
1. **Offline Status Provider (`useOnlineStatus`)**:
   - Subscribes to `window.addEventListener('online')` and `window.addEventListener('offline')`.
   - Injects a persistent top warning banner:
     `"⚡ You are offline. Data changes are cached locally and will synchronize automatically when your connection is restored."`
2. **Retry Component (`NetworkErrorAlert`)**:
   - Catches fetch failures and renders a polite retry card:
     `"Unable to connect to Jharkhand Innovation State Servers. [Retry Connection]"`
   - Executes exponential backoff (1s, 2s, 4s) when automatic retries are enabled.

### 4.4 CSRF Protection Architecture
- All state-altering requests (`POST`, `PUT`, `DELETE`, `PATCH`) require CSRF token transmission.
- Token is provided via:
  1. An HttpOnly cookie `csrfToken` set on initial session handshake.
  2. A readable cookie or `/api/auth/csrf` payload.
- The `apiFetch` utility automatically extracts this token and sets the `X-CSRF-Token` header.
- Server-side RBAC middleware validates the token before executing any database mutations.

---

## 5. Implementation Roadmap for Implementers

| Phase | Target Deliverable | Affected Directories / Files |
|---|---|---|
| **Phase 2.1** | Create API Client & Auth Store | `web/src/lib/api-client.ts`, `web/src/stores/authStore.ts` |
| **Phase 2.2** | Build Skeleton & Empty State UI Components | `web/src/components/ui/Skeletons.tsx`, `web/src/components/ui/EmptyState.tsx`, `web/src/components/ui/NetworkBanner.tsx` |
| **Phase 2.3** | Implement Role-Based Route Guards | `web/src/components/auth/RoleGuard.tsx`, `web/src/app/dashboard/layout.tsx` |
| **Phase 2.4** | Wire API Hooks to Public & Intake Pages | `web/src/app/page.tsx`, `web/src/app/submit/page.tsx`, `web/src/app/track/page.tsx`, `web/src/app/challenge/[id]/page.tsx` |
| **Phase 2.5** | Wire API Hooks to Role Dashboards | `web/src/app/dashboard/gov/page.tsx`, `web/src/app/dashboard/university/page.tsx`, `web/src/app/dashboard/industry/page.tsx` |
| **Phase 2.6** | Wire API Hooks to Action Consoles | `web/src/app/dashboard/university/proposal/[id]/page.tsx`, `web/src/app/dashboard/industry/fund/[id]/page.tsx`, `web/src/app/apply/[challengeId]/page.tsx` |
