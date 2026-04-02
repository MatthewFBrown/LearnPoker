import { useState } from 'react'

type Category = 'All' | 'WSOP' | 'High Stakes' | 'Online'

interface FamousHand {
  id: number
  title: string
  event: string
  year: number
  category: Exclude<Category, 'All'>
  hero: { name: string; cards: string[] }
  villain: { name: string; cards: string[] }
  board: { flop: string[]; turn: string; river: string }
  action: string
  analysis: string
  lesson: string
  heroWins: boolean
}

const HANDS: FamousHand[] = [
  {
    id: 1,
    title: "The Brunson — 10-2 Strikes Again",
    event: "WSOP Main Event — Final Hand",
    year: 1977,
    category: "WSOP",
    hero:    { name: "Doyle Brunson", cards: ["T♠", "2♠"] },
    villain: { name: "Jesse Alto",   cards: ["A♥", "J♣"] },
    board: { flop: ["A♦", "J♠", "T♣"], turn: "2♦", river: "T♥" },
    action:
      "Alto flopped top two pair (aces and jacks) and was a massive favourite. Brunson called down with middle pair and a backdoor flush draw. The turn gave Brunson two pair — still behind — and all the chips went in. The river Ten gave Brunson a full house and the title.",
    analysis:
      "This was the second consecutive year Brunson won the WSOP Main Event holding 10-2. In 1976 he did the exact same thing against Louie Natwar. The hand became so legendary that 10-2 is now officially called 'The Brunson' in poker. After the river Brunson told the story himself: 'I couldn't believe it happened twice.' Alto was a 92% favourite on the flop.",
    lesson:
      "Never tap the table until the river is dealt. Even the biggest favourite can be rivered. Alto's two pair — a monster flop — became worthless against a full house.",
    heroWins: true,
  },
  {
    id: 2,
    title: "Moneymaker's Bluff Heard Round the World",
    event: "WSOP Main Event — 3-Handed",
    year: 2003,
    category: "WSOP",
    hero:    { name: "Chris Moneymaker", cards: ["5♥", "4♦"] },
    villain: { name: "Sammy Farha",      cards: ["K♠", "J♦"] },
    board: { flop: ["J♥", "8♠", "3♦"], turn: "8♣", river: "A♥" },
    action:
      "Farha flopped top pair with kings and jacks. Moneymaker had absolute air — no pair, no draw. He bet the flop, bet the turn, then shoved all in on the river for a massive overbet. Farha tanked for nearly two minutes, staring Moneymaker down, then folded face up. Moneymaker mucked and flashed the bluff.",
    analysis:
      "This single hand is credited with sparking the global poker boom. Moneymaker, a $39 online satellite qualifier, bluffed a seasoned Las Vegas pro on national television and the world noticed. ESPN replayed the hand constantly. Millions thought 'I can do that' — and signed up for poker sites. Moneymaker went on to win the $2.5M first prize.",
    lesson:
      "A well-crafted bluff tells a story. Moneymaker's river shove represented a made hand (the ace completing a possible straight or two pair). Farha couldn't call because the bluff was credible. Fold equity beats showdown equity.",
    heroWins: true,
  },
  {
    id: 3,
    title: "Stu Ungar's Last Miracle",
    event: "WSOP Main Event — Final Table",
    year: 1997,
    category: "WSOP",
    hero:    { name: "Stu Ungar",   cards: ["A♠", "4♦"] },
    villain: { name: "Ron Stanley", cards: ["A♣", "8♥"] },
    board: { flop: ["A♦", "K♣", "3♠"], turn: "5♥", river: "2♦" },
    action:
      "Both players flopped top pair (aces) with Ungar holding the weaker kicker. Stanley's A-8 was a clear favourite. On the turn, Ungar picked up a gutshot straight draw. The river 2 completed the wheel (A-2-3-4-5) — a straight — giving Ungar the winning hand and his third WSOP title.",
    analysis:
      "Stu Ungar is the only player to win three WSOP Main Event titles (1980, 1981, 1997). He returned in 1997 after years battling drug addiction, gaunt and barely recognised. He dominated the field and won. He passed away the following year at age 45. Many who saw him play consider him the greatest natural card player who ever lived.",
    lesson:
      "Never give up while you have outs. Ungar turned a dominated kicker situation (A-4 vs A-8) into a winning hand by catching runner-runner to make the wheel. Desperation draws sometimes get there.",
    heroWins: true,
  },
  {
    id: 4,
    title: "Johnny Chan's Slow Play Trap",
    event: "WSOP Main Event — Final Hand",
    year: 1988,
    category: "WSOP",
    hero:    { name: "Johnny Chan",  cards: ["J♥", "9♠"] },
    villain: { name: "Erik Seidel", cards: ["Q♦", "7♣"] },
    board: { flop: ["8♠", "6♦", "T♥"], turn: "5♦", river: "2♠" },
    action:
      "Chan flopped an open-ended straight draw (7 or J to complete). Seidel flopped middle pair. Chan slow-played, just calling on the flop. The turn completed Chan's straight with the 5. Seidel, unaware of the made straight, bet and was trapped. Chan called again, then moved all in on the river. Seidel called — too late.",
    analysis:
      "This hand was featured in the movie Rounders ('Johnny Chan… and this is the hand that won him his second straight championship'). Chan was back-to-back WSOP champion in 1987 and 1988. The hand is a textbook example of slow-playing a flopped draw, then trapping on the river when the nuts are made.",
    lesson:
      "Slow-playing is most powerful when you have a hidden draw that completes to the nuts. Chan's 'weakness' on the flop and turn gave Seidel every reason to believe his pair was good.",
    heroWins: true,
  },
  {
    id: 5,
    title: "Phil Ivey Folds the Near-Nuts",
    event: "WSOP Main Event — Day 7",
    year: 2009,
    category: "WSOP",
    hero:    { name: "Phil Ivey",      cards: ["A♦", "K♦"] },
    villain: { name: "Jeff Shulman",   cards: ["A♠", "A♣"] },
    board: { flop: ["K♥", "Q♦", "J♦"], turn: "9♦", river: "4♠" },
    action:
      "Ivey flopped top pair (kings) with the nut flush draw. A monster. By the river he still had top pair and a missed flush draw. Shulman, who held pocket aces, had moved in on the turn. Ivey tanked for minutes, counting down the pot, before folding top pair kings. Shulman's aces were ahead the whole way.",
    analysis:
      "Phil Ivey reached the 2009 WSOP Main Event final table — widely regarded as the greatest performance ever at that event. His ability to fold strong hands when he determines he's beat is a signature trait. 'Anyone can fold junk. Only great players can fold good hands.' Ivey went on to reach the final nine.",
    lesson:
      "Top pair on a scary board is not always the best hand. Ivey read Shulman for aces or a set and made a disciplined fold with a strong holding. Hand reading > raw hand strength.",
    heroWins: false,
  },
  {
    id: 6,
    title: "Negreanu Calls the Exact Hand",
    event: "High Stakes Poker — Season 2",
    year: 2007,
    category: "High Stakes",
    hero:    { name: "Daniel Negreanu", cards: ["6♣", "5♣"] },
    villain: { name: "Gus Hansen",      cards: ["K♠", "9♦"] },
    board: { flop: ["7♦", "5♠", "5♥"], turn: "K♦", river: "6♦" },
    action:
      "Negreanu flopped trips (three fives). Hansen flopped nothing. The turn gave Hansen top pair kings. He started betting. Negreanu, watching Hansen closely, called the turn and said out loud 'I think you have king-nine.' He called the river and was right — his full house (fives full of sixes) easily beat Hansen's top pair.",
    analysis:
      "Negreanu is famous for his live reads — publicly announcing an opponent's hole cards in real time, often correctly. He's done it dozens of times on television. The reads come from a combination of physical tells, betting patterns, and deep range analysis. His warmth and table talk often cause opponents to give away information unconsciously.",
    lesson:
      "Hand reading is a skill. Negreanu used Hansen's bet sizing, body language, and likely range to narrow his hand to king-nine. The actual cards were almost secondary — the read came first.",
    heroWins: true,
  },
  {
    id: 7,
    title: "Dwan's $1.1 Million Monster Pot",
    event: "High Stakes Poker — Season 5",
    year: 2009,
    category: "High Stakes",
    hero:    { name: 'Tom "durrrr" Dwan', cards: ["7♥", "4♠"] },
    villain: { name: "Patrik Antonius",   cards: ["6♠", "5♠"] },
    board: { flop: ["7♦", "6♦", "3♣"], turn: "4♦", river: "K♣" },
    action:
      "Dwan flopped top pair. Antonius flopped second pair with an open-ended straight draw and flush draw. The turn gave Dwan two pair (sevens and fours) while giving Antonius top pair with his straight and flush draws very much alive. Both players moved massive amounts of money in. Dwan's two pair held up on a blank river.",
    analysis:
      "Tom Dwan (durrrr) was the most feared online player in the world from 2007–2010. His High Stakes Poker appearances turned him into a TV star. The 'durrrr challenge' — where he offered any high-stakes player $1.5M in side bets to play 50,000 hands of heads-up poker — was one of the most audacious props bets in poker history.",
    lesson:
      "Two pair vs a combo draw is often a coin flip or close to it. Antonius had massive equity (straight draw + flush draw = 15+ outs). These spots are often 'coolers' where both players play correctly and one just wins.",
    heroWins: true,
  },
  {
    id: 8,
    title: "Vanessa Selbst — Missed Draw Bluff",
    event: "PokerStars Caribbean Adventure",
    year: 2013,
    category: "High Stakes",
    hero:    { name: "Vanessa Selbst",    cards: ["6♦", "5♦"] },
    villain: { name: "Daniel Negreanu",   cards: ["K♠", "J♥"] },
    board: { flop: ["K♦", "7♦", "4♣"], turn: "3♠", river: "Q♣" },
    action:
      "Selbst flopped a flush draw with a gutshot (two ways to win on the draw). When the turn and river both bricked, she fired a large bluff on the river representing a made hand. Negreanu tanked with top pair kings, top kicker and eventually folded. Selbst scooped the pot.",
    analysis:
      "Vanessa Selbst is the highest-earning female poker player in live tournament history with over $11.8M in cashes. A Yale Law School graduate, she brought systematic, analytical play to the felt before GTO solvers became mainstream. She was the first person to win three PokerStars Player of the Year titles.",
    lesson:
      "Semi-bluffing gives you two ways to win: hit your draw OR fold out better hands. When the draw misses, firing a 'missed draw bluff' on the river can still succeed if your story is believable across all three streets.",
    heroWins: true,
  },
  {
    id: 9,
    title: "Isildur1 Shocks the Poker World",
    event: "PokerStars — Online NL Hold'em ($500/$1,000)",
    year: 2009,
    category: "Online",
    hero:    { name: 'Viktor "Isildur1" Blom', cards: ["A♠", "K♥"] },
    villain: { name: "Brian Townsend",          cards: ["A♦", "Q♣"] },
    board: { flop: ["K♣", "Q♦", "J♠"], turn: "T♠", river: "2♦" },
    action:
      "Both players flopped strong top-pair hands on a coordinated board. Townsend flopped two pair (queens and jacks). Blom flopped top pair kings. The turn completed a Broadway straight (A-K-Q-J-T) on the board — both players split the straight. A rare chopped pot in a monster hand.",
    analysis:
      "Viktor Blom, a Swedish teenager playing anonymously as 'Isildur1', appeared from nowhere in late 2009 and won and lost millions in days against the best players in the world. He beat Tom Dwan, Patrik Antonius, and Phil Ivey in massive sessions before losing it all back. His relentless aggression and fearlessness made him the most electrifying online player of his generation.",
    lesson:
      "On paired or coordinated boards, your made hand can be counterfeited. Both players had strong top pairs but the board ran out to a broadway straight, forcing a chop. Always be aware of how the board texture can devalue your hand.",
    heroWins: true,
  },
  {
    id: 10,
    title: "Phil Hellmuth's Aces Get Cracked — Epic Tilt",
    event: "WSOP — Televised Final Table",
    year: 2008,
    category: "WSOP",
    hero:    { name: "Phil Hellmuth", cards: ["A♣", "A♦"] },
    villain: { name: "Tuan Lam",      cards: ["9♠", "9♥"] },
    board: { flop: ["9♣", "6♠", "2♦"], turn: "K♥", river: "4♣" },
    action:
      "Hellmuth moved in pre-flop with pocket aces — the best starting hand in hold'em. Lam called off his stack with nines. The flop immediately gave Lam a set of nines, making Hellmuth an 8% underdog. No ace came. Hellmuth was eliminated and proceeded to berate the table for minutes.",
    analysis:
      "Phil Hellmuth holds the record for most WSOP bracelets (17 as of 2023) and is one of the greatest tournament players in history. But his televised meltdowns when losing with aces are equally legendary. He's famous for the line 'if it wasn't for luck, I'd win every time.' His emotional reactions — as infuriating as they are — have made him one of poker's biggest personalities for 35 years.",
    lesson:
      "Pocket aces win ~80% of the time heads up, but not 100%. Against a set flopped by an underpair, aces are a massive underdog. Variance is real. Emotional control separates the pros — losing aces is not bad play, it's poker.",
    heroWins: false,
  },
]

