import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, SOFIA_MODEL, buildSofiaPrompt } from '@/lib/claude'
import type { ContextoSofia } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('id, nombre, sector, tipo_venta, meta_mensual, moneda, estado_suscripcion, trial_ends_at, last_login_at')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

    // Rate limit check (atomic via RPC)
    const { data: permitido } = await supabase.rpc('check_y_incrementar_rate_limit', {
      p_user_id: profile.id,
    })

    if (!permitido) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de 50 mensajes por día. Vuelve mañana.' },
        { status: 429 }
      )
    }

    const { mensaje, session_id } = await req.json()

    if (!mensaje?.trim()) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })
    }

    // Save user message
    await supabase.from('conversaciones').insert({
      user_id: profile.id,
      session_id,
      rol: 'usuario',
      contenido: mensaje,
    })

    // Load last 20 messages for context
    const { data: historial } = await supabase.rpc('get_historial_sofia', {
      p_user_id: profile.id,
      p_limite: 20,
    })

    // Load pipeline context
    const { data: contexto } = await supabase.rpc('get_contexto_sofia', {
      p_user_id: profile.id,
    })

    const ctx = (contexto ?? {}) as ContextoSofia
    const moneda = profile.moneda ?? 'USD'
    const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    // Trial days left
    let trialDaysLeft: number | null = null
    if (profile.trial_ends_at) {
      const diff = new Date(profile.trial_ends_at).getTime() - Date.now()
      trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    // Days since last login
    let diasDesdeUltimoLogin: number | null = null
    if (profile.last_login_at) {
      const diff = Date.now() - new Date(profile.last_login_at).getTime()
      diasDesdeUltimoLogin = Math.floor(diff / (1000 * 60 * 60 * 24))
    }

    // Estado label
    const estadoMap: Record<string, string> = {
      trial: 'Trial activo',
      active: 'Cliente activo',
      past_due: 'Pago pendiente',
      canceled: 'Cancelado',
      suspended: 'Suspendido',
    }
    const estadoStr = estadoMap[profile.estado_suscripcion] ?? profile.estado_suscripcion

    const systemPrompt = buildSofiaPrompt({
      userName: profile.nombre.split(' ')[0],
      estadoStr,
      trialDaysLeft,
      prospectsTotal: ctx.prospectos_total ?? 0,
      prospectsRojo: ctx.prospectos_rojo ?? 0,
      prospectsAmarillo: ctx.prospectos_amarillo ?? 0,
      victoriasEsteMes: ctx.victorias_este_mes ?? 0,
      pipelineValor: `${ctx.pipeline_valor ?? 0} ${moneda}`,
      diasDesdeUltimoLogin,
      sector: profile.sector ?? 'No especificado',
      tipoVenta: profile.tipo_venta ?? 'No especificado',
      metaMensual: profile.meta_mensual ? `${profile.meta_mensual} ${moneda}` : 'No definida',
      today,
    })

    // Build message history for Claude (reverse since RPC returns DESC)
    const mensajesAnteriores = (historial ?? [])
      .reverse()
      .slice(0, -1) // exclude the message we just saved
      .map((m: { rol: string; contenido: string }) => ({
        role: m.rol === 'sofia' ? 'assistant' : 'user',
        content: m.contenido,
      }))

    mensajesAnteriores.push({ role: 'user', content: mensaje })

    const response = await anthropic.messages.create({
      model: SOFIA_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: mensajesAnteriores,
    })

    const respuesta = response.content[0].type === 'text' ? response.content[0].text : ''
    const tokensUsados = response.usage.input_tokens + response.usage.output_tokens

    // Save Sofia's response
    await supabase.from('conversaciones').insert({
      user_id: profile.id,
      session_id,
      rol: 'sofia',
      contenido: respuesta,
      tokens_usados: tokensUsados,
    })

    return NextResponse.json({ respuesta, tokens_usados: tokensUsados })
  } catch (err) {
    console.error('[support-chat]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
