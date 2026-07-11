import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email, score, sub_scores, cuello_de_botella, respuestas } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('leads_landing')
    .upsert(
      { email, score, sub_scores, cuello_de_botella, respuestas },
      { onConflict: 'email' },
    )

  if (error) {
    console.error('[leads_landing]', error.message)
    // Don't block the user if the table doesn't exist yet
  }

  return NextResponse.json({ ok: true })
}
