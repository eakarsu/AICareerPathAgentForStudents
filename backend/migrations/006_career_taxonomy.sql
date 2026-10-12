CREATE TABLE IF NOT EXISTS career_taxonomy_entries (
 id BIGSERIAL PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),kind TEXT NOT NULL CHECK(kind IN ('role','skill')),
 key TEXT NOT NULL,title TEXT NOT NULL,skills JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(skills)='array'),
 is_demo BOOLEAN NOT NULL DEFAULT false,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(user_id,kind,key)
);
CREATE INDEX IF NOT EXISTS career_taxonomy_owner_kind ON career_taxonomy_entries(user_id,kind,id);
