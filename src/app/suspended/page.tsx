import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-6">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Cuenta suspendida</h1>
        <p className="text-gray-500 mb-8">
          Tu suscripción está suspendida o cancelada. Reactiva tu cuenta para volver a acceder a tu pipeline y a Sofía.
        </p>
        <Link
          href="/subscribe"
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#1A4A44' }}
        >
          Reactivar cuenta →
        </Link>
      </div>
    </div>
  )
}
