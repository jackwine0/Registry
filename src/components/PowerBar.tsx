import { motion } from 'framer-motion'

interface PowerBarProps {
  label: string
  value: number
  color?: string
  delay?: number
}

export default function PowerBar({ label, value, color = '#DC143C', delay = 0 }: PowerBarProps) {
  return (
    <div>
      <div className="flex justify-between font-stats text-xs uppercase tracking-wider text-mist-300 mb-1">
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-ink-700 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  )
}
