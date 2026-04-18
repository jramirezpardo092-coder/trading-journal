import { useState, useMemo } from 'react'
import { Trade } from '../types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props { trades: Trade[] }
type ReviewPeriod = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'

function startOf(period: ReviewPeriod): string {
  const now = new Date()
  if (period === 'WEEK') {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay())
    return d.toISOString().split('T')[0]
  }
  if (period === 'MONTH') return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  if (period === 'QUARTER') {
    const q = Math.floor(now.getMonth() / 3)
    return `${now.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`
  }
  return `${now.getFullYear()}-01-01`
}

const CARD = { background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }
const TOOLTIP_STYLE = { background: '#0f1621', border: '1px solid #252e3e', borderRadius: 10, fontSize: 12 }

export default function ReviewPage({ trades }: Props) {
  const [period, setPeriod] = useState<ReviewPeriod>('MONTH')

  const filtered = useMemo(() => {
    const from = startOf(period)
    return trades.filter(t => t.date >= from).sort((a, b) => a.date.localeCompare(b.date))
  }, [trades, period])

  const stats = useMemo(() => {
    const netPnl = filtered.reduce((s, t) => s + (t.netPnl || 0), 0)
    const wins = filtered.filter(t => t.result === 'WIN').length
    const losses = filtered.filter(t => t.result === 'LOSS').length
    const winRate = filtered.length > 0 ? (wins / filtered.length) * 100 : 0
    const avgWin = wins > 0 ? filtered.filter(t => t.result === 'WIN').reduce((s, t) => s + (t.netPnl || 0), 0) / wins : 0
    const avgLoss = losses > 0 ? Math.abs(filtered.filter(t => t.result === 'LOSS').reduce((s, t) => s + (t.netPnl || 0), 0) / losses) : 0
    const pf = avgLoss > 0 ? (avgWin * wins) / (avgLoss * losses) : 0

    let cum = 0
    const equity = filtered.map(t => {
      cum += t.netPnl || 0
      return { date: t.date.slice(5), equity: parseFloat(cum.toFixed(2)) }
    })

    const byPlaybook: Record<string, { wins: number; total: number; pnl: number }> = {}
    filtered.forEach(t => {
      const pb = t.playbook || 'No Playbook'
      if (!byPlaybook[pb]) byPlaybook[pb] = { wins: 0, total: 0, pnl: 0 }
      byPlaybook[pb].total++
      byPlaybook[pb].pnl += t.netPnl || 0
      if (t.result === 'WIN') byPlaybook[pb].wins++
    })

    return { netPnl, wins, losses, winRate, avgWin, avgLoss, pf, equity, byPlaybook }
  }, [filtered])

  const periods: ReviewPeriod[] = ['WEEK', 'MONTH', 'QUARTER', 'YEAR']

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-text-bright text-[22px] font-bold tracking-tight">Performance Review</h2>
          <p className="text-text-muted text-[12px] mt-0.5">Deep analysis of your trading performance</p>
        </div>
        <div
          className="flex rounded-lg overflow-hidden p-0.5"
          style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
        >
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all"
              style={period === p ? { background: '#22c55e', color: '#000' } : { color: '#6b7588' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl p-16 flex flex-col items-center text-center" style={CARD}>
          <h3 className="text-text-bright font-bold text-[16px] mb-2">No trades in this period</h3>
          <p className="text-text-muted text-[13px]">Try selecting a different time range</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Net P&L',       value: `${stats.netPnl >= 0 ? '+' : '-'}$${Math.abs(stats.netPnl).toFixed(2)}`, color: stats.netPnl >= 0 ? '#22c55e' : '#ef4444' },
              { label: 'Win Rate',      value: `${stats.winRate.toFixed(1)}%`,     color: stats.winRate >= 50 ? '#22c55e' : '#ef4444' },
              { label: 'Profit Factor', value: `${stats.pf.toFixed(2)}x`,          color: stats.pf >= 1 ? '#22c55e' : '#ef4444' },
              { label: 'Total Trades',  value: filtered.length.toString(),          color: '#f0f6fc' },
            ].map(c => (
              <div key={c.label} className="card-hover rounded-xl p-4 text-center relative overflow-hidden" style={CARD}>
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.color}40, transparent)` }} />
                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2">{c.label}</p>
                <p className="text-[24px] font-extrabold font-mono-num" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Equity curve */}
            <div className="rounded-xl p-5" style={CARD}>
              <h3 className="text-text-bright font-bold text-[14px] mb-1">Cumulative P&L</h3>
              <p className="text-text-muted text-[11px] mb-4">Period performance over time</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={stats.equity} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,46,62,0.5)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#4d5566', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#4d5566', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={50} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'P&L']} />
                  <Area type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={2} fill="url(#reviewGrad)" dot={false} activeDot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Playbook performance */}
            <div className="rounded-xl p-5" style={CARD}>
              <h3 className="text-text-bright font-bold text-[14px] mb-1">Performance by Playbook</h3>
              <p className="text-text-muted text-[11px] mb-4">Win rates across your strategies</p>
              <div className="space-y-3">
                {Object.entries(stats.byPlaybook).map(([name, v]) => {
                  const wr = v.total > 0 ? (v.wins / v.total) * 100 : 0
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] text-text-bright font-medium">{name}</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-text-muted">{v.total}t</span>
                          <span className="font-bold font-mono-num" style={{ color: v.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                            {v.pnl >= 0 ? '+' : ''}${Math.abs(v.pnl).toFixed(0)}
                          </span>
                          <span className="font-bold" style={{ color: wr >= 50 ? '#22c55e' : '#ef4444' }}>
                            {wr.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(37,46,62,0.8)' }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${wr}%`, background: wr >= 50 ? '#22c55e' : '#ef4444' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Trade table */}
          <div className="rounded-xl overflow-hidden" style={CARD}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(37,46,62,0.5)' }}>
              <h3 className="text-text-bright font-bold text-[14px]">
                Trades This {period.charAt(0) + period.slice(1).toLowerCase()}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: 'rgba(22,29,43,0.4)', borderBottom: '1px solid rgba(37,46,62,0.5)' }}>
                    {['Date', 'Symbol', 'Playbook', 'Net P&L', 'Result'].map((h, i) => (
                      <th key={h}
                        className={`px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest ${i >= 3 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} className="trade-row"
                      style={i < filtered.length - 1 ? { borderBottom: '1px solid rgba(37,46,62,0.3)' } : {}}>
                      <td className="px-4 py-3 text-text-muted text-[12px] font-mono-num">{t.date}</td>
                      <td className="px-4 py-3 text-text-bright font-semibold">{t.symbol || '—'}</td>
                      <td className="px-4 py-3 text-text-muted text-[12px]">{t.playbook || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold font-mono-num"
                        style={{ color: (t.netPnl || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                        {(t.netPnl || 0) >= 0 ? '+' : '-'}${Math.abs(t.netPnl || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold"
                          style={t.result === 'WIN'
                            ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }
                            : t.result === 'LOSS'
                              ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }
                              : { background: 'rgba(139,148,158,0.1)', color: '#8b949e', border: '1px solid rgba(139,148,158,0.15)' }}>
                          {t.result || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
