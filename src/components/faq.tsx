'use client'

/**
 * FAQ PAGE — Objection Killer
 * Accordion layout. Three sections: Data Quality, Coin Economy, Account Security.
 * No emojis. Direct-response copy.
 */
import { useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'

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
    title: 'Data Quality',
    items: [
      {
        question: 'How do you know the emails are real?',
        answer: 'We connect to the mail server directly. We ask the server if the inbox exists. If the server says no, we drop the contact. You never pay for a dead email.',
      },
      {
        question: 'What does "Guaranteed Inbox Test" mean?',
        answer: 'It means we connect to the mail server and verify the inbox is real. Not just that the domain exists. That the specific person at that company has a working inbox.',
      },
      {
        question: 'What happens when data is missing?',
        answer: 'If we cannot find a piece of information, we mark it as ABSENT. We never guess. We never fill in fake data. You see exactly what we found and what we did not.',
      },
      {
        question: 'How fresh is the data?',
        answer: 'We scan the live internet. Right now. Not last month. Not last year. When you search, our system goes out and finds what is real today.',
      },
    ],
  },
  {
    title: 'The Coin Economy',
    items: [
      {
        question: 'What are coins?',
        answer: 'Coins are how you pay for contacts. Each verified contact costs coins. The more verification we do, the more coins it costs. But you only pay when we find something real.',
      },
      {
        question: 'Do I pay for searches that find nothing?',
        answer: 'No. If our system finds zero contacts, you pay zero coins. You only pay when we deliver verified results.',
      },
      {
        question: 'Do I pay for the same contact twice?',
        answer: 'No. We remember every contact we ever found. If someone else already searched for the same business, you get that data for free. Zero coins.',
      },
      {
        question: 'How many coins does one contact cost?',
        answer: 'A basic contact costs 1 coin. A contact with a decision maker costs 2 coins. A contact with a guaranteed tested inbox costs 3 coins. You choose the level of verification.',
      },
    ],
  },
  {
    title: 'Account Security',
    items: [
      {
        question: 'How do you stop people from making free accounts over and over?',
        answer: 'When you sign up, we scan your device hardware. This creates a unique fingerprint. If someone tries to sign up again from the same device, we block it. One device. One free trial.',
      },
      {
        question: 'Can someone steal my coins?',
        answer: 'Your coins are stored on our secure servers. Not on your computer. Nobody can change your balance except our system after a verified payment.',
      },
      {
        question: 'Is my payment information safe?',
        answer: 'We use Paystack for all payments. Paystack is certified by the PCI Security Standards Council. We never see or store your card details.',
      },
    ],
  },
]

export function FAQPage() {
  const { setView } = useAppStore()
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggleItem = (key: string) => {
    setOpenIndex(openIndex === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-semibold text-[#0F172A]">Bad Decision AI</span>
          </button>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setView('signin')} className="border-[#E2E8F0]">Sign In</Button>
            <Button size="sm" onClick={() => setView('signup')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
            Frequently Asked Questions.
          </h1>
          <p className="mt-4 text-lg text-[#64748B]">Clear answers about our system.</p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">{section.title}</h2>
              <div className="space-y-0">
                {section.items.map((item, idx) => {
                  const key = `${section.title}-${idx}`
                  const isOpen = openIndex === key
                  return (
                    <div key={key} className="border-b border-[#E2E8F0]">
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full py-5 flex items-center justify-between text-left"
                      >
                        <span className="font-medium text-[#0F172A] pr-4">{item.question}</span>
                        <svg
                          className={`w-5 h-5 text-[#64748B] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="pb-5">
                          <p className="text-[#475569] leading-relaxed">{item.answer}</p>
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
    </div>
  )
}
