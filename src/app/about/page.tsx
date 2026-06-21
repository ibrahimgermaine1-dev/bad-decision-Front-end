'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">About Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            We got tired of <span className="text-destructive">bad leads.</span> <br />So we built the fix.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Bad Decision did not start as a company. It started as a complaint.
            A group of business owners who were sick of paying for garbage.
            Sick of dead emails. Sick of wasted money. Sick of bad decisions.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">How it started.</h2>
            <p>
              Three years ago, a small group of us were sitting in a room.
              We all ran different businesses. An agency. A freelance shop. A sales team.
              Different businesses, same problem. None of us could find good leads.
            </p>
            <p>
              We had all bought lists. We had all been burned. We had all watched our emails bounce.
              We had all wasted money on contacts that did not exist. We were angry.
              And when business owners get angry, they either quit or they build something.
            </p>
            <p>
              We chose to build. The idea was simple. Stop selling old lists.
              Go find real buyers right now. Test every email before you charge for it.
              If the email does not work, the customer does not pay. Period.
            </p>
            <p>
              Everyone we told said it could not be done. They said the testing would cost too much.
              They said customers would not believe the promise. They said we would go broke refunding credits.
              They were wrong on every count.
            </p>
          </div>
        </div>
      </section>

      {/* Why the name */}
      <section className="py-20 sm:py-24 bg-card border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-6">Why we are called Bad Decision.</h2>
          <div className="space-y-4 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
            <p>
              People ask us about the name all the time. They think it is a joke.
              They think we are being edgy or clever. We are not.
            </p>
            <p>
              We are called Bad Decision because that is what we help you avoid.
              Every bad lead is a bad decision. Every dead email list is a bad decision.
              Every dollar spent on contacts that do not exist is a bad decision.
            </p>
            <p>
              We have made those bad decisions ourselves. We bought the lists.
              We sent the emails. We watched them bounce. We lost the money.
              We know exactly how it feels because we lived it.
            </p>
            <p>
              So we built the opposite of a bad decision. We built a tool that only gives you
              what works. We built a promise that no other vendor will make.
              We built the thing we wished existed when we were losing money on garbage.
            </p>
            <p className="text-xl text-card-foreground font-semibold pt-4">
              When you use Bad Decision, you are making a good one.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10 text-center">What we believe.</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: 'Honest data beats fast data.', body: 'We would rather take five extra minutes and give you 40 real emails than rush and give you 100 dead ones. Speed means nothing if the data is garbage.' },
              { title: 'You should only pay for what works.', body: 'No other industry makes you pay for broken products. Lead vendors should not either. If the email does not work, you should not pay for it. That is just basic fairness.' },
              { title: 'Your time is worth more than your money.', body: 'You can make more money. You cannot make more time. Every hour you spend chasing dead leads is gone forever. We protect your time as fiercely as we protect your wallet.' },
              { title: 'Small businesses deserve good tools.', body: 'Big companies have teams of people to source leads. Small businesses have you. You deserve the same quality of data. You deserve tools that actually work. We built this for you.' },
            ].map((value, i) => (
              <div key={i} className="card-premium p-7">
                <h3 className="text-lg font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-4">
            We built this for you. Come see if we did it right.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            50 free leads. No credit card. No risk. Just a chance to see if we kept our promise.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-lg shadow-primary/30"
          >
            Get My 50 Free Leads
          </Link>
        </div>
      </section>
    </div>
  )
}
