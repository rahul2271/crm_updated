// 'use client'
// import { useEffect, useState } from 'react'
// import Link from 'next/link'
// import { formatDate, conversionRate, formatCurrency, formatPercent } from '@/lib/utils'
// import { Badge } from '@/components/ui'

// interface EntryRow {
//   disease: string; ageGroup: string; city: string; state: string
//   consultationType: string; leadsCount: number; convertedCount: number; revenueGenerated?: number
// }
// interface Entry {
//   _id: string; date: string; totalLeadsGiven: number; entries: EntryRow[]; notes?: string
// }

// export default function HistoryPage() {
//   const [entries,  setEntries]  = useState<Entry[]>([])
//   const [loading,  setLoading]  = useState(true)
//   const [expanded, setExpanded] = useState<string | null>(null)

//   useEffect(() => {
//     fetch('/api/entries')
//       .then(r => r.json())
//       .then(d => setEntries(d.data ?? []))
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return (
//     <div className="flex justify-center py-24">
//       <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
//     </div>
//   )

//   return (
//     <div>
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">My history</h1>
//         <p className="text-sm text-gray-500 mt-1">{entries.length} daily submissions on record</p>
//       </div>

//       {entries.length === 0 ? (
//         <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
//           <p className="text-gray-400 mb-3">No entries yet.</p>
//           <Link href="/entry" className="text-sm text-brand-600 font-medium">Fill today's data →</Link>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {entries.map(entry => {
//             const leads     = entry.entries.reduce((s: number, e) => s + (e.leadsCount       ?? 0), 0)
//             const converted = entry.entries.reduce((s: number, e) => s + (e.convertedCount   ?? 0), 0)
//             const revenue   = entry.entries.reduce((s: number, e) => s + (e.revenueGenerated ?? 0), 0)  // null-safe
//             const isOpen    = expanded === entry._id

//             return (
//               <div key={entry._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                 {/* Header row */}
//                 <button onClick={() => setExpanded(isOpen ? null : entry._id)}
//                   className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">

//                   <div className="w-12 h-12 bg-brand-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
//                     <p className="text-sm font-bold text-brand-700">{entry.date.slice(8)}</p>
//                     <p className="text-xs text-brand-500">{new Date(entry.date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</p>
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <p className="font-semibold text-gray-900">{formatDate(entry.date + 'T00:00:00')}</p>
//                     <p className="text-sm text-gray-400 mt-0.5">
//                       {entry.entries.length} rows · {leads} leads worked · {converted} converted
//                     </p>
//                   </div>

//                   <div className="hidden md:flex items-center gap-5 flex-shrink-0 text-right">
//                     <div>
//                       <p className="text-xs text-gray-400">Given</p>
//                       <p className="font-bold text-gray-800">{entry.totalLeadsGiven}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-400">Conv. rate</p>
//                       <p className={`font-bold ${conversionRate(converted, leads) >= 50 ? 'text-green-600' : 'text-gray-600'}`}>
//                         {formatPercent(conversionRate(converted, leads))}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-400">Revenue</p>
//                       <p className="font-bold text-brand-700">{formatCurrency(revenue)}</p>
//                     </div>
//                   </div>

//                   <span className="text-gray-400 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
//                 </button>

//                 {/* Expanded detail */}
//                 {isOpen && (
//                   <div className="border-t border-gray-100 overflow-x-auto">
//                     <table className="w-full text-sm min-w-[720px]">
//                       <thead>
//                         <tr className="bg-gray-50">
//                           {['Disease', 'Age', 'City', 'State', 'Type', 'Patient', 'Admission', 'Leads', 'Converted', 'Rate', 'Revenue'].map(h => (
//                             <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5">{h}</th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {entry.entries.map((row, i) => (
//                           <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
//                             <td className="px-4 py-2.5 font-medium text-gray-800">{row.disease}</td>
//                             <td className="px-4 py-2.5 text-gray-600">{row.ageGroup} yrs</td>
//                             <td className="px-4 py-2.5 text-gray-600">{row.city}</td>
//                             <td className="px-4 py-2.5 text-gray-600">{row.state}</td>
//                             <td className="px-4 py-2.5">
//                               <Badge color={row.consultationType === 'online' ? 'blue' : 'yellow'}>
//                                 {row.consultationType === 'online' ? '💻 Online' : '🏥 Visit'}
//                               </Badge>
//                             </td>
//                             <td className="px-4 py-2.5 font-semibold text-gray-800">{row.leadsCount}</td>
//                             <td className="px-4 py-2.5 text-green-600 font-semibold">{row.convertedCount}</td>
//                             <td className="px-4 py-2.5 text-xs font-semibold text-gray-500">
//                               {formatPercent(conversionRate(row.convertedCount, row.leadsCount))}
//                             </td>
//                             <td className="px-4 py-2.5 font-semibold text-brand-700">
//                               {formatCurrency(row.revenueGenerated ?? 0)}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                       {/* Day total footer */}
//                       <tfoot>
//                         <tr className="border-t-2 border-gray-200 bg-gray-50">
//                           <td colSpan={7} className="px-4 py-2.5 text-xs font-bold text-gray-600 uppercase">Day total</td>
//                           <td className="px-4 py-2.5 font-bold text-gray-900">{leads}</td>
//                           <td className="px-4 py-2.5 font-bold text-green-600">{converted}</td>
//                           <td className="px-4 py-2.5 font-bold text-gray-500">{formatPercent(conversionRate(converted, leads))}</td>
//                           <td className="px-4 py-2.5 font-bold text-brand-700">{formatCurrency(revenue)}</td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                     {entry.notes && (
//                       <div className="px-5 py-3 border-t border-gray-50 bg-gray-50 text-xs text-gray-500">
//                         📝 {entry.notes}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }


'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, conversionRate, formatCurrency, formatPercent } from '@/lib/utils'
import { CONSULT_OPTIONS, PATIENT_TYPE_OPTIONS, ADMISSION_TYPE_OPTIONS } from '@/types'

interface EntryRow {
  disease: string; ageGroup: string; city: string; state: string
  consultationType: string; patientType?: string; admissionType?: string
  leadsCount: number; convertedCount: number; revenueGenerated?: number
}
interface Entry {
  _id: string; date: string; totalLeadsGiven: number; entries: EntryRow[]; notes?: string
}

function ConsultBadge({ type }: { type: string }) {
  const opt = CONSULT_OPTIONS.find(o => o.value === type)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {opt?.icon} {opt?.label ?? type}
    </span>
  )
}

