// 'use client'
// import { useEffect, useState } from 'react'
// import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
// import { StatCard, Card } from '@/components/ui'
// import { formatNumber, formatPercent, formatCurrency } from '@/lib/utils'
// import { CONSULT_OPTIONS, PATIENT_TYPE_OPTIONS, ADMISSION_TYPE_OPTIONS } from '@/types'
// import { Phone, TrendingUp, Users, DollarSign, BarChart2 } from 'lucide-react'
// import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'

// const COLORS = ['#0d9488','#14b8a6','#2dd4bf','#5eead4','#99f6e0','#0f766e','#134e4a','#0891b2']
// const today = new Date()

// const PRESETS = [
//   { label: 'Today',        from: format(today,'yyyy-MM-dd'),                                    to: format(today,'yyyy-MM-dd') },
//   { label: 'Yesterday',    from: format(subDays(today,1),'yyyy-MM-dd'),                         to: format(subDays(today,1),'yyyy-MM-dd') },
//   { label: 'This week',    from: format(startOfWeek(today,{weekStartsOn:1}),'yyyy-MM-dd'),       to: format(today,'yyyy-MM-dd') },
//   { label: 'This month',   from: format(startOfMonth(today),'yyyy-MM-dd'),                      to: format(today,'yyyy-MM-dd') },
//   { label: 'Last 30 days', from: format(subDays(today,29),'yyyy-MM-dd'),                        to: format(today,'yyyy-MM-dd') },
//   { label: 'All time',     from: '',                                                             to: '' },
// ]

// export default function AdminDashboard() {
//   const [activePreset, setActivePreset] = useState('All time')
//   const [dateFrom,     setDateFrom]     = useState('')
//   const [dateTo,       setDateTo]       = useState('')
//   const [overview,     setOverview]     = useState<any>(null)
//   const [diseases,     setDiseases]     = useState<any[]>([])
//   const [trend,        setTrend]        = useState<any[]>([])
//   const [consult,      setConsult]      = useState<any[]>([])
//   const [loading,      setLoading]      = useState(true)

//   function buildQS(from: string, to: string) {
//     const p = new URLSearchParams()
//     if (from) p.set('dateFrom', from)
//     if (to)   p.set('dateTo', to)
//     return p.toString()
//   }

//   function fetchAll(from = dateFrom, to = dateTo) {
//     setLoading(true)
//     const qs = buildQS(from, to)
//     // For trend, use the selected range or last 30 days as fallback
//     const trendFrom = from || format(subDays(today, 29), 'yyyy-MM-dd')
//     const trendQs   = buildQS(trendFrom, to || format(today, 'yyyy-MM-dd'))
//     Promise.all([
//       fetch(`/api/analytics?type=overview&${qs}`).then(r => r.json()),
//       fetch(`/api/analytics?type=disease&${qs}`).then(r => r.json()),
//       fetch(`/api/analytics?type=trend&${trendQs}`).then(r => r.json()),
//       fetch(`/api/analytics?type=consultationType&${qs}`).then(r => r.json()),
//     ]).then(([ov, dis, tr, ct]) => {
//       setOverview(ov.data)
//       setDiseases((dis.data ?? []).slice(0, 8))
//       setTrend(tr.data ?? [])
//       setConsult(ct.data ?? [])
//     }).finally(() => setLoading(false))
//   }

//   useEffect(() => { fetchAll() }, []) // eslint-disable-line

//   function applyPreset(p: typeof PRESETS[0]) {
//     setActivePreset(p.label)
//     setDateFrom(p.from)
//     setDateTo(p.to)
//     fetchAll(p.from, p.to)
//   }

//   return (
//     <div>
//       <div className="mb-5">
//         <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
//         <p className="text-sm text-gray-500 mt-1">Performance summary — use the filters below to narrow the date range</p>
//       </div>

