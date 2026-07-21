# Completeness Review: AICareerPathAgentForStudents

- **Review date:** 2026-07-18
- **Assessment basis:** Static source and configuration inspection only. Dependencies were not installed, and no build, database migration, external integration, or runtime workflow was executed.

## Classification

**Prototype-demo**

## Verdict

The repository presents a broad student career guidance surface (104 source files and 37 route modules), but the static evidence is characteristic of a generated prototype. Pages and endpoints demonstrate concepts; they do not establish a verified execution path for use verified learner goals, skills, coursework, opportunities, and outcomes in a counselor-reviewed planning workflow.

## Why it is not complete

- 10 files are explicitly named as gap/gap-feature implementations; route/page count therefore overstates completed product capability.
- 48 files reference model-provider or chat-completion behavior; these generic LLM paths are not a substitute for deterministic domain execution, grounding, or evaluation.
- 52 files contain mock, sample, placeholder, or random-data signals, leaving important outcomes disconnected from authoritative systems.
- No recognizable application test files were found in the inspected tree.
- No CI workflow was found to continuously verify builds, tests, migrations, or security checks.
- No environment example/template was found, so required configuration and secret boundaries are undocumented.

## Needed features

- 1. Implement a workflow to use verified learner goals, skills, coursework, opportunities, and outcomes in a counselor-reviewed planning workflow.
- 2. Connect SIS/LMS, skills and occupation data, course catalogs, job/internship sources, and calendars; replace seed/demo records with durable, synchronized data and explicit failure handling.
- 3. Evaluate recommendation relevance, accessibility, bias, uncertainty, and longitudinal outcomes.
- 4. Enforce minor/student privacy, consent, transparent sourcing, and counselor approval.
- 5. Add contract, integration, authorization, migration, and end-to-end tests in CI, plus a documented non-destructive deployment/run path.

## Risks or launch blockers

- The root launcher can terminate unrelated processes occupying configured ports.
- The root launcher seeds, creates, migrates, or otherwise mutates database state during startup.
- The root launcher installs dependencies at run time, reducing reproducibility and expanding supply-chain risk.
- Ungrounded or malformed model output can become a domain action unless schemas, evidence, evaluations, and approval gates are added.

## Evidence inspected

- `backend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `frontend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `backend/server.js` — service composition, middleware, and registered routes.
- `frontend/src/App.jsx` — front-end navigation and visible workflow surface.
- `backend/routes/agenticCareerCoach.js` — implemented API surface and domain/AI request handling.
- `backend/routes/aiNew.js` — implemented API surface and domain/AI request handling.

## Recommended next action

Treat this as a prototype: select one narrow student career guidance outcome, remove or quarantine generated gap routes, and implement that outcome end to end with real data, deterministic rules, and tests before adding features.

## Implementation progress

- Needed feature 1: implemented the authenticated \`/api/governed-plans\` lifecycle with verified goal/skill/coursework evidence, student consent, counselor review, optimistic versions, and immutable events in \`backend/routes/governedPlans.js\`, \`backend/domain/planningWorkflow.js\`, and \`backend/migrations/001_governed_planning.sql\`.
- Needed feature 2: added durable, failure-state sync requests for SIS, LMS, occupation/course catalogs, opportunities, and calendars. Live adapters still require approved provider credentials/contracts and were not claimed or exercised.
- Needed features 3–4: encoded evidence, consent, counselor-role, and approval-note gates; the CI-verifiable rule layer rejects unverified evidence, missing consent, skipped transitions, and unauthorized approval. Accessibility/bias/longitudinal validation still requires representative datasets and qualified review.
- Needed feature 5 and launcher risks: added locked bootstrap, explicit migration, guarded demo seed, nondestructive launcher, environment contract, operations guide, and CI migration/test/build workflow; removed the mounted generated gap routes and secret fallback.
- Validation: 4/4 domain tests passed; changed JavaScript and shell syntax checks passed. No service, provider, database, or production deployment was run.
