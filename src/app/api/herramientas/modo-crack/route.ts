import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('id, nombre, moneda')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const inicioMes = new Date()
  inicioMes.setDate(1)
  const inicioMesStr = inicioMes.toISOString().split('T')[0]

  const [metricsRes, victoriasRes] = await Promise.all([
    supabase.rpc('get_contexto_sofia', { p_user_id: profile.id }),
    supabase
      .from('victorias')
      .select('tipo')
      .eq('user_id', profile.id)
      .gte('fecha', inicioMesStr),
  ])

  const m = metricsRes.data ?? {
    prospectos_rojo: 0, prospectos_amarillo: 0,
    victorias_este_mes: 0, pipeline_valor: 0,
  }
  const victoriasMes = victoriasRes.data?.length ?? 0
  const moneda = profile.moneda ?? 'USD'
  const pipelineFmt = new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: moneda, maximumFractionDigits: 0,
  }).format(m.pipeline_valor ?? 0)

  const nombre = profile.nombre?.split(' ')[0] ?? 'Vendedor'

  const prompt = `Eres el coach interno de un vendedor B2B de alto rendimiento en Latinoamérica. Genera un ritual de preparación mental personalizado — directo, poderoso, de entre 3 y 4 líneas.

DATOS REALES DEL VENDEDOR:
- Nombre: ${nombre}
- Prospectos en rojo hoy (necesitan llamada urgente): ${m.prospectos_rojo}
- Prospectos en amarillo (requieren seguimiento): ${m.prospectos_amarillo}
- Victorias registradas este mes: ${victoriasMes}
- Valor en pipeline: ${pipelineFmt}

INSTRUCCIONES:
- Empieza con el nombre del vendedor
- Menciona los datos reales (rojos, victorias) de forma natural — no los liste, intégralos en el texto
- Hazlo sentir que hoy puede ganar — específico, no genérico
- Termina con una frase de entrada al día que genere estado mental de vendedor élite
- Máximo 4 líneas. Sin bullets. Sin títulos. Solo el texto.
- Tono: mentor que cree en él, no motivador de autoayuda barato

Genera SOLO el texto del ritual — nada más.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })
    const ritual = (message.content[0] as { text: string }).text?.trim() ?? ''
    return NextResponse.json({ ritual, nombre, victoriasMes, rojos: m.prospectos_rojo, amarillos: m.prospectos_amarillo, pipeline: pipelineFmt })
  } catch {
    return NextResponse.json({ error: 'Error generando el ritual.' }, { status: 500 })
  }
}
