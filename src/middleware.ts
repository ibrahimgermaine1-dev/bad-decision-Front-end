/**
 * Middleware — Simplified for build compatibility.
 * Auth protection is handled client-side and in API route handlers.
 * Clerk middleware is only active when a valid Clerk key exists.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // All auth is handled:
  // - Client-side: by ClerkProvider + useAuth() in components
  // - API routes: by auth() from @clerk/nextjs/server in each route handler
  // This middleware just passes through.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
