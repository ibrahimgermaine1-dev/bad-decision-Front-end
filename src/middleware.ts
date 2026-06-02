import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes require authentication
// The dashboard is accessible to everyone (SPA handles showing login),
// but API routes that need auth should check Clerk session
const isProtectedRoute = createRouteMatcher([
  // API routes that require a Clerk session are protected in their handlers
  // No route-level protection needed since our app is a SPA
])

export default clerkMiddleware(async (auth, req) => {
  // Allow all routes — the frontend handles auth state via Zustand + Clerk hooks
  // API routes check Clerk auth internally when needed
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|doc|xlsx|ppt|txt|xml)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