function isRed(card: string) {
  return card.endsWith('♥') || card.endsWith('♦')
}

function CardChip({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-12 rounded-lg text-xs font-bold border-2 select-none
        ${isRed(label)
          ? 'bg-white text-red-600 border-red-200'
          : 'bg-white text-gray-900 border-gray-300'}`}
    >
      {label}
    </span>
  )
}

function HandRow({ name, cards, winner }: { name: string; cards: string[]; winner: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {cards.map((c) => <CardChip key={c} label={c} />)}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-200">{name}</p>
        {winner && <p className="text-xs text-green-400 font-medium">Winner</p>}
      </div>
    </div>
  )
}

const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, string> = {
  WSOP:         'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  'High Stakes': 'bg-purple-900/50 text-purple-400 border-purple-800',
  Online:       'bg-blue-900/50 text-blue-400 border-blue-800',
}

function HandCard({ hand }: { hand: FamousHand }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${CATEGORY_COLORS[hand.category]}`}>
            {hand.category}
          </span>
          <span className="text-xs text-gray-500">{hand.event}</span>
          <span className="text-xs text-gray-600 ml-auto">{hand.year}</span>
        </div>
        <h3 className="font-semibold text-gray-100 text-base leading-snug">{hand.title}</h3>
      </div>

      {/* Players */}
      <div className="px-5 pb-4 flex flex-col gap-3 border-t border-gray-800 pt-4">
        <HandRow name={hand.hero.name}    cards={hand.hero.cards}    winner={hand.heroWins}  />
        <HandRow name={hand.villain.name} cards={hand.villain.cards} winner={!hand.heroWins} />
      </div>

      {/* Board */}
      <div className="px-5 pb-4 border-t border-gray-800 pt-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Board</p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {hand.board.flop.map((c) => <CardChip key={c} label={c} />)}
          </div>
          <span className="text-gray-700 text-xs">flop</span>
          <CardChip label={hand.board.turn} />
          <span className="text-gray-700 text-xs">turn</span>
          <CardChip label={hand.board.river} />
          <span className="text-gray-700 text-xs">river</span>
        </div>
      </div>

      {/* Action */}
      <div className="px-5 pb-4 border-t border-gray-800 pt-4">
        <p className="text-sm text-gray-300 leading-relaxed">{hand.action}</p>
      </div>

      {/* Expandable analysis */}
      <div className="border-t border-gray-800">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span>Analysis &amp; Context</span>
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {open && (
          <div className="px-5 pb-5 space-y-4">
            <p className="text-sm text-gray-400 leading-relaxed">{hand.analysis}</p>
            <div className="bg-green-950/40 border border-green-900 rounded-lg px-4 py-3">
              <p className="text-xs text-green-500 font-semibold uppercase tracking-wide mb-1">Key Lesson</p>
              <p className="text-sm text-green-300 leading-relaxed">{hand.lesson}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CATEGORIES: Category[] = ['All', 'WSOP', 'High Stakes', 'Online']

export function StudyHub() {
  const [filter, setFilter] = useState<Category>('All')

  const visible = filter === 'All' ? HANDS : HANDS.filter((h) => h.category === filter)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Famous Hands</h2>
        <p className="text-gray-500 text-sm mt-1">
          Real hands from WSOP, High Stakes Poker, and online — with analysis and lessons
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-green-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-100'
            }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 text-xs opacity-60">
                {HANDS.filter((h) => h.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((hand) => (
          <HandCard key={hand.id} hand={hand} />
        ))}
      </div>
    </div>
  )
}
