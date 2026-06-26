import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { City } from '@/models/City'

// GET /api/cities?q=mum   → returns up to 20 matching city names
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''

  // Always return N/A as first result when query is empty or matches
  if (!q || q.length < 2) {
    return NextResponse.json({ data: ['N/A'] })
  }

  await connectDB()

  // Case-insensitive prefix + contains search
  const cities = await City.find(
    { name: { $regex: q, $options: 'i' }, isActive: true },
    'name state',
    { limit: 20, sort: { name: 1 } }
  ).lean()

  const results: string[] = cities.map((c: any) => c.name)

  // Prepend N/A if it matches the query
  if ('N/A'.toLowerCase().includes(q.toLowerCase()) && !results.includes('N/A')) {
    results.unshift('N/A')
  }

  return NextResponse.json({ data: results })
}