//       {/* ── Date filter bar ── */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
//         <div className="flex flex-wrap items-center gap-2">
//           {PRESETS.map(p => (
//             <button key={p.label} onClick={() => applyPreset(p)}
//               className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${activePreset === p.label ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
//               {p.label}
//             </button>
//           ))}
//           <div className="flex items-center gap-2 ml-2">
//             <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setActivePreset('Custom') }}
//               className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
//             <span className="text-gray-400 text-xs">to</span>
//             <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setActivePreset('Custom') }}
//               className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
//             <button onClick={() => fetchAll()}
//               className="text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all flex items-center gap-1.5">
//               {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />}
//               Apply
//             </button>
//           </div>
//         </div>
//         {(dateFrom || dateTo) && activePreset !== 'All time' && (
//           <p className="text-xs text-gray-400 mt-2">
//             Showing: {dateFrom || 'all'} → {dateTo || 'today'} &nbsp;·&nbsp;
//             <button onClick={() => applyPreset(PRESETS[PRESETS.length - 1])} className="text-brand-600 hover:underline">Clear</button>
//           </p>
//         )}
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center py-20">
//           <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
//         </div>
//       ) : (
//         <>
//           {/* KPIs */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//             <StatCard label="Total leads given" value={formatNumber(overview?.totalLeadsGiven ?? 0)} sub="assigned to team"       icon={<Phone size={18}/>}      color="teal"   />
//             <StatCard label="Leads worked"      value={formatNumber(overview?.totalLeads ?? 0)}      sub="across all rows"        icon={<Users size={18}/>}      color="blue"   />
//             <StatCard label="Converted"         value={formatNumber(overview?.totalConverted ?? 0)}  sub={`${formatPercent(overview?.conversionRate ?? 0)} rate`} icon={<TrendingUp size={18}/>} color="green" />
//             <StatCard label="Total revenue"     value={formatCurrency(overview?.totalRevenue ?? 0)}  sub="from all conversions"   icon={<DollarSign size={18}/>} color="purple" />
//           </div>
//           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//             <StatCard label="Avg rev / conv"     value={formatCurrency(overview?.avgRevenuePerConversion ?? 0)} sub="per converted lead" icon={<BarChart2 size={18}/>} color="orange" />
//             <StatCard label="Active telecallers" value={overview?.activeTelecallers ?? 0}                       sub="team members"       icon={<Users size={18}/>}    color="teal"   />
//           </div>

//           {/* Consultation split — all 4 types */}
//           {consult.length > 0 && (
//             <div className={`grid gap-4 mb-6 ${consult.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
//               {consult.map((c: any) => {
//                 const opt = CONSULT_OPTIONS.find(o => o.value === c.consultationType)
//                 const bg  = opt?.value==='online'?'bg-blue-50 border-blue-100':opt?.value==='hospital'?'bg-orange-50 border-orange-100':opt?.value==='whatsapp'?'bg-green-50 border-green-100':'bg-purple-50 border-purple-100'
//                 const rev = opt?.value==='online'?'text-blue-700':opt?.value==='hospital'?'text-orange-700':opt?.value==='whatsapp'?'text-green-700':'text-purple-700'
//                 return (
//                   <div key={c.consultationType} className={`rounded-xl border p-4 flex items-center justify-between ${bg}`}>
//                     <div>
//                       <p className="font-semibold text-sm text-gray-800">{opt?.icon} {opt?.label ?? c.consultationType}</p>
//                       <p className="text-xs text-gray-500 mt-0.5">{formatNumber(c.totalLeads)} leads · {c.totalConverted} converted</p>
//                     </div>
//                     <p className={`text-xl font-bold ${rev}`}>{formatCurrency(c.totalRevenue)}</p>
//                   </div>
//                 )
//               })}
//             </div>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//             {/* Revenue trend */}
//             <Card title="Revenue & leads trend">
//               <div className="p-4">
//                 {trend.length === 0
//                   ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
//                   : <ResponsiveContainer width="100%" height={220}>
//                       <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                         <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={d => d.slice(5)} />
//                         <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
//                         <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} />
//                         <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0' }}
//                           formatter={(v: any, name: string) => [name === 'Revenue' ? formatCurrency(v) : v, name]} />
//                         <Legend wrapperStyle={{ fontSize: 12 }} />
//                         <Line yAxisId="l" type="monotone" dataKey="totalRevenue"   name="Revenue"   stroke="#0d9488" strokeWidth={2} dot={false} />
//                         <Line yAxisId="r" type="monotone" dataKey="totalLeads"     name="Leads"     stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
//                         <Line yAxisId="r" type="monotone" dataKey="totalConverted" name="Converted" stroke="#5eead4" strokeWidth={1.5} dot={false} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                 }
//               </div>
//             </Card>

