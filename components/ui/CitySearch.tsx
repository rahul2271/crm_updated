'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  value: string
  onChange: (val: string) => void
  error?: string
  placeholder?: string
}

export function CitySearch({ value, onChange, error, placeholder = 'Search city… or type N/A' }: Props) {
  const [query,   setQuery]   = useState(value)
  const [results, setResults] = useState<string[]>([])
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [active,  setActive]  = useState(-1)   // keyboard nav index
  const debounceRef  = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)

  // Sync if parent resets value
  useEffect(() => { setQuery(value) }, [value])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((q: string) => {
    setQuery(q)
    onChange(q)           // update form as user types
    setActive(-1)

    if (!q || q.length < 2) { setResults([]); setOpen(false); return }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        const list: string[] = data.data ?? []
        setResults(list)
        setOpen(list.length > 0)
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [onChange])

  function select(city: string) {
    setQuery(city)
    onChange(city)
    setOpen(false)
    setResults([])
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); select(results[active]) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 pr-7 ${error ? 'border-red-400' : 'border-gray-200'}`}
        />
        {loading
          ? <span className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          : <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▾</span>
        }
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
          style={{ maxHeight: 220, overflowY: 'auto' }}>
          {results.map((city, idx) => (
            <button
              key={city}
              type="button"
              onMouseDown={() => select(city)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                idx === active ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 hover:text-brand-700'
              } ${city === 'N/A' ? 'font-semibold text-gray-400 italic' : 'text-gray-700'}`}
            >
              {city === 'N/A' ? '— N/A (Not Applicable)' : city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
