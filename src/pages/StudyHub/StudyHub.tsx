const CONCEPTS = [
  {
    title: 'Ranges, Not Hands',
    content:
      'Think in ranges — the full distribution of hands your opponent could hold — not specific cards. Your decisions should be correct against their entire range, not one particular hand.',
  },
  {
    title: 'GTO vs Exploitative Play',
    content:
      'GTO (Game Theory Optimal) play is unexploitable and makes you profitable against any opponent. Exploitative play deviates from GTO to maximise EV against specific player tendencies. Pros use GTO as a baseline and adjust exploitatively vs weaker players.',
  },
  {
    title: 'Position is Power',
    content:
      'Acting last gives you more information. The BTN is the most profitable seat in the long run. Tighten your range from early position (UTG) and widen it in late position (BTN, CO).',
  },
  {
    title: 'Pot Odds & Equity',
    content:
      'If your equity exceeds the pot odds, calling is profitable. E.g. facing a 1/3 pot bet requires only 25% equity to break even. Your equity is your probability of winning the hand at showdown.',
  },
  {
    title: 'Bankroll Management',
    content:
      'For cash games, keep 20–30 buy-ins for your current stakes. Never shot-take with less than 20 buy-ins. Move down if you drop to 15 buy-ins. This protects you through natural variance.',
  },
  {
    title: 'The Rule of 2 & 4',
    content:
      'Estimate your equity quickly: multiply your outs by 4 on the flop (two cards to come) or by 2 on the turn (one card to come). A flush draw (9 outs) has ~36% equity on the flop.',
  },
  {
    title: 'Stack-to-Pot Ratio (SPR)',
    content:
      'SPR = effective stack ÷ pot. Low SPR (1–4): commit with top pair. High SPR (10+): speculative hands and draws gain value as you can win big relative pots when you hit.',
  },
  {
    title: 'C-Betting (Continuation Betting)',
    content:
      'When you were the pre-flop aggressor, bet the flop to represent your range\'s strong hands. GTO c-bet frequencies vary by board texture — bet frequently on boards that favour your range (e.g. A-high when you opened UTG).',
  },
  {
    title: 'Hand Combos',
    content:
      'Pocket pairs have 6 combos (e.g. AA: A♠A♥, A♠A♦, A♠A♣, A♥A♦, A♥A♣, A♦A♣). Suited hands have 4 combos. Offsuit hands have 12 combos. This matters for hand reading — AA is rarer than AKo.',
  },
  {
    title: 'Three-betting',
    content:
      'A 3-bet is a re-raise before the flop. Your 3-bet range should include value hands (AA, KK, QQ, AK) and some bluffs (hands with good blockers like A2s–A5s). This makes your range balanced and harder to play against.',
  },
]

export function StudyHub() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-100 mb-1">Study Hub</h2>
      <p className="text-gray-500 text-sm mb-6">Core concepts every serious player must understand</p>

      <div className="space-y-3">
        {CONCEPTS.map(({ title, content }) => (
          <details
            key={title}
            className="bg-gray-900 border border-gray-800 rounded-xl group"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none">
              <span className="font-medium text-gray-100">{title}</span>
              <span className="text-gray-600 group-open:rotate-180 transition-transform text-lg">▾</span>
            </summary>
            <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-gray-800 pt-3">
              {content}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-gray-100 mb-3">Bankroll Guidelines</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 uppercase pb-2">Stakes</th>
                <th className="text-left text-xs text-gray-500 uppercase pb-2">Min bankroll (20 BI)</th>
                <th className="text-left text-xs text-gray-500 uppercase pb-2">Comfortable (30 BI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {[
                { stakes: 'NL2', bi: 2 },
                { stakes: 'NL5', bi: 5 },
                { stakes: 'NL10', bi: 10 },
                { stakes: 'NL25', bi: 25 },
                { stakes: 'NL50', bi: 50 },
                { stakes: 'NL100', bi: 100 },
                { stakes: 'NL200', bi: 200 },
              ].map(({ stakes, bi }) => (
                <tr key={stakes}>
                  <td className="py-2 text-gray-300 font-mono">{stakes}</td>
                  <td className="py-2 text-gray-400">${(bi * 20).toLocaleString()}</td>
                  <td className="py-2 text-gray-400">${(bi * 30).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
