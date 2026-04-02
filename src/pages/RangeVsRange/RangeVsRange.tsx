import { useState } from 'react'
import { HandMatrix } from '../../components/poker/HandMatrix'
import { getRange, getPositions, HANDS_BY_STRENGTH, parseRangeNotation } from '../../data/ranges'
import { runRangeVsRange, cardId, RANK_CHARS, type Card } from '../../utils/handEvaluator'
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
  { label: '10k', value: 10_000  },
  { label: '50k', value: 50_000  },
  { label: '100k', value: 100_000 },
]

const RANGE_COLORS = [
  { label: 'Range 1', border: 'border-blue-700',   bg: 'bg-blue-900/20',   text: 'text-blue-400',   bar: 'bg-blue-500'   },
  { label: 'Range 2', border: 'border-orange-700', bg: 'bg-orange-900/20', text: 'text-orange-400', bar: 'bg-orange-500' },
]

// ── Board card slot ───────────────────────────────────────────────────────────

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
        w-12 h-16 sm:w-14 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center
        transition-all font-mono select-none
        ${active ? 'border-yellow-400 ring-2 ring-yellow-400/50' : ''}
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
          <span className="text-lg font-bold leading-none">{display}</span>
          <span className="text-xl leading-none">{suit?.sym}</span>
        </>
      )}
    </button>
  )
}

