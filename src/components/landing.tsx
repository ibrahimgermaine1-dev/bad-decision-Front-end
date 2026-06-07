/**
 * BAD DECISION AI — Landing Page
 * Hero, features, how-it-works, social proof, CTA
 */
'use client'

import { useAppStore } from '@/stores/app-store'

export function LandingPage() {
  const setView = useAppStore((s) => s.setView)

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
              <button
                onClick={() => setView('signin')}
                className="px-4 py-2 bg-royal text-white rounded-lg hover:bg-royal-hover transition font-medium"
              >
                Sign In
              </button>
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
              AI-Powered Lead Intelligence
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-slate tracking-tight mb-6">
              Stop Emailing{' '}
              <span className="text-royal">Ghost Towns</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Find real businesses that need your services. Our 3-gate validation system
              checks every email before you pay — so you only reach real decision makers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setView('signup')}
                className="w-full sm:w-auto px-8 py-4 bg-royal text-white rounded-xl hover:bg-royal-hover transition font-semibold text-lg shadow-lg shadow-royal/25"
              >
                Start Free — 50 Coins
              </button>
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

      {/* ── 4 Search Engines ──────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate mb-4">4 Powerful Search Engines</h2>
            <p className="text-slate/60 max-w-2xl mx-auto">
              Each engine targets a different type of business opportunity, so you always find the leads others miss.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <EngineCard
              icon="🎯"
              title="Ads Intelligence"
              desc="Find businesses actively spending money on Meta & Google ads. They have budgets — they need your help."
              tag="ads_intent"
            />
            <EngineCard
              icon="📍"
              title="Local SMB Maps"
              desc="Brick-and-mortar shops on Google Maps with fewer than 50 employees. Perfect for local service providers."
              tag="smb_maps"
            />
            <EngineCard
              icon="🔍"
              title="Web-Absent Aggregators"
              desc="Businesses on Yelp, Houzz, and Etsy that don't have their own website yet. They need one built for them."
              tag="web_absent"
            />
            <EngineCard
              icon="💬"
              title="Social Demand Radar"
              desc="Real-time posts from Reddit and GitHub from people actively looking for help right now."
              tag="social_intent"
            />
          </div>
        </div>
      </section>

      {/* ── 3-Gate Validation ─────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate mb-4">3-Gate Email Validation</h2>
            <p className="text-slate/60 max-w-2xl mx-auto">
              Every lead goes through our rigorous 3-gate validation pipeline. Higher tiers unlock deeper verification.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <GateCard
              step={1}
              title="DNS Check"
              desc="We verify the website domain actually exists by checking its DNS records. If the domain is dead, the lead is dropped."
              tier="All tiers"
              speed="< 1 sec"
            />
            <GateCard
              step={2}
              title="Footprint Check"
              desc="We confirm the lead has at least one real contact method — email, phone, LinkedIn, or Instagram. Zero contacts = dropped."
              tier="Starter+"
              speed="< 1 sec"
            />
            <GateCard
              step={3}
              title="SMTP Verification"
              desc="We connect directly to the mail server and verify the email inbox exists. We even detect catch-all domains."
              tier="Pro only"
              speed="2-10 sec"
            />
          </div>
        </div>
      </section>

      {/* ── Coin Economy ──────────────────────────────── */}
      <section className="py-20 bg-midnight text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pay Only for Verified Leads</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our coin system ensures you only spend money on leads that pass validation. No wasted budget on dead ends.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-royal mb-2">1 coin</div>
              <div className="text-white/60 text-sm">Gate 1 — DNS Only</div>
              <div className="text-white/40 text-xs mt-1">Free tier</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-royal mb-2">2 coins</div>
              <div className="text-white/60 text-sm">Gate 1 + 2 — DNS + Footprint</div>
              <div className="text-white/40 text-xs mt-1">Starter / Growth</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-royal mb-2">3 coins</div>
              <div className="text-white/60 text-sm">Gate 1 + 2 + 3 — Full SMTP</div>
              <div className="text-white/40 text-xs mt-1">Pro tier</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate mb-4">
            Ready to Find Real Leads?
          </h2>
          <p className="text-slate/60 mb-8 text-lg">
            Sign up free and get 50 coins to start searching immediately. No credit card required.
          </p>
          <button
            onClick={() => setView('signup')}
            className="px-8 py-4 bg-royal text-white rounded-xl hover:bg-royal-hover transition font-semibold text-lg shadow-lg shadow-royal/25"
          >
            Get Started Free
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
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
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
        <div className="absolute top-16 right-0 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
          <button onClick={() => { setView('pricing'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">Pricing</button>
          <button onClick={() => { setView('faq'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">FAQ</button>
          <button onClick={() => { setView('contact'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">Contact</button>
          <button onClick={() => { setView('signin'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm text-royal font-medium hover:bg-ghost">Sign In</button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'

function EngineCard({ icon, title, desc, tag }: { icon: string; title: string; desc: string; tag: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-border hover:border-royal/30 hover:shadow-lg transition-all group">
      <div className="text-3xl mb-4">{icon}</div>
      <div className="text-xs font-mono text-royal/60 mb-2">{tag}</div>
      <h3 className="text-lg font-semibold text-slate mb-2 group-hover:text-royal transition">{title}</h3>
      <p className="text-sm text-slate/60 leading-relaxed">{desc}</p>
    </div>
  )
}

function GateCard({ step, title, desc, tier, speed }: { step: number; title: string; desc: string; tier: string; speed: string }) {
  return (
    <div className="p-6 rounded-xl border border-border hover:border-royal/30 transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-royal text-white flex items-center justify-center font-bold">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-slate">{title}</h3>
          <div className="flex gap-3 text-xs text-slate/40">
            <span>{tier}</span>
            <span>{speed}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate/60 leading-relaxed">{desc}</p>
    </div>
  )
}
