# 2. UI-Level Column Security for Unit Advisors

Date: 2026-05-18

## Status
Accepted

## Context
When a Unit Advisor edits a student's profile, they should only be allowed to modify fields corresponding to their specific Pillar (e.g., Uniform, Club, or Sport). RLS in Supabase controls access at the row level, which means that once a teacher can update a student row, the database permits updating all columns in that row. Enforcing column-level security on the backend would require complex triggers or edge functions.

## Decision
We will enforce this restriction on the frontend React UI only. The edit modal will automatically disable inputs for Pillars that the teacher does not advise. We will not implement column-level enforcement on the backend.

## Consequences
- **Positive:** Faster development and simpler backend architecture.
- **Negative:** A tech-savvy user could bypass the frontend UI and send a direct API request to maliciously edit fields they shouldn't. We accept this risk because teachers are a trusted internal user group.
