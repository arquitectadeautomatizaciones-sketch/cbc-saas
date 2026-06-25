'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmado, setConfirmado] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    // Show "check your email" screen — no auto-login until email confirmed
    setConfirmado(true)
    setLoading(false)
  }

  // ── Estado: email enviado ──────────────────────────────────────
  if (confirmado) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            <MailCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#1A4A44' }}>
            Revisa tu email
          </h1>
          <p className="text-gray-600 leading-relaxed mb-2">
            Te enviamos un enlace de confirmación a{' '}
            <strong>{form.email}</strong>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Haz clic en el enlace para activar tu cuenta y empezar tu prueba de 7 días.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-left text-sm text-gray-500 space-y-2">
            <p className="font-medium text-gray-700">¿No te llegó?</p>
            <p>Revisa tu carpeta de spam o correo no deseado.</p>
            <p>El enlace expira en 24 horas.</p>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            ¿Ya confirmaste?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#4ECDC4' }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Estado: formulario ─────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: '#1A4A44' }}
          >
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>
            Cierre Bajo Control™
          </h1>
          <p className="text-gray-500 mt-1 text-sm">7 días gratis · Sin tarjeta de crédito</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm"
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#1A4A44' }}
            >
              {loading ? 'Creando cuenta...' : 'Empezar 7 días gratis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#4ECDC4' }}>
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Al registrarte aceptas nuestros términos de uso. $9.90/mes después del trial.
        </p>
      </div>
    </div>
  )
}
