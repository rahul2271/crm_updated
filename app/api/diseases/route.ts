import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Disease } from '@/models/Disease'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  // ?all=true returns inactive too (admin use)
  const showAll = new URL(req.url).searchParams.get('all') === 'true' && session.user.role === 'admin'
  const filter = showAll ? {} : { isActive: true }
  const diseases = await Disease.find(filter).sort({ category: 1, name: 1 }).lean()
  return NextResponse.json({ success: true, data: diseases })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  const body = await req.json()
  const parsed = z.object({ name: z.string().min(2), category: z.string().min(2) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  await connectDB()
  const existing = await Disease.findOne({ name: parsed.data.name })
  if (existing) return NextResponse.json({ error: 'Disease already exists' }, { status: 409 })
  const d = await Disease.create(parsed.data)
  return NextResponse.json({ success: true, data: d }, { status: 201 })
}
