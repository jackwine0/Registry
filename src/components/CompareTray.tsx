import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Swords, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { fetchCharactersByIds } from '../lib/api'
import { handleImgError } from '../lib/image'
import type { Character } from '../types/character'

export default function CompareTray() {
  const compareIds = useStore((s) => s.compareIds)
  const removeFromCompare = useStore((s) => s.removeFromCompare)
  const clearCompare = useStore((s) => s.clearCompare)
  const [chars, setChars] = useState<Character[]>([])
  const location = useLocation()

  useEffect(() => {
    if (compareIds.length === 0) {
      setChars([])
      return
    }
    fetchCharactersByIds(compareIds).then(setChars)
  }, [compareIds])

  // The Compare page already shows this same selection inline — no need to
  // float the tray on top of it too.
  const hidden = location.pathname === '/compare' || compareIds.length === 0

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[60] bg-mist-100 text-white border-t-4 border-hero-red"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Swords size={18} className="text-hero-gold" />
              <span className="font-stats text-sm font-bold">{compareIds.length}/4</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
              {chars.map((c) => (
                <div key={c.id} className="relative shrink-0">
                  <img
                    src={c.image}
                    alt={c.name}
                    onError={handleImgError(c.name)}
                    className="w-10 h-10 rounded object-cover border-2 border-white/30"
                  />
                  <button
                    onClick={() => removeFromCompare(c.id)}
                    className="absolute -top-1.5 -right-1.5 bg-hero-red rounded-full p-0.5 active:scale-90 transition-transform"
                    aria-label={`Remove ${c.name} from compare`}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={clearCompare}
              className="hidden sm:block text-xs text-ink-700 hover:text-white shrink-0 active:scale-95 transition-transform"
            >
              Clear
            </button>
            <Link
              to="/compare"
              className="shrink-0 px-4 py-2 bg-hero-red hover:bg-red-700 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
            >
              Compare Now
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
