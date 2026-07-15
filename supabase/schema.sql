-- ============================================================
-- CBC SaaS — Cierre Bajo Control™
-- Schema PostgreSQL para Supabase
-- Versión 1.0 · Junio 2026
-- ============================================================
-- Orden de creación:
-- 1. Extensiones
-- 2. Enums
-- 3. Tablas core (users, prospectos, interacciones)
-- 4. Tablas de features (victorias, seguimientos, conversaciones)
-- 5. Tablas de sistema (logs, rate_limits)
-- 6. Funciones y triggers
-- 7. RLS policies
-- 8. Índices
-- ============================================================


-- ============================================================
-- 1. EXTENSIONES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";


-- ============================================================
-- 2. ENUMS
-- ============================================================

CREATE TYPE estado_prospecto AS ENUM (
  'prospecto',
  'contactado',
  'propuesta_enviada',
  'en_negociacion',
  'cerrado_ganado',
  'cerrado_perdido',
  'en_pausa'
);

CREATE TYPE semaforo_color AS ENUM (
  'verde',
  'amarillo',
  'rojo'
);

CREATE TYPE canal_contacto AS ENUM (
  'whatsapp',
  'email',
  'llamada',
  'linkedin',
  'reunion',
  'otro'
);

CREATE TYPE tipo_victoria AS ENUM (
  'venta_cerrada',
  'reunion_lograda',
  'propuesta_enviada',
  'cliente_reactivado',
  'objecion_superada'
);

CREATE TYPE estado_suscripcion AS ENUM (
  'trial',
  'activa',
  'cancelada',
  'suspendida'
);

CREATE TYPE rol_conversacion AS ENUM (
  'sofia',
  'usuario'
);

CREATE TYPE tipo_seguimiento AS ENUM (
  'dia_1',
  'dia_3',
  'dia_7'
);

CREATE TYPE estado_seguimiento AS ENUM (
  'pendiente',
  'enviado',
  'cancelado'
);


-- ============================================================
-- 3. TABLAS CORE
-- ============================================================

-- users: un usuario = un vendedor individual
-- Vinculada 1:1 con auth.users de Supabase
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id          UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Datos personales
  nombre                TEXT NOT NULL,
  email                 TEXT NOT NULL,
  telefono              TEXT,

  -- Perfil del vendedor (para personalizar Sofía)
  sector                TEXT,                    -- "tecnología", "servicios", "salud", etc.
  tipo_venta            TEXT,                    -- "B2B", "B2C", "mixto"
  meta_mensual          NUMERIC(12,2),           -- meta de ingresos del mes en USD
  moneda                TEXT DEFAULT 'USD',

  -- Suscripción
  estado_suscripcion    estado_suscripcion NOT NULL DEFAULT 'trial',
  trial_started_at      TIMESTAMPTZ,
  trial_ends_at         TIMESTAMPTZ,
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  suscripcion_activa_desde TIMESTAMPTZ,
  suscripcion_cancela_en   TIMESTAMPTZ,

  -- Telegram para alertas
  telegram_chat_id      TEXT,                    -- se guarda al hacer /start al bot
  telegram_conectado    BOOLEAN DEFAULT FALSE,

  -- Control de actividad para Sofía
  last_login_at         TIMESTAMPTZ,
  onboarding_completado BOOLEAN DEFAULT FALSE,
  sofia_proactive_sent  JSONB DEFAULT '{}',      -- {dia_3: bool, dia_5: bool, dia_6: bool}

  -- Metadata
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Un registro por vendedor. Contiene todo el contexto para Sofía y para n8n.';
COMMENT ON COLUMN users.sofia_proactive_sent IS 'Controla qué mensajes proactivos del trial ya fueron enviados para no duplicar.';
COMMENT ON COLUMN users.telegram_chat_id IS 'Se obtiene cuando el usuario hace /start al bot de Telegram.';


