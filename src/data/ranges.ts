import type { HandCombo, GameType, Position } from '../types/poker'

// All 169 canonical hand combos in matrix order
// Pairs on diagonal, suited above, offsuit below
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

export function getHandCombo(row: number, col: number): HandCombo {
  const r1 = RANKS[row]
  const r2 = RANKS[col]
  if (row === col) return `${r1}${r2}` // pair
  if (row < col) return `${r1}${r2}s`  // suited (higher rank first)
  return `${r2}${r1}o`                  // offsuit (higher rank first)
}

// Build all 169 combos
export const ALL_COMBOS: HandCombo[] = []
for (let r = 0; r < 13; r++) {
  for (let c = 0; c < 13; c++) {
    ALL_COMBOS.push(getHandCombo(r, c))
  }
}

// ─── 6-max 100BB opening ranges (raise first in, approximate GTO) ────────────

const BTN_6MAX: HandCombo[] = [
  // All pairs
  'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
  // Ax suited
  'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
  // Ax offsuit
  'AKo','AQo','AJo','ATo',
  // Kx suited
  'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s',
  // Kx offsuit
  'KQo','KJo','KTo',
  // Qx suited
  'QJs','QTs','Q9s','Q8s',
  // Qx offsuit
  'QJo','QTo',
  // Jx suited
  'JTs','J9s','J8s',
  // Jx offsuit
  'JTo',
  // Tx suited
  'T9s','T8s',
  // 9x suited
  '98s','97s',
  // 8x suited
  '87s','86s',
  // 7x suited
  '76s','75s',
  // 6x suited
  '65s','64s',
  // 5x suited
  '54s','53s',
]

const CO_6MAX: HandCombo[] = [
  // All pairs
  'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
  // Ax suited
  'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
  // Ax offsuit
  'AKo','AQo','AJo','ATo',
  // Kx suited
  'KQs','KJs','KTs','K9s','K8s',
  // Kx offsuit
  'KQo','KJo',
  // Qx suited
  'QJs','QTs','Q9s',
  // Qx offsuit
  'QJo',
  // Jx suited
  'JTs','J9s',
  // Tx suited
  'T9s','T8s',
  // 9x suited
  '98s','97s',
  // 8x suited
  '87s',
  // 7x suited
  '76s',
  // 6x suited
  '65s',
  // 5x suited
  '54s',
]

const HJ_6MAX: HandCombo[] = [
  // All pairs
  'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
  // Ax suited
  'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A5s','A4s',
  // Ax offsuit
  'AKo','AQo','AJo',
  // Kx suited
  'KQs','KJs','KTs','K9s',
  // Kx offsuit
  'KQo',
  // Qx suited
  'QJs','QTs','Q9s',
  // Jx suited
  'JTs','J9s',
  // Tx suited
  'T9s',
  // 9x suited
  '98s',
  // 8x suited
  '87s',
  // 7x suited
  '76s',
  // 6x suited
  '65s',
  // 5x suited
  '54s',
]

const UTG_6MAX: HandCombo[] = [
  // Pairs 22+
  'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
  // Ax suited
  'AKs','AQs','AJs','ATs','A9s','A5s','A4s',
  // Ax offsuit
  'AKo','AQo',
  // Kx suited
  'KQs','KJs','KTs',
  // Kx offsuit
  'KQo',
  // Qx suited
  'QJs','QTs',
  // Jx suited
  'JTs',
  // Tx suited
  'T9s',
  // 9x suited
  '98s',
  // 8x suited
  '87s',
  // 7x suited
  '76s',
  // 6x suited
  '65s',
  // 5x suited
  '54s',
]

// SB vs BB (facing no open): similar to CO range but slightly tighter
const SB_6MAX: HandCombo[] = [
  'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
  'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
  'AKo','AQo','AJo','ATo','A9o',
  'KQs','KJs','KTs','K9s','K8s','K7s',
  'KQo','KJo','KTo',
  'QJs','QTs','Q9s','Q8s',
  'QJo',
  'JTs','J9s','J8s',
  'T9s','T8s',
  '98s','97s',
  '87s','86s',
  '76s','75s',
  '65s','64s',
  '54s',
]

// ─── Full Ring (9-max) opening ranges ────────────────────────────────────────
// Tighter UTG ranges for full ring

const UTG_FR: HandCombo[] = [
  'AA','KK','QQ','JJ','TT','99','88','77',
  'AKs','AQs','AJs','ATs',
  'AKo','AQo',
  'KQs','KJs',
  'QJs',
  'JTs',
]

const UTG1_FR: HandCombo[] = [
  'AA','KK','QQ','JJ','TT','99','88','77','66',
  'AKs','AQs','AJs','ATs','A9s',
  'AKo','AQo','AJo',
  'KQs','KJs','KTs',
  'QJs','QTs',
  'JTs',
  'T9s',
]

const UTG2_FR: HandCombo[] = [
  'AA','KK','QQ','JJ','TT','99','88','77','66','55',
  'AKs','AQs','AJs','ATs','A9s','A8s','A5s',
  'AKo','AQo','AJo',
  'KQs','KJs','KTs',
  'KQo',
  'QJs','QTs',
  'JTs',
  'T9s',
  '98s',
]

const LJ_FR: HandCombo[] = [
  ...UTG2_FR,
  '44','33','22',
  'A7s','A6s','A4s','A3s','A2s',
  'K9s',
  'Q9s',
  'J9s',
  '87s',
]

