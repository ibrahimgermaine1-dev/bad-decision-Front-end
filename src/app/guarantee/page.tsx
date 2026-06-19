'use client'

import Link from 'next/link'

export default function GuaranteePage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            If the email bounces, <br className="hidden sm:block" /><span className="text-gradient-violet">you do not pay.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            That is not a marketing trick. That is how the system is built.
            Read this page carefully. It is the most important thing we will ever tell you.
          </p>
        </div>
      </section>

      {/* The Promise */}
      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-premium p-8 sm:p-10 bg-card border-primary/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-6">Our Promise To You</h2>
            <div className="space-y-4 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
              <p>
                Every email you get from us has been tested. We connected to the mail server.
                We checked if the inbox exists. We checked if it can receive mail. We checked if it is a real person.
              </p>
              <p>
                If we say an email works, it works. If it bounces, we made a mistake.
                And if we make a mistake, you get your credits back. Every single one.
                No questions. No forms. No waiting. You tell us it bounced, we refund the credits.
              </p>
              <p className="text-xl text-card-foreground font-semibold pt-2">
                You only pay for emails that actually reach a real inbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-20 sm:py-24 bg-card border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-8 text-center">Why this matters more than you think.</h2>
          <div className="space-y-6">
            <div className="card-premium p-6 sm:p-8">
              <h3 className="text-lg font-bold text-foreground mb-3">Dead emails kill your sender reputation.</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Every time you send an email and it bounces, your email provider notices.
                Gmail notices. Outlook notices. They mark you as a sender who sends to dead addresses.
                After enough bounces, your good emails start landing in spam. Even emails to people you know.
                One bad list can wreck your email for months. We make sure that never happens.
              </p>
            </div>
            <div className="card-premium p-6 sm:p-8">
              <h3 className="text-lg font-bold text-foreground mb-3">Dead emails waste your time.</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                How long does it take to write a good cold email? Ten minutes? Twenty?
                Now multiply that by 50 dead emails. You just wasted an entire afternoon on people who do not exist.
                Your time is worth more than that. Our time is worth more than that.
                Every email you get from us is a real chance to close a deal. Not a shot in the dark.
              </p>
            </div>
            <div className="card-premium p-6 sm:p-8">
              <h3 className="text-lg font-bold text-foreground mb-3">Dead emails cost you money you cannot get back.</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                When you buy a list from someone else, you pay for every email on it.
                The good ones and the dead ones. You are paying for garbage.
                With us, you only pay for emails that work. The dead ones never reach you.
                You never spend a credit on them. That money stays in your pocket.
                That is the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Test */}
      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">How we test every email.</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'We find the mail server.', body: 'Every email address lives on a mail server. We find that server. If there is no server, the email is dead. We drop it.' },
              { step: '2', title: 'We check if the inbox exists.', body: 'We ask the server if that specific inbox is real. If the server says no, the email is dead. We drop it.' },
              { step: '3', title: 'We check if it can receive mail.', body: 'Some inboxes exist but cannot receive messages. They are full or broken. We check. If it cannot receive, we drop it.' },
              { step: '4', title: 'We check for catch-all traps.', body: 'Some servers say yes to every email address you ask about. That is a trap. It means the email is probably fake. We flag it so you know.' },
              { step: '5', title: 'Only the survivors reach you.', body: 'If an email passes all four checks, it goes to your results. You pay for it. You send to it. It works. That is the promise.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-5 card-premium p-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-primary/30 flex items-center justify-center">
                  <span className="text-primary font-bold">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-4">
            No other lead vendor will make you this promise.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Ask them. Go ahead. Ask any other lead vendor if they test every email before you pay.
            Ask if they refund credits for bounces. They will change the subject. We will not.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-lg shadow-primary/30"
          >
            Get My 100 Free Tested Leads
          </Link>
        </div>
      </section>
    </div>
  )
}
