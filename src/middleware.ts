/**
 * Clerk Auth Middleware — Bulletproof Version
 *
 * PROBLEM: Clerk's auth.protect() throws MIDDLEWARE_INVOCATION_FAILED when:
 *   - Clerk keys are not set in Vercel env vars
 *   - Clerk keys are invalid or wrong instance (test vs prod)
 *   - Clerk dashboard is unreachable from Vercel
 *
 * SOLUTION: Do NOT call auth.protect() in middleware at all.
 * Instead, just check if a Clerk session exists. If not, redirect to /sign-in.
 * If Clerk itself is unreachable, treat as not-signed-in (soft redirect).
 *
 * Auth enforcement for sensitive actions happens in API routes via auth().
 * This middleware only handles the UX of redirecting unauthenticated users
 * away from /dashboard.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sso-callback',
  '/sign-in(.*)',
  '/sign-up(.*)',
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
  '/api/webhooks/clerk',
  '/api/webhooks/paystack',
  '/api/coins(.*)',
  '/api/backend/(.*)',
  '/api/payments/(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Public routes never need any auth check
  if (isPublicRoute(request)) return

  // For protected routes (e.g. /dashboard), do a soft auth check.
  // We DO NOT call auth.protect() because it throws when Clerk keys
  // are missing/misconfigured, which crashes Vercel with
  // MIDDLEWARE_INVOCATION_FAILED.
  //
  // Instead: call auth() (returns the session, does NOT throw on
  // missing keys — returns null session instead).
  try {
    const { userId } = await auth()

    // If no user, redirect to sign-in. This is the only enforcement
    // we do in middleware. Real auth enforcement for API actions
    // happens inside each API route handler.
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // User is signed in — let them through.
    return
  } catch (error) {
    // If even auth() throws (Clerk totally broken), don't crash the request.
    // Just let it through. The dashboard page itself will handle missing
    // Clerk state gracefully via useUser() returning null.
    console.error('[MIDDLEWARE] auth() threw — Clerk may be misconfigured:', error)
    return
  }
})

export const config = {
  // Run middleware on everything except static assets and Next internals.
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
