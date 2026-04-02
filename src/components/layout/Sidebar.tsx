import { NavLink } from 'react-router-dom'
import { LayoutGrid, Calculator, BarChart2, BookOpen, Percent, Swords, Target, Scale } from 'lucide-react'

const links = [
  { to: '/',          label: 'Range Trainer',      icon: LayoutGrid },
  { to: '/equity',    label: 'Equity Calc',         icon: Percent    },
  { to: '/vs-range',  label: 'Hand vs Range',       icon: Swords     },
  { to: '/pos-equity',label: 'Equity by Position',  icon: Target     },
  { to: '/rvr',       label: 'Range vs Range',      icon: Scale      },
  { to: '/math',      label: 'Poker Math',          icon: Calculator },
  { to: '/sessions',  label: 'Session Log',         icon: BarChart2  },
  { to: '/study',     label: 'Study Hub',           icon: BookOpen   },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-800">
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-xl font-bold text-green-400">LearnPoker</h1>
        <p className="text-xs text-gray-500 mt-0.5">Road to Pro</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-green-900/50 text-green-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
