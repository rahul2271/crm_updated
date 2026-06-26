// 'use client'

// import { useState, useEffect } from 'react'
// import { useFieldArray, useForm, Controller } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Button } from '@/components/ui'
// import { AGE_GROUPS, INDIAN_STATES, todayString, formatDate, formatCurrency } from '@/lib/utils'
// import { Trash2, PlusCircle, CheckCircle, Copy } from 'lucide-react'

// const rowSchema = z.object({
//   disease:          z.string().min(1, 'Select disease'),
//   ageGroup:         z.enum(['0-18', '18-35', '35-60', '60+']),
//   city:             z.string().min(1, 'City required'),
//   state:            z.string().min(1, 'State required'),
//   consultationType: z.enum(['online', 'hospital']),
//   leadsCount:       z.number({ invalid_type_error: 'Required' }).min(0),
//   convertedCount:   z.number({ invalid_type_error: 'Required' }).min(0),
//   revenueGenerated: z.number({ invalid_type_error: 'Required' }).min(0).default(0),
// }).refine(d => d.convertedCount <= d.leadsCount, {
//   message: 'Converted > leads',
//   path: ['convertedCount'],
// })

// const formSchema = z.object({
//   date:            z.string(),
//   totalLeadsGiven: z.number({ invalid_type_error: 'Required' }).min(0),
//   entries:         z.array(rowSchema).min(1, 'Add at least one row'),
//   notes:           z.string().optional(),
// })

// type FormValues = z.infer<typeof formSchema>

// const emptyRow = (): FormValues['entries'][0] => ({
//   disease: '', ageGroup: '18-35', city: '', state: '',
//   consultationType: 'online', leadsCount: 0, convertedCount: 0, revenueGenerated: 0,
// })

// function yesterdayString() {
//   const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]
// }

// export default function EntryPage() {
//   const [diseases,     setDiseases]     = useState<{ name: string; category: string }[]>([])
//   const [saving,       setSaving]       = useState(false)
//   const [saved,        setSaved]        = useState(false)
//   const [loadingDate,  setLoadingDate]  = useState(true)
//   const [selectedDate, setSelectedDate] = useState(todayString())
//   const [hasExisting,  setHasExisting]  = useState(false)

//   const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { date: todayString(), totalLeadsGiven: 0, entries: [emptyRow()], notes: '' },
//   })

//   const { fields, append, remove } = useFieldArray({ control, name: 'entries' })
//   const entries = watch('entries')

//   const totalLeads     = entries.reduce((s: number, e) => s + (Number(e.leadsCount)       || 0), 0)
//   const totalConverted = entries.reduce((s: number, e) => s + (Number(e.convertedCount)   || 0), 0)
//   const totalRevenue   = entries.reduce((s: number, e) => s + (Number(e.revenueGenerated) || 0), 0)

//   useEffect(() => {
//     fetch('/api/diseases').then(r => r.json()).then(d => setDiseases(d.data ?? []))
//   }, [])

//   useEffect(() => {
//     let cancelled = false
//     setLoadingDate(true)
//     setSaved(false)
//     fetch(`/api/entries?date=${selectedDate}`)
//       .then(r => r.json())
//       .then(d => {
//         if (cancelled) return
//         const ex = d.data?.[0]
//         if (ex) {
//           setHasExisting(true)
//           reset({
//             date: ex.date,
//             totalLeadsGiven: ex.totalLeadsGiven,
//             entries: ex.entries.map((e: any) => ({ ...e, revenueGenerated: e.revenueGenerated ?? 0, patientType: e.patientType ?? 'new', admissionType: e.admissionType ?? null })),
//             notes: ex.notes ?? '',
//           })
//         } else {
//           setHasExisting(false)
//           reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
//         }
//         setLoadingDate(false)
//       })
//       .catch(() => {
//         if (cancelled) return
//         setHasExisting(false)
//         reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
//         setLoadingDate(false)
//       })
//     return () => { cancelled = true }
//   }, [selectedDate, reset])

//   const diseasesByCategory = diseases.reduce<Record<string, string[]>>((acc, d) => {
//     if (!acc[d.category]) acc[d.category] = []
//     acc[d.category].push(d.name)
//     return acc
//   }, {})

//   function duplicateRow(i: number) { append({ ...entries[i] }) }

//   async function onSubmit(data: FormValues) {
//     setSaving(true); setSaved(false)
//     try {
//       const res = await fetch('/api/entries', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...data, date: selectedDate }),
//       })
//       if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
//       setHasExisting(true)
//       setSaved(true)
//       setTimeout(() => setSaved(false), 4000)
//     } catch (e) {
//       alert(e instanceof Error ? e.message : 'Save failed')
//     } finally { setSaving(false) }
//   }

//   return (
//     <div>
//       <div className="mb-5">
//         <h1 className="text-2xl font-bold text-gray-900">Daily data entry</h1>
//         <p className="text-sm text-gray-500 mt-1">Switching dates loads that day's sheet — blank if none exists.</p>
//       </div>

//       {saved && (
//         <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
//           <CheckCircle size={16} /> Saved for {formatDate(selectedDate + 'T00:00:00')}!
//         </div>
//       )}

//       {/* Date selector */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
//         <div className="flex items-center gap-3 flex-wrap">
//           <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
//             className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
//           {[{ label: 'Today', val: todayString() }, { label: 'Yesterday', val: yesterdayString() }].map(s => (
//             <button key={s.val} type="button" onClick={() => setSelectedDate(s.val)}
//               className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${selectedDate === s.val ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
//               {s.label}
//             </button>
//           ))}
//           {!loadingDate && (
//             <span className={`text-xs px-3 py-1 rounded-full font-medium ${hasExisting ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
//               {hasExisting ? '✅ Editing existing' : '🆕 New sheet'}
//             </span>
//           )}
//           {loadingDate && (
//             <span className="flex items-center gap-1.5 text-xs text-gray-400">
//               <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin inline-block" /> Loading…
//             </span>
//           )}
//         </div>
//       </div>

//       {loadingDate ? (
//         <div className="flex items-center justify-center py-24">
//           <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit(onSubmit)}>

//           {/* Total leads + running totals in one row */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
//             {/* Total leads given — editable */}
//             <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1">
//               <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leads given to you</label>
//               <input type="number" min={0} placeholder="0"
//                 {...register('totalLeadsGiven', { valueAsNumber: true })}
//                 className="text-xl font-bold text-gray-900 w-full border-0 outline-none focus:outline-none bg-transparent p-0" />
//               {errors.totalLeadsGiven && <p className="text-xs text-red-500">{errors.totalLeadsGiven.message}</p>}
//             </div>
//             {/* Auto totals */}
//             {[
//               { label: 'Rows filled',    value: String(fields.length),          color: 'text-purple-700' },
//               { label: 'Leads worked',   value: String(totalLeads),             color: 'text-blue-700'   },
//               { label: 'Converted',      value: String(totalConverted),         color: 'text-green-700'  },
//               { label: 'Revenue',        value: formatCurrency(totalRevenue),   color: 'text-brand-700'  },
//             ].map(s => (
//               <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3">
//                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
//                 <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Hint */}
//           <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-600">
//             <strong className="text-blue-700">💡 One row = one combination of disease + city + type.</strong>
//             {' '}Same disease, different city or type → add a new row. Use <strong>⧉</strong> to duplicate.
//           </div>

//           {/* ── CARD-PER-ROW layout — no horizontal scroll ── */}
//           <div className="space-y-3 mb-4">
//             {fields.map((field, i) => (
//               <div key={field.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

