'use client'

/**
 * global-error.tsx — Next.js Global Error Boundary
 * ================================================
 * Catches errors that error.tsx can't — specifically errors thrown
 * from the root layout itself. This component replaces the entire
 * HTML document, so it must render its own <html> and <body> tags.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/global-error
 */
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      extra: { digest: error.digest },
    })
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #d4e5e8',
            borderRadius: '1rem',
            padding: '2.5rem',
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 61, 77, 0.08)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '9999px',
              background: 'rgba(192, 57, 43, 0.1)',
              border: '1px solid rgba(192, 57, 43, 0.2)',
              marginBottom: '1rem',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c0392b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f1f24', marginBottom: '0.5rem' }}>
            Application Error
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#5a6a70', marginBottom: '1.5rem' }}>
            A critical error occurred. Our team has been notified. You can try reloading the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              background: '#00a8cc',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
