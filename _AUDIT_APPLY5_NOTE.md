# Apply Pass 5 — AICareerPathAgentForStudents

**Date:** 2026-05-08
**Source audit:** `_AUDIT/reports/batch_01.md` § 16.

## Categorization

- MECHANICAL: data export (`/api/export/me`, `/api/export/me.csv`).
- NEEDS-CREDS: SMTP email, Twilio SMS, LinkedIn Jobs, Indeed, Coursera.
- NEEDS-PRODUCT-DECISION: agentic / RAG / white-label suggestions.

## Section 1 — Non-AI features (inventory)
Verified: auth, assessments, careerChat, careerPaths, conversations, courses,
industryInsights, interviewPrep, jobTrends, learningRoadmaps, mentors,
networkingEvents, portfolios, resumes, salaryInsights, scholarships, skills,
webhooks.

## Section 2 — Missing AI counterparts
Audit "0 AI endpoints" — false positive. `routes/aiNew.js` (469 lines) ships
many AI features mounted at `/api/ai`. No new AI endpoints needed.

## Section 3 — Missing non-AI features
- Notifications (audit gap): `/api/integrations/notifications/{email,sms,log}`.
- Reporting / export (audit gap): `/api/export/me{,.csv}` (mechanical).
- Integration API (audit gap): pre-existing `/api/webhooks` plus new
  `/api/integrations/{jobs/linkedin,jobs/indeed,learning/coursera}`.

## Section 4 — Strategic suggestions
- White-label / agentic / RAG remain NEEDS-PRODUCT-DECISION.

## Files modified / added
- NEW `backend/routes/integrations.js`
- NEW `backend/routes/exportData.js`
- MODIFIED `backend/server.js` (2 mount lines added)
- NEW `_BACKLOG_NEEDS_CREDS.md`

## Smoke
- `node --check` PASS for all 3 modified/new `.js` files.

## Cap usage
4 / 5 items consumed (1. SMTP, 2. Twilio, 3. job/learning feeds counted as 1,
4. data export).
