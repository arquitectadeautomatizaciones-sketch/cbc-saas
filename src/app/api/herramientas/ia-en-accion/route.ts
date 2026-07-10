import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { accion } = body

  try {
    // ── 1. CONTACTAR ─────────────────────────────────────────────────
    if (accion === 'contactar') {
      const { nombre, empresa } = body
      if (!nombre) return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 })

      const prompt = `Eres un experto en ventas B2B para Latinoamérica. Analiza este prospecto y entrega todo en JSON.

PROSPECTO: ${nombre}${empresa ? ` — trabaja en ${empresa}` : ''}

Devuelve exactamente este JSON (sin texto extra):
{
  "perfil_cargo": "descripción breve del perfil típico de este cargo en 2 líneas — qué hace, qué presiones tiene, cómo mide su éxito",
  "dolores_tipicos": ["dolor 1 específico de este cargo/sector", "dolor 2", "dolor 3"],
  "frases_apertura": [
    "frase de apertura 1 — directa, sin intro genérica, conecta con su dolor más probable (máx 2 líneas)",
    "frase de apertura 2 — ángulo diferente, quizás ROI o comparación con competidores",
    "frase de apertura 3 — más emocional, conecta con lo que quiere lograr"
  ]
}

Reglas: usa los datos reales del nombre y empresa. Sin corchetes ni placeholders. Frases listas para copiar y enviar.`

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = (msg.content[0] as { text: string }).text?.trim() ?? ''
      const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      return NextResponse.json(JSON.parse(json))
    }

    // ── 2. NEUROVENTAS ───────────────────────────────────────────────
    if (accion === 'neuroventas') {
      const { producto, tipo_cliente } = body
      if (!producto) return NextResponse.json({ error: 'Falta descripción del producto' }, { status: 400 })

      const prompt = `Eres un experto en neuroventas B2B basado en las técnicas de Jürgen Klaric.

PRODUCTO/SERVICIO: ${producto}
TIPO DE CLIENTE: ${tipo_cliente || 'decisor B2B genérico'}

Traduce este producto a los 4 activadores del cerebro reptil. Devuelve exactamente este JSON:
{
  "supervivencia": "frase exacta lista para usar — empieza con 'Sin esto estás en riesgo de...' o similar. Activa el miedo a perder, a quedarse atrás, a que la competencia gane.",
  "control": "frase exacta lista para usar — empieza con 'Con esto tienes el poder de...' o similar. Activa el deseo de dominar, decidir, controlar resultados.",
  "placer": "frase exacta lista para usar — empieza con 'Imagina cómo se siente cuando...' o similar. Activa la anticipación del resultado positivo.",
  "pertenencia": "frase exacta lista para usar — empieza con 'Los mejores [tipo de cliente] ya...' o similar. Activa el deseo de pertenecer al grupo de los que ganan."
}

Reglas: frases específicas a este producto, no genéricas. Listas para decir o escribir sin modificar.`

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = (msg.content[0] as { text: string }).text?.trim() ?? ''
      const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      return NextResponse.json(JSON.parse(json))
    }

    // ── 3. COMITÉ ────────────────────────────────────────────────────
    if (accion === 'comite') {
      const { empresa, problema, roles, objeciones, diferenciadores } = body
      if (!empresa || !problema) return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })

      const prompt = `Eres un consultor experto en presentaciones comerciales B2B de alto valor. Genera una estructura de presentación ante comité.

EMPRESA CLIENTE: ${empresa}
PROBLEMA A RESOLVER: ${problema}
QUIÉNES ESTARÁN EN LA SALA: ${roles || 'No especificado'}
OBJECIONES QUE ANTICIPA: ${objeciones || 'Ninguna especificada'}
DIFERENCIADORES VS COMPETENCIA: ${diferenciadores || 'No especificados'}

Devuelve exactamente este JSON:
{
  "slides": [
    {
      "numero": 1,
      "titulo": "título del slide",
      "objetivo": "qué debe lograr este slide en la mente de los decisores",
      "copy": "el texto exacto que va en el slide — lo que se dice, no describe",
      "nota_orador": "qué decir mientras está en pantalla — en 1-2 líneas"
    }
  ],
  "como_cerrar": "instrucciones exactas para cerrar ante este comité específico — qué decir, qué preguntar, cómo manejar el 'lo consultamos internamente'",
  "objeciones_anticipadas": [
    { "objecion": "texto de la objeción", "respuesta": "respuesta exacta lista" }
  ]
}

Genera entre 6 y 8 slides. Estructura: (1) apertura/gancho, (2) el problema en sus números, (3) el costo de no resolver, (4) la solución, (5) diferenciadores, (6) prueba social/casos, (7) propuesta e inversión, (8) siguiente paso.`

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = (msg.content[0] as { text: string }).text?.trim() ?? ''
      const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      return NextResponse.json(JSON.parse(json))
    }

    // ── 4. CRISIS ────────────────────────────────────────────────────
    if (accion === 'crisis') {
      const { que_paso, mensaje_cliente, objetivo } = body
      if (!que_paso || !mensaje_cliente) return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })

      const prompt = `Eres un experto en manejo de crisis con clientes B2B. Analiza esta situación y genera la respuesta exacta.

QUÉ PASÓ: ${que_paso}
MENSAJE EXACTO DEL CLIENTE: "${mensaje_cliente}"
OBJETIVO: ${objetivo || 'salvar la relación'}

Devuelve exactamente este JSON:
{
  "lo_que_siente": "qué está sintiendo realmente el cliente detrás de ese mensaje — la emoción real, no lo que dice",
  "no_respondas": "la respuesta instintiva que NO debes dar — y por qué empeoraría la situación",
  "respuesta_exacta": "el mensaje exacto listo para copiar y enviar. Máx 120 palabras. Tono: calmado, responsable, sin defensiva, sin excusas, con propuesta concreta de siguiente paso."
}

Reglas para la respuesta: (1) reconoce sin admitir culpa automáticamente, (2) valida la emoción, (3) propone acción concreta, (4) no prometas lo que no puedes cumplir.`

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = (msg.content[0] as { text: string }).text?.trim() ?? ''
      const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      return NextResponse.json(JSON.parse(json))
    }

    // ── 5. REACTIVAR ─────────────────────────────────────────────────
    if (accion === 'reactivar') {
      const { prospecto_id } = body
      if (!prospecto_id) return NextResponse.json({ error: 'Falta prospecto_id' }, { status: 400 })

      const { data: prospecto } = await supabase
        .from('prospectos')
        .select('*, interacciones(*)')
        .eq('id', prospecto_id)
        .single()

      if (!prospecto) return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 })

      const historial = (prospecto.interacciones ?? [])
        .sort((a: { fecha: string }, b: { fecha: string }) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 3)
        .map((i: { fecha: string; canal: string; resultado: string | null }) =>
          `- ${new Date(i.fecha).toLocaleDateString('es-MX')}: ${i.canal}${i.resultado ? ` — ${i.resultado}` : ''}`
        ).join('\n') || 'Sin interacciones registradas.'

      const prompt = `Eres un experto en reactivación de leads B2B. Este prospecto lleva ${prospecto.dias_sin_contacto} días sin respuesta.

PROSPECTO: ${prospecto.nombre}${prospecto.empresa ? ` | ${prospecto.empresa}` : ''}${prospecto.cargo ? ` | ${prospecto.cargo}` : ''}
DOLOR REGISTRADO: ${prospecto.dolor_principal || 'No registrado'}
DÍAS SIN CONTACTO: ${prospecto.dias_sin_contacto}
HISTORIAL:
${historial}

Escribe un mensaje de reactivación de máximo 70 palabras que:
1. NO empiece con "Solo quería saber si..." ni "Te escribo para dar seguimiento..."
2. Conecte con su dolor o situación específica — demuestra que lo recuerdas
3. Agregue algo de valor: un dato nuevo, una pregunta provocadora, o un resultado de cliente similar
4. Termine con UNA pregunta sencilla que sea fácil de responder con "sí" o "me interesa"

Solo el texto del mensaje. Nada antes, nada después.`

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      })
      const mensaje = (msg.content[0] as { text: string }).text?.trim() ?? ''
      return NextResponse.json({ mensaje })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })

  } catch (e) {
    console.error('[ia-en-accion]', e)
    return NextResponse.json({ error: 'Error generando la respuesta. Intenta de nuevo.' }, { status: 500 })
  }
}