//                 {/* Row number + actions */}
//                 <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
//                   <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Row {i + 1}</span>
//                   <div className="flex items-center gap-2">
//                     <button type="button" onClick={() => duplicateRow(i)} title="Duplicate this row"
//                       className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
//                       <Copy size={13} /> Duplicate
//                     </button>
//                     {fields.length > 1 && (
//                       <button type="button" onClick={() => remove(i)}
//                         className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium">
//                         <Trash2 size={13} /> Remove
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="p-4 space-y-3">
//                   {/* Line 1: Disease + Type + Leads + Converted + Revenue — always visible */}
//                   <div className="flex flex-wrap items-end gap-3">

//                     {/* Disease */}
//                     <div className="flex flex-col gap-1 min-w-0 flex-1" style={{ minWidth: 160, maxWidth: 240 }}>
//                       <label className="text-xs font-medium text-gray-600">Disease *</label>
//                       <select {...register(`entries.${i}.disease`)}
//                         className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.disease ? 'border-red-400' : 'border-gray-200'}`}>
//                         <option value="">Select disease…</option>
//                         {Object.entries(diseasesByCategory).map(([cat, names]) => (
//                           <optgroup key={cat} label={cat}>
//                             {names.map(n => <option key={n} value={n}>{n}</option>)}
//                           </optgroup>
//                         ))}
//                       </select>
//                       {errors.entries?.[i]?.disease && <p className="text-xs text-red-500">{errors.entries[i]?.disease?.message}</p>}
//                     </div>

//                     {/* Consultation type */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Type</label>
//                       <Controller control={control} name={`entries.${i}.consultationType`}
//                         render={({ field }) => (
//                           <div className="flex rounded-lg border border-gray-200 overflow-hidden h-[38px]">
//                             <button type="button" onClick={() => field.onChange('online')}
//                               className={`px-3 text-xs font-semibold transition-all ${field.value === 'online' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
//                               💻 Online
//                             </button>
//                             <button type="button" onClick={() => field.onChange('hospital')}
//                               className={`px-3 text-xs font-semibold border-l border-gray-200 transition-all ${field.value === 'hospital' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
//                               🏥 Hospital
//                             </button>
//                           </div>
//                         )} />
//                     </div>

//                     {/* Leads */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Leads</label>
//                       <input type="number" min={0} placeholder="0"
//                         {...register(`entries.${i}.leadsCount`, { valueAsNumber: true })}
//                         className={`w-20 rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.leadsCount ? 'border-red-400' : 'border-gray-200'}`} />
//                     </div>

//                     {/* Converted */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Converted</label>
//                       <input type="number" min={0} placeholder="0"
//                         {...register(`entries.${i}.convertedCount`, { valueAsNumber: true })}
//                         className={`w-24 rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.convertedCount ? 'border-red-400' : 'border-gray-200'}`} />
//                       {errors.entries?.[i]?.convertedCount && (
//                         <p className="text-xs text-red-500">{errors.entries[i]?.convertedCount?.message}</p>
//                       )}
//                     </div>

//                     {/* Revenue — always on same line, never hidden */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Revenue (₹)</label>
//                       <div className="relative">
//                         <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₹</span>
//                         <input type="number" min={0} placeholder="0"
//                           {...register(`entries.${i}.revenueGenerated`, { valueAsNumber: true })}
//                           className="w-32 rounded-lg border border-gray-200 pl-6 pr-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
//                       </div>
//                     </div>

//                   </div>

//                   {/* Line 2: Age group + City + State */}
//                   <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-50">

//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-500">Age group</label>
//                       <select {...register(`entries.${i}.ageGroup`)}
//                         className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
//                         {AGE_GROUPS.map(g => <option key={g} value={g}>{g} yrs</option>)}
//                       </select>
//                     </div>

//                     <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 120, maxWidth: 180 }}>
//                       <label className="text-xs font-medium text-gray-500">City *</label>
//                       <input {...register(`entries.${i}.city`)} placeholder="e.g. Mumbai"
//                         className={`rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.city ? 'border-red-400' : 'border-gray-200'}`} />
//                       {errors.entries?.[i]?.city && <p className="text-xs text-red-500">{errors.entries[i]?.city?.message}</p>}
//                     </div>

//                     <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 160, maxWidth: 240 }}>
//                       <label className="text-xs font-medium text-gray-500">State *</label>
//                       <select {...register(`entries.${i}.state`)}
//                         className={`rounded-lg border px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.state ? 'border-red-400' : 'border-gray-200'}`}>
//                         <option value="">Select state…</option>
//                         {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
//                       </select>
//                       {errors.entries?.[i]?.state && <p className="text-xs text-red-500">{errors.entries[i]?.state?.message}</p>}
//                     </div>

//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Add row button */}
//           <button type="button" onClick={() => append(emptyRow())}
//             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-brand-600 hover:border-brand-400 hover:bg-brand-50 transition-all font-medium mb-4">
//             <PlusCircle size={16} /> Add disease row
//           </button>

//           {/* Notes */}
//           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
//             <label className="text-sm font-medium text-gray-700 block mb-2">Notes (optional)</label>
//             <textarea {...register('notes')} rows={2} placeholder="Any remarks about today's calls, follow-ups…"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
//           </div>

//           <div className="flex items-center gap-4">
//             <Button type="submit" loading={saving} size="lg">
//               {hasExisting ? 'Update data' : 'Save data'}
//             </Button>
//             <p className="text-sm text-gray-400">
//               {hasExisting ? 'Updates existing record for this date.' : 'Creates a new record for this date.'}
//             </p>
//           </div>

//         </form>
//       )}
//     </div>
//   )
// }


// 'use client'

// import { useState, useEffect } from 'react'
// import { useFieldArray, useForm, Controller } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Button } from '@/components/ui'
// import { CONSULT_OPTIONS } from '@/types'
// import { AGE_GROUPS, INDIAN_STATES, todayString, formatDate, formatCurrency } from '@/lib/utils'
// import { Trash2, PlusCircle, CheckCircle, Copy } from 'lucide-react'

// const rowSchema = z.object({
//   disease:          z.string().min(1, 'Select disease'),
//   ageGroup:         z.enum(['0-18', '18-35', '35-60', '60+']),
//   city:             z.string().min(1, 'City'),
//   state:            z.string().min(1, 'State'),
//   consultationType: z.enum(['online', 'hospital', 'whatsapp', 'call']),
//   leadsCount:       z.number({ invalid_type_error: 'Required' }).min(0),
//   convertedCount:   z.number({ invalid_type_error: 'Required' }).min(0),
//   revenueGenerated: z.number({ invalid_type_error: 'Required' }).min(0).default(0),
// }).refine(d => d.convertedCount <= d.leadsCount, {
//   message: 'Converted > leads',
//   path: ['convertedCount'],
// })

// const formSchema = z.object({
//   date:            z.string(),
//   totalLeadsGiven: z.number({ invalid_type_error: 'Required' }).min(0),
//   entries:         z.array(rowSchema).min(1, 'Add at least one row'),
//   notes:           z.string().optional(),
// })

// type FormValues = z.infer<typeof formSchema>

// const emptyRow = (): FormValues['entries'][0] => ({
//   disease: '', ageGroup: '18-35', city: '', state: '',
//   consultationType: 'online', leadsCount: 0, convertedCount: 0, revenueGenerated: 0,
// })

// function yesterdayString() {
//   const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]
// }

// export default function EntryPage() {
//   const [diseases,     setDiseases]     = useState<{ name: string; category: string }[]>([])
//   const [saving,       setSaving]       = useState(false)
//   const [saved,        setSaved]        = useState(false)
//   const [loadingDate,  setLoadingDate]  = useState(true)
//   const [selectedDate, setSelectedDate] = useState(todayString())
//   const [hasExisting,  setHasExisting]  = useState(false)

//   const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { date: todayString(), totalLeadsGiven: 0, entries: [emptyRow()], notes: '' },
//   })

//   const { fields, append, remove } = useFieldArray({ control, name: 'entries' })
//   const entries = watch('entries')

