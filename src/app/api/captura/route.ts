import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const URGENCIA_SEMAFORO: Record<string, 'rojo' | 'amarillo' | 'verde'> = {
  listo: 'rojo',
  explorando: 'amarillo',
  curiosidad: 'verde',
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { user_id, nombre, empresa, cargo, whatsapp, email, urgencia, como_encontro } = body

  if (!user_id || !nombre || !empresa || !whatsapp || !urgencia) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Verify the user exists
  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', user_id)
    .single()

  if (!userRow) {
    return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })
  }

  const semaforo = URGENCIA_SEMAFORO[urgencia] ?? 'verde'

  const notas = como_encontro ? `Cómo me encontró: ${como_encontro}` : null

  const { data, error } = await supabaseAdmin
    .from('prospectos')
    .insert({
      user_id,
      nombre,
      empresa,
      cargo: cargo || null,
      telefono: whatsapp,
      email: email || null,
      estado: 'prospecto',
      canal_origen: 'qr',
      semaforo,
      dias_sin_contacto: 0,
      notas,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
}
