import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { nombre, email, empresa, respuesta_1, respuesta_2, respuesta_3 } = await req.json()

  if (!respuesta_1) {
    return NextResponse.json({ error: 'La primera respuesta es requerida' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('testimonios_landing')
    .insert({ nombre, email, empresa, respuesta_1, respuesta_2, respuesta_3 })

  if (error) {
    console.error('[testimonios_landing]', error.message)
    return NextResponse.json({ error: 'Error guardando testimonio' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
