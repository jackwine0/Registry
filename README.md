# Registry Division

A field-dossier-styled archive of heroes and villains — search, compare,
and cross-reference a large live roster pulled from the **Comic Vine API**,
save favorites, build custom case files, and simulate battles.

Stack: React + Vite + TypeScript + Tailwind CSS v4 + Framer Motion +
Recharts + Zustand, with a small Express proxy server for Comic Vine.

Design direction: bold condensed poster headlines, black-bordered HUD
widget boxes with hard offset shadows, a red/blue/black/white palette —
think field-office dossier meets recruitment-poster dashboard.

## Why there's a server here

Comic Vine's API doesn't support CORS and requires a secret API key on every
request, so the browser can't call it directly. `/server` is a small Express
app that:

- Holds your `COMICVINE_API_KEY` server-side (never shipped to the browser)
- Fetches character data + images from Comic Vine and normalizes it into the
  shape the frontend expects (`src/types/character.ts`)
- Fills in a couple of things Comic Vine doesn't provide — numeric power
  stats and villain threat scores — with a deterministic, clearly-labeled
  **estimate** (Comic Vine is a wiki/database, not a stats API)
- Caches responses in memory so a browsing session doesn't burn through
  Comic Vine's rate limit
- In production, also serves the built frontend, so the whole app is one
  process on one port

## Getting started

**1. Get a free Comic Vine API key**
Sign up / log in at https://comicvine.gamespot.com/api/ — your key is shown
right there. It's free.

**2. Install dependencies (both the frontend and the server)**
```bash
npm install
cd server && npm install && cd ..
```

**3. Add your key**
```bash
cp server/.env.example server/.env
# then edit server/.env and paste your key in
```

**4. Run it**
```bash
npm run dev:full
```
This runs the Vite dev server (port 5173) and the API proxy (port 8787)
together, with Vite forwarding `/api/*` requests to the proxy so the browser
only ever talks to one origin. Open http://localhost:5173.

Prefer to run them separately? `npm run dev` and `npm run server` in two
terminals does the same thing.

### Production build

```bash
npm run build      # builds the frontend into dist/
npm run server      # serves dist/ + the API on one port (8787)
```
Then open http://localhost:8787 — everything's on one origin, no CORS setup
needed. This is the setup to use on Render or any other host that runs a
persistent Node process.

### Deploying to Vercel

Vercel's functions are stateless and cold-start per request, which doesn't
suit the roster-building step as-is — it makes ~170+ Comic Vine requests and
normally relies on staying cached in a long-lived process. So the Vercel
setup works a little differently from local dev / Render:

- **The full roster is pre-built at deploy time**, not per-request. A
  `prebuild` script (`scripts/generate-roster.mjs`) runs automatically
  before `vite build` and writes a static `public/roster.json` snapshot —
  it ships as a plain file on Vercel's CDN, so loading it is instant and
  there's no cold-start or rate-limit risk.
- **Single-character lookups, ally/enemy batches, and live search** are
  genuinely request-time things (they can't be known at build time), so
  those stay as real serverless functions under `/api` — but each one is a
  single fast Comic Vine call, well within normal function limits.

To deploy:

1. Push this project to a Git repo and import it in Vercel (or run `vercel`
   from this directory with the Vercel CLI).
2. In **Project Settings → Environment Variables**, add `COMICVINE_API_KEY`
   (available to Production, Preview, and Development, and — importantly —
   to the **Build** step, since that's when `roster.json` gets generated).
3. Deploy. `vercel.json` in this repo handles routing (SPA fallback to
   `index.html` for client-side routes, without swallowing `/api/*` or
   `/roster.json`) and points Vercel at `npm run build` / `dist`.

If a deploy's roster looks thin or empty, check `/api/health` on the
deployed URL — it reports whether `COMICVINE_API_KEY` was seen and how many
characters made it into the snapshot. A `rosterSnapshotSize` of 0 almost
always means the env var wasn't set (or wasn't set for the Build
environment) at deploy time — add/fix it and redeploy.

## Data — how the archive gets large

The roster is built from two sources, merged and deduplicated:

1. **Curated list** (`server/roster.js`) — ~86 well-known heroes, villains,
   and anti-heroes, resolved by name via Comic Vine's search. Comic Vine has
   no hero/villain flag, so alignment is tagged here.
2. **Bulk popularity listing** — up to 200 additional characters pulled in
   just 2 requests from Comic Vine's `/characters/` endpoint, sorted by how
   often each has actually appeared in a comic. These don't have a known
   alignment (they land in "neutral") but round the archive out to several
   hundred real, live profiles instead of a small hand-picked list.

If either source fails, the app degrades gracefully rather than showing
nothing — check the server logs for `Roster loaded: X curated + Y
additional = Z total` to see what actually came back.

The `/search` page also hits Comic Vine's live search directly, so it isn't
limited to the resolved roster at all — search for anyone in their database.

`src/lib/api.ts` is the single data-access layer the rest of the frontend
calls into; it talks to `/api/*` on the proxy server.

## Pages

- `/` — Hero dashboard: HUD status strip, featured-agent rotation, live
  profile count, threat advisory, and a dark "Welcome" band with stats and trending files
- `/search` — Live Comic Vine search plus filterable/sortable roster browsing, grid/list views, pagination
- `/character/:id` — Full case file: Comic Vine bio + image, estimated power stats, real allies/enemies pulled from Comic Vine, appearances
- `/villains` — Dedicated villain archive with estimated threat levels
- `/compare` — Side-by-side comparison (up to 4) with a radar chart, similarity score, and a battle simulator
- `/teams` — Groups derived live from each character's real Comic Vine team affiliation, plus group-vs-group comparison
- `/favorites` — Saved characters, custom collections, recently viewed, JSON export
- `/random` — Character roulette with alignment filters and a "discovery of the day"

## State & persistence

Favorites, comparison list, recently viewed, trending counts, and custom
collections are stored client-side via Zustand + localStorage
(`src/store/useStore.ts`).

## Notes

- Tailwind v4 is configured via the `@tailwindcss/vite` plugin (no
  `tailwind.config.js` needed) — theme tokens (palette + fonts) live in
  `src/index.css`; component files reference the same token names, so the
  whole app re-themes from that one file.
- Fonts: Bebas Neue for display headlines, IBM Plex Mono for body/stats —
  loaded from Google Fonts in `index.html`.
- Comic Vine's rate limit is generous but not unlimited. On Render/local, the
  in-memory cache in `server/server.js` keeps repeat requests cheap; on
  Vercel, the build-time `roster.json` snapshot means the bulk of the data
  costs nothing per-request at all — only single-character/search calls hit
  Comic Vine live, per the Vercel section above.
- `server/comicvine.js` and `server/build-roster.js` are the shared source
  of truth for all three deployment paths (Express dev server, the
  build-time snapshot script, and the Vercel functions in `/api`) — fix a
  bug once, it's fixed everywhere.
- Not affiliated with Marvel, DC, Comic Vine, or any publisher — this is a
  personal/demo project that consumes Comic Vine's public API.
