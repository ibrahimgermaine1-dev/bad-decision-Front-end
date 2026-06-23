/**
 * Instrumentation Hook (server + edge)
 * =====================================
 * Next.js loads this file once on startup. It imports the right Sentry
 * config based on the runtime (Node.js or Edge).
 *
 * Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

/**
 * onRequestError — Next.js 15+ hook for capturing errors thrown by
 * Server Actions and nested React Server Components. Forwards them
 * to Sentry with route + request context.
 *
 * Without this, errors thrown inside Server Components during streaming
 * won't reach Sentry. The Sentry SDK auto-instruments most paths, but
 * this hook is the canonical way to capture RSC errors.
 */
export const onRequestError = Sentry.captureRequestError
