import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { nombre, cargo, como_habla, que_preguntas, como_decide, mayor_preocupacion, etapa } = await req.json()

  if (!nombre || !como_habla || !que_preguntas || !como_decide || !mayor_preocupacion || !etapa) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const prompt = `Actúa como experto en neuroventas B2B basado en DISC. Mi prospecto se llama ${nombre}${cargo ? `, es ${cargo}` : ''}. Observo que habla de forma "${como_habla}" y sus preguntas típicas son "${que_preguntas}". Toma decisiones de forma "${como_decide}" y su mayor preocupación es "${mayor_preocupacion}". Estamos en etapa de ${etapa}.

Dame exactamente esto en formato JSON (solo el JSON, sin texto extra):
{
  "perfil_disc": "D" | "I" | "S" | "C",
  "perfil_nombre": "El Dominante" | "El Influyente" | "El Estable" | "El Concienzudo",
  "perfil_explicacion": "explicación en 2 líneas de por qué este perfil",
  "como_hablarle": ["clave concreta 1", "clave concreta 2", "clave concreta 3"],
  "como_precio": "táctica exacta para presentar el precio a este perfil",
  "como_cerrar": "frase o técnica específica de cierre para este perfil",
  "error_fatal": "el error que NO debes cometer con este perfil",
  "frase_activa": "la frase exacta lista para usar que lo activa"
}

Formato de cada campo: claro, directo, accionable. Sin teoría — solo qué hacer. Máximo 2 líneas por campo.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as any).text?.trim() ?? ''
    const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    const estrategia = JSON.parse(json)

    return NextResponse.json(estrategia)
  } catch {
    return NextResponse.json({ error: 'Error generando la estrategia. Intenta de nuevo.' }, { status: 500 })
  }
}
