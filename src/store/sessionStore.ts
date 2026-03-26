import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '../types/poker'

interface SessionStore {
  sessions: Session[]
  addSession: (session: Omit<Session, 'id'>) => void
  deleteSession: (id: string) => void
  updateSession: (id: string, updates: Partial<Session>) => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (session) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            { ...session, id: crypto.randomUUID() },
          ],
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
    }),
    { name: 'lp-sessions' }
  )
)
