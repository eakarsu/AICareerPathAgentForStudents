# Governed planning operations

The production-boundary workflow is \`/api/governed-plans\`: verified learner evidence → student-consented submission → counselor approval → active plan → measured completion. Every request requires a bearer token and \`x-tenant-id\`; creation also requires \`idempotency-key\`. Tenant memberships are provisioned by an administrator in \`career_tenant_memberships\`, never accepted from self-registration.

Provider work is queued in \`career_sync_requests\` for SIS, LMS, occupation/course catalogs, opportunity feeds, and calendars. A deployment must supply approved provider adapters, retry/dead-letter workers, data-processing agreements, accessibility testing, and bias/longitudinal evaluation before enabling those requests.

## Safe lifecycle

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Run `scripts/bootstrap.sh` once to install locked dependencies.
3. Run `scripts/migrate.sh` explicitly against the intended database.
4. Provision tenant memberships through an audited administrator process.
5. Run `./start.sh`; it never installs, seeds, migrates, starts PostgreSQL, or kills ports.

Legacy seed data is demo-only. Where `scripts/seed-demo.sh` exists it requires `CONFIRM_DEMO_SEED=yes` and refuses production. External provider calls and production data were not exercised by this implementation.
