import { useState, useMemo } from 'react'
import { Share2, CheckSquare, Plus, Trash2, Pencil } from 'lucide-react'
import { Trade, AssetType, Side, TradeResult, Emotion } from '../types'

interface Props {
  trades: Trade[]
  onAddTrade: () => void
  onEditTrade: (trade: Trade) => void
  onDeleteTrade: (id: string) => void
}

type PeriodFilter = 'Today' | 'Week' | 'Month' | 'YTD' | 'Custom'

function isoToday() { return new Date().toISOString().split('T')[0] }
function startOfWeek() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}
function startOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
}
function startOfYear() {
  return `${new Date().getFullYear()}-01-01`
}

function fmtPnl(v?: number) {
  if (v == null) return '+$0.00'
  const sign = v >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(v).toFixed(2)}`
}
function pnlClass(v?: number) {
  if (!v || v === 0) return 'stat-positive'
  return v > 0 ? 'stat-positive' : 'stat-negative'
}

export default function TradesPage({ trades, onAddTrade, onEditTrade, onDeleteTrade }: Props) {
  const [period, setPeriod] = useState<PeriodFilter>('Today')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | 'All'>('All')
  const [sideFilter, setSideFilter] = useState<Side | 'All'>('All')
  const [resultFilter, setResultFilter] = useState<TradeResult | 'All'>('All')
  const [strategyFilter, setStrategyFilter] = useState('')
  const [emotionFilter, setEmotionFilter] = useState<Emotion | 'All'>('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = useMemo(() => {
    let from = '', to = isoToday()
    if (period === 'Today') { from = isoToday() }
    else if (period === 'Week') { from = startOfWeek() }
    else if (period === 'Month') { from = startOfMonth() }
    else if (period === 'YTD') { from = startOfYear() }
    else { from = fromDate; to = toDate || isoToday() }

    return trades.filter(t => {
      if (from && t.date < from) return false
      if (to && t.date > to) return false
      if (symbolFilter && !t.symbol.toLowerCase().includes(symbolFilter.toLowerCase())) return false
      if (assetTypeFilter !== 'All' && t.assetType !== assetTypeFilter) return false
      if (sideFilter !== 'All' && t.side !== sideFilter) return false
      if (resultFilter !== 'All' && t.result !== resultFilter) return false
      if (strategyFilter && !t.playbook?.toLowerCase().includes(strategyFilter.toLowerCase())) return false
      if (emotionFilter !== 'All' && t.emotion !== emotionFilter) return false
      return true
    })
  }, [trades, period, symbolFilter, assetTypeFilter, sideFilter, resultFilter, strategyFilter, emotionFilter, fromDate, toDate])

  const stats = useMemo(() => {
    const netPnl = filtered.reduce((s, t) => s + (t.netPnl || 0), 0)
    const grossPnl = filtered.reduce((s, t) => s + (t.grossPnl || 0), 0)
    const fees = filtered.reduce((s, t) => s + (t.fees || 0), 0)
    const points = filtered.reduce((s, t) => s + (t.points || 0), 0)
    const wins = filtered.filter(t => t.result === 'WIN').length
    const winRate = filtered.length > 0 ? (wins / filtered.length) * 100 : 0
    return { netPnl, grossPnl, fees, points, winRate, count: filtered.length }
  }, [filtered])

  const selectCls = 'bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-accent/60 pr-7'

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white text-2xl font-bold">Trade Log</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-surface-2 border border-border text-text-dim hover:text-white transition-colors">
            <CheckSquare size={14} /> Select
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-surface-2 border border-border text-text-dim hover:text-white transition-colors">
            <Share2 size={14} /> Share
          </button>
          <button onClick={onAddTrade} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors">
            <Plus size={14} /> Add Trade
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-widest mr-1">Period</span>
            {(['Today','Week','Month','YTD'] as PeriodFilter[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === p ? 'bg-accent text-black' : 'bg-surface-2 text-text-dim hover:text-white border border-border'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Symbol */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">Symbol</span>
            <input
              type="text"
              value={symbolFilter}
              onChange={e => setSymbolFilter(e.target.value)}
              placeholder="e.g. /ES"
              className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent/60 w-28"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">Asset Type</span>
            <div className="relative">
              <select value={assetTypeFilter} onChange={e => setAssetTypeFilter(e.target.value as any)} className={selectCls}>
                <option value="All">All</option>
                {(['OPTIONS','FUTURES','STOCKS','CRYPTO','BETS'] as AssetType[]).map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">Side</span>
            <select value={sideFilter} onChange={e => setSideFilter(e.target.value as any)} className={selectCls}>
              <option value="All">All</option>
              <option>LONG</option>
              <option>SHORT</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">Result</span>
            <select value={resultFilter} onChange={e => setResultFilter(e.target.value as any)} className={selectCls}>
              <option value="All">All</option>
              <option>WIN</option>
              <option>LOSS</option>
              <option>BREAKEVEN</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">Strategy</span>
            <select value={strategyFilter} onChange={e => setStrategyFilter(e.target.value)} className={selectCls}>
              <option value="">All</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">Emotion</span>
            <select value={emotionFilter} onChange={e => setEmotionFilter(e.target.value as any)} className={selectCls}>
              <option value="All">All</option>
              {['Confident','Calm','Focused','Anxious','FOMO','Revenge','Bored','Greedy','Fearful','Frustrated','Impulsive','Disciplined'].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-3">
          <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={e => { setFromDate(e.target.value); setPeriod('Custom') }}
            className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/60"
          />
          <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">To</span>
          <input
            type="date"
            value={toDate}
            onChange={e => { setToDate(e.target.value); setPeriod('Custom') }}
            className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/60"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-6 gap-px bg-border rounded-xl overflow-hidden mb-4">
        {[
          { label: 'TRADES', value: stats.count.toString(), cls: 'text-white' },
          { label: 'NET P&L', value: fmtPnl(stats.netPnl), cls: pnlClass(stats.netPnl) },
          { label: 'GROSS P&L', value: fmtPnl(stats.grossPnl), cls: pnlClass(stats.grossPnl) },
          { label: 'FEES', value: `-$${stats.fees.toFixed(2)}`, cls: 'stat-negative' },
          { label: 'POINTS', value: `${stats.points >= 0 ? '+' : ''}${stats.points.toFixed(2)}`, cls: pnlClass(stats.points) },
          { label: 'WIN RATE', value: `${stats.winRate.toFixed(1)}%`, cls: stats.winRate >= 50 ? 'stat-positive' : 'stat-negative' },
        ].map(s => (
          <div key={s.label} className="bg-surface px-5 py-4 text-center">
            <p className="text-text-dim text-[11px] font-semibold uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Trade table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="18" rx="2"/>
                <path d="M7 8h10M7 12h10M7 16h6"/>
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">No trades yet</p>
            <p className="text-text-dim text-sm">Add your first trade to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-dim uppercase tracking-widest">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-dim uppercase tracking-widest">Symbol</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-dim uppercase tracking-widest">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-dim uppercase tracking-widest">Side</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-dim uppercase tracking-widest">Entry</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-dim uppercase tracking-widest">Exit</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-dim uppercase tracking-widest">Points</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-dim uppercase tracking-widest">Net P&L</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-text-dim uppercase tracking-widest">Result</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-text-dim uppercase tracking-widest">Emotion</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade, i) => {
                  const avgEntry = trade.entries.reduce((s,l)=>s+l.price,0)/Math.max(trade.entries.length,1)
                  const avgExit = trade.exits.reduce((s,l)=>s+l.price,0)/Math.max(trade.exits.length,1)
                  return (
                    <tr key={trade.id} className={`border-b border-border/50 hover:bg-surface-2 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-surface/50'}`}>
                      <td className="px-4 py-3 text-text-dim text-xs">{trade.date}</td>
                      <td className="px-4 py-3 font-semibold text-white">{trade.symbol || '—'}</td>
                      <td className="px-4 py-3 text-text-dim text-xs">{trade.assetType}{trade.optionType ? ` ${trade.optionType}` : ''}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${trade.side === 'LONG' ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger'}`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-white">{avgEntry.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-white">{avgExit.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${pnlClass(trade.points)}`}>{trade.points != null ? (trade.points >= 0 ? '+' : '') + trade.points.toFixed(2) : '—'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${pnlClass(trade.netPnl)}`}>{fmtPnl(trade.netPnl)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          trade.result === 'WIN' ? 'bg-accent/15 text-accent' :
                          trade.result === 'LOSS' ? 'bg-danger/15 text-danger' :
                          'bg-surface-2 text-text-dim'
                        }`}>
                          {trade.result || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-text-dim">{trade.emotion || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => onEditTrade(trade)} className="p-1 text-text-dim hover:text-accent transition-colors rounded">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => onDeleteTrade(trade.id)} className="p-1 text-text-dim hover:text-danger transition-colors rounded">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