// CO, HJ, BTN, SB for full ring ~ same as 6-max equivalents
// ─────────────────────────────────────────────────────────────────────────────

type RangeKey = `${GameType}_${Position}`

const RANGES: Record<string, HandCombo[]> = {
  '6max_BTN': BTN_6MAX,
  '6max_CO':  CO_6MAX,
  '6max_HJ':  HJ_6MAX,
  '6max_UTG': UTG_6MAX,
  '6max_SB':  SB_6MAX,
  '6max_BB':  [],  // BB doesn't open (posts blind, no RFI range)

  'fullring_BTN': BTN_6MAX,
  'fullring_CO':  CO_6MAX,
  'fullring_HJ':  HJ_6MAX,
  'fullring_LJ':  LJ_FR,
  'fullring_UTG2': UTG2_FR,
  'fullring_UTG1': UTG1_FR,
  'fullring_UTG': UTG_FR,
  'fullring_SB':  SB_6MAX,
  'fullring_BB':  [],
}

// ── Hand strength ordering (equity vs random, strongest → weakest) ────────────

function handScore(hand: HandCombo): number {
  const V: Record<string, number> = {
    A: 12, K: 11, Q: 10, J: 9, T: 8, '9': 7, '8': 6, '7': 5, '6': 4, '5': 3, '4': 2, '3': 1, '2': 0,
  }
  const isPair   = hand.length === 2
  const isSuited = hand.endsWith('s')
  const r1   = V[hand[0]]
  const r2   = isPair ? r1 : V[hand[1]]
  const high = Math.max(r1, r2)
  const low  = Math.min(r1, r2)
  const gap  = high - low
  if (isPair) return 200 + high * 10
  const conn = gap === 1 ? 15 : gap === 2 ? 8 : gap === 3 ? 2 : gap === 4 ? -5 : -15
  return high * 12 + low * 8 + conn + (isSuited ? 20 : 0)
}

/** All 169 combos sorted strongest → weakest (for the range-strength slider). */
export const HANDS_BY_STRENGTH: HandCombo[] = [...ALL_COMBOS].sort(
  (a, b) => handScore(b) - handScore(a),
)

// ── Range notation parser ─────────────────────────────────────────────────────
// Supports: JJ+, AKs, AQs+, A2s+, KQo, KQo+, AK (both), 98s, T8s+, etc.

const RANK_STR = 'AKQJT98765432'

/**
 * Parse standard poker range notation (comma/space separated tokens) into a
 * set of canonical hand combos.
 *
 * Rules for `+`:
 *  - Pairs  (XX+):  all pairs from XX up to AA
 *  - Others (XYz+): fix the high card, increase the low card up to one below
 *                   the high card (e.g. AQs+ → AQs, AKs; K9s+ → K9s…KQs)
 */
export function parseRangeNotation(notation: string): Set<HandCombo> {
  const result = new Set<HandCombo>()

  for (const raw of notation.split(/[,\s]+/)) {
    const token = raw.trim().toUpperCase()
    if (!token) continue

    const hasPlus = token.endsWith('+')
    const t = hasPlus ? token.slice(0, -1) : token

    // ── Pairs: "AA", "JJ+", "22" ──────────────────────────────────────────
    if (t.length === 2 && t[0] === t[1]) {
      const ri = RANK_STR.indexOf(t[0])
      if (ri === -1) continue
      if (hasPlus) {
        for (let i = 0; i <= ri; i++) result.add((RANK_STR[i] + RANK_STR[i]) as HandCombo)
      } else {
        result.add(t as HandCombo)
      }
      continue
    }

    // ── Non-pairs: "AKs", "AKo", "AK" (both), "AQs+" ─────────────────────
    let r1Char: string, r2Char: string, suffix: string
    if (t.length === 3 && (t[2] === 'S' || t[2] === 'O')) {
      r1Char = t[0]; r2Char = t[1]; suffix = t[2].toLowerCase()
    } else if (t.length === 2) {
      r1Char = t[0]; r2Char = t[1]; suffix = ''   // both suited + offsuit
    } else {
      continue
    }

    const i1 = RANK_STR.indexOf(r1Char)
    const i2 = RANK_STR.indexOf(r2Char)
    if (i1 === -1 || i2 === -1 || i1 === i2) continue

    // Normalise: hiI = index of the higher-rank card (smaller index = stronger)
    const hiI = Math.min(i1, i2)
    const loI = Math.max(i1, i2)
    const hi  = RANK_STR[hiI]

    const addCombo = (secondI: number) => {
      const base = hi + RANK_STR[secondI]
      if (suffix === 's' || suffix === '') result.add((base + 's') as HandCombo)
      if (suffix === 'o' || suffix === '') result.add((base + 'o') as HandCombo)
    }

    if (hasPlus) {
      // Increase the low card from its current rank up to hiI+1 (one below hi)
      for (let i = loI; i >= hiI + 1; i--) addCombo(i)
    } else {
      addCombo(loI)
    }
  }

  return result
}

export function getRange(gameType: GameType, position: Position): Set<HandCombo> {
  const key: RangeKey = `${gameType}_${position}`
  return new Set(RANGES[key] ?? [])
}

export const POSITIONS_6MAX: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']
export const POSITIONS_FR: Position[] = ['UTG', 'UTG1', 'UTG2', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']

export function getPositions(gameType: GameType): Position[] {
  return gameType === '6max' ? POSITIONS_6MAX : POSITIONS_FR
}
