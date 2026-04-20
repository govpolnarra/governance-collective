'use client'
import { useState, useMemo } from 'react'

interface Item {
  id: string
  title: string
  sector?: string | null
  tags?: string[] | null
  [key: string]: unknown
}

interface Props {
  items: Item[]
  sectors?: string[]
  renderItem: (item: Item) => React.ReactNode
  placeholder?: string
}

export default function SearchFilter({ items, sectors = [], renderItem, placeholder = 'Search...' }: Props) {
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('')

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesQuery = !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.sector ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (item.tags ?? []).some(t => t.toLowerCase().includes(query.toLowerCase()))
      const matchesSector = !sector || item.sector === sector
      return matchesQuery && matchesSector
    })
  }, [items, query, sector])

  const allSectors = sectors.length > 0 ? sectors : [...new Set(items.map(i => i.sector).filter(Boolean) as string[])].sort()

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input flex-1"
        />
        {allSectors.length > 0 && (
          <select
            value={sector}
            onChange={e => setSector(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All sectors</option>
            {allSectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        {(query || sector) && (
          <button
            onClick={() => { setQuery(''); setSector('') }}
            className="btn-secondary shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm">No results found for "{query || sector}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => renderItem(item))}
        </div>
      )}

      {(query || sector) && filtered.length > 0 && (
        <p className="text-xs text-slate-400 mt-4">{filtered.length} of {items.length} results</p>
      )}
    </div>
  )
}
