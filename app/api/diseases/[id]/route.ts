import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Disease } from '@/models/Disease'
import { z } from 'zod'

// PUT /api/diseases/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = z.object({
    name:     z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    isActive: z.boolean().optional(),
  }).safeParse(body)

  if (!parsed.success)
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  await connectDB()
  const updated = await Disease.findByIdAndUpdate(id, parsed.data, { new: true })
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/diseases/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { id } = await params
  await connectDB()
  await Disease.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
