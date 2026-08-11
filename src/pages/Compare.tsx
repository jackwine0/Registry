import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Swords } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToast } from '../store/useToast'
import { fetchAllCharacters, totalPower } from '../lib/api'
import { handleImgError } from '../lib/image'
import RadarChartCompare from '../components/RadarChartCompare'
import type { Character } from '../types/character'

export default function Compare() {
  const compareIds = useStore((s) => s.compareIds)
  const addToCompare = useStore((s) => s.addToCompare)
  const removeFromCompare = useStore((s) => s.removeFromCompare)
  const clearCompare = useStore((s) => s.clearCompare)
  const push = useToast((s) => s.push)

  const [all, setAll] = useState<Character[]>([])
  const [picker, setPicker] = useState<string | null>(null)
  const [battleResult, setBattleResult] = useState<string | null>(null)

  useEffect(() => {
    fetchAllCharacters().then(setAll)
  }, [])

  const selected = useMemo(
    () => compareIds.map((id) => all.find((c) => c.id === id)).filter(Boolean) as Character[],
    [compareIds, all]
  )

  const runBattle = () => {
    if (selected.length < 2) return
    const scored = selected.map((c) => ({ c, score: totalPower(c) + Math.random() * 60 }))
    scored.sort((a, b) => b.score - a.score)
    setBattleResult(scored[0].c.name)
  }

  const similarity = useMemo(() => {
    if (selected.length < 2) return null
    const [a, b] = selected
    const keys = Object.keys(a.powerstats) as (keyof Character['powerstats'])[]
    const diff = keys.reduce((sum, k) => sum + Math.abs(a.powerstats[k] - b.powerstats[k]), 0)
    const maxDiff = keys.length * 100
    return Math.round(100 - (diff / maxDiff) * 100)
  }, [selected])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl">Compare Characters</h1>
        <p className="text-mist-400 text-sm mt-2">Line up to 4 characters and see how they stack up.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => {
          const c = selected[i]
          return (
            <div key={i} className="relative">
              {c ? (
                <div className="comic-border rounded-2xl bg-ink-800 overflow-hidden">
                  <button
                    onClick={() => removeFromCompare(c.id)}
                    className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 active:scale-90 transition-all"
                  >
                    <X size={12} />
                  </button>
                  <img src={c.image} alt={c.name} className="w-full aspect-square object-cover" onError={handleImgError(c.name)} />
                  <div className="p-3">
                    <p className="font-display text-base truncate">{c.name}</p>
                    <p className="text-xs text-mist-500">Power: {totalPower(c)}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPicker(picker === `slot-${i}` ? null : `slot-${i}`)}
                  className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-ink-600 flex flex-col items-center justify-center gap-2 text-mist-500 hover:border-hero-blue hover:text-hero-blue active:scale-95 transition-all"
                >
                  <Plus size={22} />
                  <span className="text-xs">Add Character</span>
                </button>
              )}

              {picker === `slot-${i}` && !c && (
                <div className="absolute z-20 top-full mt-2 left-0 right-0 max-h-64 overflow-y-auto bg-ink-800 comic-border rounded-xl p-2 space-y-1">
                  {all
                    .filter((ch) => !compareIds.includes(ch.id))
                    .slice(0, 30)
                    .map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => {
                          const result = addToCompare(ch.id)
                          if (result === 'added') push(`${ch.name} added to compare`, 'success')
                          setPicker(null)
                        }}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-ink-700 active:scale-[0.98] transition-all text-left text-sm"
                      >
                        <img src={ch.image} alt="" className="w-7 h-7 rounded object-cover" onError={handleImgError(ch.name)} />
                        {ch.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div className="text-center mb-6">
          <button onClick={clearCompare} className="text-xs text-mist-500 hover:text-red-800 active:scale-95 transition-all">
            Clear all
          </button>
        </div>
      )}

      {selected.length >= 2 ? (
        <>
          <section className="comic-border rounded-2xl bg-ink-800 p-6 mb-8">
            <h2 className="font-display text-2xl mb-4 text-center">Radar Comparison</h2>
            <RadarChartCompare characters={selected} />
          </section>

          {similarity !== null && (
            <div className="text-center mb-8">
              <p className="text-sm text-mist-400">
                Similarity score between <span className="text-hero-gold">{selected[0].name}</span> and{' '}
                <span className="text-hero-gold">{selected[1].name}</span>:{' '}
                <span className="font-stats text-lg text-mist-100">{similarity}%</span>
              </p>
            </div>
          )}

          <section className="text-center comic-border rounded-2xl bg-gradient-to-r from-villain-red/20 to-hero-blue/20 p-8">
            <Swords className="mx-auto mb-3 text-hero-gold" size={26} />
            <h2 className="font-display text-2xl mb-4">Battle Simulator</h2>
            <button
              onClick={runBattle}
              className="px-6 py-3 rounded-full bg-hero-red hover:bg-red-600 active:scale-95 transition-all text-sm font-medium"
            >
              Simulate Fight
            </button>
            {battleResult && (
              <p className="mt-5 font-display text-3xl animate-pow text-hero-gold">
                {battleResult} wins!
              </p>
            )}
            <p className="text-xs text-mist-500 mt-4">
              A lighthearted simulation for fun — weighted by total power stats plus a little chaos.
            </p>
          </section>
        </>
      ) : (
        <div className="comic-border bg-ink-800 p-8 text-center max-w-md mx-auto">
          <Swords size={28} className="mx-auto text-mist-500 mb-3" />
          <p className="stamp inline-block px-3 py-1 text-xs font-bold text-mist-500 rotate-2 mb-3">
            Standing By
          </p>
          <p className="text-sm text-mist-500">Add at least two characters to compare.</p>
        </div>
      )}
    </div>
  )
}
