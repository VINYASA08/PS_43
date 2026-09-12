---
name: MNC-Grade Mobile Architecture
description: Enforces enterprise standards for the KMP Mobile App.
priority: 150
---

# Architectural Constraints (Mobile)
- **Networking**: Must use `Ktor` to communicate with the Next.js backend (`/api/...`). Do NOT use mock data repositories in production code.
- **Dependency Injection**: Must use `Koin` to inject repositories, ViewModels/ScreenModels, and networking clients.
- **Navigation**: Must use `Voyager` (or equivalent robust router). Do not use simple `when (state)` toggles for complex navigation.
- **Completeness**: Any task requesting "complete" mobile parity means implementing the full stack: Citizen, Government, University, and Industry dashboards, matching the Web feature set exactly.
