'use client'

import { useRouter } from 'next/navigation'
import { diasRestantesTrial } from '@/utils/trial'
import { Clock } from 'lucide-react'

interface Props {
  trialEndsAt: string | null
}

export default function TrialBanner({ trialEndsAt }: Props) {
  const router = useRouter()
  const dias = diasRestantesTrial(trialEndsAt)

  if (dias <= 0) return null

  const urgente = dias <= 2

  return (
    <div
      className="flex items-center justify-between px-8 py-3 text-sm"
      style={{ backgroundColor: urgente ? '#ef4444' : '#1A4A44', color: 'white' }}
    >
      <div className="flex items-center gap-2">
        <Clock size={15} />
        <span>
          {urgente
            ? `⚠️ Tu trial vence en ${dias} día${dias === 1 ? '' : 's'}. ¡Activa tu cuenta para no perder tu pipeline!`
            : `Trial activo · ${dias} días restantes`}
        </span>
      </div>
      <button
        onClick={() => router.push('/subscribe')}
        className="px-4 py-1.5 rounded-lg font-semibold text-xs transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#4ECDC4', color: '#1A4A44' }}
      >
        Acceder al Sistema — $9.90/mes
      </button>
    </div>
  )
}
