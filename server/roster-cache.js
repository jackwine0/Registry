// Reads the static roster.json snapshot (generated at build time by
// scripts/generate-roster.mjs) from disk. Used by the Vercel serverless
// functions in /api so a single-character lookup or an ally/enemy batch
// resolve can check the pre-fetched roster first instead of always making a
// live Comic Vine call. Cached in module scope, which persists for the
// lifetime of a warm function instance (cheap either way — it's a local
// file read, not a network call).
import fs from 'fs'

let cache = null

export function loadRosterSnapshot() {
  if (cache) return cache
  try {
    const url = new URL('../public/roster.json', import.meta.url)
    cache = JSON.parse(fs.readFileSync(url, 'utf-8'))
  } catch {
    cache = []
  }
  return cache
}

export function findInRosterSnapshot(id) {
  return loadRosterSnapshot().find((c) => c.id === String(id))
}
