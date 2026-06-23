import { Sidebar } from '@/components/ui/Sidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TelecallerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'telecaller') redirect('/admin/dashboard')
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-20 md:pt-8 pb-8">{children}</div>
      </main>
    </div>
  )
}
