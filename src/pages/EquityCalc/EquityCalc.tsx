import { useState, useCallback } from 'react'
import { runEquity, makeDeck, cardId, RANK_CHARS, type Card, type EquityResult } from '../../utils/handEvaluator'

// ── Constants ─────────────────────────────────────────────────────────────────

const SUIT_META = [
  { sym: '♠', label: 'Spades',   red: false },
  { sym: '♥', label: 'Hearts',   red: true  },
  { sym: '♦', label: 'Diamonds', red: true  },
  { sym: '♣', label: 'Clubs',    red: false },
]

// Ranks displayed high-to-low (A → 2)
const DISPLAY_RANKS = [...RANK_CHARS].reverse() // index 0 = A (rank 12)
function displayRankToRank(di: number): number { return 12 - di }

const PLAYER_COLORS = [
  { border: 'border-blue-500',  bg: 'bg-blue-900/30',  text: 'text-blue-400',  bar: 'bg-blue-500'  },
  { border: 'border-orange-500', bg: 'bg-orange-900/30', text: 'text-orange-400', bar: 'bg-orange-500' },
]

const NUM_PLAYERS = 2

const ITERATION_OPTIONS = [
  { label: '1k',   value: 1_000,   note: 'rough'   },
  { label: '10k',  value: 10_000,  note: 'fast'    },
  { label: '50k',  value: 50_000,  note: 'default' },
  { label: '100k', value: 100_000, note: 'precise' },
  { label: '500k', value: 500_000, note: 'slow'    },
]

// ── Board preset generators ───────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Gen = (avail: Card[]) => Card[] | null

const genDry: Gen = (avail) => {
  // Rainbow + no two cards within 2 ranks (no straight draw)
  for (let _i = 0; _i < 200; _i++) {
    const s = shuffle(avail)
    const result: Card[] = []
    for (const c of s) {
      if (result.length === 3) break
      if (result.some(x => x.suit === c.suit)) continue
      if (result.some(x => Math.abs(x.rank - c.rank) <= 2)) continue
      result.push(c)
    }
    if (result.length === 3) return result
  }
  return null
}

const genWet: Gen = (avail) => {
  // Two suited connected cards + a third connector
  const s = shuffle(avail)
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j < s.length; j++) {
      const c1 = s[i], c2 = s[j]
      if (c1.suit !== c2.suit) continue
      if (Math.abs(c1.rank - c2.rank) > 3 || c1.rank === c2.rank) continue
      for (let k = 0; k < s.length; k++) {
        if (k === i || k === j) continue
        const c3 = s[k]
        if (Math.abs(c3.rank - c1.rank) <= 3 || Math.abs(c3.rank - c2.rank) <= 3)
          return [c1, c2, c3]
      }
    }
  }
  return null
}

const genMonotone: Gen = (avail) => {
  for (const suit of shuffle([0, 1, 2, 3])) {
    const sc = shuffle(avail.filter(c => c.suit === suit))
    if (sc.length >= 3) return sc.slice(0, 3)
  }
  return null
}

const genHigh: Gen = (avail) => {
  const high = shuffle(avail.filter(c => c.rank >= 8)) // T and above
  if (high.length < 3) return null
  const result: Card[] = []
  for (const c of high) {
    if (result.length === 3) break
    if (!result.some(x => x.suit === c.suit)) result.push(c)
  }
  return result.length === 3 ? result : high.slice(0, 3)
}

const genLow: Gen = (avail) => {
  const low = shuffle(avail.filter(c => c.rank <= 5)) // 2–7
  if (low.length < 3) return null
  const result: Card[] = []
  for (const c of low) {
    if (result.length === 3) break
    if (!result.some(x => x.suit === c.suit)) result.push(c)
  }
  return result.length === 3 ? result : low.slice(0, 3)
}

const genPaired: Gen = (avail) => {
  const byRank: Record<number, Card[]> = {}
  for (const c of avail) { byRank[c.rank] ??= []; byRank[c.rank].push(c) }
  const pairs = shuffle(Object.values(byRank).filter(cs => cs.length >= 2))
  if (!pairs.length) return null
  const pair = shuffle(pairs[0]).slice(0, 2)
  const kicker = shuffle(avail.filter(c => c.rank !== pair[0].rank))[0]
  return kicker ? [...pair, kicker] : null
}

