export type Alignment = 'hero' | 'villain' | 'anti-hero' | 'neutral'
export type Universe = 'Marvel' | 'DC' | 'Image' | 'Dark Horse' | 'Other'

export interface PowerStats {
  intelligence: number
  strength: number
  speed: number
  durability: number
  power: number
  combat: number
}

export interface Appearance {
  gender: string
  race: string
  height: string
  weight: string
  eyeColor: string
  hairColor: string
}

export interface Biography {
  fullName: string
  alterEgos: string
  placeOfBirth: string
  firstAppearance: string
  publisher: string
}

export interface Connections {
  groupAffiliation: string
  relatives: string
  allies: string[]
  enemies: string[]
}

export interface Appearances {
  movies: string[]
  comics: string[]
  games: string[]
}

export interface Character {
  id: string
  name: string
  realName: string
  aliases: string[]
  alignment: Alignment
  universe: Universe
  publisher: string
  image: string
  color: string
  powerstats: PowerStats
  appearance: Appearance
  biography: Biography
  connections: Connections
  appearances: Appearances
  quotes: string[]
  description?: string
  threatLevel?: number
  criminalRecord?: number
  killCount?: number
  minions?: string[]
}

export interface Team {
  id: string
  name: string
  alignment: Alignment
  memberIds: string[]
  description: string
  universe: Universe
}
