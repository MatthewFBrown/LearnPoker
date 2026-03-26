import { useState } from 'react'
import {
  potOddsEquity,
  potOddsRatio,
  outsToEquity,
  evCall,
  spr,
  sprLabel,
  impliedOddsNeeded,
} from '../../utils/pokerMath'

type Tool = 'potodds' | 'outs' | 'ev' | 'spr' | 'implied'

const TOOLS: { id: Tool; label: string; emoji: string }[] = [
  { id: 'potodds', label: 'Pot Odds',      emoji: '⚖️' },
  { id: 'outs',    label: 'Outs & Equity', emoji: '🃏' },
  { id: 'ev',      label: 'EV Calculator', emoji: '💰' },
  { id: 'spr',     label: 'SPR',           emoji: '📐' },
  { id: 'implied', label: 'Implied Odds',  emoji: '🎯' },
]

function NumInput({ label, value, onChange, min = 0 }: {
  label: string; value: string; onChange: (v: string) => void; min?: number
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 mt-4">
      {children}
    </div>
  )
}

function Explanation({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 mt-3 leading-relaxed">{children}</p>
}

// ── Individual tool panels ────────────────────────────────────────────────────

function PotOddsTool() {
  const [pot, setPot] = useState('100')
  const [bet, setBet] = useState('33')

  const equity = potOddsEquity(+pot, +bet)
  const ratio = potOddsRatio(+pot, +bet)

  return (
    <div className="space-y-3">
      <NumInput label="Pot size ($)" value={pot} onChange={setPot} />
      <NumInput label="Opponent's bet ($)" value={bet} onChange={setBet} />
      <ResultBox>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Pot odds ratio</p>
            <p className="text-2xl font-bold text-blue-400">{ratio}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Equity needed to call</p>
            <p className="text-2xl font-bold text-green-400">{(equity * 100).toFixed(1)}%</p>
          </div>
        </div>
      </ResultBox>
      <Explanation>
        You must call ${bet} into a pot of ${+pot + +bet}. You need at least{' '}
        <strong className="text-green-300">{(equity * 100).toFixed(1)}% equity</strong> to break even.
        If your equity is higher, calling is profitable.
      </Explanation>
    </div>
  )
}

const COMMON_DRAWS = [
  { label: 'Flush draw', outs: 9 },
  { label: 'Open-ended straight draw (OESD)', outs: 8 },
  { label: 'Two overcards', outs: 6 },
  { label: 'Gutshot straight draw', outs: 4 },
  { label: 'Set to full house (on flop)', outs: 7 },
  { label: 'Flush + OESD combo', outs: 15 },
]

function OutsTool() {
  const [outs, setOuts] = useState('9')
  const flopEq = outsToEquity(+outs, 'flop')
  const turnEq = outsToEquity(+outs, 'turn')

  return (
    <div className="space-y-3">
      <NumInput label="Number of outs" value={outs} onChange={setOuts} min={1} />
      <ResultBox>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Flop equity (×4)</p>
            <p className="text-2xl font-bold text-green-400">~{(flopEq * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Turn equity (×2)</p>
            <p className="text-2xl font-bold text-blue-400">~{(turnEq * 100).toFixed(0)}%</p>
          </div>
        </div>
      </ResultBox>
      <Explanation>
        <strong>Rule of 4 &amp; 2:</strong> On the flop (two cards to come) multiply outs by 4. On the
        turn (one card to come) multiply by 2. These are quick approximations — exact equity varies.
      </Explanation>

      <div className="mt-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Common draws</p>
        <div className="space-y-1">
          {COMMON_DRAWS.map(({ label, outs: o }) => (
            <button
              key={label}
              onClick={() => setOuts(String(o))}
              className="w-full text-left flex justify-between items-center px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
            >
              <span className="text-gray-300">{label}</span>
              <span className="text-gray-500 font-mono">{o} outs</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function EvTool() {
  const [equityPct, setEquityPct] = useState('35')
  const [pot, setPot] = useState('100')
  const [call, setCall] = useState('33')

  const eq = +equityPct / 100
  const ev = evCall(eq, +pot + +call, +call)

  return (
    <div className="space-y-3">
      <NumInput label="Your equity (%)" value={equityPct} onChange={setEquityPct} />
      <NumInput label="Current pot ($)" value={pot} onChange={setPot} />
      <NumInput label="Amount to call ($)" value={call} onChange={setCall} />
      <ResultBox>
        <p className="text-xs text-gray-500 mb-1">Expected Value of calling</p>
        <p className={`text-3xl font-bold ${ev >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {ev >= 0 ? '+' : ''}{ev.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {ev >= 0 ? 'Calling is profitable' : 'Folding is better (without implied odds)'}
        </p>
      </ResultBox>
      <Explanation>
        EV = (equity × total pot) − ((1 − equity) × call).
        A positive EV means the call makes money on average.
      </Explanation>
    </div>
  )
}

function SprTool() {
  const [stack, setStack] = useState('200')
  const [pot, setPot] = useState('20')

  const ratio = spr(+stack, +pot)
  const label = sprLabel(ratio)

  return (
    <div className="space-y-3">
      <NumInput label="Effective stack ($)" value={stack} onChange={setStack} />
      <NumInput label="Pot size ($)" value={pot} onChange={setPot} />
      <ResultBox>
        <p className="text-xs text-gray-500 mb-1">SPR</p>
        <p className="text-3xl font-bold text-purple-400">{ratio === Infinity ? '∞' : ratio.toFixed(1)}</p>
        <p className="text-sm text-gray-300 mt-2">{label}</p>
      </ResultBox>
      <Explanation>
        SPR = effective stack ÷ pot. Low SPR favours strong made hands (top pair+).
        High SPR favours drawing hands and speculative holdings that can win big pots.
      </Explanation>
    </div>
  )
}

function ImpliedOddsTool() {
  const [equityPct, setEquityPct] = useState('20')
  const [pot, setPot] = useState('80')
  const [call, setCall] = useState('30')

  const eq = +equityPct / 100
  const needed = impliedOddsNeeded(eq, +pot, +call)
  const hasDirectOdds = needed === 0

  return (
    <div className="space-y-3">
      <NumInput label="Your equity (%)" value={equityPct} onChange={setEquityPct} />
      <NumInput label="Current pot ($)" value={pot} onChange={setPot} />
      <NumInput label="Amount to call ($)" value={call} onChange={setCall} />
      <ResultBox>
        {hasDirectOdds ? (
          <p className="text-green-400 font-medium">
            You already have direct pot odds — call without needing implied odds!
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-1">Additional winnings needed on future streets</p>
            <p className="text-3xl font-bold text-yellow-400">${needed.toFixed(2)}</p>
          </>
        )}
      </ResultBox>
      <Explanation>
        Implied odds account for money you expect to win on future streets if you hit your hand.
        If you can realistically win {!hasDirectOdds && <strong className="text-yellow-300">${needed.toFixed(0)}+</strong>} when you
        complete your draw, the call becomes profitable.
      </Explanation>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function MathTools() {
  const [active, setActive] = useState<Tool>('potodds')

  const panel: Record<Tool, React.ReactNode> = {
    potodds: <PotOddsTool />,
    outs:    <OutsTool />,
    ev:      <EvTool />,
    spr:     <SprTool />,
    implied: <ImpliedOddsTool />,
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-100 mb-1">Poker Math Tools</h2>
      <p className="text-gray-500 text-sm mb-6">Master the numbers that drive every decision</p>

      {/* Tool selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TOOLS.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === id
                ? 'bg-green-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-100'
            }`}
          >
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="font-semibold text-gray-100 mb-4">
          {TOOLS.find((t) => t.id === active)?.emoji}{' '}
          {TOOLS.find((t) => t.id === active)?.label}
        </h3>
        {panel[active]}
      </div>
    </div>
  )
}
