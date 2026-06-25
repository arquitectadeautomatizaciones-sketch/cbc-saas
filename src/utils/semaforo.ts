import type { SemaforoColor } from '@/lib/types'

export function getSemaforoColor(dias: number): SemaforoColor {
  if (dias <= 3) return 'verde'
  if (dias <= 7) return 'amarillo'
  return 'rojo'
}

export const semaforoClasses: Record<SemaforoColor, string> = {
  verde: 'bg-green-500',
  amarillo: 'bg-yellow-400',
  rojo: 'bg-red-500',
}

export const semaforoLabel: Record<SemaforoColor, string> = {
  verde: 'Al día',
  amarillo: 'Seguir pronto',
  rojo: 'Urgente',
}

export function semaforoTextColor(color: SemaforoColor): string {
  const map: Record<SemaforoColor, string> = {
    verde: 'text-green-700',
    amarillo: 'text-yellow-700',
    rojo: 'text-red-700',
  }
  return map[color]
}
