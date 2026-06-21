'use client'

/**
 * error.tsx — Next.js App Router Error Boundary
 * ==============================================
 * Catches errors that occur during rendering of any route segment.
 * This file lives at the app root, so it catches errors from any page
 * (including the dashboard). Errors are automatically forwarded to
 * Sentry by the @sentry/nextjs SDK.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Explicitly capture — Sentry's React integration usually does this,
    // but explicit capture ensures we always send the digest too.
    Sentry.captureException(error, {
      extra: { digest: error.digest },
    })
    console.error('[AppError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="card-premium p-8 sm:p-10 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
          <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong.</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Our team has been notified. You can try again, or go back to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[14px] font-semibold transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-card-foreground text-[14px] font-semibold transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
