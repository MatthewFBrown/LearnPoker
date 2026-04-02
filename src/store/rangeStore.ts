import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HandCombo, GameType, Position } from '../types/poker'

interface RangeStore {
  customRanges: Record<string, HandCombo[]>
  setCustomRange: (gameType: GameType, position: Position, hands: HandCombo[]) => void
  resetRange: (gameType: GameType, position: Position) => void
  hasCustomRange: (gameType: GameType, position: Position) => boolean
  getCustomRange: (gameType: GameType, position: Position) => HandCombo[] | null
}

export const useRangeStore = create<RangeStore>()(
  persist(
    (set, get) => ({
      customRanges: {},
      setCustomRange: (gameType, position, hands) =>
        set((state) => ({
          customRanges: { ...state.customRanges, [`${gameType}_${position}`]: hands },
        })),
      resetRange: (gameType, position) =>
        set((state) => {
          const next = { ...state.customRanges }
          delete next[`${gameType}_${position}`]
          return { customRanges: next }
        }),
      hasCustomRange: (gameType, position) =>
        `${gameType}_${position}` in get().customRanges,
      getCustomRange: (gameType, position) =>
        get().customRanges[`${gameType}_${position}`] ?? null,
    }),
    { name: 'lp-ranges' }
  )
)
