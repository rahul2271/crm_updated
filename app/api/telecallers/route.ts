import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { DailyEntry } from '@/models/DailyEntry'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  await connectDB()
  const telecallers = await User.find({ role: 'telecaller' }).sort({ name: 1 }).lean()
  const ids = telecallers.map(t => t._id)

  const stats = await DailyEntry.aggregate([
    { $match: { telecallerId: { $in: ids } } },
    {
      $group: {
        _id: '$telecallerId',
        totalLeadsGiven: { $sum: '$totalLeadsGiven' },
        totalLeads:      { $sum: { $sum: '$entries.leadsCount' } },
        totalConverted:  { $sum: { $sum: '$entries.convertedCount' } },
        daysWorked:      { $sum: 1 },
      },
    },
  ])

  const map = new Map(stats.map(s => [String(s._id), s]))
  const result = telecallers.map(t => {
    const s = map.get(String(t._id))
    return {
      ...t,
      totalLeadsGiven: s?.totalLeadsGiven ?? 0,
      totalLeads:      s?.totalLeads ?? 0,
      totalConverted:  s?.totalConverted ?? 0,
      daysWorked:      s?.daysWorked ?? 0,
    }
  })

  return NextResponse.json({ success: true, data: result })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const schema = z.object({
    name: z.string().min(2), email: z.string().email(),
    password: z.string().min(8), phone: z.string().optional(),
  })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  await connectDB()
  if (await User.findOne({ email: parsed.data.email }))
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

  const user = await User.create({ ...parsed.data, password: await bcrypt.hash(parsed.data.password, 10), role: 'telecaller' })
  return NextResponse.json({ success: true, data: user }, { status: 201 })
}