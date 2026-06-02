'use client'

/**
 * AUTH PAGES — Sign Up + Sign In
 * Uses Clerk's pre-built SignIn and SignUp components.
 * Falls back to a custom form when Clerk is not configured.
 *
 * FINGERPRINT PRO INTEGRATION:
 * On the sign-up page, we:
 *   1. Generate a device fingerprint using FingerprintJS Pro
 *   2. Show a real "Device Verification" scan indicator
 *   3. Verify the fingerprint against our server for duplicate accounts
 *   4. Block signup if the device already has an account
 *   5. Store the verified fingerprint after successful signup
 *
 * Clean white card centered on light gray background.
 * Full navigation bar at top for easy return to site.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type AppView } from '@/stores/app-store'
import { SignIn, SignUp, useClerk, useSignUp } from '@clerk/nextjs'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { getFingerprint, checkDeviceFingerprint, type FingerprintResult } from '@/lib/fingerprint'

// ============================================================
// FINGERPRINT SCAN STATES
// ============================================================
type FingerprintStatus = 'idle' | 'scanning' | 'verified' | 'blocked' | 'error'

export function AuthPage() {
  const { setView } = useAppStore()
  const view = useAppStore((s) => s.view)
  const isSignUp = view === 'signup'
  const { isLoaded } = useClerk()

  // Fingerprint state (only used for sign-up)
  const [fpStatus, setFpStatus] = useState<FingerprintStatus>('idle')
  const [fpResult, setFpResult] = useState<FingerprintResult | null>(null)
  const [fpMessage, setFpMessage] = useState('')

  // Determine the Clerk publishable key
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // Clerk loading timeout — if Clerk doesn't load in 6s, fall back to demo
  const [clerkTimedOut, setClerkTimedOut] = useState(false)
  useEffect(() => {
    if (hasClerk && !isLoaded) {
      const timer = setTimeout(() => setClerkTimedOut(true), 6000)
      return () => clearTimeout(timer)
    }
    if (isLoaded) setClerkTimedOut(false)
  }, [hasClerk, isLoaded])

  // If Clerk timed out, treat it as not configured
  const clerkReady = hasClerk && isLoaded && !clerkTimedOut
  const clerkLoading = hasClerk && !isLoaded && !clerkTimedOut

  // Auto-scan fingerprint on sign-up page
  useEffect(() => {
    if (isSignUp && fpStatus === 'idle') {
      setFpStatus('scanning')
      setFpMessage('Verifying your device...')

      getFingerprint().then((result) => {
        if (!result) {
          // Fingerprint Pro not configured — skip scan
          setFpStatus('verified')
          setFpMessage('Device check skipped (not configured)')
          return
        }

        setFpResult(result)

        // Check with server for duplicate devices
        checkDeviceFingerprint(result).then((check) => {
          if (check.isClean) {
            setFpStatus('verified')
            setFpMessage('Device verified — you are clear to sign up')
          } else {
            setFpStatus('blocked')
            setFpMessage(check.message)
          }
        }).catch(() => {
          // Network error — allow signup (graceful degradation)
          setFpStatus('verified')
          setFpMessage('Device check could not complete — proceeding')
        })
      }).catch(() => {
        setFpStatus('error')
        setFpMessage('Could not scan device — you can still sign up')
      })
    }
  }, [isSignUp, fpStatus])

  // Reset fingerprint state when switching between sign-in/sign-up
  useEffect(() => {
    if (!isSignUp) {
      // Don't need fingerprint for sign-in
      setFpStatus('idle')
    }
  }, [isSignUp])

  // After Clerk sign-up completes, store the fingerprint
  const handleClerkSignUpComplete = useCallback(async () => {
    if (fpResult) {
      try {
        await fetch('/api/fingerprint/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id: fpResult.visitorId,
          }),
        })
      } catch {
        // Non-critical — the webhook will also try to store it
      }
    }
  }, [fpResult])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navigation />

      {/* Auth Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Fingerprint Scan Indicator (sign-up only) */}
          {isSignUp && fpStatus !== 'idle' && (
            <FingerprintScanIndicator status={fpStatus} message={fpMessage} />
          )}

          {/* Auth content — 4 states: blocked, loading, Clerk ready, fallback */}
          {isSignUp && fpStatus === 'blocked' ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#0F172A]">Device Already Registered</h2>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed">
                {fpMessage || 'This device already has an account. Our system allows one free trial per device to keep things fair for everyone.'}
              </p>
              <p className="text-[#64748B] text-sm mt-3">
                If you believe this is an error, please contact our support team.
              </p>
              <button
                onClick={() => setView('signin')}
                className="mt-6 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold rounded-lg"
              >
                Sign In Instead
              </button>
              <button
                onClick={() => setView('contact')}
                className="mt-3 w-full text-[#64748B] hover:text-[#0F172A] text-sm font-medium"
              >
                Contact Support
              </button>
            </div>
          ) : clerkLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {isSignUp ? 'Create Your Account.' : 'Welcome Back. Sign In.'}
              </h1>
              <div className="mt-8 flex items-center justify-center py-8">
                <div className="w-8 h-8 border-[3px] border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-center text-sm text-[#64748B]">Loading secure sign-in...</p>
            </div>
          ) : clerkReady ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {isSignUp ? (
                <SignUp
                  routing="hash"
                  signInUrl="/?view=signin"
                  redirectUrl="/?view=dashboard-idle"
                  afterSignUpUrl="/?view=dashboard-idle"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 p-8",
                      headerTitle: "text-2xl font-bold text-[#0F172A] tracking-tight",
                      headerSubtitle: "text-[#64748B] text-sm mt-2",
                      formButtonPrimary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold w-full",
                      formFieldInput: "border-[#E2E8F0] h-11",
                      footerActionLink: "text-[#2563EB] hover:text-[#1D4ED8] font-medium",
                      socialButtonsBlockButton: "border-[#E2E8F0] h-11 font-medium text-[#0F172A]",
                    },
                  }}
                />
              ) : (
                <SignIn
                  routing="hash"
                  signUpUrl="/?view=signup"
                  redirectUrl="/?view=dashboard-idle"
                  afterSignInUrl="/?view=dashboard-idle"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 p-8",
                      headerTitle: "text-2xl font-bold text-[#0F172A] tracking-tight",
                      headerSubtitle: "text-[#64748B] text-sm mt-2",
                      formButtonPrimary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold w-full",
                      formFieldInput: "border-[#E2E8F0] h-11",
                      footerActionLink: "text-[#2563EB] hover:text-[#1D4ED8] font-medium",
                      socialButtonsBlockButton: "border-[#E2E8F0] h-11 font-medium text-[#0F172A]",
                    },
                  }}
                />
              )}
            </div>
          ) : (
            <FallbackAuthForm isSignUp={isSignUp} fingerprintResult={fpResult} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ============================================================
// FINGERPRINT SCAN INDICATOR — Real device verification UI
// ============================================================
function FingerprintScanIndicator({ status, message }: { status: FingerprintStatus; message: string }) {
  return (
    <div className={`mb-4 rounded-xl border p-4 flex items-center gap-3 ${
      status === 'scanning' ? 'bg-[#EFF6FF] border-[#BFDBFE]' :
      status === 'verified' ? 'bg-[#F0FDF4] border-[#BBF7D0]' :
      status === 'blocked' ? 'bg-[#FEF2F2] border-[#FECACA]' :
      status === 'error' ? 'bg-[#FEF3C7] border-[#FDE68A]' :
      'bg-[#F8FAFC] border-[#E2E8F0]'
    }`}>
      {status === 'scanning' && (
        <>
          <div className="relative">
            <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1E40AF]">Device Verification</p>
            <p className="text-xs text-[#3B82F6] mt-0.5">{message}</p>
          </div>
        </>
      )}
      {status === 'verified' && (
        <>
          <svg className="w-5 h-5 text-[#16A34A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-[#16A34A]">Device Verified</p>
            <p className="text-xs text-[#4ADE80] mt-0.5">{message}</p>
          </div>
        </>
      )}
      {status === 'error' && (
        <>
          <svg className="w-5 h-5 text-[#D97706] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-[#D97706]">Verification Issue</p>
            <p className="text-xs text-[#F59E0B] mt-0.5">{message}</p>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================
// FALLBACK AUTH FORM (used when Clerk keys are not set)
// ============================================================
function FallbackAuthForm({ isSignUp, fingerprintResult }: { isSignUp: boolean; fingerprintResult: FingerprintResult | null }) {
  const { setView, setTier, setAuthenticated, setCoinBalance, setClerkId, setUserEmail } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value || ''

    setIsSubmitting(true)

    try {
      // If signing up, verify fingerprint first
      if (isSignUp && fingerprintResult) {
        const check = await checkDeviceFingerprint(fingerprintResult)
        if (!check.isClean) {
          alert(check.message)
          setIsSubmitting(false)
          return
        }
      }

      // Simulate auth — create a mock Clerk ID
      const mockClerkId = `user_mock_${Date.now()}`
      setClerkId(mockClerkId)
      setUserEmail(email)
      setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
      setTier('free')
      setAuthenticated(true)
      setView('dashboard-idle')

      // Store fingerprint after successful signup
      if (isSignUp && fingerprintResult) {
        try {
          await fetch('/api/fingerprint/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitor_id: fingerprintResult.visitorId }),
          })
        } catch {
          // Non-critical
        }
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
      <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
        {isSignUp ? 'Create Your Account.' : 'Welcome Back. Sign In.'}
      </h1>
      <p className="mt-2 text-[#64748B] text-sm">
        {isSignUp
          ? 'Get 50 free verified contacts when you sign up. No credit card needed.'
          : 'Sign in to access your dashboard and contacts.'}
      </p>

      <form onSubmit={handleAuth} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            className="w-full border border-[#E2E8F0] rounded-lg h-11 px-3 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            className="w-full border border-[#E2E8F0] rounded-lg h-11 px-3 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Verifying...' : isSignUp ? 'Create Free Account' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64748B]">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setView(isSignUp ? 'signin' : 'signup')}
          className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
        >
          {isSignUp ? 'Sign In' : 'Create Account'}
        </button>
      </p>

      <div className="mt-4 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] p-3">
        <p className="text-xs text-[#92400E]">
          Demo mode — Clerk is not configured. Sign up for a real account at{' '}
          <a href="https://clerk.com" target="_blank" rel="noopener" className="underline font-medium">clerk.com</a>{' '}
          and add your keys to enable real authentication.
        </p>
      </div>
    </div>
  )
}
