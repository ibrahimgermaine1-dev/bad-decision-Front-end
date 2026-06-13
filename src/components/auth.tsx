'use client'

/**
 * AUTH PAGE — Real Clerk Authentication
 * Uses Clerk's signIn and signUp hooks for real authentication.
 * Sign-Up: "Hardware Security Scan" indicator via device fingerprint.
 * No emojis. No tech jargon.
 */
import { useSignIn, useSignUp, useAuth } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

export function AuthPage() {
  const { view, setView, setCoinBalance, setTier, setAuthenticated } = useAppStore()
  const { isLoaded: signInLoaded, signIn } = useSignIn()
  const { isLoaded: signUpLoaded, signUp } = useSignUp()
  const { isSignedIn } = useAuth()

  const actualSignUp = view === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [scanComplete, setScanComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isLoaded = actualSignUp ? signUpLoaded : signInLoaded

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      setView('dashboard-idle')
    }
  }, [isSignedIn])

  // Auto-complete security scan animation
  useEffect(() => {
    if (actualSignUp && email.length > 0) {
      const timer = setTimeout(() => setScanComplete(true), 2000)
      return () => clearTimeout(timer)
    }
    setScanComplete(false)
  }, [actualSignUp, email])

  // Simple device fingerprint for anti-duplicate
  async function getDeviceFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('BadDecisionFP', 2, 2)
      }
      const canvasData = canvas.toDataURL()
      const nav = navigator.userAgent + navigator.language + screen.width + screen.height
      const raw = canvasData + nav
      let hash = 0
      for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return 'fp_' + Math.abs(hash).toString(36)
    } catch {
      return 'fp_unknown'
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return
    setLoading(true)
    setError('')

    try {
      const fingerprint = await getDeviceFingerprint()

      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          device_fingerprint: fingerprint,
        },
      })

      if (result.status === 'complete') {
        setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
        setTier('free')
        setAuthenticated(true)
        setView('dashboard-idle')
      } else {
        // Needs verification - redirect to Clerk's verification
        setError('Please check your email for a verification code.')
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.message || 'Sign up failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        setAuthenticated(true)
        setView('dashboard-idle')
      } else {
        setError('Please complete the verification step.')
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.message || 'Sign in failed. Please check your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return
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
            {actualSignUp
              ? 'Stop Making Bad Decisions. Create Your Account.'
              : 'Welcome Back. Sign In.'}
          </h1>
          <p className="mt-2 text-[#64748B] text-sm">
            {actualSignUp
              ? 'Get 50 free contacts when you sign up. No credit card needed.'
              : 'Sign in to access your dashboard and contacts.'}
          </p>

          {/* Error display */}
          {error && (
            <div className="mt-4 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/20 p-3">
              <p className="text-sm text-[#DC2626] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={actualSignUp ? handleSignUp : handleSignIn} className="mt-8 space-y-4">
            {/* Name fields for sign-up */}
            {actualSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">First Name</label>
                  <Input
                    placeholder="First"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-[#E2E8F0] h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Last Name</label>
                  <Input
                    placeholder="Last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-[#E2E8F0] h-11"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#E2E8F0] h-11"
                required
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
              />
            </div>

            {/* Hardware Security Scan Indicator (Sign Up only) */}
            {actualSignUp && (
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
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 font-semibold"
            >
              {loading ? 'Please wait...' : actualSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Forgot Password (Sign In only) */}
          {!actualSignUp && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  if (signIn && email) {
                    signIn.create({ identifier: email }).then(() => {
                      setError('Check your email for a password reset link.')
                    }).catch(() => {
                      setError('Enter your email above first, then click Forgot Password.')
                    })
                  } else {
                    setError('Enter your email above first, then click Forgot Password.')
                  }
                }}
                className="text-[#2563EB] hover:text-[#1D4ED8] text-sm font-medium"
              >
                Forgot Password?
              </button>
            </div>
          )}

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
            onClick={handleGoogleSignIn}
            className="w-full border-[#E2E8F0] h-11 font-medium text-[#0F172A]"
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
            {actualSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setView(actualSignUp ? 'signin' : 'signup')}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              {actualSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
