import {
  LayoutDashboard, Calendar, BarChart2, TrendingUp, PieChart,
  Play, ClipboardList, BookOpen, Wallet, LogOut, ChevronRight
} from 'lucide-react'

type Page =
  | 'dashboard' | 'calendar' | 'trades' | 'analytics'
  | 'portfolio' | 'replay' | 'review' | 'journal' | 'accounts'

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={15} /> },
  { id: 'calendar',  label: 'Calendar',   icon: <Calendar size={15} /> },
  { id: 'trades',    label: 'Trades',     icon: <BarChart2 size={15} /> },
  { id: 'analytics', label: 'Analytics',  icon: <TrendingUp size={15} /> },
  { id: 'portfolio', label: 'Portfolio',  icon: <PieChart size={15} /> },
  { id: 'replay',    label: 'Replay',     icon: <Play size={15} /> },
  { id: 'review',    label: 'Review',     icon: <ClipboardList size={15} /> },
  { id: 'journal',   label: 'Journal',    icon: <BookOpen size={15} /> },
  { id: 'accounts',  label: 'Accounts',   icon: <Wallet size={15} /> },
]

interface Props {
  current: Page
  onNavigate: (page: Page) => void
  user?: { name: string; email: string }
}

export default function Sidebar({ current, onNavigate, user }: Props) {
  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-40"
      style={{
        background: 'linear-gradient(180deg, #0f1621 0%, #080c12 100%)',
        borderRight: '1px solid rgba(37,46,62,0.8)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-[15px]" style={{ borderBottom: '1px solid rgba(37,46,62,0.6)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 0 12px rgba(34,197,94,0.3)',
          }}
        >
          <span className="text-black font-black text-[10px] tracking-wider">TWI</span>
        </div>
        <div className="flex flex-col">
          <span className="text-text-bright font-bold text-[13px] tracking-widest leading-none">TRADE</span>
          <span className="text-text-muted text-[10px] tracking-[0.2em] mt-0.5">JOURNAL</span>
        </div>
        <span
          className="ml-auto text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-md"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          BETA
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto">
        <p className="text-text-muted text-[9px] font-bold tracking-[0.15em] px-2 mb-3 uppercase">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = current === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                    active ? 'nav-active-glow' : 'hover:bg-surface-2'
                  }`}
                  style={active ? {
                    background: 'rgba(34,197,94,0.1)',
                    color: '#22c55e',
                  } : { color: '#6b7588' }}
                >
                  <span
                    className={`flex-shrink-0 transition-colors ${active ? 'text-accent' : 'group-hover:text-text-dim'}`}
                    style={!active ? { color: '#4d5566' } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className={active ? 'text-accent' : 'group-hover:text-text-bright transition-colors'}>
                    {item.label}
                  </span>
                  {active && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }}
                    />
                  )}
                  {item.badge && !active && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-3 text-text-muted">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-2.5" style={{ borderTop: '1px solid rgba(37,46,62,0.6)' }}>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(22,29,43,0.8)', border: '1px solid rgba(37,46,62,0.5)' }}
        >
          <p className="text-text-muted text-[9px] font-bold tracking-[0.15em] mb-2.5 uppercase">Signed In</p>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold uppercase flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.08))', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              {user?.name?.[0] || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-bright text-[13px] font-semibold truncate leading-none mb-0.5">
                {user?.name || 'Trader'}
              </p>
              <p className="text-text-muted text-[11px] truncate">{user?.email || 'trader@example.com'}</p>
            </div>
            <button
              className="p-1.5 rounded-lg text-text-muted hover:text-text-bright transition-colors flex-shrink-0"
              style={{ background: 'transparent' }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export type { Page }
