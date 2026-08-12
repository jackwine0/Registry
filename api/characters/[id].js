// Vercel serverless function: GET /api/characters/:id
// Checks the build-time roster snapshot first (instant, no network call);
// falls back to a single live Comic Vine lookup for anyone not in it
// (e.g. an ally/enemy pulled in from a character outside the curated +
// bulk-popular set).
import { getCharacterDetail, normalizeCharacter } from '../../server/comicvine.js'
import { findInRosterSnapshot } from '../../server/roster-cache.js'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) {
    res.status(400).json({ error: 'Missing character id' })
    return
  }
  try {
    const cached = findInRosterSnapshot(id)
    if (cached) {
      res.status(200).json(cached)
      return
    }
    const detail = await getCharacterDetail(id)
    const normalized = normalizeCharacter(detail)
    res.status(200).json(normalized)
  } catch (err) {
    res.status(err.status && Number.isInteger(err.status) ? err.status : 500).json({
      error: err.message || 'Something went wrong talking to Comic Vine.',
    })
  }
}
