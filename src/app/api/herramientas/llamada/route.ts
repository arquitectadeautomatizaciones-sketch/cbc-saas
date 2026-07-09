import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'

const ESTADO_LABEL: Record<string, string> = {
  prospecto: 'Prospecto nuevo',
  contactado: 'Ya contactado',
  propuesta_enviada: 'Propuesta enviada',
  en_negociacion: 'En negociación',
  en_pausa: 'En pausa',
}

const CANAL_LABEL: Record<string, string> = {
  llamada: 'llamada', whatsapp: 'WhatsApp', email: 'email',
  linkedin: 'LinkedIn', reunion: 'reunión', otro: 'contacto',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('id, nombre, sector, tipo_venta')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const { prospecto_id } = await req.json()
  if (!prospecto_id) return NextResponse.json({ error: 'Falta prospecto_id' }, { status: 400 })

  const [prospectoRes, interaccionesRes] = await Promise.all([
    supabase.from('prospectos').select('*').eq('id', prospecto_id).eq('user_id', profile.id).single(),
    supabase.from('interacciones').select('*').eq('prospecto_id', prospecto_id).order('fecha', { ascending: false }).limit(5),
  ])

  if (!prospectoRes.data) return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 })

  const p = prospectoRes.data
  const interacciones = interaccionesRes.data ?? []

  const historial = interacciones.length > 0
    ? interacciones.map((i: any) =>
        `- ${i.fecha} vía ${CANAL_LABEL[i.canal] ?? i.canal}${i.resultado ? `: ${i.resultado}` : ''}${i.proximo_paso ? ` → próximo paso: ${i.proximo_paso}` : ''}`
      ).join('\n')
    : 'Sin interacciones previas registradas.'

  const prompt = `Eres un experto en ventas B2B para LATAM. Genera un guión de llamada telefónica personalizado en español LATAM neutro.

VENDEDOR: ${profile.nombre}${profile.sector ? ` — sector: ${profile.sector}` : ''}${profile.tipo_venta ? `, tipo de venta: ${profile.tipo_venta}` : ''}

PROSPECTO:
- Nombre: ${p.nombre}
- Empresa: ${p.empresa ?? 'no registrada'}
- Cargo: ${p.cargo ?? 'no registrado'}
- Dolor principal: ${p.dolor_principal ?? 'no registrado'}
- Estado en pipeline: ${ESTADO_LABEL[p.estado] ?? p.estado}
- Días sin contacto: ${p.dias_sin_contacto}
- Último contacto: ${p.ultimo_contacto ?? 'nunca'}
- Notas: ${p.notas ?? 'sin notas'}

HISTORIAL DE INTERACCIONES ANTERIORES:
${historial}

Genera un guión con exactamente 4 secciones. El texto debe ser lo que el vendedor dice literalmente — listo para leer en voz alta.

Reglas:
- Usa el nombre del prospecto naturalmente
- Si hay dolor registrado, conecta todo desde ahí
- Si hay historial, haz referencia a la conversación anterior
- Sonar humano y conversacional, nunca robótico
- Si no hay historial, trátalo como primer contacto
- Español LATAM neutro, directo y cálido

Responde SOLO con JSON válido, sin texto extra ni markdown:
{
  "apertura": "texto exacto de apertura (15 segundos, presentación sin sonar a vendedor, abrir con algo de ellos)",
  "diagnostico": "texto exacto de diagnóstico con 2 o 3 preguntas específicas para este prospecto (60 segundos)",
  "propuesta": "texto exacto conectando su dolor con la solución del vendedor (30 segundos)",
  "cierre": "texto exacto para pedir el siguiente paso concreto con dos opciones de fecha (15 segundos)"
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as any).text?.trim() ?? ''
    const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    const guion = JSON.parse(json)

    return NextResponse.json({
      apertura: guion.apertura,
      diagnostico: guion.diagnostico,
      propuesta: guion.propuesta,
      cierre: guion.cierre,
      prospecto: { nombre: p.nombre, empresa: p.empresa },
    })
  } catch {
    return NextResponse.json({ error: 'Error generando el guión. Intenta de nuevo.' }, { status: 500 })
  }
}
