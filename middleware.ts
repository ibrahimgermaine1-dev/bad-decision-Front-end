import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

// Check if Clerk is properly configured
function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secret = process.env.CLERK_SECRET_KEY
  if (!key || !secret) return false
  if (key.includes('placeholder') || key.includes('replace') || key.includes('your-')) return false
  if (secret.includes('placeholder') || secret.includes('replace') || secret.includes('your-')) return false
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false
  if (!secret.startsWith('sk_test_') && !secret.startsWith('sk_live_')) return false
  return true
}

// If Clerk is not configured, skip the middleware entirely
const clerkMiddlewareInstance = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect({
      signInUrl: '/sign-in',
    })
  }
})

export default function middleware(req: any) {
  if (!isClerkConfigured()) {
    // Clerk not configured — just pass through without auth checks
    // The dashboard page will show its own "sign in to continue" message
    return NextResponse.next()
  }
  return clerkMiddlewareInstance(req)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
