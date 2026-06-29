import AppShell from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('estado_suscripcion, trial_ends_at, nombre')
    .eq('auth_user_id', user.id)
    .single()

  if (profile?.estado_suscripcion === 'suspendida' || profile?.estado_suscripcion === 'cancelada') {
    redirect('/suspended')
  }

  return (
    <AppShell
      showBanner={profile?.estado_suscripcion === 'trial'}
      trialEndsAt={profile?.trial_ends_at}
    >
      {children}
    </AppShell>
  )
}
