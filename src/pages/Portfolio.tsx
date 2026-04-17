import { useState } from 'react'
import { Plus, X, Wallet, BarChart2 } from 'lucide-react'
import { Account, BalanceEntry } from '../types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  accounts: Account[]
  balanceEntries: BalanceEntry[]
  onAddAccount: (a: Omit<Account,'id'>) => void
  onAddBalanceEntry: (e: Omit<BalanceEntry,'id'>) => void
}

const ACCOUNT_COLORS = ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#ef4444']

type Tab = 'tracker' | 'holdings'

function NewTrackerModal({ onClose, onSave }: { onClose:()=>void, onSave:(a:Omit<Account,'id'>)=>void }) {
  const [name, setName] = useState('')
  const [broker, setBroker] = useState('')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">New Balance Tracker</h2>
          <button onClick={onClose} className="text-text-dim hover:text-white"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Account Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Main Account" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent/60" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Broker</label>
            <input value={broker} onChange={e=>setBroker(e.target.value)} placeholder="e.g. TD Ameritrade" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent/60" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Starting Balance</label>
            <input type="number" value={balance} onChange={e=>setBalance(e.target.value)} placeholder="0.00" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent/60" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-2">Color</label>
            <div className="flex gap-2">
              {ACCOUNT_COLORS.map(c => (
                <button key={c} onClick={()=>setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color===c?'border-white scale-110':'border-transparent'}`} style={{background:c}} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-text-dim bg-surface-2 border border-border hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => { onSave({ name, broker, color, balance: parseFloat(balance)||0, createdAt: new Date().toISOString() }); onClose() }}
            disabled={!name}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim disabled:opacity-50 transition-colors"
          >
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
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white text-2xl font-bold">Portfolio</h2>
          <p className="text-text-dim text-sm mt-0.5">Track your balance growth and holdings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-2 border border-border rounded-xl p-1 gap-1">
            <button onClick={()=>setTab('tracker')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab==='tracker'?'bg-accent text-black':'text-text-dim hover:text-white'}`}>
              <BarChart2 size={14}/> Balance Tracker
            </button>
            <button onClick={()=>setTab('holdings')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab==='holdings'?'bg-accent text-black':'text-text-dim hover:text-white'}`}>
              <Wallet size={14}/> Holdings
            </button>
          </div>
          <button onClick={()=>setShowNewTracker(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors">
            <Plus size={14}/> New Tracker
          </button>
        </div>
      </div>

      {tab === 'tracker' && (
        accounts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-4">
              <Wallet size={28} className="text-text-dim"/>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Start Tracking Your Balance</h3>
            <p className="text-text-dim text-sm max-w-sm mb-6">Enter your current broker balance and the tracker will automatically update as you add trades to your journal.</p>
            <button onClick={()=>setShowNewTracker(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors">
              <Plus size={14}/> Create Your First Tracker
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map(acc => {
              const entries = balanceEntries.filter(e=>e.accountId===acc.id).sort((a,b)=>a.date.localeCompare(b.date))
              const chartData = entries.map(e=>({date:e.date, balance:e.balance}))
              const latest = entries[entries.length-1]?.balance ?? acc.balance
              const change = latest - acc.balance
              return (
                <div key={acc.id} className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{background:acc.color}}/>
                      <div>
                        <h3 className="text-white font-semibold">{acc.name}</h3>
                        <p className="text-text-dim text-xs">{acc.broker}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xl">${latest.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
                      <p className={`text-sm ${change>=0?'stat-positive':'stat-negative'}`}>
                        {change>=0?'+':''}{change.toFixed(2)} from start
                      </p>
                    </div>
                  </div>
                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d"/>
                        <XAxis dataKey="date" tick={{fill:'#8b949e',fontSize:10}} tickLine={false} axisLine={false}/>
                        <YAxis tick={{fill:'#8b949e',fontSize:10}} tickLine={false} axisLine={false}/>
                        <Tooltip contentStyle={{background:'#161b22',border:'1px solid #30363d',borderRadius:8,fontSize:12}}/>
                        <Line type="monotone" dataKey="balance" stroke={acc.color} strokeWidth={2} dot={false}/>
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-text-dim text-xs text-center py-6">Add more balance entries to see the chart</p>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {tab === 'holdings' && (
        <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-4">
            <BarChart2 size={28} className="text-text-dim"/>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Holdings coming soon</h3>
          <p className="text-text-dim text-sm">Track your current open positions across brokers.</p>
        </div>
      )}

      {showNewTracker && (
        <NewTrackerModal onClose={()=>setShowNewTracker(false)} onSave={onAddAccount} />
      )}
    </div>
  )
}
