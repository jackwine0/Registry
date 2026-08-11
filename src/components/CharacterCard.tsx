import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Swords, Eye, Shield, Skull, Scale } from 'lucide-react'
import type { Character } from '../types/character'
import { useStore } from '../store/useStore'
import { useToast } from '../store/useToast'
import { totalPower } from '../lib/api'
import { handleImgError } from '../lib/image'

interface CharacterCardProps {
  character: Character
  variant?: 'compact' | 'large' | 'mini' | 'featured'
}

const alignmentBadge: Record<Character['alignment'], { label: string; Icon: typeof Shield; classes: string }> = {
  hero: { label: 'Hero', Icon: Shield, classes: 'bg-hero-blue/15 text-hero-blue border-hero-blue/40' },
  villain: { label: 'Villain', Icon: Skull, classes: 'bg-villain-red/15 text-red-800 border-villain-red/50' },
  'anti-hero': { label: 'Anti-Hero', Icon: Swords, classes: 'bg-villain-orange/15 text-orange-800 border-villain-orange/40' },
  neutral: { label: 'Neutral', Icon: Scale, classes: 'bg-mist-500/15 text-mist-300 border-mist-500/40' },
}

export default function CharacterCard({ character, variant = 'compact' }: CharacterCardProps) {
  const isFavorite = useStore((s) => s.isFavorite(character.id))
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const addToCompare = useStore((s) => s.addToCompare)
  const push = useToast((s) => s.push)
  const badge = alignmentBadge[character.alignment]
  const power = totalPower(character)
  const powerPct = Math.round((power / 600) * 100)

  const isMini = variant === 'mini'
  const isFeatured = variant === 'featured'
  const isLarge = variant === 'large'

  const handleCompareClick = () => {
    const result = addToCompare(character.id)
    if (result === 'added') push(`${character.name} added to compare`, 'success')
    else if (result === 'duplicate') push(`${character.name} is already in your compare list`)
    else push('Compare list is full — remove someone first (max 4)', 'warning')
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleFavorite(character.id)
    push(isFavorite ? `Removed ${character.name} from favorites` : `${character.name} added to favorites`, 'success')
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group relative comic-border rounded-2xl overflow-hidden bg-ink-800 flex flex-col ${
        isFeatured ? 'glow-hero' : ''
      } ${isMini ? 'w-40' : ''}`}
    >
      <Link to={`/character/${character.id}`} className="flex flex-col flex-1">
        <div className={`relative overflow-hidden ${isMini ? 'aspect-square' : isLarge ? 'aspect-[4/5]' : 'aspect-square'}`}>
          <img
            src={character.image}
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={handleImgError(character.name)}
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${character.color}55, transparent 60%)` }}
          />
          <span
            className={`absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border backdrop-blur ${badge.classes}`}
          >
            <badge.Icon size={10} /> {badge.label}
          </span>
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 active:scale-90 transition-all"
            aria-label="Toggle favorite"
          >
            <Heart
              size={14}
              className={isFavorite ? 'fill-hero-red text-hero-red' : 'text-white'}
            />
          </button>
        </div>

        <div className={`p-3 flex-1 flex flex-col gap-1.5 ${isMini ? 'p-2' : ''}`}>
          <h3 className={`font-display leading-tight ${isMini ? 'text-sm' : isFeatured ? 'text-2xl' : 'text-lg'} truncate`}>
            {character.name}
          </h3>
          {!isMini && (
            <p className="text-xs text-mist-500 truncate">{character.realName}</p>
          )}
          {!isMini && (
            <div className="mt-1">
              <div className="flex justify-between text-[10px] font-stats text-mist-500 mb-0.5">
                <span>Power</span>
                <span>{powerPct}</span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${powerPct}%`, backgroundColor: character.color }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>

      {!isMini && (
        <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-ink-700 mt-auto">
          <Link
            to={`/character/${character.id}`}
            className="flex items-center gap-1 text-xs text-mist-300 hover:text-mist-100 transition-colors"
          >
            <Eye size={12} /> Quick View
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleCompareClick()
            }}
            className="flex items-center gap-1 text-xs text-mist-300 hover:text-hero-gold active:scale-90 transition-all"
            title="Add to compare"
          >
            <Swords size={12} /> Compare
          </button>
        </div>
      )}
    </motion.div>
  )
}
