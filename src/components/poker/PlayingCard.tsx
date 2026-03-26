type Suit = '♠' | '♥' | '♦' | '♣'

interface PlayingCardProps {
  rank: string
  suit: Suit
}

export function PlayingCard({ rank, suit }: PlayingCardProps) {
  const isRed = suit === '♥' || suit === '♦'
  const color = isRed ? 'text-red-600' : 'text-gray-900'
  const display = rank === 'T' ? '10' : rank

  return (
    <div className={`w-14 h-24 sm:w-20 sm:h-32 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col justify-between p-1.5 sm:p-2 select-none ${color}`}>
      {/* Top-left corner */}
      <div className="flex flex-col items-start leading-none">
        <span className="text-sm sm:text-lg font-bold leading-none">{display}</span>
        <span className="text-xs sm:text-sm leading-none">{suit}</span>
      </div>
      {/* Center suit */}
      <div className="flex items-center justify-center">
        <span className="text-3xl sm:text-4xl leading-none">{suit}</span>
      </div>
      {/* Bottom-right corner */}
      <div className="flex flex-col items-end leading-none">
        <span className="text-xs sm:text-sm leading-none">{suit}</span>
        <span className="text-sm sm:text-lg font-bold leading-none">{display}</span>
      </div>
    </div>
  )
}

/** Parse a hand combo string into two cards with suits assigned */
export function parseHandCards(hand: string): Array<{ rank: string; suit: Suit }> {
  const isPair   = hand.length === 2
  const isSuited = hand.endsWith('s')
  const r1 = hand[0]
  const r2 = isPair ? hand[0] : hand[1]

  if (isPair)   return [{ rank: r1, suit: '♠' }, { rank: r2, suit: '♥' }]
  if (isSuited) return [{ rank: r1, suit: '♠' }, { rank: r2, suit: '♠' }]
  return              [{ rank: r1, suit: '♠' }, { rank: r2, suit: '♥' }]
}
