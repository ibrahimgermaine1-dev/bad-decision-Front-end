/**
 * Bad Decision AI — CSV Shield Export
 * Phone numbers wrapped in ="++[Number]" format
 * to prevent Excel/Sheets from stripping the + prefix
 * or converting to scientific notation.
 */

export interface ExportableLead {
  company_name: string
  website_url: string
  dm_name: string
  dm_position: string
  verified_email: string
  is_catchall: boolean
  linkedin: string
  instagram: string
  phone: string
  // Optional engine-specific fields
  ad_platform?: string
  address?: string
  aggregator_source?: string
  aggregator_url?: string
  platform?: string
  intent_text?: string
}

/**
 * Shield a phone number for CSV export.
 * Wraps in ="++[Number]" format so Excel doesn't mangle it.
 */
function shieldPhone(phone: string): string {
  if (!phone || phone === 'ABSENT') return 'ABSENT'
  const digits = phone.replace(/[^\d+]/g, '')
  if (!digits) return 'ABSENT'
  // If it already starts with +, use as-is; otherwise add +
  const withPlus = digits.startsWith('+') ? digits : `+${digits}`
  return `="++${withPlus.replace('+', '')}"`
}

/**
 * Convert ABSENT to empty string for cleaner CSV display
 */
function cleanAbsent(val: string | undefined): string {
  if (!val || val === 'ABSENT') return ''
  return val
}

/**
 * Escape a CSV field (handle commas, quotes, newlines)
 */
function escapeCsvField(val: string): string {
  if (!val) return ''
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

/**
 * Export leads to CSV with Shield-protected phone numbers.
 * Returns the CSV string ready for download.
 */
export function exportLeadsToCsv(leads: ExportableLead[], engineType?: string): string {
  // Choose headers based on engine type
  const baseHeaders = [
    'Company Name',
    'Website URL',
    'Decision Maker',
    'Position',
    'Email',
    'Catch-All',
    'LinkedIn',
    'Instagram',
    'Phone',
  ]

  let extraHeaders: string[] = []
  if (engineType === 'ads_intent') extraHeaders = ['Ad Platform']
  if (engineType === 'smb_maps') extraHeaders = ['Address']
  if (engineType === 'web_absent') extraHeaders = ['Aggregator Source', 'Aggregator URL']
  if (engineType === 'social_intent') extraHeaders = ['Platform', 'Intent Text']

  const headers = [...baseHeaders, ...extraHeaders]

  const rows = leads.map((lead) => {
    const baseRow = [
      cleanAbsent(lead.company_name),
      cleanAbsent(lead.website_url),
      cleanAbsent(lead.dm_name),
      cleanAbsent(lead.dm_position),
      cleanAbsent(lead.verified_email),
      lead.is_catchall ? 'Yes' : 'No',
      cleanAbsent(lead.linkedin),
      cleanAbsent(lead.instagram),
      shieldPhone(lead.phone), // CSV SHIELD applied here
    ]

    let extraRow: string[] = []
    if (engineType === 'ads_intent') extraRow = [cleanAbsent(lead.ad_platform)]
    if (engineType === 'smb_maps') extraRow = [cleanAbsent(lead.address)]
    if (engineType === 'web_absent') extraRow = [cleanAbsent(lead.aggregator_source), cleanAbsent(lead.aggregator_url)]
    if (engineType === 'social_intent') extraRow = [cleanAbsent(lead.platform), cleanAbsent(lead.intent_text)]

    return [...baseRow, ...extraRow].map(escapeCsvField).join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * Trigger a CSV file download in the browser
 */
export function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
