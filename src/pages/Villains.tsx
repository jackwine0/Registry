import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Skull, Building2 } from 'lucide-react'
import { searchCharacters } from '../lib/api'
import { handleImgError } from '../lib/image'
import type { Character } from '../types/character'

function threatColor(level = 0) {
  if (level >= 85) return 'text-red-700'
  if (level >= 65) return 'text-orange-800'
  if (level >= 40) return 'text-yellow-800'
  return 'text-mist-400'
}

function threatLabel(level = 0) {
  if (level >= 85) return 'EXTREME'
  if (level >= 65) return 'HIGH'
  if (level >= 40) return 'MODERATE'
  return 'LOW'
}

export default function Villains() {
  const [villains, setVillains] = useState<Character[]>([])

  useEffect(() => {
    searchCharacters({ alignment: 'villain', sort: 'power-desc' }).then(setVillains)
  }, [])

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="relative halftone text-hero-red/25 py-14 border-b-4 border-mist-100 bg-mist-100/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <Skull className="mx-auto text-red-700 mb-3" size={32} />
          <h1 className="font-display text-6xl text-red-800">Villain Archive</h1>
          <p className="text-mist-400 mt-2 max-w-xl mx-auto text-sm">
            The registry's most dangerous entries — ranked by threat level, criminal record, and confirmed casualties.
          </p>
          <span className="stamp inline-block mt-5 px-4 py-1.5 text-sm font-bold text-hero-red rotate-2">
            Classified
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {villains.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/character/${v.id}`}
                className="block comic-border glow-villain rounded-2xl overflow-hidden bg-ink-800 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between px-3 pt-3">
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${threatColor(v.threatLevel)}`}>
                    <AlertTriangle size={11} /> Threat: {threatLabel(v.threatLevel)}
                  </span>
                </div>
                <div className="relative aspect-square mt-2">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={handleImgError(v.name)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <Skull size={18} className="absolute top-2 right-2 text-white/90" />
                </div>
                <div className="p-3">
                  <h3 className="font-display text-lg leading-tight truncate">{v.name}</h3>
                  <div className="flex items-center justify-between text-[11px] text-mist-400 mt-2">
                    <span>Record: {v.criminalRecord ?? '—'}</span>
                    <span className="flex items-center gap-1">
                      <Skull size={11} /> {v.killCount ?? '—'}
                    </span>
                  </div>
                  {v.connections.enemies.length > 0 && (
                    <p className="text-[11px] text-mist-500 mt-1 truncate">
                      <Building2 size={10} className="inline mr-1" />
                      Rivals: {v.connections.enemies.length}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