//   const totalLeads     = entries.reduce((s: number, e) => s + (Number(e.leadsCount)       || 0), 0)
//   const totalConverted = entries.reduce((s: number, e) => s + (Number(e.convertedCount)   || 0), 0)
//   const totalRevenue   = entries.reduce((s: number, e) => s + (Number(e.revenueGenerated) || 0), 0)

//   useEffect(() => {
//     fetch('/api/diseases').then(r => r.json()).then(d => setDiseases(d.data ?? []))
//   }, [])

//   useEffect(() => {
//     let cancelled = false
//     setLoadingDate(true)
//     setSaved(false)
//     fetch(`/api/entries?date=${selectedDate}`)
//       .then(r => r.json())
//       .then(d => {
//         if (cancelled) return
//         const ex = d.data?.[0]
//         if (ex) {
//           setHasExisting(true)
//           reset({
//             date: ex.date,
//             totalLeadsGiven: ex.totalLeadsGiven,
//             entries: ex.entries.map((e: FormValues['entries'][0]) => ({ ...e, revenueGenerated: e.revenueGenerated ?? 0 })),
//             notes: ex.notes ?? '',
//           })
//         } else {
//           setHasExisting(false)
//           reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
//         }
//         setLoadingDate(false)
//       })
//       .catch(() => {
//         if (cancelled) return
//         setHasExisting(false)
//         reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
//         setLoadingDate(false)
//       })
//     return () => { cancelled = true }
//   }, [selectedDate, reset])

//   const diseasesByCategory = diseases.reduce<Record<string, string[]>>((acc, d) => {
//     if (!acc[d.category]) acc[d.category] = []
//     acc[d.category].push(d.name)
//     return acc
//   }, {})

//   function duplicateRow(i: number) { append({ ...entries[i] }) }

//   async function onSubmit(data: FormValues) {
//     setSaving(true); setSaved(false)
//     try {
//       const res = await fetch('/api/entries', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...data, date: selectedDate }),
//       })
//       if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
//       setHasExisting(true)
//       setSaved(true)
//       setTimeout(() => setSaved(false), 4000)
//     } catch (e) {
//       alert(e instanceof Error ? e.message : 'Save failed')
//     } finally { setSaving(false) }
//   }

//   return (
//     <div>
//       <div className="mb-5">
//         <h1 className="text-2xl font-bold text-gray-900">Daily data entry</h1>
//         <p className="text-sm text-gray-500 mt-1">Switching dates loads that day&apos;s sheet — blank if none exists.</p>
//       </div>

//       {saved && (
//         <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
//           <CheckCircle size={16} /> Saved for {formatDate(selectedDate + 'T00:00:00')}!
//         </div>
//       )}

//       {/* Date selector */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
//         <div className="flex items-center gap-3 flex-wrap">
//           <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
//             className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
//           {[{ label: 'Today', val: todayString() }, { label: 'Yesterday', val: yesterdayString() }].map(s => (
//             <button key={s.val} type="button" onClick={() => setSelectedDate(s.val)}
//               className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${selectedDate === s.val ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
//               {s.label}
//             </button>
//           ))}
//           {!loadingDate && (
//             <span className={`text-xs px-3 py-1 rounded-full font-medium ${hasExisting ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
//               {hasExisting ? '✅ Editing existing' : '🆕 New sheet'}
//             </span>
//           )}
//           {loadingDate && (
//             <span className="flex items-center gap-1.5 text-xs text-gray-400">
//               <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin inline-block" /> Loading…
//             </span>
//           )}
//         </div>
//       </div>

//       {loadingDate ? (
//         <div className="flex items-center justify-center py-24">
//           <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit(onSubmit)}>

//           {/* Total leads + running totals */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
//             <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1">
//               <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leads given to you</label>
//               <input type="number" min={0} placeholder="0"
//                 {...register('totalLeadsGiven', { valueAsNumber: true })}
//                 className="text-xl font-bold text-gray-900 w-full border-0 outline-none bg-transparent p-0" />
//               {errors.totalLeadsGiven && <p className="text-xs text-red-500">{errors.totalLeadsGiven.message}</p>}
//             </div>
//             {[
//               { label: 'Rows filled',   value: String(fields.length),        color: 'text-purple-700' },
//               { label: 'Leads worked',  value: String(totalLeads),           color: 'text-blue-700'   },
//               { label: 'Converted',     value: String(totalConverted),       color: 'text-green-700'  },
//               { label: 'Revenue',       value: formatCurrency(totalRevenue), color: 'text-brand-700'  },
//             ].map(s => (
//               <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3">
//                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
//                 <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Hint */}
//           <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-600">
//             <strong className="text-blue-700">💡 One row = one combination of disease + city + type.</strong>
//             {' '}Same disease, different city or type → add a new row. Use <strong>⧉</strong> to duplicate.
//           </div>

//           {/* Disease rows */}
//           <div className="space-y-3 mb-4">
//             {fields.map((field, i) => (
//               <div key={field.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

//                 {/* Row header */}
//                 <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
//                   <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Row {i + 1}</span>
//                   <div className="flex items-center gap-2">
//                     <button type="button" onClick={() => duplicateRow(i)}
//                       className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
//                       <Copy size={13} /> Duplicate
//                     </button>
//                     {fields.length > 1 && (
//                       <button type="button" onClick={() => remove(i)}
//                         className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium">
//                         <Trash2 size={13} /> Remove
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="p-4 space-y-3">
//                   {/* Line 1: Disease + Type + Leads + Converted + Revenue */}
//                   <div className="flex flex-wrap items-end gap-3">

//                     {/* Disease */}
//                     <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 160, maxWidth: 240 }}>
//                       <label className="text-xs font-medium text-gray-600">Disease *</label>
//                       <select {...register(`entries.${i}.disease`)}
//                         className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.disease ? 'border-red-400' : 'border-gray-200'}`}>
//                         <option value="">Select disease…</option>
//                         {Object.entries(diseasesByCategory).map(([cat, names]) => (
//                           <optgroup key={cat} label={cat}>
//                             {names.map(n => <option key={n} value={n}>{n}</option>)}
//                           </optgroup>
//                         ))}
//                       </select>
//                       {errors.entries?.[i]?.disease && <p className="text-xs text-red-500">{errors.entries[i]?.disease?.message}</p>}
//                     </div>

//                     {/* Consultation type — dropdown with 4 options */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Type</label>
//                       <Controller control={control} name={`entries.${i}.consultationType`}
//                         render={({ field }) => (
//                           <select
//                             value={field.value}
//                             onChange={e => field.onChange(e.target.value)}
//                             className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
//                             style={{ minWidth: 155 }}
//                           >
//                             {CONSULT_OPTIONS.map(opt => (
//                               <option key={opt.value} value={opt.value}>
//                                 {opt.icon} {opt.label}
//                               </option>
//                             ))}
//                           </select>
//                         )} />
//                     </div>

//                     {/* Leads */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Leads</label>
//                       <input type="number" min={0} placeholder="0"
//                         {...register(`entries.${i}.leadsCount`, { valueAsNumber: true })}
//                         className={`w-20 rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.leadsCount ? 'border-red-400' : 'border-gray-200'}`} />
//                     </div>

//                     {/* Converted */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Converted</label>
//                       <input type="number" min={0} placeholder="0"
//                         {...register(`entries.${i}.convertedCount`, { valueAsNumber: true })}
//                         className={`w-24 rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.convertedCount ? 'border-red-400' : 'border-gray-200'}`} />
//                       {errors.entries?.[i]?.convertedCount && (
//                         <p className="text-xs text-red-500">{errors.entries[i]?.convertedCount?.message}</p>
//                       )}
//                     </div>

//                     {/* Revenue */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Revenue (₹)</label>
//                       <div className="relative">
//                         <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₹</span>
//                         <input type="number" min={0} placeholder="0"
//                           {...register(`entries.${i}.revenueGenerated`, { valueAsNumber: true })}
//                           className="w-32 rounded-lg border border-gray-200 pl-6 pr-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
//                       </div>
//                     </div>

