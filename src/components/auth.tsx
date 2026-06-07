'use client'

/**
 * AUTH PAGES — Sign Up + Sign In
 * Real Clerk authentication with FingerprintJS device scanning.
 * Clean white card centered on light gray background.
 * No emojis. No tech jargon. Premium typography.
 */
import { useState, useEffect } from 'react'
import { useSignUp, useSignIn, useAuth } from '@clerk/nextjs'
import { useAppStore, type AppView } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AuthPage() {
  const { setView } = useAppStore()
  const view = useAppStore((s) => s.view)
  const actualSignUp = view === 'signup'

  return actualSignUp ? (
    <SignUpForm setView={setView} />
  ) : (
    <SignInForm setView={setView} />
  )
}

// ============================================================
// SIGN UP FORM — with FingerprintJS device scanning
// ============================================================
function SignUpForm({ setView }: { setView: (v: AppView) => void }) {
  const { isLoaded, signUp } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [visitorId, setVisitorId] = useState<string | null>(null)

  // Load FingerprintJS Pro on mount
  useEffect(() => {
    let mounted = true
    async function loadFingerprint() {
      try {
        const FpJS = (await import('@fingerprintjs/fingerprintjs-pro')).default
        const fp = await FpJS.load({
          apiKey: process.env.NEXT_PUBLIC_FINGERPRINT_PRO_PUBLIC_API_KEY || '',
        })
        const result = await fp.get()
        if (mounted) {
          setVisitorId(result.visitorId)
          setScanComplete(true)
        }
      } catch (err) {
        // FingerprintJS failed — still allow signup, just no fingerprint
        console.warn('[FingerprintJS] Load failed:', err)
        if (mounted) setScanComplete(true)
      }
    }
    loadFingerprint()
    return () => { mounted = false }
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setError('')
    setIsLoading(true)

    try {
      const result = await signUp.create({
        emailAddress: email,
        password: password,
        unsafeMetadata: {
          device_fingerprint: visitorId || '',
        },
      })

      if (result.status === 'complete') {
        // Account created — Clerk webhook will create profile + coins in Supabase
        // The redirect to dashboard is handled by page.tsx watching useAuth()
      } else if (result.status === 'missing_requirements') {
        // May need email verification
        setError('Please check your email for a verification link.')
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || 'Sign up failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!signUp) return
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      })
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Google sign up failed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">BD</span>
            </div>
            <span className="text-xl font-bold text-[#0F172A]">Bad Decision AI</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Stop Making Bad Decisions. Create Your Account.
          </h1>
          <p className="mt-2 text-[#64748B] text-sm">
            Get 50 free contacts when you sign up. No credit card needed.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/20 p-3">
              <p className="text-sm text-[#DC2626]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#E2E8F0] h-11"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Password</label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#E2E8F0] h-11"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {/* Hardware Security Scan Indicator */}
            <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${scanComplete ? 'bg-[#DCFCE7]' : 'bg-[#DBEAFE]'}`}>
                  {scanComplete ? (
                    <svg className="w-4 h-4 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-[#2563EB] animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {scanComplete ? 'Security Scan Complete' : 'Running Hardware Security Scan...'}
                  </p>
                  <p className="text-xs text-[#64748B]">This protects against duplicate accounts</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold"
              disabled={isLoading || !scanComplete}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-[#64748B]">or</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <Button
            variant="outline"
            className="w-full border-[#E2E8F0] h-11 font-medium text-[#0F172A]"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </Button>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-[#64748B]">
            Already have an account?{' '}
            <button
              onClick={() => setView('signin')}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SIGN IN FORM — with Clerk authentication
// ============================================================
function SignInForm({ setView }: { setView: (v: AppView) => void }) {
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setError('')
    setIsLoading(true)

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      })

      if (result.status === 'complete') {
        // Signed in — page.tsx will detect via useAuth() and route to dashboard
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || 'Sign in failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!signIn) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      })
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Google sign in failed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">BD</span>
            </div>
            <span className="text-xl font-bold text-[#0F172A]">Bad Decision AI</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Welcome Back. Sign In.
          </h1>
          <p className="mt-2 text-[#64748B] text-sm">
            Sign in to access your dashboard and contacts.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/20 p-3">
              <p className="text-sm text-[#DC2626]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#E2E8F0] h-11"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#E2E8F0] h-11"
                required
                disabled={isLoading}
              />
            </div>

            {/* Forgot Password — uses Clerk's resetPassword flow */}
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!signIn || !email) {
                    setError('Enter your email first, then click Forgot Password.')
                    return
                  }
                  try {
                    const result = await signIn.create({
                      identifier: email,
                    })
                    const firstFactor = result.supportedFirstFactors?.find(
                      (f: any) => f.strategy === 'reset_password_email_code'
                    )
                    if (firstFactor) {
                      await signIn.prepareFirstFactor({ strategy: 'reset_password_email_code', emailAddressId: firstFactor.emailAddressId })
                      setError('Password reset email sent. Check your inbox.')
                    } else {
                      setError('Password reset not available for this account.')
                    }
                  } catch (err: any) {
                    setError(err.errors?.[0]?.message || 'Could not send reset email.')
                  }
                }}
                className="text-[#2563EB] hover:text-[#1D4ED8] text-sm font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-[#64748B]">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full border-[#E2E8F0] h-11 font-medium text-[#0F172A]"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-[#64748B]">
            Don't have an account?{' '}
            <button
              onClick={() => setView('signup')}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
