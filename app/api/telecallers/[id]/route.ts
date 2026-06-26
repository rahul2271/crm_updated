import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { DailyEntry } from '@/models/DailyEntry'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// PUT /api/telecallers/[id] — update info or change password
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  await connectDB()

  // Password change
  if (body.newPassword) {
    const parsed = z.object({ newPassword: z.string().min(8) }).safeParse(body)
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    const hashed = await bcrypt.hash(parsed.data.newPassword, 10)
    await User.findByIdAndUpdate(id, { password: hashed })
    return NextResponse.json({ success: true, message: 'Password updated' })
  }

  // Profile update
  const parsed = z.object({
    name:     z.string().min(2).optional(),
    phone:    z.string().optional(),
    isActive: z.boolean().optional(),
  }).safeParse(body)

  if (!parsed.success)
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const updated = await User.findByIdAndUpdate(id, parsed.data, { new: true })
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/telecallers/[id] — soft delete (deactivate) or hard delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { id } = await params
  const hard = new URL(req.url).searchParams.get('hard') === 'true'
  await connectDB()

  if (hard) {
    await User.findByIdAndDelete(id)
    await DailyEntry.deleteMany({ telecallerId: id })
  } else {
    await User.findByIdAndUpdate(id, { isActive: false })
  }

  return NextResponse.json({ success: true })
}