//             {/* Disease pie */}
//             <Card title="Disease distribution" subtitle="By lead volume">
//               <div className="p-4">
//                 {diseases.length === 0
//                   ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
//                   : <ResponsiveContainer width="100%" height={220}>
//                       <PieChart>
//                         <Pie data={diseases} dataKey="totalLeads" nameKey="disease" cx="50%" cy="50%" outerRadius={80}
//                           label={({ disease, percent }: any) => `${disease.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
//                           {diseases.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//                         </Pie>
//                         <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
//                           formatter={(v: any, _: any, props: any) => [`${v} leads · ${formatCurrency(props.payload.totalRevenue)}`, props.payload.disease]} />
//                       </PieChart>
//                     </ResponsiveContainer>
//                 }
//               </div>
//             </Card>
//           </div>

//           {/* Disease table */}
//           <Card title="Disease-wise performance & revenue">
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-100 bg-gray-50">
//                     {['Disease', 'Total leads', 'Converted', 'Conv. rate', 'Revenue', 'Avg / conv.'].map(h => (
//                       <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {diseases.length === 0
//                     ? <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No data for this period</td></tr>
//                     : diseases.map((d: any) => (
//                         <tr key={d.disease} className="border-b border-gray-50 hover:bg-gray-50">
//                           <td className="px-4 py-3 font-medium text-gray-900">{d.disease}</td>
//                           <td className="px-4 py-3 text-gray-600">{formatNumber(d.totalLeads)}</td>
//                           <td className="px-4 py-3 text-gray-600">{formatNumber(d.totalConverted)}</td>
//                           <td className="px-4 py-3">
//                             <span className={`font-semibold ${d.conversionRate >= 50 ? 'text-green-600' : d.conversionRate >= 25 ? 'text-yellow-600' : 'text-red-500'}`}>
//                               {formatPercent(d.conversionRate)}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3 font-semibold text-brand-700">{formatCurrency(d.totalRevenue)}</td>
//                           <td className="px-4 py-3 text-gray-500">{formatCurrency(d.avgRevenue)}</td>
//                         </tr>
//                       ))
//                   }
//                 </tbody>
//               </table>
//             </div>
//           </Card>
//         </>
//       )}
//     </div>
//   )
// }





'use client'
import { useEffect, useState } from 'react'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'
import { StatCard, Card } from '@/components/ui'
import { formatNumber, formatPercent, formatCurrency } from '@/lib/utils'
import { CONSULT_OPTIONS, PATIENT_TYPE_OPTIONS, ADMISSION_TYPE_OPTIONS, GID_INSURANCE_COMPANIES } from '@/types'
import { Phone, TrendingUp, Users, DollarSign, BarChart2 } from 'lucide-react'
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'

const COLORS = [
  '#0d9488','#14b8a6','#2dd4bf','#5eead4','#0891b2','#6366f1',
  '#f59e0b','#ef4444','#8b5cf6','#ec4899','#10b981','#f97316',
  '#06b6d4','#84cc16','#a855f7','#3b82f6',
]

const today = new Date()
const PRESETS = [
  { label: 'Today',        from: format(today,'yyyy-MM-dd'),                                to: format(today,'yyyy-MM-dd') },
  { label: 'Yesterday',    from: format(subDays(today,1),'yyyy-MM-dd'),                     to: format(subDays(today,1),'yyyy-MM-dd') },
  { label: 'This week',    from: format(startOfWeek(today,{weekStartsOn:1}),'yyyy-MM-dd'),  to: format(today,'yyyy-MM-dd') },
  { label: 'This month',   from: format(startOfMonth(today),'yyyy-MM-dd'),                  to: format(today,'yyyy-MM-dd') },
  { label: 'Last 30 days', from: format(subDays(today,29),'yyyy-MM-dd'),                    to: format(today,'yyyy-MM-dd') },
  { label: 'All time',     from: '',                                                         to: '' },
]

