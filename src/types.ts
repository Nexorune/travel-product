export type Budget = '经济' | '适中' | '宽松'
export type Pace = '松弛' | '均衡' | '充实'
export type Companion = '一个人' | '和朋友' | '情侣' | '亲子'

export interface Preferences {
  origin: string
  days: 3 | 5
  budget: Budget | ''
  interests: string[]
  pace: Pace | ''
  companion: Companion | ''
}

export interface Place {
  id: string
  destinationId: string
  name: string
  category: string
  duration: string
  reason: string
  note: string
  coordinate: [number, number]
  source: string
}

export interface Destination {
  id: string
  name: string
  aliases: string[]
  province: string
  eyebrow: string
  summary: string
  accent: string
  soft: string
  budgets: Budget[]
  interests: string[]
  paces: Pace[]
  companions: Companion[]
  days: Array<3 | 5>
  placeIds: string[]
}

export interface TripDay {
  day: number
  title: string
  placeIds: string[]
}

export interface Trip {
  schemaVersion: 1
  tripId: string
  destinationId: string
  daysCount: 3 | 5
  days: TripDay[]
  updatedAt: string
}

export interface Recommendation {
  destination: Destination
  reasons: string[]
  caveat?: string
  score: number
}
