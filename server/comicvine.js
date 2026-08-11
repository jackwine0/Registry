// Thin Comic Vine API client + normalization into the shape the frontend
// expects (see src/types/character.ts). Comic Vine's own data has no
// hero/villain flag and no numeric power stats — those are filled in
// deterministically (see estimateStats/estimateThreat below) and clearly
// surfaced to the user as estimates, not official data.

const BASE = 'https://comicvine.gamespot.com/api'
const UA = 'TheRegistryApp/1.0 (personal project; contact via GitHub)'

function assertKey() {
  if (!process.env.COMICVINE_API_KEY) {
    const err = new Error(
      'COMICVINE_API_KEY is not set. Copy server/.env.example to server/.env and add your free Comic Vine API key.'
    )
    err.status = 500
    throw err
  }
}

async function cv(pathname, params = {}) {
  assertKey()
  const url = new URL(`${BASE}${pathname}`)
  url.searchParams.set('api_key', process.env.COMICVINE_API_KEY)
  url.searchParams.set('format', 'json')
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, v)

  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) {
    const err = new Error(`Comic Vine request failed (${res.status})`)
    err.status = res.status === 401 ? 401 : 502
    throw err
  }
  const data = await res.json()
  if (data.status_code !== 1) {
    const err = new Error(data.error || 'Comic Vine returned an error')
    err.status = data.status_code === 100 ? 401 : 502
    throw err
  }
  return data
}

// --- deterministic "estimated" numbers, since Comic Vine has none ---------
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}
function pick(seed, min, max) {
  return min + (hash(seed) % (max - min + 1))
}
export function estimateStats(id) {
  const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat']
  const out = {}
  for (const s of stats) out[s] = pick(`${id}-${s}`, 35, 99)
  return out
}
export function estimateThreat(id) {
  return {
    threatLevel: pick(`${id}-threat`, 40, 98),
    criminalRecord: pick(`${id}-record`, 10, 95),
    killCount: pick(`${id}-kills`, 0, 120),
  }
}

const GENDER = { 0: 'Other', 1: 'Male', 2: 'Female' }

function mapUniverse(publisher = '') {
  const p = publisher.toLowerCase()
  if (p.includes('marvel')) return 'Marvel'
  if (p.includes('dc comics') || p === 'dc') return 'DC'
  if (p.includes('image')) return 'Image'
  if (p.includes('dark horse')) return 'Dark Horse'
  return 'Other'
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

const FALLBACK_IMAGE = 'https://ui-avatars.com/api/?name=%3F&background=2a2a36&color=fff&size=512'

export function normalizeCharacter(cvChar, seed = {}) {
  const id = String(cvChar.id)
  const alignment = seed.alignment || 'neutral'
  const description = stripHtml(cvChar.description || cvChar.deck || '')
  return {
    id,
    name: cvChar.name,
    realName: cvChar.real_name || cvChar.name,
    aliases: (cvChar.aliases || '').split('\n').map((a) => a.trim()).filter(Boolean),
    alignment,
    universe: mapUniverse(cvChar.publisher?.name),
    publisher: cvChar.publisher?.name || 'Unknown',
    image:
      cvChar.image?.medium_url ||
      cvChar.image?.small_url ||
      cvChar.image?.icon_url ||
      FALLBACK_IMAGE,
    color: seed.color || '#6C757D',
    powerstats: estimateStats(id),
    appearance: {
      gender: GENDER[cvChar.gender] ?? 'Unknown',
      race: 'Unknown',
      height: 'Unknown',
      weight: 'Unknown',
      eyeColor: 'Unknown',
      hairColor: 'Unknown',
    },
    biography: {
      fullName: cvChar.real_name || cvChar.name,
      alterEgos: cvChar.name !== cvChar.real_name && cvChar.real_name ? cvChar.name : 'none',
      placeOfBirth: cvChar.origin?.name || cvChar.birth || 'Unknown',
      firstAppearance: cvChar.first_appeared_in_issue?.name || 'Unknown',
      publisher: cvChar.publisher?.name || 'Unknown',
    },
    connections: {
      groupAffiliation: cvChar.team?.name || (cvChar.teams || [])[0]?.name || 'Unaffiliated',
      relatives: 'Unknown',
      allies: (cvChar.character_friends || []).slice(0, 6).map((f) => String(f.id)),
      enemies: (cvChar.character_enemies || []).slice(0, 6).map((e) => String(e.id)),
    },
    appearances: {
      movies: [],
      comics: (cvChar.issue_credits || []).slice(0, 6).map((i) => i.name).filter(Boolean),
      games: [],
    },
    quotes: [],
    description: description || undefined,
    ...(alignment === 'villain' ? estimateThreat(id) : {}),
  }
}

const CHAR_FIELDS =
  'id,name,real_name,aliases,deck,description,image,publisher,gender,birth,origin,team,teams,first_appeared_in_issue,character_friends,character_enemies,issue_credits'

export async function searchCharacters(query, limit = 12) {
  const data = await cv('/search/', {
    resources: 'character',
    query,
    limit,
    field_list: 'id,name,real_name,deck,image,publisher,gender,count_of_issue_appearances',
  })
  return data.results
}

export async function getCharacterDetail(id) {
  const data = await cv(`/character/4005-${id}/`, { field_list: CHAR_FIELDS })
  return data.results
}

export async function findBestMatch(query) {
  const results = await searchCharacters(query, 10)
  if (!results.length) return null
  return results.reduce((best, r) =>
    (r.count_of_issue_appearances || 0) > (best.count_of_issue_appearances || 0) ? r : best
  )
}

// Bulk listing endpoint — unlike /search/, /characters/ accepts the full
// field_list (including friends/enemies/etc) in ONE request per page, so
// this is a far cheaper way to pull a large number of characters than
// resolving names one at a time. Used to widen the roster well beyond the
// curated seed list, sorted by how often each character has actually
// appeared in a comic (a reasonable proxy for "well-known").
export async function listPopularCharacters(limit = 100, offset = 0) {
  const data = await cv('/characters/', {
    field_list: CHAR_FIELDS,
    sort: 'count_of_issue_appearances:desc',
    limit,
    offset,
  })
  return data.results
}
