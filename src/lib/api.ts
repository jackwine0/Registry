import type { Alignment, Character, Universe } from '../types/character'

// ---------------------------------------------------------------------------
// Data layer. Talks to the local Express proxy in /server, which fetches from
// the Comic Vine API server-side (Comic Vine doesn't support CORS, so a
// direct browser call would be blocked — see server/comicvine.js) and
// normalizes results into the Character shape below. In dev, Vite proxies
// /api to that server (see vite.config.ts); in production the same server
// also serves the built frontend, so it's all same-origin.
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

// The curated roster is small and cheap to keep around client-side for
// filters, "all characters" views, and ally/enemy lookups.
let rosterPromise: Promise<Character[]> | null = null
function getRoster(): Promise<Character[]> {
  if (!rosterPromise) {
    rosterPromise = getJSON<Character[]>('/api/roster').catch((err) => {
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
  const qs = new URLSearchParams({ count: String(count) })
  if (alignment) qs.set('alignment', alignment)
  return getJSON<Character[]>(`/api/random?${qs.toString()}`)
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
