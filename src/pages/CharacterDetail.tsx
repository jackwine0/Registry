import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Share2, Swords, Quote, ArrowLeft, AlertTriangle, Gavel, Skull, Clapperboard, BookOpen, Gamepad2 } from 'lucide-react'
import { fetchCharacterById, fetchCharactersByIds } from '../lib/api'
import { useStore } from '../store/useStore'
import { useToast } from '../store/useToast'
import PowerBar from '../components/PowerBar'
import CharacterCard from '../components/CharacterCard'
import { handleImgError } from '../lib/image'
import type { Character } from '../types/character'

const STAT_LABELS: { key: keyof Character['powerstats']; label: string }[] = [
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'durability', label: 'Durability' },
  { key: 'power', label: 'Power' },
  { key: 'combat', label: 'Combat' },
]

export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | null>(null)
  const [allies, setAllies] = useState<Character[]>([])
  const [enemies, setEnemies] = useState<Character[]>([])
  const [error, setError] = useState<string | null>(null)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const [theme, setTheme] = useState<'hero' | 'villain'>('hero')

  const isFavorite = useStore((s) => (character ? s.isFavorite(character.id) : false))
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const addToCompare = useStore((s) => s.addToCompare)
  const addRecentlyViewed = useStore((s) => s.addRecentlyViewed)
  const trackView = useStore((s) => s.trackView)
  const push = useToast((s) => s.push)

  useEffect(() => {
    if (!id) return
    setCharacter(null)
    setAllies([])
    setEnemies([])
    setError(null)
    setDescExpanded(false)
    fetchCharacterById(id)
      .then((c) => {
        if (!c) return
        setCharacter(c)
        setTheme(c.alignment === 'villain' ? 'villain' : 'hero')
        addRecentlyViewed(c.id)
        trackView(c.id)
        fetchCharactersByIds(c.connections.allies).then(setAllies)
        fetchCharactersByIds(c.connections.enemies).then(setEnemies)
      })
      .catch((e) => setError(e.message))
    window.scrollTo(0, 0)
  }, [id])

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <AlertTriangle className="mx-auto text-orange-800 mb-3" size={28} />
        <p className="font-display text-2xl mb-2">Couldn't load this dossier</p>
        <p className="text-sm text-mist-400">{error}</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <div className="w-full sm:w-56 h-72 sm:h-80 bg-ink-700 animate-pulse shrink-0" />
          <div className="w-full space-y-3 pt-1">
            <div className="h-10 w-2/3 bg-ink-700 animate-pulse" />
            <div className="h-4 w-1/3 bg-ink-700 animate-pulse" />
            <div className="h-3 w-1/4 bg-ink-700 animate-pulse mt-4" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-ink-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const accent = theme === 'villain' ? '#8B0000' : character.color

  return (
    <div>
      {/* Banner */}
      <div className="relative bg-ink-900 overflow-hidden border-b-4 border-mist-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start gap-6">
          {/* Full, uncropped portrait — object-contain so the whole figure shows */}
          <div
            className="relative shrink-0 w-full sm:w-56 h-72 sm:h-80 comic-border overflow-hidden"
            style={{ backgroundColor: `${accent}14` }}
          >
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-full object-contain"
              onError={handleImgError(character.name)}
            />
            <span
              className="absolute top-0 left-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: accent }}
            >
              {character.alignment.replace('-', ' ')}
            </span>
          </div>

          <div className="min-w-0 pt-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-xs text-mist-300 hover:text-mist-100 mb-3 active:scale-95 transition-transform"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl sm:text-6xl leading-none"
            >
              {character.name}
            </motion.h1>
            <p className="text-mist-400 text-sm sm:text-base mt-2">{character.realName}</p>
            <p className="text-xs uppercase tracking-wider text-mist-500 mt-4">
              {character.publisher} · {character.universe}
            </p>
            <span
              className="stamp inline-block mt-4 px-3 py-1 text-xs font-bold -rotate-3"
              style={{ color: accent }}
            >
              {character.alignment === 'villain' ? 'Wanted' : character.alignment === 'hero' ? 'Verified' : 'On File'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              toggleFavorite(character.id)
              push(
                isFavorite ? `Removed ${character.name} from favorites` : `${character.name} added to favorites`,
                'success'
              )
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border active:scale-95 transition-all ${
              isFavorite ? 'bg-hero-red border-hero-red' : 'bg-ink-800 border-ink-600 hover:border-hero-red'
            }`}
          >
            <Heart size={14} className={isFavorite ? 'fill-white' : ''} />
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
          <button
            onClick={() => {
              const result = addToCompare(character.id)
              if (result === 'added') push(`${character.name} added to compare`, 'success')
              else if (result === 'duplicate') push(`${character.name} is already in your compare list`)
              else push('Compare list is full — remove someone first (max 4)', 'warning')
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-ink-800 border border-ink-600 hover:border-hero-gold active:scale-95 transition-all"
          >
            <Swords size={14} /> Compare
          </button>
          <button
            onClick={async () => {
              const url = window.location.href
              if (navigator.share) {
                try {
                  await navigator.share({ title: character.name, url })
                } catch {
                  // user cancelled the share sheet — not an error worth surfacing
                }
                return
              }
              try {
                await navigator.clipboard.writeText(url)
                push('Link copied to clipboard', 'success')
              } catch {
                push("Couldn't copy the link — copy it from your address bar", 'warning')
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-ink-800 border border-ink-600 hover:border-hero-blue active:scale-95 transition-all"
          >
            <Share2 size={14} /> Share
          </button>
          <div className="ml-auto flex bg-ink-800 border border-ink-600 rounded-full overflow-hidden text-xs">
            <button
              onClick={() => setTheme('hero')}
              className={`px-3 py-2 active:scale-95 transition-transform ${theme === 'hero' ? 'bg-hero-blue/20 text-hero-blue' : 'text-mist-400'}`}
            >
              Hero View
            </button>
            <button
              onClick={() => setTheme('villain')}
              className={`px-3 py-2 active:scale-95 transition-transform ${theme === 'villain' ? 'bg-villain-red/20 text-red-800' : 'text-mist-400'}`}
            >
              Villain View
            </button>
          </div>
        </div>

        {/* Power stats */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-2xl">Power Stats</h2>
            <span className="text-[11px] text-mist-500">Estimated index — Comic Vine doesn't publish official stats</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 bg-ink-800 comic-border rounded-2xl p-6">
            {STAT_LABELS.map((s, i) => (
              <PowerBar key={s.key} label={s.label} value={character.powerstats[s.key]} color={accent} delay={i * 0.06} />
            ))}
          </div>
        </section>

        {/* Comic Vine description */}
        {character.description && (
          <section>
            <h2 className="font-display text-2xl mb-4">About</h2>
            <div className="bg-ink-800 comic-border rounded-2xl p-6">
              <p
                className={`text-sm text-mist-300 leading-relaxed ${descExpanded ? '' : 'line-clamp-6'}`}
              >
                {character.description}
              </p>
              {character.description.length > 420 && (
                <button
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-3 text-xs text-hero-blue hover:underline"
                >
                  {descExpanded ? 'Show less' : 'Read full bio'}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Bio */}
        <section>
          <h2 className="font-display text-2xl mb-4">Biography</h2>
          <div className="bg-ink-800 comic-border rounded-2xl p-6 grid sm:grid-cols-2 gap-4 text-sm">
            <InfoRow label="Full Name" value={character.biography.fullName} />
            <InfoRow label="Alter Ego" value={character.biography.alterEgos} />
            <InfoRow label="Place of Birth" value={character.biography.placeOfBirth} />
            <InfoRow label="First Appearance" value={character.biography.firstAppearance} />
            <InfoRow label="Publisher" value={character.biography.publisher} />
            <InfoRow label="Group Affiliation" value={character.connections.groupAffiliation} />
            <InfoRow label="Gender" value={character.appearance.gender} />
          </div>
        </section>

        {/* Villain-only threat panel */}
        {character.alignment === 'villain' && (
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-2xl text-red-800">Threat Assessment</h2>
              <span className="text-[11px] text-mist-500">Estimated</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <StatBlock label="Threat Level" value={character.threatLevel} icon={AlertTriangle} color="text-red-800" />
              <StatBlock label="Criminal Record" value={character.criminalRecord} icon={Gavel} color="text-orange-800" />
              <StatBlock label="Kill Count" value={character.killCount} icon={Skull} color="text-mist-300" />
            </div>
            {character.minions && character.minions.length > 0 && (
              <p className="text-sm text-mist-400 mt-4">
                <span className="text-mist-300">Known minions:</span> {character.minions.join(', ')}
              </p>
            )}
          </section>
        )}

        {/* Quote */}
        {character.quotes.length > 0 && (
          <section
            className="rounded-2xl p-6 text-center comic-border cursor-pointer select-none"
            style={{ backgroundColor: `${accent}18` }}
            onClick={() => setQuoteIndex((i) => (i + 1) % character.quotes.length)}
          >
            <Quote className="mx-auto mb-3 opacity-60" size={22} style={{ color: accent }} />
            <p className="font-display text-xl italic max-w-2xl mx-auto">"{character.quotes[quoteIndex]}"</p>
            <p className="text-xs text-mist-500 mt-3">Tap for another quote</p>
          </section>
        )}

        {/* Connections */}
        <section className="grid sm:grid-cols-2 gap-8">
          <div>
            <h3 className="font-display text-xl mb-3 text-hero-blue">Allies</h3>
            {allies.length === 0 ? (
              <p className="text-sm text-mist-500">No known allies on file.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {allies.map((a) => <CharacterCard key={a.id} character={a} variant="mini" />)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display text-xl mb-3 text-red-800">Enemies</h3>
            {enemies.length === 0 ? (
              <p className="text-sm text-mist-500">No known enemies on file.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {enemies.map((e) => <CharacterCard key={e.id} character={e} variant="mini" />)}
              </div>
            )}
          </div>
        </section>

        {/* Appearances */}
        <section>
          <h2 className="font-display text-2xl mb-4">Appearances</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <AppearanceList title="Movies" icon={Clapperboard} items={character.appearances.movies} />
            <AppearanceList title="Comics" icon={BookOpen} items={character.appearances.comics} />
            <AppearanceList title="Games" icon={Gamepad2} items={character.appearances.games} />
          </div>
        </section>

        <div className="text-center">
          <Link to="/search" className="text-sm text-hero-blue hover:underline">
            ← Back to Search
          </Link>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-mist-500">{label}</p>
      <p className="text-mist-100">{value || 'unknown'}</p>
    </div>
  )
}

function StatBlock({ label, value, icon: Icon, color }: { label: string; value?: number; icon: typeof AlertTriangle; color: string }) {
  return (
    <div className="bg-ink-800 comic-border rounded-2xl p-5 text-center">
      <Icon className={`mx-auto mb-1 ${color}`} size={22} />
      <p className={`font-stats text-2xl font-bold ${color}`}>{value ?? '—'}</p>
      <p className="text-[11px] uppercase tracking-wider text-mist-500 mt-1">{label}</p>
    </div>
  )
}

function AppearanceList({ title, icon: Icon, items }: { title: string; icon: typeof AlertTriangle; items: string[] }) {
  return (
    <div className="bg-ink-800 comic-border rounded-2xl p-5">
      <p className="font-medium mb-3 flex items-center gap-2">
        <Icon size={16} className="text-mist-500" /> {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-mist-500">None on file.</p>
      ) : (
        <ul className="space-y-1.5 text-sm text-mist-300">
          {items.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      )}
    </div>
  )
}
