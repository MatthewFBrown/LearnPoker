// rank: 0=2, 1=3, ..., 8=T, 9=J, 10=Q, 11=K, 12=A
// suit: 0=♠, 1=♥, 2=♦, 3=♣
export type Card = { rank: number; suit: number }

export const RANK_CHARS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'] as const
export const SUIT_CHARS = ['s','h','d','c'] as const

export function cardId(c: Card): number { return c.rank * 4 + c.suit }

export function makeDeck(): Card[] {
  const deck: Card[] = []
  for (let r = 0; r < 13; r++)
    for (let s = 0; s < 4; s++)
      deck.push({ rank: r, suit: s })
  return deck
}

// ── Hand evaluation ───────────────────────────────────────────────────────────

// Score encoding: category * 13^5 + tiebreaker ranks in base 13
// Categories: 8=str.flush 7=quads 6=fullhouse 5=flush 4=straight 3=trips 2=twopair 1=pair 0=highcard
const BASE = 371293 // 13^5

function encodeRanks(rs: number[]): number {
  return rs.reduce((acc, r) => acc * 13 + r, 0)
}

function evaluate5(cards: Card[]): number {
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a)
  const suits = cards.map(c => c.suit)

  const isFlush = suits.every(s => s === suits[0])

  let isStraight = new Set(ranks).size === 5 && ranks[0] - ranks[4] === 4
  let straightHigh = ranks[0]

  // Wheel: A-2-3-4-5
  if (ranks[0] === 12 && ranks[1] === 3 && ranks[2] === 2 && ranks[3] === 1 && ranks[4] === 0) {
    isStraight = true
    straightHigh = 3
  }

  if (isFlush && isStraight) return 8 * BASE + straightHigh

  const freq: Record<number, number> = {}
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1
  const groups = Object.entries(freq)
    .map(([r, c]) => ({ r: +r, c }))
    .sort((a, b) => b.c - a.c || b.r - a.r)
  const [c0, c1] = groups.map(g => g.c)
  const gr = groups.map(g => g.r)

  if (c0 === 4) return 7 * BASE + encodeRanks([gr[0], gr[1]])
  if (c0 === 3 && c1 === 2) return 6 * BASE + encodeRanks([gr[0], gr[1]])
  if (isFlush) return 5 * BASE + encodeRanks(ranks)
  if (isStraight) return 4 * BASE + straightHigh
  if (c0 === 3) return 3 * BASE + encodeRanks([gr[0], gr[1], gr[2]])
  if (c0 === 2 && c1 === 2) return 2 * BASE + encodeRanks([gr[0], gr[1], gr[2]])
  if (c0 === 2) return BASE + encodeRanks([gr[0], gr[1], gr[2], gr[3]])
  return encodeRanks(ranks)
}

/** Best 5-card hand score from 7 cards (all C(7,5)=21 combos) */
export function bestOf7(hole: Card[], board: Card[]): number {
  const all = [...hole, ...board]
  let best = 0
  for (let a = 0; a <= 2; a++)
  for (let b = a+1; b <= 3; b++)
  for (let c = b+1; c <= 4; c++)
  for (let d = c+1; d <= 5; d++)
  for (let e = d+1; e <= 6; e++) {
    const s = evaluate5([all[a], all[b], all[c], all[d], all[e]])
    if (s > best) best = s
  }
  return best
}

// ── Monte Carlo equity simulation ─────────────────────────────────────────────

export interface EquityResult {
  win: number    // 0–1
  tie: number    // 0–1
  equity: number // win + tie/2
}

export function runEquity(
  hands: Card[][],
  board: Card[],
  iterations = 50000,
): EquityResult[] {
  const n = hands.length
  const wins = new Array<number>(n).fill(0)
  const ties = new Array<number>(n).fill(0)

  const usedKeys = new Set([...hands.flat(), ...board].map(cardId))
  const deck = makeDeck().filter(c => !usedKeys.has(cardId(c)))
  const needed = 5 - board.length

  for (let i = 0; i < iterations; i++) {
    // Partial Fisher-Yates shuffle to sample `needed` cards
    for (let j = 0; j < needed; j++) {
      const k = j + Math.floor(Math.random() * (deck.length - j))
      const tmp = deck[j]; deck[j] = deck[k]; deck[k] = tmp
    }
    const runBoard = [...board, ...deck.slice(0, needed)]
    const scores = hands.map(h => bestOf7(h, runBoard))
    const best = Math.max(...scores)
    const nWin = scores.filter(s => s === best).length

    for (let j = 0; j < n; j++) {
      if (scores[j] === best) {
        if (nWin === 1) wins[j]++
        else ties[j]++
      }
    }
  }

  return wins.map((w, i) => ({
    win:    w / iterations,
    tie:    ties[i] / iterations,
    equity: (w + ties[i] * 0.5) / iterations,
  }))
}

// ── Hand vs Range ─────────────────────────────────────────────────────────────