//                   </div>

//                   {/* Line 2: Age group + City + State */}
//                   <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-50">
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-500">Age group</label>
//                       <select {...register(`entries.${i}.ageGroup`)}
//                         className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
//                         {AGE_GROUPS.map(g => <option key={g} value={g}>{g} yrs</option>)}
//                       </select>
//                     </div>
//                     <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 120, maxWidth: 180 }}>
//                       <label className="text-xs font-medium text-gray-500">City</label>
//                       <input {...register(`entries.${i}.city`)} placeholder="e.g. Mumbai"
//                         className={`rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.city ? 'border-red-400' : 'border-gray-200'}`} />
//                     </div>
//                     <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 160, maxWidth: 240 }}>
//                       <label className="text-xs font-medium text-gray-500">State</label>
//                       <select {...register(`entries.${i}.state`)}
//                         className={`rounded-lg border px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.state ? 'border-red-400' : 'border-gray-200'}`}>
//                         <option value="">Select state…</option>
//                         {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Add row */}
//           <button type="button" onClick={() => append(emptyRow())}
//             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-brand-600 hover:border-brand-400 hover:bg-brand-50 transition-all font-medium mb-4">
//             <PlusCircle size={16} /> Add disease row
//           </button>

//           {/* Notes */}
//           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
//             <label className="text-sm font-medium text-gray-700 block mb-2">Notes (optional)</label>
//             <textarea {...register('notes')} rows={2} placeholder="Any remarks about today&apos;s calls, follow-ups…"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
//           </div>

//           <div className="flex items-center gap-4">
//             <Button type="submit" loading={saving} size="lg">
//               {hasExisting ? 'Update data' : 'Save data'}
//             </Button>
//             <p className="text-sm text-gray-400">
//               {hasExisting ? 'Updates existing record for this date.' : 'Creates a new record for this date.'}
//             </p>
//           </div>

//         </form>
//       )}
//     </div>
//   )
// }





// 'use client'

// import { useState, useEffect } from 'react'
// import { useFieldArray, useForm, Controller } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Button } from '@/components/ui'
// import { CitySearch } from '@/components/ui/CitySearch'
// import { AGE_GROUPS, INDIAN_STATES, todayString, formatDate, formatCurrency } from '@/lib/utils'
// import { Trash2, PlusCircle, CheckCircle, Copy } from 'lucide-react'

// const rowSchema = z.object({
//   disease:          z.string().min(1, 'Select disease'),
//   ageGroup:         z.enum(['0-18', '18-35', '35-60', '60+']),
//   city:             z.string().min(1, 'City required'),
//   state:            z.string().min(1, 'State required'),
//   // consultationType: z.enum(['online', 'hospital']),
// consultationType: z.enum(['online', 'hospital', 'whatsapp', 'call']),

//   leadsCount:       z.number({ invalid_type_error: 'Required' }).min(0),
//   convertedCount:   z.number({ invalid_type_error: 'Required' }).min(0),
//   revenueGenerated: z.number({ invalid_type_error: 'Required' }).min(0).default(0),
// }).refine(d => d.convertedCount <= d.leadsCount, {
//   message: 'Converted > leads',
//   path: ['convertedCount'],
// })

// const formSchema = z.object({
//   date:            z.string(),
//   totalLeadsGiven: z.number({ invalid_type_error: 'Required' }).min(0),
//   entries:         z.array(rowSchema).min(1, 'Add at least one row'),
//   notes:           z.string().optional(),
// })

// type FormValues = z.infer<typeof formSchema>

// const emptyRow = (): FormValues['entries'][0] => ({
//   disease: '', ageGroup: '18-35', city: '', state: '',
//   consultationType: 'online', leadsCount: 0, convertedCount: 0, revenueGenerated: 0,
// })

// function yesterdayString() {
//   const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]
// }

// export default function EntryPage() {
//   const [diseases,     setDiseases]     = useState<{ name: string; category: string }[]>([])
//   const [saving,       setSaving]       = useState(false)
//   const [saved,        setSaved]        = useState(false)
//   const [loadingDate,  setLoadingDate]  = useState(true)
//   const [selectedDate, setSelectedDate] = useState(todayString())
//   const [hasExisting,  setHasExisting]  = useState(false)

//   const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { date: todayString(), totalLeadsGiven: 0, entries: [emptyRow()], notes: '' },
//   })

//   const { fields, append, remove } = useFieldArray({ control, name: 'entries' })
//   const entries = watch('entries')

//   const totalLeads     = entries.reduce((s: number, e) => s + (Number(e.leadsCount)       || 0), 0)
//   const totalConverted = entries.reduce((s: number, e) => s + (Number(e.convertedCount)   || 0), 0)
//   const totalRevenue   = entries.reduce((s: number, e) => s + (Number(e.revenueGenerated) || 0), 0)

//   useEffect(() => {
//     fetch('/api/diseases').then(r => r.json()).then(d => setDiseases(d.data ?? []))
//   }, [])

//   useEffect(() => {
//     let cancelled = false
//     setLoadingDate(true)
//     setSaved(false)
//     fetch(`/api/entries?date=${selectedDate}`)
//       .then(r => r.json())
//       .then(d => {
//         if (cancelled) return
//         const ex = d.data?.[0]
//         if (ex) {
//           setHasExisting(true)
//           reset({
//             date: ex.date,
//             totalLeadsGiven: ex.totalLeadsGiven,
//             entries: ex.entries.map((e: any) => ({ ...e, revenueGenerated: e.revenueGenerated ?? 0, patientType: e.patientType ?? 'new', admissionType: e.admissionType ?? null })),
//             notes: ex.notes ?? '',
//           })
//         } else {
//           setHasExisting(false)
//           reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
//         }
//         setLoadingDate(false)
//       })
//       .catch(() => {
//         if (cancelled) return
//         setHasExisting(false)
//         reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
//         setLoadingDate(false)
//       })
//     return () => { cancelled = true }
//   }, [selectedDate, reset])

//   const diseasesByCategory = diseases.reduce<Record<string, string[]>>((acc, d) => {
//     if (!acc[d.category]) acc[d.category] = []
//     acc[d.category].push(d.name)
//     return acc
//   }, {})

//   function duplicateRow(i: number) { append({ ...entries[i] }) }

//   async function onSubmit(data: FormValues) {
//     setSaving(true); setSaved(false)
//     try {
//       const res = await fetch('/api/entries', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...data, date: selectedDate }),
//       })
//       if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
//       setHasExisting(true)
//       setSaved(true)
//       setTimeout(() => setSaved(false), 4000)
//     } catch (e) {
//       alert(e instanceof Error ? e.message : 'Save failed')
//     } finally { setSaving(false) }
//   }

//   return (
//     <div>
//       <div className="mb-5">
//         <h1 className="text-2xl font-bold text-gray-900">Daily data entry</h1>
//         <p className="text-sm text-gray-500 mt-1">Switching dates loads that day's sheet — blank if none exists.</p>
//       </div>

//       {saved && (
//         <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
//           <CheckCircle size={16} /> Saved for {formatDate(selectedDate + 'T00:00:00')}!
//         </div>
//       )}

//       {/* Date selector */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
//         <div className="flex items-center gap-3 flex-wrap">
//           <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
//             className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
//           {[{ label: 'Today', val: todayString() }, { label: 'Yesterday', val: yesterdayString() }].map(s => (
//             <button key={s.val} type="button" onClick={() => setSelectedDate(s.val)}
//               className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${selectedDate === s.val ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
//               {s.label}
//             </button>
//           ))}
//           {!loadingDate && (
//             <span className={`text-xs px-3 py-1 rounded-full font-medium ${hasExisting ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
//               {hasExisting ? '✅ Editing existing' : '🆕 New sheet'}
//             </span>
//           )}
//           {loadingDate && (
//             <span className="flex items-center gap-1.5 text-xs text-gray-400">
//               <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin inline-block" /> Loading…
//             </span>
//           )}
//         </div>
//       </div>

