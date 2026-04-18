import { useMemo } from 'react'
import { Trade } from '../types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Zap, Plus } from 'lucide-react'

interface Props {
  trades: Trade[]
  onAddTrade: () => void
}

function fmtPnl(v: number) {
  const sign = v >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtNum(v: number) {
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value
    return (
      <div style={{
        background: '#0f1621',
        border: '1px solid #252e3e',
        borderRadius: 10,
        padding: '8px 12px',
        fontSize: 12,
      }}>
        <p style={{ color: '#8b949e', marginBottom: 4 }}>{label}</p>
        <p style={{ color: val >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
          {val >= 0 ? '+' : ''}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardPage({ trades, onAddTrade }: Props) {
  const stats = useMemo(() => {
    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date))
    const netPnl = sorted.reduce((s, t) => s + (t.netPnl || 0), 0)
    const wins = sorted.filter(t => t.result === 'WIN').length
    const losses = sorted.filter(t => t.result === 'LOSS').length
    const winRate = sorted.length > 0 ? (wins / sorted.length) * 100 : 0
    const avgWin = wins > 0 ? sorted.filter(t => t.result === 'WIN').reduce((s, t) => s + (t.netPnl || 0), 0) / wins : 0
    const avgLoss = losses > 0 ? Math.abs(sorted.filter(t => t.result === 'LOSS').reduce((s, t) => s + (t.netPnl || 0), 0) / losses) : 0
    const profitFactor = avgLoss > 0 ? (avgWin * wins) / (avgLoss * losses) : 0

    let cumulative = 0
    const equity = sorted.map(t => {
      cumulative += t.netPnl || 0
      return { date: t.date.slice(5), equity: +cumulative.toFixed(2) }
    })

    const recentTrades = [...trades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
    return { netPnl, wins, losses, winRate, avgWin, avgLoss, profitFactor, equity, recentTrades, total: trades.length }
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center page-enter">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
        >
          <Activity size={34} className="text-accent" />
        </div>
        <h2 className="text-text-bright text-2xl font-bold mb-2">Start tracking trades</h2>
        <p className="text-text-dim mb-6 max-w-sm text-sm leading-relaxed">
          Add your first trade to unlock performance metrics, equity curves, and deep insights into your trading.
        </p>
        <button
          onClick={onAddTrade}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 16px rgba(34,197,94,0.3)' }}
        >
          <Plus size={15} strokeWidth={2.5} /> Add First Trade
        </button>
      </div>
    )
  }

  const isPositive = stats.netPnl >= 0

  return (
    <div className="space-y-5 page-enter">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Total Net P&L',
            value: fmtPnl(stats.netPnl),
            sub: `${stats.total} total trades`,
            positive: isPositive,
            icon: isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
            color: isPositive ? '#22c55e' : '#ef4444',
          },
          {
            label: 'Win Rate',
            value: `${stats.winRate.toFixed(1)}%`,
            sub: `${stats.wins}W  /  ${stats.losses}L`,
            positive: stats.winRate >= 50,
            icon: <Target size={18} />,
            color: stats.winRate >= 50 ? '#22c55e' : '#ef4444',
          },
          {
            label: 'Avg Win',
            value: `+$${fmtNum(stats.avgWin)}`,
            sub: `Avg Loss: -$${fmtNum(stats.avgLoss)}`,
            positive: true,
            icon: <DollarSign size={18} />,
            color: '#22c55e',
          },
          {
            label: 'Profit Factor',
            value: stats.profitFactor.toFixed(2) + 'x',
            sub: stats.profitFactor >= 1.5 ? '🔥 Great edge' : stats.profitFactor >= 1 ? 'Positive edge' : 'Negative edge',
            positive: stats.profitFactor >= 1,
            icon: <Zap size={18} />,
            color: stats.profitFactor >= 1 ? '#22c55e' : '#ef4444',
          },
        ].map(card => (
          <div
            key={card.label}
            className="card-hover rounded-xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(22,29,43,0.9) 0%, rgba(15,22,33,0.9) 100%)',
              border: '1px solid rgba(37,46,62,0.8)',
            }}
          >
            {/* Accent glow top */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${card.color}40, transparent)` }}
            />
            <div className="flex items-start justify-between mb-3">
              <span className="text-text-muted text-[11px] font-semibold uppercase tracking-widest">{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <p
              className="text-[26px] font-extrabold leading-none mb-1.5 font-mono-num"
              style={{ color: card.color }}
            >
              {card.value}
            </p>
            <p className="text-text-muted text-[12px]">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-text-bright font-bold text-[15px]">Equity Curve</h3>
            <p className="text-text-muted text-[12px] mt-0.5">Cumulative P&L over time</p>
          </div>
          <span
            className="text-[13px] font-bold px-3 py-1 rounded-lg"
            style={{ background: isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isPositive ? '#22c55e' : '#ef4444' }}
          >
            {fmtPnl(stats.netPnl)}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={stats.equity} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,46,62,0.5)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#4d5566', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#4d5566', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={2} fill="url(#equityGrad)" dot={false} activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Trades */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(37,46,62,0.5)' }}>
          <h3 className="text-text-bright font-bold text-[15px]">Recent Trades</h3>
          <span className="text-text-muted text-[12px]">Last 5</span>
        </div>
        <div>
          {stats.recentTrades.map((trade, i) => {
            const isWin = trade.result === 'WIN'
            const isLoss = trade.result === 'LOSS'
            return (
              <div
                key={trade.id}
                className="flex items-center px-5 py-3 trade-row"
                style={i < stats.recentTrades.length - 1 ? { borderBottom: '1px solid rgba(37,46,62,0.4)' } : {}}
              >
                {/* Color bar */}
                <div
                  className="w-1 h-8 rounded-full mr-4 flex-shrink-0"
                  style={{ background: isWin ? '#22c55e' : isLoss ? '#ef4444' : '#4d5566' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-text-bright font-semibold text-[14px]">{trade.symbol}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={trade.side === 'LONG' ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' } : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                    >
                      {trade.side}
                    </span>
                    <span className="text-text-muted text-[11px]">{trade.assetType}</span>
                  </div>
                  <span className="text-text-muted text-[11px]">{trade.date}</span>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-[14px] font-mono-num ${isWin ? 'stat-positive' : isLoss ? 'stat-negative' : 'stat-neutral'}`}>
                    {fmtPnl(trade.netPnl || 0)}
                  </p>
                  <p className="text-text-muted text-[11px]">
                    {isWin ? 'WIN' : isLoss ? 'LOSS' : 'EVEN'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
