import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ContextoSofia } from '@/lib/types'
import { TrendingUp, Users, AlertCircle, Trophy, DollarSign, CheckCircle } from 'lucide-react'
import Sofia from '@/components/Sofia'
import DashboardChecklist from '@/components/DashboardChecklist'
import MiDiaHoyClient from '@/components/MiDiaHoyClient'

async function getMetrics(userId: string): Promise<ContextoSofia> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_contexto_sofia', { p_user_id: userId })
  return data ?? {
    prospectos_total: 0,
    prospectos_rojo: 0,
    prospectos_amarillo: 0,
    victorias_este_mes: 0,
    pipeline_valor: 0,
    cerradas_este_mes: 0,
  }
}

async function getMiDiaHoy(userId: string) {
  const supabase = await createClient()
  const hoy = new Date().toISOString().split('T')[0]

  const [rojosRes, seguimientosRes, amarillosRes] = await Promise.all([
    supabase
      .from('prospectos')
      .select('id, nombre, empresa, dias_sin_contacto, telefono')
      .eq('user_id', userId)
      .eq('semaforo', 'rojo')
      .order('dias_sin_contacto', { ascending: false })
      .limit(3),

    supabase
      .from('seguimientos_programados')
      .select('id, tipo, mensaje_generado, prospecto_id, prospectos(nombre, empresa)')
      .eq('user_id', userId)
      .eq('fecha_envio', hoy)
      .eq('estado', 'pendiente')
      .limit(3),

    supabase
      .from('prospectos')
      .select('id, nombre, empresa')
      .eq('user_id', userId)
      .eq('semaforo', 'amarillo')
      .order('dias_sin_contacto', { ascending: false })
      .limit(3),
  ])

  const rojos = (rojosRes.data ?? []) as {
    id: string; nombre: string; empresa: string | null
    dias_sin_contacto: number; telefono: string | null
  }[]

  const seguimientos = (seguimientosRes.data ?? []).map((s: any) => ({
    id: s.id,
    tipo: s.tipo,
    mensaje_generado: s.mensaje_generado,
    prospecto_id: s.prospecto_id,
    prospecto_nombre: s.prospectos?.nombre ?? '',
    prospecto_empresa: s.prospectos?.empresa ?? null,
  }))

  const amarillos = (amarillosRes.data ?? []) as {
    id: string; nombre: string; empresa: string | null
  }[]

  return { rojos, seguimientos, amarillos }
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, nombre, moneda, sofia_proactive_sent')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const [metrics, miDia, { count: prospectoCount }, { count: conversacionCount }] = await Promise.all([
    getMetrics(profile.id),
    getMiDiaHoy(profile.id),
    supabase.from('prospectos').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('conversaciones').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
  ])

  const tieneProspectos = (prospectoCount ?? 0) > 0
  const tieneConversaciones = (conversacionCount ?? 0) > 0
  const moneda = profile.moneda ?? 'USD'
  const pipelineFormateado = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(metrics.pipeline_valor)

  const proactiveSent = (profile.sofia_proactive_sent as Record<string, boolean>) ?? {}
  const checklistCompletado = proactiveSent.checklist_completado === true

  const nombre = profile.nombre.split(' ')[0]
  const contextoCompleto = { ...metrics, nombre }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>
          Buenos días, {nombre}.
        </h1>
        <p className="text-gray-500 mt-1">¿A quién llamas hoy?</p>
      </div>

      {/* Mi Día Hoy — siempre visible, encima del checklist */}
      <MiDiaHoyClient
        rojos={miDia.rojos}
        seguimientos={miDia.seguimientos}
        amarillos={miDia.amarillos}
      />

      {/* Checklist de activación */}
      <DashboardChecklist
        tieneProspectos={tieneProspectos}
        tieneConversaciones={tieneConversaciones}
        checklistCompletado={checklistCompletado}
      />

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Prospectos activos"
          value={metrics.prospectos_total}
          icon={Users}
          color="#1A4A44"
        />
        <MetricCard
          label="Llama hoy"
          value={metrics.prospectos_rojo}
          icon={AlertCircle}
          color="#ef4444"
          subtitle="Sin contacto 8+ días"
        />
        <MetricCard
          label="Llama esta semana"
          value={metrics.prospectos_amarillo}
          icon={TrendingUp}
          color="#f59e0b"
          subtitle="4-7 días sin contacto"
        />
        <MetricCard
          label="Victorias este mes"
          value={metrics.victorias_este_mes}
          icon={Trophy}
          color="#4ECDC4"
        />
        <MetricCard
          label="En juego"
          value={pipelineFormateado}
          icon={DollarSign}
          color="#1A4A44"
        />
        <MetricCard
          label="Cerradas este mes"
          value={metrics.cerradas_este_mes}
          icon={CheckCircle}
          color="#10b981"
        />
      </div>

      {/* Sofia — widget flotante */}
      <Sofia userId={profile.id} contexto={contextoCompleto} />
    </div>
  )
}
