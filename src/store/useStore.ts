import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Collection {
  id: string
  name: string
  characterIds: string[]
}

interface RegistryState {
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean

  compareIds: string[]
  addToCompare: (id: string) => 'added' | 'duplicate' | 'full'
  removeFromCompare: (id: string) => void
  clearCompare: () => void

  recentlyViewed: string[]
  addRecentlyViewed: (id: string) => void

  trending: Record<string, number>
  trackView: (id: string) => void

  collections: Collection[]
  createCollection: (name: string) => void
  addToCollection: (collectionId: string, characterId: string) => void
  removeFromCollection: (collectionId: string, characterId: string) => void
  deleteCollection: (collectionId: string) => void
}

export const useStore = create<RegistryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),

      compareIds: [],
      addToCompare: (id) => {
        const { compareIds } = get()
        if (compareIds.includes(id)) return 'duplicate'
        if (compareIds.length >= 4) return 'full'
        set({ compareIds: [...compareIds, id] })
        return 'added'
      },
      removeFromCompare: (id) =>
        set((state) => ({ compareIds: state.compareIds.filter((c) => c !== id) })),
      clearCompare: () => set({ compareIds: [] }),

      recentlyViewed: [],
      addRecentlyViewed: (id) =>
        set((state) => ({
          recentlyViewed: [id, ...state.recentlyViewed.filter((r) => r !== id)].slice(0, 12),
        })),

      trending: {},
      trackView: (id) =>
        set((state) => ({
          trending: { ...state.trending, [id]: (state.trending[id] ?? 0) + 1 },
        })),

      collections: [],
      createCollection: (name) =>
        set((state) => ({
          collections: [...state.collections, { id: crypto.randomUUID(), name, characterIds: [] }],
        })),
      addToCollection: (collectionId, characterId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.characterIds.includes(characterId)
              ? { ...c, characterIds: [...c.characterIds, characterId] }
              : c
          ),
        })),
      removeFromCollection: (collectionId, characterId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, characterIds: c.characterIds.filter((id) => id !== characterId) }
              : c
          ),
        })),
      deleteCollection: (collectionId) =>
        set((state) => ({ collections: state.collections.filter((c) => c.id !== collectionId) })),
    }),
    { name: 'the-registry-storage' }
  )
)
