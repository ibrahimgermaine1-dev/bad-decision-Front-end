'use client'

/**
 * LANDING PAGE — The Main Sales Page
 * High-contrast: white sections alternating with midnight navy
 * Dan S. Kennedy direct-response copy. Grade 3 English. No emojis.
 */
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function LandingPage() {

  return (
    <div className="min-h-screen">
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-semibold text-foreground tracking-tight">Bad Decision</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="/faq" className="text-sm text-foreground hover:text-primary transition-colors">FAQ</Link>
            <a href="mailto:support@baddecision.ai" className="text-sm text-foreground hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="border-border text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-background py-16 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.05]">
            Stop Emailing Ghost Towns.<br />
            Let Our System Find The Buyers.
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our smart app finds real business contacts for you. It checks every email to make sure it works before you pay.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-base font-semibold"
              >
                Deploy Your Matrix
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="border-border text-foreground px-8 py-6 text-base font-semibold hover:bg-muted"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* THE COST OF INACTION */}
      <section className="bg-muted py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border-2 border-destructive/30 bg-white p-8 sm:p-10">
              <div className="inline-block rounded-full bg-destructive/15 px-4 py-1.5 text-xs font-semibold text-destructive uppercase tracking-wide mb-6">
                The Costly Mistake
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Buying old lists full of dead emails.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                You pay hundreds of dollars for a spreadsheet. Half the emails bounce. The companies moved on. The people left. You just paid for garbage. That is a bad decision.
              </p>
              <div className="mt-8 space-y-3">
                {['Stale data from months ago', 'No way to know if emails work', 'Wasted money on dead contacts'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-card p-8 sm:p-10">
              <div className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wide mb-6">
                The Smart Move
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-card-foreground leading-tight">
                Let our system run a live internet scan to find real people right now.
              </h2>
              <p className="mt-4 text-card-foreground/70 leading-relaxed">
                We do not sell old lists. We scan the live internet. We check every email inbox to make sure it works. You only pay for verified contacts. That is a smart decision.
              </p>
              <div className="mt-8 space-y-3">
                {['Live data from the internet right now', 'Every email tested before you pay', 'Only pay for contacts that pass'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-card-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP FLOW */}
      <section id="how-it-works" className="bg-background py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Three Steps. Real Results.</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">No complicated setup. No learning curve. Just tell us who you want, and we find them.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Tell Us Who You Want', desc: 'Type what you need. Roofers in Dallas. Plumbers in Texas. Bakeries in Lagos. Our system takes it from there.' },
              { step: '02', title: 'We Find Them', desc: 'Our system scans the live internet. It finds real businesses. It finds the people who make decisions there.' },
              { step: '03', title: 'We Test The Inbox', desc: 'We check every email. We connect to the mail server. We make sure the inbox is real. You only pay for what works.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-primary mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-card py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-card-foreground">Stop Paying For Dead Emails.</h2>
          <p className="mt-4 text-card-foreground/70 text-lg">Get 50 free contacts when you sign up. No credit card needed.</p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="mt-8 bg-primary hover:bg-primary/90 text-white px-10 py-6 text-base font-semibold"
            >
              Deploy Your Matrix
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="text-card-foreground font-semibold">Bad Decision</span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/pricing" className="text-card-foreground/70 hover:text-card-foreground text-sm transition-colors">Pricing</Link>
              <Link href="/faq" className="text-card-foreground/70 hover:text-card-foreground text-sm transition-colors">FAQ</Link>
              <a href="mailto:support@baddecision.ai" className="text-card-foreground/70 hover:text-card-foreground text-sm transition-colors">Contact</a>
            </div>
            <p className="text-card-foreground/60 text-sm">2026 Bad Decision. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
