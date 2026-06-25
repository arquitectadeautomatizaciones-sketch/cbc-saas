import type { Prospecto } from '@/lib/types'
import Semaforo from './Semaforo'
import { Building2, Phone, Mail } from 'lucide-react'

interface Props {
  prospecto: Prospecto
  onClick?: () => void
}

const estadoLabel: Record<string, string> = {
  prospecto: 'Prospecto',
  contactado: 'Contactado',
  propuesta_enviada: 'Propuesta enviada',
  en_negociacion: 'En negociación',
  cerrado_ganado: 'Cerrado ✓',
  cerrado_perdido: 'Cerrado ✗',
  en_pausa: 'En pausa',
}

const estadoBg: Record<string, string> = {
  prospecto: '#e0e7ff',
  contactado: '#dbeafe',
  propuesta_enviada: '#fef3c7',
  en_negociacion: '#d1fae5',
  cerrado_ganado: '#bbf7d0',
  cerrado_perdido: '#fee2e2',
  en_pausa: '#f3f4f6',
}

export default function ProspectoCard({ prospecto, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{prospecto.nombre}</h3>
          {prospecto.empresa && (
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
              <Building2 size={13} />
              <span className="truncate">{prospecto.empresa}</span>
            </div>
          )}
        </div>
        <Semaforo color={prospecto.semaforo} dias={prospecto.dias_sin_contacto} size="sm" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: estadoBg[prospecto.estado] ?? '#f3f4f6', color: '#374151' }}
        >
          {estadoLabel[prospecto.estado] ?? prospecto.estado}
        </span>
        {prospecto.valor_estimado && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            ${prospecto.valor_estimado.toLocaleString()}
          </span>
        )}
      </div>

      {prospecto.proximo_paso && (
        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg truncate">
          → {prospecto.proximo_paso}
        </p>
      )}

      <div className="flex gap-3 mt-3">
        {prospecto.telefono && (
          <a
            href={`tel:${prospecto.telefono}`}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Phone size={15} />
          </a>
        )}
        {prospecto.email && (
          <a
            href={`mailto:${prospecto.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Mail size={15} />
          </a>
        )}
      </div>
    </div>
  )
}
