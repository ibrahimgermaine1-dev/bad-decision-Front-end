'use client'

/**
 * AUTH PAGES — Sign Up + Sign In
 * Uses Clerk's useSignUp() / useSignIn() hooks with a CUSTOM form.
 *
 * WHY NOT use Clerk's pre-built <SignIn>/<SignUp> components?
 * Those components don't render form fields when used inline in a
 * single-page app with Zustand routing — they mount but show empty
 * content. Using Clerk hooks with our own form gives us full control
 * and guaranteed rendering.
 *
 * FEATURES:
 *   - Email + password sign-up and sign-in
 *   - Google OAuth (popup-based, no redirect needed)
 *   - Email verification code flow after sign-up
 *   - Fingerprint Pro device verification on sign-up
 *   - Custom switching links between sign-in and sign-up
 *   - Auto-redirect to dashboard after successful auth
 */
import { useState, useEffect, useCallback } from 'react'
import { useSignUp, useSignIn, useClerk } from '@clerk/nextjs'
import { useAppStore, type AppView } from '@/stores/app-store'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { getFingerprint, checkDeviceFingerprint, type FingerprintResult } from '@/lib/fingerprint'

// ============================================================
// FINGERPRINT SCAN STATES
// ============================================================
type FingerprintStatus = 'idle' | 'scanning' | 'verified' | 'blocked' | 'error'

// Valid views for URL param reading
const VALID_VIEWS: AppView[] = [
  'landing', 'pricing', 'faq', 'contact', 'solutions',
  'signup', 'signin',
  'dashboard-idle', 'dashboard-searching', 'dashboard-results',
  'dashboard-coin-vault', 'dashboard-support',
]

