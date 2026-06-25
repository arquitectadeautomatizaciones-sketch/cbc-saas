import Sidebar from '@/components/Sidebar'
import TrialBanner from '@/components/TrialBanner'
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {profile?.estado_suscripcion === 'trial' && (
          <TrialBanner trialEndsAt={profile.trial_ends_at} />
        )}
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  )
}
