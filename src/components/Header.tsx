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
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-6 z-30">
      <h1 className="text-white font-semibold text-lg">{PAGE_LABELS[page]}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-dim hover:text-white bg-surface-2 hover:bg-border transition-colors border border-border"
        >
          <Upload size={14} />
          Import
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-dim hover:text-white bg-surface-2 hover:bg-border transition-colors border border-border"
        >
          <Download size={14} />
          Export
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-dim hover:text-white bg-surface-2 hover:bg-border transition-colors border border-border">
          <FileText size={14} />
          Report
        </button>
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-dim hover:text-white bg-surface-2 hover:bg-border transition-colors border border-border"
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          onClick={onAddTrade}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors"
        >
          <Plus size={15} />
          Add Trade
        </button>
      </div>
    </header>
  )
}
