import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, AlertTriangle } from 'lucide-react'
import { fetchAllCharacters, totalPower } from '../lib/api'
import CharacterCard from '../components/CharacterCard'
import type { Character } from '../types/character'

interface Group {
  name: string
  members: Character[]
}

export default function Teams() {
  const [all, setAll] = useState<Character[]>([])
  const [error, setError] = useState<string | null>(null)
  const [compareA, setCompareA] = useState<string>('')
  const [compareB, setCompareB] = useState<string>('')

  useEffect(() => {
    fetchAllCharacters().then(setAll).catch((e) => setError(e.message))
  }, [])

  // Group the roster by its real Comic Vine team/group affiliation instead
  // of a hand-authored team list, so this reflects live data.
  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Character[]>()
    for (const c of all) {
      const key = c.connections.groupAffiliation || 'Unaffiliated'
      if (key === 'Unaffiliated') continue
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return Array.from(map.entries())
      .map(([name, members]) => ({ name, members }))
      .filter((g) => g.members.length > 0)
      .sort((a, b) => b.members.length - a.members.length)
  }, [all])

  const unaffiliated = all.filter((c) => (c.connections.groupAffiliation || 'Unaffiliated') === 'Unaffiliated')

  useEffect(() => {
    if (groups.length >= 2 && !compareA && !compareB) {
      setCompareA(groups[0].name)
      setCompareB(groups[1].name)
    }
  }, [groups, compareA, compareB])

  const avgPower = (members: Character[]) =>
    members.length === 0 ? 0 : Math.round(members.reduce((sum, m) => sum + totalPower(m), 0) / members.length)

  const groupA = groups.find((g) => g.name === compareA)
  const groupB = groups.find((g) => g.name === compareB)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
      <div className="text-center">
        <Users className="mx-auto text-hero-gold mb-3" size={28} />
        <h1 className="font-display text-5xl">Teams &amp; Groups</h1>
        <p className="text-mist-400 text-sm mt-2">
          Affiliations pulled live from Comic Vine for everyone in the registry.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-orange-800 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 max-w-2xl mx-auto">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>Couldn't load teams from Comic Vine ({error}).</span>
        </div>
      )}

      {groups.length === 0 && !error ? (
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="comic-border bg-ink-800 p-6">
              <div className="h-6 w-1/3 bg-ink-700 animate-pulse mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="aspect-square bg-ink-700 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <section className="space-y-8">
            {groups.map((group) => (
              <div key={group.name} className="bg-ink-800 comic-border rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-display text-2xl">{group.name}</h2>
                    <p className="text-sm text-mist-400 mt-1">{group.members.length} member(s) in this registry</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-stats text-xl text-hero-gold">{avgPower(group.members)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-mist-500">Avg. Est. Power</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {group.members.map((m) => <CharacterCard key={m.id} character={m} variant="mini" />)}
                </div>
              </div>
            ))}
          </section>

          {/* Team comparison */}
          {groups.length >= 2 && (
            <section className="bg-ink-800 comic-border rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-5 text-center">Group Comparison</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="bg-ink-700 border border-ink-600 rounded-lg px-3 py-2 text-sm"
                >
                  {groups.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                </select>
                <span className="font-display text-hero-gold">VS</span>
                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="bg-ink-700 border border-ink-600 rounded-lg px-3 py-2 text-sm"
                >
                  {groups.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                </select>
              </div>
              {groupA && groupB && (
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto text-center">
                  <div>
                    <p className="font-display text-lg">{groupA.name}</p>
                    <p className="font-stats text-3xl text-hero-blue mt-2">{avgPower(groupA.members)}</p>
                    <p className="text-xs text-mist-500">{groupA.members.length} members</p>
                  </div>
                  <div>
                    <p className="font-display text-lg">{groupB.name}</p>
                    <p className="font-stats text-3xl text-hero-blue mt-2">{avgPower(groupB.members)}</p>
                    <p className="text-xs text-mist-500">{groupB.members.length} members</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {unaffiliated.length > 0 && (
            <section>
              <h2 className="font-display text-2xl mb-5">Unaffiliated</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {unaffiliated.map((c) => <CharacterCard key={c.id} character={c} variant="mini" />)}
              </div>
            </section>
          )}
        </>
      )}

      <div className="text-center">
        <Link to="/compare" className="text-sm text-hero-blue hover:underline">
          Want to compare individual characters instead? →
        </Link>
      </div>
    </div>
  )
}
