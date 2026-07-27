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

INSERT INTO work_simulation_portfolios
  (simulation_ref,candidate_name,simulation_type,employer_scenario,communication_score,collaboration_score,creativity_score,critical_thinking_score,leadership_score,evidence,reviewer_notes,status,scheduled_at)
SELECT
  'SIM-' || LPAD(g::text,4,'0'),
  (ARRAY['Maya Patel','Jordan Lee','Sofia Ramirez','Noah Williams','Avery Chen'])[((g-1)%5)+1] || ' · Cohort ' || CEIL(g/5.0)::int,
  (ARRAY['Customer discovery sprint','AI workflow redesign','Incident response exercise','Market-entry case','Operational turnaround'])[((g-1)%5)+1],
  (ARRAY['Build a customer retention intervention in four hours','Redesign an approval workflow with human controls','Coordinate a cross-functional response to an agent failure','Validate a new service with customer evidence','Recover a delayed operational program'])[((g-1)%5)+1],
  62 + ((g*3)%34), 60 + ((g*5)%36), 58 + ((g*7)%38), 64 + ((g*4)%32), 55 + ((g*6)%40),
  jsonb_build_array(
    jsonb_build_object('kind','recording','label','Team simulation recording','verified',g%3<>0),
    jsonb_build_object('kind','artifact','label','Decision brief and working prototype','verified',true),
    jsonb_build_object('kind','peer-review','label','Structured teammate observations','verified',g%4<>0)
  ),
  'Reviewer should validate contribution evidence, reasoning quality, and the final human decision.',
  (ARRAY['scheduled','in_progress','peer_review','verified'])[((g-1)%4)+1],
  NOW() + (g || ' days')::interval
FROM generate_series(1,15) g
ON CONFLICT (simulation_ref) DO NOTHING;