-- prospectos: el pipeline central del vendedor
CREATE TABLE prospectos (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Datos del prospecto
  nombre                TEXT NOT NULL,
  empresa               TEXT,
  cargo                 TEXT,
  sector                TEXT,
  email                 TEXT,
  telefono              TEXT,
  linkedin_url          TEXT,

  -- Pipeline
  valor_estimado        NUMERIC(12,2),           -- en la moneda del usuario
  estado                estado_prospecto NOT NULL DEFAULT 'prospecto',
  canal_origen          canal_contacto,          -- cómo llegó este lead

  -- Seguimiento
  ultimo_contacto       DATE,
  proximo_paso          TEXT,                    -- qué hacer en el próximo contacto
  fecha_proximo_contacto DATE,

  -- Semáforo (calculado por trigger)
  dias_sin_contacto     INTEGER DEFAULT 0,
  semaforo              semaforo_color NOT NULL DEFAULT 'verde',

  -- Perfil DISC para Sofía
  perfil_disc           TEXT,                    -- 'D', 'I', 'S', 'C'
  dolor_principal       TEXT,                    -- en palabras del propio prospecto
  objeciones_conocidas  TEXT,

  -- Notas
  notas                 TEXT,

  -- Metadata
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE prospectos IS 'Pipeline central. El semáforo se recalcula cada vez que se actualiza ultimo_contacto.';
COMMENT ON COLUMN prospectos.semaforo IS 'verde: 0-3 días, amarillo: 4-7 días, rojo: 8+ días sin contacto.';
COMMENT ON COLUMN prospectos.dolor_principal IS 'Guardado en palabras del prospecto, no del vendedor. Sofía lo usa para personalizar mensajes.';


-- interacciones: historial de cada contacto con el prospecto
CREATE TABLE interacciones (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospecto_id          UUID NOT NULL REFERENCES prospectos(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,
  canal                 canal_contacto NOT NULL,
  resultado             TEXT,                    -- qué pasó en este contacto
  mensaje_enviado       TEXT,                    -- el mensaje exacto que se mandó
  duracion_minutos      INTEGER,                 -- para llamadas y reuniones
  proximo_paso          TEXT,                    -- qué sigue después de este contacto

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE interacciones IS 'Cada vez que el vendedor contacta a un prospecto se registra aquí. Actualiza ultimo_contacto en prospectos.';


-- ============================================================
-- 4. TABLAS DE FEATURES
-- ============================================================

-- victorias: log de logros del vendedor
CREATE TABLE victorias (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prospecto_id          UUID REFERENCES prospectos(id) ON DELETE SET NULL,

  tipo                  tipo_victoria NOT NULL,
  descripcion           TEXT,
  valor                 NUMERIC(12,2),           -- valor económico si aplica
  fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE victorias IS 'Sofía las usa para celebrar logros y mostrar progreso. También alimenta el dashboard.';


-- seguimientos_programados: los mensajes de seguimiento días 1/3/7
CREATE TABLE seguimientos_programados (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospecto_id          UUID NOT NULL REFERENCES prospectos(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  tipo                  tipo_seguimiento NOT NULL,
  fecha_envio           DATE NOT NULL,           -- cuándo debe mandarse
  mensaje_generado      TEXT NOT NULL,           -- el texto que generó Claude
  estado                estado_seguimiento NOT NULL DEFAULT 'pendiente',
  enviado_at            TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE seguimientos_programados IS 'n8n verifica esta tabla cada mañana y manda por Telegram los mensajes que toca enviar hoy.';


-- conversaciones: historial persistente de Sofía (la gran mejora vs Vagas.IA)
CREATE TABLE conversaciones (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  session_id            TEXT NOT NULL,           -- agrupa mensajes de una misma sesión
  rol                   rol_conversacion NOT NULL,
  contenido             TEXT NOT NULL,
  tokens_usados         INTEGER,                 -- para control de costos

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE conversaciones IS 'Historial completo de Sofía. Permite que recuerde conversaciones de sesiones anteriores. Sofía lee los últimos 20 mensajes al arrancar.';
COMMENT ON COLUMN conversaciones.session_id IS 'UUID generado al abrir el chat. Todos los mensajes de esa apertura comparten el mismo session_id.';


-- ============================================================
-- 5. TABLAS DE SISTEMA
-- ============================================================

-- rate_limits: control de mensajes a Sofía por día
CREATE TABLE rate_limits (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,
  mensajes_enviados     INTEGER NOT NULL DEFAULT 0,
  limite_diario         INTEGER NOT NULL DEFAULT 50,

  UNIQUE (user_id, fecha)
);

COMMENT ON TABLE rate_limits IS 'Sofía tiene límite de 50 mensajes por usuario por día. Se resetea automáticamente cada día.';


-- logs_sistema: auditoría de eventos importantes
CREATE TABLE logs_sistema (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES users(id) ON DELETE SET NULL,
  evento                TEXT NOT NULL,           -- 'stripe_webhook', 'sofia_error', 'n8n_alerta', etc.
  payload               JSONB,
  error                 TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE logs_sistema IS 'Auditoría de eventos del sistema: webhooks de Stripe, errores de Sofía, alertas de n8n.';


-- ============================================================
-- 6. FUNCIONES Y TRIGGERS
-- ============================================================

-- Función: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a users y prospectos
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_prospectos_updated_at
  BEFORE UPDATE ON prospectos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();


-- Función: recalcular semáforo cuando cambia ultimo_contacto
CREATE OR REPLACE FUNCTION recalcular_semaforo()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular días sin contacto
  IF NEW.ultimo_contacto IS NULL THEN
    NEW.dias_sin_contacto := EXTRACT(DAY FROM NOW() - NEW.created_at)::INTEGER;
  ELSE
    NEW.dias_sin_contacto := EXTRACT(DAY FROM NOW() - NEW.ultimo_contacto::TIMESTAMPTZ)::INTEGER;
  END IF;

  -- Asignar semáforo según días
  IF NEW.dias_sin_contacto <= 3 THEN
    NEW.semaforo := 'verde';
  ELSIF NEW.dias_sin_contacto <= 7 THEN
    NEW.semaforo := 'amarillo';
  ELSE
    NEW.semaforo := 'rojo';
  END IF;

  -- Si está cerrado, no aplica semáforo (se deja en verde para no contaminar métricas)
  IF NEW.estado IN ('cerrado_ganado', 'cerrado_perdido') THEN
    NEW.semaforo := 'verde';
    NEW.dias_sin_contacto := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_semaforo_prospectos
  BEFORE INSERT OR UPDATE ON prospectos
  FOR EACH ROW EXECUTE FUNCTION recalcular_semaforo();


-- Función: actualizar ultimo_contacto en prospectos cuando se registra una interacción
CREATE OR REPLACE FUNCTION actualizar_ultimo_contacto()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prospectos
  SET
    ultimo_contacto = NEW.fecha,
    updated_at      = NOW()
  WHERE id = NEW.prospecto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_interaccion_actualiza_contacto
  AFTER INSERT ON interacciones
  FOR EACH ROW EXECUTE FUNCTION actualizar_ultimo_contacto();


-- Función: registrar victoria automática cuando se cierra una venta
CREATE OR REPLACE FUNCTION registrar_victoria_en_cierre()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo cuando el estado cambia A cerrado_ganado
  IF NEW.estado = 'cerrado_ganado' AND
     (OLD.estado IS NULL OR OLD.estado != 'cerrado_ganado') THEN
    INSERT INTO victorias (user_id, prospecto_id, tipo, descripcion, valor)
    VALUES (
      NEW.user_id,
      NEW.id,
      'venta_cerrada',
      'Venta cerrada: ' || NEW.nombre || COALESCE(' · ' || NEW.empresa, ''),
      NEW.valor_estimado
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_victoria_en_cierre
  AFTER UPDATE ON prospectos
  FOR EACH ROW EXECUTE FUNCTION registrar_victoria_en_cierre();


-- Función: recalcular semáforos diariamente (llamada por cron de n8n)
-- n8n llama a esta función vía RPC cada mañana a las 6:30 AM
CREATE OR REPLACE FUNCTION recalcular_todos_semaforos()
RETURNS void AS $$
BEGIN
  UPDATE prospectos
  SET updated_at = NOW()   -- el trigger recalcular_semaforo se dispara solo
  WHERE estado NOT IN ('cerrado_ganado', 'cerrado_perdido');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION recalcular_todos_semaforos IS 'Llamada por n8n vía RPC cada mañana a las 6:30 AM antes de generar las alertas de Telegram.';


-- Función: obtener contexto completo para Sofía (llamada desde el API)
CREATE OR REPLACE FUNCTION get_contexto_sofia(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_resultado JSONB;
BEGIN
  SELECT jsonb_build_object(
    'prospectos_total',       COUNT(*) FILTER (WHERE estado NOT IN ('cerrado_ganado', 'cerrado_perdido')),
    'prospectos_rojo',        COUNT(*) FILTER (WHERE semaforo = 'rojo' AND estado NOT IN ('cerrado_ganado', 'cerrado_perdido')),
    'prospectos_amarillo',    COUNT(*) FILTER (WHERE semaforo = 'amarillo' AND estado NOT IN ('cerrado_ganado', 'cerrado_perdido')),
    'victorias_este_mes',     COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())),
    'pipeline_valor',         COALESCE(SUM(valor_estimado) FILTER (WHERE estado NOT IN ('cerrado_ganado', 'cerrado_perdido')), 0),
    'cerradas_este_mes',      COUNT(*) FILTER (WHERE estado = 'cerrado_ganado' AND updated_at >= date_trunc('month', NOW()))
  )
  INTO v_resultado
  FROM prospectos
  WHERE user_id = p_user_id;

  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_contexto_sofia IS 'Devuelve las métricas de pipeline en una sola query. Llamada desde /api/support-chat antes de cada mensaje a Claude.';


-- Función: verificar rate limit de Sofía
CREATE OR REPLACE FUNCTION check_y_incrementar_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_mensajes INTEGER;
  v_limite   INTEGER;
BEGIN
  -- Upsert del registro de hoy
  INSERT INTO rate_limits (user_id, fecha, mensajes_enviados, limite_diario)
  VALUES (p_user_id, CURRENT_DATE, 1, 50)
  ON CONFLICT (user_id, fecha)
  DO UPDATE SET mensajes_enviados = rate_limits.mensajes_enviados + 1
  RETURNING mensajes_enviados, limite_diario
  INTO v_mensajes, v_limite;

  -- Devuelve TRUE si está dentro del límite
  RETURN v_mensajes <= v_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_y_incrementar_rate_limit IS 'Devuelve TRUE si el usuario puede enviar el mensaje. Incrementa el contador en la misma operación atómica.';


-- Función: obtener historial reciente de Sofía para el contexto
CREATE OR REPLACE FUNCTION get_historial_sofia(p_user_id UUID, p_limite INTEGER DEFAULT 20)
RETURNS TABLE (rol rol_conversacion, contenido TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT c.rol, c.contenido, c.created_at
  FROM conversaciones c
  WHERE c.user_id = p_user_id
  ORDER BY c.created_at DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_historial_sofia IS 'Devuelve los últimos N mensajes para el contexto de Claude. Incluye sesiones anteriores.';


-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- La gran mejora vs Vagas.IA que no tenía RLS
-- ============================================================

-- Activar RLS en todas las tablas de datos
ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospectos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacciones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE victorias                ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimientos_programados ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits              ENABLE ROW LEVEL SECURITY;

-- Helper: obtener el user_id de CBC desde el JWT de Supabase
CREATE OR REPLACE FUNCTION get_cbc_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;


-- Policies para users
CREATE POLICY "users_propio" ON users
  FOR ALL USING (auth_user_id = auth.uid());


-- Policies para prospectos
CREATE POLICY "prospectos_propios" ON prospectos
  FOR ALL USING (user_id = get_cbc_user_id());


-- Policies para interacciones
CREATE POLICY "interacciones_propias" ON interacciones
  FOR ALL USING (user_id = get_cbc_user_id());


-- Policies para victorias
CREATE POLICY "victorias_propias" ON victorias
  FOR ALL USING (user_id = get_cbc_user_id());


-- Policies para seguimientos
CREATE POLICY "seguimientos_propios" ON seguimientos_programados
  FOR ALL USING (user_id = get_cbc_user_id());


-- Policies para conversaciones
CREATE POLICY "conversaciones_propias" ON conversaciones
  FOR ALL USING (user_id = get_cbc_user_id());


-- Policies para rate_limits
CREATE POLICY "rate_limits_propios" ON rate_limits
  FOR ALL USING (user_id = get_cbc_user_id());


-- ============================================================
-- 8. ÍNDICES (rendimiento)
-- ============================================================

-- Búsquedas frecuentes de prospectos
CREATE INDEX idx_prospectos_user_id         ON prospectos(user_id);
CREATE INDEX idx_prospectos_semaforo        ON prospectos(user_id, semaforo) WHERE estado NOT IN ('cerrado_ganado', 'cerrado_perdido');
CREATE INDEX idx_prospectos_estado          ON prospectos(user_id, estado);
CREATE INDEX idx_prospectos_ultimo_contacto ON prospectos(user_id, ultimo_contacto);

-- Interacciones por prospecto
CREATE INDEX idx_interacciones_prospecto    ON interacciones(prospecto_id);
CREATE INDEX idx_interacciones_user         ON interacciones(user_id);

-- Seguimientos por fecha (n8n los busca por fecha_envio)
CREATE INDEX idx_seguimientos_fecha         ON seguimientos_programados(fecha_envio, estado);
CREATE INDEX idx_seguimientos_user          ON seguimientos_programados(user_id);

-- Conversaciones de Sofía (carga historial reciente)
CREATE INDEX idx_conversaciones_user_fecha  ON conversaciones(user_id, created_at DESC);

-- Victorias del mes
CREATE INDEX idx_victorias_user_fecha       ON victorias(user_id, created_at);

-- Rate limits por fecha
CREATE INDEX idx_rate_limits_fecha          ON rate_limits(user_id, fecha);

-- Stripe IDs para webhooks
CREATE INDEX idx_users_stripe_customer      ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_sub           ON users(stripe_subscription_id);

-- Telegram para alertas de n8n
CREATE INDEX idx_users_telegram             ON users(telegram_chat_id) WHERE telegram_conectado = TRUE;


-- ============================================================
-- LISTO
-- ============================================================
-- Tablas creadas:      8
-- Enums creados:       8
-- Funciones creadas:   7
-- Triggers creados:    5
-- RLS policies:        7
-- Índices creados:     13
-- ============================================================

-- ============================================================
-- TABLA: testimonios (agregada julio 2026)
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  cargo       TEXT,
  empresa     TEXT,
  ciudad      TEXT,
  testimonio  TEXT NOT NULL,
  estrellas   INT DEFAULT 5 CHECK (estrellas BETWEEN 1 AND 5),
  aprobado    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_publico" ON testimonios FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_aprobados" ON testimonios FOR SELECT TO anon USING (aprobado = true);