const BOARD_PRESETS: { label: string; desc: string; gen: Gen }[] = [
  { label: 'Dry',      desc: 'Rainbow, disconnected',    gen: genDry      },
  { label: 'Wet',      desc: 'Two-tone, connected',      gen: genWet      },
  { label: 'Monotone', desc: 'All same suit',            gen: genMonotone },
  { label: 'High',     desc: 'Ten through Ace',          gen: genHigh     },
  { label: 'Low',      desc: 'Two through Seven',        gen: genLow      },
  { label: 'Paired',   desc: 'Paired board',             gen: genPaired   },
]

// ── Sub-components ────────────────────────────────────────────────────────────

type Slot = { type: 'hand'; player: number; pos: number } | { type: 'board'; pos: number }

function slotKey(s: Slot) {
  return s.type === 'hand' ? `h${s.player}-${s.pos}` : `b${s.pos}`
}

interface CardSlotProps {
  card: Card | null
  active: boolean
  onClick: () => void
  label?: string
}

function CardSlot({ card, active, onClick, label }: CardSlotProps) {
  const isEmpty = card === null
  const suit = card ? SUIT_META[card.suit] : null
  const rank = card ? RANK_CHARS[card.rank] : null
  const display = rank === 'T' ? '10' : rank

  return (
    <button
      onClick={onClick}
      className={`
        w-14 h-20 sm:w-20 sm:h-28 rounded-xl border-2 flex flex-col items-center justify-center
        transition-all font-mono select-none
        ${active ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20' : ''}
        ${isEmpty
          ? active
            ? 'bg-yellow-900/20 border-yellow-500'
            : 'bg-gray-800 border-gray-600 hover:border-gray-400'
          : suit?.red
            ? 'bg-white border-gray-300 text-red-600'
            : 'bg-white border-gray-300 text-gray-900'
        }
      `}
    >
      {isEmpty ? (
        <span className="text-gray-500 text-sm">{label ?? '?'}</span>
      ) : (
        <>
          <span className="text-2xl font-bold leading-none">{display}</span>
          <span className="text-3xl leading-none">{suit?.sym}</span>
        </>
      )}
    </button>
  )
}

interface PickerProps {
  usedKeys: Set<number>
  onPick: (card: Card) => void
}

