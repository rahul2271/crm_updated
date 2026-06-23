'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge, Button, Input } from '@/components/ui'
import { formatPercent, formatCurrency } from '@/lib/utils'
import { Pencil, Trash2, KeyRound, X, Check, UserPlus, Eye, EyeOff } from 'lucide-react'

interface Telecaller {
  _id: string; name: string; email: string; phone?: string; isActive: boolean
  totalLeadsGiven: number; totalLeads: number; totalConverted: number
  totalRevenue: number; daysWorked: number
}

const createSchema = z.object({
  name: z.string().min(2), email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'), phone: z.string().optional(),
})
type CreateForm = z.infer<typeof createSchema>

export default function TelecallersPage() {
  const [list,         setList]         = useState<Telecaller[]>([])
  const [loading,      setLoading]      = useState(true)
  const [showAdd,      setShowAdd]      = useState(false)
  const [creating,     setCreating]     = useState(false)
  const [createError,  setCreateError]  = useState('')

  // Edit modal
  const [editId,       setEditId]       = useState<string | null>(null)
  const [editName,     setEditName]     = useState('')
  const [editPhone,    setEditPhone]    = useState('')
  const [editSaving,   setEditSaving]   = useState(false)

  // Password modal
  const [pwdId,        setPwdId]        = useState<string | null>(null)
  const [pwdValue,     setPwdValue]     = useState('')
  const [pwdShow,      setPwdShow]      = useState(false)
  const [pwdSaving,    setPwdSaving]    = useState(false)
  const [pwdError,     setPwdError]     = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({ resolver: zodResolver(createSchema) })

  function load() {
    setLoading(true)
    fetch('/api/telecallers').then(r => r.json()).then(d => setList(d.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const cr = (t: Telecaller) => t.totalLeads > 0 ? Math.round(t.totalConverted / t.totalLeads * 100) : 0

  async function onCreate(data: CreateForm) {
    setCreating(true); setCreateError('')
    try {
      const res = await fetch('/api/telecallers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? 'Failed')
      reset(); setShowAdd(false); load()
    } catch (e) { setCreateError(e instanceof Error ? e.message : 'Failed') }
    finally { setCreating(false) }
  }

  async function saveEdit(id: string) {
    setEditSaving(true)
    await fetch(`/api/telecallers/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, phone: editPhone }),
    })
    setEditSaving(false); setEditId(null); load()
  }

  async function changePassword() {
    if (pwdValue.length < 8) return setPwdError('Password must be at least 8 characters')
    setPwdSaving(true); setPwdError('')
    const res = await fetch(`/api/telecallers/${pwdId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: pwdValue }),
    })
    const j = await res.json()
    if (!res.ok) { setPwdError(j.error ?? 'Failed'); setPwdSaving(false); return }
    setPwdSaving(false); setPwdId(null); setPwdValue('')
    alert('Password updated successfully')
  }

  async function toggleActive(t: Telecaller) {
    await fetch(`/api/telecallers/${t._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !t.isActive }),
    })
    load()
  }

  async function deleteTelecaller(t: Telecaller) {
    const choice = confirm(
      `Delete ${t.name}?\n\nClick OK for soft delete (deactivate, keep data)\nor Cancel to abort.\n\nFor hard delete (removes all data), contact your developer.`
    )
    if (!choice) return
    await fetch(`/api/telecallers/${t._id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Telecallers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {list.filter(t => t.isActive).length} active · {list.length} total
          </p>
        </div>
        <Button onClick={() => setShowAdd(v => !v)}>
          <UserPlus size={15} /> {showAdd ? 'Cancel' : 'Add telecaller'}
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">New telecaller account</h2>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3 max-w-xl">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full name" required error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" required error={errors.password?.message} hint="Min 8 characters" {...register('password')} />
              <Input label="Phone" {...register('phone')} />
            </div>
            {createError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{createError}</p>}
            <Button type="submit" loading={creating}>Create account</Button>
          </form>
        </div>
      )}

      {/* Telecaller table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Name / Email','Phone','Days','Given','Worked','Converted','Rate','Revenue','Status','Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-14 text-gray-400">No telecallers yet.</td></tr>
                ) : list.map(t => (
                  <tr key={t._id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${!t.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      {editId === t._id ? (
                        <div className="flex items-center gap-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)}
                            className="w-32 rounded border border-brand-400 px-2 py-1 text-sm focus:outline-none" />
                          <button onClick={() => saveEdit(t._id)} disabled={editSaving}
                            className="text-green-600 hover:text-green-700"><Check size={15} /></button>
                          <button onClick={() => setEditId(null)}
                            className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {editId === t._id ? (
                        <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                          placeholder="Phone" className="w-28 rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none" />
                      ) : (t.phone ?? '—')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.daysWorked}</td>
                    <td className="px-4 py-3 text-gray-600">{t.totalLeadsGiven}</td>
                    <td className="px-4 py-3 text-gray-600">{t.totalLeads}</td>
                    <td className="px-4 py-3 text-gray-600">{t.totalConverted}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold text-xs ${cr(t) >= 50 ? 'text-green-600' : cr(t) >= 25 ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {formatPercent(cr(t))}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-700 text-xs">{formatCurrency(t.totalRevenue)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(t)}>
                        <Badge color={t.isActive ? 'green' : 'gray'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Edit name/phone */}
                        <button title="Edit details"
                          onClick={() => { setEditId(t._id); setEditName(t.name); setEditPhone(t.phone ?? '') }}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        {/* Change password */}
                        <button title="Change password"
                          onClick={() => { setPwdId(t._id); setPwdValue(''); setPwdError('') }}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <KeyRound size={14} />
                        </button>
                        {/* Delete */}
                        <button title="Deactivate / delete"
                          onClick={() => deleteTelecaller(t)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change password modal */}
      {pwdId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPwdId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Change password</h3>
              <button onClick={() => setPwdId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Setting a new password for: <strong>{list.find(t => t._id === pwdId)?.name}</strong>
            </p>
            <div className="relative mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-1.5">New password (min 8 characters)</label>
              <input
                type={pwdShow ? 'text' : 'password'}
                value={pwdValue}
                onChange={e => setPwdValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && changePassword()}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button type="button" onClick={() => setPwdShow(v => !v)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                {pwdShow ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwdError && <p className="text-sm text-red-600 mb-3">{pwdError}</p>}
            <div className="flex gap-2">
              <Button onClick={changePassword} loading={pwdSaving} className="flex-1">Update password</Button>
              <Button variant="secondary" onClick={() => setPwdId(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
