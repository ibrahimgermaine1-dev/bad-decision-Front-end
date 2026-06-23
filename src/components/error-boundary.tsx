'use client'

/**
 * ErrorBoundary
 * =============
 * Captures React render errors and forwards them to Sentry (if initialized).
 * Renders a friendly fallback UI instead of a blank white screen.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <RiskyComponent />
 *   </ErrorBoundary>
 *
 * Place one near the top of the dashboard so a single broken view doesn't
 * crash the entire app.
 */
import React from 'react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  /** Optional — set to true to skip Sentry capture (e.g., for known-flaky components) */
  skipSentry?: boolean
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Forward to Sentry — Sentry will dedupe and stack-trace it.
    // The Sentry SDK's React integration auto-captures this anyway, but
    // explicitly capturing ensures we get the React component stack too.
    if (!this.props.skipSentry) {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      })
    }
    console.error('[ErrorBoundary] Caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Default fallback: friendly message + reload button
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="card-premium p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
            <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong.</h3>
          <p className="text-[14px] text-muted-foreground mb-4">
            We have been notified. Try reloading the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[14px] font-semibold transition-colors"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