export function AuthPage() {
  const { setView } = useAppStore()
  const view = useAppStore((s) => s.view)
  const isSignUp = view === 'signup'

  // Clerk hooks
  const { isLoaded: signUpLoaded, signUp } = useSignUp()
  const { isLoaded: signInLoaded, signIn } = useSignIn()
  const { setActive } = useClerk()

  // Form state
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // Email verification state (sign-up flow)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState('')

  // UI state
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Fingerprint state (only used for sign-up)
  const [fpStatus, setFpStatus] = useState<FingerprintStatus>('idle')
  const [fpResult, setFpResult] = useState<FingerprintResult | null>(null)
  const [fpMessage, setFpMessage] = useState('')

  // ============================================================
  // READ URL PARAMS ON MOUNT
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')
    if (viewParam && VALID_VIEWS.includes(viewParam as AppView)) {
      setView(viewParam as AppView)
    }
  }, [setView])

  // Listen for browser back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const viewParam = params.get('view')
      if (viewParam && VALID_VIEWS.includes(viewParam as AppView)) {
        setView(viewParam as AppView)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setView])

  // Auto-scan fingerprint on sign-up page
  useEffect(() => {
    if (isSignUp && fpStatus === 'idle') {
      setFpStatus('scanning')
      setFpMessage('Verifying your device...')

      getFingerprint().then((result) => {
        if (!result) {
          setFpStatus('verified')
          setFpMessage('Device check skipped (not configured)')
          return
        }

        setFpResult(result)

        checkDeviceFingerprint(result).then((check) => {
          if (check.isClean) {
            setFpStatus('verified')
            setFpMessage('Device verified — you are clear to sign up')
          } else {
            setFpStatus('blocked')
            setFpMessage(check.message)
          }
        }).catch(() => {
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
      setFpStatus('idle')
    }
  }, [isSignUp])

  // Reset form state when switching views
  useEffect(() => {
    setEmailAddress('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setPendingVerification(false)
    setVerifyingCode('')
    setError('')
    setIsLoading(false)
  }, [view])

  // ============================================================
  // EMAIL SIGN-UP
  // ============================================================
  const handleEmailSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded) return

    setIsLoading(true)
    setError('')

    try {
      // Check fingerprint first
      if (fpResult) {
        const check = await checkDeviceFingerprint(fpResult)
        if (!check.isClean) {
          setError(check.message)
          setIsLoading(false)
          return
        }
      }

      // Create the user in Clerk
      const result = await signUp.create({
        emailAddress,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        unsafeMetadata: {
          device_fingerprint: fpResult?.visitorId || '',
          country: useAppStore.getState().userCountry || 'US',
        },
      })

      // Check if email verification is required
      if (result.status === 'missing_requirements') {
        // Need email verification
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setPendingVerification(true)
      } else if (result.status === 'complete') {
        // Signed up and verified immediately (e.g. OAuth)
        await setActive({ session: result.createdSessionId })
        setView('dashboard-idle')
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [signUpLoaded, signUp, emailAddress, password, firstName, lastName, fpResult, setActive, setView])

  // ============================================================
  // EMAIL VERIFICATION (after sign-up)
  // ============================================================
  const handleVerification = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verifyingCode,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setView('dashboard-idle')
      } else {
        setError('Verification failed. Please check the code and try again.')
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Verification failed.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [signUpLoaded, signUp, verifyingCode, setActive, setView])

  // ============================================================
  // EMAIL SIGN-IN
  // ============================================================
  const handleEmailSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setView('dashboard-idle')
      } else {
        // Might need additional verification (MFA, etc.)
        setError('Additional verification required. Please try again.')
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign in failed. Please check your credentials.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [signInLoaded, signIn, emailAddress, password, setActive, setView])

  // ============================================================
  // GOOGLE OAUTH — popup-based (no redirect, stays on page)
  // ============================================================
  const handleGoogleOAuth = useCallback(async () => {
    if (isSignUp && !signUpLoaded) return
    if (!isSignUp && !signInLoaded) return

    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Sign up with Google
        await signUp.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: window.location.origin + '/sso-callback',
          redirectUrlComplete: window.location.origin + '/?view=dashboard-idle',
        })
      } else {
        // Sign in with Google
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: window.location.origin + '/sso-callback',
          redirectUrlComplete: window.location.origin + '/?view=dashboard-idle',
        })
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Google sign-in failed. Please try again.'
      setError(message)
      setIsLoading(false)
    }
  }, [isSignUp, signUpLoaded, signInLoaded, signUp, signIn])

  // ============================================================
  // RENDER
  // ============================================================

  // BLOCKED — device already registered
  if (isSignUp && fpStatus === 'blocked') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
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
                className="mt-6 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold rounded-lg transition-colors"
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
          </div>
        </div>
        <Footer />
      </div>
    )
  }

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

          {/* Main Auth Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
            {/* Header */}
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {pendingVerification ? 'Verify Your Email' : isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-[#64748B] text-sm">
              {pendingVerification
                ? 'We sent a verification code to your email. Enter it below.'
                : isSignUp
                  ? 'Get 50 free verified contacts when you sign up. No credit card needed.'
                  : 'Sign in to access your dashboard and contacts.'}
            </p>

            {/* Error Display */}
            {error && (
              <div className="mt-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-3">
                <p className="text-sm text-[#DC2626]">{error}</p>
              </div>
            )}

            {/* Email Verification Form */}
            {pendingVerification ? (
              <form onSubmit={handleVerification} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={verifyingCode}
                    onChange={(e) => setVerifyingCode(e.target.value)}
                    placeholder="Enter the 6-digit code"
                    className="w-full border border-[#E2E8F0] rounded-lg h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !verifyingCode.trim()}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
            ) : (
              <>
                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleOAuth}
                  disabled={isLoading}
                  className="mt-6 w-full flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-lg h-11 font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                </button>

                {/* Divider */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                  <span className="text-xs text-[#94A3B8] uppercase tracking-wide">or</span>
                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                </div>

                {/* Email/Password Form */}
                <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="mt-6 space-y-4">
                  {/* Name fields (sign-up only) */}
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#0F172A] mb-2">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First"
                          className="w-full border border-[#E2E8F0] rounded-lg h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0F172A] mb-2">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last"
                          className="w-full border border-[#E2E8F0] rounded-lg h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Email Address</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full border border-[#E2E8F0] rounded-lg h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'Minimum 8 characters' : 'Enter your password'}
                      className="w-full border border-[#E2E8F0] rounded-lg h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      required
                      minLength={8}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {isLoading
                      ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                      : (isSignUp ? 'Create Free Account' : 'Sign In')}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Custom Switching Link */}
          {!pendingVerification && (
            <p className="mt-6 text-center text-sm text-[#64748B]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setView(isSignUp ? 'signin' : 'signup')}
                className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer"
              >
                {isSignUp ? 'Sign in' : 'Create one free'}
              </button>
            </p>
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
