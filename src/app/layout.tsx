import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.arquitectadeautomatizaciones.com'

export const metadata: Metadata = {
  title: 'CBC™ — Sistema de seguimiento de ventas B2B para LATAM',
  description: 'Cierra más sin improvisar. CBC™ prioriza tus prospectos, genera el mensaje correcto y te prepara para cada reunión — todo en un solo lugar. Prueba gratis 7 días.',

  manifest: '/manifest.json',
  themeColor: '#4ECDC4',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CBC™',
  },

  metadataBase: new URL(SITE_URL),

  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'CBC™ — Deja de perder ventas que ya tenías ganadas',
    description: 'El copiloto de ventas B2B que sabe exactamente en qué momento está cada prospecto y genera el mensaje, el guión y el reporte correctos para que cierres más. $9.90/mes.',
    siteName: 'Cierre Bajo Control™',
    images: [
      {
        url: '/hero-mockup.png',
        width: 1200,
        height: 630,
        alt: 'CBC™ — Dashboard de seguimiento de ventas B2B con semáforo de prioridad',
      },
    ],
    locale: 'es_419',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'CBC™ — Deja de perder ventas que ya tenías ganadas',
    description: 'El copiloto de ventas B2B para vendedores individuales en LATAM. Semáforo de prioridad, mensajes listos, Reporte al Jefe™. $9.90/mes.',
    images: ['/hero-mockup.png'],
  },

  keywords: [
    'seguimiento de prospectos B2B',
    'CRM para vendedores',
    'cierre de ventas LATAM',
    'sistema de ventas B2B',
    'copiloto de ventas',
    'seguimiento de clientes',
    'CBC Cierre Bajo Control',
  ],

  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F5F0E8]" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
