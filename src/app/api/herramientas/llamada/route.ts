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

  // Detectar tipo de llamada por estado del prospecto
  const esSegumiento = ['propuesta_enviada', 'en_negociacion', 'en_pausa'].includes(p.estado)

  const REGLAS_ORO = `REGLAS DE ORO — aplícalas siempre sin excepción:
1. NUNCA empieces con "hola ¿cómo estás?" — es tiempo muerto
2. NUNCA digas "te llamo para hacer seguimiento" — mata la llamada al instante
3. NUNCA bajes el precio sin pedir algo a cambio
4. SIEMPRE activa el dolor ANTES de mencionar el producto
5. SIEMPRE cierra con DOS opciones concretas — nunca pregunta abierta ("¿qué te parece?", "¿cuándo podemos hablar?")
6. Después del cierre — SILENCIO ABSOLUTO. El que habla primero, pierde`

  const CONTEXTO = `VENDEDOR: ${profile.nombre}${profile.sector ? ` — sector: ${profile.sector}` : ''}${profile.tipo_venta ? `, tipo de venta: ${profile.tipo_venta}` : ''}

PROSPECTO:
- Nombre: ${p.nombre}
- Empresa: ${p.empresa ?? 'no registrada'}
- Cargo: ${p.cargo ?? 'no registrado'}
- Dolor principal: ${p.dolor_principal ?? 'no registrado'}
- Estado en pipeline: ${ESTADO_LABEL[p.estado] ?? p.estado}
- Días sin contacto: ${p.dias_sin_contacto}
- Último contacto: ${p.ultimo_contacto ?? 'nunca'}
- Notas: ${p.notas ?? 'sin notas'}

HISTORIAL DE INTERACCIONES:
${historial}`

  const prompt = !esSegumiento
    // ── GUIÓN 1: Primera vez / en frío ───────────────────────────────
    ? `Eres un experto en ventas B2B para LATAM. Genera un guión de llamada en frío personalizado en español LATAM neutro. El texto debe ser lo que el vendedor dice literalmente — listo para leer en voz alta.

${CONTEXTO}

TIPO DE LLAMADA: Primera vez / en frío
Sigue esta estructura exacta de 5 fases, pero personalízala con los datos reales del prospecto:

FASE 1 — GANCHO 3 SEGUNDOS: Abre con amenaza + curiosidad + especificidad. Objetivo: que NO cuelgue. Sin presentación larga. Sin "¿cómo estás?". Ejemplo de estructura: "[Nombre], ¿sabes cuánto está perdiendo [empresa] por [dolor específico]? Tengo algo que en 2 minutos te cambia la perspectiva."

FASE 2 — DIAGNÓSTICO: Confirma el dolor con 2 preguntas específicas. No asumas — pregunta para que él lo diga. Ejemplo de estructura: "Antes de contarte — rápido: ¿cuántos [leads/clientes/etc.] pierdes al mes por [problema]? Y eso, ¿cuánto te cuesta en números reales?"

FASE 3 — PRECIO AL DOLOR: Pon número al dolor que acaba de confirmar. Hazlo sentir el costo de la inacción. Ejemplo de estructura: "Eso que me dijiste — a final de trimestre son [X]. Eso es lo que cuesta no resolverlo."

FASE 4 — PRESENTACIÓN 30 SEGUNDOS: Ahora sí, conecta el producto con el dolor que acaba de confirmar. Máximo 3 frases. Sin características — solo transformación.

FASE 5 — OBJECIONES + CIERRE CON DOS OPCIONES: Incluye respuesta para las 3 objeciones más probables (mándame info / no tengo presupuesto / estoy ocupado). Termina con cierre de dos opciones + instrucción de silencio.

${REGLAS_ORO}

Responde SOLO con JSON válido, sin texto extra ni markdown:
{
  "apertura": "GANCHO 3 segundos — texto exacto listo para decir",
  "diagnostico": "DIAGNÓSTICO + PRECIO AL DOLOR — texto exacto con las 2 preguntas y el reencuadre del costo",
  "propuesta": "PRESENTACIÓN 30 SEGUNDOS — texto exacto conectando dolor confirmado con solución",
  "cierre": "OBJECIONES + CIERRE — respuesta a las 3 objeciones probables + cierre con dos opciones + nota de silencio"
}`

    // ── GUIÓN 2: Seguimiento / propuesta enviada ─────────────────────
    : `Eres un experto en ventas B2B para LATAM. Genera un guión de llamada de seguimiento personalizado en español LATAM neutro. El texto debe ser lo que el vendedor dice literalmente — listo para leer en voz alta.

${CONTEXTO}

TIPO DE LLAMADA: Seguimiento / propuesta enviada (${ESTADO_LABEL[p.estado] ?? p.estado} — ${p.dias_sin_contacto} días sin contacto)
Sigue esta estructura exacta de 4 fases, pero personalízala con los datos reales del prospecto:

FASE 1 — GANCHO 3 SEGUNDOS (URGENCIA + PÉRDIDA): No "solo para dar seguimiento". Abre con urgencia real o pérdida concreta. Ejemplo de estructura: "[Nombre], en los últimos [días sin contacto] días que no hablamos, [empresa] siguió perdiendo [dolor]. Necesito 3 minutos."

FASE 2 — REACTIVA EL DOLOR CON NÚMEROS: Recuérdale lo que está perdiendo mientras no decide. Usa el dolor registrado y ponle número. Ejemplo de estructura: "Cuando hablamos, me dijiste que [dolor]. ¿Sabes cuánto cuesta eso al mes? Hicimos los números — son [X]. Cada semana que no actúas, ese número sube."

FASE 3 — EL ELEMENTO NUEVO: Introduce algo que no existía la última vez — un caso de éxito de cliente similar, un cambio de condiciones, o un insight del sector. Ejemplo de estructura: "Esta semana cerré con [perfil similar a su empresa] — el mismo problema que tú. En 30 días ya ven resultados. Eso es exactamente lo que tú necesitas."

FASE 4 — OBJECIONES DE SEGUIMIENTO + CIERRE O LIBERACIÓN CON DIGNIDAD: Maneja las objeciones típicas de seguimiento (sigo pensándolo / espero aprobación / no es momento). Termina con cierre de dos opciones — o si no hay avance, liberación con dignidad que deje la puerta abierta. Siempre con silencio después.

${REGLAS_ORO}

Responde SOLO con JSON válido, sin texto extra ni markdown:
{
  "apertura": "GANCHO 3 SEGUNDOS — urgencia real sin decir 'seguimiento', texto exacto listo para decir",
  "diagnostico": "REACTIVA EL DOLOR + ELEMENTO NUEVO — texto exacto con el número del dolor y el caso o insight nuevo",
  "propuesta": "OBJECIONES DE SEGUIMIENTO — respuestas exactas para las 3 objeciones más probables en esta etapa",
  "cierre": "CIERRE CON DOS OPCIONES o LIBERACIÓN CON DIGNIDAD — texto exacto + nota de silencio absoluto"
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
