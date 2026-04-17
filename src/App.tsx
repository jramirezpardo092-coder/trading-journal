import { useState } from 'react'
import Sidebar, { Page } from './components/Sidebar'
import Header from './components/Header'
import AddTradeModal from './components/AddTradeModal'
import DashboardPage from './pages/Dashboard'
import CalendarPage from './pages/Calendar'
import TradesPage from './pages/Trades'
import AnalyticsPage from './pages/Analytics'
import PortfolioPage from './pages/Portfolio'
import ReplayPage from './pages/Replay'
import ReviewPage from './pages/Review'
import JournalPage from './pages/Journal'
import AccountsPage from './pages/Accounts'
import { useStore } from './store/useStore'
import { Trade } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('trades')
  const [darkMode, setDarkMode] = useState(true)
  const [showAddTrade, setShowAddTrade] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

  const store = useStore()

  function handleAddTrade(trade: Omit<Trade, 'id'>) {
    if (editingTrade) {
      store.updateTrade(editingTrade.id, trade)
      setEditingTrade(null)
    } else {
      store.addTrade(trade)
    }
  }

  function openEditTrade(trade: Trade) {
    setEditingTrade(trade)
    setShowAddTrade(true)
  }

  function handleCloseModal() {
    setShowAddTrade(false)
    setEditingTrade(null)
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (Array.isArray(data)) {
            data.forEach(t => store.addTrade(t))
          }
        } catch { alert('Invalid file format') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function handleExport() {
    const data = JSON.stringify(store.trades, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trades-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const user = { name: 'Trader', email: 'trader@example.com' }

  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      <Sidebar current={page} onNavigate={setPage} user={user} />
      <Header
        page={page}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onAddTrade={() => setShowAddTrade(true)}
        onImport={handleImport}
        onExport={handleExport}
      />

      <main className="ml-60 pt-14 min-h-screen">
        <div className="p-6">
          {page === 'dashboard' && (
            <DashboardPage trades={store.trades} onAddTrade={() => setPage('trades')} />
          )}
          {page === 'calendar' && (
            <CalendarPage trades={store.trades} />
          )}
          {page === 'trades' && (
            <TradesPage
              trades={store.trades}
              onAddTrade={() => setShowAddTrade(true)}
              onEditTrade={openEditTrade}
              onDeleteTrade={store.deleteTrade}
            />
          )}
          {page === 'analytics' && (
            <AnalyticsPage trades={store.trades} />
          )}
          {page === 'portfolio' && (
            <PortfolioPage
              accounts={store.accounts}
              balanceEntries={store.balanceEntries}
              onAddAccount={store.addAccount}
              onAddBalanceEntry={store.addBalanceEntry}
            />
          )}
          {page === 'replay' && (
            <ReplayPage trades={store.trades} />
          )}
          {page === 'review' && (
            <ReviewPage trades={store.trades} />
          )}
          {page === 'journal' && (
            <JournalPage
              journalEntries={store.journalEntries}
              trades={store.trades}
              onSaveEntry={store.saveJournalEntry}
            />
          )}
          {page === 'accounts' && (
            <AccountsPage
              accounts={store.accounts}
              onAddAccount={store.addAccount}
              onDeleteAccount={store.deleteAccount}
            />
          )}
        </div>
      </main>

      {(showAddTrade || editingTrade) && (
        <AddTradeModal
          onClose={handleCloseModal}
          onSave={handleAddTrade}
          templates={store.templates}
          onSaveTemplate={store.addTemplate}
          editTrade={editingTrade}
        />
      )}
    </div>
  )
}
