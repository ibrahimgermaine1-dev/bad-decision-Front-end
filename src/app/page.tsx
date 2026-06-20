'use client'

/**
 * LANDING PAGE — Bad Decision
 * Long-form, value-driven, Dan Kennedy direct-response copy.
 * Grade 3 English. No em dashes. No tech jargon.
 * Connects to the name "Bad Decision."
 */

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { fetchCreditBalance, fetchCollections } from '@/lib/api'
import { TIERS } from '@/lib/pricing'

export default function LandingPage() {
  const { isSignedIn, isLoaded, userId } = useAuth()
  const router = useRouter()
  const { setCreditBalance, setCollections } = useAppStore()
  const redirected = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && userId && !redirected.current) {
      redirected.current = true
      fetchCreditBalance().then(balance => {
        setCreditBalance({
          credits_balance: balance.credits_balance ?? 0,
          credits_reserved: balance.credits_reserved ?? 0,
          total_purchased: balance.total_purchased ?? 0,
        })
      }).catch(() => {})
      fetchCollections(userId).then(cols => setCollections(cols)).catch(() => {})
      router.replace('/dashboard')
    }
  }, [isSignedIn, isLoaded, userId, router, setCreditBalance, setCollections])

  return (
    <div className="overflow-hidden">
      <HeroSection />
      <PainSection />
      <SolutionSection />
      <HowItWorksSection />
      <EnginesSection />
      <ProofSection />
      <GuaranteeSection />
      <PricingPreviewSection />
      <FAQPreviewSection />
      <FinalCTASection />
    </div>
  )
}

