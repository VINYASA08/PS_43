---
description: Defines the verification and routing workflow for submitted challenges.
globs:
  - web/**/*
  - mobile/**/*
---

# Routing Architecture Constraints

## 1. Deprecation of Village Head / Gram Panchayat Verification Role
The traditional village representative ("Village Head / Gram Panchayat") verification step is completely removed from all frontend and backend flows. Do not implement village head dashboards or APIs.

## 2. The District Nodal Officer
All citizen-submitted problems are routed first to a **District Nodal Officer**.
The Nodal Officer acts as the central router and has three options for every problem:
- **Reject/Cancel**: Mark the problem as invalid/fake, requiring a descriptive reason.
- **Divert to Gov Body**: Route standard civic issues to the appropriate existing government department (e.g., PWD, Municipal Corp, DWSD).
- **Route to Academia (Innovation Track)**: Route complex challenges requiring innovation to the University ecosystem.

## 3. University Bidding/Acceptance
When a problem is routed to Academia, the AI matches it with up to 3 dedicated Universities. An automated email is sent to these institutions. 
The problem appears on a shared docket where the first university to accept the challenge claims it, removing it from the others' queues.
