/**
 * BAD DECISION AI — Landing Page
 * Hero, value propositions, how-it-works, social proof, CTA
 *
 * COPY RULES: Focus on what the product DOES for the user,
 * the problems it solves, and the value it offers.
 * Do NOT mention proprietary tech internals (engine names, gate numbers, etc.)
 */
'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'

export function LandingPage() {
  const setView = useAppStore((s) => s.setView)
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-royal flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="font-bold text-lg text-slate">Bad Decision AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-slate/70">
              <button onClick={() => setView('pricing')} className="hover:text-royal transition">Pricing</button>
              <button onClick={() => setView('faq')} className="hover:text-royal transition">FAQ</button>
              <button onClick={() => setView('contact')} className="hover:text-royal transition">Contact</button>
              {isSignedIn ? (
                <button
                  onClick={() => setView('dashboard-idle')}
                  className="px-4 py-2 bg-royal text-white rounded-lg hover:bg-royal-hover transition font-medium"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => setView('signin')}
                  className="px-4 py-2 bg-royal text-white rounded-lg hover:bg-royal-hover transition font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
            {/* Mobile hamburger */}
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-royal-light text-royal rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-royal rounded-full animate-pulse" />
              Find Buyers, Not Browsers
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-slate tracking-tight mb-6">
              Stop Emailing{' '}
              <span className="text-royal">Ghost Towns</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Every lead you buy is verified before you pay. No more bouncing emails,
              no more chasing businesses that don&apos;t exist. Just real decision makers
              who actually need your services.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isSignedIn ? (
                <button
                  onClick={() => setView('dashboard-idle')}
                  className="w-full sm:w-auto px-8 py-4 bg-royal text-white rounded-xl hover:bg-royal-hover transition font-semibold text-lg shadow-lg shadow-royal/25"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => setView('signup')}
                  className="w-full sm:w-auto px-8 py-4 bg-royal text-white rounded-xl hover:bg-royal-hover transition font-semibold text-lg shadow-lg shadow-royal/25"
                >
                  Start Free — 50 Coins
                </button>
              )}
              <button
                onClick={() => setView('pricing')}
                className="w-full sm:w-auto px-8 py-4 border border-border text-slate rounded-xl hover:bg-ghost transition font-semibold text-lg"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
        {/* Background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-royal/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* ── Problem Section ───────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate mb-4">Sound Familiar?</h2>
            <p className="text-slate/60 max-w-2xl mx-auto">
              If you sell B2B services, you know the pain of wasting time and money on leads that go nowhere.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white border border-border">
              <div className="text-3xl mb-3">💸</div>
              <h3 className="font-semibold text-slate mb-2">Wasting Money on Bad Data</h3>
              <p className="text-sm text-slate/60 leading-relaxed">
                You buy a list of 500 leads and half the emails bounce. The other half go to businesses that closed two years ago. You just paid for garbage.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border border-border">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-slate mb-2">Hours Spent Researching</h3>
              <p className="text-sm text-slate/60 leading-relaxed">
                Your team spends more time finding leads than closing them. Google searches, Yelp scrolling, LinkedIn stalking — it never ends.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border border-border">
              <div className="text-3xl mb-3">🤷</div>
              <h3 className="font-semibold text-slate mb-2">No Idea Who Needs You</h3>
              <p className="text-sm text-slate/60 leading-relaxed">
                You know your ideal customer is out there, but you can&apos;t find them. They&apos;re not searching for you — you need to find them first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solution Section ───────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate mb-4">Verified Leads, Not Guesswork</h2>
            <p className="text-slate/60 max-w-2xl mx-auto">
              We find real businesses that need your services, verify their contact info, and only charge you for leads that check out.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard
              icon="🎯"
              title="Businesses Spending on Ads"
              desc="Find companies already investing in marketing — they have budgets and they need agencies, freelancers, and service providers like you."
            />
            <ValueCard
              icon="📍"
              title="Local Businesses Near You"
              desc="Brick-and-mortar shops that need help with their online presence. Dentists, roofers, bakeries — they all need web design, SEO, and marketing."
            />
            <ValueCard
              icon="🔍"
              title="Businesses Without Websites"
              desc="Companies listed on directories but without their own website. They are the easiest sell — they obviously need one built."
            />
            <ValueCard
              icon="💬"
              title="People Asking for Help Right Now"
              desc="Real-time posts from people actively looking for services. These are hot leads — they need someone today, not next month."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate mb-4">How It Works</h2>
            <p className="text-slate/60 max-w-2xl mx-auto">
              Three steps from search to verified contact — no manual research needed.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              step={1}
              title="Tell Us Who You Need"
              desc="Type what you're looking for — 'roofers in Texas', 'bakeries in Lagos', 'dentists needing websites'. We handle the rest."
            />
            <StepCard
              step={2}
              title="We Find & Verify"
              desc="We search across multiple sources, then verify every email and phone number. Invalid contacts get filtered out automatically."
            />
            <StepCard
              step={3}
              title="Pay Only for Results"
              desc="You only spend coins on verified leads that pass our checks. If a search finds nothing, you pay nothing. That's our guarantee."
            />
          </div>
        </div>
      </section>

      {/* ── Pay Only for What Works ──────────────────── */}
      <section className="py-20 bg-midnight text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pay Only for Verified Leads</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              No subscriptions. No surprise charges. Buy coins, spend them only on leads that are real. If a search comes up empty, your coins stay put.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-royal mb-2">1 coin</div>
              <div className="text-white/60 text-sm">Basic verification</div>
              <div className="text-white/40 text-xs mt-1">Free tier</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-royal mb-2">2 coins</div>
              <div className="text-white/60 text-sm">Enhanced verification</div>
              <div className="text-white/40 text-xs mt-1">Starter / Growth</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-royal mb-2">3 coins</div>
              <div className="text-white/60 text-sm">Guaranteed deliverable email</div>
              <div className="text-white/40 text-xs mt-1">Pro tier</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate mb-4">
            Ready to Stop Wasting Time on Bad Leads?
          </h2>
          <p className="text-slate/60 mb-8 text-lg">
            Sign up free and get 50 coins to start finding real leads immediately. No credit card required.
          </p>
          <button
            onClick={() => isSignedIn ? setView('dashboard-idle') : setView('signup')}
            className="px-8 py-4 bg-royal text-white rounded-xl hover:bg-royal-hover transition font-semibold text-lg shadow-lg shadow-royal/25"
          >
            {isSignedIn ? 'Go to Dashboard' : 'Get Started Free'}
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate/40">
          <span>Bad Decision AI — Stop Emailing Ghost Towns</span>
          <div className="flex gap-6">
            <button onClick={() => setView('pricing')} className="hover:text-slate/70 transition">Pricing</button>
            <button onClick={() => setView('faq')} className="hover:text-slate/70 transition">FAQ</button>
            <button onClick={() => setView('contact')} className="hover:text-slate/70 transition">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────

function MobileNav() {
  const setView = useAppStore((s) => s.setView)
  const { isSignedIn } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden relative">
      <button onClick={() => setOpen(!open)} className="p-2 text-slate/70 hover:text-slate">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M6 18L18 6" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-16 right-0 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
            <button onClick={() => { setView('pricing'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">Pricing</button>
            <button onClick={() => { setView('faq'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">FAQ</button>
            <button onClick={() => { setView('contact'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">Contact</button>
            {isSignedIn ? (
              <button onClick={() => { setView('dashboard-idle'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm text-royal font-medium hover:bg-ghost">Dashboard</button>
            ) : (
              <button onClick={() => { setView('signin'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm text-royal font-medium hover:bg-ghost">Sign In</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ValueCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-border hover:border-royal/30 hover:shadow-lg transition-all group">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate mb-2 group-hover:text-royal transition">{title}</h3>
      <p className="text-sm text-slate/60 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl border border-border hover:border-royal/30 transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-royal text-white flex items-center justify-center font-bold">
          {step}
        </div>
        <h3 className="font-semibold text-slate">{title}</h3>
      </div>
      <p className="text-sm text-slate/60 leading-relaxed">{desc}</p>
    </div>
  )
}
