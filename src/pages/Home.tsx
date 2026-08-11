import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Fingerprint, Shuffle, TrendingUp } from 'lucide-react'
import { fetchAllCharacters, fetchRandomCharacters } from '../lib/api'
import { handleImgError } from '../lib/image'
import CharacterCard from '../components/CharacterCard'
import { useStore } from '../store/useStore'
import type { Character } from '../types/character'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function Home() {
  const [featured, setFeatured] = useState<Character[]>([])
  const [roster, setRoster] = useState<Character[]>([])
  const [index, setIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const trending = useStore((s) => s.trending)

  useEffect(() => {
    fetchRandomCharacters(6).then(setFeatured).catch((e) => setError(e.message))
    fetchAllCharacters().then(setRoster).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (featured.length === 0) return
    const t = setInterval(() => setIndex((i) => (i + 1) % featured.length), 5000)
    return () => clearInterval(t)
  }, [featured])

  const stats = {
    heroes: roster.filter((c) => c.alignment === 'hero').length,
    villains: roster.filter((c) => c.alignment === 'villain').length,
    antiHeroes: roster.filter((c) => c.alignment === 'anti-hero').length,
    universes: new Set(roster.map((c) => c.universe)).size,
  }

  const topThreat = roster
    .filter((c) => c.alignment === 'villain' && (c.threatLevel ?? 0) >= 88)
    .sort((a, b) => (b.threatLevel ?? 0) - (a.threatLevel ?? 0))[0]

  const trendingIds = Object.entries(trending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => id)
  const trendingChars = trendingIds
    .map((id) => roster.find((c) => c.id === id))
    .filter(Boolean) as Character[]

  const current = featured[index]
  const now = new Date()

  return (
    <div>
      {/* --- HUD strip -------------------------------------------------- */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-mist-100 text-white px-3 py-2 comic-border text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-hero-blue animate-pulse" />
            Status: Live
          </div>
          <div className="flex items-stretch comic-border bg-ink-800 overflow-hidden text-[11px] font-bold uppercase tracking-wider">
            <span className="font-stats text-xl px-3 py-1.5 border-r-2 border-mist-100 flex items-center">
              {roster.length || '—'}
            </span>
            <span className="px-3 py-1.5 flex items-center text-mist-400">Profiles on file</span>
          </div>
          <div className="flex items-stretch comic-border bg-ink-800 overflow-hidden text-[11px] font-bold uppercase tracking-wider">
            <span className="bg-hero-red text-white px-3 py-1.5 flex items-center">
              {MONTHS[now.getMonth()]}
            </span>
            <span className="font-stats text-xl px-3 py-1.5 flex items-center">
              {String(now.getDate()).padStart(2, '0')}
            </span>
          </div>
          {topThreat && (
            <Link
              to={`/character/${topThreat.id}`}
              className="flex items-center gap-2 bg-hero-red text-white px-3 py-2 comic-border text-[11px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
            >
              <AlertTriangle size={14} /> Threat Advisory: {topThreat.name}
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mt-6">
          <div className="flex items-start gap-2 text-sm text-orange-900 bg-orange-500/10 border-2 border-orange-500/40 p-4">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              Couldn't load data from Comic Vine ({error}). Make sure{' '}
              <code className="text-orange-900 font-bold">COMICVINE_API_KEY</code> is set in{' '}
              <code className="text-orange-900 font-bold">server/.env</code> and the API server is running.
            </span>
          </div>
        </div>
      )}

      {/* --- Hero ---------------------------------------------------------- */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
        {/* Left: headline */}
        <div className="relative z-10 order-2 lg:order-1">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-7xl sm:text-8xl leading-[0.82] mb-6"
          >
            If They Exist
            <br />
            They&rsquo;re On <span className="text-hero-red">File</span>
          </motion.h1>
          <p className="italic text-mist-400 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
            Search, compare, and cross-reference{' '}
            <span className="not-italic font-bold text-mist-100">
              {roster.length ? `${roster.length}+` : 'thousands of'}
            </span>{' '}
            heroes and villains pulled live from the{' '}
            <span className="not-italic font-bold">Comic Vine</span> archive.
          </p>

          {featured.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {featured.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${f.name}`}
                    className={`h-2.5 transition-all ${i === index ? 'w-6 bg-mist-100' : 'w-2.5 bg-ink-700'}`}
                  />
                ))}
              </div>
              <span className="text-xs uppercase tracking-widest text-mist-500">Featured Rotation</span>
            </div>
          )}
        </div>

        {/* Right: featured character portrait */}
        <div className="relative order-1 lg:order-2 h-[340px] sm:h-[440px] lg:h-[520px]">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(115deg, transparent 38%, var(--color-hero-red) 38%, var(--color-hero-red) 45%, #ffffff 45%, #ffffff 50%, var(--color-hero-blue) 50%, var(--color-hero-blue) 57%, transparent 57%)',
              opacity: 0.9,
            }}
          />
          {current && (
            <>
              <div className="absolute top-2 sm:top-6 left-0 comic-border bg-ink-800 px-4 py-2 z-10">
                <p className="font-stats text-2xl font-bold leading-none">{roster.length || '—'}+</p>
                <p className="text-[9px] uppercase tracking-wide text-mist-500 mt-1">Profiles in the archive</p>
              </div>

              <Link
                to="/search"
                className="absolute top-0 right-0 comic-border bg-mist-100 text-white px-2.5 py-3 text-[10px] font-display tracking-widest text-center leading-tight z-10 hover:bg-ink-700 transition-colors"
              >
                VIEW
                <br />
                THE
                <br />
                FILE
              </Link>

              <AnimatePresence mode="wait">
                <motion.img
                  key={current.id}
                  src={current.image}
                  alt={current.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4 }}
                  onError={handleImgError(current.name)}
                  className="absolute right-2 sm:right-8 bottom-0 h-[85%] w-auto object-contain drop-shadow-2xl"
                />
              </AnimatePresence>

              <Link
                to={`/character/${current.id}`}
                className="absolute bottom-0 left-0 comic-border bg-mist-100 text-white px-4 py-2 z-10 hover:bg-ink-700 transition-colors"
              >
                <span className="font-display text-2xl leading-none">{current.name}</span>
                <span className="block text-[10px] uppercase tracking-wide text-ink-700 mt-1">
                  {current.alignment.replace('-', ' ')} · view file →
                </span>
              </Link>

              <div className="absolute bottom-0 right-0 flex items-center gap-2 z-10">
                <span className="text-[9px] text-mist-500 text-right leading-tight">
                  Data via
                  <br />
                  Comic Vine
                </span>
                <span className="w-9 h-9 rounded-full bg-hero-red flex items-center justify-center shrink-0">
                  <Fingerprint className="text-white" size={16} />
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* --- Dark "welcome" band -------------------------------------------- */}
      <section className="bg-mist-100 text-white py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <h2 className="font-display text-5xl sm:text-6xl mb-4">Welcome to the Registry Division</h2>
          <p className="max-w-2xl text-ink-700 text-sm sm:text-base leading-relaxed mb-12">
            The Registry Division keeps an open case file on every hero and villain we can track down —
            cross-referenced, cataloged, and pulled live from the Comic Vine archive. No file is ever really closed.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: 'Heroes', value: stats.heroes, color: 'text-hero-blue' },
              { label: 'Villains', value: stats.villains, color: 'text-hero-red' },
              { label: 'Anti-Heroes', value: stats.antiHeroes, color: 'text-hero-gold' },
              { label: 'Universes', value: stats.universes, color: 'text-white' },
            ].map((s) => (
              <div key={s.label} className="border-2 border-white/25 py-6 text-center">
                <p className={`font-stats text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs uppercase tracking-wider text-ink-700 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Trending */}
          {trendingChars.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={18} className="text-hero-gold" />
                <h3 className="font-display text-3xl">Trending Files</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {trendingChars.map((c) => (
                  <CharacterCard key={c.id} character={c} variant="compact" />
                ))}
              </div>
            </div>
          )}

          {/* Random discovery */}
          <div className="border-2 border-white/25 p-8 text-center">
            <Shuffle size={26} className="mx-auto text-hero-gold mb-3" />
            <h3 className="font-display text-3xl mb-2">Feeling Adventurous?</h3>
            <p className="text-ink-700 text-sm mb-5 max-w-md mx-auto">
              Let fate decide — land on a random hero, villain, or anti-hero from across the archive.
            </p>
            <Link
              to="/random"
              className="inline-block px-6 py-3 bg-hero-red hover:bg-red-700 transition-colors font-bold uppercase tracking-wider text-xs"
            >
              Pull a Random File
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
