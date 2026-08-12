import type { Alignment, Character, Universe } from '../types/character'

// ---------------------------------------------------------------------------
// Data layer. Talks to a small backend that fetches from the Comic Vine API
// server-side (Comic Vine doesn't support CORS, so a direct browser call
// would be blocked — see server/comicvine.js) and normalizes results into
// the Character shape below. Two deployment shapes are supported:
//
// - Local dev / Render: the Express server in /server serves everything
//   live, including /api/roster.
// - Vercel: the full roster is pre-built at deploy time into a static
//   /roster.json (see scripts/generate-roster.mjs) — cheap to fetch, no
//   cold-start risk — while single-character lookups, batches, and live
//   search are handled by lightweight serverless functions in /api.
//
// getRoster() below tries the static snapshot first and falls back to the
// live endpoint, so the same frontend code works unmodified either way.
// ---------------------------------------------------------------------------

export interface SearchFilters {
  query?: string
  universe?: Universe | 'All'
  alignment?: Alignment | 'All'
  gender?: string | 'All'
  publisher?: string | 'All'
  sort?: 'name-asc' | 'power-desc' | 'power-asc'
}

const totalPower = (c: Character) =>
  Object.values(c.powerstats).reduce((sum, v) => sum + v, 0)

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

// The roster is small and cheap to keep around client-side for filters,
// "all characters" views, random sampling, and ally/enemy lookups.
let rosterPromise: Promise<Character[]> | null = null
function getRoster(): Promise<Character[]> {
  if (!rosterPromise) {
    rosterPromise = getJSON<Character[]>('/roster.json')
      .then((data) => (data.length > 0 ? data : getJSON<Character[]>('/api/roster')))
      .catch(() => getJSON<Character[]>('/api/roster'))
      .catch((err) => {
        rosterPromise = null
        throw err
      })
  }
  return rosterPromise
}

export async function fetchAllCharacters(): Promise<Character[]> {
  return getRoster()
}

export async function fetchCharacterById(id: string): Promise<Character | undefined> {
  const roster = await getRoster().catch(() => [] as Character[])
  const cached = roster.find((c) => c.id === id)
  if (cached) return cached
  return getJSON<Character>(`/api/characters/${id}`)
}

export async function fetchCharactersByIds(ids: string[]): Promise<Character[]> {
  if (ids.length === 0) return []
  const roster = await getRoster().catch(() => [] as Character[])
  const known = roster.filter((c) => ids.includes(c.id))
  const missing = ids.filter((id) => !known.some((c) => c.id === id))
  if (missing.length === 0) return known
  const fetched = await getJSON<Character[]>(`/api/characters-batch?ids=${missing.join(',')}`).catch(() => [])
  return [...known, ...fetched]
}

export async function searchCharacters(filters: SearchFilters): Promise<Character[]> {
  let results: Character[]

  if (filters.query && filters.query.trim()) {
    results = await getJSON<Character[]>(`/api/search?q=${encodeURIComponent(filters.query.trim())}`)
  } else {
    results = await getRoster()
  }

  if (filters.universe && filters.universe !== 'All') {
    results = results.filter((c) => c.universe === filters.universe)
  }
  if (filters.alignment && filters.alignment !== 'All') {
    results = results.filter((c) => c.alignment === filters.alignment)
  }
  if (filters.gender && filters.gender !== 'All') {
    results = results.filter((c) => c.appearance.gender === filters.gender)
  }
  if (filters.publisher && filters.publisher !== 'All') {
    results = results.filter((c) => c.publisher === filters.publisher)
  }

  switch (filters.sort) {
    case 'power-desc':
      results = [...results].sort((a, b) => totalPower(b) - totalPower(a))
      break
    case 'power-asc':
      results = [...results].sort((a, b) => totalPower(a) - totalPower(b))
      break
    case 'name-asc':
    default:
      results = [...results].sort((a, b) => a.name.localeCompare(b.name))
  }

  return results
}

export async function fetchRandomCharacters(count: number, alignment?: Alignment): Promise<Character[]> {
  const roster = await getRoster()
  const pool = alignment ? roster.filter((c) => c.alignment === alignment) : roster
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export async function getFilterOptions() {
  const roster = await getRoster()
  return {
    universes: Array.from(new Set(roster.map((c) => c.universe))),
    alignments: Array.from(new Set(roster.map((c) => c.alignment))),
    genders: Array.from(new Set(roster.map((c) => c.appearance.gender))),
    publishers: Array.from(new Set(roster.map((c) => c.publisher))),
  }
}

export { totalPower }
