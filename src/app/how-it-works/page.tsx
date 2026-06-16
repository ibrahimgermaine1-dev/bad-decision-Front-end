'use client'

import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="bg-[#08080C]">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
            <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">How It Works</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F5F7] mb-6 leading-tight">
            From search to closed deal in <span className="text-gradient-violet">four steps.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A8A8B8] max-w-2xl mx-auto leading-relaxed">
            You do not need to learn anything new. You do not need to install anything.
            You just type what you want and we go find it. Here is exactly what happens.
          </p>
        </div>
      </section>

      {/* Step 1 */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-white">01</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-4">Tell us who you want to reach.</h2>
              <div className="space-y-4 text-[15px] sm:text-base text-[#A8A8B8] leading-relaxed">
                <p>
                  This is the easiest part. You open your dashboard. You see a search bar.
                  You type what you want. That is it. No forms. No filters you do not understand. No setup wizard.
                </p>
                <p>
                  Want roofers in Dallas? Type "roofers in Dallas." Want bakeries in Lagos?
                  Type "bakeries in Lagos." Want dentists in Toronto who run Facebook ads?
                  Type "dentists in Toronto" and pick the ads engine. The system knows what you mean.
                </p>
                <p>
                  You also pick where you want to search. Choose a continent. Choose a country.
                  Choose a state or region. You can search the whole world if you want.
                  Or you can search one neighborhood. Up to you.
                </p>
                <p>
                  Most people overthink this step. Do not. Type the first thing that comes to mind.
                  You can always run another search later. The system is fast. You will have results before you finish your coffee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-[#25252F]"></div></div>

      {/* Step 2 */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-white">02</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-4">We scan the live internet for real buyers.</h2>
              <div className="space-y-4 text-[15px] sm:text-base text-[#A8A8B8] leading-relaxed">
                <p>
                  The moment you hit search, the system goes to work. It does not look in an old database.
                  It does not pull from a list someone sold us three years ago. It goes to the live internet.
                  Right now. Today.
                </p>
                <p>
                  Depending on which engine you picked, it does different things.
                  If you picked Companies Running Ads, it looks for businesses spending money on ads right now.
                  If you picked Local Businesses, it looks for shops and offices with real addresses.
                  If you picked Businesses Without Websites, it looks for companies that need a website built.
                  If you picked People Asking For Help, it looks for people posting online who need what you sell.
                </p>
                <p>
                  For each business it finds, it pulls everything it can. The company name. The website.
                  The owner or decision maker. Their job title. Their email. Their phone number.
                  Their LinkedIn. Their Instagram. Everything that is public.
                </p>
                <p>
                  This takes a few minutes. You will see a progress bar. You can wait on the page
                  or come back later. When it is done, you move to step three.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-[#25252F]"></div></div>

      {/* Step 3 */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-white">03</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-4">We test every email inbox before you pay.</h2>
              <div className="space-y-4 text-[15px] sm:text-base text-[#A8A8B8] leading-relaxed">
                <p>
                  This is the part that makes us different from everyone else.
                  Every other lead vendor will sell you an email and hope it works.
                  We do not hope. We check.
                </p>
                <p>
                  Before we show you any email, we connect to the mail server.
                  We ask if that inbox exists. We ask if it can receive mail.
                  We ask if it is a real person or a catch-all that eats every message sent to it.
                  If the email fails any of those checks, you never see it.
                </p>
                <p>
                  Why does this matter? Because a dead email is a wasted email.
                  If you send your pitch to a dead inbox, it bounces.
                  Your sender reputation drops. Your next email is more likely to land in spam.
                  Dead emails do not just waste your money. They hurt your whole email game.
                </p>
                <p>
                  When you get a lead from us, you know the email works.
                  You can send your pitch with confidence. You know it will land.
                  You know a real person will see it. That is worth more than any list of names.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-[#25252F]"></div></div>

      {/* Step 4 */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-white">04</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-4">You get verified contacts ready to close.</h2>
              <div className="space-y-4 text-[15px] sm:text-base text-[#A8A8B8] leading-relaxed">
                <p>
                  When the search is done, you get a clean list of leads.
                  Each lead has the company name. The website. The decision maker and their title.
                  Their tested email. Their phone. Their social links. Everything you need to reach out.
                </p>
                <p>
                  You can look at them on the screen. You can click any lead to see all the details.
                  You can save them to your collections for later. Or you can download them as a spreadsheet
                  and import them into your email tool right away.
                </p>
                <p>
                  The spreadsheet is clean. Every field is labeled. Phone numbers are protected
                  so Excel does not mess them up. Emails are tested. Names are real.
                  You will not find a better list anywhere.
                </p>
                <p>
                  From here, what you do is up to you. Send a cold email. Make a cold call.
                  Send a LinkedIn message. Walk into their office if you want.
                  The lead is yours. The contact is real. The rest is your skill.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-[#0E0E14] border-t border-[#25252F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F7] mb-4">
            Ready to try it yourself?
          </h2>
          <p className="text-lg text-[#A8A8B8] mb-8">
            You get 50 free leads the moment you sign up. See step one through step four with your own eyes.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-base font-semibold transition-all shadow-lg shadow-[#7C5CFC]/30"
          >
            Get My 50 Free Leads
          </Link>
        </div>
      </section>
    </div>
  )
}