//       {loadingDate ? (
//         <div className="flex items-center justify-center py-24">
//           <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit(onSubmit)}>

//           {/* Total leads + running totals in one row */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
//             {/* Total leads given — editable */}
//             <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1">
//               <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leads given to you</label>
//               <input type="number" min={0} placeholder="0"
//                 {...register('totalLeadsGiven', { valueAsNumber: true })}
//                 className="text-xl font-bold text-gray-900 w-full border-0 outline-none focus:outline-none bg-transparent p-0" />
//               {errors.totalLeadsGiven && <p className="text-xs text-red-500">{errors.totalLeadsGiven.message}</p>}
//             </div>
//             {/* Auto totals */}
//             {[
//               { label: 'Rows filled',    value: String(fields.length),          color: 'text-purple-700' },
//               { label: 'Leads worked',   value: String(totalLeads),             color: 'text-blue-700'   },
//               { label: 'Converted',      value: String(totalConverted),         color: 'text-green-700'  },
//               { label: 'Revenue',        value: formatCurrency(totalRevenue),   color: 'text-brand-700'  },
//             ].map(s => (
//               <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3">
//                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
//                 <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Hint */}
//           <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-600">
//             <strong className="text-blue-700">💡 One row = one combination of disease + city + type.</strong>
//             {' '}Same disease, different city or type → add a new row. Use <strong>⧉</strong> to duplicate.
//           </div>

//           {/* ── CARD-PER-ROW layout — no horizontal scroll ── */}
//           <div className="space-y-3 mb-4">
//             {fields.map((field, i) => (
//               <div key={field.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">

//                 {/* Row number + actions */}
//                 <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
//                   <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Row {i + 1}</span>
//                   <div className="flex items-center gap-2">
//                     <button type="button" onClick={() => duplicateRow(i)} title="Duplicate this row"
//                       className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
//                       <Copy size={13} /> Duplicate
//                     </button>
//                     {fields.length > 1 && (
//                       <button type="button" onClick={() => remove(i)}
//                         className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium">
//                         <Trash2 size={13} /> Remove
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="p-4 space-y-3">
//                   {/* Line 1: Disease + Type + Leads + Converted + Revenue — always visible */}
//                   <div className="flex flex-wrap items-end gap-3">

//                     {/* Disease */}
//                     <div className="flex flex-col gap-1 min-w-0 flex-1" style={{ minWidth: 160, maxWidth: 240 }}>
//                       <label className="text-xs font-medium text-gray-600">Disease *</label>
//                       <select {...register(`entries.${i}.disease`)}
//                         className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.disease ? 'border-red-400' : 'border-gray-200'}`}>
//                         <option value="">Select disease…</option>
//                         {Object.entries(diseasesByCategory).map(([cat, names]) => (
//                           <optgroup key={cat} label={cat}>
//                             {names.map(n => <option key={n} value={n}>{n}</option>)}
//                           </optgroup>
//                         ))}
//                       </select>
//                       {errors.entries?.[i]?.disease && <p className="text-xs text-red-500">{errors.entries[i]?.disease?.message}</p>}
//                     </div>

//                     {/* Consultation type */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Type</label>
//                       <Controller control={control} name={`entries.${i}.consultationType`}
//                         render={({ field }) => (
//                           <div className="flex rounded-lg border border-gray-200 overflow-hidden h-[38px]">
//                             <button type="button" onClick={() => field.onChange('online')}
//                               className={`px-3 text-xs font-semibold transition-all ${field.value === 'online' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
//                               💻 Online
//                             </button>
//                             <button type="button" onClick={() => field.onChange('hospital')}
//                               className={`px-3 text-xs font-semibold border-l border-gray-200 transition-all ${field.value === 'hospital' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
//                               🏥 Hospital
//                             </button>
//                           </div>
//                         )} />
//                     </div>

//                     {/* Leads */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Leads</label>
//                       <input type="number" min={0} placeholder="0"
//                         {...register(`entries.${i}.leadsCount`, { valueAsNumber: true })}
//                         className={`w-20 rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.leadsCount ? 'border-red-400' : 'border-gray-200'}`} />
//                     </div>

//                     {/* Converted */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Converted</label>
//                       <input type="number" min={0} placeholder="0"
//                         {...register(`entries.${i}.convertedCount`, { valueAsNumber: true })}
//                         className={`w-24 rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.convertedCount ? 'border-red-400' : 'border-gray-200'}`} />
//                       {errors.entries?.[i]?.convertedCount && (
//                         <p className="text-xs text-red-500">{errors.entries[i]?.convertedCount?.message}</p>
//                       )}
//                     </div>

//                     {/* Revenue — always on same line, never hidden */}
//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-600">Revenue (₹)</label>
//                       <div className="relative">
//                         <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₹</span>
//                         <input type="number" min={0} placeholder="0"
//                           {...register(`entries.${i}.revenueGenerated`, { valueAsNumber: true })}
//                           className="w-32 rounded-lg border border-gray-200 pl-6 pr-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
//                       </div>
//                     </div>

//                   </div>

//                   {/* Line 2: Age group + City + State */}
//                   <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-50">

//                     <div className="flex flex-col gap-1">
//                       <label className="text-xs font-medium text-gray-500">Age group</label>
//                       <select {...register(`entries.${i}.ageGroup`)}
//                         className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
//                         {AGE_GROUPS.map(g => <option key={g} value={g}>{g} yrs</option>)}
//                       </select>
//                     </div>

//                     <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 160, maxWidth: 220 }}>
//                       <label className="text-xs font-medium text-gray-500">City *</label>
//                       <Controller control={control} name={`entries.${i}.city`}
//                         render={({ field }) => (
//                           <CitySearch
//                             value={field.value}
//                             onChange={field.onChange}
//                             error={errors.entries?.[i]?.city?.message}
//                           />
//                         )} />
//                       {errors.entries?.[i]?.city && <p className="text-xs text-red-500">{errors.entries[i]?.city?.message}</p>}
//                     </div>

//                     <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 160, maxWidth: 240 }}>
//                       <label className="text-xs font-medium text-gray-500">State *</label>
//                       <select {...register(`entries.${i}.state`)}
//                         className={`rounded-lg border px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.state ? 'border-red-400' : 'border-gray-200'}`}>
//                         <option value="">Select state…</option>
//                         {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
//                       </select>
//                       {errors.entries?.[i]?.state && <p className="text-xs text-red-500">{errors.entries[i]?.state?.message}</p>}
//                     </div>

//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Add row button */}
//           <button type="button" onClick={() => append(emptyRow())}
//             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-brand-600 hover:border-brand-400 hover:bg-brand-50 transition-all font-medium mb-4">
//             <PlusCircle size={16} /> Add disease row
//           </button>

//           {/* Notes */}
//           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
//             <label className="text-sm font-medium text-gray-700 block mb-2">Notes (optional)</label>
//             <textarea {...register('notes')} rows={2} placeholder="Any remarks about today's calls, follow-ups…"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
//           </div>

//           <div className="flex items-center gap-4">
//             <Button type="submit" loading={saving} size="lg">
//               {hasExisting ? 'Update data' : 'Save data'}
//             </Button>
//             <p className="text-sm text-gray-400">
//               {hasExisting ? 'Updates existing record for this date.' : 'Creates a new record for this date.'}
//             </p>
//           </div>

//         </form>
//       )}
//     </div>
//   )
// }



'use client'

