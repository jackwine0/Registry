interface FilterChipsProps {
  label: string
  options: string[]
  value: string
  onChange: (val: string) => void
}

export default function FilterChips({ label, options, value, onChange }: FilterChipsProps) {
  return (
    <div>
      <p className="text-xs font-stats uppercase tracking-wider text-mist-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {['All', ...options].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors capitalize ${
              value === opt
                ? 'bg-hero-red border-hero-red text-white'
                : 'bg-ink-800 border-ink-600 text-mist-300 hover:border-mist-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
