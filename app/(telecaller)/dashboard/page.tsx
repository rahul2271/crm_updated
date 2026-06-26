import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { DailyEntry } from '@/models/DailyEntry'
import { StatCard } from '@/components/ui'
import { formatDate, conversionRate, todayString, formatCurrency } from '@/lib/utils'
import { CONSULT_OPTIONS } from '@/types'
import Link from 'next/link'
import { Phone, TrendingUp, DollarSign, ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

type EntryRow = {
  disease: string
  leadsCount: number
  convertedCount: number
  revenueGenerated: number
  consultationType: string
}

type TodayEntry = {
  totalLeadsGiven: number
  entries: EntryRow[]
}

async function getTodayEntry(telecallerId: string): Promise<TodayEntry | null> {
  await connectDB()
  const result = await DailyEntry.findOne({ telecallerId, date: todayString() }).lean()
  if (!result || Array.isArray(result)) return null
  return result as unknown as TodayEntry
}

export default async function TelecallerDashboard() {
  const session = await getServerSession(authOptions)
  const entry = await getTodayEntry(session!.user.id)

  const totalLeads     = entry?.entries?.reduce((s: number, e: EntryRow) => s + (e.leadsCount      ?? 0), 0) ?? 0
  const totalConverted = entry?.entries?.reduce((s: number, e: EntryRow) => s + (e.convertedCount  ?? 0), 0) ?? 0
  const totalRevenue   = entry?.entries?.reduce((s: number, e: EntryRow) => s + (e.revenueGenerated ?? 0), 0) ?? 0
  const cr = conversionRate(totalConverted, totalLeads)
  const filled = !!entry

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {session!.user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">{formatDate(new Date())}</p>
      </div>

      {/* Status banner */}
      <div className={`rounded-xl p-5 mb-6 flex items-center justify-between ${filled ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${filled ? 'bg-green-100' : 'bg-amber-100'}`}>
            {filled ? '✅' : '📋'}
          </div>
          <div>
            <p className={`font-semibold ${filled ? 'text-green-800' : 'text-amber-800'}`}>
              {filled ? "Today's data submitted" : "Today's data not filled yet"}
            </p>
            <p className={`text-sm ${filled ? 'text-green-600' : 'text-amber-600'}`}>
              {filled
                ? `${entry!.entries.length} disease rows · ${totalLeads} leads · ${totalConverted} converted · ${formatCurrency(totalRevenue)}`
                : 'Fill your daily data now'}
            </p>
          </div>
        </div>
        <Link href="/entry"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
          {filled ? 'Update' : 'Fill now'}
        </Link>
      </div>

      {/* Stats */}
      {filled && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Leads given"   value={entry!.totalLeadsGiven}       sub="assigned today"                   icon={<Phone size={18} />}        color="teal"   />
          <StatCard label="Leads worked"  value={totalLeads}                    sub={`${entry!.entries.length} rows`}  icon={<ClipboardList size={18} />} color="blue"   />
          <StatCard label="Converted"     value={totalConverted}                sub={`${cr}% rate`}                    icon={<TrendingUp size={18} />}    color="green"  />
          <StatCard label="Revenue today" value={formatCurrency(totalRevenue)}  sub="from conversions"                 icon={<DollarSign size={18} />}    color="purple" />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/entry" className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl p-5 transition-all">
          <div className="text-2xl mb-2">📋</div>
          <p className="font-semibold">{filled ? 'Update today' : 'Fill today'}</p>
          <p className="text-brand-200 text-sm mt-0.5">Daily data entry form</p>
        </Link>
        <Link href="/history" className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-5 transition-all">
          <div className="text-2xl mb-2">📅</div>
          <p className="font-semibold text-gray-800">My history</p>
          <p className="text-gray-400 text-sm mt-0.5">All past submissions</p>
        </Link>

        {/* Today's breakdown — fixed to show correct consultation type label */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-2xl mb-2">📊</div>
          <p className="font-semibold text-gray-800 mb-2">Today&apos;s breakdown</p>
          {filled && entry!.entries.length > 0 ? (
            <div className="space-y-1.5">
              {entry!.entries.slice(0, 4).map((e: EntryRow, i: number) => {
                const opt = CONSULT_OPTIONS.find(o => o.value === e.consultationType)
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate max-w-[110px]">{e.disease}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
                        {opt?.icon} {opt?.label ?? e.consultationType}
                      </span>
                      <span className="font-semibold text-gray-700">{e.leadsCount}</span>
                    </div>
                  </div>
                )
              })}
              {entry!.entries.length > 4 && (
                <p className="text-xs text-gray-400">+{entry!.entries.length - 4} more rows</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet today</p>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
