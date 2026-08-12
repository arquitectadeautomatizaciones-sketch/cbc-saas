-- Agrega columna whatsapp a prospectos (canal principal de contacto en LATAM)
-- Ejecutar en Supabase SQL Editor

ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS whatsapp TEXT;

COMMENT ON COLUMN prospectos.whatsapp IS 'Número de WhatsApp del prospecto, distinto de telefono. Usado por el Asistente de Momento Exacto.';
