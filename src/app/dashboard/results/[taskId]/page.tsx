'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  Share2,
  Target,
  MapPin,
  Globe,
  MessageSquare,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { LeadTable } from '@/components/lead-table'
import type { Lead } from '@/lib/api'

const engineConfig = {
  ads_intent: { name: 'Ads Intent', icon: <Target className="w-4 h-4" />, color: 'var(--color-orange)' },
  smb_maps: { name: 'SMB Maps', icon: <MapPin className="w-4 h-4" />, color: 'var(--color-blue)' },
  web_absent: { name: 'Web Absent', icon: <Globe className="w-4 h-4" />, color: 'var(--color-red)' },
  social_intent: { name: 'Social Intent', icon: <MessageSquare className="w-4 h-4" />, color: 'var(--color-green)' },
}

type EngineType = keyof typeof engineConfig

// Mock data
const mockLeads: Lead[] = [
  { id: '1', name: 'Sunrise Bakery', email: 'hello@sunrisebakery.com', phone: '+234 801 234 5678', website: 'https://sunrisebakery.com', address: '45 Admiralty Way, Lagos', category: 'Restaurant', engine: 'smb_maps', verified: true },
  { id: '2', name: 'Metro Dental Clinic', email: 'info@metrodental.com', phone: '+234 802 345 6789', website: 'https://metrodental.com', address: '12 Allen Avenue, Lagos', category: 'Healthcare', engine: 'ads_intent', verified: true },
  { id: '3', name: 'Quick Print Solutions', email: 'quickprint@gmail.com', phone: '+234 803 456 7890', website: undefined, address: '78 Awolowo Road, Lagos', category: 'Printing', engine: 'web_absent', verified: false },
  { id: '4', name: 'TechHub Consulting', email: 'contact@techhub.ng', phone: '+234 804 567 8901', website: 'https://techhub.ng', address: '3 Isaac John St, Lagos', category: 'IT Services', engine: 'social_intent', verified: true },
  { id: '5', name: 'Green Valley Farms', email: 'farms@greenvalley.com', phone: undefined, website: undefined, address: 'Ibadan Expressway', category: 'Agriculture', engine: 'web_absent', verified: false },
  { id: '6', name: 'Peak Fitness Gym', email: 'peakfitness@gmail.com', phone: '+234 805 678 9012', website: 'https://peakfitness.com', address: '15 Toyin Street, Lagos', category: 'Fitness', engine: 'ads_intent', verified: true },
  { id: '7', name: 'Crystal Clear Optics', email: 'info@crystaloptics.ng', phone: '+234 806 789 0123', website: undefined, address: '22 Marina Road, Lagos', category: 'Healthcare', engine: 'smb_maps', verified: true },
  { id: '8', name: 'Smooth Auto Repairs', email: 'smoothauto@yahoo.com', phone: '+234 807 890 1234', website: undefined, address: '9 Mechanic Village, Abuja', category: 'Automotive', engine: 'web_absent', verified: false },
  { id: '9', name: 'Digital Dreams Studio', email: 'hello@digitaldreams.ng', phone: '+234 808 901 2345', website: 'https://digitaldreams.ng', address: '5 Broad Street, Lagos', category: 'Design', engine: 'social_intent', verified: true },
  { id: '10', name: 'Royal Clean Services', email: 'royalclean@gmail.com', phone: '+234 809 012 3456', website: undefined, address: '33 Opebi Road, Lagos', category: 'Cleaning', engine: 'smb_maps', verified: false },
  { id: '11', name: 'Apex Law Chambers', email: 'info@apexlaw.com', phone: '+234 810 123 4567', website: 'https://apexlaw.com', address: '1 Marina, Lagos', category: 'Legal', engine: 'ads_intent', verified: true },
  { id: '12', name: 'Fresh Mart Groceries', email: 'freshmart@yahoo.com', phone: '+234 811 234 5678', website: undefined, address: '7 Allen Avenue, Lagos', category: 'Retail', engine: 'web_absent', verified: false },
]

export default function ResultsPage() {
  const params = useParams()
  const taskId = params?.taskId as string
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [taskInfo, setTaskInfo] = useState({
    query: 'Restaurants in Lagos',
    engine: 'smb_maps' as EngineType,
    status: 'completed',
    leadCount: 12,
    location: 'Lagos, Nigeria',
    date: '2 hours ago',
    coinsUsed: 8,
  })

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLeads(mockLeads)
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [taskId])

  const engine = engineConfig[taskInfo.engine]
  const verifiedCount = leads.filter(l => l.verified).length
  const withWebsite = leads.filter(l => l.website).length

  return (
    <div className="min-h-screen bg-[var(--color-midnight)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${engine.color}10`, color: engine.color }}
                >
                  {engine.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {taskInfo.query}
                  </h1>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {taskInfo.location} · {taskInfo.date}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </motion.button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <ResultStat label="Total Leads" value={taskInfo.leadCount} icon={<CheckCircle2 className="w-4 h-4" />} color="var(--color-accent)" />
            <ResultStat label="Verified" value={verifiedCount} icon={<CheckCircle2 className="w-4 h-4" />} color="var(--color-green)" />
            <ResultStat label="With Website" value={withWebsite} icon={<Globe className="w-4 h-4" />} color="var(--color-blue)" />
            <ResultStat label="Coins Used" value={taskInfo.coinsUsed} icon={<Clock className="w-4 h-4" />} color="var(--color-coin)" />
          </div>
        </motion.div>

        {/* Lead Table */}
        <LeadTable leads={leads} engine={taskInfo.engine} isLoading={isLoading} />
      </div>
    </div>
  )
}

function ResultStat({ label, value, icon, color }: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}10`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">{value}</p>
        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}
