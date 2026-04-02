import { useState } from 'react'
import { HandMatrix } from '../../components/poker/HandMatrix'
import { getRange, getPositions, HANDS_BY_STRENGTH, parseRangeNotation } from '../../data/ranges'
import { runEquityVsRange, cardId, RANK_CHARS, type Card } from '../../utils/handEvaluator'
import { potOddsEquity, evCall, spr, sprLabel } from '../../utils/pokerMath'
import type { Position, GameType } from '../../types/poker'

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
  { label: '1k',   value: 1_000   },
  { label: '10k',  value: 10_000  },
  { label: '50k',  value: 50_000  },
  { label: '100k', value: 100_000 },
  { label: '500k', value: 500_000 },
]

// ── Shared sub-components ─────────────────────────────────────────────────────

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
        w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center
        transition-all font-mono select-none
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

function CardPicker({ usedKeys, onPick, activeSlot }: {
  usedKeys: Set<number>
  onPick: (c: Card) => void
  activeSlot: ActiveSlot
}) {
  const slotLabel = activeSlot?.type === 'hero'
    ? `Picking card ${activeSlot.pos + 1} of 2`
    : activeSlot?.type === 'board'
      ? `Picking board card ${activeSlot.pos + 1}`
      : ''

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-300">Pick a card</p>
        {slotLabel && <p className="text-xs text-yellow-400">{slotLabel}</p>}
      </div>

      {/* Mobile: 13 rank rows × 4 suit columns */}
      <div className="sm:hidden">
        <div className="flex gap-2 mb-2 ml-8">
          {SUIT_META.map((suit, si) => (
            <div key={si} className={`flex-1 text-center text-lg leading-none ${suit.red ? 'text-red-500' : 'text-gray-300'}`}>
              {suit.sym}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {DISPLAY_RANKS.map((rankChar, di) => {
            const rank = dri(di)
            const display = rankChar === 'T' ? '10' : rankChar
            return (
              <div key={rankChar} className="flex gap-2 items-center">
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
                          ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-25'
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
        <div className="flex gap-2 mb-2">
          {DISPLAY_RANKS.map(r => (
            <div key={r} className="flex-1 text-center text-xs text-gray-500 font-mono">
              {r === 'T' ? '10' : r}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {SUIT_META.map((suit, si) => (
            <div key={si} className="flex gap-2 items-center">
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
                    className={`
                      flex-1 h-16 rounded-lg flex flex-col items-center justify-center gap-0.5
                      font-mono font-bold transition-all border shadow-sm
                      ${used
                        ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-25'
                        : suit.red
                          ? 'bg-white border-gray-300 text-red-600 hover:border-red-400 hover:shadow-md active:scale-95'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-gray-500 hover:shadow-md active:scale-95'
                      }
                    `}
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

// ── Stack size analysis ───────────────────────────────────────────────────────

function NumInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}

function StackSizePanel({ equity, pot, setPot, effStack, setEffStack, betSize, setBetSize }: {
  equity: number
  pot: string;      setPot: (v: string) => void
  effStack: string; setEffStack: (v: string) => void
  betSize: string;  setBetSize: (v: string) => void
}) {
  const p = Math.max(0, +pot)
  const s = Math.max(0, +effStack)
  const b = Math.max(0, +betSize)

  const sprValue  = spr(s, p)
  const sprText   = sprLabel(sprValue)
  const breakEven = b > 0 ? potOddsEquity(p, b) : null
  const callEV    = b > 0 ? evCall(equity, p + b, b) : null
  const allinEV   = s > 0 ? evCall(equity, p + s, s) : null

  const equityPct = (equity * 100).toFixed(1)

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Stack Size Analysis</p>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-2">
        <NumInput label="Pot ($)"             value={pot}      onChange={setPot}      />
        <NumInput label="Eff. stack ($)"      value={effStack} onChange={setEffStack} />
        <NumInput label="Bet / all-in ($)"    value={betSize}  onChange={setBetSize}  />
      </div>

      {/* Output cards */}
      <div className="grid grid-cols-2 gap-2">

        {/* SPR */}
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">SPR</p>
          <p className="text-xl font-bold font-mono text-purple-400">
            {sprValue === Infinity ? '∞' : sprValue.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 mt-1 leading-snug">{sprText}</p>
        </div>

        {/* Break-even */}
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Break-even equity</p>
          {breakEven !== null ? (
            <>
              <p className={`text-xl font-bold font-mono ${equity >= breakEven ? 'text-green-400' : 'text-red-400'}`}>
                {(breakEven * 100).toFixed(1)}%
              </p>
              <p className={`text-xs mt-1 ${equity >= breakEven ? 'text-green-600' : 'text-red-600'}`}>
                Your equity {equityPct}% — {equity >= breakEven ? 'above' : 'below'}
              </p>
            </>
          ) : (
            <p className="text-gray-600 text-sm mt-2">Enter a bet size</p>
          )}
        </div>

        {/* Call EV */}
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Call EV</p>
          {callEV !== null ? (
            <>
              <p className={`text-xl font-bold font-mono ${callEV >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {callEV >= 0 ? '+' : ''}{callEV.toFixed(1)}
              </p>
              <p className={`text-xs mt-1 ${callEV >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {callEV >= 0 ? 'Calling is profitable' : 'Fold has better EV'}
              </p>
            </>
          ) : (
            <p className="text-gray-600 text-sm mt-2">Enter a bet size</p>
          )}
        </div>

        {/* All-in EV */}
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">All-in EV (shove)</p>
          {allinEV !== null ? (
            <>
              <p className={`text-xl font-bold font-mono ${allinEV >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {allinEV >= 0 ? '+' : ''}{allinEV.toFixed(1)}
              </p>
              <p className={`text-xs mt-1 ${allinEV >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {allinEV >= 0 ? 'Shoving is profitable' : 'Avoid the shove'}
              </p>
            </>
          ) : (
            <p className="text-gray-600 text-sm mt-2">Enter a stack size</p>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type ActiveSlot = { type: 'hero'; pos: 0 | 1 } | { type: 'board'; pos: number } | null

export function HandVsRange() {
  const [heroCards, setHeroCards]   = useState<(Card | null)[]>([null, null])
  const [board, setBoard]           = useState<(Card | null)[]>(Array(5).fill(null))
  const [range, setRange]           = useState<Set<string>>(new Set())
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>({ type: 'hero', pos: 0 })
  const [result, setResult]         = useState<{ hero: number; opp: number } | null>(null)
  const [running, setRunning]       = useState(false)
  const [iterations, setIterations] = useState(50_000)
  const [gameType, setGameType]     = useState<GameType>('6max')
  const [sliderPct, setSliderPct]     = useState(0)
  const [activePreset, setActivePreset] = useState<Position | null>(null)
  const [notation, setNotation]       = useState('')
  const [notationError, setNotationError] = useState(false)

  // Stack size analysis
  const [stackOpen, setStackOpen] = useState(false)
  const [pot,       setPot]       = useState('100')
  const [effStack,  setEffStack]  = useState('200')
  const [betSize,   setBetSize]   = useState('100')

  const usedKeys = new Set<number>([
    ...heroCards.filter(Boolean).map(c => cardId(c!)),
    ...board.filter(Boolean).map(c => cardId(c!)),
  ])

  function pickCard(card: Card) {
    if (!activeSlot) return
    setResult(null)
    if (activeSlot.type === 'hero') {
      const next = heroCards.map((c, i) => i === activeSlot.pos ? card : c)
      setHeroCards(next)
      setActiveSlot(activeSlot.pos === 0 ? { type: 'hero', pos: 1 } : null)
    } else {
      const next = board.map((c, i) => i === activeSlot.pos ? card : c)
      setBoard(next)
      const nextEmpty = next.findIndex((c, i) => !c && i !== activeSlot.pos)
      setActiveSlot(nextEmpty >= 0 ? { type: 'board', pos: nextEmpty } : null)
    }
  }

  function handleHeroClick(pos: 0 | 1) {
    if (heroCards[pos]) {
      setHeroCards(heroCards.map((c, i) => i === pos ? null : c))
      setActiveSlot({ type: 'hero', pos })
      setResult(null)
    } else {
      setActiveSlot({ type: 'hero', pos })
    }
  }

  function handleBoardClick(pos: number) {
    if (board[pos]) {
      setBoard(board.map((c, i) => i === pos ? null : c))
      setActiveSlot({ type: 'board', pos })
      setResult(null)
    } else {
      setActiveSlot({ type: 'board', pos })
    }
  }

  function toggleHand(hand: string) {
    const next = new Set(range)
    if (next.has(hand)) next.delete(hand)
    else next.add(hand)
    setRange(next)
    setActivePreset(null)
    setResult(null)
  }

  function applyNotation() {
    const parsed = parseRangeNotation(notation)
    if (parsed.size === 0) { setNotationError(true); return }
    setNotationError(false)
    setRange(parsed)
    setSliderPct(0)
    setActivePreset(null)
    setResult(null)
  }

  function applyStrengthRange(pct: number) {
    setSliderPct(pct)
    setActivePreset(null)
    const count = Math.round((pct / 100) * HANDS_BY_STRENGTH.length)
    setRange(new Set(HANDS_BY_STRENGTH.slice(0, count)))
    setResult(null)
  }

  function loadPreset(pos: Position) {
    setRange(new Set(getRange(gameType, pos)))
    setActivePreset(pos)
    setSliderPct(0)
    setResult(null)
  }

  function calculate() {
    const hero = heroCards.filter(Boolean) as Card[]
    if (hero.length !== 2 || range.size === 0) return
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      const res = runEquityVsRange(hero, [...range], board.filter(Boolean) as Card[], iterations)
      setResult(res)
      setRunning(false)
    }, 10)
  }

  function clear() {
    setHeroCards([null, null])
    setBoard(Array(5).fill(null))
    setRange(new Set())
    setResult(null)
    setSliderPct(0)
    setActivePreset(null)
    setActiveSlot({ type: 'hero', pos: 0 })
  }

  const heroComplete = heroCards.every(Boolean)
  const positions = getPositions(gameType).filter(p => p !== 'BB')
  const rangePct = Math.round((range.size / 169) * 100)

  return (
    <div className="py-4 sm:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="px-4 sm:px-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">Hand vs Range</h2>
          <p className="text-gray-500 text-sm">Your equity against an opponent's range</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Simulations</p>
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

      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left column: hero + board + actions + results */}
        <div className="px-4 sm:px-0 w-full xl:w-72 xl:shrink-0 space-y-4">

          {/* Hero hand */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Your Hand</p>
            <div className="flex gap-3 justify-center">
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
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Board (optional)</p>
            <div className="flex gap-2 justify-center">
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
          <div className="flex gap-2">
            <button
              onClick={calculate}
              disabled={!heroComplete || range.size === 0 || running}
              className="flex-1 py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors"
            >
              {running ? 'Calculating…' : 'Calculate'}
            </button>
            <button
              onClick={clear}
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 rounded-xl transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
              {[
                { label: 'Your equity', val: result.hero, color: 'text-blue-400', bar: 'bg-blue-500' },
                { label: 'Range equity', val: result.opp,  color: 'text-orange-400', bar: 'bg-orange-500' },
              ].map(({ label, val, color, bar }) => (
                <div key={label}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className={`text-sm font-medium ${color}`}>{label}</span>
                    <span className={`text-3xl font-bold ${color}`}>{(val * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div className={`${bar} h-3 rounded-full transition-all`} style={{ width: `${val * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stack size analysis */}
          {result && (
            <>
              <button
                onClick={() => setStackOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"
              >
                <span className="text-sm font-medium text-gray-300">Stack Size Analysis</span>
                <span className="text-xs text-gray-500">{stackOpen ? 'Hide ▴' : 'Show ▾'}</span>
              </button>
              {stackOpen && (
                <StackSizePanel
                  equity={result.hero}
                  pot={pot}       setPot={setPot}
                  effStack={effStack} setEffStack={setEffStack}
                  betSize={betSize}   setBetSize={setBetSize}
                />
              )}
            </>
          )}
        </div>

        {/* Right column: range builder */}
        <div className="flex-1">
          <div className="bg-gray-900 sm:rounded-xl sm:border border-gray-800 py-4 sm:p-5">

            {/* Range header */}
            <div className="px-4 sm:px-0 flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-200">Opponent's Range</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-mono">
                  {range.size} hands
                  {range.size > 0 && <span className="text-gray-600"> ({rangePct}%)</span>}
                </span>
                {range.size > 0 && (
                  <button
                    onClick={() => { setRange(new Set()); setResult(null); setSliderPct(0); setActivePreset(null) }}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Game type + position presets */}
            <div className="px-4 sm:px-0 flex flex-wrap gap-2 mb-5">
              {(['6max', 'fullring'] as GameType[]).map(g => (
                <button
                  key={g}
                  onClick={() => { setGameType(g); setActivePreset(null) }}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    gameType === g ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}
                >
                  {GAME_LABELS[g]}
                </button>
              ))}
              <div className="w-px bg-gray-700" />
              {positions.map(pos => (
                <button
                  key={pos}
                  onClick={() => loadPreset(pos)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    activePreset === pos
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-green-900/50 hover:text-green-300'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            {/* Notation input */}
            <div className="px-4 sm:px-0 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Range notation</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={notation}
                  onChange={(e) => { setNotation(e.target.value); setNotationError(false) }}
                  onKeyDown={(e) => e.key === 'Enter' && applyNotation()}
                  placeholder="e.g. JJ+, AQs+, KQo, T9s"
                  className={`flex-1 bg-gray-800 border rounded-lg px-3 py-2 text-gray-100 text-sm font-mono focus:outline-none ${
                    notationError ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                  }`}
                />
                <button
                  onClick={applyNotation}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors"
                >
                  Apply
                </button>
              </div>
              {notationError && (
                <p className="text-xs text-red-400 mt-1">No valid hands found — check your notation.</p>
              )}
            </div>

            {/* Strength slider */}
            <div className="px-4 sm:px-0 mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Top hands by strength</p>
                <span className="text-xs font-mono text-green-400">{sliderPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPct}
                onChange={(e) => applyStrengthRange(+e.target.value)}
                className="w-full accent-green-500"
              />
            </div>

            {/* Hand matrix — full bleed on mobile */}
            <HandMatrix
              highlighted={range as Set<string>}
              onCellClick={toggleHand}
            />

            <p className="px-4 sm:px-0 text-xs text-gray-600 mt-3">
              Click any hand to add/remove it. Use position buttons to load a preset range.
            </p>
          </div>
        </div>
      </div>

      {/* Full-width card picker */}
      {activeSlot && (
        <CardPicker usedKeys={usedKeys} onPick={pickCard} activeSlot={activeSlot} />
      )}
    </div>
  )
}