export default function AdminDashboard() {
  const [activePreset, setActivePreset] = useState('All time')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [overview,     setOverview]     = useState<any>(null)
  const [diseases,     setDiseases]     = useState<any[]>([])
  const [trend,        setTrend]        = useState<any[]>([])
  const [consult,      setConsult]      = useState<any[]>([])
  const [patientStats,    setPatientStats]    = useState<any[]>([])
  const [admissionStats,  setAdmissionStats]  = useState<any[]>([])
  const [insuranceStats,  setInsuranceStats]  = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)

  function fetchAll(from = '', to = '') {
    setLoading(true)
    const qs = new URLSearchParams()
    if (from) qs.set('dateFrom', from)
    if (to)   qs.set('dateTo', to)
    const q = qs.toString()
    // For trend, fall back to last 30 days so chart always shows something
    const trendFrom = from || format(subDays(today, 29), 'yyyy-MM-dd')
    const trendTo   = to   || format(today, 'yyyy-MM-dd')
    const tq = `dateFrom=${trendFrom}&dateTo=${trendTo}`

    Promise.all([
      fetch(`/api/analytics?type=overview&${q}`).then(r => r.json()),
      fetch(`/api/analytics?type=disease&${q}`).then(r => r.json()),
      fetch(`/api/analytics?type=trend&${tq}`).then(r => r.json()),
      fetch(`/api/analytics?type=consultationType&${q}`).then(r => r.json()),
      fetch(`/api/analytics?type=patientType&${q}`).then(r => r.json()),
      fetch(`/api/analytics?type=admissionType&${q}`).then(r => r.json()),
      fetch(`/api/analytics?type=insuranceCompany&${q}`).then(r => r.json()),
    ]).then(([ov, dis, tr, ct, pt, at, ins]) => {
      setOverview(ov.data)
      setDiseases(dis.data ?? [])
      setTrend(tr.data ?? [])
      setConsult(ct.data ?? [])
      setPatientStats(pt.data ?? [])
      setAdmissionStats(at.data ?? [])
      setInsuranceStats(ins.data ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  function applyPreset(p: typeof PRESETS[0]) {
    setActivePreset(p.label)
    setDateFrom(p.from)
    setDateTo(p.to)
    fetchAll(p.from, p.to)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Performance across all telecallers</p>
      </div>

      {/* ── Date filter bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap ${activePreset === p.label ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {p.label}
            </button>
          ))}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input type="date" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setActivePreset('Custom') }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1 sm:flex-none" />
            <span className="text-gray-400 text-xs">–</span>
            <input type="date" value={dateTo}
              onChange={e => { setDateTo(e.target.value); setActivePreset('Custom') }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1 sm:flex-none" />
            <button onClick={() => fetchAll(dateFrom, dateTo)}
              className="text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium flex items-center gap-1.5">
              {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />}
              Apply
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total leads given"  value={formatNumber(overview?.totalLeadsGiven ?? 0)}  sub="assigned to team"       icon={<Phone size={18}/>}      color="teal"   />
            <StatCard label="Leads worked"        value={formatNumber(overview?.totalLeads ?? 0)}       sub="across all rows"        icon={<Users size={18}/>}      color="blue"   />
            <StatCard label="Converted"           value={formatNumber(overview?.totalConverted ?? 0)}   sub={`${formatPercent(overview?.conversionRate ?? 0)} rate`} icon={<TrendingUp size={18}/>} color="green" />
            <StatCard label="Total revenue"       value={formatCurrency(overview?.totalRevenue ?? 0)}   sub="from all conversions"   icon={<DollarSign size={18}/>} color="purple" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <StatCard label="Avg rev / conv"      value={formatCurrency(overview?.avgRevenuePerConversion ?? 0)} sub="per converted lead" icon={<BarChart2 size={18}/>} color="orange" />
            <StatCard label="Active telecallers"  value={overview?.activeTelecallers ?? 0}                       sub="team members"       icon={<Users size={18}/>}    color="teal"   />
          </div>

          {/* Consultation split — all 4 types */}
          {consult.length > 0 && (
            <div className={`grid gap-4 mb-5 ${consult.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {consult.map((c: any) => {
                const opt = CONSULT_OPTIONS.find(o => o.value === c.consultationType)
                const bg  = opt?.value==='online'?'bg-blue-50 border-blue-100':opt?.value==='hospital'?'bg-orange-50 border-orange-100':opt?.value==='whatsapp'?'bg-green-50 border-green-100':'bg-purple-50 border-purple-100'
                const rev = opt?.value==='online'?'text-blue-700':opt?.value==='hospital'?'text-orange-700':opt?.value==='whatsapp'?'text-green-700':'text-purple-700'
                return (
                  <div key={c.consultationType} className={`rounded-xl border p-4 flex items-center justify-between ${bg}`}>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{opt?.icon} {opt?.label ?? c.consultationType}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatNumber(c.totalLeads)} leads · {c.totalConverted} converted</p>
                    </div>
                    <p className={`text-xl font-bold ${rev}`}>{formatCurrency(c.totalRevenue)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Patient type live cards */}
          {patientStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {patientStats.map((p: any) => {
                const opt = PATIENT_TYPE_OPTIONS.find(o => o.value === p.patientType)
                const bg  = p.patientType === 'new' ? 'bg-teal-50 border-teal-100' : 'bg-indigo-50 border-indigo-100'
                const rev = p.patientType === 'new' ? 'text-teal-700' : 'text-indigo-700'
                return (
                  <div key={p.patientType} className={`rounded-xl border p-4 flex items-center justify-between ${bg}`}>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{opt?.icon} {opt?.label ?? p.patientType}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatNumber(p.totalLeads)} leads · {p.totalConverted} converted · {p.conversionRate}% rate</p>
                    </div>
                    <p className={`text-xl font-bold ${rev}`}>{formatCurrency(p.totalRevenue)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Admission type live cards */}
          {admissionStats.filter((a: any) => a.admissionType && a.admissionType !== 'null').length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {admissionStats.filter((a: any) => a.admissionType && a.admissionType !== 'null').map((a: any) => {
                const opt = ADMISSION_TYPE_OPTIONS.find(o => o.value === a.admissionType)
                const bg  = a.admissionType==='IPD'?'bg-red-50 border-red-100':a.admissionType==='OPD'?'bg-yellow-50 border-yellow-100':'bg-cyan-50 border-cyan-100'
                const rev = a.admissionType==='IPD'?'text-red-700':a.admissionType==='OPD'?'text-yellow-700':'text-cyan-700'
                return (
                  <div key={a.admissionType} className={`rounded-xl border p-4 flex items-center justify-between ${bg}`}>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{opt?.icon} {opt?.label ?? a.admissionType}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatNumber(a.totalLeads)} leads · {a.totalConverted} converted</p>
                    </div>
                    <p className={`text-xl font-bold ${rev}`}>{formatCurrency(a.totalRevenue)}</p>
                  </div>
                )
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">
            {/* Revenue trend */}
            <Card title="Revenue & leads trend">
              <div className="p-4">
                {trend.length === 0
                  ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
                  : <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={d => d.slice(5)} />
                        <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                        <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0' }}
                          formatter={(v: any, name: string) => [name === 'Revenue' ? formatCurrency(v) : v, name]} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line yAxisId="l" type="monotone" dataKey="totalRevenue"   name="Revenue"   stroke="#0d9488" strokeWidth={2} dot={false} />
                        <Line yAxisId="r" type="monotone" dataKey="totalLeads"     name="Leads"     stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                        <Line yAxisId="r" type="monotone" dataKey="totalConverted" name="Converted" stroke="#5eead4" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                }
              </div>
            </Card>

            {/* Disease pie — groups tiny slices into Others, % labels on visible slices */}
            <Card title="Disease distribution" subtitle="Slices under 2% grouped as Others · hover for details">
              <div className="p-4">
                {diseases.length === 0
                  ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
                  : (() => {
                      const total = diseases.reduce((s: number, d: any) => s + d.totalLeads, 0)
                      // Separate meaningful slices (≥2%) from tiny ones
                      const big    = diseases.filter((d: any) => d.totalLeads / total >= 0.02)
                      const small  = diseases.filter((d: any) => d.totalLeads / total <  0.02)
                      const othersLeads = small.reduce((s: number, d: any) => s + d.totalLeads, 0)
                      const othersRev   = small.reduce((s: number, d: any) => s + d.totalRevenue, 0)
                      const pieData = othersLeads > 0
                        ? [...big, { disease: `Others (${small.length})`, totalLeads: othersLeads, totalRevenue: othersRev, conversionRate: 0, avgRevenue: 0 }]
                        : big

                      const CUSTOM_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
                        if (percent < 0.04) return null
                        const RADIAN = Math.PI / 180
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.55
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)
                        return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
                            style={{ fontSize: 11, fontWeight: 600 }}>
                            {(percent * 100).toFixed(0)}%
                          </text>
                        )
                      }

                      return (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="totalLeads"
                              nameKey="disease"
                              cx="50%"
                              cy="44%"
                              outerRadius={100}
                              labelLine={false}
                              label={CUSTOM_LABEL}
                            >
                              {pieData.map((_: any, i: number) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0' }}
                              formatter={(v: any, _: any, props: any) => {
                                const pct = total > 0 ? ((props.payload.totalLeads / total) * 100).toFixed(1) : '0'
                                return [`${v} leads (${pct}%) · ${formatCurrency(props.payload.totalRevenue)}`, props.payload.disease]
                              }}
                            />
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
                              formatter={(value: string) => value.length > 20 ? value.slice(0, 20) + '…' : value}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )
                    })()
                }
              </div>
            </Card>
          </div>

          {/* Disease table */}
          <Card title="Disease-wise performance & revenue">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Disease', 'Total leads', 'Converted', 'Conv. rate', 'Revenue', 'Avg / conv.'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {diseases.length === 0
                    ? <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No data for this period</td></tr>
                    : diseases.map((d: any) => (
                        <tr key={d.disease} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{d.disease}</td>
                          <td className="px-4 py-3 text-gray-600">{formatNumber(d.totalLeads)}</td>
                          <td className="px-4 py-3 text-gray-600">{formatNumber(d.totalConverted)}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${d.conversionRate >= 50 ? 'text-green-600' : d.conversionRate >= 25 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {formatPercent(d.conversionRate)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-brand-700">{formatCurrency(d.totalRevenue)}</td>
                          <td className="px-4 py-3 text-gray-500">{formatCurrency(d.avgRevenue)}</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </Card>

          {/* GID Insurance company breakdown */}
          {insuranceStats.length > 0 && (
            <Card title="🏢 GID Insurance Company breakdown" subtitle="Leads tracked by insurance company — all 32 under GID">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-violet-50">
                      {['Insurance Company', 'Leads', 'Converted', 'Conv. rate', 'Revenue', 'Avg / conv.'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceStats.map((ins: any, idx: number) => (
                      <tr key={ins.insuranceCompany} className="border-b border-gray-50 hover:bg-violet-50/30">
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: COLORS[idx % COLORS.length] }}>{idx + 1}</span>
                          {ins.insuranceCompany}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatNumber(ins.totalLeads)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatNumber(ins.totalConverted)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${ins.conversionRate >= 50 ? 'text-green-600' : ins.conversionRate >= 25 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {formatPercent(ins.conversionRate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-violet-700">{formatCurrency(ins.totalRevenue)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatCurrency(ins.avgRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
