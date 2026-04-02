import { useState } from 'react'
import { runEquityVsRange, cardId, RANK_CHARS, type Card } from '../../utils/handEvaluator'
import { getRange, getPositions } from '../../data/ranges'
import { useRangeStore } from '../../store/rangeStore'
import type { GameType, Position } from '../../types/poker'

// ── Constants ─────────────────────────────────────────────────────────────────

const SUIT_META = [
  { sym: '♠', red: false },
  { sym: '♥', red: true  },
  { sym: '♦', red: true  },
  { sym: '♣', red: false },
]
const DISPLAY_RANKS = [...RANK_CHARS].reverse()
function dri(di: number) { return 12 - di }

const GAME_LABELS: Record<GameType, string> = { '6max': '6-Max', fullring: 'Full Ring' }

const ITERATION_OPTIONS = [
  { label: '5k',  value: 5_000  },
  { label: '20k', value: 20_000 },
  { label: '50k', value: 50_000 },
]

// ── Sub-components ────────────────────────────────────────────────────────────

type ActiveSlot = { type: 'hero'; pos: 0 | 1 } | { type: 'board'; pos: number } | null

function CardSlot({ card, active, onClick, label }: {
  card: Card | null; active: boolean; onClick: () => void; label?: string
}) {
  const suit = card ? SUIT_META[card.suit] : null
  const rank = card ? RANK_CHARS[card.rank] : null
  const display = rank === 'T' ? '10' : rank

  return (
    <button
      onClick={onClick}
      className={`
        w-14 h-18 sm:w-16 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center
        transition-all font-mono select-none aspect-[7/10]
        ${active ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20' : ''}
        ${!card
          ? active ? 'bg-yellow-900/20 border-yellow-500' : 'bg-gray-800 border-gray-600 hover:border-gray-400'
          : suit?.red ? 'bg-white border-gray-300 text-red-600' : 'bg-white border-gray-300 text-gray-900'
        }
      `}
    >
      {!card ? (
        <span className="text-gray-500 text-xs">{label ?? '?'}</span>
      ) : (
        <>
          <span className="text-xl font-bold leading-none">{display}</span>
          <span className="text-2xl leading-none">{suit?.sym}</span>
        </>
      )}
    </button>
  )
}

