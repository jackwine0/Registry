import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip,
} from 'recharts'
import type { Character } from '../types/character'

const STAT_LABELS: { key: keyof Character['powerstats']; label: string }[] = [
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'durability', label: 'Durability' },
  { key: 'power', label: 'Power' },
  { key: 'combat', label: 'Combat' },
]

export default function RadarChartCompare({ characters }: { characters: Character[] }) {
  const data = STAT_LABELS.map(({ key, label }) => {
    const row: Record<string, string | number> = { stat: label }
    characters.forEach((c) => {
      row[c.name] = c.powerstats[key]
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={380}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#3d3d4d" />
        <PolarAngleAxis dataKey="stat" tick={{ fill: '#c9c9d4', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6c757d', fontSize: 10 }} />
        {characters.map((c) => (
          <Radar
            key={c.id}
            name={c.name}
            dataKey={c.name}
            stroke={c.color}
            fill={c.color}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        ))}
        <Tooltip contentStyle={{ background: '#16161c', border: '1px solid #2a2a36', borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
