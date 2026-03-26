import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizResult, Position, GameType } from '../types/poker'

interface ProgressStore {
  results: QuizResult[]
  addResult: (result: QuizResult) => void
  clearResults: () => void
  getStats: (position?: Position, gameType?: GameType) => { correct: number; total: number }
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      results: [],
      addResult: (result) =>
        set((state) => ({ results: [...state.results, result] })),
      clearResults: () => set({ results: [] }),
      getStats: (position, gameType) => {
        const results = get().results.filter((r) => {
          if (position && r.position !== position) return false
          if (gameType && r.gameType !== gameType) return false
          return true
        })
        return {
          correct: results.filter((r) => r.correct).length,
          total: results.length,
        }
      },
    }),
    { name: 'lp-progress' }
  )
)
