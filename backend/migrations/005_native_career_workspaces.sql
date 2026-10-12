CREATE TABLE IF NOT EXISTS native_ai_receipts (
 id BIGSERIAL PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),endpoint TEXT NOT NULL,title TEXT NOT NULL,
 notes TEXT NOT NULL DEFAULT '',request_data JSONB NOT NULL,source_snapshot JSONB NOT NULL,result_data JSONB NOT NULL,receipt JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS native_ai_receipts_owner_idx ON native_ai_receipts(user_id,created_at DESC,id DESC);
CREATE TABLE IF NOT EXISTS career_followups (
 id BIGSERIAL PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),task TEXT NOT NULL,owner TEXT NOT NULL DEFAULT 'Student',
 priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High')),
 status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft','Planned','In progress','Done')),
 is_demo BOOLEAN NOT NULL DEFAULT false,demo_key TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(user_id,demo_key)
);
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS demo_key TEXT;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS demo_key TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS demo_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS resumes_owner_demo_key ON resumes(user_id,demo_key) WHERE demo_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS portfolios_owner_demo_key ON portfolios(user_id,demo_key) WHERE demo_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS assessments_owner_demo_key ON assessments(user_id,demo_key) WHERE demo_key IS NOT NULL;
ALTER TABLE work_simulation_portfolios ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
ALTER TABLE work_simulation_portfolios ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE work_simulation_portfolios ADD COLUMN IF NOT EXISTS demo_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS work_simulations_owner_demo_key ON work_simulation_portfolios(user_id,demo_key) WHERE demo_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS resume_versions(id SERIAL PRIMARY KEY,resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,content TEXT,version INTEGER NOT NULL,change_note TEXT,created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS ai_workspace_runs(id BIGSERIAL PRIMARY KEY,user_id TEXT NOT NULL,feature TEXT NOT NULL,input JSONB NOT NULL,result TEXT NOT NULL,result_json JSONB,model TEXT,usage JSONB,receipt JSONB,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE ai_workspace_runs ADD COLUMN IF NOT EXISTS receipt JSONB;

CREATE TABLE IF NOT EXISTS webhooks(id SERIAL PRIMARY KEY,user_id INTEGER,url TEXT NOT NULL,events TEXT[] NOT NULL DEFAULT ARRAY['assessment.completed']::text[],secret VARCHAR(255),active BOOLEAN DEFAULT true,created_at TIMESTAMP DEFAULT NOW(),updated_at TIMESTAMP DEFAULT NOW());
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS demo_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS webhooks_owner_demo_key ON webhooks(user_id,demo_key) WHERE demo_key IS NOT NULL;
