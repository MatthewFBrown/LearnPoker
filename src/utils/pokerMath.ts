/**
 * Pure poker math utility functions
 */

/** Equity needed to call = call / (pot + call) */
export function potOddsEquity(pot: number, call: number): number {
  if (pot + call === 0) return 0
  return call / (pot + call)
}

/** Pot odds ratio as a string, e.g. "3.5:1" */
export function potOddsRatio(pot: number, call: number): string {
  if (call === 0) return '∞'
  return `${(pot / call).toFixed(1)}:1`
}

/** Equity from outs using rule of 2 & 4 */
export function outsToEquity(outs: number, street: 'flop' | 'turn'): number {
  return outs * (street === 'flop' ? 4 : 2) / 100
}

/** EV of calling: equity × pot_if_win - (1 - equity) × call */
export function evCall(equityFraction: number, potIfWin: number, call: number): number {
  return equityFraction * potIfWin - (1 - equityFraction) * call
}

/** Stack-to-pot ratio */
export function spr(effectiveStack: number, pot: number): number {
  if (pot === 0) return Infinity
  return effectiveStack / pot
}

/** SPR interpretation */
export function sprLabel(ratio: number): string {
  if (ratio <= 1) return 'Very low — commit with any made hand'
  if (ratio <= 4) return 'Low — made hands play well, sets/two pair happy'
  if (ratio <= 10) return 'Medium — strong draws and top pair+ are strong'
  return 'High — drawing hands and speculative hands gain value'
}

/**
 * Implied odds: how much you need to win on future streets
 * to make a call profitable despite not having direct odds.
 *
 * Required future winnings = call - equity × (pot + call)
 * If result is negative, the call already has direct odds.
 */
export function impliedOddsNeeded(
  equityFraction: number,
  pot: number,
  call: number
): number {
  const ev = evCall(equityFraction, pot, call)
  if (ev >= 0) return 0 // already profitable directly
  return Math.abs(ev) / equityFraction
}
