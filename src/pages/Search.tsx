import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { searchCharacters, getFilterOptions, type SearchFilters } from '../lib/api'
import { handleImgError } from '../lib/image'
import CharacterCard from '../components/CharacterCard'
import FilterChips from '../components/FilterChips'
import type { Character } from '../types/character'

const PAGE_SIZES = [12, 24, 48]
const EMPTY_OPTIONS = { universes: [] as string[], alignments: [] as string[], genders: [] as string[], publishers: [] as string[] }

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [results, setResults] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [pageSize, setPageSize] = useState(12)
  const [page, setPage] = useState(1)
  const [options, setOptions] = useState(EMPTY_OPTIONS)

  const query = params.get('q') ?? ''
  const universe = params.get('universe') ?? 'All'
  const alignment = params.get('alignment') ?? 'All'
  const gender = params.get('gender') ?? 'All'
  const publisher = params.get('publisher') ?? 'All'
  const sort = (params.get('sort') as SearchFilters['sort']) ?? 'name-asc'

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => setOptions(EMPTY_OPTIONS))
  }, [])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'All' || !value) next.delete(key)
    else next.set(key, value)
    setParams(next)
    setPage(1)
  }

  useEffect(() => {
    setLoading(true)
    searchCharacters({ query, universe: universe as never, alignment: alignment as never, gender, publisher, sort })
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query, universe, alignment, gender, publisher, sort])

  const paged = results.slice(0, page * pageSize)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl">Search &amp; Discovery</h1>
          <p className="text-mist-400 text-sm mt-1">
            {loading ? 'Searching…' : `${results.length} character${results.length === 1 ? '' : 's'} found`}
            {query && <> for "<span className="text-hero-gold">{query}</span>"</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-ink-800 border border-ink-600 rounded-lg text-sm px-3 py-2 focus:outline-none"
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="power-desc">Power Level (High–Low)</option>
            <option value="power-asc">Power Level (Low–High)</option>
          </select>
          <div className="flex bg-ink-800 border border-ink-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2 active:scale-90 transition-transform ${view === 'grid' ? 'bg-ink-600' : ''}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 active:scale-90 transition-transform ${view === 'list' ? 'bg-ink-600' : ''}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="md:hidden p-2 bg-ink-800 border border-ink-600 rounded-lg active:scale-90 transition-transform"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {showFilters && (
          <aside className="space-y-6 h-fit md:sticky md:top-24">
            <input
              value={query}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-hero-blue"
            />
            <FilterChips label="Universe" options={options.universes} value={universe} onChange={(v) => updateParam('universe', v)} />
            <FilterChips label="Alignment" options={options.alignments} value={alignment} onChange={(v) => updateParam('alignment', v)} />
            <FilterChips label="Gender" options={options.genders} value={gender} onChange={(v) => updateParam('gender', v)} />
            <FilterChips label="Publisher" options={options.publishers} value={publisher} onChange={(v) => updateParam('publisher', v)} />
            {(query || universe !== 'All' || alignment !== 'All' || gender !== 'All' || publisher !== 'All') && (
              <button
                onClick={() => setParams(new URLSearchParams())}
                className="text-xs text-hero-red hover:underline active:scale-95 transition-transform"
              >
                Clear all filters
              </button>
            )}
          </aside>
        )}

        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="comic-border bg-ink-800 overflow-hidden">
                  <div className="aspect-square bg-ink-700 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-3/4 bg-ink-700 animate-pulse" />
                    <div className="h-2 w-1/2 bg-ink-700 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="comic-border bg-ink-800 text-center py-16 text-mist-500">
              <p className="stamp inline-block px-4 py-1.5 text-sm font-bold text-mist-500 -rotate-2 mb-4">
                No Match On File
              </p>
              <p className="text-sm">Try a different name or loosen your filters.</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paged.map((c) => (
                <CharacterCard key={c.id} character={c} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paged.map((c) => (
                <div key={c.id} className="w-full max-w-full">
                  <div className="flex items-center gap-4 bg-ink-800 comic-border rounded-xl p-3">
                    <img src={c.image} alt={c.name} className="w-16 h-16 rounded-lg object-cover" onError={handleImgError(c.name)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg truncate">{c.name}</p>
                      <p className="text-xs text-mist-500 truncate">{c.realName} · {c.universe} · {c.alignment}</p>
                    </div>
                    <a href={`/character/${c.id}`} className="text-xs text-hero-blue shrink-0 hover:underline">
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length > paged.length && (
            <div className="flex flex-col items-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 rounded-full bg-ink-800 border border-ink-600 hover:border-hero-blue active:scale-95 text-sm transition-all"
              >
                Load More ({results.length - paged.length} remaining)
              </button>
              <div className="flex gap-2 text-xs text-mist-500">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setPageSize(size)}
                    className={`active:scale-90 transition-transform ${pageSize === size ? 'text-hero-gold' : 'hover:text-mist-100'}`}
                  >
                    {size}/page
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
