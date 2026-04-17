import {
  LayoutDashboard, Calendar, BarChart2, TrendingUp, PieChart,
  Play, ClipboardList, BookOpen, FolderOpen, LogOut
} from 'lucide-react'

type Page =
  | 'dashboard' | 'calendar' | 'trades' | 'analytics'
  | 'portfolio' | 'replay' | 'review' | 'journal' | 'accounts'

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
  { id: 'calendar',  label: 'Calendar',   icon: <Calendar size={16} /> },
  { id: 'trades',    label: 'Trades',     icon: <BarChart2 size={16} /> },
  { id: 'analytics', label: 'Analytics',  icon: <TrendingUp size={16} /> },
  { id: 'portfolio', label: 'Portfolio',  icon: <PieChart size={16} /> },
  { id: 'replay',    label: 'Replay',     icon: <Play size={16} /> },
  { id: 'review',    label: 'Review',     icon: <ClipboardList size={16} /> },
  { id: 'journal',   label: 'Journal',    icon: <BookOpen size={16} /> },
  { id: 'accounts',  label: 'Accounts',   icon: <FolderOpen size={16} /> },
]

interface Props {
  current: Page
  onNavigate: (page: Page) => void
  user?: { name: string; email: string }
}

export default function Sidebar({ current, onNavigate, user }: Props) {
  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-surface flex flex-col z-40 border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-xs">TWI</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-semibold text-sm tracking-wide">TRADE</span>
          </div>
          <span className="text-text-dim text-xs tracking-widest -mt-0.5">JOURNAL</span>
        </div>
        <span className="ml-auto text-[10px] font-semibold bg-accent/20 text-accent px-1.5 py-0.5 rounded">
          BETA
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <p className="text-text-dim text-[10px] font-semibold tracking-widest px-3 mb-2 uppercase">
          Trading Journal
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = current === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-accent/15 text-accent font-medium'
                      : 'text-text-dim hover:text-white hover:bg-surface-2'
                  }`}
                >
                  <span className={active ? 'text-accent' : ''}>{item.icon}</span>
                  {item.label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="bg-surface-2 rounded-xl p-3">
          <p className="text-text-dim text-[10px] font-semibold tracking-widest mb-2 uppercase">
            Signed In
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm uppercase flex-shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-text-dim text-xs truncate">{user?.email || ''}</p>
            </div>
            <button className="text-text-dim hover:text-white p-1 rounded transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export type { Page }