/** Expand a canonical combo string (e.g. "AKs", "QQ", "T9o") into all specific card pairs */
export function expandCombo(combo: string): [Card, Card][] {
  const pairs: [Card, Card][] = []
  const isPair   = combo.length === 2
  const isSuited = combo.endsWith('s')
  const r1 = RANK_CHARS.indexOf(combo[0] as typeof RANK_CHARS[number])
  const r2 = isPair ? r1 : RANK_CHARS.indexOf(combo[1] as typeof RANK_CHARS[number])

  if (isPair) {
    for (let s1 = 0; s1 < 4; s1++)
      for (let s2 = s1 + 1; s2 < 4; s2++)
        pairs.push([{ rank: r1, suit: s1 }, { rank: r2, suit: s2 }])
  } else if (isSuited) {
    for (let s = 0; s < 4; s++)
      pairs.push([{ rank: r1, suit: s }, { rank: r2, suit: s }])
  } else {
    for (let s1 = 0; s1 < 4; s1++)
      for (let s2 = 0; s2 < 4; s2++)
        if (s1 !== s2)
          pairs.push([{ rank: r1, suit: s1 }, { rank: r2, suit: s2 }])
  }
  return pairs
}

export interface RangeEquityResult {
  hero: number  // 0–1
  opp:  number  // 0–1
}

/** Monte Carlo equity: hero hand vs a range of combos */
export function runEquityVsRange(
  hero: Card[],
  range: string[],
  board: Card[],
  iterations = 50000,
): RangeEquityResult {
  const heroKeys  = new Set(hero.map(cardId))
  const boardKeys = new Set(board.map(cardId))
  const usedKeys  = new Set([...heroKeys, ...boardKeys])

  // Expand range to valid specific combos (excluding hero/board cards)
  const validCombos: [Card, Card][] = range.flatMap(h =>
    expandCombo(h).filter(([c1, c2]) =>
      !usedKeys.has(cardId(c1)) && !usedKeys.has(cardId(c2))
    )
  )
  if (!validCombos.length) return { hero: 0, opp: 0 }

  const needed = 5 - board.length
  let heroWins = 0, heroTies = 0

  for (let i = 0; i < iterations; i++) {
    const [oc1, oc2] = validCombos[Math.floor(Math.random() * validCombos.length)]
    const oppKeys = new Set([cardId(oc1), cardId(oc2)])
    const deck = makeDeck().filter(c => !usedKeys.has(cardId(c)) && !oppKeys.has(cardId(c)))

    for (let j = 0; j < needed; j++) {
      const k = j + Math.floor(Math.random() * (deck.length - j))
      const tmp = deck[j]; deck[j] = deck[k]; deck[k] = tmp
    }
    const fullBoard = [...board, ...deck.slice(0, needed)]
    const hs = bestOf7(hero, fullBoard)
    const os = bestOf7([oc1, oc2], fullBoard)

    if (hs > os) heroWins++
    else if (hs === os) heroTies++
  }

  const heroEq = (heroWins + heroTies * 0.5) / iterations
  return { hero: heroEq, opp: 1 - heroEq }
}

// ── Range vs Range ────────────────────────────────────────────────────────────

/** Monte Carlo equity: two full ranges against each other */
export function runRangeVsRange(
  range1: string[],
  range2: string[],
  board: Card[],
  iterations = 50000,
): RangeEquityResult {
  const boardKeys = new Set(board.map(cardId))

  const combos1 = range1.flatMap(h =>
    expandCombo(h).filter(([c1, c2]) => !boardKeys.has(cardId(c1)) && !boardKeys.has(cardId(c2)))
  )
  const combos2 = range2.flatMap(h =>
    expandCombo(h).filter(([c1, c2]) => !boardKeys.has(cardId(c1)) && !boardKeys.has(cardId(c2)))
  )

  if (!combos1.length || !combos2.length) return { hero: 0, opp: 0 }

  const needed = 5 - board.length
  let wins1 = 0, ties = 0, total = 0

  for (let i = 0; i < iterations; i++) {
    const [c1a, c1b] = combos1[Math.floor(Math.random() * combos1.length)]
    const r1Keys = new Set([cardId(c1a), cardId(c1b)])

    const avail2 = combos2.filter(([c, d]) => !r1Keys.has(cardId(c)) && !r1Keys.has(cardId(d)))
    if (!avail2.length) continue

    const [c2a, c2b] = avail2[Math.floor(Math.random() * avail2.length)]
    const r2Keys = new Set([cardId(c2a), cardId(c2b)])

    const deck = makeDeck().filter(c =>
      !boardKeys.has(cardId(c)) && !r1Keys.has(cardId(c)) && !r2Keys.has(cardId(c))
    )
    for (let j = 0; j < needed; j++) {
      const k = j + Math.floor(Math.random() * (deck.length - j))
      const tmp = deck[j]; deck[j] = deck[k]; deck[k] = tmp
    }
    const fullBoard = [...board, ...deck.slice(0, needed)]
    const s1 = bestOf7([c1a, c1b], fullBoard)
    const s2 = bestOf7([c2a, c2b], fullBoard)

    if (s1 > s2) wins1++
    else if (s1 === s2) ties++
    total++
  }

  if (total === 0) return { hero: 0, opp: 0 }
  const eq1 = (wins1 + ties * 0.5) / total
  return { hero: eq1, opp: 1 - eq1 }
}
