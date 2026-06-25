import type { SemaforoColor } from '@/lib/types'
import { semaforoLabel } from '@/utils/semaforo'

interface Props {
  color: SemaforoColor
  dias: number
  size?: 'sm' | 'md'
}

const colorMap: Record<SemaforoColor, string> = {
  verde: '#22c55e',
  amarillo: '#f59e0b',
  rojo: '#ef4444',
}

const bgMap: Record<SemaforoColor, string> = {
  verde: '#dcfce7',
  amarillo: '#fef3c7',
  rojo: '#fee2e2',
}

const textMap: Record<SemaforoColor, string> = {
  verde: '#15803d',
  amarillo: '#92400e',
  rojo: '#991b1b',
}

export default function Semaforo({ color, dias, size = 'md' }: Props) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${textSize}`}
      style={{ backgroundColor: bgMap[color], color: textMap[color] }}
    >
      <span
        className={`${dotSize} rounded-full flex-shrink-0`}
        style={{ backgroundColor: colorMap[color] }}
      />
      {semaforoLabel[color]} · {dias}d
    </span>
  )
}