function CardPicker({ usedKeys, onPick }: PickerProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <p className="text-sm text-gray-400 font-medium mb-4 text-center">Pick a card</p>

      {/* Mobile: 13 rank rows × 4 suit columns */}
      <div className="sm:hidden">
        <div className="flex gap-1.5 mb-2 ml-8">
          {SUIT_META.map((suit, si) => (
            <div key={si} className={`flex-1 text-center text-lg leading-none ${suit.red ? 'text-red-500' : 'text-gray-300'}`}>
              {suit.sym}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {DISPLAY_RANKS.map((rankChar, di) => {
            const rank = displayRankToRank(di)
            const display = rankChar === 'T' ? '10' : rankChar
            return (
              <div key={rankChar} className="flex gap-1.5 items-center">
                <div className="w-8 shrink-0 text-center text-sm font-mono text-gray-500">{display}</div>
                {SUIT_META.map((suit, si) => {
                  const card: Card = { rank, suit: si }
                  const used = usedKeys.has(cardId(card))
                  return (
                    <button
                      key={si}
                      disabled={used}
                      onClick={() => onPick(card)}
                      className={`
                        flex-1 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
                        font-mono font-bold transition-all border shadow-sm
                        ${used
                          ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-30'
                          : suit.red
                            ? 'bg-white border-gray-300 text-red-600 hover:border-red-400 active:scale-95'
                            : 'bg-white border-gray-300 text-gray-900 hover:border-gray-500 active:scale-95'
                        }
                      `}
                    >
                      <span className="text-sm leading-none">{display}</span>
                      <span className="text-base leading-none">{suit.sym}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop: 4 suit rows × 13 rank columns */}
      <div className="hidden sm:block">
        <div className="flex gap-1.5 mb-2">
          {DISPLAY_RANKS.map((rankChar) => (
            <div key={rankChar} className="flex-1 text-center text-xs text-gray-500 font-mono">
              {rankChar === 'T' ? '10' : rankChar}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {SUIT_META.map((suit, si) => (
            <div key={si} className="flex gap-1.5 items-center">
              {DISPLAY_RANKS.map((rankChar, di) => {
                const rank = displayRankToRank(di)
                const card: Card = { rank, suit: si }
                const used = usedKeys.has(cardId(card))
                const displayRank = rankChar === 'T' ? '10' : rankChar
                return (
                  <button
                    key={rank}
                    disabled={used}
                    onClick={() => onPick(card)}
                    className={`
                      flex-1 h-14 rounded-lg flex flex-col items-center justify-center gap-0.5
                      font-mono font-bold transition-all border shadow-sm
                      ${used
                        ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-30'
                        : suit.red
                          ? 'bg-white border-gray-300 text-red-600 hover:border-red-400 hover:shadow-md active:scale-95'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-gray-500 hover:shadow-md active:scale-95'
                      }
                    `}
                  >
                    <span className="text-base leading-none">{displayRank}</span>
                    <span className="text-sm leading-none">{suit.sym}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Hands = (Card | null)[][]
type BoardCards = (Card | null)[]

export function EquityCalc() {
  const [hands, setHands] = useState<Hands>(
    Array.from({ length: NUM_PLAYERS }, () => [null, null])
  )
  const [board, setBoard] = useState<BoardCards>(Array(5).fill(null))
  const [active, setActive] = useState<Slot | null>({ type: 'hand', player: 0, pos: 0 })
  const [results, setResults] = useState<EquityResult[] | null>(null)
  const [running, setRunning] = useState(false)
  const [iterations, setIterations] = useState(50_000)

  const usedKeys = new Set<number>([
    ...hands.flat().filter(Boolean).map(c => cardId(c!)),
    ...board.filter(Boolean).map(c => cardId(c!)),
  ])

  const pickCard = useCallback((card: Card) => {
    if (!active) return

    if (active.type === 'hand') {
      const newHands = hands.map((h, pi) =>
        pi === active.player ? h.map((c, ci) => (ci === active.pos ? card : c)) : h
      )
      setHands(newHands)
      setResults(null)

      // Auto-advance to next empty slot
      const next = findNextEmpty(newHands, board, active)
      setActive(next)
    } else {
      const newBoard = board.map((c, i) => (i === active.pos ? card : c))
      setBoard(newBoard)
      setResults(null)

      const next = findNextEmpty(hands, newBoard, active)
      setActive(next)
    }
  }, [active, hands, board])

  function findNextEmpty(h: Hands, b: BoardCards, current: Slot): Slot | null {
    // Try next hand slots first
    for (let p = 0; p < NUM_PLAYERS; p++) {
      for (let pos = 0; pos < 2; pos++) {
        if (!h[p][pos]) {
          const s: Slot = { type: 'hand', player: p, pos }
          if (slotKey(s) !== slotKey(current)) return s
        }
      }
    }
    // Then board slots
    for (let pos = 0; pos < 5; pos++) {
      if (!b[pos]) {
        const s: Slot = { type: 'board', pos }
        if (slotKey(s) !== slotKey(current)) return s
      }
    }
    return null
  }

  function removeCard(slot: Slot) {
    if (slot.type === 'hand') {
      setHands(hands.map((h, pi) =>
        pi === slot.player ? h.map((c, ci) => (ci === slot.pos ? null : c)) : h
      ))
    } else {
      setBoard(board.map((c, i) => (i === slot.pos ? null : c)))
    }
    setResults(null)
    setActive(slot)
  }

  function handleSlotClick(slot: Slot) {
    const card = slot.type === 'hand' ? hands[slot.player][slot.pos] : board[slot.pos]
    if (card !== null) {
      removeCard(slot)
    } else {
      setActive(slot)
    }
  }

  function calculate() {
    const filledHands = hands.map(h => h.filter(Boolean) as Card[])
    if (filledHands.some(h => h.length !== 2)) return

    const filledBoard = board.filter(Boolean) as Card[]
    setRunning(true)
    setResults(null)

    // Run in a timeout so the UI updates before the heavy computation
    setTimeout(() => {
      const res = runEquity(filledHands, filledBoard, iterations)
      setResults(res)
      setRunning(false)
    }, 10)
  }

  function clear() {
    setHands(Array.from({ length: NUM_PLAYERS }, () => [null, null]))
    setBoard(Array(5).fill(null))
    setResults(null)
    setActive({ type: 'hand', player: 0, pos: 0 })
  }

  function applyPreset(gen: Gen) {
    const handKeys = new Set(hands.flat().filter(Boolean).map(c => cardId(c!)))
    const avail = makeDeck().filter(c => !handKeys.has(cardId(c)))
    const flop = gen(avail)
    if (!flop) return
    setBoard([...flop, null, null])
    setResults(null)
  }

  const handsComplete = hands.every(h => h.every(Boolean))

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">Equity Calculator</h2>
          <p className="text-gray-500 text-sm">Monte Carlo simulation</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Simulations</p>
          <div className="flex gap-1">
            {ITERATION_OPTIONS.map(({ label, value, note }) => (
              <button
                key={value}
                onClick={() => setIterations(value)}
                title={note}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  iterations === value
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hands */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
        {hands.map((hand, pi) => {
          const col = PLAYER_COLORS[pi]
          const res = results?.[pi]
          return (
            <div key={pi} className={`flex-1 rounded-2xl border-2 ${col.border} ${col.bg} p-6`}>
              <p className={`text-sm font-semibold uppercase tracking-wide mb-4 text-center ${col.text}`}>
                Player {pi + 1}
              </p>
              <div className="flex gap-3 justify-center mb-4">
                {[0, 1].map(pos => {
                  const slot: Slot = { type: 'hand', player: pi, pos }
                  const isActive = active?.type === 'hand' && active.player === pi && active.pos === pos
                  return (
                    <CardSlot
                      key={pos}
                      card={hand[pos]}
                      active={isActive}
                      onClick={() => handleSlotClick(slot)}
                    />
                  )
                })}
              </div>
              {res && (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm text-gray-400">Equity</span>
                    <span className={`font-bold text-3xl ${col.text}`}>{(res.equity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                    <div className={`${col.bar} h-3 rounded-full transition-all`} style={{ width: `${res.equity * 100}%` }} />
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 justify-center">
                    <span>Win <span className="text-gray-200 font-medium">{(res.win * 100).toFixed(1)}%</span></span>
                    <span>Tie <span className="text-gray-200 font-medium">{(res.tie * 100).toFixed(1)}%</span></span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pot-odds reference */}
      {results && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-6">
          <p className="text-sm text-gray-500 mb-3">Equity needed to call</p>
          <div className="grid grid-cols-4 gap-3">
            {([['⅓ pot', 25], ['½ pot', 33], ['¾ pot', 43], ['Pot', 50]] as [string, number][]).map(([label, need]) => (
              <div key={label} className="bg-gray-800 rounded-xl py-3 text-center">
                <p className="text-sm text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-mono font-bold text-gray-100">{need}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Board */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-4 text-center">Board (optional)</p>
        <div className="flex gap-3 justify-center">
          {[0,1,2,3,4].map(pos => {
            const slot: Slot = { type: 'board', pos }
            const isActive = active?.type === 'board' && active.pos === pos
            const labels = ['Flop','','','Turn','River']
            return (
              <div key={pos} className="flex flex-col items-center gap-1.5">
                <CardSlot
                  card={board[pos]}
                  active={isActive}
                  onClick={() => handleSlotClick(slot)}
                  label={labels[pos]}
                />
                {labels[pos] && (
                  <span className="text-xs text-gray-600">{labels[pos]}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Presets */}
        <div className="flex gap-2 justify-center mt-5 flex-wrap">
          {BOARD_PRESETS.map(({ label, desc, gen }) => (
            <button
              key={label}
              onClick={() => applyPreset(gen)}
              title={desc}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6 justify-center">
        <button
          onClick={calculate}
          disabled={!handsComplete || running}
          className="px-8 py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium text-base transition-colors"
        >
          {running ? 'Calculating…' : 'Calculate Equity'}
        </button>
        <button
          onClick={clear}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 rounded-xl text-base transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Card picker */}
      {active !== null && (
        <CardPicker usedKeys={usedKeys} onPick={pickCard} />
      )}
    </div>
  )
}
