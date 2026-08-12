// Shared roster-building logic — used by the Express dev server (server.js,
// for local dev / Render, where it's cached in memory on a long-lived
// process) AND by scripts/generate-roster.mjs (which runs this once at
// build time on Vercel and writes the result to a static public/roster.json
// snapshot, since Vercel's serverless functions are stateless per-request
// and can't cheaply rebuild a ~280-character roster on every cold start).
import { ROSTER } from './roster.js'
import { findBestMatch, getCharacterDetail, listPopularCharacters, normalizeCharacter } from './comicvine.js'

async function resolveRosterEntry(entry) {
  const match = await findBestMatch(entry.query)
  if (!match) return null
  const detail = await getCharacterDetail(match.id)
  return normalizeCharacter(detail, entry)
}

// Extra pages pulled from Comic Vine's bulk /characters/ listing, sorted by
// how often each character has actually appeared in a comic. This is what
// lets the archive scale to hundreds of entries instead of only the curated
// hero/villain list — one request per 100 characters, fully detailed,
// rather than a search+detail round trip per name. These extras have no
// known alignment (Comic Vine doesn't provide one), so they land in the
// "neutral" bucket unless they happen to match a curated entry.
const BULK_PAGES = 2 // 2 x 100 = up to 200 extra characters
const BULK_PAGE_SIZE = 100

async function fetchBulkPage(offset) {
  const results = await listPopularCharacters(BULK_PAGE_SIZE, offset)
  return results.map((r) => normalizeCharacter(r))
}

export async function buildRoster() {
  const settledCurated = await Promise.allSettled(ROSTER.map(resolveRosterEntry))
  const curated = settledCurated
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value)

  const settledBulk = await Promise.allSettled(
    Array.from({ length: BULK_PAGES }, (_, i) => fetchBulkPage(i * BULK_PAGE_SIZE))
  )
  const bulk = settledBulk
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  const seen = new Set(curated.map((c) => c.id))
  const extras = []
  for (const c of bulk) {
    if (seen.has(c.id)) continue
    seen.add(c.id)
    extras.push(c)
  }

  const characters = [...curated, ...extras]
  if (characters.length === 0) {
    const failed = settledCurated.find((r) => r.status === 'rejected')
    throw failed?.reason || new Error('Failed to load roster from Comic Vine')
  }
  console.log(`Roster loaded: ${curated.length} curated + ${extras.length} additional = ${characters.length} total`)
  return characters
}
