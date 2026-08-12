// Vercel serverless function: GET /api/search?q=...
// Live Comic Vine search — this one has to be a real request-time call
// (search results aren't knowable at build time), but it's a single fast
// request, so it's a good fit for a serverless function unlike the full
// roster build (see scripts/generate-roster.mjs for why that one runs at
// build time instead).
import { searchCharacters, normalizeCharacter } from '../server/comicvine.js'
import { loadRosterSnapshot } from '../server/roster-cache.js'

export default async function handler(req, res) {
  const q = String(req.query.q || '').trim()
  if (!q) {
    res.status(200).json([])
    return
  }
  try {
    const roster = loadRosterSnapshot()
    const rosterMatch = roster.find((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    const results = await searchCharacters(q, 50)
    const seen = new Set()
    const normalized = results
      .map((r) => {
        const seed = roster.find((c) => c.id === String(r.id))
        return normalizeCharacter(
          { ...r, character_friends: [], character_enemies: [] },
          seed ? { alignment: seed.alignment, color: seed.color } : {}
        )
      })
      .filter((c) => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
    if (rosterMatch && !seen.has(rosterMatch.id)) normalized.unshift(rosterMatch)
    res.status(200).json(normalized)
  } catch (err) {
    res.status(err.status && Number.isInteger(err.status) ? err.status : 500).json({
      error: err.message || 'Something went wrong talking to Comic Vine.',
    })
  }
}
