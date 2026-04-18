import { useState } from 'react'
import { Plus, X, Wallet, BarChart2, TrendingUp } from 'lucide-react'
import { Account, BalanceEntry } from '../types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  accounts: Account[]
  balanceEntries: BalanceEntry[]
  onAddAccount: (a: Omit<Account, 'id'>) => void
  onAddBalanceEntry: (e: Omit<BalanceEntry, 'id'>) => void
}

const ACCOUNT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444']
type Tab = 'tracker' | 'holdings'

const CARD = { background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }
const inputCls = 'w-full rounded-lg px-3 py-2.5 text-[13px] text-text-bright placeholder-text-muted focus:outline-none transition-colors'
const inputStyle = { background: 'rgba(22,29,43,0.8)', border: '1px solid rgba(37,46,62,0.8)' }

function NewTrackerModal({ onClose, onSave }: { onClose: () => void; onSave: (a: Omit<Account, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [broker, setBroker] = useState('')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up"
        style={{ background: '#0f1621', border: '1px solid rgba(37,46,62,0.9)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text-bright font-bold text-[16px]">New Balance Tracker</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-bright"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Account Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Account" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Broker</label>
            <input value={broker} onChange={e => setBroker(e.target.value)} placeholder="e.g. TD Ameritrade" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Starting Balance</label>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="25000.00" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Color</label>
            <div className="flex gap-2">
              {ACCOUNT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: c,
                    border: color === c ? '2px solid white' : '2px solid transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 10px ${c}60` : 'none',
                  }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-text-dim hover:text-text-bright transition-colors"
            style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}>
            Cancel
          </button>
          <button
            onClick={() => { onSave({ name, broker, color, balance: parseFloat(balance) || 0, createdAt: new Date().toISOString() }); onClose() }}
            disabled={!name}
            className="px-5 py-2 rounded-xl text-[13px] font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            Create Tracker
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PortfolioPage({ accounts, balanceEntries, onAddAccount }: Props) {
  const [tab, setTab] = useState<Tab>('tracker')
  const [showNewTracker, setShowNewTracker] = useState(false)

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-text-bright text-[22px] font-bold tracking-tight">Portfolio</h2>
          <p className="text-text-muted text-[12px] mt-0.5">Track your balance growth and holdings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-lg overflow-hidden p-0.5" style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}>
            <button onClick={() => setTab('tracker')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all"
              style={tab === 'tracker' ? { background: '#22c55e', color: '#000' } : { color: '#6b7588' }}>
              <BarChart2 size={13} /> Balance Tracker
            </button>
            <button onClick={() => setTab('holdings')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all"
              style={tab === 'holdings' ? { background: '#22c55e', color: '#000' } : { color: '#6b7588' }}>
              <Wallet size={13} /> Holdings
            </button>
          </div>
          <button
            onClick={() => setShowNewTracker(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 10px rgba(34,197,94,0.2)' }}>
            <Plus size={14} strokeWidth={2.5} /> New Tracker
          </button>
        </div>
      </div>

      {tab === 'tracker' && (
        accounts.length === 0 ? (
          <div className="rounded-xl p-12 flex flex-col items-center text-center" style={CARD}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <TrendingUp size={26} className="text-accent" />
            </div>
            <h3 className="text-text-bright font-bold text-[16px] mb-2">Start Tracking Your Balance</h3>
            <p className="text-text-muted text-[13px] max-w-sm mb-6 leading-relaxed">
              Enter your current broker balance and the tracker will automatically update as you add trades to your journal.
            </p>
            <button onClick={() => setShowNewTracker(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-black transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <Plus size={14} /> Create Your First Tracker
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map(acc => {
              const entries = balanceEntries.filter(e => e.accountId === acc.id).sort((a, b) => a.date.localeCompare(b.date))
              const chartData = entries.map(e => ({ date: e.date.slice(5), balance: e.balance }))
              const latest = entries[entries.length - 1]?.balance ?? acc.balance
              const change = latest - acc.balance
              const changePct = acc.balance > 0 ? (change / acc.balance) * 100 : 0

              return (
                <div key={acc.id} className="rounded-xl p-5" style={CARD}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold"
                        style={{ background: `${acc.color}18`, border: `1.5px solid ${acc.color}50`, color: acc.color }}>
                        {acc.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-text-bright font-bold text-[15px]">{acc.name}</h3>
                        <p className="text-text-muted text-[12px]">{acc.broker || 'No broker specified'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-bright font-extrabold text-[22px] font-mono-num">
                        ${latest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="font-semibold text-[13px] font-mono-num" style={{ color: change >= 0 ? '#22c55e' : '#ef4444' }}>
                        {change >= 0 ? '+' : '-'}${Math.abs(change).toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${acc.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={acc.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={acc.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,46,62,0.5)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#4d5566', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#4d5566', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={40} />
                        <Tooltip contentStyle={{ background: '#0f1621', border: '1px solid #252e3e', borderRadius: 10, fontSize: 12 }} />
                        <Area type="monotone" dataKey="balance" stroke={acc.color} strokeWidth={2} fill={`url(#grad-${acc.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center py-8 rounded-xl"
                      style={{ background: 'rgba(22,29,43,0.4)', border: '1px solid rgba(37,46,62,0.4)' }}>
                      <p className="text-text-muted text-[12px]">Add balance entries to see the chart</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {tab === 'holdings' && (
        <div className="rounded-xl p-12 flex flex-col items-center text-center" style={CARD}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
            <BarChart2 size={26} style={{ color: '#3b82f6' }} />
          </div>
          <h3 className="text-text-bright font-bold text-[16px] mb-2">Holdings coming soon</h3>
          <p className="text-text-muted text-[13px]">Track your current open positions across brokers.</p>
        </div>
      )}

      {showNewTracker && <NewTrackerModal onClose={() => setShowNewTracker(false)} onSave={onAddAccount} />}
    </div>
  )
}
