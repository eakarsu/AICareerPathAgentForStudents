# Audit Apply Note — AICareerPathAgentForStudents

Source: `_AUDIT/reports/batch_01.md` § 16.

## Audit findings vs. reality
The audit reported "0 AI endpoints" but `routes/aiNew.js` exposes 7+ AI endpoints. So "Missing AI Layer" is incorrect. Notification, reporting, and integration API gaps remain.

## Implemented in this pass (MECHANICAL)

| # | Item | File | Endpoints |
|---|------|------|-----------|
| 1 | Webhook subscription stub | `backend/routes/webhooks.js` (new) + `backend/server.js` | `GET/POST/DELETE /api/webhooks`, `POST /api/webhooks/:id/test`, `GET /api/webhooks/_/events` |

Allowed events: assessment.completed, roadmap.generated, resume.updated, mentor.matched, scholarship.recommended, course.completed, career_path.changed, event.registered. Lazy table; payload-only test (no outbound HTTP). `node --check` passes.

## Backlog (not implemented)

| Item | Tag | Why deferred |
|------|-----|---------------|
| Email/SMS/push notifications | NEEDS-CREDS | SMTP / Twilio / FCM |
| Reporting / export | TOO-RISKY | Templates + UI |
| Outbound webhook delivery | TOO-RISKY | Background job infra |
| LinkedIn / Indeed integration | NEEDS-CREDS | Vendor partnerships |
| RAG over career resources | NEEDS-PRODUCT-DECISION | Vector store + corpus |

## Apply pass 4 (mechanical backlog)

- Verdict: **LEFT-AS-IS**.
- All five backlog items are tagged NEEDS-CREDS / TOO-RISKY / NEEDS-PRODUCT-DECISION (notifications, reporting/export, outbound webhook delivery, LinkedIn/Indeed integration, RAG over career resources). None qualify as mechanical AI features under this pass's spec.
- No BE / FE changes.

## Apply pass 3 (frontend)

- Verdict: **LEFT-AS-IS**.
- Stack: React+Vite. Pages call backend through `services/api.js`; auth is JWT Bearer from `localStorage`.
- Already-wired AI/feature pages registered in `frontend/src/App.jsx`:
  - `AIHistory.jsx`, `CareerChat.jsx`, `CareerMatch.jsx`, `InterviewMock.jsx`, `PersonalizedRoadmap.jsx`, `ResumeBullets.jsx`, `ScholarshipEligibility.jsx`, `SalaryNegotiation.jsx`, `CompanyCultureFit.jsx`, `PeerMentorMatch.jsx`, plus `Webhooks.jsx` for the apply-pass-2 webhooks router.
- No FE changes were needed (idempotent skip).
