'use client'

/**
 * Safe Clerk Auth Components
 * These components wrap Clerk's SignIn/SignUp with error boundaries.
 * If Clerk is not configured, they show a helpful fallback UI instead of crashing.
 */
import { Component, ReactNode } from 'react'
import { isClerkConfigured } from '@/lib/clerk-config'
import { SignIn } from '@clerk/nextjs'
import { SignUp } from '@clerk/nextjs'

// ============================================================
// ERROR BOUNDARY
// ============================================================
class ClerkErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// ============================================================
// CLERK APPEARANCE CONFIG
// ============================================================
const clerkAppearance = {
  elements: {
    rootBox: 'w-full',
    card: 'rounded-2xl border border-[var(--border-color)] shadow-sm bg-[var(--bg-primary)]',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    formButtonPrimary: 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] hover:opacity-90 text-white h-11 font-semibold rounded-xl',
    formFieldInput: 'border-[var(--border-color)] h-11 rounded-xl bg-[var(--bg-surface)]',
    footerActionLink: 'text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium',
    socialButtonsBlockButton: 'border-[var(--border-color)] h-11 font-medium text-[var(--text-primary)] rounded-xl',
    dividerLine: 'bg-[var(--border-color)]',
    dividerText: 'text-[var(--text-tertiary)] text-xs',
    formFieldLabel: 'text-[var(--text-secondary)] font-medium',
    identityPreviewText: 'text-[var(--text-primary)]',
    alertText: 'text-sm',
  },
}

// ============================================================
// NOT CONFIGURED FALLBACK
// ============================================================
function ClerkNotConfiguredFallback({ type }: { type: 'sign-in' | 'sign-up' }) {
  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          {type === 'sign-in' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Authentication is being set up. This feature will be available soon.
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mb-6">
          In the meantime, explore our features and pricing.
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Home
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-surface)] transition-colors"
          >
            View Pricing
          </a>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ERROR FALLBACK (when Clerk throws unexpectedly)
// ============================================================
function ClerkErrorFallback({ type }: { type: 'sign-in' | 'sign-up' }) {
  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          We could not load the {type === 'sign-in' ? 'sign in' : 'sign up'} form. Please try refreshing the page.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}

// ============================================================
// SAFE SIGN IN
// ============================================================
export function SafeSignIn() {
  // If Clerk is not configured, show fallback
  if (!isClerkConfigured()) {
    return <ClerkNotConfiguredFallback type="sign-in" />
  }

  return (
    <ClerkErrorBoundary fallback={<ClerkErrorFallback type="sign-in" />}>
      <SignIn
        appearance={clerkAppearance}
        signUpUrl="/sign-up"
        forceSignUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </ClerkErrorBoundary>
  )
}

// ============================================================
// SAFE SIGN UP
// ============================================================
export function SafeSignUp() {
  // If Clerk is not configured, show fallback
  if (!isClerkConfigured()) {
    return <ClerkNotConfiguredFallback type="sign-up" />
  }

  return (
    <ClerkErrorBoundary fallback={<ClerkErrorFallback type="sign-up" />}>
      <SignUp
        appearance={clerkAppearance}
        signInUrl="/sign-in"
        forceSignInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </ClerkErrorBoundary>
  )
}
