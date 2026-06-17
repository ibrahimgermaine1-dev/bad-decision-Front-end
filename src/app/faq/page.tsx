'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  items: FAQItem[]
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    title: 'About Bad Decision',
    items: [
      {
        question: 'Why is it called Bad Decision?',
        answer: 'Because buying old email lists is a bad decision. Paying for contacts that bounce is a bad decision. Wasting your time on dead leads is a bad decision. We built this tool so you stop making bad decisions with your lead generation. We scan the live internet and verify every email. That is a good decision. The name is a reminder of what we help you avoid.',
      },
      {
        question: 'How is this different from other lead tools?',
        answer: 'Other tools sell you old lists. They do not test the emails. They do not care if half the list is dead. We do the opposite. We go find real buyers right now. We test every email before you pay. If the email does not work, you never see it. You only spend credits on contacts that can actually receive your message.',
      },
      {
        question: 'Who built this and why?',
        answer: 'A group of business owners who were sick of buying garbage leads. We ran agencies. We ran freelance shops. We ran sales teams. We all had the same problem. No one could find good leads. So we built the tool we wished existed. You can read the full story on our About page.',
      },
    ],
  },
  {
    title: 'How It Works',
    items: [
      {
        question: 'What exactly happens when I search?',
        answer: 'You type what you want. You pick a location. You hit search. Our system goes to the live internet and finds real businesses that match. It pulls their names, websites, decision makers, emails, phone numbers, and social links. Then it tests every email inbox. When it is done, you get a clean list of verified contacts.',
      },
      {
        question: 'How long does a search take?',
        answer: 'Usually a few minutes. It depends on how many results are out there. You can wait on the page or come back later. The system works in the background. When it is done, your leads will be waiting in your dashboard.',
      },
      {
        question: 'What types of businesses can I search for?',
        answer: 'Anything. Roofers. Dentists. Plumbers. Bakeries. Gyms. Agencies. Clinics. Stores. Restaurants. Lawyers. Accountants. If they exist on the internet, we can find them. Just type what you want and hit search.',
      },
      {
        question: 'Can I search in any country?',
        answer: 'Yes. You can search in any of 195 countries. You can filter by continent, country, and state or region. If you want roofers in Texas, you can find them. If you want bakeries in Lagos, you can find them. The world is yours.',
      },
    ],
  },
  {
    title: 'Emails and Testing',
    items: [
      {
        question: 'Are the emails really tested?',
        answer: 'Yes. Before we show you any email, we connect to the mail server and check if the inbox exists and can receive mail. If it cannot, you never see it. You only pay for emails that work. This is the whole point of what we built.',
      },
      {
        question: 'What happens if an email bounces anyway?',
        answer: 'You get your credits back. No questions. No forms. No waiting. You tell us it bounced and we refund the credits. We are that confident in our testing. If we are wrong, you do not pay for our mistake.',
      },
      {
        question: 'What is a catch-all email?',
        answer: 'Some mail servers say yes to every email address you ask about. That makes it hard to know if a specific person really has an inbox there. We flag those for you so you know. Pro plan users get catch-all detection so you can decide whether to take the risk.',
      },
      {
        question: 'Do you guarantee the email will land in the inbox?',
        answer: 'We guarantee the email can receive mail. We cannot guarantee it lands in the main inbox instead of spam. That depends on your email provider, your sender reputation, and your message. But we can guarantee the address is real and can receive mail. That is more than any other vendor will promise.',
      },
    ],
  },
  {
    title: 'Pricing and Credits',
    items: [
      {
        question: 'How many free leads do I get?',
        answer: 'You get 50 free leads the moment you sign up. No credit card. No catch. You can run real searches and get real contacts. If you like what you see, you can buy more. If you do not, you walk away having lost nothing.',
      },
      {
        question: 'What is a credit?',
        answer: 'A credit is what you spend to get a lead. Each verified contact costs a few credits. The cost depends on your plan. Free accounts pay 2 credits per lead. Paid accounts pay 1 to 3 credits depending on the plan. You always know the cost before you search.',
      },
      {
        question: 'Do credits expire?',
        answer: 'No. Credits you buy are yours forever. Use them today. Use them next year. Use them whenever you want. They do not disappear.',
      },
      {
        question: 'Can I cancel my plan?',
        answer: 'Yes. Cancel anytime. No contracts. No fees. Keep your credits. Keep your leads. Keep your collections. If you want to come back later, your account will be waiting.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We use Paystack for payments. They accept cards from around the world. If you are in Nigeria, you can pay in Naira. If you are anywhere else, you can pay in your local currency. The price adjusts based on where you are.',
      },
      {
        question: 'Do I need a plan to buy credits?',
        answer: 'No. You can buy credits one at a time without any plan. Buy what you need, when you need it. Some people never buy a plan. They just top up credits when they run out. That works fine.',
      },
    ],
  },
  {
    title: 'Account and Data',
    items: [
      {
        question: 'Is my data safe?',
        answer: 'Yes. We do not sell your data. We do not share your data. Your searches are private. Your leads are private. Your account is protected by secure login. We take your privacy seriously because we would want the same.',
      },
      {
        question: 'Can I export my leads?',
        answer: 'Yes. You can download your leads as a clean spreadsheet anytime. Phone numbers are protected so Excel does not mess them up. Emails are tested. Names are real. You can import them into any email tool or CRM.',
      },
      {
        question: 'Can I share my account with my team?',
        answer: 'Right now each account is for one person. If you need a team plan, contact us and we will work something out. We are building team features based on what people ask for.',
      },
      {
        question: 'What happens to my leads if I cancel?',
        answer: 'You keep them. Leads you have already downloaded are yours. Collections you have built are yours. We do not take them back. If you cancel, you just stop getting new credits. Everything you have earned stays yours.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggle = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`
    const newOpen = new Set(openItems)
    if (newOpen.has(key)) {
      newOpen.delete(key)
    } else {
      newOpen.add(key)
    }
    setOpenItems(newOpen)
  }

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">Questions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Everything you want to know.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            If your question is not here, email us at support@baddecision.ai.
            A real person will answer. Usually within a few hours.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {FAQ_SECTIONS.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">{section.title}</h2>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => {
                  const key = `${sectionIndex}-${itemIndex}`
                  const isOpen = openItems.has(key)
                  return (
                    <div
                      key={itemIndex}
                      className={`card-premium overflow-hidden transition-all ${
                        isOpen ? 'border-primary/30' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggle(sectionIndex, itemIndex)}
                        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
                      >
                        <span className="text-[15px] sm:text-base font-semibold text-foreground">{item.question}</span>
                        <svg
                          className={`w-5 h-5 flex-shrink-0 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                          <p className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We are real people and we answer fast. Email us or start a free account and ask inside the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-lg shadow-primary/30"
            >
              Contact Us
            </Link>
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-secondary border border-border hover:border-primary/50 text-card-foreground text-base font-semibold transition-all"
            >
              Get 50 Free Leads
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
