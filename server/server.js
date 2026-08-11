import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { ROSTER } from './roster.js'
import { findBestMatch, getCharacterDetail, listPopularCharacters, normalizeCharacter, searchCharacters } from './comicvine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load server/.env explicitly — the bare `dotenv/config` import resolves
// .env relative to process.cwd() (wherever the command was run from), which
// is the project root when this is launched via `npm run server` or
// `npm run dev:full`, not this file's own directory. That mismatch is why
// COMICVINE_API_KEY could show as "not set" even with server/.env in place.
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 8787

app.use(cors())
app.use(express.json())

// --- tiny in-memory caches so a browser session doesn't hammer Comic Vine's
// rate limit (and so repeat visits feel instant) ---------------------------
const detailCache = new Map() // id -> normalized character
const CACHE_TTL = 1000 * 60 * 60 // 1 hour
let rosterPromise = null

function cacheGet(map, key) {
  const hit = map.get(key)
  if (!hit) return null
  if (Date.now() - hit.ts > CACHE_TTL) {
    map.delete(key)
    return null
  }
  return hit.value
}
function cacheSet(map, key, value) {
  map.set(key, { value, ts: Date.now() })
}

async function resolveRosterEntry(entry) {
  const match = await findBestMatch(entry.query)
  if (!match) return null
  const detail = await getCharacterDetail(match.id)
  const normalized = normalizeCharacter(detail, entry)
  cacheSet(detailCache, normalized.id, normalized)
  return normalized
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

async function buildRoster() {
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
    cacheSet(detailCache, c.id, c)
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

function getRoster() {
  if (!rosterPromise) {
    rosterPromise = buildRoster().catch((err) => {
      rosterPromise = null // allow retry on next request
      throw err
    })
  }
  return rosterPromise
}

function handleError(res, err) {
  console.error(err.message)
  res.status(err.status && Number.isInteger(err.status) ? err.status : 500).json({
    error: err.message || 'Something went wrong talking to Comic Vine.',
  })
}

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.COMICVINE_API_KEY) })
})

// GET /api/roster — the curated hero/villain/anti-hero set, fully resolved
app.get('/api/roster', async (req, res) => {
  try {
    res.json(await getRoster())
  } catch (err) {
    handleError(res, err)
  }
})

// GET /api/characters/:id — single character, roster cache first
app.get('/api/characters/:id', async (req, res) => {
  const { id } = req.params
  try {
    const cached = cacheGet(detailCache, id)
    if (cached) return res.json(cached)
    const detail = await getCharacterDetail(id)
    const normalized = normalizeCharacter(detail)
    cacheSet(detailCache, id, normalized)
    res.json(normalized)
  } catch (err) {
    handleError(res, err)
  }
})

// GET /api/characters/batch?ids=1,2,3 — used to resolve allies/enemies
app.get('/api/characters-batch', async (req, res) => {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10)
  try {
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const cached = cacheGet(detailCache, id)
        if (cached) return cached
        const detail = await getCharacterDetail(id)
        const normalized = normalizeCharacter(detail)
        cacheSet(detailCache, id, normalized)
        return normalized
      })
    )
    res.json(results.filter((r) => r.status === 'fulfilled').map((r) => r.value))
  } catch (err) {
    handleError(res, err)
  }
})

// GET /api/search?q=... — live Comic Vine search, normalized to card-ready shape
app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (!q) return res.json([])
  try {
    const roster = await getRoster().catch(() => [])
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
    res.json(normalized)
  } catch (err) {
    handleError(res, err)
  }
})

// GET /api/random?count=6&alignment=villain — sampled from the roster
app.get('/api/random', async (req, res) => {
  const count = Math.min(Number(req.query.count) || 6, 24)
  const alignment = req.query.alignment
  try {
    const roster = await getRoster()
    const pool = alignment ? roster.filter((c) => c.alignment === alignment) : roster
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    res.json(shuffled.slice(0, count))
  } catch (err) {
    handleError(res, err)
  }
})

// --- serve the built frontend (npm run build in the project root first) ---
const distDir = path.join(__dirname, '..', 'dist')
app.use(express.static(distDir))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) res.status(404).send('Run "npm run build" in the project root first.')
  })
})

app.listen(PORT, () => {
  console.log(`Registry Division API proxy running on http://localhost:${PORT}`)
  if (!process.env.COMICVINE_API_KEY) {
    console.warn('⚠️  No COMICVINE_API_KEY set — requests to Comic Vine will fail until you add one to server/.env')
  }
})
