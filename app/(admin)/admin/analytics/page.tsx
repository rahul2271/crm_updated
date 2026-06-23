'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { Card } from '@/components/ui'
import { formatPercent, formatCurrency, formatNumber, INDIAN_STATES, AGE_GROUPS } from '@/lib/utils'
import { CONSULT_OPTIONS, PATIENT_TYPE_OPTIONS, ADMISSION_TYPE_OPTIONS, GID_INSURANCE_COMPANIES } from '@/types'
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'
import { TrendingUp, TrendingDown, Minus, ChevronRight, X } from 'lucide-react'

const COLORS = ['#0d9488','#14b8a6','#2dd4bf','#0891b2','#6366f1','#f59e0b','#ef4444','#8b5cf6','#ec4899','#10b981']
const today = new Date()

const PRESETS = [
  { label: 'Today',        from: format(today, 'yyyy-MM-dd'),                                    to: format(today, 'yyyy-MM-dd') },
  { label: 'Yesterday',    from: format(subDays(today,1), 'yyyy-MM-dd'),                         to: format(subDays(today,1), 'yyyy-MM-dd') },
  { label: 'This week',    from: format(startOfWeek(today,{weekStartsOn:1}), 'yyyy-MM-dd'),      to: format(today, 'yyyy-MM-dd') },
  { label: 'Last 7 days',  from: format(subDays(today,6), 'yyyy-MM-dd'),                         to: format(today, 'yyyy-MM-dd') },
  { label: 'This month',   from: format(startOfMonth(today), 'yyyy-MM-dd'),                      to: format(today, 'yyyy-MM-dd') },
  { label: 'Last 30 days', from: format(subDays(today,29), 'yyyy-MM-dd'),                        to: format(today, 'yyyy-MM-dd') },
  { label: 'All time',     from: '',                                                              to: '' },
]

type Filters = { dateFrom:string; dateTo:string; telecallerId:string; disease:string; state:string; ageGroup:string; consultationType:string; patientType:string; admissionType:string; insuranceCompany:string }
type Tab = 'overview'|'disease'|'telecaller'|'location'|'age'|'daywise'|'compare'|'patient'|'insurance'

function Delta({ val }: { val: number | null }) {
  if (val === null) return <span className="text-xs text-gray-400">N/A</span>
  if (val > 0) return <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5"><TrendingUp size={12}/>{val}%</span>
  if (val < 0) return <span className="text-xs text-red-500 font-semibold flex items-center gap-0.5"><TrendingDown size={12}/>{Math.abs(val)}%</span>
  return <span className="text-xs text-gray-400 flex items-center gap-0.5"><Minus size={12}/>0%</span>
}

function RateBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{
          width: `${pct}%`,
          background: value >= 50 ? '#0d9488' : value >= 25 ? '#f59e0b' : '#ef4444'
        }} />
      </div>
      <span className={`text-xs font-semibold w-10 text-right ${value >= 50 ? 'text-green-600' : value >= 25 ? 'text-yellow-600' : 'text-red-500'}`}>
        {value}%
      </span>
    </div>
  )
}

