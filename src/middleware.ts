/**
 * Clerk Auth Middleware
 * Since the app uses Zustand view-based routing (all views on /),
 * we can't protect individual views via middleware.
 * Auth protection happens client-side in page.tsx.
 * This middleware handles API route protection only.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks/clerk',
  '/api/webhooks/paystack',
])

export default clerkMiddleware(async (auth, request) => {
  // Public routes don't need auth
  if (isPublicRoute(request)) return

  // API backend routes require auth
  if (request.nextUrl.pathname.startsWith('/api/backend/')) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
