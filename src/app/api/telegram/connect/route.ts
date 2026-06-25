import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called by the Telegram bot webhook when user sends /start
// The bot sends: POST /api/telegram/connect?secret=CBC_API_SECRET
// with body: { chat_id: string, user_email: string }
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CBC_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { chat_id, user_email } = await req.json()

  if (!chat_id || !user_email) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({
      telegram_chat_id: String(chat_id),
      telegram_conectado: true,
    })
    .eq('email', user_email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// GET — for logged-in user to check Telegram connection status
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('users')
    .select('telegram_chat_id, telegram_conectado')
    .eq('auth_user_id', user.id)
    .single()

  return NextResponse.json(data)
}