export default function AnalyticsPage() {
  const [telecallers,   setTelecallers]   = useState<any[]>([])
  const [diseases,      setDiseases]      = useState<any[]>([])
  const [activePreset,  setActivePreset]  = useState('Last 30 days')
  const [filters, setFilters] = useState<Filters>({
    dateFrom: format(subDays(today,29),'yyyy-MM-dd'), dateTo: format(today,'yyyy-MM-dd'),
    telecallerId:'', disease:'', state:'', ageGroup:'', consultationType:'',
    patientType:'', admissionType:'', insuranceCompany:'',
  })

  const [overview,      setOverview]      = useState<any>(null)
  const [summary,       setSummary]       = useState<any>(null)
  const [diseaseStats,  setDiseaseStats]  = useState<any[]>([])
  const [tcStats,       setTcStats]       = useState<any[]>([])
  const [locStats,      setLocStats]      = useState<any[]>([])
  const [ageStats,      setAgeStats]      = useState<any[]>([])
  const [trend,         setTrend]         = useState<any[]>([])
  const [consultStats,  setConsultStats]  = useState<any[]>([])
  const [comparison,    setComparison]    = useState<any>(null)
  const [patientStats,  setPatientStats]  = useState<any[]>([])
  const [admissionStats,setAdmissionStats]= useState<any[]>([])
  const [crossStats,    setCrossStats]    = useState<any[]>([])
  const [insuranceStats,setInsuranceStats]= useState<any[]>([])

  const [loading,      setLoading]      = useState(false)
  const [activeTab,    setActiveTab]    = useState<Tab>('overview')
  const [drillDisease, setDrillDisease] = useState<string|null>(null)
  const [drillData,    setDrillData]    = useState<any>(null)
  const [drillLoading, setDrillLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/telecallers').then(r=>r.json()),
      fetch('/api/diseases?all=true').then(r=>r.json()),
    ]).then(([tc,dis]) => { setTelecallers(tc.data??[]); setDiseases(dis.data??[]) })
  }, [])

  const buildQS = useCallback((f=filters) => {
    const p = new URLSearchParams()
    Object.entries(f).forEach(([k,v]) => { if (v) p.set(k,v) })
    return p.toString()
  }, [filters])

  async function fetchAll(f=filters) {
    setLoading(true)
    const qs = buildQS(f)
    const compQS = f.dateFrom && f.dateTo ? `&dateFrom=${f.dateFrom}&dateTo=${f.dateTo}` : ''
    try {
      const results = await Promise.all([
        fetch(`/api/analytics?type=overview&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=summary&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=disease&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=telecaller&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=location&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=ageGroup&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=trend&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=consultationType&${qs}`).then(r=>r.json()),
        compQS ? fetch(`/api/analytics?type=comparison${compQS}`).then(r=>r.json()) : Promise.resolve({data:null}),
        fetch(`/api/analytics?type=patientType&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=admissionType&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=patientAdmissionCross&${qs}`).then(r=>r.json()),
        fetch(`/api/analytics?type=insuranceCompany&${qs}`).then(r=>r.json()),
      ])
      setOverview(results[0].data)
      setSummary(results[1].data)
      setDiseaseStats(results[2].data??[])
      setTcStats(results[3].data??[])
      setLocStats(results[4].data??[])
      setAgeStats(results[5].data??[])
      setTrend(results[6].data??[])
      setConsultStats(results[7].data??[])
      setComparison(results[8].data)
      setPatientStats(results[9].data??[])
      setAdmissionStats(results[10].data??[])
      setCrossStats(results[11].data??[])
      setInsuranceStats(results[12].data??[])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, []) // eslint-disable-line

  async function drillIntoDisease(dis: string) {
    setDrillDisease(dis); setDrillLoading(true)
    const qs = buildQS() + `&disease=${encodeURIComponent(dis)}`
    const r = await fetch(`/api/analytics?type=diseaseDetail&${qs}`).then(r=>r.json())
    setDrillData(r.data); setDrillLoading(false)
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setActivePreset(p.label)
    const nf = { ...filters, dateFrom: p.from, dateTo: p.to }
    setFilters(nf); fetchAll(nf)
  }

  function upd(k: keyof Filters, v: string) {
    setActivePreset('Custom')
    setFilters(f => ({ ...f, [k]: v }))
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',   label: 'Overview'    },
    { id: 'disease',    label: 'Disease'     },
    { id: 'telecaller', label: 'Telecaller'  },
    { id: 'location',   label: 'Location'    },
    { id: 'age',        label: 'Age group'   },
    { id: 'patient',    label: '🏥 Patient'  },
    { id: 'insurance',  label: '🏢 Insurance'},
    { id: 'daywise',    label: 'Day-wise'    },
    { id: 'compare',    label: 'Period vs'   },
  ]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Deep analysis — click any disease row to drill down</p>
      </div>

      {/* ── Filter panel ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        {/* Presets */}
        <div className="flex gap-2 flex-wrap mb-4">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${activePreset === p.label ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {p.label}
            </button>
          ))}
        </div>
        {/* Dimension filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input type="date" value={filters.dateFrom} onChange={e => upd('dateFrom', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input type="date" value={filters.dateTo} onChange={e => upd('dateTo', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {[
            { label:'Telecaller', key:'telecallerId', opts:[{v:'',l:'All telecallers'},...telecallers.map(t=>({v:t._id,l:t.name}))]},
            { label:'Disease',    key:'disease',      opts:[{v:'',l:'All diseases'},...diseases.map(d=>({v:d.name,l:d.name}))]},
            { label:'State',      key:'state',        opts:[{v:'',l:'All states'},...INDIAN_STATES.map(s=>({v:s,l:s}))]},
            { label:'Age group',  key:'ageGroup',     opts:[{v:'',l:'All ages'},...AGE_GROUPS.map(g=>({v:g,l:`${g} yrs`}))]},
            { label:'Type',       key:'consultationType', opts:[{v:'',l:'All types'},{v:'online',l:'💻 Online'},{v:'hospital',l:'🏥 Hospital'},{v:'whatsapp',l:'💬 WhatsApp'},{v:'call',l:'📞 Call'},{v:'website_booking',l:'🌐 Website'}]},
            { label:'Patient',    key:'patientType',      opts:[{v:'',l:'All patients'},{v:'new',l:'🆕 New'},{v:'existing',l:'🔄 Existing'}]},
            { label:'Admission',  key:'admissionType',    opts:[{v:'',l:'All admissions'},{v:'IPD',l:'🛏️ IPD'},{v:'OPD',l:'🩺 OPD'},{v:'Cashless',l:'💳 Cashless'}]},
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
              <select value={(filters as any)[f.key]} onChange={e => upd(f.key as keyof Filters, e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          ))}
          {/* Insurance company filter */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Insurance Co. (GID)</label>
            <select value={filters.insuranceCompany} onChange={e => upd('insuranceCompany', e.target.value)}
              className={`w-full text-sm border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${filters.insuranceCompany ? 'border-violet-300 text-violet-700' : 'border-gray-200'}`}>
              <option value="">All / No filter</option>
              {GID_INSURANCE_COMPANIES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => fetchAll()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />}
            Apply
          </button>
          <button onClick={() => { const d={dateFrom:format(subDays(today,29),'yyyy-MM-dd'),dateTo:format(today,'yyyy-MM-dd'),telecallerId:'',disease:'',state:'',ageGroup:'',consultationType:'',patientType:'',admissionType:'',insuranceCompany:''}; setFilters(d); setActivePreset('Last 30 days'); fetchAll(d) }}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Reset</button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════ OVERVIEW ════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l:'Leads given',     v: formatNumber(overview?.totalLeadsGiven??0),      sub:`Utilization: ${overview?.utilizationRate??0}%`,              c:'border-l-4 border-teal-400'  },
              { l:'Leads worked',    v: formatNumber(overview?.totalLeads??0),            sub:`Avg ${overview?.avgLeadsPerDay??0}/day`,                      c:'border-l-4 border-blue-400'  },
              { l:'Converted',       v: `${formatNumber(overview?.totalConverted??0)}`,  sub:`${formatPercent(overview?.conversionRate??0)} conv. rate`,    c:'border-l-4 border-green-400' },
              { l:'Total revenue',   v: formatCurrency(overview?.totalRevenue??0),       sub:`Avg ${formatCurrency(overview?.avgRevenuePerDay??0)}/day`,    c:'border-l-4 border-brand-400' },
              { l:'Avg rev/conv',    v: formatCurrency(overview?.avgRevenuePerConversion??0), sub:'per converted lead',                                     c:'border-l-4 border-purple-400'},
              { l:'Active callers',  v: overview?.activeTelecallers??0,                  sub:'team members',                                                c:'border-l-4 border-indigo-400'},
              { l:'Online leads',    v: formatNumber(overview?.totalOnlineLeads??0),     sub:'consultation rows',                                           c:'border-l-4 border-blue-300'  },
              { l:'Hospital visits', v: formatNumber(overview?.totalHospitalLeads??0),   sub:'visit rows',                                                  c:'border-l-4 border-orange-400'},
            ].map(s => (
              <div key={s.l} className={`bg-white rounded-xl p-4 shadow-sm ${s.c}`}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.l}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{s.v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Consultation type split — all 4 types */}
          {consultStats.length > 0 && (
            <div className={`grid gap-4 ${consultStats.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {consultStats.map((c:any) => {
                const opt = CONSULT_OPTIONS.find(o => o.value === c.consultationType)
                const bg  = opt?.value==='online'?'bg-blue-50 border-blue-100':opt?.value==='hospital'?'bg-orange-50 border-orange-100':opt?.value==='whatsapp'?'bg-green-50 border-green-100':'bg-purple-50 border-purple-100'
                const rev = opt?.value==='online'?'text-blue-700':opt?.value==='hospital'?'text-orange-700':opt?.value==='whatsapp'?'text-green-700':'text-purple-700'
                return (
                  <div key={c.consultationType} className={`rounded-xl border p-4 flex items-center justify-between ${bg}`}>
                    <div>
                      <p className="font-semibold text-gray-800">{opt?.icon} {opt?.label ?? c.consultationType}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatNumber(c.totalLeads)} leads · {c.totalConverted} converted · {formatPercent(c.conversionRate)} rate</p>
                    </div>
                    <p className={`text-xl font-bold ${rev}`}>{formatCurrency(c.totalRevenue)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Patient type quick summary */}
          {patientStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientStats.map((p:any) => {
                const opt = PATIENT_TYPE_OPTIONS.find(o => o.value === p.patientType)
                const bg  = p.patientType === 'new' ? 'bg-teal-50 border-teal-100' : 'bg-indigo-50 border-indigo-100'
                const rev = p.patientType === 'new' ? 'text-teal-700' : 'text-indigo-700'
                return (
                  <div key={p.patientType} className={`rounded-xl border p-4 flex items-center justify-between ${bg}`}>
                    <div>
                      <p className="font-semibold text-gray-800">{opt?.icon} {opt?.label ?? p.patientType}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatNumber(p.totalLeads)} leads · {p.conversionRate}% conv.</p>
                      {admissionStats.filter((a:any) => a.admissionType && a.admissionType !== 'null').length > 0 && (
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {admissionStats.filter((a:any) => a.admissionType && a.admissionType !== 'null').map((a:any) => {
                            const ao = ADMISSION_TYPE_OPTIONS.find(o => o.value === a.admissionType)
                            return <span key={a.admissionType} className={`text-xs px-1.5 py-0.5 rounded ${ao?.color ?? 'bg-gray-100 text-gray-600'}`}>{ao?.icon} {ao?.label} {a.totalLeads}</span>
                          })}
                        </div>
                      )}
                    </div>
                    <p className={`text-xl font-bold ${rev}`}>{formatCurrency(p.totalRevenue)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Top performers quick view */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: '🏆 Top diseases',    items: summary.diseaseTop, nameKey:'disease', metricKey:'leads', metricLabel:'leads', rateKey:'rate' },
                { title: '👤 Top telecallers', items: summary.tcTop,      nameKey:'name',    metricKey:'leads', metricLabel:'leads', rateKey:'rate' },
                { title: '📍 Top cities',      items: summary.cityTop,    nameKey:'city',    metricKey:'leads', metricLabel:'leads', rateKey:null   },
              ].map(group => (
                <Card key={group.title} title={group.title}>
                  <div className="divide-y divide-gray-50">
                    {(group.items??[]).map((item:any, idx:number) => (
                      <div key={idx} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${idx===0?'bg-amber-100 text-amber-700':idx===1?'bg-gray-100 text-gray-600':'bg-orange-50 text-orange-600'}`}>
                            {idx+1}
                          </span>
                          <span className="text-sm font-medium text-gray-800 truncate">{item[group.nameKey]}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">{item[group.metricKey]} <span className="text-xs text-gray-400">{group.metricLabel}</span></p>
                          {group.rateKey && <p className={`text-xs font-semibold ${item[group.rateKey]>=50?'text-green-600':item[group.rateKey]>=25?'text-yellow-600':'text-red-500'}`}>{item[group.rateKey]}% conv.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}


          {/* Trend */}
          <Card title="Revenue & leads trend">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend} margin={{top:4,right:8,bottom:4,left:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={d=>d.slice(5)} />
                  <YAxis yAxisId="l" tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="r" orientation="right" tick={{fontSize:10,fill:'#9ca3af'}} />
                  <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:'1px solid #f0f0f0'}}
                    formatter={(v:any,name:string) => [name==='Revenue'?formatCurrency(v):v,name]} />
                  <Legend wrapperStyle={{fontSize:12}} />
                  <Line yAxisId="l" type="monotone" dataKey="totalRevenue"   name="Revenue"    stroke="#0d9488" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="totalLeads"     name="Leads"      stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  <Line yAxisId="r" type="monotone" dataKey="totalConverted" name="Converted"  stroke="#5eead4" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* ════ DISEASE ════ */}
      {activeTab === 'disease' && (
        <div className="space-y-5">
          {/* Disease drill-down panel */}
          {drillDisease && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-indigo-900">🔍 Drill-down: {drillDisease}</h3>
                <button onClick={() => { setDrillDisease(null); setDrillData(null) }}
                  className="text-indigo-400 hover:text-indigo-600"><X size={18}/></button>
              </div>
              {drillLoading ? (
                <div className="flex justify-center py-6"><div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
              ) : drillData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Age breakdown */}
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">By age group</p>
                    <div className="space-y-2">
                      {(drillData.ageBreak??[]).map((a:any) => (
                        <div key={a.ageGroup} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{a.ageGroup} yrs</span>
                          <span className="font-semibold text-gray-800">{a.totalLeads} leads</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Top locations */}
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Top cities</p>
                    <div className="space-y-2">
                      {(drillData.locBreak??[]).slice(0,5).map((l:any,i:number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{l.city}, {l.state}</span>
                          <span className="font-semibold text-gray-800 ml-2">{l.totalLeads}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Telecaller performance */}
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">By telecaller</p>
                    <div className="space-y-2">
                      {(drillData.tcBreak??[]).slice(0,5).map((t:any,i:number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{t.telecallerName}</span>
                          <span className={`font-semibold ml-2 ${t.rate>=50?'text-green-600':t.rate>=25?'text-yellow-600':'text-red-500'}`}>{t.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Trend */}
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Trend</p>
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={drillData.trendBreak??[]}>
                        <Line type="monotone" dataKey="totalLeads" stroke="#0d9488" strokeWidth={2} dot={false} />
                        <Tooltip contentStyle={{fontSize:11,borderRadius:6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Conversion rate by disease" subtitle="Online vs hospital comparison">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={diseaseStats.slice(0,8)} margin={{top:4,right:4,bottom:60,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="disease" tick={{fontSize:9,fill:'#6b7280'}} angle={-35} textAnchor="end" interval={0}
                      tickFormatter={(v:string)=>v.length>12?v.slice(0,12)+'…':v} />
                    <YAxis tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={v=>`${v}%`} domain={[0,100]} />
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={(v:any,name:string)=>[`${v}%`,name]} />
                    <Legend wrapperStyle={{fontSize:11}} />
                    <Bar dataKey="conversionRate"         name="Overall %"  fill="#0d9488" radius={[3,3,0,0]} />
                    <Bar dataKey="onlineConversionRate"   name="Online %"   fill="#0891b2" radius={[3,3,0,0]} />
                    <Bar dataKey="hospitalConversionRate" name="Hospital %"  fill="#f59e0b" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Revenue per conversion" subtitle="Average ₹ earned per converted lead">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={diseaseStats.slice(0,8).filter((d:any)=>d.avgRevenue>0)} layout="vertical"
                    margin={{top:4,right:8,bottom:4,left:100}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="disease" tick={{fontSize:10,fill:'#6b7280'}} width={95}
                      tickFormatter={(v:string)=>v.length>14?v.slice(0,14)+'…':v} />
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={(v:any)=>[formatCurrency(v),'Avg rev/conv']} />
                    <Bar dataKey="avgRevenue" fill="#6366f1" radius={[0,4,4,0]} name="Avg rev/conv" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Full disease table with all metrics */}
          <Card title="Disease-wise full analysis" subtitle="Click any row to drill down into age, location, telecaller breakdown">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Disease','Leads','Conv.','Avg conv. rate','Online conv%','Hospital conv%','Avg ₹/conv','Total revenue','Active days'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {diseaseStats.length === 0
                    ? <tr><td colSpan={9} className="text-center py-10 text-gray-400">No data</td></tr>
                    : diseaseStats.map((d:any) => (
                        <tr key={d.disease}
                          onClick={() => drillIntoDisease(d.disease)}
                          className={`border-b border-gray-50 hover:bg-brand-50 cursor-pointer transition-colors ${drillDisease===d.disease?'bg-indigo-50':''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-900">{d.disease}</span>
                              <ChevronRight size={13} className="text-gray-300"/>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{formatNumber(d.totalLeads)}</td>
                          <td className="px-4 py-3 text-gray-600">{d.totalConverted}</td>
                          <td className="px-4 py-3 w-36"><RateBar value={d.conversionRate} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-blue-600 font-semibold">{d.onlineConversionRate}%</span>
                              <span className="text-xs text-gray-300">({d.onlineLeads})</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-orange-600 font-semibold">{d.hospitalConversionRate}%</span>
                              <span className="text-xs text-gray-300">({d.hospitalLeads})</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-indigo-700">{formatCurrency(d.avgRevenue)}</td>
                          <td className="px-4 py-3 font-semibold text-brand-700">{formatCurrency(d.totalRevenue)}</td>
                          <td className="px-4 py-3 text-gray-500">{d.activeDays}d</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ════ TELECALLER ════ */}
      {activeTab === 'telecaller' && (
        <div className="space-y-5">
          {/* Radar chart — telecaller comparison */}
          {tcStats.length > 1 && (
            <Card title="Telecaller radar comparison" subtitle="Normalized across leads, conversions, revenue, utilization">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={[
                    { metric:'Leads',       ...Object.fromEntries(tcStats.slice(0,5).map((t:any)=>[t.telecallerName, t.totalLeads])) },
                    { metric:'Converted',   ...Object.fromEntries(tcStats.slice(0,5).map((t:any)=>[t.telecallerName, t.totalConverted])) },
                    { metric:'Conv rate',   ...Object.fromEntries(tcStats.slice(0,5).map((t:any)=>[t.telecallerName, t.conversionRate])) },
                    { metric:'Utilization', ...Object.fromEntries(tcStats.slice(0,5).map((t:any)=>[t.telecallerName, t.utilizationRate])) },
                    { metric:'Days',        ...Object.fromEntries(tcStats.slice(0,5).map((t:any)=>[t.telecallerName, t.daysWorked])) },
                  ]}>
                    <PolarGrid stroke="#f0f0f0" />
                    <PolarAngleAxis dataKey="metric" tick={{fontSize:11,fill:'#6b7280'}} />
                    <PolarRadiusAxis tick={{fontSize:9,fill:'#9ca3af'}} />
                    {tcStats.slice(0,5).map((t:any,i:number) => (
                      <Radar key={t.telecallerName||i} name={t.telecallerName} dataKey={t.telecallerName}
                        stroke={COLORS[i%COLORS.length]} fill={COLORS[i%COLORS.length]} fillOpacity={0.1} />
                    ))}
                    <Legend wrapperStyle={{fontSize:11}} />
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card title="Telecaller full performance">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Name','Days','Given','Worked','Converted','Conv. rate','Utilization','Revenue','Rev/day','Leads/day','Online','Hospital'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tcStats.length === 0
                    ? <tr><td colSpan={12} className="text-center py-10 text-gray-400">No data</td></tr>
                    : tcStats.map((t:any,i:number) => (
                        <tr key={t._id||i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i===0?'bg-amber-100 text-amber-700':i===1?'bg-gray-100 text-gray-500':'bg-gray-50 text-gray-400'}`}>{i+1}</span>
                              <span className="font-medium text-gray-900">{t.telecallerName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">{t.daysWorked}</td>
                          <td className="px-3 py-2.5 text-gray-600">{t.totalLeadsGiven}</td>
                          <td className="px-3 py-2.5 text-gray-600">{t.totalLeads}</td>
                          <td className="px-3 py-2.5 text-gray-600">{t.totalConverted}</td>
                          <td className="px-3 py-2.5 w-28"><RateBar value={t.conversionRate}/></td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs font-semibold ${t.utilizationRate>=80?'text-green-600':t.utilizationRate>=50?'text-yellow-600':'text-red-500'}`}>
                              {t.utilizationRate}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-brand-700 text-xs">{formatCurrency(t.totalRevenue)}</td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs">{formatCurrency(t.avgRevenuePerDay)}</td>
                          <td className="px-3 py-2.5 text-gray-500">{t.avgLeadsPerDay}</td>
                          <td className="px-3 py-2.5 text-blue-600">{t.onlineLeads}</td>
                          <td className="px-3 py-2.5 text-orange-600">{t.hospitalLeads}</td>
                          <td className="px-3 py-2.5 text-orange-600">{t.whatsappLeads}</td>
                          <td className="px-3 py-2.5 text-orange-600">{t.callLeads}</td>

                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ════ LOCATION ════ */}
      {activeTab === 'location' && (
        <Card title="Location breakdown" subtitle="City + state with full metrics">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['City','State','Leads','Converted','Conv. rate','Online','Hospital','Revenue'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locStats.length === 0
                  ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">No data</td></tr>
                  : locStats.map((l:any,i:number) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-900">{l.city}</td>
                        <td className="px-4 py-2.5 text-gray-500">{l.state}</td>
                        <td className="px-4 py-2.5 text-gray-600">{l.totalLeads}</td>
                        <td className="px-4 py-2.5 text-gray-600">{l.totalConverted}</td>
                        <td className="px-4 py-2.5 w-32"><RateBar value={l.conversionRate}/></td>
                        <td className="px-4 py-2.5 text-blue-600">{l.onlineLeads}</td>
                        <td className="px-4 py-2.5 text-orange-600">{l.hospitalLeads}</td>
                        <td className="px-4 py-2.5 font-semibold text-brand-700">{formatCurrency(l.totalRevenue)}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ════ AGE ════ */}
      {activeTab === 'age' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Leads & conversions by age">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ageStats} margin={{top:4,right:8,bottom:4,left:8}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="ageGroup" tick={{fontSize:12,fill:'#6b7280'}} />
                    <YAxis tick={{fontSize:10,fill:'#9ca3af'}} />
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}} />
                    <Legend wrapperStyle={{fontSize:12}} />
                    <Bar dataKey="totalLeads"     name="Leads"     fill="#0d9488" radius={[4,4,0,0]} />
                    <Bar dataKey="totalConverted" name="Converted" fill="#5eead4" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Revenue by age group">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ageStats} margin={{top:4,right:8,bottom:4,left:8}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="ageGroup" tick={{fontSize:12,fill:'#6b7280'}} />
                    <YAxis tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={(v:any)=>[formatCurrency(v),'Revenue']} />
                    <Bar dataKey="totalRevenue" fill="#6366f1" radius={[4,4,0,0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <Card title="Age group full detail">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Age group','Leads','Converted','Conv. rate','Online','Hospital','Revenue','Avg ₹/conv'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ageStats.map((a:any) => (
                    <tr key={a.ageGroup} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{a.ageGroup} yrs</td>
                      <td className="px-4 py-2.5 text-gray-600">{a.totalLeads}</td>
                      <td className="px-4 py-2.5 text-gray-600">{a.totalConverted}</td>
                      <td className="px-4 py-2.5 w-32"><RateBar value={a.conversionRate}/></td>
                      <td className="px-4 py-2.5 text-blue-600">{a.onlineLeads}</td>
                      <td className="px-4 py-2.5 text-orange-600">{a.hospitalLeads}</td>
                      <td className="px-4 py-2.5 font-semibold text-brand-700">{formatCurrency(a.totalRevenue)}</td>
                      <td className="px-4 py-2.5 text-gray-500">{formatCurrency(a.avgRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ════ DAY-WISE ════ */}
      {activeTab === 'daywise' && (
        <div className="space-y-5">
          <Card title="Daily revenue bar chart">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trend} margin={{top:4,right:8,bottom:4,left:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={d=>d.slice(5)} />
                  <YAxis tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={(v:any)=>[formatCurrency(v),'Revenue']} />
                  <Bar dataKey="totalRevenue" fill="#0d9488" radius={[3,3,0,0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Day-by-day table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Date','Given','Worked','Converted','Conv. rate','Revenue'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trend.length === 0
                    ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">No data</td></tr>
                    : trend.slice().reverse().map((d:any) => (
                        <tr key={d.date} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-900">{d.date}</td>
                          <td className="px-4 py-2.5 text-gray-600">{d.totalLeadsGiven}</td>
                          <td className="px-4 py-2.5 text-gray-600">{d.totalLeads}</td>
                          <td className="px-4 py-2.5 text-gray-600">{d.totalConverted}</td>
                          <td className="px-4 py-2.5 w-32"><RateBar value={d.totalLeads>0?Math.round(d.totalConverted/d.totalLeads*100):0}/></td>
                          <td className="px-4 py-2.5 font-semibold text-brand-700">{formatCurrency(d.totalRevenue)}</td>
                        </tr>
                      ))
                  }
                </tbody>
                {trend.length > 0 && (() => {
                  const tot = trend.reduce((s:any,d:any) => ({g:s.g+d.totalLeadsGiven,l:s.l+d.totalLeads,c:s.c+d.totalConverted,r:s.r+d.totalRevenue}),{g:0,l:0,c:0,r:0})
                  return (<tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="px-4 py-3 text-gray-700">Total ({trend.length} days)</td>
                      <td className="px-4 py-3 text-gray-800">{tot.g}</td>
                      <td className="px-4 py-3 text-gray-800">{tot.l}</td>
                      <td className="px-4 py-3 text-gray-800">{tot.c}</td>
                      <td className="px-4 py-3"><RateBar value={tot.l>0?Math.round(tot.c/tot.l*100):0}/></td>
                      <td className="px-4 py-3 text-brand-700">{formatCurrency(tot.r)}</td>
                    </tr>
                  </tfoot>)
                })()}
              </table>
            </div>
          </Card>
        </div>
      )}


      {/* ════ PATIENT TYPE & ADMISSION ════ */}
      {activeTab === 'patient' && (
        <div className="space-y-5">
          {/* Patient type cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {patientStats.map((p:any) => {
              const opt = PATIENT_TYPE_OPTIONS.find(o => o.value === p.patientType)
              const bg  = p.patientType === 'new' ? 'bg-teal-50 border-teal-100' : 'bg-indigo-50 border-indigo-100'
              const rev = p.patientType === 'new' ? 'text-teal-700' : 'text-indigo-700'
              return (
                <div key={p.patientType} className={`rounded-xl border p-5 ${bg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-800 text-lg">{opt?.icon} {opt?.label ?? p.patientType}</p>
                    <p className={`text-2xl font-bold ${rev}`}>{formatCurrency(p.totalRevenue)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Leads</p>
                      <p className="font-bold text-gray-800">{formatNumber(p.totalLeads)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Converted</p>
                      <p className="font-bold text-gray-800">{p.totalConverted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conv. rate</p>
                      <RateBar value={p.conversionRate}/>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/60">
                    <p className="text-xs text-gray-500">Avg rev/conversion: <span className="font-semibold text-gray-700">{formatCurrency(p.avgRevenue)}</span></p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Admission type cards */}
          <Card title="Admission type breakdown">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-50">
              {admissionStats.filter((a:any) => a.admissionType && a.admissionType !== 'null').map((a:any) => {
                const opt = ADMISSION_TYPE_OPTIONS.find(o => o.value === a.admissionType)
                const bg  = a.admissionType==='IPD'?'text-red-700':a.admissionType==='OPD'?'text-yellow-700':'text-cyan-700'
                return (
                  <div key={a.admissionType} className="p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3">{opt?.icon} {opt?.label ?? a.admissionType}</p>
                    <p className={`text-xl font-bold ${bg}`}>{formatCurrency(a.totalRevenue)}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between"><span>Leads</span><span className="font-medium text-gray-700">{formatNumber(a.totalLeads)}</span></div>
                      <div className="flex justify-between"><span>Converted</span><span className="font-medium text-gray-700">{a.totalConverted}</span></div>
                      <div className="flex justify-between"><span>Avg/conv</span><span className="font-medium text-gray-700">{formatCurrency(a.avgRevenue)}</span></div>
                    </div>
                    <div className="mt-2"><RateBar value={a.conversionRate}/></div>
                  </div>
                )
              })}
              {admissionStats.filter((a:any) => a.admissionType && a.admissionType !== 'null').length === 0 && (
                <div className="col-span-3 text-center py-10 text-gray-400 text-sm">No admission type data for this filter</div>
              )}
            </div>
          </Card>

          {/* Patient × Admission cross-tab */}
          <Card title="Patient type × Admission type cross-tab">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Patient type','Admission','Leads','Converted','Conv. rate','Revenue'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crossStats.length === 0
                    ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">No data</td></tr>
                    : crossStats.map((r:any, i:number) => {
                        const ptOpt = PATIENT_TYPE_OPTIONS.find(o => o.value === r.patientType)
                        const adOpt = ADMISSION_TYPE_OPTIONS.find(o => o.value === r.admissionType)
                        return (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ptOpt?.color ?? 'bg-gray-100 text-gray-700'}`}>
                                {ptOpt?.icon} {ptOpt?.label ?? r.patientType}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {r.admissionType && r.admissionType !== 'None'
                                ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${adOpt?.color ?? 'bg-gray-100 text-gray-700'}`}>
                                    {adOpt?.icon} {adOpt?.label ?? r.admissionType}
                                  </span>
                                : <span className="text-gray-300 text-xs">—</span>
                              }
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">{r.totalLeads}</td>
                            <td className="px-4 py-2.5 text-gray-600">{r.totalConverted}</td>
                            <td className="px-4 py-2.5 w-32"><RateBar value={r.conversionRate}/></td>
                            <td className="px-4 py-2.5 font-semibold text-brand-700">{formatCurrency(r.totalRevenue)}</td>
                          </tr>
                        )
                      })
                  }
                </tbody>
              </table>
            </div>
          </Card>

          {/* Patient type chart */}
          {patientStats.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="Patient type — leads & revenue">
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={patientStats} margin={{top:4,right:8,bottom:4,left:8}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="patientType" tick={{fontSize:12,fill:'#6b7280'}}
                        tickFormatter={(v:string) => v === 'new' ? '🆕 New' : '🔄 Existing'} />
                      <YAxis tick={{fontSize:10,fill:'#9ca3af'}} />
                      <Tooltip contentStyle={{fontSize:12,borderRadius:8}} />
                      <Legend wrapperStyle={{fontSize:12}} />
                      <Bar dataKey="totalLeads"     name="Leads"     fill="#0d9488" radius={[4,4,0,0]} />
                      <Bar dataKey="totalConverted" name="Converted" fill="#5eead4" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card title="Admission type — revenue pie">
                <div className="p-4 flex items-center justify-center">
                  {admissionStats.filter((a:any) => a.admissionType && a.admissionType !== 'null').length > 0
                    ? <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={admissionStats.filter((a:any) => a.admissionType && a.admissionType !== 'null')}
                            dataKey="totalRevenue" nameKey="admissionType" cx="50%" cy="50%" outerRadius={80}
                            label={({admissionType,percent}:any) => `${admissionType} ${(percent*100).toFixed(0)}%`}
                            labelLine={false}>
                            {admissionStats.filter((a:any) => a.admissionType && a.admissionType !== 'null').map((_:any,i:number) => (
                              <Cell key={i} fill={['#ef4444','#f59e0b','#06b6d4'][i % 3]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={(v:any)=>[formatCurrency(v),'Revenue']} />
                          <Legend wrapperStyle={{fontSize:12}} />
                        </PieChart>
                      </ResponsiveContainer>
                    : <div className="text-gray-400 text-sm py-10">No admission data</div>
                  }
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ════ PERIOD COMPARISON ════ */}
      {activeTab === 'compare' && (
        <div className="space-y-5">
          {!filters.dateFrom || !filters.dateTo ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
              Select a date range above to compare against the previous period.
            </div>
          ) : !comparison ? (
            <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label:'Current period',  data:comparison.current,  color:'bg-brand-50 border-brand-200'  },
                  { label:'Previous period', data:comparison.previous, color:'bg-gray-50 border-gray-200'    },
                ].map(p => (
                  <div key={p.label} className={`rounded-xl border p-5 ${p.color}`}>
                    <p className="text-sm font-semibold text-gray-700 mb-1">{p.label}</p>
                    <p className="text-xs text-gray-400 mb-4">{p.data.period}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { l:'Leads given', v:p.data.totalLeadsGiven },
                        { l:'Leads worked',v:p.data.totalLeads      },
                        { l:'Converted',   v:p.data.totalConverted  },
                        { l:'Revenue',     v:formatCurrency(p.data.totalRevenue) },
                      ].map(m => (
                        <div key={m.l}>
                          <p className="text-xs text-gray-500">{m.l}</p>
                          <p className="text-lg font-bold text-gray-900">{m.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Change indicators */}
              <Card title="Period-over-period change">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                  {[
                    { l:'Leads given',  key:'leadsGiven' },
                    { l:'Leads worked', key:'leads'      },
                    { l:'Converted',    key:'converted'  },
                    { l:'Revenue',      key:'revenue'    },
                  ].map(m => (
                    <div key={m.l} className="p-5 text-center">
                      <p className="text-xs text-gray-500 mb-2">{m.l}</p>
                      <Delta val={comparison.changes[m.key]} />
                      <p className="text-xs text-gray-400 mt-1">vs prev. period</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ════ INSURANCE ════ */}
      {activeTab === 'insurance' && (
        <div className="space-y-5">
          {/* Summary cards — top 3 insurers */}
          {insuranceStats.length > 0 && (
            <div className={`grid gap-4 ${insuranceStats.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : `grid-cols-${insuranceStats.length}`}`}>
              {insuranceStats.slice(0, 3).map((ins: any, idx: number) => (
                <div key={ins.insuranceCompany} className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: ['#7c3aed','#8b5cf6','#a78bfa'][idx] }}>#{idx+1}</span>
                    <p className="text-sm font-semibold text-gray-800 truncate">{ins.insuranceCompany}</p>
                  </div>
                  <p className="text-2xl font-bold text-violet-700">{formatCurrency(ins.totalRevenue)}</p>
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <div className="flex justify-between"><span>Leads</span><span className="font-medium text-gray-700">{formatNumber(ins.totalLeads)}</span></div>
                    <div className="flex justify-between"><span>Converted</span><span className="font-medium text-gray-700">{ins.totalConverted}</span></div>
                    <div className="flex justify-between"><span>Avg/conv</span><span className="font-medium text-gray-700">{formatCurrency(ins.avgRevenue)}</span></div>
                  </div>
                  <div className="mt-2"><RateBar value={ins.conversionRate} /></div>
                </div>
              ))}
            </div>
          )}

          {/* Bar chart — revenue by insurer */}
          {insuranceStats.length > 0 && (
            <Card title="Revenue by GID Insurance Company">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={Math.max(300, insuranceStats.length * 32)}>
                  <BarChart data={insuranceStats} layout="vertical" margin={{top:4,right:60,bottom:4,left:4}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="insuranceCompany" tick={{fontSize:11,fill:'#374151'}} width={190}
                      tickFormatter={(v:string) => v.length > 28 ? v.slice(0,28)+'…' : v} />
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8}}
                      formatter={(v:any,name:string) => [name==='Revenue'?formatCurrency(v):v, name]} />
                    <Legend wrapperStyle={{fontSize:12}} />
                    <Bar dataKey="totalRevenue" name="Revenue" fill="#7c3aed" radius={[0,4,4,0]} />
                    <Bar dataKey="totalLeads"   name="Leads"   fill="#a78bfa" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Full table — all companies */}
          <Card title="All GID Insurance Companies — detailed breakdown">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-violet-50 border-b border-violet-100">
                    {['#', 'Insurance Company', 'Leads', 'Converted', 'Conv. rate', 'Revenue', 'Avg ₹/conv'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {insuranceStats.length === 0
                    ? <tr><td colSpan={7} className="text-center py-14 text-gray-400">
                        <p className="text-2xl mb-2">🏢</p>
                        <p className="font-medium">No insurance data yet</p>
                        <p className="text-xs mt-1">Insurance company will show here once telecallers select it during entry</p>
                      </td></tr>
                    : insuranceStats.map((ins: any, idx: number) => (
                        <tr key={ins.insuranceCompany} className="border-b border-gray-50 hover:bg-violet-50/40">
                          <td className="px-4 py-2.5 text-xs text-gray-400 font-medium">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-900">{ins.insuranceCompany}</td>
                          <td className="px-4 py-2.5 text-gray-600">{formatNumber(ins.totalLeads)}</td>
                          <td className="px-4 py-2.5 text-gray-600">{ins.totalConverted}</td>
                          <td className="px-4 py-2.5 w-32"><RateBar value={ins.conversionRate} /></td>
                          <td className="px-4 py-2.5 font-semibold text-violet-700">{formatCurrency(ins.totalRevenue)}</td>
                          <td className="px-4 py-2.5 text-gray-500">{formatCurrency(ins.avgRevenue)}</td>
                        </tr>
                      ))
                  }
                </tbody>
                {insuranceStats.length > 0 && (() => {
                  const tot = insuranceStats.reduce((s:any,d:any) => ({l:s.l+d.totalLeads,c:s.c+d.totalConverted,r:s.r+d.totalRevenue}),{l:0,c:0,r:0})
                  return (
                    <tfoot>
                      <tr className="border-t-2 border-violet-200 bg-violet-50 font-bold">
                        <td className="px-4 py-3" colSpan={2}>Total ({insuranceStats.length} companies)</td>
                        <td className="px-4 py-3 text-gray-800">{formatNumber(tot.l)}</td>
                        <td className="px-4 py-3 text-gray-800">{tot.c}</td>
                        <td className="px-4 py-3"><RateBar value={tot.l>0?Math.round(tot.c/tot.l*100):0}/></td>
                        <td className="px-4 py-3 text-violet-700">{formatCurrency(tot.r)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatCurrency(tot.c>0?Math.round(tot.r/tot.c):0)}</td>
                      </tr>
                    </tfoot>
                  )
                })()}
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}