import { useState, useEffect } from 'react'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui'
import { CONSULT_OPTIONS, PATIENT_TYPE_OPTIONS, ADMISSION_TYPE_OPTIONS, GID_INSURANCE_COMPANIES } from '@/types'
import { CitySearch } from '@/components/ui/CitySearch'
import { AGE_GROUPS, INDIAN_STATES, todayString, formatDate, formatCurrency } from '@/lib/utils'
<<<<<<< HEAD
import { Trash2, PlusCircle, CheckCircle, Copy, Clock, AlertTriangle, CalendarX } from 'lucide-react'
=======
import { Trash2, PlusCircle, CheckCircle, Copy } from 'lucide-react'
>>>>>>> origin/main

const rowSchema = z.object({
  disease:          z.string().min(1, 'Select disease'),
  ageGroup:         z.enum(['0-18', '18-35', '35-60', '60+']),
  city:             z.string().min(1, 'City required'),
  state:            z.string().min(1, 'State required'),
  consultationType: z.enum(['online', 'hospital', 'whatsapp', 'call', 'website_booking']),
  patientType:      z.enum(['new', 'existing']).default('new'),
  admissionType:    z.enum(['IPD', 'OPD', 'Cashless']).optional().nullable(),
  insuranceCompany: z.string().optional().nullable(),
  leadsCount:       z.number({ invalid_type_error: 'Required' }).min(0),
  convertedCount:   z.number({ invalid_type_error: 'Required' }).min(0),
  revenueGenerated: z.number({ invalid_type_error: 'Required' }).min(0).default(0),
}).refine(d => d.convertedCount <= d.leadsCount, {
  message: 'Converted > leads',
  path: ['convertedCount'],
})

const formSchema = z.object({
  date:            z.string(),
  totalLeadsGiven: z.number({ invalid_type_error: 'Required' }).min(0),
  entries:         z.array(rowSchema).min(1, 'Add at least one row'),
  notes:           z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const emptyRow = (): FormValues['entries'][0] => ({
  disease: '', ageGroup: '18-35', city: '', state: '',
  consultationType: 'online', patientType: 'new', admissionType: null,
  insuranceCompany: null,
  leadsCount: 0, convertedCount: 0, revenueGenerated: 0,
})

function yesterdayString() {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]
}

<<<<<<< HEAD
// Returns IST time components
function getIST() {
  const now   = new Date()
  const ist   = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  const h     = ist.getUTCHours()
  const m     = ist.getUTCMinutes()
  const s     = ist.getUTCSeconds()
  const today = ist.toISOString().split('T')[0]
  return { h, m, s, today }
}

function CountdownBanner({ selectedDate }: { selectedDate: string }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const { h, m, s, today } = getIST()
  const isBackdate = selectedDate !== today

  if (isBackdate) {
    return (
      <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <CalendarX size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-orange-700">Backdated entry</p>
          <p className="text-xs text-orange-600 mt-0.5">
            You're filling for <strong>{formatDate(selectedDate + 'T00:00:00')}</strong> — not today.
            This will be marked as <strong>backdated</strong> and flagged in the admin audit log.
          </p>
        </div>
      </div>
    )
  }

  const deadline = 20 * 3600 // 8 PM in seconds from midnight
  const nowSecs  = h * 3600 + m * 60 + s
  const isLate   = nowSecs >= deadline

  if (isLate) {
    const overSecs = nowSecs - deadline
    const oh = Math.floor(overSecs / 3600)
    const om = Math.floor((overSecs % 3600) / 60)
    return (
      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">⚠️ Late submission — deadline was 8:00 PM</p>
          <p className="text-xs text-red-600 mt-0.5">
            You are <strong>{oh > 0 ? `${oh}h ` : ''}{om}m late</strong>. This entry will be marked late in admin records.
          </p>
        </div>
      </div>
    )
  }

  const remaining = deadline - nowSecs
  const rh = Math.floor(remaining / 3600)
  const rm = Math.floor((remaining % 3600) / 60)
  const rs = remaining % 60
  const urgent = remaining < 30 * 60 // less than 30 min

  return (
    <div className={`mb-4 rounded-xl px-4 py-3 flex items-center gap-3 border ${urgent ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
      <Clock size={16} className={urgent ? 'text-amber-500 flex-shrink-0' : 'text-blue-400 flex-shrink-0'} />
      <p className={`text-sm ${urgent ? 'text-amber-700 font-semibold' : 'text-blue-600'}`}>
        {urgent ? '⚡ ' : ''}Deadline 8:00 PM IST — 
        <span className="font-mono font-bold ml-1">
          {String(rh).padStart(2,'0')}:{String(rm).padStart(2,'0')}:{String(rs).padStart(2,'0')}
        </span>
        {' '}remaining
      </p>
    </div>
  )
}

=======
>>>>>>> origin/main
export default function EntryPage() {
  const [diseases,     setDiseases]     = useState<{ name: string; category: string }[]>([])
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [loadingDate,  setLoadingDate]  = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [hasExisting,  setHasExisting]  = useState(false)

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: todayString(), totalLeadsGiven: 0, entries: [emptyRow()], notes: '' },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'entries' })
  const entries = watch('entries')

  const totalLeads     = entries.reduce((s: number, e) => s + (Number(e.leadsCount)       || 0), 0)
  const totalConverted = entries.reduce((s: number, e) => s + (Number(e.convertedCount)   || 0), 0)
  const totalRevenue   = entries.reduce((s: number, e) => s + (Number(e.revenueGenerated) || 0), 0)

  useEffect(() => {
    fetch('/api/diseases').then(r => r.json()).then(d => setDiseases(d.data ?? []))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingDate(true)
    setSaved(false)
    fetch(`/api/entries?date=${selectedDate}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        const ex = d.data?.[0]
        if (ex) {
          setHasExisting(true)
          reset({
            date: ex.date,
            totalLeadsGiven: ex.totalLeadsGiven,
            entries: ex.entries.map((e: any) => ({ ...e, revenueGenerated: e.revenueGenerated ?? 0, patientType: e.patientType ?? 'new', admissionType: e.admissionType ?? null })),
            notes: ex.notes ?? '',
          })
        } else {
          setHasExisting(false)
          reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
        }
        setLoadingDate(false)
      })
      .catch(() => {
        if (cancelled) return
        setHasExisting(false)
        reset({ date: selectedDate, totalLeadsGiven: 0, entries: [emptyRow()], notes: '' })
        setLoadingDate(false)
      })
    return () => { cancelled = true }
  }, [selectedDate, reset])

  const diseasesByCategory = diseases.reduce<Record<string, string[]>>((acc, d) => {
    if (!acc[d.category]) acc[d.category] = []
    acc[d.category].push(d.name)
    return acc
  }, {})

  function duplicateRow(i: number) { append({ ...entries[i] }) }

