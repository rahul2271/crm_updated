'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'

interface Disease { _id: string; name: string; category: string; isActive: boolean }

const SUGGESTED_CATEGORIES: string[] = [
  'Digestive Disorders','Pain Management','Auto-Immune Disorders','Skin Disorders',
  'Respiratory Disorders','Liver Disorders','Metabolic Disorders','Cardiac Disorders',
  'Renal Disorders','Reproductive Disorders',
  'Neurology','Oncology','Psychiatry','Ophthalmology','General Medicine',
]

export default function DiseasesPage() {
  const [diseases,   setDiseases]   = useState<Disease[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filterCat,  setFilterCat]  = useState('')

  // Add form
  const [addName,    setAddName]    = useState('')
  const [addCat,     setAddCat]     = useState('')
  const [addCatCustom, setAddCatCustom] = useState('')
  const [adding,     setAdding]     = useState(false)
  const [addError,   setAddError]   = useState('')

  // Inline edit
  const [editId,     setEditId]     = useState<string | null>(null)
  const [editName,   setEditName]   = useState('')
  const [editCat,    setEditCat]    = useState('')
  const [saving,     setSaving]     = useState(false)

  function load() {
    setLoading(true)
    fetch('/api/diseases?all=true').then(r => r.json()).then(d => setDiseases(d.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  // Unique categories from current list
  const allCategories = Array.from(new Set([...SUGGESTED_CATEGORIES, ...diseases.map(d => d.category)])).sort()

  // Filtered view
  const filtered = diseases.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !filterCat || d.category === filterCat
    return matchSearch && matchCat
  })

  // Group by category
  const grouped = filtered.reduce<Record<string, Disease[]>>((acc, d) => {
    if (!acc[d.category]) acc[d.category] = []
    acc[d.category].push(d)
    return acc
  }, {})

  async function addDisease() {
    const cat = addCat === '__custom__' ? addCatCustom.trim() : addCat
    if (!addName.trim()) return setAddError('Name is required')
    if (!cat)            return setAddError('Category is required')
    setAdding(true); setAddError('')
    try {
      const res = await fetch('/api/diseases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName.trim(), category: cat }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? 'Failed')
      setAddName(''); setAddCat(''); setAddCatCustom('')
      load()
    } catch (e) { setAddError(e instanceof Error ? e.message : 'Failed') }
    finally { setAdding(false) }
  }

  async function saveEdit(id: string) {
    setSaving(true)
    await fetch(`/api/diseases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, category: editCat }),
    })
    setSaving(false); setEditId(null); load()
  }

  async function toggleActive(d: Disease) {
    await fetch(`/api/diseases/${d._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !d.isActive }),
    })
    load()
  }

  async function deleteDisease(id: string, name: string) {
    if (!confirm(`Delete "${name}" permanently? This cannot be undone.`)) return
    await fetch(`/api/diseases/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disease management</h1>
        <p className="text-sm text-gray-500 mt-1">{diseases.length} diseases across {new Set(diseases.map(d => d.category)).size} categories</p>
      </div>

      {/* Add disease */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Add new disease</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1" style={{ minWidth: 180 }}>
            <label className="text-xs font-medium text-gray-600">Disease name *</label>
            <input value={addName} onChange={e => setAddName(e.target.value)}
              placeholder="e.g. Type 3 Diabetes"
              onKeyDown={e => e.key === 'Enter' && addDisease()}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex flex-col gap-1" style={{ minWidth: 200 }}>
            <label className="text-xs font-medium text-gray-600">Category *</label>
            <select value={addCat} onChange={e => setAddCat(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select category…</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__custom__">+ New category…</option>
            </select>
          </div>
          {addCat === '__custom__' && (
            <div className="flex flex-col gap-1" style={{ minWidth: 180 }}>
              <label className="text-xs font-medium text-gray-600">New category name *</label>
              <input value={addCatCustom} onChange={e => setAddCatCustom(e.target.value)}
                placeholder="e.g. Rheumatology"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          )}
          <Button onClick={addDisease} loading={adding}>
            <Plus size={15} /> Add disease
          </Button>
        </div>
        {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search diseases…"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-56" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All categories</option>
          {Array.from(new Set(diseases.map(d => d.category))).sort().map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="flex items-center text-sm text-gray-400">{filtered.length} diseases</span>
      </div>

      {/* Disease list grouped by category */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-gray-800">{category}</h3>
                  <span className="text-xs text-gray-400">{items.length} diseases</span>
                </div>
              </div>

              {/* Diseases in this category */}
              <div className="divide-y divide-gray-50">
                {items.map(d => (
                  <div key={d._id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${!d.isActive ? 'opacity-50' : ''}`}>
                    {editId === d._id ? (
                      // Inline edit mode
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="rounded-lg border border-brand-400 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-52" />
                        <select value={editCat} onChange={e => setEditCat(e.target.value)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-48">
                          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={() => saveEdit(d._id)} disabled={saving}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditId(null)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="flex-1 text-sm font-medium text-gray-800">{d.name}</span>
                    )}

                    {editId !== d._id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge color={d.isActive ? 'green' : 'gray'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>

                        {/* Edit */}
                        <button onClick={() => { setEditId(d._id); setEditName(d.name); setEditCat(d.category) }}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>

                        {/* Toggle active */}
                        <button onClick={() => toggleActive(d)}
                          className={`p-1.5 rounded-lg transition-colors ${d.isActive ? 'text-green-500 hover:text-gray-400 hover:bg-gray-50' : 'text-gray-300 hover:text-green-500 hover:bg-green-50'}`}
                          title={d.isActive ? 'Deactivate' : 'Activate'}>
                          {d.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>

                        {/* Delete */}
                        <button onClick={() => deleteDisease(d._id, d.name)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete permanently">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">No diseases found.</div>
          )}
        </div>
      )}
    </div>
  )
}
