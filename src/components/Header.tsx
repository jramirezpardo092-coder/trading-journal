import { Upload, Download, FileText, Sun, Moon, Plus } from 'lucide-react'
import { Page } from './Sidebar'

interface Props {
  page: Page
  darkMode: boolean
  onToggleTheme: () => void
  onAddTrade: () => void
  onImport: () => void
  onExport: () => void
}

const PAGE_LABELS: Record<Page, string> = {
  dashboard: 'Dashboard',
  calendar:  'Calendar',
  trades:    'Trades',
  analytics: 'Analytics',
  portfolio: 'Portfolio',
  replay:    'Replay',
  review:    'Review',
  journal:   'Journal',
  accounts:  'Accounts',
}

export default function Header({ page, darkMode, onToggleTheme, onAddTrade, onImport, onExport }: Props) {
  const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-dim hover:text-text-bright transition-colors'

  return (
    <header
      className="fixed top-0 left-60 right-0 h-14 flex items-center justify-between px-6 z-30"
      style={{
        background: 'rgba(8,12,18,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(37,46,62,0.6)',
      }}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-text-bright font-bold text-[17px] tracking-tight">{PAGE_LABELS[page]}</h1>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1"
          style={{ background: 'rgba(34,197,94,0.08)', color: '#4d5566', border: '1px solid rgba(37,46,62,0.5)' }}
        >
          Live
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onImport}
          className={btnCls}
          style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
        >
          <Upload size={13} />
          Import
        </button>
        <button
          onClick={onExport}
          className={btnCls}
          style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
        >
          <Download size={13} />
          Export
        </button>
        <button
          className={btnCls}
          style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
        >
          <FileText size={13} />
          Report
        </button>
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-bright transition-colors"
          style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button
          onClick={onAddTrade}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 0 12px rgba(34,197,94,0.25)',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Trade
        </button>
      </div>
    </header>
  )
}
