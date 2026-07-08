import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ContextoSofia } from '@/lib/types'
import { TrendingUp, Users, AlertCircle, Trophy, DollarSign, CheckCircle } from 'lucide-react'
import Sofia from '@/components/Sofia'
import DashboardChecklist from '@/components/DashboardChecklist'

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

  const metrics = await getMetrics(profile.id)

  // Datos para el checklist de activación
  const proactiveSent = (profile.sofia_proactive_sent as Record<string, boolean>) ?? {}
  const checklistCompletado = proactiveSent.checklist_completado === true

  const [{ count: prospectoCount }, { count: conversacionCount }] = await Promise.all([
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

  const nombre = profile.nombre.split(' ')[0]
  const contextoCompleto = { ...metrics, nombre }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>
          Buenos días, {nombre}.
        </h1>
        <p className="text-gray-500 mt-1">¿A quién llamas hoy?</p>
      </div>

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

      {/* Sofia chat */}
      <div id="sofia-chat">
        <Sofia userId={profile.id} contexto={contextoCompleto} />
      </div>
    </div>
  )
}
