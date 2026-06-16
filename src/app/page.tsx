'use client'

/**
 * LANDING PAGE — Bad Decision AI
 * Long-form, value-driven, Dan Kennedy direct-response copy.
 * Grade 3 English. No em dashes. No tech jargon.
 * Connects to the name "Bad Decision."
 */

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { fetchCoinBalance, fetchCollections } from '@/lib/api'

export default function LandingPage() {
  const { isSignedIn, isLoaded, userId } = useAuth()
  const router = useRouter()
  const { setCoinBalance, setCollections } = useAppStore()
  const redirected = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && userId && !redirected.current) {
      redirected.current = true
      fetchCoinBalance().then(balance => {
        setCoinBalance({
          coins_balance: balance.coins_balance ?? 0,
          coins_reserved: balance.coins_reserved ?? 0,
          coins_lifetime: balance.coins_lifetime ?? 0,
        })
      }).catch(() => {})
      fetchCollections(userId).then(cols => setCollections(cols)).catch(() => {})
      router.replace('/dashboard')
    }
  }, [isSignedIn, isLoaded, userId, router, setCoinBalance, setCollections])

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
    <section className="relative bg-[#08080C] bg-radial-glow bg-grid pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14141C] border border-[#25252F] mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
          <span className="text-[13px] text-[#A8A8B8] font-medium">Every email tested before you pay</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in-up">
          <span className="text-gradient">Buying old lead lists</span>
          <br />
          <span className="text-[#F5F5F7]">is a </span>
          <span className="text-[#F87171]">bad decision.</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#A8A8B8] max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up">
          We are called Bad Decision because that is what we help you avoid.
          We scan the live internet to find real buyers who want what you sell.
          Then we test every single email before you spend a dime.
          You only pay for contacts that actually work.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-base font-semibold transition-all shadow-lg shadow-[#7C5CFC]/30 hover:shadow-xl hover:shadow-[#7C5CFC]/40 hover:-translate-y-0.5"
          >
            Get 50 Free Leads Today
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#14141C] border border-[#25252F] hover:border-[#3D3D4A] text-[#F5F5F7] text-base font-semibold transition-all"
          >
            See How It Works
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-[#6B6B7B] animate-fade-in-up">
          <span className="flex items-center gap-2">
            <CheckIcon /> No credit card to start
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> 50 free contacts
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
              <div className="text-[12px] sm:text-[13px] text-[#A8A8B8]">{stat.label}</div>
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
    <section className="bg-[#08080C] py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#2A1010] border border-[#F87171]/20 mb-6">
            <span className="text-[12px] text-[#F87171] font-semibold uppercase tracking-wider">The Problem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4">
            Every bad lead is a bad decision.
          </h2>
          <p className="text-lg text-[#A8A8B8] max-w-2xl mx-auto">
            And you have made too many of them. We know. We talked to hundreds of business owners who told us the same story over and over.
          </p>
        </div>

        <div className="space-y-6">
          {pains.map((pain, i) => (
            <div
              key={i}
              className="card-premium p-6 sm:p-8 border-l-2 border-l-[#F87171]"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F7] mb-3">{pain.title}</h3>
              <p className="text-[15px] sm:text-base text-[#A8A8B8] leading-relaxed">{pain.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl sm:text-2xl text-[#F5F5F7] font-semibold leading-relaxed">
            The problem is not you. The problem is the list.
          </p>
          <p className="text-base text-[#A8A8B8] mt-3">
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
    <section className="bg-[#0E0E14] py-24 sm:py-32 border-y border-[#25252F]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#0D2818] border border-[#34D399]/20 mb-6">
            <span className="text-[12px] text-[#34D399] font-semibold uppercase tracking-wider">The Fix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4">
            We built the opposite of a bad list.
          </h2>
          <p className="text-lg text-[#A8A8B8] max-w-2xl mx-auto">
            Instead of selling you old data, we go find real buyers right now. Then we make sure every email works before you pay.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="card-premium p-8">
            <div className="w-12 h-12 rounded-xl bg-[#2A1010] flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#F5F5F7] mb-3">Old way</h3>
            <ul className="space-y-2.5">
              {['Buy a list from a stranger', 'Hope the emails still work', 'Send your pitch and pray', 'Pay for every bounce', 'Waste weeks on dead leads'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-[#A8A8B8]">
                  <span className="text-[#F87171] mt-0.5">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium p-8 border-[#7C5CFC]/30">
            <div className="w-12 h-12 rounded-xl bg-[#1A1535] flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#F5F5F7] mb-3">Our way</h3>
            <ul className="space-y-2.5">
              {['Tell us who you want to reach', 'We scan the live internet for them', 'We test every email inbox first', 'You only pay for working contacts', 'Get leads that actually want you'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-[#F5F5F7]">
                  <span className="text-[#34D399] mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-premium p-8 sm:p-10 text-center bg-gradient-to-br from-[#14141C] to-[#1A1535]">
          <p className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] leading-relaxed mb-3">
            You do not buy a list. You buy results.
          </p>
          <p className="text-base sm:text-lg text-[#A8A8B8]">
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
      body: 'Before you pay a single coin, we check every email. We connect to the mail server. We make sure the inbox is real. We make sure it can receive mail. If the email is dead, you never see it. You only get the ones that work.',
    },
    {
      num: '04',
      title: 'You get verified contacts.',
      body: 'Download your leads as a clean spreadsheet. Every contact has a tested email. Every contact has a name and a role. Every contact is a real business that matches what you asked for. Send your pitch. Close the deal. That is it.',
    },
  ]

  return (
    <section className="bg-[#08080C] py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
            <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4">
            Four steps. Real results.
          </h2>
          <p className="text-lg text-[#A8A8B8] max-w-2xl mx-auto">
            No learning curve. No complicated setup. Just tell us who you want and we go find them.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-6 card-premium p-6 sm:p-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F7] mb-2">{step.title}</h3>
                <p className="text-[15px] sm:text-base text-[#A8A8B8] leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-base transition-colors"
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
    <section className="bg-[#0E0E14] py-24 sm:py-32 border-y border-[#25252F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
            <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">Four Ways To Find Buyers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4">
            Pick your target. We do the rest.
          </h2>
          <p className="text-lg text-[#A8A8B8] max-w-2xl mx-auto">
            You are not stuck with one kind of lead. Choose from four ways to find the exact buyers you want.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {engines.map((engine, i) => (
            <div key={i} className="card-premium p-7 sm:p-8 group hover:border-[#7C5CFC]/30 transition-all">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#1A1535] border border-[#7C5CFC]/20 flex items-center justify-center group-hover:bg-[#7C5CFC] group-hover:border-[#7C5CFC] transition-all">
                  <svg className="w-7 h-7 text-[#7C5CFC] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={engine.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F7] mb-2">{engine.title}</h3>
                  <p className="text-[14px] sm:text-[15px] text-[#A8A8B8] leading-relaxed">{engine.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[15px] text-[#A8A8B8]">
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
    <section className="bg-[#08080C] py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#0D2818] border border-[#34D399]/20 mb-6">
            <span className="text-[12px] text-[#34D399] font-semibold uppercase tracking-wider">Real Results</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4">
            People who stopped making bad decisions.
          </h2>
          <p className="text-lg text-[#A8A8B8] max-w-2xl mx-auto">
            These are real stories from real business owners who were tired of buying garbage leads.
          </p>
        </div>

        <div className="space-y-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card-premium p-7 sm:p-9">
              <div className="flex items-start gap-2 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-base sm:text-lg text-[#F5F5F7] leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center">
                  <span className="text-white font-bold text-base">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-semibold text-[#F5F5F7]">{t.name}</div>
                  <div className="text-[13px] text-[#A8A8B8]">{t.role} · {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-base transition-colors"
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
    <section className="bg-[#0E0E14] py-24 sm:py-32 border-y border-[#25252F]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-premium p-8 sm:p-12 text-center bg-gradient-to-br from-[#14141C] to-[#1A1535] border-[#7C5CFC]/20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#7C5CFC]/10 border border-[#7C5CFC]/30 mb-6">
            <svg className="w-10 h-10 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
            <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">Our Promise</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-6">
            If the email bounces, you do not pay.
          </h2>
          <p className="text-lg text-[#A8A8B8] leading-relaxed mb-8 max-w-2xl mx-auto">
            That is not a marketing pitch. That is how the system works.
            We test every email before we give it to you.
            If we say it works, it works. If it does not, you never see it.
            You only spend coins on contacts that can actually receive your message.
          </p>
          <p className="text-xl text-[#F5F5F7] font-semibold mb-8">
            No other lead vendor will make you that promise.
          </p>
          <Link
            href="/guarantee"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-base font-semibold transition-all shadow-lg shadow-[#7C5CFC]/30"
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
  return (
    <section className="bg-[#08080C] py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
          <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">Simple Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4">
          Start free. Pay only when it works.
        </h2>
        <p className="text-lg text-[#A8A8B8] max-w-2xl mx-auto mb-12">
          You get 50 free leads the moment you sign up. No credit card needed.
          When you want more, pick a plan that fits. Or buy coins one at a time.
          You are never locked in.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {[
            { name: 'Free', price: '$0', coins: '50', feature: '2 search engines', popular: false },
            { name: 'Growth', price: '$25', coins: '3,000', feature: 'All 4 engines', popular: true },
            { name: 'Pro', price: '$35', coins: '5,000', feature: 'Everything unlocked', popular: false },
          ].map((plan, i) => (
            <div
              key={i}
              className={`card-premium p-7 text-left ${
                plan.popular ? 'border-[#7C5CFC]/40 glow-violet-sm' : ''
              }`}
            >
              {plan.popular && (
                <div className="inline-block px-3 py-0.5 rounded-full bg-[#7C5CFC] text-white text-[11px] font-bold uppercase tracking-wider mb-3">
                  Most Popular
                </div>
              )}
              <div className="text-[15px] text-[#A8A8B8] font-medium mb-1">{plan.name}</div>
              <div className="text-3xl font-bold text-[#F5F5F7] mb-2">{plan.price}<span className="text-base text-[#6B6B7B] font-normal">/mo</span></div>
              <div className="text-[14px] text-[#7C5CFC] font-semibold mb-3">{plan.coins} coins</div>
              <div className="text-[13px] text-[#A8A8B8]">{plan.feature}</div>
            </div>
          ))}
        </div>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-base font-semibold transition-all shadow-lg shadow-[#7C5CFC]/30"
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
      a: 'You get 50 free leads the moment you sign up. No credit card. No catch. You can run real searches and get real contacts. If you like what you see, you can buy more. If you do not, you walk away having lost nothing.',
    },
    {
      q: 'What if I only need leads once?',
      a: 'That is fine. You do not need a monthly plan. You can buy coins one time and use them whenever you want. Coins do not expire. Buy what you need, when you need it.',
    },
    {
      q: 'Can I search for any type of business?',
      a: 'Yes. You can search for roofers, dentists, plumbers, bakeries, gyms, agencies, clinics, stores, and anything else you can think of. If they exist on the internet, we can find them.',
    },
  ]

  return (
    <section className="bg-[#0E0E14] py-24 sm:py-32 border-y border-[#25252F]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
            <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-4">
            Things people ask before they sign up.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="card-premium p-6 sm:p-7">
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">{faq.q}</h3>
              <p className="text-[15px] text-[#A8A8B8] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-base transition-colors"
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
    <section className="bg-[#08080C] py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F5F7] mb-6 leading-tight">
          Stop paying for <span className="text-[#F87171]">dead emails.</span>
          <br />
          Start closing <span className="text-gradient-violet">real buyers.</span>
        </h2>
        <p className="text-lg sm:text-xl text-[#A8A8B8] max-w-2xl mx-auto mb-10 leading-relaxed">
          You have made enough bad decisions with lead lists. Make one good one today.
          Sign up free. Get 50 verified contacts. See for yourself.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-lg font-semibold transition-all shadow-xl shadow-[#7C5CFC]/30 hover:-translate-y-0.5"
          >
            Get My 50 Free Leads
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#14141C] border border-[#25252F] hover:border-[#3D3D4A] text-[#F5F5F7] text-lg font-semibold transition-all"
          >
            View Plans
          </Link>
        </div>
        <p className="mt-8 text-[14px] text-[#6B6B7B]">
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
    <svg className="w-4 h-4 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
