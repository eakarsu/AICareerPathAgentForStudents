CREATE TABLE IF NOT EXISTS work_simulation_portfolios (
  id BIGSERIAL PRIMARY KEY,
  simulation_ref TEXT NOT NULL UNIQUE,
  candidate_name TEXT NOT NULL,
  simulation_type TEXT NOT NULL,
  employer_scenario TEXT NOT NULL,
  communication_score INTEGER NOT NULL CHECK (communication_score BETWEEN 0 AND 100),
  collaboration_score INTEGER NOT NULL CHECK (collaboration_score BETWEEN 0 AND 100),
  creativity_score INTEGER NOT NULL CHECK (creativity_score BETWEEN 0 AND 100),
  critical_thinking_score INTEGER NOT NULL CHECK (critical_thinking_score BETWEEN 0 AND 100),
  leadership_score INTEGER NOT NULL CHECK (leadership_score BETWEEN 0 AND 100),
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  reviewer_notes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','peer_review','verified')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
