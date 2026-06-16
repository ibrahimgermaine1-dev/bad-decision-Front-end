/**
 * Clerk Auth Middleware — Resilient Version
 * Protects dashboard routes. Public pages and API routes don't require
 * middleware-level auth (API routes have their own auth() checks).
 *
 * FIX: Wrapped in try-catch to prevent MIDDLEWARE_INVOCATION_FAILED.
 * FIX: All marketing pages added to public routes.
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
  // Public routes don't need auth
  if (isPublicRoute(request)) return

  // All other routes require authentication
  // Wrapped in try-catch to prevent 500 MIDDLEWARE_INVOCATION_FAILED
  try {
    await auth.protect()
  } catch (error) {
    // If auth.protect() throws (e.g., Clerk keys not configured),
    // redirect to sign-in instead of showing a 500 error page
    console.error('[MIDDLEWARE] auth.protect() failed:', error)
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
