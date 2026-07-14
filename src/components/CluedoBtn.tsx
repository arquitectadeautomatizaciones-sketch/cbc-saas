'use client'

interface CluedoBtnProps {
  label: string
  onClick: () => void
  disabled?: boolean
  full?: boolean
  fontSize?: number
}

export function CluedoBtn({ label, onClick, disabled = false, full = true, fontSize = 20 }: CluedoBtnProps) {
  const shadow = '0 8px 0 #4a0008, 0 12px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)'
  const shadowPressed = '0 3px 0 #4a0008, 0 5px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: full ? 'block' : 'inline-block',
        width: full ? '100%' : undefined,
        padding: '18px 32px',
        background: disabled ? '#1a1a1a' : 'linear-gradient(180deg, #c8001a 0%, #9a0014 60%, #7a000f 100%)',
        color: disabled ? 'rgba(255,255,255,0.25)' : 'white',
        border: disabled ? 'none' : '3px solid rgba(255,255,255,0.15)',
        borderRadius: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize, letterSpacing: '0.10em',
        boxShadow: disabled ? 'none' : shadow,
        textShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
        transition: 'transform 0.08s ease, box-shadow 0.08s ease',
      }}
      onMouseDown={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = shadowPressed } }}
      onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow } }}
    >
      {label}
    </button>
  )
}
