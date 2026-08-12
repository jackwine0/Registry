// Runs before `vite build` (see the root package.json "prebuild" script) and
// writes a static snapshot of the resolved Comic Vine roster to
// public/roster.json, so it ships as a plain static file the frontend can
// fetch instantly — no serverless function, no per-request Comic Vine
// calls, no cold-start timeout risk. This is the key piece that makes
// deploying to Vercel work: the roster is expensive to build (~170+ Comic
// Vine requests) but doesn't change from request to request, so it belongs
// at build time, not request time.
//
// On Vercel, COMICVINE_API_KEY should already be in process.env (set under
// Project Settings → Environment Variables, available to "Build"). For a
// local `npm run build`, this also reads server/.env if the variable isn't
// already set, so `cp server/.env.example server/.env` + your key is enough.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildRoster } from '../server/build-roster.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadLocalEnvFallback() {
  if (process.env.COMICVINE_API_KEY) return
  const envPath = path.join(root, 'server', '.env')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

async function main() {
  loadLocalEnvFallback()

  const outPath = path.join(root, 'public', 'roster.json')

  if (!process.env.COMICVINE_API_KEY) {
    console.warn(
      '⚠️  COMICVINE_API_KEY not set — skipping roster pre-generation. ' +
        'The app will fall back to live /api/roster (works locally with the Express server; ' +
        'on Vercel, set the key in Project Settings → Environment Variables and redeploy).'
    )
    fs.writeFileSync(outPath, '[]')
    return
  }

  try {
    console.log('Generating roster.json from Comic Vine…')
    const roster = await buildRoster()
    fs.writeFileSync(outPath, JSON.stringify(roster))
    console.log(`Wrote ${roster.length} characters to public/roster.json`)
  } catch (err) {
    // Don't fail the whole build over this — the app degrades gracefully to
    // live endpoints (or shows its existing "couldn't load" banner) rather
    // than blocking deployment entirely.
    console.error('⚠️  Failed to pre-generate roster.json:', err.message)
    fs.writeFileSync(outPath, '[]')
  }
}

main()
