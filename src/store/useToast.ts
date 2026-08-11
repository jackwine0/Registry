import { create } from 'zustand'

export type ToastTone = 'default' | 'success' | 'warning'

interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, tone?: ToastTone) => void
  dismiss: (id: string) => void
}

// Ephemeral UI state only — intentionally not persisted to localStorage.
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = 'default') => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 2800)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
