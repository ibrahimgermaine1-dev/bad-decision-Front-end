'use client'

/**
 * LANDING PAGE — The Main Sales Page
 * High-contrast: white sections alternating with midnight navy
 * Dan S. Kennedy direct-response copy. Grade 3 English. No emojis.
 */
import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export function LandingPage() {
  const { setView, userCountry } = useAppStore()
  const isNigeria = userCountry === 'NG'

  return (
    <div className="min-h-screen">
      <Navigation />

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
              Create Free Account — 50 Verified Contacts
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView('pricing')}
              className="border-[#E2E8F0] text-[#0F172A] px-8 py-6 text-base font-semibold hover:bg-[#F8FAFC]"
            >
              See Pricing Plans
            </Button>
          </div>
          <p className="mt-4 text-sm text-[#64748B]">No credit card required. Start searching in under 2 minutes.</p>
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
          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => setView('signup')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-6 text-base font-semibold"
            >
              Start Your First Search — Free
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRICING PREVIEW — Show 4 tiers (Free + 3 paid) */}
      {/* ============================================================ */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Simple Pricing. Pay Only For Verified Contacts.</h2>
            <p className="mt-4 text-[#64748B] max-w-xl mx-auto">Start free. Upgrade when you need more. No hidden fees. No surprises.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Free',
                coins: 50,
                priceUSD: 0,
                priceNGN: 0,
                isFree: true,
                features: ['50 coins to start', '2 search types', 'Basic email check', 'View results in app'],
              },
              {
                name: 'Starter',
                coins: 1500,
                priceUSD: 15,
                priceNGN: 12000,
                features: ['1,500 coins per month', 'All 4 search types', 'Find Decision Makers', 'CSV Export included'],
              },
              {
                name: 'Growth',
                coins: 3000,
                priceUSD: 25,
                priceNGN: 20000,
                popular: true,
                features: ['3,000 coins per month', 'Priority Contact Check', 'Smart Collections', 'CSV Export included'],
              },
              {
                name: 'Pro',
                coins: 5000,
                priceUSD: 35,
                priceNGN: 28000,
                features: ['5,000 coins per month', 'Guaranteed Inbox Test', 'Catch-all Detection', 'Smart Collections'],
              },
            ].map((plan) => {
              const isInverted = plan.popular

              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl border-2 p-6 relative ${
                    isInverted
                      ? 'bg-[#0B1120] border-[#2563EB] text-white'
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[#2563EB] px-4 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className={`text-lg font-semibold ${isInverted ? 'text-white' : 'text-[#0F172A]'}`}>{plan.name}</h3>
                  <div className="mt-4">
                    {plan.isFree ? (
                      <span className={`text-4xl font-bold tracking-tight ${isInverted ? 'text-white' : 'text-[#0F172A]'}`}>
                        Free
                      </span>
                    ) : (
                      <>
                        <span className={`text-4xl font-bold tracking-tight ${isInverted ? 'text-white' : 'text-[#0F172A]'}`}>
                          {isNigeria ? 'N' : '$'}{isNigeria ? plan.priceNGN!.toLocaleString() : plan.priceUSD!.toLocaleString()}
                        </span>
                        <span className={`text-sm ${isInverted ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>/month</span>
                      </>
                    )}
                  </div>
                  <p className={`mt-1 text-sm font-medium ${isInverted ? 'text-[#2563EB]' : 'text-[#2563EB]'}`}>
                    {plan.coins.toLocaleString()} coins
                  </p>
                  <ul className="mt-6 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <svg className={`w-4 h-4 flex-shrink-0 text-[#2563EB]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm ${isInverted ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 py-3 font-semibold text-sm ${
                      isInverted || plan.isFree
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                        : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB]'
                    }`}
                    variant={isInverted || plan.isFree ? 'default' : 'outline'}
                    onClick={() => plan.isFree ? setView('signup') : setView('pricing')}
                  >
                    {plan.isFree ? 'Get Started Free' : `Get ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="mt-8 text-center">
            <Button
              onClick={() => setView('pricing')}
              variant="outline"
              className="border-[#2563EB] text-[#2563EB] hover:bg-[#DBEAFE]"
            >
              View Full Pricing Details
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA SECTION — Midnight background */}
      {/* ============================================================ */}
      <section className="bg-[#0B1120] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Stop Paying For Dead Emails.</h2>
          <p className="mt-4 text-[#94A3B8] text-lg">Get 50 free verified contacts when you create your account. No credit card needed.</p>
          <Button
            size="lg"
            onClick={() => setView('signup')}
            className="mt-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-10 py-6 text-base font-semibold"
          >
            Create Your Free Account Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