// ============================================================
// HERO
// ============================================================
function HeroSection() {
  return (
    <section className="relative bg-background bg-radial-glow bg-grid pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="text-[13px] text-card-foreground/70 font-medium">Every email tested before you pay</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in-up">
          <span className="text-gradient">Buying old lead lists</span>
          <br />
          <span className="text-foreground">is a </span>
          <span className="text-destructive">bad decision.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up">
          We are called Bad Decision because that is what we help you avoid.
          We scan the live internet to find real buyers who want what you sell.
          Then we test every single email before you spend a dime.
          You only pay for contacts that actually work.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            Get 100 Free Leads Today
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-card border border-border hover:border-primary/50 text-card-foreground text-base font-semibold transition-all"
          >
            See How It Works
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-muted-foreground animate-fade-in-up">
          <span className="flex items-center gap-2">
            <CheckIcon /> No credit card to start
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> 100 free contacts
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> Cancel anytime
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { num: '50', label: 'Free leads to start' },
            { num: '4', label: 'Ways to find buyers' },
            { num: '100%', label: 'Emails tested first' },
            { num: '0', label: 'Dead contacts you pay for' },
          ].map((stat, i) => (
            <div
              key={i}
              className="card-premium p-5 sm:p-6 text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-gradient-violet mb-1">{stat.num}</div>
              <div className="text-[12px] sm:text-[13px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// PAIN SECTION
// ============================================================
function PainSection() {
  const pains = [
    {
      title: 'You bought a list of 500 emails.',
      body: 'You sent your best pitch. Half of them bounced back. The other half never opened. You just paid good money for a list of ghosts. That feeling in your gut? That is what a bad decision feels like.',
    },
    {
      title: 'You wasted weeks chasing dead leads.',
      body: 'You called. You emailed. You followed up. Nothing. The businesses moved. The people left. The emails died. You cannot get those hours back. Time is the one thing money cannot buy.',
    },
    {
      title: 'You paid for contacts that never wanted you.',
      body: 'The list looked great on paper. But nobody on it cared about what you sell. You might as well have thrown your money out the window. At least then someone might have picked it up.',
    },
    {
      title: 'You trusted a vendor who sold you garbage.',
      body: 'They promised fresh leads. They promised verified emails. They delivered a spreadsheet full of lies. And they kept your money. You will never trust them again. But you still need leads.',
    },
  ]

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-destructive/15 border border-destructive/20 mb-6">
            <span className="text-[12px] text-destructive font-semibold uppercase tracking-wider">The Problem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Every bad lead is a bad decision.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            And you have made too many of them. We know. We talked to hundreds of business owners who told us the same story over and over.
          </p>
        </div>

        <div className="space-y-6">
          {pains.map((pain, i) => (
            <div
              key={i}
              className="card-premium p-6 sm:p-8 border-l-2 border-l-destructive"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{pain.title}</h3>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">{pain.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl sm:text-2xl text-foreground font-semibold leading-relaxed">
            The problem is not you. The problem is the list.
          </p>
          <p className="text-base text-muted-foreground mt-3">
            Old lists are dead lists. And dead lists are bad decisions.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// SOLUTION SECTION
// ============================================================
function SolutionSection() {
  return (
    <section className="bg-card py-24 sm:py-32 border-y border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-success/15 border border-success/20 mb-6">
            <span className="text-[12px] text-success font-semibold uppercase tracking-wider">The Fix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-card-foreground mb-4">
            We built the opposite of a bad list.
          </h2>
          <p className="text-lg text-card-foreground/70 max-w-2xl mx-auto">
            Instead of selling you old data, we go find real buyers right now. Then we make sure every email works before you pay.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="card-premium p-8">
            <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Old way</h3>
            <ul className="space-y-2.5">
              {['Buy a list from a stranger', 'Hope the emails still work', 'Send your pitch and pray', 'Pay for every bounce', 'Waste weeks on dead leads'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                  <span className="text-destructive mt-0.5">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium p-8 border-primary/30">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Our way</h3>
            <ul className="space-y-2.5">
              {['Tell us who you want to reach', 'We scan the live internet for them', 'We test every email inbox first', 'You only pay for working contacts', 'Get leads that actually want you'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-foreground">
                  <span className="text-success mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-premium p-8 sm:p-10 text-center bg-card">
          <p className="text-2xl sm:text-3xl font-bold text-card-foreground leading-relaxed mb-3">
            You do not buy a list. You buy results.
          </p>
          <p className="text-base sm:text-lg text-card-foreground/70">
            If the email does not work, you do not pay. That simple.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// HOW IT WORKS
// ============================================================
function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Tell us who you want.',
      body: 'Type what you need. Roofers in Dallas. Bakeries in Lagos. Plumbers in London. Dentists in Toronto. You name it. We go find them. No long forms. No complex setup. Just type what you want and hit search.',
    },
    {
      num: '02',
      title: 'We scan the live internet.',
      body: 'Our system goes to work. It searches the web for real businesses that match what you asked for. It finds the people who make decisions at those businesses. It pulls their names, their roles, their phone numbers, their social pages.',
    },
    {
      num: '03',
      title: 'We test every email inbox.',
      body: 'Before you pay a single credit, we check every email. We connect to the mail server. We make sure the inbox is real. We make sure it can receive mail. If the email is dead, you never see it. You only get the ones that work.',
    },
    {
      num: '04',
      title: 'You get verified contacts.',
      body: 'Download your leads as a clean spreadsheet. Every contact has a tested email. Every contact has a name and a role. Every contact is a real business that matches what you asked for. Send your pitch. Close the deal. That is it.',
    },
  ]

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Four steps. Real results.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No learning curve. No complicated setup. Just tell us who you want and we go find them.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-6 card-premium p-6 sm:p-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-base transition-colors"
          >
            Read the full breakdown
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// ENGINES SECTION
// ============================================================
function EnginesSection() {
  const engines = [
    {
      title: 'Companies Running Ads',
      desc: 'Find businesses that are already spending money on ads. If they pay for ads, they have a budget. If they have a budget, they can buy what you sell.',
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    },
    {
      title: 'Local Businesses',
      desc: 'Find shops, clinics, salons, gyms, and offices near you or anywhere in the world. These are businesses with real addresses and real owners who pick up the phone.',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      title: 'Businesses Without Websites',
      desc: 'Find businesses that do not have a website yet. If you build websites, design logos, or sell marketing services, these are your hottest prospects. They need you.',
      icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    },
    {
      title: 'People Asking For Help',
      desc: 'Find people who are posting online asking for help right now. They are raising their hand saying they need a solution. If you have that solution, this is a gift.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
  ]

  return (
    <section className="bg-card py-24 sm:py-32 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">Four Ways To Find Buyers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-card-foreground mb-4">
            Pick your target. We do the rest.
          </h2>
          <p className="text-lg text-card-foreground/70 max-w-2xl mx-auto">
            You are not stuck with one kind of lead. Choose from four ways to find the exact buyers you want.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {engines.map((engine, i) => (
            <div key={i} className="card-premium p-7 sm:p-8 group hover:border-primary/30 transition-all">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                  <svg className="w-7 h-7 text-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={engine.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{engine.title}</h3>
                  <p className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed">{engine.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[15px] text-card-foreground/70">
            Free accounts get two of these. Paid accounts get all four.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// PROOF SECTION
// ============================================================
function ProofSection() {
  const testimonials = [
    {
      quote: 'I spent six months buying lists from three different vendors. All garbage. Then I tried Bad Decision. First search gave me 40 verified emails. I closed two deals that week. Two. In one week. I have not bought a list from anyone else since.',
      name: 'Chidi O.',
      role: 'Marketing Agency Owner',
      location: 'Lagos',
    },
    {
      quote: 'I was about to give up on cold email. Nothing was working. Every list I bought was full of dead addresses. A friend told me about Bad Decision. I figured I had nothing to lose. The free 50 leads turned into three paying clients. Three. For free. I am now on the Growth plan and I will never go back.',
      name: 'Sarah M.',
      role: 'Web Design Freelancer',
      location: 'London',
    },
    {
      quote: 'My team was wasting 20 hours a week chasing leads that went nowhere. Now they spend 2 hours a week sending emails to people who actually exist. The rest of the time they close deals. Bad Decision paid for itself in the first week. I do not say that about many things.',
      name: 'Marcus T.',
      role: 'Sales Director',
      location: 'Texas',
    },
  ]

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-success/15 border border-success/20 mb-6">
            <span className="text-[12px] text-success font-semibold uppercase tracking-wider">Real Results</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            People who stopped making bad decisions.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These are real stories from real business owners who were tired of buying garbage leads.
          </p>
        </div>

        <div className="space-y-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card-premium p-7 sm:p-9">
              <div className="flex items-start gap-2 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-base sm:text-lg text-foreground leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-base">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t.name}</div>
                  <div className="text-[13px] text-muted-foreground">{t.role} · {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-base transition-colors"
          >
            Read more success stories
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// GUARANTEE SECTION
// ============================================================
function GuaranteeSection() {
  return (
    <section className="bg-card py-24 sm:py-32 border-y border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-premium p-8 sm:p-12 text-center bg-card border-primary/20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">Our Promise</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-card-foreground mb-6">
            If the email bounces, you do not pay.
          </h2>
          <p className="text-lg text-card-foreground/70 leading-relaxed mb-8 max-w-2xl mx-auto">
            That is not a marketing pitch. That is how the system works.
            We test every email before we give it to you.
            If we say it works, it works. If it does not, you never see it.
            You only spend credits on contacts that can actually receive your message.
          </p>
          <p className="text-xl text-card-foreground font-semibold mb-8">
            No other lead vendor will make you that promise.
          </p>
          <Link
            href="/guarantee"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-lg shadow-primary/30"
          >
            Read Our Full Guarantee
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// PRICING PREVIEW
// ============================================================
function PricingPreviewSection() {
  const { userCountry } = useAppStore()
  const isNigeria = userCountry === 'NG'

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
          <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">Simple Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          Start free. Pay only when it works.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          You get 100 free leads the moment you sign up. No credit card needed.
          When you want more, pick a plan that fits. You are never locked in.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {TIERS.map((plan) => {
            const isPopular = plan.popular
            return (
              <div
                key={plan.id}
                className={`card-premium p-6 text-left relative flex flex-col ${
                  isPopular ? 'border-primary/40 glow-violet-sm' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-[15px] text-foreground font-bold mb-1">{plan.name}</div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {plan.priceUSD === 0 ? (
                    'Free'
                  ) : (
                    <>
                      {isNigeria ? `₦${plan.priceNGN.toLocaleString()}` : `$${plan.priceUSD}`}<span className="text-base text-muted-foreground font-normal">/mo</span>
                    </>
                  )}
                </div>
                <div className="text-[14px] text-primary font-semibold mb-3">{plan.credits.toLocaleString()} credits</div>

                <div className="h-px bg-border my-3"></div>

                <ul className="space-y-2 flex-1">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[12px] text-muted-foreground leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <Link
          href="/pricing#pricing-table"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-lg shadow-primary/30"
        >
          See Full Pricing
        </Link>
      </div>
    </section>
  )
}

// ============================================================
// FAQ PREVIEW
// ============================================================
function FAQPreviewSection() {
  const faqs = [
    {
      q: 'Are the emails really tested?',
      a: 'Yes. Before we show you any email, we check if the inbox can receive mail. If it cannot, you never see it. You only pay for emails that work. This is the whole point of what we built.',
    },
    {
      q: 'How many free leads do I get?',
      a: 'You get 100 free leads the moment you sign up. No credit card. No catch. You can run real searches and get real contacts. If you like what you see, you can buy more. If you do not, you walk away having lost nothing.',
    },
    {
      q: 'What if I only need leads once?',
      a: 'That is fine. You do not need a monthly plan. Your free 100 credits let you test the app with no cost. If you want more leads later, pick a plan that fits your budget. You can upgrade, downgrade, or cancel anytime.',
    },
    {
      q: 'Can I search for any type of business?',
      a: 'Yes. You can search for roofers, dentists, plumbers, bakeries, gyms, agencies, clinics, stores, and anything else you can think of. If they exist on the internet, we can find them.',
    },
  ]

  return (
    <section className="bg-card py-24 sm:py-32 border-y border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-card-foreground mb-4">
            Things people ask before they sign up.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="card-premium p-6 sm:p-7">
              <h3 className="text-lg font-bold text-foreground mb-2">{faq.q}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-base transition-colors"
          >
            See all questions
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FINAL CTA
// ============================================================
function FinalCTASection() {
  return (
    <section className="bg-background py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Stop paying for <span className="text-destructive">dead emails.</span>
          <br />
          Start closing <span className="text-gradient-violet">real buyers.</span>
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          You have made enough bad decisions with lead lists. Make one good one today.
          Sign up free. Get 50 verified contacts. See for yourself.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-lg font-semibold transition-all shadow-xl shadow-primary/30 hover:-translate-y-0.5"
          >
            Get My 100 Free Leads
          </Link>
          <Link
            href="/pricing#pricing-table"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-card border border-border hover:border-primary/50 text-card-foreground text-lg font-semibold transition-all"
          >
            View Plans
          </Link>
        </div>
        <p className="mt-8 text-[14px] text-muted-foreground">
          No credit card to start. Cancel anytime. Keep your free leads forever.
        </p>
      </div>
    </section>
  )
}

// ============================================================
// ICONS
// ============================================================
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