function CardPicker({ usedKeys, onPick }: { usedKeys: Set<number>; onPick: (c: Card) => void }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mt-4">
      <p className="text-sm font-medium text-gray-300 mb-4">Pick a board card</p>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex gap-1.5 mb-2 ml-8">
          {SUIT_META.map((s, si) => (
            <div key={si} className={`flex-1 text-center text-lg ${s.red ? 'text-red-500' : 'text-gray-300'}`}>{s.sym}</div>
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
                    <button key={si} disabled={used} onClick={() => onPick(card)}
                      className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 font-mono font-bold transition-all border
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

      {/* Desktop */}
      <div className="hidden sm:block">
        <div className="flex gap-1.5 mb-2">
          {DISPLAY_RANKS.map(r => (
            <div key={r} className="flex-1 text-center text-xs text-gray-500 font-mono">{r === 'T' ? '10' : r}</div>
          ))}
        </div>
        <div className="space-y-1.5">
          {SUIT_META.map((suit, si) => (
            <div key={si} className="flex gap-1.5">
              {DISPLAY_RANKS.map((rankChar, di) => {
                const rank = dri(di)
                const card: Card = { rank, suit: si }
                const used = usedKeys.has(cardId(card))
                const display = rankChar === 'T' ? '10' : rankChar
                return (
                  <button key={rank} disabled={used} onClick={() => onPick(card)}
                    className={`flex-1 h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 font-mono font-bold transition-all border
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

// ── Range builder panel ───────────────────────────────────────────────────────

interface RangePanelProps {
  index: 0 | 1
  range: Set<string>
  setRange: (r: Set<string>) => void
  gameType: GameType
  onResultClear: () => void
}

function RangePanel({ index, range, setRange, gameType, onResultClear }: RangePanelProps) {
  const [notation, setNotation]       = useState('')
  const [notationError, setNotationError] = useState(false)
  const [sliderPct, setSliderPct]     = useState(0)
  const [activePreset, setActivePreset] = useState<Position | null>(null)

  const { getCustomRange, hasCustomRange } = useRangeStore()
  const col = RANGE_COLORS[index]
  const positions = getPositions(gameType).filter(p => p !== 'BB')
  const rangePct = Math.round((range.size / 169) * 100)

  function loadPreset(pos: Position) {
    const customHands = getCustomRange(gameType, pos)
    const r = customHands ? new Set(customHands) : getRange(gameType, pos)
    setRange(r)
    setActivePreset(pos)
    setSliderPct(0)
    onResultClear()
  }

  function applyNotation() {
    const parsed = parseRangeNotation(notation)
    if (parsed.size === 0) { setNotationError(true); return }
    setNotationError(false)
    setRange(parsed)
    setSliderPct(0)
    setActivePreset(null)
    onResultClear()
  }

  function applyStrength(pct: number) {
    setSliderPct(pct)
    setActivePreset(null)
    const count = Math.round((pct / 100) * HANDS_BY_STRENGTH.length)
    setRange(new Set(HANDS_BY_STRENGTH.slice(0, count)))
    onResultClear()
  }

  function toggleHand(hand: string) {
    const next = new Set(range)
    if (next.has(hand)) next.delete(hand)
    else next.add(hand)
    setRange(next)
    setActivePreset(null)
    onResultClear()
  }

  return (
    <div className={`bg-gray-900 rounded-xl border-2 ${col.border} ${col.bg} p-4 flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className={`text-sm font-semibold ${col.text}`}>{col.label}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-mono">
            {range.size} hands
            {range.size > 0 && <span className="text-gray-600"> ({rangePct}%)</span>}
          </span>
          {range.size > 0 && (
            <button
              onClick={() => { setRange(new Set()); setSliderPct(0); setActivePreset(null); onResultClear() }}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Position presets */}
      <div className="flex flex-wrap gap-1">
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => loadPreset(pos)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              activePreset === pos
                ? 'bg-green-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-green-900/50 hover:text-green-300'
            }`}
          >
            {pos}
            {hasCustomRange(gameType, pos) && <span className="ml-1 text-orange-400">·</span>}
          </button>
        ))}
      </div>

      {/* Notation */}
      <div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={notation}
            onChange={(e) => { setNotation(e.target.value); setNotationError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && applyNotation()}
            placeholder="JJ+, AQs+, KQo"
            className={`flex-1 bg-gray-800 border rounded-lg px-3 py-1.5 text-gray-100 text-xs font-mono focus:outline-none ${
              notationError ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
            }`}
          />
          <button
            onClick={applyNotation}
            className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors"
          >
            Apply
          </button>
        </div>
        {notationError && <p className="text-xs text-red-400 mt-1">No valid hands found.</p>}
      </div>

      {/* Strength slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">Top hands by strength</p>
          <span className="text-xs font-mono text-green-400">{sliderPct}%</span>
        </div>
        <input
          type="range" min={0} max={100} value={sliderPct}
          onChange={(e) => applyStrength(+e.target.value)}
          className="w-full accent-green-500"
        />
      </div>

      {/* Hand matrix */}
      <div className="overflow-x-auto">
        <HandMatrix
          highlighted={range as Set<string>}
          onCellClick={toggleHand}
          compact
        />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function RangeVsRange() {
  const [range1, setRange1]         = useState<Set<string>>(new Set())
  const [range2, setRange2]         = useState<Set<string>>(new Set())
  const [board, setBoard]           = useState<(Card | null)[]>(Array(5).fill(null))
  const [gameType, setGameType]     = useState<GameType>('6max')
  const [activeBoard, setActiveBoard] = useState<number | null>(null)
  const [result, setResult]         = useState<{ r1: number; r2: number } | null>(null)
  const [running, setRunning]       = useState(false)
  const [iterations, setIterations] = useState(50_000)

  const boardKeys = new Set(board.filter(Boolean).map(c => cardId(c!)))

  function pickBoardCard(card: Card) {
    if (activeBoard === null) return
    const next = board.map((c, i) => i === activeBoard ? card : c)
    setBoard(next)
    setResult(null)
    const nextEmpty = next.findIndex(c => !c)
    setActiveBoard(nextEmpty >= 0 ? nextEmpty : null)
  }

  function handleBoardClick(pos: number) {
    if (board[pos]) {
      setBoard(board.map((c, i) => i === pos ? null : c))
      setResult(null)
    }
    setActiveBoard(pos)
  }

  function calculate() {
    if (range1.size === 0 || range2.size === 0) return
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      const boardCards = board.filter(Boolean) as Card[]
      const res = runRangeVsRange([...range1], [...range2], boardCards, iterations)
      setResult({ r1: res.hero, r2: res.opp })
      setRunning(false)
    }, 10)
  }

  function clear() {
    setRange1(new Set())
    setRange2(new Set())
    setBoard(Array(5).fill(null))
    setResult(null)
    setActiveBoard(null)
  }

  const canCalc = range1.size > 0 && range2.size > 0 && !running

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">Range vs Range</h2>
          <p className="text-gray-500 text-sm">Equity between two full ranges</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Simulations</p>
          <div className="flex gap-1">
            {ITERATION_OPTIONS.map(({ label, value }) => (
              <button key={value} onClick={() => setIterations(value)}
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

      {/* Game type + Board + Actions */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-6">

          {/* Game type */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Game</p>
            <div className="flex gap-1">
              {(['6max', 'fullring'] as GameType[]).map(g => (
                <button key={g} onClick={() => { setGameType(g); setResult(null) }}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    gameType === g ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}
                >
                  {GAME_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Board */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Board (optional)</p>
            <div className="flex gap-2">
              {[0,1,2,3,4].map(pos => (
                <CardSlot
                  key={pos}
                  card={board[pos]}
                  active={activeBoard === pos}
                  onClick={() => handleBoardClick(pos)}
                  label={['F','','','T','R'][pos]}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={calculate}
              disabled={!canCalc}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors"
            >
              {running ? 'Calculating…' : 'Calculate'}
            </button>
            <button onClick={clear}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 rounded-xl transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Results</p>
          <div className="space-y-3">
            {([
              { val: result.r1, ...RANGE_COLORS[0] },
              { val: result.r2, ...RANGE_COLORS[1] },
            ] as const).map(({ label, val, text, bar }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className={`text-sm font-medium ${text}`}>{label}</span>
                  <span className={`text-3xl font-bold font-mono ${text}`}>{(val * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div className={`${bar} h-3 rounded-full transition-all`} style={{ width: `${val * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Range panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RangePanel index={0} range={range1} setRange={setRange1} gameType={gameType} onResultClear={() => setResult(null)} />
        <RangePanel index={1} range={range2} setRange={setRange2} gameType={gameType} onResultClear={() => setResult(null)} />
      </div>

      {/* Board card picker */}
      {activeBoard !== null && (
        <CardPicker usedKeys={boardKeys} onPick={pickBoardCard} />
      )}
    </div>
  )
}
