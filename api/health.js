// Vercel serverless function: GET /api/health
// Quick way to confirm the deployment has COMICVINE_API_KEY set and how
// large the build-time roster snapshot came out — handy when debugging a
// fresh deploy.
import { loadRosterSnapshot } from '../server/roster-cache.js'

export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    hasKey: Boolean(process.env.COMICVINE_API_KEY),
    rosterSnapshotSize: loadRosterSnapshot().length,
  })
}
