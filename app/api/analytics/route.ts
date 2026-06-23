import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { DailyEntry } from '@/models/DailyEntry'
import { User } from '@/models/User'
import { Types } from 'mongoose'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  await connectDB()

  const { searchParams } = new URL(req.url)
  const type          = searchParams.get('type') ?? 'overview'
  const dateFrom      = searchParams.get('dateFrom')
  const dateTo        = searchParams.get('dateTo')
  const telecallerId  = searchParams.get('telecallerId')
  const disease       = searchParams.get('disease')
  const state         = searchParams.get('state')
  const ageGroup      = searchParams.get('ageGroup')
  const consult       = searchParams.get('consultationType')
  const patientType   = searchParams.get('patientType')
  const admissionType = searchParams.get('admissionType')
  const insuranceCompany = searchParams.get('insuranceCompany')

  const docMatch: Record<string, unknown> = {}
  if (telecallerId) docMatch.telecallerId = new Types.ObjectId(telecallerId)
  if (dateFrom || dateTo) {
    const r: Record<string, string> = {}
    if (dateFrom) r.$gte = dateFrom
    if (dateTo)   r.$lte = dateTo
    docMatch.date = r
  }

  const subMatch: Record<string, unknown> = {}
  if (disease)       subMatch['entries.disease']          = disease
  if (state)         subMatch['entries.state']            = state
  if (ageGroup)      subMatch['entries.ageGroup']         = ageGroup
  if (consult)       subMatch['entries.consultationType'] = consult
  if (patientType)   subMatch['entries.patientType']      = patientType
  if (admissionType) subMatch['entries.admissionType']    = admissionType
  if (insuranceCompany) subMatch['entries.insuranceCompany'] = insuranceCompany

  const base = [
    { $match: docMatch },
    { $unwind: '$entries' },
    ...(Object.keys(subMatch).length ? [{ $match: subMatch }] : []),
  ]

  // ── Shared projection helpers ─────────────────────────────────────────────
  const convRateProjection = {
    $round: [{ $multiply: [{ $divide: ['$totalConverted', { $max: ['$totalLeads', 1] }] }, 100] }, 1],
  }
  const avgRevProjection = {
    $cond: [{ $gt: ['$totalConverted', 0] }, { $round: [{ $divide: ['$totalRevenue', '$totalConverted'] }, 0] }, 0],
  }

  // ── overview ─────────────────────────────────────────────────────────────
  if (type === 'overview') {
    const [r] = await DailyEntry.aggregate([
      { $match: docMatch },
      {
        $group: {
          _id: null,
          totalLeadsGiven:  { $sum: '$totalLeadsGiven' },
          totalLeads:       { $sum: { $sum: '$entries.leadsCount' } },
          totalConverted:   { $sum: { $sum: '$entries.convertedCount' } },
          totalRevenue:     { $sum: { $sum: '$entries.revenueGenerated' } },
          totalOnline:      { $sum: { $size: { $filter: { input: '$entries', cond: { $eq: ['$$this.consultationType', 'online'] } } } } },
          totalHospital:    { $sum: { $size: { $filter: { input: '$entries', cond: { $eq: ['$$this.consultationType', 'hospital'] } } } } },
          totalDays:        { $sum: 1 },
        },
      },
    ])
    const activeTelecallers = await User.countDocuments({ role: 'telecaller', isActive: true })
    const tl = r?.totalLeads ?? 0
    const tc = r?.totalConverted ?? 0
    const tr2 = r?.totalRevenue ?? 0
    const days = r?.totalDays ?? 1
    return NextResponse.json({
      success: true,
      data: {
        totalLeadsGiven:       r?.totalLeadsGiven ?? 0,
        totalLeads:            tl,
        totalConverted:        tc,
        totalRevenue:          tr2,
        totalOnlineLeads:      r?.totalOnline ?? 0,
        totalHospitalLeads:    r?.totalHospital ?? 0,
        activeTelecallers,
        conversionRate:        tl ? Math.round(tc / tl * 1000) / 10 : 0,
        avgRevenuePerConversion: tc ? Math.round(tr2 / tc) : 0,
        avgLeadsPerDay:        days ? Math.round(tl / days) : 0,
        avgRevenuePerDay:      days ? Math.round(tr2 / days) : 0,
        utilizationRate:       r?.totalLeadsGiven ? Math.round(tl / r.totalLeadsGiven * 1000) / 10 : 0,
      },
    })
  }

  // ── summary — top performers & insights ──────────────────────────────────
  if (type === 'summary') {
    const [diseaseTop, tcTop, cityTop] = await Promise.all([
      // Top diseases
      DailyEntry.aggregate([
        ...base,
        { $group: { _id: '$entries.disease', leads: { $sum: '$entries.leadsCount' }, converted: { $sum: '$entries.convertedCount' }, revenue: { $sum: '$entries.revenueGenerated' } } },
        { $project: { disease: '$_id', leads: 1, converted: 1, revenue: 1, rate: { $round: [{ $multiply: [{ $divide: ['$converted', { $max: ['$leads', 1] }] }, 100] }, 1] } } },
        { $sort: { leads: -1 } }, { $limit: 5 },
      ]),
      // Top telecallers
      DailyEntry.aggregate([
        { $match: docMatch },
        { $group: { _id: '$telecallerId', leads: { $sum: { $sum: '$entries.leadsCount' } }, converted: { $sum: { $sum: '$entries.convertedCount' } }, revenue: { $sum: { $sum: '$entries.revenueGenerated' } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
        { $unwind: '$u' },
        { $project: { name: '$u.name', leads: 1, converted: 1, revenue: 1, rate: { $round: [{ $multiply: [{ $divide: ['$converted', { $max: ['$leads', 1] }] }, 100] }, 1] } } },
        { $sort: { revenue: -1 } }, { $limit: 5 },
      ]),
      // Top cities
      DailyEntry.aggregate([
        ...base,
        { $group: { _id: { city: '$entries.city', state: '$entries.state' }, leads: { $sum: '$entries.leadsCount' }, converted: { $sum: '$entries.convertedCount' }, revenue: { $sum: '$entries.revenueGenerated' } } },
        { $project: { city: '$_id.city', state: '$_id.state', leads: 1, converted: 1, revenue: 1 } },
        { $sort: { leads: -1 } }, { $limit: 5 },
      ]),
    ])
    return NextResponse.json({ success: true, data: { diseaseTop, tcTop, cityTop } })
  }

  // ── disease ───────────────────────────────────────────────────────────────
  if (type === 'disease') {
    const data = await DailyEntry.aggregate([
      ...base,
      {
        $group: {
          _id: '$entries.disease',
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
          onlineLeads:    { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'online'] },   '$entries.leadsCount', 0] } },
          hospitalLeads:  { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'hospital'] }, '$entries.leadsCount', 0] } },
          onlineConverted:   { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'online'] },   '$entries.convertedCount', 0] } },
          hospitalConverted: { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'hospital'] }, '$entries.convertedCount', 0] } },
          onlineRevenue:   { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'online'] },   '$entries.revenueGenerated', 0] } },
          hospitalRevenue: { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'hospital'] }, '$entries.revenueGenerated', 0] } },
          uniqueDays:     { $addToSet: '$$ROOT.date' },
        },
      },
      {
        $project: {
          disease: '$_id',
          totalLeads: 1, totalConverted: 1, totalRevenue: 1,
          onlineLeads: 1, hospitalLeads: 1,
          onlineConverted: 1, hospitalConverted: 1,
          onlineRevenue: 1, hospitalRevenue: 1,
          activeDays: { $size: '$uniqueDays' },
          conversionRate:        convRateProjection,
          avgRevenue:            avgRevProjection,
          onlineConversionRate:  { $round: [{ $multiply: [{ $divide: ['$onlineConverted',   { $max: ['$onlineLeads',   1] }] }, 100] }, 1] },
          hospitalConversionRate:{ $round: [{ $multiply: [{ $divide: ['$hospitalConverted', { $max: ['$hospitalLeads', 1] }] }, 100] }, 1] },
          avgLeadsPerDay: { $round: [{ $divide: [{ $sum: '$totalLeads' }, { $max: [{ $size: '$uniqueDays' }, 1] }] }, 1] },
        },
      },
      { $sort: { totalLeads: -1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── diseaseDetail — drill-down for one disease ────────────────────────────
  if (type === 'diseaseDetail') {
    if (!disease) return NextResponse.json({ error: 'disease param required' }, { status: 400 })

    const diseaseBase = [
      { $match: docMatch },
      { $unwind: '$entries' },
      { $match: { 'entries.disease': disease } },
    ]

    const [ageBreak, locBreak, tcBreak, trendBreak] = await Promise.all([
      // Age group breakdown
      DailyEntry.aggregate([
        ...diseaseBase,
        { $group: { _id: '$entries.ageGroup', totalLeads: { $sum: '$entries.leadsCount' }, totalConverted: { $sum: '$entries.convertedCount' }, totalRevenue: { $sum: '$entries.revenueGenerated' } } },
        { $project: { ageGroup: '$_id', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection } },
        { $sort: { totalLeads: -1 } },
      ]),
      // Location breakdown
      DailyEntry.aggregate([
        ...diseaseBase,
        { $group: { _id: { city: '$entries.city', state: '$entries.state' }, totalLeads: { $sum: '$entries.leadsCount' }, totalConverted: { $sum: '$entries.convertedCount' }, totalRevenue: { $sum: '$entries.revenueGenerated' } } },
        { $project: { city: '$_id.city', state: '$_id.state', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection } },
        { $sort: { totalLeads: -1 } }, { $limit: 15 },
      ]),
      // Telecaller breakdown
      DailyEntry.aggregate([
        ...diseaseBase,
        { $group: { _id: '$telecallerId', totalLeads: { $sum: '$entries.leadsCount' }, totalConverted: { $sum: '$entries.convertedCount' }, totalRevenue: { $sum: '$entries.revenueGenerated' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
        { $unwind: '$u' },
        { $project: { telecallerName: '$u.name', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection, avgRevenue: avgRevProjection } },
        { $sort: { totalLeads: -1 } },
      ]),
      // Trend over time
      DailyEntry.aggregate([
        ...diseaseBase,
        { $group: { _id: '$$ROOT.date', totalLeads: { $sum: '$entries.leadsCount' }, totalConverted: { $sum: '$entries.convertedCount' }, totalRevenue: { $sum: '$entries.revenueGenerated' } } },
        { $project: { date: '$_id', totalLeads: 1, totalConverted: 1, totalRevenue: 1 } },
        { $sort: { date: 1 } },
      ]),
    ])

    return NextResponse.json({ success: true, data: { disease, ageBreak, locBreak, tcBreak, trendBreak } })
  }

  // ── telecaller ────────────────────────────────────────────────────────────
  if (type === 'telecaller') {
    const data = await DailyEntry.aggregate([
      { $match: docMatch },
      {
        $group: {
          _id: '$telecallerId',
          totalLeadsGiven: { $sum: '$totalLeadsGiven' },
          totalLeads:      { $sum: { $sum: '$entries.leadsCount' } },
          totalConverted:  { $sum: { $sum: '$entries.convertedCount' } },
          totalRevenue:    { $sum: { $sum: '$entries.revenueGenerated' } },
          daysWorked:      { $sum: 1 },
          onlineLeads:     { $sum: { $size: { $filter: { input: '$entries', cond: { $eq: ['$$this.consultationType', 'online'] } } } } },
          hospitalLeads:   { $sum: { $size: { $filter: { input: '$entries', cond: { $eq: ['$$this.consultationType', 'hospital'] } } } } },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          telecallerName: '$user.name', totalLeadsGiven: 1, totalLeads: 1,
          totalConverted: 1, totalRevenue: 1, daysWorked: 1, onlineLeads: 1, hospitalLeads: 1,
          conversionRate: convRateProjection,
          avgRevenuePerDay: { $cond: [{ $gt: ['$daysWorked', 0] }, { $round: [{ $divide: ['$totalRevenue', '$daysWorked'] }, 0] }, 0] },
          avgLeadsPerDay:   { $cond: [{ $gt: ['$daysWorked', 0] }, { $round: [{ $divide: ['$totalLeads', '$daysWorked'] }, 1] }, 0] },
          utilizationRate:  { $round: [{ $multiply: [{ $divide: ['$totalLeads', { $max: ['$totalLeadsGiven', 1] }] }, 100] }, 1] },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── location ──────────────────────────────────────────────────────────────
  if (type === 'location') {
    const data = await DailyEntry.aggregate([
      ...base,
      {
        $group: {
          _id: { state: '$entries.state', city: '$entries.city' },
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
          onlineLeads:    { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'online'] },   '$entries.leadsCount', 0] } },
          hospitalLeads:  { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'hospital'] }, '$entries.leadsCount', 0] } },
        },
      },
      { $project: { state: '$_id.state', city: '$_id.city', totalLeads: 1, totalConverted: 1, totalRevenue: 1, onlineLeads: 1, hospitalLeads: 1, conversionRate: convRateProjection } },
      { $sort: { totalLeads: -1 } }, { $limit: 50 },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── ageGroup ──────────────────────────────────────────────────────────────
  if (type === 'ageGroup') {
    const data = await DailyEntry.aggregate([
      ...base,
      {
        $group: {
          _id: '$entries.ageGroup',
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
          onlineLeads:    { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'online'] },   '$entries.leadsCount', 0] } },
          hospitalLeads:  { $sum: { $cond: [{ $eq: ['$entries.consultationType', 'hospital'] }, '$entries.leadsCount', 0] } },
        },
      },
      { $project: { ageGroup: '$_id', totalLeads: 1, totalConverted: 1, totalRevenue: 1, onlineLeads: 1, hospitalLeads: 1, conversionRate: convRateProjection, avgRevenue: avgRevProjection } },
      { $sort: { totalLeads: -1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── consultationType ──────────────────────────────────────────────────────
  if (type === 'consultationType') {
    const data = await DailyEntry.aggregate([
      ...base,
      {
        $group: {
          _id: '$entries.consultationType',
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
        },
      },
      { $project: { consultationType: '$_id', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── trend ─────────────────────────────────────────────────────────────────
  if (type === 'trend') {
    const data = await DailyEntry.aggregate([
      { $match: docMatch },
      {
        $group: {
          _id: '$date',
          totalLeadsGiven: { $sum: '$totalLeadsGiven' },
          totalLeads:      { $sum: { $sum: '$entries.leadsCount' } },
          totalConverted:  { $sum: { $sum: '$entries.convertedCount' } },
          totalRevenue:    { $sum: { $sum: '$entries.revenueGenerated' } },
        },
      },
      { $project: { date: '$_id', totalLeadsGiven: 1, totalLeads: 1, totalConverted: 1, totalRevenue: 1 } },
      { $sort: { date: 1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── comparison — current vs previous period ───────────────────────────────
  if (type === 'comparison') {
    if (!dateFrom || !dateTo) return NextResponse.json({ error: 'dateFrom and dateTo required' }, { status: 400 })
    const from = new Date(dateFrom), to = new Date(dateTo)
    const periodMs = to.getTime() - from.getTime()
    const prevTo   = new Date(from.getTime() - 1)
    const prevFrom = new Date(prevTo.getTime() - periodMs)
    const fmt = (d: Date) => d.toISOString().split('T')[0]

    async function periodStats(pFrom: string, pTo: string) {
      const m: Record<string, unknown> = { ...docMatch, date: { $gte: pFrom, $lte: pTo } }
      const [r] = await DailyEntry.aggregate([
        { $match: m },
        { $group: { _id: null, totalLeadsGiven: { $sum: '$totalLeadsGiven' }, totalLeads: { $sum: { $sum: '$entries.leadsCount' } }, totalConverted: { $sum: { $sum: '$entries.convertedCount' } }, totalRevenue: { $sum: { $sum: '$entries.revenueGenerated' } } } },
      ])
      return { totalLeadsGiven: r?.totalLeadsGiven ?? 0, totalLeads: r?.totalLeads ?? 0, totalConverted: r?.totalConverted ?? 0, totalRevenue: r?.totalRevenue ?? 0 }
    }

    const [curr, prev] = await Promise.all([periodStats(dateFrom, dateTo), periodStats(fmt(prevFrom), fmt(prevTo))])
    const pct = (c: number, p: number) => p === 0 ? null : Math.round((c - p) / p * 1000) / 10

    return NextResponse.json({
      success: true,
      data: {
        current: { ...curr, period: `${dateFrom} → ${dateTo}` },
        previous: { ...prev, period: `${fmt(prevFrom)} → ${fmt(prevTo)}` },
        changes: {
          leadsGiven:  pct(curr.totalLeadsGiven, prev.totalLeadsGiven),
          leads:       pct(curr.totalLeads,      prev.totalLeads),
          converted:   pct(curr.totalConverted,  prev.totalConverted),
          revenue:     pct(curr.totalRevenue,     prev.totalRevenue),
        },
      },
    })
  }


  // ── patientType ───────────────────────────────────────────────────────────
  if (type === 'patientType') {
    const data = await DailyEntry.aggregate([
      ...base,
      {
        $group: {
          _id: '$entries.patientType',
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
        },
      },
      { $project: { patientType: '$_id', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection, avgRevenue: avgRevProjection } },
      { $sort: { totalLeads: -1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── admissionType ─────────────────────────────────────────────────────────
  if (type === 'admissionType') {
    const data = await DailyEntry.aggregate([
      ...base,
      { $match: { 'entries.admissionType': { $in: ['IPD', 'OPD', 'Cashless'] } } },
      {
        $group: {
          _id: '$entries.admissionType',
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
        },
      },
      { $project: { admissionType: '$_id', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection, avgRevenue: avgRevProjection } },
      { $sort: { totalLeads: -1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── patientAdmissionCross — cross-tab patientType × admissionType ─────────
  if (type === 'patientAdmissionCross') {
    const data = await DailyEntry.aggregate([
      ...base,
      {
        $group: {
          _id: { patientType: '$entries.patientType', admissionType: { $ifNull: ['$entries.admissionType', 'None'] } },
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
        },
      },
      { $project: { patientType: '$_id.patientType', admissionType: '$_id.admissionType', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection } },
      { $sort: { totalLeads: -1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  // ── insuranceCompany ──────────────────────────────────────────────────────
  if (type === 'insuranceCompany') {
    const data = await DailyEntry.aggregate([
      ...base,
      { $match: { 'entries.insuranceCompany': { $ne: null, $exists: true } } },
      {
        $group: {
          _id: '$entries.insuranceCompany',
          totalLeads:     { $sum: '$entries.leadsCount' },
          totalConverted: { $sum: '$entries.convertedCount' },
          totalRevenue:   { $sum: '$entries.revenueGenerated' },
        },
      },
      { $project: { insuranceCompany: '$_id', totalLeads: 1, totalConverted: 1, totalRevenue: 1, conversionRate: convRateProjection, avgRevenue: avgRevProjection } },
      { $sort: { totalLeads: -1 } },
    ])
    return NextResponse.json({ success: true, data })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

// Additional exports are handled in the same GET handler above —
// adding new aggregation types below via the existing switch-style logic

// ── patientType ───────────────────────────────────────────────────────────────
// This block intentionally left empty; the patientType/admissionType handlers
// are inlined above via the if-chain before the final error return.
