import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useSessionStore } from '../../store/sessionStore'
import type { Session } from '../../types/poker'
import { Trash2, PlusCircle } from 'lucide-react'

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  gameType: '6max' as Session['gameType'],
  stakes: 'NL10',
  buyIn: '',
  cashOut: '',
  hours: '',
  notes: '',
}

export function SessionTracker() {
  const { sessions, addSession, deleteSession } = useSessionStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addSession({
      date: form.date,
      gameType: form.gameType,
      stakes: form.stakes,
      buyIn: +form.buyIn,
      cashOut: +form.cashOut,
      hours: +form.hours,
      notes: form.notes,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  // Sort oldest first for the chart
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))

  // Running bankroll data for chart
  let running = 0
  const chartData = sorted.map((s) => {
    running += s.cashOut - s.buyIn
    return { date: s.date, bankroll: running, profit: s.cashOut - s.buyIn }
  })

  const totalProfit = sessions.reduce((sum, s) => sum + (s.cashOut - s.buyIn), 0)
  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0)
  const hourly = totalHours > 0 ? totalProfit / totalHours : 0
  const winSessions = sessions.filter((s) => s.cashOut > s.buyIn).length

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Session Tracker</h2>
          <p className="text-gray-500 text-sm mt-1">Track your results and manage your bankroll</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle size={16} /> Log Session
        </button>
      </div>

      {/* Add session form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Game</label>
              <select
                value={form.gameType}
                onChange={(e) => setForm({ ...form, gameType: e.target.value as Session['gameType'] })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none"
              >
                <option value="6max">6-Max</option>
                <option value="fullring">Full Ring</option>
                <option value="mtt">MTT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stakes</label>
              <input
                type="text"
                placeholder="e.g. NL10"
                value={form.stakes}
                onChange={(e) => setForm({ ...form, stakes: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Buy-in ($)</label>
            <input
              type="number" min="0" step="0.01" required
              value={form.buyIn}
              onChange={(e) => setForm({ ...form, buyIn: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Cash-out ($)</label>
            <input
              type="number" min="0" step="0.01" required
              value={form.cashOut}
              onChange={(e) => setForm({ ...form, cashOut: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hours played</label>
            <input
              type="number" min="0" step="0.5" required
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="col-span-1 sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-100">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
              Save Session
            </button>
          </div>
        </form>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-lg">No sessions logged yet.</p>
          <p className="text-sm mt-1">Click "Log Session" to record your first session.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total profit', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Hourly rate', value: `${hourly >= 0 ? '+' : ''}$${hourly.toFixed(2)}/hr`, color: hourly >= 0 ? 'text-blue-400' : 'text-red-400' },
              { label: 'Total hours', value: `${totalHours.toFixed(1)}h`, color: 'text-gray-100' },
              { label: 'Win rate', value: `${sessions.length > 0 ? Math.round((winSessions / sessions.length) * 100) : 0}%`, color: 'text-purple-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Bankroll chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <p className="text-sm font-medium text-gray-400 mb-4">Bankroll over time</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#34d399' }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Bankroll']}
                />
                <ReferenceLine y={0} stroke="#374151" />
                <Line type="monotone" dataKey="bankroll" stroke="#34d399" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Session table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Date', 'Game', 'Stakes', 'Buy-in', 'Cash-out', 'Profit', 'Hours', ''].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wide px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...sessions].reverse().map((s) => {
                  const profit = s.cashOut - s.buyIn
                  return (
                    <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-300">{s.date}</td>
                      <td className="px-4 py-3 text-gray-400">{s.gameType}</td>
                      <td className="px-4 py-3 text-gray-300 font-mono">{s.stakes}</td>
                      <td className="px-4 py-3 text-gray-400">${s.buyIn.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-400">${s.cashOut.toFixed(2)}</td>
                      <td className={`px-4 py-3 font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{s.hours}h</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteSession(s.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
