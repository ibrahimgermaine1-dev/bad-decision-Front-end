'use client'

/**
 * LANDING PAGE — The Main Sales Page
 * High-contrast: white sections alternating with midnight navy
 * Dan S. Kennedy direct-response copy. Grade 3 English. No emojis.
 */
import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  const { setView } = useAppStore()

  return (
    <div className="min-h-screen">
      {/* ============================================================ */}
      {/* NAVIGATION */}
      {/* ============================================================ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-semibold text-[#0F172A] tracking-tight">Bad Decision AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('pricing')} className="text-sm text-[#0F172A] hover:text-[#2563EB] transition-colors">Pricing</button>
            <button onClick={() => setView('faq')} className="text-sm text-[#0F172A] hover:text-[#2563EB] transition-colors">FAQ</button>
            <button onClick={() => setView('contact')} className="text-sm text-[#0F172A] hover:text-[#2563EB] transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setView('signin')} className="border-[#E2E8F0] text-[#0F172A]">
              Sign In
            </Button>
            <Button size="sm" onClick={() => setView('signup')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* HERO SECTION — Pure white background */}
      {/* ============================================================ */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[#0F172A] tracking-tight leading-[1.05]">
            Stop Emailing Ghost Towns.<br />
            Let Our System Find The Buyers.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Our smart app finds real business contacts for you. It checks every email to make sure it works before you pay.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setView('signup')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-6 text-base font-semibold"
            >
              Deploy Your Matrix
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="border-[#E2E8F0] text-[#0F172A] px-8 py-6 text-base font-semibold hover:bg-[#F8FAFC]"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE COST OF INACTION — Side-by-side comparison */}
      {/* ============================================================ */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: The Costly Mistake */}
            <div className="rounded-2xl border-2 border-red-200 bg-white p-10">
              <div className="inline-block rounded-full bg-[#FEE2E2] px-4 py-1.5 text-xs font-semibold text-[#DC2626] uppercase tracking-wide mb-6">
                The Costly Mistake
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] leading-tight">
                Buying old lists full of dead emails.
              </h2>
              <p className="mt-4 text-[#64748B] leading-relaxed">
                You pay hundreds of dollars for a spreadsheet. Half the emails bounce. The companies moved on. The people left. You just paid for garbage. That is a bad decision.
              </p>
              <div className="mt-8 space-y-3">
                {['Stale data from months ago', 'No way to know if emails work', 'Wasted money on dead contacts'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <span className="text-[#0F172A] text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Smart Move */}
            <div className="rounded-2xl bg-[#0B1120] p-10">
              <div className="inline-block rounded-full bg-[#2563EB] px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wide mb-6">
                The Smart Move
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Let our system run a live internet scan to find real people right now.
              </h2>
              <p className="mt-4 text-[#94A3B8] leading-relaxed">
                We do not sell old lists. We scan the live internet. We check every email inbox to make sure it works. You only pay for verified contacts. That is a smart decision.
              </p>
              <div className="mt-8 space-y-3">
                {['Live data from the internet right now', 'Every email tested before you pay', 'Only pay for contacts that pass'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-white text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3-STEP FLOW */}
      {/* ============================================================ */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Three Steps. Real Results.</h2>
            <p className="mt-4 text-[#64748B] max-w-xl mx-auto">No complicated setup. No learning curve. Just tell us who you want, and we find them.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Tell Us Who You Want',
                desc: 'Type what you need. Roofers in Dallas. Plumbers in Texas. Bakeries in Lagos. Our system takes it from there.',
              },
              {
                step: '02',
                title: 'We Find Them',
                desc: 'Our system scans the live internet. It finds real businesses. It finds the people who make decisions there.',
              },
              {
                step: '03',
                title: 'We Test The Inbox',
                desc: 'We check every email. We connect to the mail server. We make sure the inbox is real. You only pay for what works.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-[#2563EB] mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-[#0F172A]">{item.title}</h3>
                <p className="mt-3 text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA SECTION — Midnight background */}
      {/* ============================================================ */}
      <section className="bg-[#0B1120] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Stop Paying For Dead Emails.</h2>
          <p className="mt-4 text-[#94A3B8] text-lg">Get 50 free contacts when you sign up. No credit card needed.</p>
          <Button
            size="lg"
            onClick={() => setView('signup')}
            className="mt-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-10 py-6 text-base font-semibold"
          >
            Deploy Your Matrix
          </Button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-[#0B1120] border-t border-[#1E293B] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="text-white font-semibold">Bad Decision AI</span>
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => setView('pricing')} className="text-[#94A3B8] hover:text-white text-sm transition-colors">Pricing</button>
              <button onClick={() => setView('faq')} className="text-[#94A3B8] hover:text-white text-sm transition-colors">FAQ</button>
              <button onClick={() => setView('contact')} className="text-[#94A3B8] hover:text-white text-sm transition-colors">Contact</button>
            </div>
            <p className="text-[#475569] text-sm">2026 Bad Decision AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
