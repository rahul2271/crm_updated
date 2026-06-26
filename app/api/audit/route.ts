import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { DailyEntry } from '@/models/DailyEntry'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const { searchParams } = new URL(req.url)

  const filter: Record<string, unknown> = {}

  const tcId     = searchParams.get('telecallerId')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo   = searchParams.get('dateTo')
  const lateOnly = searchParams.get('lateOnly') === 'true'
  const backdateOnly = searchParams.get('backdateOnly') === 'true'

  if (tcId) filter.telecallerId = tcId

  if (dateFrom || dateTo) {
    const range: Record<string, string> = {}
    if (dateFrom) range.$gte = dateFrom
    if (dateTo)   range.$lte = dateTo
    filter.date = range
  }

  // Filter records that have at least one late/backdated log
  if (lateOnly)      filter['submissionLog.isLate']     = true
  if (backdateOnly)  filter['submissionLog.isBackdate'] = true

  const entries = await DailyEntry.find(filter)
    .populate('telecallerId', 'name email phone')
    .sort({ date: -1 })
    .select('date telecallerId totalLeadsGiven submissionLog createdAt updatedAt')
    .lean()

  // Build summary stats
  const totalEntries  = entries.length
  const lateEntries   = entries.filter(e => e.submissionLog?.some((l: any) => l.isLate)).length
  const backdateEntries = entries.filter(e => e.submissionLog?.some((l: any) => l.isBackdate)).length
  const onTimeEntries = entries.filter(e =>
    e.submissionLog?.length > 0 &&
    !e.submissionLog.some((l: any) => l.isLate || l.isBackdate)
  ).length

  return NextResponse.json({
    success: true,
    summary: { totalEntries, lateEntries, backdateEntries, onTimeEntries },
    data: entries,
  })
}
