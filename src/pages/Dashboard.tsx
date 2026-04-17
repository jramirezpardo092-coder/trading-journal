import { useMemo } from 'react'
import { Trade } from '../types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, Target, Activity } from 'lucide-react'

interface Props {
  trades: Trade[]
  onAddTrade: () => void
}

function fmtPnl(v: number) {
  const sign = v >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(v).toFixed(2)}`
}

export default function DashboardPage({ trades, onAddTrade }: Props) {
  const stats = useMemo(() => {
    const netPnl = trades.reduce((s, t) => s + (t.netPnl || 0), 0)
    const grossPnl = trades.reduce((s, t) => s + (t.grossPnl || 0), 0)
    const fees = trades.reduce((s, t) => s + (t.fees || 0), 0)
    const wins = trades.filter(t => t.result === 'WIN').length
    const losses = trades.filter(t => t.result === 'LOSS').length
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0
    const avgWin = wins > 0 ? trades.filter(t => t.result === 'WIN').reduce((s,t) => s + (t.netPnl||0), 0) / wins : 0
    const avgLoss = losses > 0 ? Math.abs(trades.filter(t => t.result === 'LOSS').reduce((s,t) => s + (t.netPnl||0), 0) / losses) : 0
    const profitFactor = avgLoss > 0 ? (avgWin * wins) / (avgLoss * losses) : 0

    // Equity curve
    const sorted = [...trades].sort((a,b) => a.date.localeCompare(b.date))
    let cumulative = 0
    const equity = sorted.map(t => {
      cumulative += t.netPnl || 0
      return { date: t.date, equity: cumulative, pnl: t.netPnl || 0 }
    })

    return { netPnl, grossPnl, fees, wins, losses, winRate, avgWin, avgLoss, profitFactor, equity }
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-6">
          <Activity size={36} className="text-accent" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">No trades yet</h2>
        <p className="text-text-dim mb-6 max-w-sm">
          Start by adding your first trade to see performance metrics, equity curves, and insights about your trading.
        </p>
        <button
          onClick={onAddTrade}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors"
        >
          Go to Trades
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Net P&L', value: fmtPnl(stats.netPnl), sub: `${trades.length} trades`, positive: stats.netPnl >= 0, icon: <TrendingUp size={20}/> },
          { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, sub: `${stats.wins}W / ${stats.losses}L`, positive: stats.winRate >= 50, icon: <Target size={20}/> },
          { label: 'Avg Win', value: fmtPnl(stats.avgWin), sub: 'per winning trade', positive: true, icon: <TrendingUp size={20}/> },
          { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), sub: stats.profitFactor >= 1 ? 'Positive edge' : 'Negative edge', positive: stats.profitFactor >= 1, icon: <Activity size={20}/> },
        ].map(card => (
          <div key={card.label} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-dim text-xs font-semibold uppercase tracking-widest">{card.label}</span>
              <span className={card.positive ? 'text-accent' : 'text-danger'}>{card.icon}</span>
            </div>
            <p className={`text-2xl font-bold mb-1 ${card.positive ? 'stat-positive' : 'stat-negative'}`}>{card.value}</p>
            <p className="text-text-dim text-xs">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Equity curve */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.equity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#8b949e' }}
              formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Equity']}
            />
            <Line type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent trades */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Recent Trades</h3>
        <div className="space-y-2">
          {trades.slice(0, 5).map(trade => (
            <div key={trade.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${trade.result === 'WIN' ? 'bg-accent' : trade.result === 'LOSS' ? 'bg-danger' : 'bg-text-dim'}`} />
                <span className="text-white font-medium text-sm">{trade.symbol || '—'}</span>
                <span className="text-text-dim text-xs">{trade.date}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${trade.side === 'LONG' ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger'}`}>{trade.side}</span>
              </div>
              <span className={`font-semibold text-sm ${(trade.netPnl||0) >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                {fmtPnl(trade.netPnl||0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
