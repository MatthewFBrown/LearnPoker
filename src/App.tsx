import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutGrid, Calculator, BarChart2, BookOpen, Percent, Swords, Target, Scale } from 'lucide-react'
import { Sidebar } from './components/layout/Sidebar'
import { RangeTrainer } from './pages/RangeTrainer/RangeTrainer'
import { MathTools } from './pages/MathTools/MathTools'
import { SessionTracker } from './pages/SessionTracker/SessionTracker'
import { StudyHub } from './pages/StudyHub/StudyHub'
import { EquityCalc } from './pages/EquityCalc/EquityCalc'
import { HandVsRange } from './pages/HandVsRange/HandVsRange'
import { EquityByPosition } from './pages/EquityByPosition/EquityByPosition'
import { RangeVsRange } from './pages/RangeVsRange/RangeVsRange'

const NAV_LINKS = [
  { to: '/',          label: 'Ranges',   icon: LayoutGrid },
  { to: '/equity',    label: 'Equity',   icon: Percent    },
  { to: '/vs-range',  label: 'Vs Range', icon: Swords     },
  { to: '/pos-equity',label: 'By Pos',   icon: Target     },
  { to: '/rvr',       label: 'RvR',      icon: Scale      },
  { to: '/math',      label: 'Math',     icon: Calculator },
  { to: '/sessions',  label: 'Sessions', icon: BarChart2  },
  { to: '/study',     label: 'Study',    icon: BookOpen   },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-950 pb-16 md:pb-0">
          <Routes>
            <Route path="/"         element={<RangeTrainer />} />
            <Route path="/math"     element={<MathTools />} />
            <Route path="/sessions" element={<SessionTracker />} />
            <Route path="/study"    element={<StudyHub />} />
            <Route path="/equity"   element={<EquityCalc />} />
            <Route path="/vs-range"  element={<HandVsRange />} />
            <Route path="/pos-equity" element={<EquityByPosition />} />
            <Route path="/rvr"        element={<RangeVsRange />} />
          </Routes>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900 border-t border-gray-800 flex z-50">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                isActive ? 'text-green-400' : 'text-gray-500'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </BrowserRouter>
  )
}
