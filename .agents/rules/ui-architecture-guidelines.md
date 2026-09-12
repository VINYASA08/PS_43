---
name: Citizen-First UI & Offline Architecture
description: Enforces design patterns and architectural constraints for the SIH26043 project.
priority: 100
---

# UI/UX Constraints
- Always use a "Vibrant & Citizen-First" design language.
- Ensure high contrast, large typography (minimum 16sp/px for body text), and colorful iconography.
- Prioritize rural accessibility (WCAG AA compliance).

# Mobile Architecture Constraints
- Must be Offline-First. All submissions must be saved locally (SQLite/Room via SQLDelight or Room KMP) and synced in the background when connectivity is restored.
- Never hardcode strings in the UI. Always use a dynamic localization engine (resource files / compose-resources / moko-resources) to support English, Hindi, and Santali.
