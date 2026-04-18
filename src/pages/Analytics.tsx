import { useMemo } from 'react'
import { Trade } from '../types'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts'

interface Props { trades: Trade[] }

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444']
const CARD_STYLE = { background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }
const TOOLTIP_STYLE = { background: '#0f1621', border: '1px solid #252e3e', borderRadius: 10, fontSize: 12 }

export default function AnalyticsPage({ trades }: Props) {
  const stats = useMemo(() => {
    if (!trades.length) return null
    const wins = trades.filter(t => t.result === 'WIN')
    const losses = trades.filter(t => t.result === 'LOSS')
    const winRate = (wins.length / trades.length) * 100
    const avgWin = wins.length ? wins.reduce((s, t) => s + (t.netPnl || 0), 0) / wins.length : 0
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.netPnl || 0), 0) / losses.length) : 0
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0
    const totalFees = trades.reduce((s, t) => s + (t.fees || 0), 0)
    const totalPnl = trades.reduce((s, t) => s + (t.netPnl || 0), 0)

    const byAsset: Record<string, { count: number; pnl: number }> = {}
    trades.forEach(t => {
      if (!byAsset[t.assetType]) byAsset[t.assetType] = { count: 0, pnl: 0 }
      byAsset[t.assetType].count++
      byAsset[t.assetType].pnl += t.netPnl || 0
    })

    const byEmotion: Record<string, { wins: number; total: number }> = {}
    trades.forEach(t => {
      const em = t.emotion || 'None'
      if (!byEmotion[em]) byEmotion[em] = { wins: 0, total: 0 }
      byEmotion[em].total++
      if (t.result === 'WIN') byEmotion[em].wins++
    })

    const byDay: Record<number, { pnl: number; count: number }> = {}
    for (let i = 0; i < 7; i++) byDay[i] = { pnl: 0, count: 0 }
    trades.forEach(t => {
      const d = new Date(t.date + 'T12:00:00').getDay()
      byDay[d].pnl += t.netPnl || 0
      byDay[d].count++
    })

    const byMonth: Record<string, number> = {}
    trades.forEach(t => {
      const m = t.date.slice(0, 7)
      byMonth[m] = (byMonth[m] || 0) + (t.netPnl || 0)
    })

    const byPlaybook: Record<string, { wins: number; total: number; pnl: number }> = {}
    trades.forEach(t => {
      const pb = t.playbook || 'No Playbook'
      if (!byPlaybook[pb]) byPlaybook[pb] = { wins: 0, total: 0, pnl: 0 }
      byPlaybook[pb].total++
      byPlaybook[pb].pnl += t.netPnl || 0
      if (t.result === 'WIN') byPlaybook[pb].wins++
    })

    return { wins, losses, winRate, avgWin, avgLoss, profitFactor, totalFees, totalPnl, byAsset, byEmotion, byDay, byMonth, byPlaybook }
  }, [trades])

  if (!trades.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center page-enter">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h2 className="text-text-bright text-2xl font-bold mb-2">No analytics yet</h2>
        <p className="text-text-dim text-sm">Add trades to see detailed performance breakdowns.</p>
      </div>
    )
  }

  const { wins, losses, winRate, avgWin, avgLoss, profitFactor, totalFees, byAsset, byEmotion, byDay, byMonth, byPlaybook } = stats!
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const dayData = Object.entries(byDay).map(([d, v]) => ({
    day: dayNames[parseInt(d)],
    pnl: parseFloat(v.pnl.toFixed(2)),
    count: v.count,
  }))

  const monthData = Object.entries(byMonth).sort().map(([m, pnl]) => ({
    month: m.slice(5),
    pnl: parseFloat(pnl.toFixed(2)),
  }))

  const emotionData = Object.entries(byEmotion).map(([em, v]) => ({
    name: em, winRate: v.total > 0 ? (v.wins / v.total) * 100 : 0, count: v.total,
  })).sort((a, b) => b.winRate - a.winRate)

  const assetPie = Object.entries(byAsset).map(([name, v]) => ({ name, value: v.count, pnl: v.pnl }))

  const playbookData = Object.entries(byPlaybook).map(([name, v]) => ({
    name, winRate: v.total > 0 ? (v.wins / v.total) * 100 : 0, count: v.total, pnl: v.pnl,
  })).sort((a, b) => b.pnl - a.pnl)

  return (
    <div className="space-y-5 page-enter">
      {/* KPI row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Win Rate',      value: `${winRate.toFixed(1)}%`,      sub: `${wins.length}W  /  ${losses.length}L`, pos: winRate >= 50 },
          { label: 'Avg Win',       value: `+$${avgWin.toFixed(2)}`,       sub: 'per winning trade',         pos: true },
          { label: 'Avg Loss',      value: `-$${avgLoss.toFixed(2)}`,      sub: 'per losing trade',           pos: false },
          { label: 'Profit Factor', value: `${profitFactor.toFixed(2)}x`,  sub: profitFactor >= 1.5 ? '🔥 Great edge' : profitFactor >= 1 ? 'Positive edge' : 'Needs work', pos: profitFactor >= 1 },
          { label: 'Total Fees',    value: `-$${totalFees.toFixed(2)}`,    sub: 'commissions paid',           pos: false },
        ].map(c => (
          <div key={c.label} className="card-hover rounded-xl p-4 relative overflow-hidden" style={CARD_STYLE}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${c.pos ? '#22c55e' : '#ef4444'}40, transparent)` }} />
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2">{c.label}</p>
            <p className="text-[20px] font-extrabold font-mono-num" style={{ color: c.pos ? '#22c55e' : '#ef4444' }}>{c.value}</p>
            <p className="text-text-muted text-[11px] mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Monthly P&L */}
        <div className="rounded-xl p-5" style={CARD_STYLE}>
          <h3 className="text-text-bright font-bold text-[14px] mb-1">Monthly P&L</h3>
          <p className="text-text-muted text-[11px] mb-4">Net profit/loss per month</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,46,62,0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4d5566', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4d5566', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={55} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Net P&L']} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {monthData.map((m, i) => <Cell key={i} fill={m.pnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.9} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Day of Week */}
        <div className="rounded-xl p-5" style={CARD_STYLE}>
          <h3 className="text-text-bright font-bold text-[14px] mb-1">P&L by Day of Week</h3>
          <p className="text-text-muted text-[11px] mb-4">Best and worst trading days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,46,62,0.5)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#4d5566', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4d5566', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={55} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'P&L']} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {dayData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.9} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Asset type pie */}
        <div className="rounded-xl p-5" style={CARD_STYLE}>
          <h3 className="text-text-bright font-bold text-[14px] mb-1">Trades by Asset Type</h3>
          <p className="text-text-muted text-[11px] mb-4">Distribution of your trading activity</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={assetPie} dataKey="value" cx="50%" cy="50%" outerRadius={62} innerRadius={38} paddingAngle={3}>
                  {assetPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2.5 flex-1">
              {assetPie.map((a, i) => (
                <div key={a.name} className="flex items-center gap-2 text-[13px]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-text-dim">{a.name}</span>
                  <span className="text-text-bright font-semibold ml-auto">{a.value}</span>
                  <span className="text-[11px]" style={{ color: a.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {a.pnl >= 0 ? '+' : ''}${Math.abs(a.pnl).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Win rate by emotion */}
        <div className="rounded-xl p-5" style={CARD_STYLE}>
          <h3 className="text-text-bright font-bold text-[14px] mb-1">Win Rate by Emotion</h3>
          <p className="text-text-muted text-[11px] mb-4">How your mindset affects performance</p>
          {emotionData.length === 0 ? (
            <p className="text-text-muted text-sm">No emotion data yet — add emotions when logging trades.</p>
          ) : (
            <div className="space-y-3">
              {emotionData.map(e => (
                <div key={e.name} className="flex items-center gap-3">
                  <span className="text-[12px] text-text-dim w-24 truncate flex-shrink-0">{e.name}</span>
                  <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(37,46,62,0.8)' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${e.winRate}%`, background: e.winRate >= 50 ? '#22c55e' : '#ef4444' }}
                    />
                  </div>
                  <span className="text-[12px] font-bold w-10 text-right" style={{ color: e.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                    {e.winRate.toFixed(0)}%
                  </span>
                  <span className="text-text-muted text-[11px] w-6 text-right">{e.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Playbook performance */}
      <div className="rounded-xl p-5" style={CARD_STYLE}>
        <h3 className="text-text-bright font-bold text-[14px] mb-1">Performance by Playbook</h3>
        <p className="text-text-muted text-[11px] mb-4">Which setups are making you money</p>
        <div className="grid grid-cols-2 gap-3">
          {playbookData.map(p => (
            <div
              key={p.name}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.5)' }}
            >
              <div>
                <p className="text-text-bright text-[13px] font-semibold">{p.name}</p>
                <p className="text-text-muted text-[11px]">{p.count} trades · {p.winRate.toFixed(0)}% WR</p>
              </div>
              <span className="font-bold text-[14px] font-mono-num" style={{ color: p.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                {p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
