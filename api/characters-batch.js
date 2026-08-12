// Vercel serverless function: GET /api/characters-batch?ids=1,2,3
// Same roster-snapshot-first strategy as api/characters/[id].js, batched.
// Used to resolve allies/enemies pulled in from a character detail page.
import { getCharacterDetail, normalizeCharacter } from '../server/comicvine.js'
import { findInRosterSnapshot } from '../server/roster-cache.js'

export default async function handler(req, res) {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10)

  try {
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const cached = findInRosterSnapshot(id)
        if (cached) return cached
        const detail = await getCharacterDetail(id)
        return normalizeCharacter(detail)
      })
    )
    res.status(200).json(results.filter((r) => r.status === 'fulfilled').map((r) => r.value))
  } catch (err) {
    res.status(500).json({ error: err.message || 'Something went wrong talking to Comic Vine.' })
  }
}
