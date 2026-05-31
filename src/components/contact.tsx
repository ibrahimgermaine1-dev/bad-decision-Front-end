'use client'

/**
 * CONTACT PAGE — The Contact Gate
 * Split screen: Left = midnight navy with trust anchors, Right = white form
 * No dropdowns. Large clickable radio buttons. No emojis.
 */
import { useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const CATEGORIES = [
  { id: 'sales', label: 'Sales Question' },
  { id: 'support', label: 'Technical Support' },
  { id: 'billing', label: 'Billing Issue' },
  { id: 'other', label: 'Something Else' },
]

export function ContactPage() {
  const { setView } = useAppStore()
  const [category, setCategory] = useState('sales')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
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

      {/* Split Screen */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left: Midnight Navy */}
        <div className="bg-[#0B1120] p-10 md:p-16 md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Talk To Us.</h1>
          <p className="mt-4 text-[#94A3B8] text-lg leading-relaxed">
            We answer fast. Real humans. No bots. No runaround.
          </p>
          <div className="mt-12 space-y-8">
            {[
              { label: 'Response Time', value: 'Under 4 hours during business hours' },
              { label: 'Support Hours', value: 'Monday to Friday, 8am to 6pm WAT' },
              { label: 'Payment Issues', value: 'Priority handling. Always.' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wide">{item.label}</p>
                <p className="text-white font-medium mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: White Form */}
        <div className="bg-white p-10 md:p-16 md:w-1/2 flex flex-col justify-center">
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-[#0F172A]">Message Sent.</h2>
              <p className="mt-2 text-[#64748B]">We will get back to you fast.</p>
              <Button onClick={() => setView('landing')} variant="outline" className="mt-6">Back to Home</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Your Name</label>
                <Input placeholder="Full name" className="border-[#E2E8F0]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Email Address</label>
                <Input type="email" placeholder="you@company.com" className="border-[#E2E8F0]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-3">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all text-left ${
                        category === cat.id
                          ? 'border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]'
                          : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Message</label>
                <Textarea placeholder="Tell us what you need..." className="border-[#E2E8F0] min-h-[120px]" required />
              </div>
              <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-6 font-semibold text-base">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
