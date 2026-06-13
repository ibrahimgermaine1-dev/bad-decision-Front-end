/**
 * Clerk Auth Middleware
 * Protects dashboard and API routes. Public pages don't require auth.
 * Uses Clerk's built-in middleware for authentication.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sso-callback',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/faq',
  '/api/webhooks/clerk',
  '/api/webhooks/paystack',
])

export default clerkMiddleware(async (auth, request) => {
  // Public routes don't need auth
  if (isPublicRoute(request)) return

  // All other routes require authentication
  await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
