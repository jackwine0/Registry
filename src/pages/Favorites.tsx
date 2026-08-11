import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { useToast } from '../store/useToast'
import { fetchAllCharacters } from '../lib/api'
import CharacterCard from '../components/CharacterCard'
import type { Character } from '../types/character'
import { Heart, FolderPlus, Trash2 } from 'lucide-react'

export default function Favorites() {
  const favorites = useStore((s) => s.favorites)
  const recentlyViewed = useStore((s) => s.recentlyViewed)
  const collections = useStore((s) => s.collections)
  const createCollection = useStore((s) => s.createCollection)
  const deleteCollection = useStore((s) => s.deleteCollection)
  const removeFromCollection = useStore((s) => s.removeFromCollection)
  const addToCollection = useStore((s) => s.addToCollection)
  const push = useToast((s) => s.push)

  const [all, setAll] = useState<Character[]>([])
  const [newCollectionName, setNewCollectionName] = useState('')
  const [addTarget, setAddTarget] = useState<string | null>(null)

  useEffect(() => {
    fetchAllCharacters().then(setAll)
  }, [])

  const favChars = all.filter((c) => favorites.includes(c.id))
  const recentChars = recentlyViewed.map((id) => all.find((c) => c.id === id)).filter(Boolean) as Character[]

  const exportFavorites = () => {
    const blob = new Blob([JSON.stringify(favChars, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'registry-favorites.json'
    a.click()
    URL.revokeObjectURL(url)
    push('Favorites exported', 'success')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
      <div className="text-center">
        <Heart className="mx-auto text-hero-red mb-3" size={28} />
        <h1 className="font-display text-5xl">Your Collection</h1>
        <p className="text-mist-400 text-sm mt-2">Saved characters, custom lists, and your recent history.</p>
      </div>

      {/* Favorites */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl">Favorites ({favChars.length})</h2>
          {favChars.length > 0 && (
            <button onClick={exportFavorites} className="text-xs text-hero-blue hover:underline active:scale-95 transition-transform">
              Export as JSON
            </button>
          )}
        </div>
        {favChars.length === 0 ? (
          <div className="comic-border bg-ink-800 p-8 text-center">
            <Heart size={28} className="mx-auto text-mist-500 mb-3" />
            <p className="stamp inline-block px-3 py-1 text-xs font-bold text-mist-500 -rotate-2 mb-3">
              File Empty
            </p>
            <p className="text-sm text-mist-500">You haven't favorited anyone yet — tap the heart on any character card.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {favChars.map((c) => (
              <div key={c.id} className="relative group">
                <CharacterCard character={c} variant="compact" />
                <button
                  onClick={() => setAddTarget(addTarget === c.id ? null : c.id)}
                  className="absolute bottom-14 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add to collection"
                >
                  <FolderPlus size={14} />
                </button>
                {addTarget === c.id && collections.length > 0 && (
                  <div className="absolute z-10 bottom-10 right-0 bg-ink-800 comic-border rounded-lg p-2 w-40 space-y-1">
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          addToCollection(col.id, c.id)
                          setAddTarget(null)
                        }}
                        className="w-full text-left text-xs px-2 py-1 rounded hover:bg-ink-700 truncate"
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Custom collections */}
      <section>
        <h2 className="font-display text-2xl mb-5">Custom Collections</h2>
        <div className="flex gap-2 mb-6 max-w-sm">
          <input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="e.g. Sentinels Roster"
            className="flex-1 bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-hero-blue"
          />
          <button
            onClick={() => {
              if (!newCollectionName.trim()) return
              createCollection(newCollectionName.trim())
              push(`Collection "${newCollectionName.trim()}" created`, 'success')
              setNewCollectionName('')
            }}
            className="px-4 py-2 rounded-lg bg-hero-red hover:bg-red-600 active:scale-95 text-sm transition-all"
          >
            Create
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="comic-border bg-ink-800 p-8 text-center">
            <FolderPlus size={28} className="mx-auto text-mist-500 mb-3" />
            <p className="text-sm text-mist-500">No collections yet. Create one to group your favorite characters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {collections.map((col) => {
              const members = all.filter((c) => col.characterIds.includes(c.id))
              return (
                <div key={col.id} className="bg-ink-800 comic-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-xl">{col.name} <span className="text-mist-500 text-sm">({members.length})</span></h3>
                    <button onClick={() => deleteCollection(col.id)} className="text-mist-500 hover:text-red-800 active:scale-90 transition-transform">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {members.length === 0 ? (
                    <p className="text-xs text-mist-500">Empty — add characters from your favorites above.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {members.map((m) => (
                        <div key={m.id} className="relative">
                          <CharacterCard character={m} variant="mini" />
                          <button
                            onClick={() => removeFromCollection(col.id, m.id)}
                            className="absolute -top-1 -right-1 bg-ink-950 rounded-full p-1 text-mist-400 hover:text-red-800 active:scale-90 transition-transform"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Recently viewed */}
      {recentChars.length > 0 && (
        <section>
          <h2 className="font-display text-2xl mb-5">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
            {recentChars.map((c) => (
              <div key={c.id} className="shrink-0">
                <CharacterCard character={c} variant="mini" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
