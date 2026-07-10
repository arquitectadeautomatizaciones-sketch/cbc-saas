import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'

const ESTADO_LABEL: Record<string, string> = {
  prospecto: 'Prospecto nuevo',
  contactado: 'Contactado',
  propuesta_enviada: 'Propuesta enviada',
  en_negociacion: 'En negociación',
  en_pausa: 'En pausa',
  cerrado_ganado: 'Cerrado ganado',
  cerrado_perdido: 'Cerrado perdido',
}

function calcularSemaforo(rojos: number, amarillos: number, total: number): 'verde' | 'amarillo' | 'rojo' {
  if (total === 0) return 'amarillo'
  const pctRojo = rojos / total
  const pctAmarillo = amarillos / total
  if (pctRojo >= 0.5) return 'rojo'
  if (pctRojo + pctAmarillo >= 0.6) return 'amarillo'
  return 'verde'
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('id, nombre, sector, tipo_venta, meta_mensual, moneda')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const moneda = profile.moneda ?? 'USD'

  const [metricsRes, prospectosRes, victoriasRes] = await Promise.all([
    supabase.rpc('get_contexto_sofia', { p_user_id: profile.id }),
    supabase
      .from('prospectos')
      .select('id, nombre, empresa, estado, semaforo, dias_sin_contacto, valor_estimado, proximo_paso, dolor_principal')
      .eq('user_id', profile.id)
      .not('estado', 'in', '("cerrado_ganado","cerrado_perdido")')
      .order('semaforo', { ascending: false })
      .order('dias_sin_contacto', { ascending: false }),
    supabase
      .from('victorias')
      .select('tipo, descripcion, valor, fecha')
      .eq('user_id', profile.id)
      .gte('fecha', inicioMes)
      .order('fecha', { ascending: false }),
  ])

  const metrics = metricsRes.data ?? {
    prospectos_total: 0, prospectos_rojo: 0, prospectos_amarillo: 0,
    victorias_este_mes: 0, pipeline_valor: 0, cerradas_este_mes: 0,
  }
  const prospectos = prospectosRes.data ?? []
  const victorias = victoriasRes.data ?? []

  const semaforo = calcularSemaforo(
    metrics.prospectos_rojo,
    metrics.prospectos_amarillo,
    metrics.prospectos_total,
  )

  const enPropuesta = prospectos.filter(p => p.estado === 'propuesta_enviada')
  const enNegociacion = prospectos.filter(p => p.estado === 'en_negociacion')
  const rojos = prospectos.filter(p => p.semaforo === 'rojo').slice(0, 5)

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: moneda, maximumFractionDigits: 0,
  }).format(n)

  const victoriasTexto = victorias.length > 0
    ? victorias.map(v => `- ${v.tipo.replace(/_/g, ' ')}${v.descripcion ? `: ${v.descripcion}` : ''}${v.valor ? ` (${fmt(v.valor)})` : ''}`).join('\n')
    : 'Sin victorias registradas este mes'

  const rojosTexto = rojos.length > 0
    ? rojos.map(p => `- ${p.nombre}${p.empresa ? ` (${p.empresa})` : ''} — ${p.dias_sin_contacto} días sin contacto. Estado: ${ESTADO_LABEL[p.estado] ?? p.estado}.${p.proximo_paso ? ` Próximo paso: ${p.proximo_paso}` : ''}`).join('\n')
    : 'Sin prospectos en rojo'

  const propuestaTexto = enPropuesta.length > 0
    ? enPropuesta.map(p => `- ${p.nombre}${p.empresa ? ` (${p.empresa})` : ''}${p.valor_estimado ? ` — ${fmt(p.valor_estimado)}` : ''}`).join('\n')
    : 'Ninguno'

  const negociacionTexto = enNegociacion.length > 0
    ? enNegociacion.map(p => `- ${p.nombre}${p.empresa ? ` (${p.empresa})` : ''}${p.valor_estimado ? ` — ${fmt(p.valor_estimado)}` : ''}`).join('\n')
    : 'Ninguno'

  const semaforoLabel = semaforo === 'verde' ? '🟢 Verde — va bien' : semaforo === 'amarillo' ? '🟡 Amarillo — va regular' : '🔴 Rojo — necesita acción'
  const tonoClave = semaforo === 'verde'
    ? 'Tono: CONFIANZA. El vendedor va bien. El reporte debe transmitir resultados sólidos y momentum positivo. Resalta victorias y lo que viene fuerte en pipeline.'
    : semaforo === 'amarillo'
    ? 'Tono: CONTROL. El vendedor está encima del proceso aunque no todo está cerrado. El reporte debe mostrar que hay claridad, seguimiento activo y plan concreto.'
    : 'Tono: ACCIÓN. El mes está complicado. El reporte debe mostrar responsabilidad, análisis claro del cuello de botella y plan de recuperación específico — sin excusas, con fechas.'

  const prompt = `Eres un experto en comunicación comercial B2B para LATAM. Genera un reporte de desempeño comercial en español LATAM neutro, listo para que el vendedor lo copie y envíe a su jefe o director por WhatsApp o email.

VENDEDOR: ${profile.nombre}${profile.sector ? ` — sector: ${profile.sector}` : ''}${profile.tipo_venta ? `, tipo de venta: ${profile.tipo_venta}` : ''}
META MENSUAL: ${profile.meta_mensual ? `${profile.meta_mensual} cierres` : 'No definida'}
MES ACTUAL: ${hoy.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}

SEMÁFORO GENERAL DEL PIPELINE: ${semaforoLabel}
${tonoClave}

DATOS REALES DEL PIPELINE:
- Total prospectos activos: ${metrics.prospectos_total}
- En rojo (sin contacto 8+ días): ${metrics.prospectos_rojo}
- En amarillo (4-7 días): ${metrics.prospectos_amarillo}
- En verde (al día): ${metrics.prospectos_total - metrics.prospectos_rojo - metrics.prospectos_amarillo}
- En propuesta enviada: ${enPropuesta.length}
- En negociación activa: ${enNegociacion.length}
- Victorias este mes: ${metrics.victorias_este_mes}
- Valor total en pipeline: ${fmt(metrics.pipeline_valor)}
- Cierres este mes: ${metrics.cerradas_este_mes}

VICTORIAS DEL MES:
${victoriasTexto}

PROSPECTOS EN PROPUESTA:
${propuestaTexto}

PROSPECTOS EN NEGOCIACIÓN:
${negociacionTexto}

LEADS QUE NECESITAN ATENCIÓN (rojos):
${rojosTexto}

INSTRUCCIONES DE FORMATO:
- El reporte va de 150 a 220 palabras máximo — directo, no largo
- Empieza con una línea de estado claro (sin "Buenos días" genérico)
- Incluye números reales del pipeline
- Termina con los próximos 3 pasos concretos con timeframe
- Escrito en primera persona del vendedor
- NO uses markdown (sin asteriscos, sin #, sin -) — texto plano listo para WhatsApp
- Usa emojis de semáforo (🟢🟡🔴) solo donde refuercen el mensaje
- El tono debe sonar humano, no como reporte de sistema

Genera SOLO el texto del reporte — sin introducción, sin explicación, sin comillas al inicio o final.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = (message.content[0] as any).text?.trim() ?? ''

    return NextResponse.json({
      reporte: texto,
      semaforo,
      metricas: {
        total: metrics.prospectos_total,
        rojo: metrics.prospectos_rojo,
        amarillo: metrics.prospectos_amarillo,
        verde: metrics.prospectos_total - metrics.prospectos_rojo - metrics.prospectos_amarillo,
        victorias: metrics.victorias_este_mes,
        pipeline_valor: metrics.pipeline_valor,
        cerradas: metrics.cerradas_este_mes,
        en_propuesta: enPropuesta.length,
        en_negociacion: enNegociacion.length,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error generando el reporte. Intenta de nuevo.' }, { status: 500 })
  }
}
