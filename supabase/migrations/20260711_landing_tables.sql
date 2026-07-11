-- Landing page tables
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads_landing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  score INTEGER,
  sub_scores JSONB,
  cuello_de_botella TEXT,
  respuestas JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonios_landing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  email TEXT,
  empresa TEXT,
  respuesta_1 TEXT NOT NULL,
  respuesta_2 TEXT,
  respuesta_3 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: allow the service role to insert (RLS off by default on these tables)
-- ALTER TABLE leads_landing ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE testimonios_landing ENABLE ROW LEVEL SECURITY;
