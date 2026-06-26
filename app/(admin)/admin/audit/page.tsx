'use client'
import { useState, useEffect } from 'react'
import { format, subDays, startOfMonth } from 'date-fns'
import { Shield, Clock, CalendarX, CheckCircle, AlertTriangle, Users, Filter, ChevronDown, ChevronUp } from 'lucide-react'

const today = new Date()
const PRESETS = [
  { label: 'Today',        from: format(today,'yyyy-MM-dd'),                to: format(today,'yyyy-MM-dd') },
  { label: 'Last 7 days',  from: format(subDays(today,6),'yyyy-MM-dd'),     to: format(today,'yyyy-MM-dd') },
  { label: 'Last 30 days', from: format(subDays(today,29),'yyyy-MM-dd'),    to: format(today,'yyyy-MM-dd') },
  { label: 'This month',   from: format(startOfMonth(today),'yyyy-MM-dd'),  to: format(today,'yyyy-MM-dd') },
  { label: 'All time',     from: '',                                         to: '' },
]

const IST_OFFSET = 5.5 * 60 * 60 * 1000

function toIST(d: string | Date) {
  const dt = new Date(d)
  return new Date(dt.getTime() + IST_OFFSET)
}

function fmtIST(d: string | Date) {
  const ist = toIST(d)
  return ist.toISOString().replace('T', ' ').slice(0, 19) + ' IST'
}

function fmtTime(d: string | Date) {
  const ist = toIST(d)
  const h = String(ist.getUTCHours()).padStart(2,'0')
  const m = String(ist.getUTCMinutes()).padStart(2,'0')
  return `${h}:${m} IST`
}

type LogEntry = {
  action: 'first_submit' | 'update'
  timestamp: string
  isLate: boolean
  isBackdate: boolean
  submittedOn: string
}

type AuditEntry = {
  _id: string
  date: string
  telecallerId: { _id: string; name: string; email: string }
  totalLeadsGiven: number
  submissionLog: LogEntry[]
  createdAt: string
  updatedAt: string
}

type Summary = {
  totalEntries: number
  lateEntries: number
  backdateEntries: number
  onTimeEntries: number
}

function StatusPill({ log }: { log: LogEntry[] }) {
  if (!log || log.length === 0)
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">No log</span>
  const hasLate     = log.some(l => l.isLate)
  const hasBackdate = log.some(l => l.isBackdate)
  if (hasBackdate)
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">📅 Backdated</span>
  if (hasLate)
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">⏰ Late</span>
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">✅ On time</span>
}