function CardPicker({ usedKeys, onPick }: { usedKeys: Set<number>; onPick: (c: Card) => void }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mt-6">
      <p className="text-sm font-medium text-gray-300 mb-4">Pick a card</p>

      {/* Mobile: rank rows × suit cols */}
      <div className="sm:hidden">
        <div className="flex gap-1.5 mb-2 ml-8">
          {SUIT_META.map((s, si) => (
            <div key={si} className={`flex-1 text-center text-lg leading-none ${s.red ? 'text-red-500' : 'text-gray-300'}`}>{s.sym}</div>
          ))}
        </div>
        <div className="space-y-1">
          {DISPLAY_RANKS.map((rankChar, di) => {
            const rank = dri(di)
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
                      className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 font-mono font-bold transition-all border shadow-sm
                        ${used ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-25'
                          : suit.red ? 'bg-white border-gray-300 text-red-600 hover:border-red-400 active:scale-95'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-gray-500 active:scale-95'}`}
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

      {/* Desktop: suit rows × rank cols */}
      <div className="hidden sm:block">
        <div className="flex gap-1.5 mb-2">
          {DISPLAY_RANKS.map(r => (
            <div key={r} className="flex-1 text-center text-xs text-gray-500 font-mono">{r === 'T' ? '10' : r}</div>
          ))}
        </div>
        <div className="space-y-1.5">
          {SUIT_META.map((suit, si) => (
            <div key={si} className="flex gap-1.5 items-center">
              {DISPLAY_RANKS.map((rankChar, di) => {
                const rank = dri(di)
                const card: Card = { rank, suit: si }
                const used = usedKeys.has(cardId(card))
                const display = rankChar === 'T' ? '10' : rankChar
                return (
                  <button
                    key={rank}
                    disabled={used}
                    onClick={() => onPick(card)}
                    className={`flex-1 h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 font-mono font-bold transition-all border shadow-sm
                      ${used ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-25'
                        : suit.red ? 'bg-white border-gray-300 text-red-600 hover:border-red-400 hover:shadow-md active:scale-95'
                        : 'bg-white border-gray-300 text-gray-900 hover:border-gray-500 hover:shadow-md active:scale-95'}`}
                  >
                    <span className="text-base leading-none">{display}</span>
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

// ── Result row ────────────────────────────────────────────────────────────────

function equityColor(eq: number) {
  if (eq >= 0.56) return { text: 'text-green-400', bar: 'bg-green-500' }
  if (eq >= 0.44) return { text: 'text-yellow-400', bar: 'bg-yellow-500' }
  return { text: 'text-red-400', bar: 'bg-red-500' }
}

function PositionRow({ pos, rangeSize, equity, isCustom }: {
  pos: Position; rangeSize: number; equity: number; isCustom: boolean
}) {
  const { text, bar } = equityColor(equity)
  const rangePct = Math.round((rangeSize / 169) * 100)

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-800 last:border-0">
      <div className="w-14 shrink-0">
        <span className="font-mono font-bold text-gray-100">{pos}</span>
        {isCustom && <span className="block text-[10px] text-orange-400 leading-none mt-0.5">custom</span>}
      </div>
      <div className="w-16 shrink-0 text-sm text-gray-500 font-mono">
        {rangePct}%
        <span className="text-gray-700 text-xs ml-1">({rangeSize})</span>
      </div>
      <div className="flex-1">
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <div className={`${bar} h-2.5 rounded-full transition-all`} style={{ width: `${equity * 100}%` }} />
        </div>
      </div>
      <div className={`w-16 shrink-0 text-right font-bold font-mono text-lg ${text}`}>
        {(equity * 100).toFixed(1)}%
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type PositionResult = { pos: Position; rangeSize: number; equity: number; isCustom: boolean }

export function EquityByPosition() {
  const [heroCards, setHeroCards]   = useState<(Card | null)[]>([null, null])
  const [board, setBoard]           = useState<(Card | null)[]>(Array(5).fill(null))
  const [gameType, setGameType]     = useState<GameType>('6max')
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>({ type: 'hero', pos: 0 })
  const [results, setResults]       = useState<PositionResult[] | null>(null)
  const [running, setRunning]       = useState(false)
  const [iterations, setIterations] = useState(20_000)

  const { getCustomRange, hasCustomRange } = useRangeStore()

  const usedKeys = new Set<number>([
    ...heroCards.filter(Boolean).map(c => cardId(c!)),
    ...board.filter(Boolean).map(c => cardId(c!)),
  ])

  function pickCard(card: Card) {
    if (!activeSlot) return
    if (activeSlot.type === 'hero') {
      const next = heroCards.map((c, i) => i === activeSlot.pos ? card : c)
      setHeroCards(next)
      setResults(null)
      setActiveSlot(activeSlot.pos === 0 ? { type: 'hero', pos: 1 } : null)
    } else {
      const next = board.map((c, i) => i === activeSlot.pos ? card : c)
      setBoard(next)
      setResults(null)
      const nextEmpty = next.findIndex((c, i) => !c && i !== activeSlot.pos)
      setActiveSlot(nextEmpty >= 0 ? { type: 'board', pos: nextEmpty } : null)
    }
  }

  function handleHeroClick(pos: 0 | 1) {
    if (heroCards[pos]) {
      setHeroCards(heroCards.map((c, i) => i === pos ? null : c))
      setResults(null)
    }
    setActiveSlot({ type: 'hero', pos })
  }

  function handleBoardClick(pos: number) {
    if (board[pos]) {
      setBoard(board.map((c, i) => i === pos ? null : c))
      setResults(null)
    }
    setActiveSlot({ type: 'board', pos })
  }

  function calculate() {
    const hero = heroCards.filter(Boolean) as Card[]
    if (hero.length !== 2) return
    setRunning(true)
    setResults(null)

    setTimeout(() => {
      const positions = getPositions(gameType).filter(p => p !== 'BB')
      const boardCards = board.filter(Boolean) as Card[]
      const out: PositionResult[] = []

      for (const pos of positions) {
        const customHands = getCustomRange(gameType, pos)
        const range = customHands ? new Set(customHands) : getRange(gameType, pos)
        if (range.size === 0) continue
        const res = runEquityVsRange(hero, [...range], boardCards, iterations)
        out.push({
          pos,
          rangeSize: range.size,
          equity: res.hero,
          isCustom: hasCustomRange(gameType, pos),
        })
      }

      setResults(out)
      setRunning(false)
    }, 10)
  }

  function clear() {
    setHeroCards([null, null])
    setBoard(Array(5).fill(null))
    setResults(null)
    setActiveSlot({ type: 'hero', pos: 0 })
  }

  const heroComplete = heroCards.every(Boolean)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">Equity by Position</h2>
          <p className="text-gray-500 text-sm">Your hand vs every opening range at once</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Simulations / position</p>
          <div className="flex gap-1">
            {ITERATION_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setIterations(value)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  iterations === value ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Game type */}
      <div className="flex gap-2 mb-5">
        {(['6max', 'fullring'] as GameType[]).map(g => (
          <button
            key={g}
            onClick={() => { setGameType(g); setResults(null) }}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              gameType === g ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-100'
            }`}
          >
            {GAME_LABELS[g]}
          </button>
        ))}
      </div>

      {/* Hero hand */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Your Hand</p>
        <div className="flex gap-3">
          {([0, 1] as const).map(pos => (
            <CardSlot
              key={pos}
              card={heroCards[pos]}
              active={activeSlot?.type === 'hero' && activeSlot.pos === pos}
              onClick={() => handleHeroClick(pos)}
            />
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Board (optional)</p>
        <div className="flex gap-2">
          {[0,1,2,3,4].map(pos => (
            <CardSlot
              key={pos}
              card={board[pos]}
              active={activeSlot?.type === 'board' && activeSlot.pos === pos}
              onClick={() => handleBoardClick(pos)}
              label={['F','','','T','R'][pos]}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={calculate}
          disabled={!heroComplete || running}
          className="flex-1 py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors"
        >
          {running ? 'Calculating…' : 'Calculate vs All Positions'}
        </button>
        <button
          onClick={clear}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 rounded-xl transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-200">Results</p>
            <div className="flex gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> ahead</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> flip</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> behind</span>
            </div>
          </div>
          <div className="flex text-xs text-gray-600 pb-2 border-b border-gray-800 mb-1">
            <span className="w-14 shrink-0">Pos</span>
            <span className="w-16 shrink-0">Range</span>
            <span className="flex-1" />
            <span className="w-16 text-right">Equity</span>
          </div>
          {results.map(r => (
            <PositionRow
              key={r.pos}
              pos={r.pos}
              rangeSize={r.rangeSize}
              equity={r.equity}
              isCustom={r.isCustom}
            />
          ))}
        </div>
      )}

      {/* Card picker */}
      {activeSlot && (
        <CardPicker usedKeys={usedKeys} onPick={pickCard} />
      )}
    </div>
  )
}
