-- Agrega columna nombre a leads_landing
-- Ejecutar en Supabase SQL Editor si la tabla ya existe

ALTER TABLE leads_landing ADD COLUMN IF NOT EXISTS nombre TEXT;
