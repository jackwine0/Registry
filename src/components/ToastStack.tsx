import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { useToast, type ToastTone } from '../store/useToast'

const toneStyles: Record<ToastTone, { icon: typeof Info; classes: string }> = {
  default: { icon: Info, classes: 'bg-mist-100 text-white' },
  success: { icon: CheckCircle2, classes: 'bg-hero-blue text-white' },
  warning: { icon: AlertTriangle, classes: 'bg-hero-red text-white' },
}

export default function ToastStack() {
  const toasts = useToast((s) => s.toasts)
  const dismiss = useToast((s) => s.dismiss)

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[70] flex flex-col-reverse gap-2 w-[calc(100%-2rem)] sm:w-auto max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, classes } = toneStyles[t.tone]
          return (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => dismiss(t.id)}
              className={`comic-border pointer-events-auto flex items-center gap-2 px-4 py-3 text-sm font-bold text-left ${classes}`}
            >
              <Icon size={16} className="shrink-0" />
              {t.message}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
