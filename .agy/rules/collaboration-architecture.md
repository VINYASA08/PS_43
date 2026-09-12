---
description: Defines the architecture for real-time collaboration and open source contributions.
globs:
  - web/**/*
---

# Collaboration Architecture

## 1. Industry-University Chat Hub
The platform must include a communication hub allowing real-time-like communication between University Project Managers, Industry Partners, and Industry Mentors.
- **Implementation**: Use standard Prisma database queries and API polling (e.g., `setInterval` fetching messages) to simulate real-time WebSockets. Do NOT introduce heavy dependencies like Socket.io or Pusher for the prototype.

## 2. Open Contributor Board
The University dashboard must include an "Open Tasks" or "Contributor Board".
- **Purpose**: Universities can break down massive societal challenges into smaller "micro-tasks" (e.g., "Build a React component", "Analyze this dataset").
- **Target Audience**: Students, independent developers, and open-source contributors can view these tasks and apply to help the university team.
- **Data Model**: Requires a `MicroTask` model linked to a `Challenge` or `Project`, with fields for status (open, assigned, completed) and the required skills.

## 3. Industry Mentor TRL Tracking & Escrow Milestone Linkage
Industry Mentors track and audit university research solutions through Technology Readiness Levels (TRL 1 through TRL 9) on the Mentor Portal (`/dashboard/industry`).
- **TRL Stage-Gate Progression**:
  * TRL 1-3: Basic Principles & Lab Proof of Concept (Research Phase).
  * TRL 4-6: Technology Validation in Field Environment (Prototyping Phase).
  * TRL 7-9: System Commissioning & Full Grassroots Deployment (Production Phase).
- **Dual Decision Gates**: Mentors validate milestone clearance via two independent gates: Technical Feasibility Gate and Commercial Viability Gate.
- **CSR Escrow Milestone Tranches**: TRL milestone validation automatically authorizes tranche releases from the corporate CSR escrow account (30% Initial DPR, 40% Lab Pilot Validation, 30% Final Field Sign-off).
- **IP Royalty Calibration**: Mentors review and negotiate university-industry IP revenue sharing via interactive royalty sliders (5% to 15%).

