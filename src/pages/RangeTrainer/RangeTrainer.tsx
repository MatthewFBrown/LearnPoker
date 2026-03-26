import { useState } from 'react'
import { HandMatrix } from '../../components/poker/HandMatrix'
import { PlayingCard, parseHandCards } from '../../components/poker/PlayingCard'
import { getRange, getPositions, ALL_COMBOS } from '../../data/ranges'
import { useProgressStore } from '../../store/progressStore'
import type { Position, GameType, Action } from '../../types/poker'

type Mode = 'view' | 'quiz'

const GAME_LABELS: Record<GameType, string> = {
  '6max': '6-Max',
  fullring: 'Full Ring',
}

export function RangeTrainer() {
  const [mode, setMode] = useState<Mode>('view')
  const [gameType, setGameType] = useState<GameType>('6max')
  const [position, setPosition] = useState<Position>('BTN')

  // Quiz state
  const [quizHand, setQuizHand] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<null | { correct: boolean; answer: string }>(null)
  const [streak, setStreak] = useState(0)

  const { addResult, getStats } = useProgressStore()
  const stats = getStats(position, gameType)
  const positions = getPositions(gameType)
  const range = getRange(gameType, position)

  function startQuiz() {
    setMode('quiz')
    pickNewHand()
    setFeedback(null)
  }

  function pickNewHand() {
    const hand = ALL_COMBOS[Math.floor(Math.random() * ALL_COMBOS.length)]
    setQuizHand(hand)
    setFeedback(null)
  }

  function handleAction(action: Action) {
    if (!quizHand || feedback) return
    const inRange = range.has(quizHand)
    const correctAction: Action = inRange ? 'open' : 'fold'
    const correct = action === correctAction

    addResult({
      hand: quizHand,
      position,
      gameType,
      userAction: action,
      correctAction,
      correct,
      timestamp: Date.now(),
    })

    setFeedback({
      correct,
      answer: inRange
        ? `${quizHand} is in your ${position} opening range — Open!`
        : `${quizHand} is NOT in your ${position} opening range — Fold.`,
    })

    setStreak((s) => (correct ? s + 1 : 0))
  }

  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null

  return (
    <div className="sm:p-6 max-w-5xl mx-auto">

      {/* Padded header section */}
      <div className="px-4 pt-4 sm:px-0 sm:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Opening Range Trainer</h2>
            <p className="text-gray-500 text-sm mt-1">
              Learn which hands to open from each position
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('view')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'view'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-100'
              }`}
            >
              View Range
            </button>
            <button
              onClick={startQuiz}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'quiz'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-100'
              }`}
            >
              Quiz Mode
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Game type */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Game</p>
            <div className="flex gap-1">
              {(['6max', 'fullring'] as GameType[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGameType(g)
                    setPosition(getPositions(g)[0])
                  }}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    gameType === g
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}
                >
                  {GAME_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Position</p>
            <div className="flex flex-wrap gap-1">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                    position === pos
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3 mb-5 text-sm">
          <div className="bg-gray-900 rounded-lg px-4 py-2">
            <span className="text-gray-500">Range size: </span>
            <span className="text-green-400 font-medium">{range.size} hands</span>
            <span className="text-gray-600"> ({Math.round((range.size / 169) * 100)}%)</span>
          </div>
          {accuracy !== null && (
            <>
              <div className="bg-gray-900 rounded-lg px-4 py-2">
                <span className="text-gray-500">Accuracy: </span>
                <span className={`font-medium ${accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {accuracy}%
                </span>
                <span className="text-gray-600"> ({stats.correct}/{stats.total})</span>
              </div>
              {streak > 2 && (
                <div className="bg-gray-900 rounded-lg px-4 py-2">
                  <span className="text-yellow-400 font-medium">{streak} streak</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Matrix + panel — matrix is full-bleed on mobile */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Matrix */}
        <div>
          <HandMatrix
            highlighted={mode === 'view' || (feedback && !feedback.correct) ? range : undefined}
            activeHand={mode === 'quiz' ? quizHand : null}
          />
          <div className="px-4 sm:px-0 flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" /> In range
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> Quiz hand
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gray-700 inline-block" /> Pair
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gray-800 inline-block" /> Suited
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gray-900 border border-gray-700 inline-block" /> Offsuit
            </span>
          </div>
        </div>

        {/* Quiz panel */}
        {mode === 'quiz' && quizHand && (
          <div className="px-4 sm:px-0 w-full xl:flex-1 xl:max-w-sm">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Position: <span className="text-gray-100 font-mono font-bold">{position}</span></p>
              <p className="text-gray-400 text-sm mb-5">Game: <span className="text-gray-100">{GAME_LABELS[gameType]}</span></p>

              <div className="flex justify-center gap-3 mb-6">
                {parseHandCards(quizHand).map((card, i) => (
                  <PlayingCard key={i} rank={card.rank} suit={card.suit} />
                ))}
              </div>

              {!feedback ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction('open')}
                    className="py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleAction('fold')}
                    className="py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Fold
                  </button>
                </div>
              ) : (
                <div>
                  <div className={`rounded-lg p-4 mb-4 ${feedback.correct ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
                    <p className={`font-medium mb-1 ${feedback.correct ? 'text-green-300' : 'text-red-300'}`}>
                      {feedback.correct ? 'Correct!' : 'Wrong'}
                    </p>
                    <p className="text-sm text-gray-300">{feedback.answer}</p>
                  </div>
                  <button
                    onClick={pickNewHand}
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Next hand →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View mode info panel */}
        {mode === 'view' && (
          <div className="px-4 sm:px-0 w-full xl:flex-1 xl:max-w-sm">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold text-gray-100 mb-3">{position} Range — {GAME_LABELS[gameType]}</h3>
              <p className="text-sm text-gray-400 mb-4">
                From {position}, you open-raise <strong className="text-green-400">{range.size} hand combos</strong> ({Math.round((range.size / 169) * 100)}% of hands).
              </p>
              <p className="text-xs text-gray-500">
                Green cells = open raise. All other cells = fold (facing no prior action).
                Switch to Quiz Mode to test yourself.
              </p>
              {range.size === 0 && (
                <p className="text-sm text-yellow-400 mt-3">
                  The BB posts a blind and does not have an opening range — they close the action preflop.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
