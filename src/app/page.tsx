'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Crosshair,
  Target,
  MapPin,
  Globe,
  MessageSquare,
  Shield,
  Zap,
  Coins,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  Star,
  Phone,
  Mail,
  Clock,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ============================================================ */}
      {/* HERO */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-accent-purple)]/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-8">
              <Zap className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">Live search. Verified emails. Zero bounces.</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6"
            >
              Buying Bad Leads Is a{' '}
              <span className="relative">
                <span className="gradient-text">Bad Decision</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5C47 2 153 2 199 5.5" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="var(--color-accent)" />
                      <stop offset="1" stopColor="var(--color-accent-purple)" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-4"
            >
              That is why we named this company after your worst habit. You keep paying for lists full of dead emails and fake phone numbers. You keep guessing who to call. That is a bad decision. We are here to fix it.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-base text-[var(--text-tertiary)] max-w-xl mx-auto mb-10"
            >
              We search the live internet right now. Not last year. Not some database from 2022. We find real businesses, real people, and we check every email against the mail server before you see it. No bounces. No dead numbers. No wasted money.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white font-semibold text-base hover:shadow-2xl hover:shadow-[var(--color-accent)]/20 transition-all"
              >
                Stop Wasting Money on Bad Leads
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium text-base hover:text-[var(--text-primary)] hover:border-[var(--border-light)] transition-all"
              >
                See How Much It Costs
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-12 text-sm text-[var(--text-tertiary)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-green)]" />
                50 free coins to start
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-green)]" />
                No credit card needed
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-green)]" />
                Every email verified
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SOCIAL PROOF BAR */}
      {/* ============================================================ */}
      <section className="py-10 sm:py-14 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Users className="w-5 h-5 text-[var(--color-accent)]" />, value: '10,000+', label: 'Leads Delivered' },
              { icon: <Shield className="w-5 h-5 text-[var(--color-accent)]" />, value: '92%', label: 'Emails That Work' },
              { icon: <Target className="w-5 h-5 text-[var(--color-accent)]" />, value: '4', label: 'Ways To Search' },
              { icon: <Clock className="w-5 h-5 text-[var(--color-accent)]" />, value: '< 60s', label: 'To First Result' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-xs md:text-sm text-[var(--text-tertiary)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY THE NAME — Making "Bad Decision" make sense */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6">
              Why Is It Called <span className="gradient-text">Bad Decision</span>?
            </h2>
            <div className="space-y-4 text-lg text-[var(--text-secondary)] max-w-3xl mx-auto text-left">
              <p>
                Because buying bad leads is the worst decision you can make in business. You spend money on a list. Half the emails bounce. Half the phone numbers are dead. You waste hours calling people who do not exist. Then you buy another list and do it again.
              </p>
              <p>
                That is not a marketing problem. That is a you-keep-making-the-same-bad-decision problem. We named this company after that problem so you never forget it. Every time you log in, you remember: I am done making bad decisions with my money.
              </p>
              <p>
                The good decision? Search the live internet. Find real businesses. Verify every email before you pay for it. That is what we do. That is why we exist.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SEARCH ENGINES — What problem they solve */}
      {/* ============================================================ */}
      <section id="features" className="py-20 sm:py-28 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Four Ways To <span className="gradient-text">Find Your Next Customer</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Each search finds a different kind of buyer. Use one. Use all four. Your pipeline never runs dry.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EngineFeature
              icon={<Target className="w-6 h-6" />}
              title="Ads Intent"
              tagline="Find businesses already spending money on ads"
              description="If a business is running ads, they have money to spend. That means they can afford you. These are not cold leads. These are warm wallets. They are already paying to get customers. You just need to show up before your competitor does."
              color="var(--color-orange)"
              bgColor="var(--color-orange-bg)"
              borderColor="rgba(249, 115, 22, 0.2)"
              benefits={['See who is running Google and Facebook ads right now', 'Know their ad budget range before you pick up the phone', 'Reach out while their wallet is already open']}
            />
            <EngineFeature
              icon={<MapPin className="w-6 h-6" />}
              title="SMB Maps"
              tagline="Find every local business in any area"
              description="Map out every plumber, dentist, restaurant, or gym in any city on earth. Get their phone number, email, and address all at once. Local businesses are the easiest sells because you can walk through their front door. No gatekeepers. No runaround."
              color="var(--color-blue)"
              bgColor="var(--color-blue-bg)"
              borderColor="rgba(59, 130, 246, 0.2)"
              benefits={['Search by business type and location', 'Get phone, email, and address in one go', 'Works in 195+ countries']}
            />
            <EngineFeature
              icon={<Globe className="w-6 h-6" />}
              title="Web Absent"
              tagline="Find businesses with no website"
              description="A business with no website is a business that needs one. That is the easiest pitch you will ever make. Find them. Show them what they are missing. Build it for them or sell them yours. This search alone has closed thousands of deals for web designers and marketers around the world."
              color="var(--color-red)"
              bgColor="var(--color-red-bg)"
              borderColor="rgba(239, 68, 68, 0.2)"
              benefits={['Every result is a business that needs you', 'The easiest cold pitch you will ever make', 'Perfect for web designers, marketers, and agencies']}
            />
            <EngineFeature
              icon={<MessageSquare className="w-6 h-6" />}
              title="Social Intent"
              tagline="Find people asking for help right now"
              description="Someone just posted "I need a plumber" or "looking for a good accountant" on social media. They posted it today. You reply today. That is not cold outreach. That is answering a question with your business card. You go from search to signed contract faster than any other method."
              color="var(--color-green)"
              bgColor="var(--color-green-bg)"
              borderColor="rgba(34, 197, 94, 0.2)"
              benefits={['Real-time posts from real people', 'They asked for help. You answer first.', 'Fastest path from search to signed contract']}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS — 3 Steps */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              Three steps. No learning curve. No setup call. No demo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={<Target className="w-6 h-6" />}
              title="Pick what you want"
              description="Choose your search type. Want businesses running ads? Local shops near you? Businesses with no website? People asking for help on social media? Pick one and type what you need. Takes ten seconds."
            />
            <StepCard
              step={2}
              icon={<MapPin className="w-6 h-6" />}
              title="Set your location"
              description="Narrow it down to any city, state, or country. Plumbers in Lagos. Dentists in London. Agencies in New York. The whole world is your territory. You pick the ground, we find the targets."
            />
            <StepCard
              step={3}
              icon={<Shield className="w-6 h-6" />}
              title="Get verified contacts"
              description="Every email we give you has been checked against the real mail server. We connect to the server and ask: does this email exist? If the answer is no, you never see it. If it bounces, you do not pay for it. Download your leads and start calling today."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE PROBLEM — Make it personal */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6">
                You Are <span className="gradient-text">Burning Money</span> On Bad Data
              </h2>
              <div className="space-y-4 text-[var(--text-secondary)]">
                <p>
                  You buy a list of 1,000 emails. You send your campaign. 480 bounce. 250 go straight to the spam folder. You hear back from 12 people. Twelve. You spent real money and got almost nothing back.
                </p>
                <p>
                  That is not a marketing problem. That is a data problem. Your list was garbage before you sent a single email. You just did not know it.
                </p>
                <p>
                  We check every email against the real mail server before you see it. Not a guess. Not a "probably valid" label. An actual connection to the server that asks: does this address exist? We check phone numbers. We verify websites. If the contact is dead, you never see it. You only pay for what works.
                </p>
                <p>
                  Stop making the same bad decision over and over. Stop buying lists from brokers who do not check their data. Find your own leads. Verify them yourself. Close more deals.
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-green-bg)] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-green)]" />
                  </div>
                  <span className="text-sm">Every email tested against the real mail server</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-green-bg)] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-green)]" />
                  </div>
                  <span className="text-sm">If it bounces, you do not pay for it. Period.</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-green-bg)] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-green)]" />
                  </div>
                  <span className="text-sm">Export clean leads to CSV in one click</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {/* Before / After comparison cards */}
              <div className="rounded-2xl border border-[var(--color-red)]/20 bg-[var(--color-red-bg)] p-6">
                <p className="text-sm font-semibold text-[var(--color-red)] uppercase tracking-wide mb-3">Without verification (your current list)</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Emails sent</span>
                    <span className="text-[var(--text-primary)] font-semibold">1,000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Bounced</span>
                    <span className="text-[var(--color-red)] font-semibold">480</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Spam folder</span>
                    <span className="text-[var(--color-red)] font-semibold">250</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-[var(--color-red)]/20 pt-2">
                    <span className="text-[var(--text-secondary)]">Actually reached</span>
                    <span className="text-[var(--color-red)] font-bold">270</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-green)]/20 bg-[var(--color-green-bg)] p-6">
                <p className="text-sm font-semibold text-[var(--color-green)] uppercase tracking-wide mb-3">With Bad Decision (verified)</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Emails sent</span>
                    <span className="text-[var(--text-primary)] font-semibold">1,000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Bounced</span>
                    <span className="text-[var(--color-green)] font-semibold">18</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Spam folder</span>
                    <span className="text-[var(--color-green)] font-semibold">45</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-[var(--color-green)]/20 pt-2">
                    <span className="text-[var(--text-secondary)]">Actually reached</span>
                    <span className="text-[var(--color-green)] font-bold">937</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              People Who <span className="gradient-text">Stopped Making Bad Decisions</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'I closed 3 web design clients in my first week using the no-website search. These were businesses I never would have found otherwise. Two of them had been looking for someone for months. They just did not know where to look. I showed up first.',
                name: 'Chidi O.',
                role: 'Freelance Web Designer, Lagos',
              },
              {
                quote: 'The Social Intent search changed everything for my accounting firm. I found 12 people asking for accounting help on social media in one day. One day. I landed 4 of them as clients that same week. That is not cold calling. That is answering the door when they knock.',
                name: 'Amina B.',
                role: 'Accounting Firm Owner, Abuja',
              },
              {
                quote: 'We used to buy leads from brokers. Half were fake. The other half were outdated. Now we find our own leads and every email actually works. We save money and close more deals. Every naira we spend on this tool comes back ten times.',
                name: 'Emeka N.',
                role: 'Digital Agency Director, Port Harcourt',
              },
            ].map((testimonial) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 md:p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[var(--text-primary)] leading-relaxed text-sm md:text-base">{testimonial.quote}</p>
                <div className="mt-6">
                  <p className="font-semibold text-[var(--text-primary)] text-sm">{testimonial.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRICING PREVIEW */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              You Put In Coins. You Get <span className="gradient-text">Leads</span>.
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Simple as a vending machine. Put in coins. Get leads out. Start free. Pay more when you need more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniPricingCard name="Explorer" price="Free" coins={50} description="Try it out first" />
            <MiniPricingCard name="Starter" price="10K" coins={200} highlight description="For solo closers" />
            <MiniPricingCard name="Growth" price="25K" coins={600} description="For small teams" />
            <MiniPricingCard name="Pro" price="50K" coins={1500} description="For agencies" />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              See full pricing details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-[var(--bg-inverse)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center rounded-3xl p-10 sm:p-16"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Stop Paying For <span className="gradient-text">Dead Emails</span>
            </h2>
            <p className="text-lg text-[var(--text-tertiary)] mb-8 max-w-xl mx-auto">
              The worst decision in business is guessing who to call. The best decision is knowing. Get 50 free coins and find out for yourself. No credit card. No catch. Just results.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white font-semibold text-base hover:shadow-2xl hover:shadow-[var(--color-accent)]/20 transition-all"
            >
              Make The Right Decision Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="py-12 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center">
                  <Crosshair className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">Bad Decision</span>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">Buying bad leads is a bad decision. We are here to fix that. Verify every email. Find real businesses. Close more deals.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/#features" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</Link>
                <Link href="/pricing" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
                <Link href="/faq" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">FAQ</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Company</p>
              <div className="space-y-2">
                <span className="block text-sm text-[var(--text-secondary)]">Contact</span>
                <span className="block text-sm text-[var(--text-secondary)]">hello@baddecision.ai</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Legal</p>
              <div className="space-y-2">
                <span className="block text-sm text-[var(--text-secondary)]">Privacy Policy</span>
                <span className="block text-sm text-[var(--text-secondary)]">Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border-color)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--text-tertiary)]">
              &copy; {new Date().getFullYear()} Bad Decision. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function EngineFeature({ icon, title, tagline, description, color, bgColor, borderColor, benefits }: {
  icon: React.ReactNode
  title: string
  tagline: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  benefits: string[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 hover:border-[var(--border-light)] transition-all group"
      style={{ borderLeftColor: borderColor, borderLeftWidth: '3px' }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: bgColor, color }}
        >
          {icon}
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-sm font-semibold mb-3" style={{ color }}>{tagline}</p>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{description}</p>
      <div className="space-y-2">
        {benefits.map((benefit, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-tertiary)]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function StepCard({ step, icon, title, description }: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center p-6"
    >
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center">
          {step}
        </span>
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>
    </motion.div>
  )
}

function MiniPricingCard({ name, price, coins, description, highlight }: {
  name: string
  price: string
  coins: number
  description: string
  highlight?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className={`
        rounded-xl p-5 text-center transition-all
        ${highlight
          ? 'bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 glow-accent'
          : 'bg-[var(--bg-surface)] border border-[var(--border-color)]'
        }
      `}
    >
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{name}</h4>
      <p className="text-xs text-[var(--text-tertiary)] mb-3">{description}</p>
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{price}</p>
      <div className="flex items-center justify-center gap-1 text-xs text-[var(--color-coin)]">
        <Coins className="w-3.5 h-3.5" />
        {coins} coins/mo
      </div>
    </motion.div>
  )
}
