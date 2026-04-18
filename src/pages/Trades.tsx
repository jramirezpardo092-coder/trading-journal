import { useState, useMemo } from 'react'
import { Share2, CheckSquare, Plus, Trash2, Pencil, SlidersHorizontal } from 'lucide-react'
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function startOfYear() {
  return `${new Date().getFullYear()}-01-01`
}

function fmtPnl(v?: number) {
  if (v == null) return '+$0.00'
  const sign = v >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function pnlColor(v?: number): string {
  if (!v || v === 0) return '#22c55e'
  return v > 0 ? '#22c55e' : '#ef4444'
}

export default function TradesPage({ trades, onAddTrade, onEditTrade, onDeleteTrade }: Props) {
  const [period, setPeriod] = useState<PeriodFilter>('Month')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | 'All'>('All')
  const [sideFilter, setSideFilter] = useState<Side | 'All'>('All')
  const [resultFilter, setResultFilter] = useState<TradeResult | 'All'>('All')
  const [strategyFilter, _setStrategyFilter] = useState('')
  const [emotionFilter, setEmotionFilter] = useState<Emotion | 'All'>('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = useMemo(() => {
    let from = '', to = isoToday()
    if (period === 'Today')  { from = isoToday(); to = isoToday() }
    else if (period === 'Week')  { from = startOfWeek() }
    else if (period === 'Month') { from = startOfMonth() }
    else if (period === 'YTD')   { from = startOfYear() }
    else { from = fromDate; to = toDate || isoToday() }

    return trades.filter(t => {
      if (from && t.date < from) return false
      if (to   && t.date > to)   return false
      if (symbolFilter && !t.symbol.toLowerCase().includes(symbolFilter.toLowerCase())) return false
      if (assetTypeFilter !== 'All' && t.assetType !== assetTypeFilter) return false
      if (sideFilter !== 'All' && t.side !== sideFilter) return false
      if (resultFilter !== 'All' && t.result !== resultFilter) return false
      if (strategyFilter && !t.playbook?.toLowerCase().includes(strategyFilter.toLowerCase())) return false
      if (emotionFilter !== 'All' && t.emotion !== emotionFilter) return false
      return true
    }).sort((a, b) => b.date.localeCompare(a.date))
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

  const inputCls = 'bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-bright placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors'
  const selectCls = `${inputCls} appearance-none pr-7 cursor-pointer`
  const periods: PeriodFilter[] = ['Today', 'Week', 'Month', 'YTD']

  return (
    <div className="page-enter">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-text-bright text-[22px] font-bold tracking-tight">Trade Log</h2>
          <p className="text-text-muted text-[12px] mt-0.5">{stats.count} trade{stats.count !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-dim hover:text-text-bright transition-colors"
            style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
          >
            <CheckSquare size={13} /> Select
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-dim hover:text-text-bright transition-colors"
            style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
          >
            <Share2 size={13} /> Share
          </button>
          <button
            onClick={onAddTrade}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-bold text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 10px rgba(34,197,94,0.2)' }}
          >
            <Plus size={13} strokeWidth={2.5} /> Add Trade
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 mb-4 space-y-3"
        style={{ background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {/* Period */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest mr-0.5">Period</span>
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(37,46,62,0.8)', background: 'rgba(22,29,43,0.5)' }}
            >
              {periods.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 text-[12px] font-semibold transition-all"
                  style={period === p
                    ? { background: '#22c55e', color: '#000', boxShadow: 'none' }
                    : { color: '#6b7588', background: 'transparent' }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Symbol */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Symbol</span>
            <input
              type="text"
              value={symbolFilter}
              onChange={e => setSymbolFilter(e.target.value)}
              placeholder="/ES, SPY..."
              className={`${inputCls} w-24`}
            />
          </div>

          {/* Asset Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Asset</span>
            <div className="relative">
              <select value={assetTypeFilter} onChange={e => setAssetTypeFilter(e.target.value as any)} className={selectCls}>
                <option value="All">All</option>
                {(['OPTIONS', 'FUTURES', 'STOCKS', 'CRYPTO', 'BETS'] as AssetType[]).map(a => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <SlidersHorizontal size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Side */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Side</span>
            <select value={sideFilter} onChange={e => setSideFilter(e.target.value as any)} className={selectCls}>
              <option value="All">All</option>
              <option>LONG</option>
              <option>SHORT</option>
            </select>
          </div>

          {/* Result */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Result</span>
            <select value={resultFilter} onChange={e => setResultFilter(e.target.value as any)} className={selectCls}>
              <option value="All">All</option>
              <option>WIN</option>
              <option>LOSS</option>
              <option>BREAKEVEN</option>
            </select>
          </div>

          {/* Emotion */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Emotion</span>
            <select value={emotionFilter} onChange={e => setEmotionFilter(e.target.value as any)} className={selectCls}>
              <option value="All">All</option>
              {['FOCUSED', 'CALM', 'EXCITED', 'ANXIOUS', 'FRUSTRATED', 'PATIENT'].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={e => { setFromDate(e.target.value); setPeriod('Custom') }}
            className={inputCls}
          />
          <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">To</span>
          <input
            type="date"
            value={toDate}
            onChange={e => { setToDate(e.target.value); setPeriod('Custom') }}
            className={inputCls}
          />
          {period === 'Custom' && (
            <button
              onClick={() => { setFromDate(''); setToDate(''); setPeriod('Month') }}
              className="text-[11px] text-text-muted hover:text-text-bright transition-colors px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="grid grid-cols-6 rounded-xl overflow-hidden mb-4"
        style={{ border: '1px solid rgba(37,46,62,0.8)' }}
      >
        {[
          { label: 'TRADES',    value: stats.count.toString(),                       color: '#f0f6fc' },
          { label: 'NET P&L',   value: fmtPnl(stats.netPnl),                        color: pnlColor(stats.netPnl) },
          { label: 'GROSS P&L', value: fmtPnl(stats.grossPnl),                      color: pnlColor(stats.grossPnl) },
          { label: 'FEES',      value: `-$${stats.fees.toFixed(2)}`,                 color: '#ef4444' },
          { label: 'POINTS',    value: `${stats.points >= 0 ? '+' : ''}${stats.points.toFixed(2)}`, color: pnlColor(stats.points) },
          { label: 'WIN RATE',  value: `${stats.winRate.toFixed(1)}%`,               color: stats.winRate >= 50 ? '#22c55e' : '#ef4444' },
        ].map((s, i) => (
          <div
            key={s.label}
            className="px-4 py-3.5 text-center"
            style={{
              background: 'rgba(15,22,33,0.9)',
              borderRight: i < 5 ? '1px solid rgba(37,46,62,0.5)' : 'none',
            }}
          >
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-[16px] font-extrabold font-mono-num" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Trade table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M7 8h10M7 12h10M7 16h6" />
              </svg>
            </div>
            <p className="text-text-bright font-semibold text-[15px] mb-1">No trades in this period</p>
            <p className="text-text-muted text-[13px]">Try changing the filters or add a new trade</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(37,46,62,0.6)', background: 'rgba(22,29,43,0.4)' }}>
                  {['Date', 'Symbol', 'Type', 'Side', 'Entry', 'Exit', 'Points', 'Net P&L', 'Result', 'Emotion', ''].map(h => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest ${
                        ['Entry', 'Exit', 'Points', 'Net P&L'].includes(h) ? 'text-right' : ['Result', 'Emotion'].includes(h) ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade, i) => {
                  const avgEntry = trade.entries && trade.entries.length > 0
                    ? trade.entries.reduce((s, l) => s + l.price, 0) / trade.entries.length
                    : (trade as any).avgEntry || 0
                  const avgExit = trade.exits && trade.exits.length > 0
                    ? trade.exits.reduce((s, l) => s + l.price, 0) / trade.exits.length
                    : (trade as any).avgExit || 0
                  const isWin = trade.result === 'WIN'
                  const isLoss = trade.result === 'LOSS'
                  return (
                    <tr
                      key={trade.id}
                      className="trade-row"
                      style={i < filtered.length - 1 ? { borderBottom: '1px solid rgba(37,46,62,0.3)' } : {}}
                    >
                      <td className="px-4 py-3 text-text-muted text-[12px] font-mono-num">{trade.date}</td>
                      <td className="px-4 py-3">
                        <span className="text-text-bright font-bold">{trade.symbol || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-[12px]">
                        {trade.assetType}{trade.optionType ? ` ${trade.optionType}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold"
                          style={trade.side === 'LONG'
                            ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }
                            : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }
                          }
                        >
                          {trade.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-text-bright font-mono-num">{avgEntry.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-text-bright font-mono-num">{avgExit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold font-mono-num" style={{ color: pnlColor(trade.points) }}>
                        {trade.points != null ? (trade.points >= 0 ? '+' : '') + trade.points.toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono-num" style={{ color: pnlColor(trade.netPnl) }}>
                        {fmtPnl(trade.netPnl)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold"
                          style={isWin
                            ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }
                            : isLoss
                              ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }
                              : { background: 'rgba(139,148,158,0.1)', color: '#8b949e', border: '1px solid rgba(139,148,158,0.15)' }
                          }
                        >
                          {trade.result || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-text-muted text-[12px]">
                        {trade.emotion || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => onEditTrade(trade)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent transition-colors hover:bg-accent/10"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => onDeleteTrade(trade.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors hover:bg-danger/10"
                          >
                            <Trash2 size={12} />
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
