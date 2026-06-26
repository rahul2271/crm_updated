// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { connectDB } from '@/lib/mongodb'
// import { DailyEntry } from '@/models/DailyEntry'
// import { z } from 'zod'

// const diseaseEntrySchema = z.object({
//   disease:          z.string().min(1),
//   ageGroup:         z.enum(['0-18', '18-35', '35-60', '60+']),
//   city:             z.string().min(1),
//   state:            z.string().min(1),
//   consultationType: z.enum(['online', 'hospital']),
//   leadsCount:       z.number().min(0),
//   convertedCount:   z.number().min(0),
//   revenueGenerated: z.number().min(0).default(0),  // was missing — caused revenue to be stripped
// })

// const saveEntrySchema = z.object({
//   date:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
//   totalLeadsGiven: z.number().min(0),
//   entries:         z.array(diseaseEntrySchema).min(1, 'Add at least one disease row'),
//   notes:           z.string().optional(),
// })

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions)
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   if (session.user.role !== 'telecaller')
//     return NextResponse.json({ error: 'Only telecallers can submit entries' }, { status: 403 })

//   const body = await req.json()
//   const parsed = saveEntrySchema.safeParse(body)
//   if (!parsed.success)
//     return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 })

//   await connectDB()

//   const entry = await DailyEntry.findOneAndUpdate(
//     { telecallerId: session.user.id, date: parsed.data.date },
//     { ...parsed.data, telecallerId: session.user.id },
//     { upsert: true, new: true, setDefaultsOnInsert: true }
//   )

//   return NextResponse.json({ success: true, data: entry })
// }

// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions)
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

//   await connectDB()
//   const { searchParams } = new URL(req.url)
//   const filter: Record<string, unknown> = {}

//   if (session.user.role === 'telecaller') {
//     filter.telecallerId = session.user.id
//   } else {
//     const tcId = searchParams.get('telecallerId')
//     if (tcId) filter.telecallerId = tcId
//   }

//   const date = searchParams.get('date')
//   if (date) filter.date = date

//   const dateFrom = searchParams.get('dateFrom')
//   const dateTo   = searchParams.get('dateTo')
//   if (dateFrom || dateTo) {
//     const range: Record<string, string> = {}
//     if (dateFrom) range.$gte = dateFrom
//     if (dateTo)   range.$lte = dateTo
//     filter.date = range
//   }

//   const entries = await DailyEntry.find(filter)
//     .populate('telecallerId', 'name email phone')
//     .sort({ date: -1 })
//     .lean()

//   return NextResponse.json({ success: true, data: entries })
// }


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { DailyEntry } from '@/models/DailyEntry'
import { z } from 'zod'

const diseaseEntrySchema = z.object({
  disease:          z.string().min(1),
  ageGroup:         z.enum(['0-18', '18-35', '35-60', '60+']),
  city:             z.string().min(1),
  state:            z.string().min(1),
  consultationType: z.enum(['online', 'hospital', 'whatsapp', 'call', 'website_booking']),
  patientType:      z.enum(['new', 'existing']).default('new'),
  admissionType:    z.enum(['IPD', 'OPD', 'Cashless']).optional().nullable(),
  insuranceCompany: z.string().optional().nullable(),
  leadsCount:       z.number().min(0),
  convertedCount:   z.number().min(0),
  revenueGenerated: z.number().min(0).default(0),
})

const saveEntrySchema = z.object({
  date:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalLeadsGiven: z.number().min(0),
  entries:         z.array(diseaseEntrySchema).min(1, 'Add at least one disease row'),
  notes:           z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'telecaller')
    return NextResponse.json({ error: 'Only telecallers can submit entries' }, { status: 403 })

  const body = await req.json()
  const parsed = saveEntrySchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 })

  await connectDB()

  // ── Audit: compute late / backdate status ─────────────────────────────────
  // All timestamps in IST (UTC+5:30)
  const nowUTC      = new Date()
  const IST_OFFSET  = 5.5 * 60 * 60 * 1000
  const nowIST      = new Date(nowUTC.getTime() + IST_OFFSET)
  const submittedOn = nowIST.toISOString().split('T')[0]   // YYYY-MM-DD in IST

  // isLate: submitted after 20:00 IST on the SAME day as entry date
  const hourIST     = nowIST.getUTCHours()    // hours in IST via shifted UTC
  const minIST      = nowIST.getUTCMinutes()
  const isLate      = (submittedOn === parsed.data.date) && (hourIST >= 20)

  // isBackdate: submitting for a date that is NOT today in IST
  const isBackdate  = submittedOn !== parsed.data.date

  const logEntry = {
    action:      'first_submit' as const,
    timestamp:   nowUTC,
    isLate,
    isBackdate,
    submittedOn,
  }

  // Check if existing record to decide first_submit vs update
  const existing = await DailyEntry.findOne({ telecallerId: session.user.id, date: parsed.data.date })
  if (existing) logEntry.action = 'update' as const

  const entry = await DailyEntry.findOneAndUpdate(
    { telecallerId: session.user.id, date: parsed.data.date },
    {
      ...parsed.data,
      telecallerId: session.user.id,
      $push: { submissionLog: logEntry },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return NextResponse.json({ success: true, data: entry, audit: { isLate, isBackdate, submittedOn } })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(req.url)
  const filter: Record<string, unknown> = {}

  if (session.user.role === 'telecaller') {
    filter.telecallerId = session.user.id
  } else {
    const tcId = searchParams.get('telecallerId')
    if (tcId) filter.telecallerId = tcId
  }

  const date     = searchParams.get('date')
  if (date) filter.date = date

  const dateFrom = searchParams.get('dateFrom')
  const dateTo   = searchParams.get('dateTo')
  if (dateFrom || dateTo) {
    const range: Record<string, string> = {}
    if (dateFrom) range.$gte = dateFrom
    if (dateTo)   range.$lte = dateTo
    filter.date = range
  }

  const entries = await DailyEntry.find(filter)
    .populate('telecallerId', 'name email phone')
    .sort({ date: -1 })
    .lean()

  return NextResponse.json({ success: true, data: entries })
}