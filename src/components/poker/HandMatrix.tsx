import { getHandCombo } from '../../data/ranges'
import type { HandCombo } from '../../types/poker'

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

interface HandMatrixProps {
  highlighted?: Set<HandCombo>
  activeHand?: HandCombo | null
  onCellClick?: (hand: HandCombo) => void
  compact?: boolean
}

export function HandMatrix({ highlighted, activeHand, onCellClick, compact }: HandMatrixProps) {
  function cellColor(hand: HandCombo): string {
    const isActive = activeHand === hand
    const inRange = highlighted?.has(hand)

    if (isActive) return 'bg-yellow-400 text-gray-900 font-bold ring-2 ring-yellow-200'
    if (inRange) return 'bg-green-600 text-white'

    const isPair = hand.length === 2
    const isSuited = hand.endsWith('s')

    if (isPair) return 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    if (isSuited) return 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    return 'bg-gray-900 text-gray-400 hover:bg-gray-800'
  }

  // Responsive sizing:
  // compact prop  → always small (used elsewhere, e.g. overview thumbnails)
  // normal mode   → w-6 h-6 with no margin on mobile, w-9 h-9 with m-px on sm+
  const cellSize    = compact ? 'w-6 h-6 text-[8px]'        : 'w-[26px] h-[26px] sm:w-9 sm:h-9'
  const cellMargin  = compact ? 'm-px'                       : 'sm:m-px'
  const rowHdrClass = compact ? 'w-6 text-[10px]'           : 'w-[26px] text-[9px] sm:w-7 sm:text-xs'
  const colHdrClass = compact ? 'w-6'                        : 'w-[26px] sm:w-9'
  const headerMl    = compact ? 'ml-7'                       : 'ml-[26px] sm:ml-7'

  return (
    <div className="inline-block">
      {/* Column headers */}
      <div className={`flex ${headerMl}`}>
        {RANKS.map((r) => (
          <div
            key={r}
            className={`${colHdrClass} text-center text-[10px] text-gray-500 mb-0.5 font-mono`}
          >
            {r}
          </div>
        ))}
      </div>

      {RANKS.map((rowRank, row) => (
        <div key={rowRank} className="flex items-center">
          {/* Row header */}
          <div className={`${rowHdrClass} text-gray-500 font-mono text-right pr-1`}>
            {rowRank}
          </div>

          {RANKS.map((_colRank, col) => {
            const hand = getHandCombo(row, col)
            return (
              <button
                key={hand}
                title={hand}
                onClick={() => onCellClick?.(hand)}
                className={`
                  ${cellSize} ${cellMargin} ${cellColor(hand)}
                  flex items-center justify-center
                  font-mono rounded-sm
                  transition-colors cursor-pointer
                  leading-none
                `}
              >
                {/* Text: tiny on mobile, normal on sm+; hidden in compact */}
                {!compact && (
                  <span className="text-[7px] sm:text-[10px] leading-none">
                    {hand.length <= 3 ? hand : hand.slice(0, 3)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
