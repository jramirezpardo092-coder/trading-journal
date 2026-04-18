import { useState } from 'react'
import { Plus, X, Trash2, Wallet, Info } from 'lucide-react'
import { Account } from '../types'

interface Props {
  accounts: Account[]
  onAddAccount: (a: Omit<Account, 'id'>) => void
  onDeleteAccount: (id: string) => void
}

const ACCOUNT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#84cc16']
const CARD = { background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }
const inputCls = 'w-full rounded-lg px-3 py-2.5 text-[13px] text-text-bright placeholder-text-muted focus:outline-none transition-colors'
const inputStyle = { background: 'rgba(22,29,43,0.8)', border: '1px solid rgba(37,46,62,0.8)' }

function AddAccountModal({ onClose, onSave }: { onClose: () => void; onSave: (a: Omit<Account, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [broker, setBroker] = useState('')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up"
        style={{ background: '#0f1621', border: '1px solid rgba(37,46,62,0.9)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text-bright font-bold text-[16px]">Add Trading Account</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-bright p-1 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Account Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Futures Account" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Broker</label>
            <input value={broker} onChange={e => setBroker(e.target.value)} placeholder="e.g. NinjaTrader, IBKR" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Starting Balance</label>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="25000.00" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Account Color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: c,
                    border: color === c ? '2px solid white' : '2px solid transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 10px ${c}60` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-text-dim hover:text-text-bright transition-colors"
            style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ name, broker, color, balance: parseFloat(balance) || 0, createdAt: new Date().toISOString() })
              onClose()
            }}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-xl text-[13px] font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
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
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-text-bright text-[22px] font-bold tracking-tight">Trading Accounts</h2>
          <p className="text-text-muted text-[12px] mt-0.5">Manage and compare your trading account performance</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-black transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 10px rgba(34,197,94,0.2)' }}
        >
          <Plus size={14} strokeWidth={2.5} /> Add Account
        </button>
      </div>

      {/* Accounts list */}
      <div className="rounded-xl overflow-hidden mb-4" style={CARD}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(37,46,62,0.5)' }}>
          <div className="flex items-center gap-2">
            <Wallet size={15} className="text-accent" />
            <h3 className="text-text-bright font-bold text-[14px]">Your Accounts</h3>
          </div>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(22,29,43,0.8)', color: '#8b949e', border: '1px solid rgba(37,46,62,0.6)' }}
          >
            {accounts.length}
          </span>
        </div>

        {accounts.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}
            >
              <Wallet size={22} className="text-accent" />
            </div>
            <h3 className="text-text-bright font-bold text-[15px] mb-1">No accounts yet</h3>
            <p className="text-text-muted text-[13px]">Create your first account to track performance separately</p>
          </div>
        ) : (
          <div>
            {accounts.map((acc, i) => (
              <div
                key={acc.id}
                className="flex items-center justify-between px-5 py-4 trade-row"
                style={i < accounts.length - 1 ? { borderBottom: '1px solid rgba(37,46,62,0.4)' } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold"
                    style={{
                      background: `${acc.color}18`,
                      border: `1.5px solid ${acc.color}50`,
                      color: acc.color,
                    }}
                  >
                    {acc.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-text-bright font-semibold text-[14px]">{acc.name}</p>
                    <p className="text-text-muted text-[12px]">{acc.broker || 'No broker specified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-text-bright font-bold text-[15px] font-mono-num">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-text-muted text-[11px]">Starting balance</p>
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ background: acc.color, boxShadow: `0 0 8px ${acc.color}60` }} />
                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-danger transition-colors"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid rgba(37,46,62,0.5)' }}>
          <Info size={14} className="text-accent" />
          <h3 className="text-text-bright font-bold text-[14px]">How Accounts Work</h3>
        </div>
        <div className="px-5 py-4 grid grid-cols-3 gap-4">
          {[
            { num: '1', title: 'Create accounts', desc: 'Add accounts for each broker or strategy. Give them distinct names and colors.' },
            { num: '2', title: 'Assign to trades', desc: 'When logging trades, assign them to an account. Compare performance across accounts.' },
            { num: '3', title: 'Track performance', desc: 'View analytics broken down by account to see which setups are working best.' },
          ].map(s => (
            <div key={s.num} className="flex gap-3">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold text-accent"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                {s.num}
              </div>
              <div>
                <p className="text-text-bright text-[13px] font-semibold">{s.title}</p>
                <p className="text-text-muted text-[12px] mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddAccountModal onClose={() => setShowAdd(false)} onSave={onAddAccount} />}
    </div>
  )
}
