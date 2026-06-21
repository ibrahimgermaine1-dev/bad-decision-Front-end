/**
 * Instrumentation Client Hook (browser)
 * ======================================
 * Next.js 15+ replacement for `sentry.client.config.ts`. Loaded once
 * in the browser before any user code runs.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production'

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Performance monitoring — sample 10% of sessions to keep costs low.
    tracesSampleRate: 0.1,

    // Session replay — sample 1% of sessions, with 100% error capture.
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        // Mask all text + inputs by default for privacy. Unmask specific
        // elements with `data-sentry-unmask` if needed.
        maskAllText: true,
        blockAllMedia: true,
      }),
      // Capture fetch/XHR errors automatically
      Sentry.browserTracingIntegration(),
    ],

    // Don't send PII to Sentry (Clerk user IDs are still sent as tags)
    sendDefaultPii: false,

    // Ignore noisy non-actionable errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Paystack popup quirks
      'PaystackPop',
      // Clerk auth edge cases (user just signed out, etc.)
      'clerkjs',
      // Network errors handled by our own retry logic
      'Network request failed',
      'Failed to fetch',
    ],

    // Don't send errors from browser extensions
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox extensions
      /^moz-extension:\/\//i,
      // Safari extensions
      /^safari-web-extension:\/\//i,
    ],
  })
}

/**
 * onRouterTransitionStart — Next.js App Router navigation instrumentation.
 * Captures route transitions as Sentry transactions for performance monitoring.
 *
 * Required by @sentry/nextjs v9+ for App Router navigation tracing.
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

// Re-export for any code that imports from this file
export * from '@sentry/nextjs'
