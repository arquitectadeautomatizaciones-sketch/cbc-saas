'use client'

import { useState } from 'react'
import ChecklistActivacion from '@/components/ChecklistActivacion'

interface Props {
  tieneProspectos: boolean
  tieneConversaciones: boolean
  checklistCompletado: boolean
}

export default function DashboardChecklist({ tieneProspectos, tieneConversaciones, checklistCompletado }: Props) {
  const [oculto, setOculto] = useState(checklistCompletado)

  if (oculto) return null

  return (
    <ChecklistActivacion
      tieneProspectos={tieneProspectos}
      tieneConversaciones={tieneConversaciones}
      onChecklistCompleto={() => setOculto(true)}
    />
  )
}
