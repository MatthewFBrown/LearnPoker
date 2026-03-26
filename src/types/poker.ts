export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
export type Rank = typeof RANKS[number]

// e.g. 'AA', 'AKs', 'AKo', 'KK', ...
export type HandCombo = string

export type Action = 'open' | 'fold' | '3bet' | 'call'

export type Position =
  | 'UTG' | 'UTG1' | 'UTG2'
  | 'LJ' | 'HJ' | 'CO' | 'BTN'
  | 'SB' | 'BB'

export type GameType = '6max' | 'fullring'

export type RangeMap = Record<string, Set<HandCombo>>

export interface QuizResult {
  hand: HandCombo
  position: Position
  gameType: GameType
  userAction: Action
  correctAction: Action
  correct: boolean
  timestamp: number
}

export interface PositionStats {
  position: Position
  correct: number
  total: number
}

export interface Session {
  id: string
  date: string          // ISO date string
  gameType: GameType | 'mtt'
  stakes: string        // e.g. "NL10", "$1/$2"
  buyIn: number
  cashOut: number
  hours: number
  notes: string
}