<<<<<<< HEAD
  const [auditResult, setAuditResult] = useState<{ isLate: boolean; isBackdate: boolean } | null>(null)

  async function onSubmit(data: FormValues) {
    setSaving(true); setSaved(false); setAuditResult(null)
=======
  async function onSubmit(data: FormValues) {
    setSaving(true); setSaved(false)
>>>>>>> origin/main
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, date: selectedDate }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
<<<<<<< HEAD
      const json = await res.json()
      setHasExisting(true)
      setSaved(true)
      if (json.audit) setAuditResult(json.audit)
      setTimeout(() => setSaved(false), 5000)
=======
      setHasExisting(true)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
>>>>>>> origin/main
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div>
<<<<<<< HEAD
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Daily data entry</h1>
        <p className="text-sm text-gray-500 mt-0.5">Switching dates loads that day's sheet — blank if none exists.</p>
      </div>

      {/* Countdown / late / backdate banner */}
      <CountdownBanner selectedDate={selectedDate} />

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
          <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Saved for {formatDate(selectedDate + 'T00:00:00')}!</p>
            {auditResult?.isLate && (
              <p className="text-xs text-amber-600 font-medium mt-0.5">⚠️ Marked as late — submitted after 8 PM</p>
            )}
            {auditResult?.isBackdate && (
              <p className="text-xs text-orange-600 font-medium mt-0.5">📅 Marked as backdated — submitted on a different day</p>
            )}
          </div>
=======
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Daily data entry</h1>
        <p className="text-sm text-gray-500 mt-1">Switching dates loads that day's sheet — blank if none exists.</p>
      </div>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={16} /> Saved for {formatDate(selectedDate + 'T00:00:00')}!
>>>>>>> origin/main
        </div>
      )}

      {/* Date selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          {[{ label: 'Today', val: todayString() }, { label: 'Yesterday', val: yesterdayString() }].map(s => (
            <button key={s.val} type="button" onClick={() => setSelectedDate(s.val)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${selectedDate === s.val ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s.label}
            </button>
          ))}
          {!loadingDate && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${hasExisting ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {hasExisting ? '✅ Editing existing' : '🆕 New sheet'}
            </span>
          )}
          {loadingDate && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin inline-block" /> Loading…
            </span>
          )}
        </div>
      </div> 

      {loadingDate ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>

<<<<<<< HEAD
          {/* Total leads + running totals */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">Leads given</label>
              <input type="number" min={0} placeholder="0"
                {...register('totalLeadsGiven', { valueAsNumber: true })}
                className="text-lg font-bold text-gray-900 w-full border-0 outline-none focus:outline-none bg-transparent p-0" />
              {errors.totalLeadsGiven && <p className="text-xs text-red-500">{errors.totalLeadsGiven.message}</p>}
            </div>
            {[
              { label: 'Rows',      value: String(fields.length),        color: 'text-purple-700' },
              { label: 'Worked',    value: String(totalLeads),           color: 'text-blue-700'   },
              { label: 'Converted', value: String(totalConverted),       color: 'text-green-700'  },
              { label: 'Revenue',   value: formatCurrency(totalRevenue), color: 'text-brand-700'  },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">{s.label}</p>
                <p className={`text-lg font-bold mt-1 ${s.color} truncate`}>{s.value}</p>
=======
          {/* Total leads + running totals in one row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {/* Total leads given — editable */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leads given to you</label>
              <input type="number" min={0} placeholder="0"
                {...register('totalLeadsGiven', { valueAsNumber: true })}
                className="text-xl font-bold text-gray-900 w-full border-0 outline-none focus:outline-none bg-transparent p-0" />
              {errors.totalLeadsGiven && <p className="text-xs text-red-500">{errors.totalLeadsGiven.message}</p>}
            </div>
            {/* Auto totals */}
            {[
              { label: 'Rows filled',    value: String(fields.length),          color: 'text-purple-700' },
              { label: 'Leads worked',   value: String(totalLeads),             color: 'text-blue-700'   },
              { label: 'Converted',      value: String(totalConverted),         color: 'text-green-700'  },
              { label: 'Revenue',        value: formatCurrency(totalRevenue),   color: 'text-brand-700'  },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
>>>>>>> origin/main
              </div>
            ))}
          </div>

          {/* Hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-600">
            <strong className="text-blue-700">💡 One row = one combination of disease + city + type.</strong>
            {' '}Same disease, different city or type → add a new row. Use <strong>⧉</strong> to duplicate.
          </div>

          {/* ── CARD-PER-ROW layout — no horizontal scroll ── */}
          <div className="space-y-3 mb-4">
            {fields.map((field, i) => (
              <div key={field.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">

                {/* Row number + actions */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Row {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => duplicateRow(i)} title="Duplicate this row"
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                      <Copy size={13} /> Duplicate
                    </button>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium">
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                </div>

<<<<<<< HEAD
                <div className="p-3 sm:p-4 space-y-4">

                  {/* ── Section 1: Disease (full width) ── */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Disease *</label>
                    <select {...register(`entries.${i}.disease`)}
                      className={`rounded-lg border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full ${errors.entries?.[i]?.disease ? 'border-red-400' : 'border-gray-200'}`}>
                      <option value="">Select disease…</option>
                      {Object.entries(diseasesByCategory).map(([cat, names]) => (
                        <optgroup key={cat} label={cat}>
                          {names.map(n => <option key={n} value={n}>{n}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    {errors.entries?.[i]?.disease && <p className="text-xs text-red-500">{errors.entries[i]?.disease?.message}</p>}
                  </div>

                  {/* ── Section 2: Consult Type + Patient Type (2-col) ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
=======
                <div className="p-4 space-y-3">
                  {/* Line 1: Disease + Type + Patient + Admission + Insurance + Numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end gap-3">

                    {/* Disease */}
                    <div className="flex flex-col gap-1 sm:col-span-2 lg:flex-1" style={{ minWidth: 0 }}>
                      <label className="text-xs font-medium text-gray-600">Disease *</label>
                      <select {...register(`entries.${i}.disease`)}
                        className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full ${errors.entries?.[i]?.disease ? 'border-red-400' : 'border-gray-200'}`}>
                        <option value="">Select disease…</option>
                        {Object.entries(diseasesByCategory).map(([cat, names]) => (
                          <optgroup key={cat} label={cat}>
                            {names.map(n => <option key={n} value={n}>{n}</option>)}
                          </optgroup>
                        ))}
                      </select>
                      {errors.entries?.[i]?.disease && <p className="text-xs text-red-500">{errors.entries[i]?.disease?.message}</p>}
                    </div>

                    {/* Consultation type */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">Type</label>
>>>>>>> origin/main
                      <Controller control={control} name={`entries.${i}.consultationType`}
                        render={({ field }) => {
                          const opt = CONSULT_OPTIONS.find(o => o.value === field.value)
                          return (
<<<<<<< HEAD
                            <select value={field.value} onChange={e => field.onChange(e.target.value)}
                              className={`rounded-lg border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                                opt?.value === 'online'   ? 'border-blue-300 text-blue-700'     :
                                opt?.value === 'hospital' ? 'border-orange-300 text-orange-700' :
                                opt?.value === 'whatsapp' ? 'border-green-300 text-green-700'   :
                                'border-purple-300 text-purple-700'
                              }`}>
                              {CONSULT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
=======
                            <select
                              value={field.value}
                              onChange={e => field.onChange(e.target.value)}
                              className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                                opt?.value === 'online'   ? 'border-blue-300 text-blue-700'   :
                                opt?.value === 'hospital' ? 'border-orange-300 text-orange-700' :
                                opt?.value === 'whatsapp' ? 'border-green-300 text-green-700'  :
                                'border-purple-300 text-purple-700'
                              }`}
                            >
                              {CONSULT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>
                                  {o.icon} {o.label}
                                </option>
                              ))}
>>>>>>> origin/main
                            </select>
                          )
                        }} />
                    </div>

<<<<<<< HEAD
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient *</label>
=======
                    {/* Patient type */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">Patient *</label>
>>>>>>> origin/main
                      <Controller control={control} name={`entries.${i}.patientType`}
                        render={({ field }) => {
                          const opt = PATIENT_TYPE_OPTIONS.find(o => o.value === field.value)
                          return (
<<<<<<< HEAD
                            <select value={field.value} onChange={e => field.onChange(e.target.value)}
                              className={`rounded-lg border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                                opt?.value === 'new' ? 'border-teal-300 text-teal-700' : 'border-indigo-300 text-indigo-700'
                              }`}>
                              {PATIENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
=======
                            <select
                              value={field.value}
                              onChange={e => field.onChange(e.target.value)}
                              className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                                opt?.value === 'new' ? 'border-teal-300 text-teal-700' : 'border-indigo-300 text-indigo-700'
                              }`}
                            >
                              {PATIENT_TYPE_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                              ))}
>>>>>>> origin/main
                            </select>
                          )
                        }} />
                    </div>
<<<<<<< HEAD
                  </div>

                  {/* ── Section 3: Admission + Insurance (2-col) ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admission</label>
=======

                    {/* Admission type */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">Admission <span className="text-gray-400">(optional)</span></label>
>>>>>>> origin/main
                      <Controller control={control} name={`entries.${i}.admissionType`}
                        render={({ field }) => {
                          const opt = ADMISSION_TYPE_OPTIONS.find(o => o.value === field.value)
                          return (
<<<<<<< HEAD
                            <select value={field.value ?? ''} onChange={e => field.onChange(e.target.value || null)}
                              className={`rounded-lg border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                                opt?.value === 'IPD'      ? 'border-red-300 text-red-700'       :
                                opt?.value === 'OPD'      ? 'border-yellow-300 text-yellow-700' :
                                opt?.value === 'Cashless' ? 'border-cyan-300 text-cyan-700'     :
                                'border-gray-200 text-gray-400'
                              }`}>
                              <option value="">None</option>
                              {ADMISSION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
=======
                            <select
                              value={field.value ?? ''}
                              onChange={e => field.onChange(e.target.value || null)}
                              className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                                opt?.value === 'IPD'      ? 'border-red-300 text-red-700'       :
                                opt?.value === 'OPD'      ? 'border-yellow-300 text-yellow-700' :
                                opt?.value === 'Cashless' ? 'border-cyan-300 text-cyan-700'     :
                                'border-gray-200 text-gray-500'
                              }`}
                            >
                              <option value="">-- None --</option>
                              {ADMISSION_TYPE_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                              ))}
>>>>>>> origin/main
                            </select>
                          )
                        }} />
                    </div>

<<<<<<< HEAD
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Insurance (GID)</label>
                      <Controller control={control} name={`entries.${i}.insuranceCompany`}
                        render={({ field }) => (
                          <select value={field.value ?? ''} onChange={e => field.onChange(e.target.value || null)}
                            className={`rounded-lg border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                              field.value ? 'border-violet-300 text-violet-700' : 'border-gray-200 text-gray-400'
                            }`}>
                            <option value="">Self-pay</option>
                            <optgroup label="GID Insurance">
                              {GID_INSURANCE_COMPANIES.map(name => <option key={name} value={name}>{name}</option>)}
=======
                    {/* Insurance company (GID) */}
                    <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                      <label className="text-xs font-medium text-gray-600">Insurance Co. <span className="text-gray-400">(GID · optional)</span></label>
                      <Controller control={control} name={`entries.${i}.insuranceCompany`}
                        render={({ field }) => (
                          <select
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value || null)}
                            className={`rounded-lg border px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium w-full ${
                              field.value ? 'border-violet-300 text-violet-700' : 'border-gray-200 text-gray-500'
                            }`}
                          >
                            <option value="">🏢 No insurance / Self-pay</option>
                            <optgroup label="GID Insurance Companies">
                              {GID_INSURANCE_COMPANIES.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
>>>>>>> origin/main
                            </optgroup>
                          </select>
                        )} />
                    </div>
<<<<<<< HEAD
                  </div>

                  {/* ── Section 4: Leads + Converted + Revenue (3-col) ── */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Leads</label>
                      <input type="number" min={0} placeholder="0" inputMode="numeric"
                        {...register(`entries.${i}.leadsCount`, { valueAsNumber: true })}
                        className={`rounded-lg border px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-brand-500 w-full ${errors.entries?.[i]?.leadsCount ? 'border-red-400' : 'border-gray-200'}`} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Converted</label>
                      <input type="number" min={0} placeholder="0" inputMode="numeric"
                        {...register(`entries.${i}.convertedCount`, { valueAsNumber: true })}
                        className={`rounded-lg border px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-brand-500 w-full ${errors.entries?.[i]?.convertedCount ? 'border-red-400' : 'border-gray-200'}`} />
=======

                    {/* Leads */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">Leads</label>
                      <input type="number" min={0} placeholder="0"
                        {...register(`entries.${i}.leadsCount`, { valueAsNumber: true })}
                        className={`w-full rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.leadsCount ? 'border-red-400' : 'border-gray-200'}`} />
                    </div>

                    {/* Converted */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">Converted</label>
                      <input type="number" min={0} placeholder="0"
                        {...register(`entries.${i}.convertedCount`, { valueAsNumber: true })}
                        className={`w-full rounded-lg border px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.entries?.[i]?.convertedCount ? 'border-red-400' : 'border-gray-200'}`} />
>>>>>>> origin/main
                      {errors.entries?.[i]?.convertedCount && (
                        <p className="text-xs text-red-500">{errors.entries[i]?.convertedCount?.message}</p>
                      )}
                    </div>

<<<<<<< HEAD
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue ₹</label>
                      <input type="number" min={0} placeholder="0" inputMode="numeric"
                        {...register(`entries.${i}.revenueGenerated`, { valueAsNumber: true })}
                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-brand-500 w-full" />
                    </div>
                  </div>

                  {/* ── Section 5: Age + City + State (3-col on sm, 1-col on xs) ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age group</label>
                      <select {...register(`entries.${i}.ageGroup`)}
                        className="rounded-lg border border-gray-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full">
=======
                    {/* Revenue */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">Revenue (₹)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₹</span>
                        <input type="number" min={0} placeholder="0"
                          {...register(`entries.${i}.revenueGenerated`, { valueAsNumber: true })}
                          className="w-full rounded-lg border border-gray-200 pl-6 pr-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      </div>
                    </div>

                  </div>

                  {/* Line 2: Age group + City + State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-gray-50">

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Age group</label>
                      <select {...register(`entries.${i}.ageGroup`)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full">
>>>>>>> origin/main
                        {AGE_GROUPS.map(g => <option key={g} value={g}>{g} yrs</option>)}
                      </select>
                    </div>

<<<<<<< HEAD
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City *</label>
                      <Controller control={control} name={`entries.${i}.city`}
                        render={({ field }) => (
                          <CitySearch value={field.value} onChange={field.onChange} error={errors.entries?.[i]?.city?.message} />
=======
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">City *</label>
                      <Controller control={control} name={`entries.${i}.city`}
                        render={({ field }) => (
                          <CitySearch
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.entries?.[i]?.city?.message}
                          />
>>>>>>> origin/main
                        )} />
                      {errors.entries?.[i]?.city && <p className="text-xs text-red-500">{errors.entries[i]?.city?.message}</p>}
                    </div>

<<<<<<< HEAD
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">State *</label>
                      <select {...register(`entries.${i}.state`)}
                        className={`rounded-lg border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full ${errors.entries?.[i]?.state ? 'border-red-400' : 'border-gray-200'}`}>
=======
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">State *</label>
                      <select {...register(`entries.${i}.state`)}
                        className={`rounded-lg border px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full ${errors.entries?.[i]?.state ? 'border-red-400' : 'border-gray-200'}`}>
>>>>>>> origin/main
                        <option value="">Select state…</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.entries?.[i]?.state && <p className="text-xs text-red-500">{errors.entries[i]?.state?.message}</p>}
                    </div>
<<<<<<< HEAD
                  </div>

=======

                  </div>
>>>>>>> origin/main
                </div>
              </div>
            ))}
          </div>

          {/* Add row button */}
          <button type="button" onClick={() => append(emptyRow())}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-brand-600 hover:border-brand-400 hover:bg-brand-50 transition-all font-medium mb-4">
            <PlusCircle size={16} /> Add disease row
          </button>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
            <label className="text-sm font-medium text-gray-700 block mb-2">Notes (optional)</label>
            <textarea {...register('notes')} rows={2} placeholder="Any remarks about today's calls, follow-ups…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button type="submit" loading={saving} size="lg">
              {hasExisting ? 'Update data' : 'Save data'}
            </Button>
            <p className="text-sm text-gray-400">
              {hasExisting ? 'Updates existing record for this date.' : 'Creates a new record for this date.'}
            </p>
          </div>

        </form>
      )}
    </div>
  )
}
