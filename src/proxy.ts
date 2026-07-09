import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/onboarding',
  '/subscribe',
  '/suspended',
  '/captura',
  '/api/auth/register',
  '/api/stripe/webhook',
  '/api/captura',
]

// Paths where we skip the onboarding check (APIs, special pages)
const SKIP_ONBOARDING_CHECK = [
  '/api/',
  '/onboarding',
  '/subscribe',
  '/suspended',
]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // ── Unauthenticated: redirect to login ──────────────────────────
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ── Authenticated ────────────────────────────────────────────────
  if (user) {
    // Redirect away from login/register
    if (pathname === '/login' || pathname === '/register') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Onboarding gate: skip for API routes and special pages
    const skipCheck = SKIP_ONBOARDING_CHECK.some((p) => pathname.startsWith(p))

    if (!skipCheck) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completado')
        .eq('auth_user_id', user.id)
        .single()

      const completado = profile?.onboarding_completado ?? false

      // Onboarding not done → force to /onboarding
      if (!completado) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    }

    // Onboarding already done → don't let them back in
    if (pathname.startsWith('/onboarding')) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completado')
        .eq('auth_user_id', user.id)
        .single()

      if (profile?.onboarding_completado) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
