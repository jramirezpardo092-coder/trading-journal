import { useState } from 'react'
import { Plus, X, Trash2, FolderOpen, HelpCircle } from 'lucide-react'
import { Account } from '../types'

interface Props {
  accounts: Account[]
  onAddAccount: (a: Omit<Account,'id'>) => void
  onDeleteAccount: (id: string) => void
}

const ACCOUNT_COLORS = ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#ef4444','#06b6d4','#84cc16']

function AddAccountModal({ onClose, onSave }: { onClose:()=>void, onSave:(a:Omit<Account,'id'>)=>void }) {
  const [name, setName] = useState('')
  const [broker, setBroker] = useState('')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])

  const inputCls = 'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent/60'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Add Account</h2>
          <button onClick={onClose} className="text-text-dim hover:text-white"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Account Name *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Futures Account" className={inputCls}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Broker</label>
            <input value={broker} onChange={e=>setBroker(e.target.value)} placeholder="e.g. NinjaTrader, TD Ameritrade" className={inputCls}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Starting Balance</label>
            <input type="number" value={balance} onChange={e=>setBalance(e.target.value)} placeholder="0.00" className={inputCls}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map(c => (
                <button key={c} onClick={()=>setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color===c?'border-white scale-110':'border-transparent hover:border-white/40'}`} style={{background:c}}/>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-text-dim bg-surface-2 border border-border hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => { onSave({ name, broker, color, balance: parseFloat(balance)||0, createdAt: new Date().toISOString() }); onClose() }}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim disabled:opacity-50 transition-colors"
          >
            Add Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AccountsPage({ accounts, onAddAccount, onDeleteAccount }: Props) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Trading Accounts</h2>
          <p className="text-text-dim text-sm mt-0.5">Manage your trading accounts and compare performance</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors"
        >
          <Plus size={14}/> Add Account
        </button>
      </div>

      {/* Your accounts */}
      <div className="bg-surface border border-border rounded-xl mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-accent"/>
            <h3 className="text-white font-semibold">Your Accounts</h3>
          </div>
          <span className="text-xs text-text-dim bg-surface-2 px-2 py-0.5 rounded-full border border-border">{accounts.length}</span>
        </div>

        {accounts.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-surface-2 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen size={24} className="text-text-dim"/>
            </div>
            <h3 className="text-white font-semibold mb-1">No accounts yet</h3>
            <p className="text-text-dim text-sm">Create your first trading account to track performance separately</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{background:acc.color+'33', border:`2px solid ${acc.color}`}}>
                    {acc.name.slice(0,2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-white font-medium">{acc.name}</p>
                    <p className="text-text-dim text-xs">{acc.broker || 'No broker specified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-semibold">${acc.balance.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
                    <p className="text-text-dim text-xs">Starting balance</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{background:acc.color}}/>
                  </div>
                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="p-2 text-text-dim hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How accounts work */}
      <div className="bg-surface border border-border rounded-xl">
        <button className="flex items-center gap-2 px-5 py-4 w-full text-left">
          <HelpCircle size={16} className="text-accent"/>
          <h3 className="text-white font-semibold">How Accounts Work</h3>
        </button>
        <div className="px-5 pb-5 space-y-3">
          {[
            { num:'1', title:'Create your accounts', desc:'Add accounts for each broker, strategy, or portfolio you want to track separately. Give them distinct names and colors.' },
            { num:'2', title:'Assign trades when adding or importing', desc:'When logging a trade, select which account it belongs to. This lets you compare performance across different setups.' },
            { num:'3', title:'Compare performance', desc:'View analytics broken down by account on the Analytics and Dashboard pages to see which setups are working best.' },
          ].map(s => (
            <div key={s.num} className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-accent text-xs font-bold">{s.num}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{s.title}</p>
                <p className="text-text-dim text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddAccountModal onClose={()=>setShowAdd(false)} onSave={onAddAccount}/>}
    </div>
  )
}