function PatientBadge({ type }: { type?: string }) {
  if (!type) return null
  const opt = PATIENT_TYPE_OPTIONS.find(o => o.value === type)
  if (!opt) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${opt.color}`}>
      {opt.icon} {opt.label}
    </span>
  )
}

function AdmissionBadge({ type }: { type?: string | null }) {
  if (!type) return <span className="text-gray-300 text-xs">--</span>
  const opt = ADMISSION_TYPE_OPTIONS.find(o => o.value === type)
  if (!opt) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${opt.color}`}>
      {opt.icon} {opt.label}
    </span>
  )
}

export default function HistoryPage() {
  const [entries,  setEntries]  = useState<Entry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/entries').then(r => r.json()).then(d => setEntries(d.data ?? [])).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My history</h1>
        <p className="text-sm text-gray-500 mt-1">{entries.length} daily submissions on record</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 mb-3">No entries yet.</p>
          <Link href="/entry" className="text-sm text-brand-600 font-medium">Fill today&apos;s data →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const leads     = entry.entries.reduce((s: number, e) => s + (e.leadsCount       ?? 0), 0)
            const converted = entry.entries.reduce((s: number, e) => s + (e.convertedCount   ?? 0), 0)
            const revenue   = entry.entries.reduce((s: number, e) => s + (e.revenueGenerated ?? 0), 0)
            const isOpen    = expanded === entry._id

            return (
              <div key={entry._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : entry._id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-sm font-bold text-brand-700">{entry.date.slice(8)}</p>
                    <p className="text-xs text-brand-500">{new Date(entry.date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{formatDate(entry.date + 'T00:00:00')}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{entry.entries.length} rows · {leads} leads · {converted} converted</p>
                  </div>
                  <div className="hidden md:flex items-center gap-5 flex-shrink-0 text-right">
                    <div><p className="text-xs text-gray-400">Given</p><p className="font-bold text-gray-800">{entry.totalLeadsGiven}</p></div>
                    <div><p className="text-xs text-gray-400">Conv. rate</p><p className={`font-bold ${conversionRate(converted, leads) >= 50 ? 'text-green-600' : 'text-gray-600'}`}>{formatPercent(conversionRate(converted, leads))}</p></div>
                    <div><p className="text-xs text-gray-400">Revenue</p><p className="font-bold text-brand-700">{formatCurrency(revenue)}</p></div>
                  </div>
                  <span className="text-gray-400 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {/* Mobile card view */}
                    <div className="sm:hidden divide-y divide-gray-50">
                      {entry.entries.map((row, i) => (
                        <div key={i} className="px-4 py-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 text-sm">{row.disease}</p>
                            <ConsultBadge type={row.consultationType} />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <PatientBadge type={row.patientType} />
                            <AdmissionBadge type={row.admissionType} />
                            {(row as any).insuranceCompany && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-100 text-violet-700">
                                🏢 {(row as any).insuranceCompany}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>{row.ageGroup} yrs</span>
                            <span>{row.city}, {row.state}</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-700">Leads: <strong>{row.leadsCount}</strong></span>
                            <span className="text-green-600">Conv: <strong>{row.convertedCount}</strong></span>
                            <span className="text-gray-500">{formatPercent(conversionRate(row.convertedCount, row.leadsCount))}</span>
                            <span className="text-brand-700 font-semibold">{formatCurrency(row.revenueGenerated ?? 0)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="px-4 py-2.5 bg-gray-50 flex gap-4 text-xs font-bold text-gray-600">
                        <span>Total — Leads: {leads}</span>
                        <span className="text-green-600">Conv: {converted}</span>
                        <span className="text-brand-700">{formatCurrency(revenue)}</span>
                      </div>
                    </div>
                    {/* Desktop table view */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm min-w-[720px]">
                        <thead>
                          <tr className="bg-gray-50">
                            {['Disease', 'Age', 'City', 'State', 'Type', 'Patient', 'Admission', 'Insurance', 'Leads', 'Converted', 'Rate', 'Revenue'].map(h => (
                              <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {entry.entries.map((row, i) => (
                            <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                              <td className="px-4 py-2.5 font-medium text-gray-800">{row.disease}</td>
                              <td className="px-4 py-2.5 text-gray-600">{row.ageGroup} yrs</td>
                              <td className="px-4 py-2.5 text-gray-600">{row.city}</td>
                              <td className="px-4 py-2.5 text-gray-600">{row.state}</td>
                              <td className="px-4 py-2.5"><ConsultBadge type={row.consultationType} /></td>
                              <td className="px-4 py-2.5"><PatientBadge type={row.patientType} /></td>
                              <td className="px-4 py-2.5"><AdmissionBadge type={row.admissionType} /></td>
                              <td className="px-4 py-2.5 text-xs text-violet-700 font-medium">{(row as any).insuranceCompany ?? <span className="text-gray-300">--</span>}</td>
                              <td className="px-4 py-2.5 font-semibold text-gray-800">{row.leadsCount}</td>
                              <td className="px-4 py-2.5 text-green-600 font-semibold">{row.convertedCount}</td>
                              <td className="px-4 py-2.5 text-xs font-semibold text-gray-500">{formatPercent(conversionRate(row.convertedCount, row.leadsCount))}</td>
                              <td className="px-4 py-2.5 font-semibold text-brand-700">{formatCurrency(row.revenueGenerated ?? 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-200 bg-gray-50">
                            <td colSpan={8} className="px-4 py-2.5 text-xs font-bold text-gray-600 uppercase">Day total</td>
                            <td className="px-4 py-2.5 font-bold text-gray-900">{leads}</td>
                            <td className="px-4 py-2.5 font-bold text-green-600">{converted}</td>
                            <td className="px-4 py-2.5 font-bold text-gray-500">{formatPercent(conversionRate(converted, leads))}</td>
                            <td className="px-4 py-2.5 font-bold text-brand-700">{formatCurrency(revenue)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    {entry.notes && <div className="px-5 py-3 border-t border-gray-50 bg-gray-50 text-xs text-gray-500">📝 {entry.notes}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
