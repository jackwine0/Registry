import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shuffle, Sparkles } from 'lucide-react'
import { fetchRandomCharacters } from '../lib/api'
import { handleImgError } from '../lib/image'
import CharacterCard from '../components/CharacterCard'
import type { Alignment, Character } from '../types/character'

const TYPE_OPTIONS: { value: Alignment | ''; label: string }[] = [
  { value: '', label: 'Anyone' },
  { value: 'hero', label: 'Heroes' },
  { value: 'villain', label: 'Villains' },
  { value: 'anti-hero', label: 'Anti-Heroes' },
  { value: 'neutral', label: 'Neutral' },
]

export default function Random() {
  const [params, setParams] = useSearchParams()
  const type = (params.get('type') as Alignment) || ''
  const [roulette, setRoulette] = useState<Character[]>([])
  const [spinning, setSpinning] = useState(false)
  const [dailyPick, setDailyPick] = useState<Character | null>(null)

  const spin = async () => {
    setSpinning(true)
    setRoulette([])
    await new Promise((r) => setTimeout(r, 500))
    const results = await fetchRandomCharacters(6, type || undefined)
    setRoulette(results)
    setSpinning(false)
  }

  useEffect(() => {
    spin()
  }, [type])

  useEffect(() => {
    // Deterministic "daily" pick based on today's date
    const seed = new Date().toISOString().slice(0, 10)
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    fetchRandomCharacters(1).then((r) => setDailyPick(r[hash % r.length] ?? r[0]))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
      <div className="text-center">
        <Shuffle className="mx-auto text-hero-gold mb-3" size={28} />
        <h1 className="font-display text-5xl">Character Roulette</h1>
        <p className="text-mist-400 text-sm mt-2">Spin the archive and see who turns up.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setParams(opt.value ? { type: opt.value } : {})}
            className={`px-4 py-2 rounded-full text-sm border active:scale-95 transition-all ${
              type === opt.value
                ? 'bg-hero-red border-hero-red text-white'
                : 'bg-ink-800 border-ink-600 text-mist-300 hover:border-mist-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={spin}
          disabled={spinning}
          className="px-8 py-3 rounded-full bg-hero-red hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all text-sm font-medium"
        >
          {spinning ? 'Spinning…' : 'Spin Again'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 min-h-[180px]">
        {spinning
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-ink-800 animate-pulse" />
            ))
          : roulette.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, rotate: -6, scale: 0.85 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 18 }}
              >
                <CharacterCard character={c} variant="compact" />
              </motion.div>
            ))}
      </div>

      {dailyPick && (
        <section className="comic-border rounded-2xl bg-gradient-to-r from-ink-800 to-ink-700 p-6 flex flex-col sm:flex-row items-center gap-6">
          <Sparkles className="text-hero-gold shrink-0" size={26} />
          <img src={dailyPick.image} alt={dailyPick.name} className="w-20 h-20 rounded-xl object-cover" onError={handleImgError(dailyPick.name)} />
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs uppercase tracking-widest text-hero-gold font-stats">Discovery of the Day</p>
            <h2 className="font-display text-2xl">{dailyPick.name}</h2>
            <p className="text-sm text-mist-400">{dailyPick.biography.publisher}</p>
          </div>
          <a href={`/character/${dailyPick.id}`} className="text-sm text-hero-blue hover:underline shrink-0">
            View profile →
          </a>
        </section>
      )}
    </div>
  )
}
