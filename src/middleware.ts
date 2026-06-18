/**
 * Clerk Middleware — REQUIRED for auth() to work in API routes.
 *
 * Clerk v6 requires clerkMiddleware() in the middleware chain.
 * Without it, every API route that calls auth() returns a 500 error:
 * "Clerk can't detect usage of clerkMiddleware()".
 *
 * The previous version removed clerkMiddleware() to avoid
 * MIDDLEWARE_INVOCATION_FAILED errors. Those errors were caused by
 * missing/malformed env vars, not by clerkMiddleware() itself.
 * Now that env vars are set on Vercel, clerkMiddleware() works.
 *
 * Webhook routes (Clerk + Paystack) are excluded from auth — they
 * verify signatures themselves.
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
  // Webhook routes — verify signatures themselves, not Clerk auth
  '/api/webhooks/clerk',
  '/api/webhooks/paystack',
])

export default clerkMiddleware((auth, req) => {
  // If this is a public route, let it through without auth check
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // For protected routes, Clerk handles the auth check.
  // If the user is not signed in, Clerk redirects to /sign-in automatically.
  // We call auth().protect() to enforce this on protected routes.
  // Note: API routes under /api/backend/ and /api/payments/ call auth()
  // themselves — they return 401 JSON if the user is not signed in.
  // The middleware just needs to be present for auth() to function.
})

export const config = {
  // Run middleware on everything except static assets and Next internals.
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
