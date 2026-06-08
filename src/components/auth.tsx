/**
 * BAD DECISION AI — Auth Page
 * Uses Clerk's sign-in/sign-up components.
 *
 * CRITICAL FIX: After sign-in/sign-up, we MUST call setActive()
 * to activate the Clerk session. Without this, Clerk doesn't
 * recognize the new session and the user appears logged out.
 *
 * Also includes navigation bar so users can go back to other pages.
 */
'use client'

import { useAuth, useSignIn, useSignUp, useClerk } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

export function AuthPage() {
  const setView = useAppStore((s) => s.setView)
  const view = useAppStore((s) => s.view)
  const isSignUp = view === 'signup'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Navigation bar — consistent with other pages */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => setView('landing')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-royal flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-bold text-lg text-slate">Bad Decision AI</span>
          </button>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={() => setView('pricing')} className="text-slate/60 hover:text-royal transition">Pricing</button>
            <button onClick={() => setView('faq')} className="text-slate/60 hover:text-royal transition">FAQ</button>
            <button onClick={() => setView('landing')} className="text-slate/60 hover:text-royal transition">Home</button>
          </div>
        </div>
      </nav>

      {/* Auth form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate/60 mt-2 text-sm">
              {isSignUp ? 'Get 50 free coins to start finding leads' : 'Sign in to your Bad Decision AI account'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            {isSignUp ? <SignUpForm /> : <SignInForm />}
          </div>

          <div className="text-center mt-4 text-sm text-slate/60">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setView('signin')} className="text-royal font-medium hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => setView('signup')} className="text-royal font-medium hover:underline">
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SignInForm() {
  const { signIn, isLoaded } = useSignIn()
  const { setActive } = useClerk()
  const setView = useAppStore((s) => s.setView)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setError('')
    setLoading(true)

    try {
      const result = await signIn.create({ identifier: email, password })

      if (result.status === 'complete') {
        // CRITICAL: Activate the session so Clerk recognizes the user is signed in
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId })
        }
        // Small delay to let Clerk update its internal state
        setTimeout(() => {
          setView('dashboard-idle')
        }, 300)
      } else {
        // Need more steps (e.g., MFA)
        setError(`Sign in requires additional steps. Status: ${result.status}`)
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.message || 'Sign in failed. Please try again.'
      // Handle "session already exists" gracefully
      if (message.toLowerCase().includes('session') || message.toLowerCase().includes('already')) {
        setError('You are already signed in. Redirecting to dashboard...')
        setTimeout(() => setView('dashboard-idle'), 1000)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-absent-bg text-absent-text text-sm rounded-lg">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-royal text-white rounded-lg font-medium hover:bg-royal-hover transition disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

function SignUpForm() {
  const { signUp, isLoaded } = useSignUp()
  const { setActive } = useClerk()
  const setView = useAppStore((s) => s.setView)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setError('')
    setLoading(true)

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      })

      // Clerk requires email verification on free tier
      if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setVerifying(true)
      } else if (result.status === 'complete') {
        // CRITICAL: Activate the session
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId })
        }
        setTimeout(() => {
          setView('dashboard-idle')
        }, 300)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setError('')
    setLoading(true)

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status === 'complete') {
        // CRITICAL: Activate the session
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId })
        }
        setTimeout(() => {
          setView('dashboard-idle')
        }, 300)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <p className="text-sm text-slate/60">We sent a verification code to {email}. Enter it below.</p>
        {error && <div className="p-3 bg-absent-bg text-absent-text text-sm rounded-lg">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate mb-1">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
            placeholder="123456"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-royal text-white rounded-lg font-medium hover:bg-royal-hover transition disabled:opacity-50">
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-absent-bg text-absent-text text-sm rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
            placeholder="Doe"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
          placeholder="At least 8 characters"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-royal text-white rounded-lg font-medium hover:bg-royal-hover transition disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create Account — Get 50 Free Coins'}
      </button>
    </form>
  )
}
