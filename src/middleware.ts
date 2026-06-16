/**
 * Bulletproof Middleware — No Clerk crashes possible.
 *
 * ROOT CAUSE of MIDDLEWARE_INVOCATION_FAILED:
 * Clerk v6's `clerkMiddleware()` wrapper throws DURING MODULE LOAD
 * (before our handler runs) when:
 *   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing
 *   - The key is malformed (wrong format, wrong instance)
 *   - The key is for a different Clerk instance than CLERK_SECRET_KEY
 *
 * This means our try/catch inside the handler never even runs.
 *
 * SOLUTION: Skip Clerk entirely in middleware. Use plain Next.js
 * middleware that only checks for a Clerk session cookie. If Clerk
 * is broken/missing, the site still loads. Auth enforcement for
 * sensitive actions happens in API routes via auth().
 *
 * The dashboard page itself does a client-side redirect to /sign-in
 * if useAuth() returns isSignedIn=false, so middleware-level auth
 * is redundant for the UX.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/sso-callback',
  '/pricing',
  '/faq',
  '/how-it-works',
  '/case-studies',
  '/guarantee',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/refund',
]

const PUBLIC_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
  '/api/webhooks/paystack',
  '/api/coins',
  '/api/backend/',
  '/api/payments/',
]

function isPublic(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes always pass through
  if (isPublic(pathname)) return NextResponse.next()

  // For protected routes (e.g. /dashboard), check for Clerk session cookie.
  // Clerk v6 stores the active session in cookies named like:
  //   __clerk_db_jwt
  //   __session
  //   __clerk_status_expiry_cookie
  // If none exist, redirect to /sign-in.
  //
  // This is a SOFT check only — real auth enforcement happens in API
  // routes via auth(). This redirect is purely for UX so unauthenticated
  // users don't see a broken dashboard.
  const hasClerkCookie = request.cookies.get('__clerk_db_jwt') ||
                         request.cookies.get('__session') ||
                         request.cookies.get('__client_uat')

  if (!hasClerkCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on everything except static assets and Next internals.
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
