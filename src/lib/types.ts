// ============================================================
// CBC SaaS — TypeScript types generated from cbc_schema.sql
// ============================================================

export type EstadoProspecto =
  | 'prospecto'
  | 'contactado'
  | 'propuesta_enviada'
  | 'en_negociacion'
  | 'cerrado_ganado'
  | 'cerrado_perdido'
  | 'en_pausa'

export type SemaforoColor = 'verde' | 'amarillo' | 'rojo'

export type CanalContacto =
  | 'whatsapp'
  | 'email'
  | 'llamada'
  | 'linkedin'
  | 'reunion'
  | 'otro'

export type TipoVictoria =
  | 'venta_cerrada'
  | 'reunion_lograda'
  | 'propuesta_enviada'
  | 'cliente_reactivado'
  | 'objecion_superada'

export type EstadoSuscripcion = 'trial' | 'activa' | 'cancelada' | 'suspendida'

export type RolConversacion = 'sofia' | 'usuario'

export type TipoSeguimiento = 'dia_1' | 'dia_3' | 'dia_7'

export type EstadoSeguimiento = 'pendiente' | 'enviado' | 'cancelado'

// ---- Tables ----

export interface User {
  id: string
  auth_user_id: string
  nombre: string
  email: string
  telefono: string | null
  sector: string | null
  tipo_venta: string | null
  meta_mensual: number | null
  moneda: string
  estado_suscripcion: EstadoSuscripcion
  trial_started_at: string | null
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  suscripcion_activa_desde: string | null
  suscripcion_cancela_en: string | null
  telegram_chat_id: string | null
  telegram_conectado: boolean
  last_login_at: string | null
  onboarding_completado: boolean
  sofia_proactive_sent: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface Prospecto {
  id: string
  user_id: string
  nombre: string
  empresa: string | null
  cargo: string | null
  sector: string | null
  email: string | null
  telefono: string | null
  linkedin_url: string | null
  valor_estimado: number | null
  estado: EstadoProspecto
  canal_origen: CanalContacto | null
  ultimo_contacto: string | null
  proximo_paso: string | null
  fecha_proximo_contacto: string | null
  dias_sin_contacto: number
  semaforo: SemaforoColor
  perfil_disc: string | null
  dolor_principal: string | null
  objeciones_conocidas: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Interaccion {
  id: string
  prospecto_id: string
  user_id: string
  fecha: string
  canal: CanalContacto
  resultado: string | null
  mensaje_enviado: string | null
  duracion_minutos: number | null
  proximo_paso: string | null
  created_at: string
}

export interface Victoria {
  id: string
  user_id: string
  prospecto_id: string | null
  tipo: TipoVictoria
  descripcion: string | null
  valor: number | null
  fecha: string
  created_at: string
}

export interface SeguimientoProgramado {
  id: string
  prospecto_id: string
  user_id: string
  tipo: TipoSeguimiento
  fecha_envio: string
  mensaje_generado: string
  estado: EstadoSeguimiento
  enviado_at: string | null
  created_at: string
}

export interface Conversacion {
  id: string
  user_id: string
  session_id: string
  rol: RolConversacion
  contenido: string
  tokens_usados: number | null
  created_at: string
}

export interface RateLimit {
  id: string
  user_id: string
  fecha: string
  mensajes_enviados: number
  limite_diario: number
}

export interface LogSistema {
  id: string
  user_id: string | null
  evento: string
  payload: Record<string, unknown> | null
  error: string | null
  created_at: string
}

// ---- API response types ----

export interface ContextoSofia {
  nombre?: string
  prospectos_total: number
  prospectos_rojo: number
  prospectos_amarillo: number
  victorias_este_mes: number
  pipeline_valor: number
  cerradas_este_mes: number
}

export interface ApiError {
  error: string
}