function LogRow({ l, i }: { l: LogEntry; i: number }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg text-xs ${
      l.isBackdate ? 'bg-orange-50 border border-orange-100' :
      l.isLate     ? 'bg-red-50 border border-red-100'      :
      'bg-green-50 border border-green-100'
    }`}>
      <span className="font-mono font-semibold text-gray-500">#{i + 1}</span>
      <span className={`px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${
        l.action === 'first_submit' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
      }`}>{l.action === 'first_submit' ? 'First submit' : 'Update'}</span>
      <span className="font-medium text-gray-700">{fmtIST(l.timestamp)}</span>
      <span className="text-gray-400">·</span>
      <span className="text-gray-500">at {fmtTime(l.timestamp)}</span>
      {l.isLate && (
        <span className="ml-auto flex items-center gap-1 text-red-600 font-semibold">
          <AlertTriangle size={11} /> Late
        </span>
      )}
      {l.isBackdate && (
        <span className="ml-auto flex items-center gap-1 text-orange-600 font-semibold">
          <CalendarX size={11} /> Backdated (submitted on {l.submittedOn})
        </span>
      )}
      {!l.isLate && !l.isBackdate && (
        <span className="ml-auto flex items-center gap-1 text-green-600 font-semibold">
          <CheckCircle size={11} /> On time
        </span>
      )}
    </div>
  )
}

export default function AuditPage() {
  const [dateFrom,    setDateFrom]    = useState(format(subDays(today,29),'yyyy-MM-dd'))
  const [dateTo,      setDateTo]      = useState(format(today,'yyyy-MM-dd'))
  const [activePreset,setActivePreset]= useState('Last 30 days')
  const [telecallers, setTelecallers] = useState<{_id:string;name:string}[]>([])
  const [tcFilter,    setTcFilter]    = useState('')
  const [lateOnly,    setLateOnly]    = useState(false)
  const [backdateOnly,setBackdateOnly]= useState(false)
  const [entries,     setEntries]     = useState<AuditEntry[]>([])
  const [summary,     setSummary]     = useState<Summary | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [expanded,    setExpanded]    = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/telecallers').then(r => r.json()).then(d => setTelecallers(d.data ?? []))
    fetchAudit()
  }, [])

  function fetchAudit(from = dateFrom, to = dateTo, tc = tcFilter, late = lateOnly, backdate = backdateOnly) {
    setLoading(true)
    const qs = new URLSearchParams()
    if (from) qs.set('dateFrom', from)
    if (to)   qs.set('dateTo', to)
    if (tc)   qs.set('telecallerId', tc)
    if (late)     qs.set('lateOnly', 'true')
    if (backdate) qs.set('backdateOnly', 'true')
    fetch(`/api/audit?${qs.toString()}`)
      .then(r => r.json())
      .then(d => {
        setEntries(d.data ?? [])
        setSummary(d.summary ?? null)
      })
      .finally(() => setLoading(false))
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setActivePreset(p.label)
    setDateFrom(p.from)
    setDateTo(p.to)
    fetchAudit(p.from, p.to)
  }

  function toggleRow(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Submission Audit</h1>
          <p className="text-sm text-gray-500">Surveillance of telecaller entry timing — late & backdated flagged</p>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total entries', value: summary.totalEntries, icon: <Users size={16} />, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
            { label: 'On time',       value: summary.onTimeEntries, icon: <CheckCircle size={16} />, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
            { label: 'Late (>8 PM)',  value: summary.lateEntries,  icon: <Clock size={16} />,        color: 'text-red-700',   bg: 'bg-red-50 border-red-200'   },
            { label: 'Backdated',     value: summary.backdateEntries, icon: <CalendarX size={16} />, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <div className={`flex items-center gap-2 mb-1 ${s.color}`}>{s.icon}<p className="text-xs font-semibold uppercase tracking-wide">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-600">Filters</p>
        </div>
        {/* Date presets */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap ${activePreset === p.label ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {p.label}
            </button>
          ))}
        </div>
        {/* Custom date + filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setActivePreset('Custom') }}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 flex-1 min-w-[130px]" />
          <span className="text-gray-400 text-xs">–</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setActivePreset('Custom') }}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 flex-1 min-w-[130px]" />
          <select value={tcFilter} onChange={e => setTcFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 flex-1 min-w-[150px]">
            <option value="">All telecallers</option>
            {telecallers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-red-600 font-medium cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={lateOnly} onChange={e => setLateOnly(e.target.checked)} className="rounded" />
            Late only
          </label>
          <label className="flex items-center gap-1.5 text-sm text-orange-600 font-medium cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={backdateOnly} onChange={e => setBackdateOnly(e.target.checked)} className="rounded" />
            Backdated only
          </label>
          <button onClick={() => fetchAudit()}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Apply
          </button>
        </div>
      </div>

      {/* Audit log table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-14 text-center">
          <p className="text-3xl mb-3">🛡️</p>
          <p className="font-semibold text-gray-700">No entries found</p>
          <p className="text-sm text-gray-400 mt-1">Adjust filters or date range to see audit records</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const tc        = entry.telecallerId
            const log       = entry.submissionLog ?? []
            const hasLate   = log.some(l => l.isLate)
            const hasBack   = log.some(l => l.isBackdate)
            const isOpen    = !!expanded[entry._id]
            const firstLog  = log[0]
            const lastLog   = log[log.length - 1]

            return (
              <div key={entry._id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden ${hasBack ? 'border-orange-200' : hasLate ? 'border-red-200' : 'border-gray-100'}`}>

                {/* Row header */}
                <button type="button" onClick={() => toggleRow(entry._id)}
                  className="w-full flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">

                  {/* Left: status pill + date */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusPill log={log} />
                    <span className="font-mono text-sm font-semibold text-gray-700">{entry.date}</span>
                  </div>

                  {/* Telecaller */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                      {tc?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{tc?.name ?? 'Unknown'}</span>
                    <span className="text-xs text-gray-400 hidden sm:inline">{tc?.email}</span>
                  </div>

                  {/* Submission times */}
                  <div className="flex-1 min-w-0">
                    {firstLog && (
                      <p className="text-xs text-gray-500 truncate">
                        First: <span className="font-medium text-gray-700">{fmtIST(firstLog.timestamp)}</span>
                        {log.length > 1 && <span className="ml-2 text-gray-400">· {log.length - 1} update{log.length > 2 ? 's' : ''}</span>}
                      </p>
                    )}
                    {lastLog && log.length > 1 && (
                      <p className="text-xs text-gray-400 truncate">Last: {fmtIST(lastLog.timestamp)}</p>
                    )}
                    {log.length === 0 && <p className="text-xs text-gray-300 italic">No submission log (legacy entry)</p>}
                  </div>

                  {/* Flags */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasLate && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                        <AlertTriangle size={12} /> Late
                      </span>
                    )}
                    {hasBack && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                        <CalendarX size={12} /> Backdated
                      </span>
                    )}
                  </div>

                  {isOpen ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
                </button>

                {/* Expanded log detail */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Submission log</p>
                    {log.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No log available — entry predates audit feature</p>
                    ) : (
                      log.map((l, i) => <LogRow key={i} l={l} i={i} />)
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>Entry date: <strong className="text-gray-600">{entry.date}</strong></span>
                      <span>Leads given: <strong className="text-gray-600">{entry.totalLeadsGiven}</strong></span>
                      <span>Log entries: <strong className="text-gray-600">{log.length}</strong></span>
                      <span>Created: <strong className="text-gray-600">{fmtIST(entry.createdAt)}</strong></span>
                      <span>Last updated: <strong className="text-gray-600">{fmtIST(entry.updatedAt)}</strong></span>
                    </div>
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
