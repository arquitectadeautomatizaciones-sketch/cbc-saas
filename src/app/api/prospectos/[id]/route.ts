import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('prospectos')
    .select('*, interacciones(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()

  // Fetch current state before updating to detect state transition
  const { data: prospecto_actual } = await supabase
    .from('prospectos')
    .select('estado, user_id')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('prospectos')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Schedule follow-ups when prospect transitions to propuesta_enviada
  if (
    body.estado === 'propuesta_enviada' &&
    prospecto_actual?.estado !== 'propuesta_enviada'
  ) {
    const user_id = prospecto_actual?.user_id
    const hoy = new Date()
    const fecha = (diasOffset: number) => {
      const d = new Date(hoy)
      d.setDate(d.getDate() + diasOffset)
      return d.toISOString().split('T')[0]
    }

    const seguimientos = [
      { prospecto_id: id, user_id, tipo: 'dia_1', fecha_envio: fecha(1), estado: 'pendiente' },
      { prospecto_id: id, user_id, tipo: 'dia_3', fecha_envio: fecha(3), estado: 'pendiente' },
      { prospecto_id: id, user_id, tipo: 'dia_7', fecha_envio: fecha(7), estado: 'pendiente' },
    ]

    // Fire-and-forget — don't block the response
    supabaseAdmin
      .from('seguimientos_programados')
      .insert(seguimientos)
      .then(({ error: segError }) => {
        if (segError) console.error('[seguimientos] Error al programar:', segError.message)
      })
  }

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { error } = await supabase.from('prospectos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
