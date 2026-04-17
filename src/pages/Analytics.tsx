import { useMemo } from 'react'
import { Trade } from '../types'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts'

interface Props { trades: Trade[] }

const COLORS = ['#22c55e','#ef4444','#f59e0b','#3b82f6','#8b5cf6','#ec4899']

export default function AnalyticsPage({ trades }: Props) {
  const stats = useMemo(() => {
    if (!trades.length) return null

    const wins = trades.filter(t=>t.result==='WIN')
    const losses = trades.filter(t=>t.result==='LOSS')
    const winRate = (wins.length/trades.length)*100
    const avgWin = wins.length ? wins.reduce((s,t)=>s+(t.netPnl||0),0)/wins.length : 0
    const avgLoss = losses.length ? Math.abs(losses.reduce((s,t)=>s+(t.netPnl||0),0)/losses.length) : 0
    const profitFactor = avgLoss>0 ? (avgWin*wins.length)/(avgLoss*losses.length) : 0
    const totalFees = trades.reduce((s,t)=>s+(t.fees||0),0)

    // By asset type
    const byAsset: Record<string,{count:number,pnl:number}> = {}
    trades.forEach(t => {
      if (!byAsset[t.assetType]) byAsset[t.assetType] = {count:0,pnl:0}
      byAsset[t.assetType].count++
      byAsset[t.assetType].pnl += t.netPnl||0
    })

    // By emotion
    const byEmotion: Record<string,{wins:number,total:number}> = {}
    trades.forEach(t => {
      const em = t.emotion || 'None'
      if (!byEmotion[em]) byEmotion[em] = {wins:0,total:0}
      byEmotion[em].total++
      if (t.result==='WIN') byEmotion[em].wins++
    })

    // By day of week
    const byDay: Record<number,{pnl:number,count:number}> = {0:{pnl:0,count:0},1:{pnl:0,count:0},2:{pnl:0,count:0},3:{pnl:0,count:0},4:{pnl:0,count:0},5:{pnl:0,count:0},6:{pnl:0,count:0}}
    trades.forEach(t => {
      const d = new Date(t.date).getDay()
      byDay[d].pnl += t.netPnl||0
      byDay[d].count++
    })

    // Monthly P&L
    const byMonth: Record<string,number> = {}
    trades.forEach(t => {
      const m = t.date.slice(0,7)
      byMonth[m] = (byMonth[m]||0) + (t.netPnl||0)
    })

    return { wins, losses, winRate, avgWin, avgLoss, profitFactor, totalFees, byAsset, byEmotion, byDay, byMonth }
  }, [trades])

  if (!trades.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">No trades yet</h2>
        <p className="text-text-dim text-sm">Add trades to see detailed analytics, charts, and performance breakdowns.</p>
      </div>
    )
  }

  const { wins, losses, winRate, avgWin, avgLoss, profitFactor, totalFees, byAsset, byEmotion, byDay, byMonth } = stats!

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const dayData = Object.entries(byDay).map(([d,v]) => ({
    day: dayNames[parseInt(d)], pnl: parseFloat(v.pnl.toFixed(2)), count: v.count
  }))

  const monthData = Object.entries(byMonth).sort().map(([m,pnl]) => ({
    month: m, pnl: parseFloat(pnl.toFixed(2))
  }))

  const emotionData = Object.entries(byEmotion).map(([em,v]) => ({
    name: em, winRate: v.total>0?(v.wins/v.total)*100 : 0, count: v.total
  })).sort((a,b)=>b.winRate-a.winRate)

  const assetPie = Object.entries(byAsset).map(([name,v]) => ({ name, value: v.count, pnl: v.pnl }))

  const tooltipStyle = { background:'#161b22', border:'1px solid #30363d', borderRadius:8, fontSize:12 }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label:'Win Rate', value:`${winRate.toFixed(1)}%` , sub:`${wins.length}W / ${losses.length}L`, pos: winRate>=50 },
          { label:'Avg Win', value:`$${avgWin.toFixed(2)}`, sub:'per winning trade', pos: true },
          { label:'Avg Loss', value:`$${avgLoss.toFixed(2)}`, sub:'per losing trade', pos: false },
          { label:'Profit Factor', value:profitFactor.toFixed(2), sub: profitFactor>=1?'Positive edge':'Needs work', pos: profitFactor>=1 },
          { label:'Total Fees', value:`$${totalFees.toFixed(2)}`, sub:'commissions + fees', pos: false },
        ].map(c => (
          <div key={c.label} className="bg-surface border border-border rounded-xl p-4">
            <p className="text-text-dim text-[11px] font-semibold uppercase tracking-widest mb-2">{c.label}</p>
            <p className={`text-xl font-bold ${c.pos?'stat-positive':'stat-negative'}`}>{c.value}</p>
            <p className="text-text-dim text-xs mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Monthly P&L */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Monthly P&L</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="month" tick={{fill:'#8b949e',fontSize:11}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill:'#8b949e',fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>[`$${Number(v).toFixed(2)}`,'P&L']} />
              <Bar dataKey="pnl" radius={[4,4,0,0]}>
                {monthData.map((m,i) => (
                  <Cell key={i} fill={m.pnl>=0?'#22c55e':'#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* P&L by Day of Week */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">P&L by Day of Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="day" tick={{fill:'#8b949e',fontSize:11}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill:'#8b949e',fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>[`$${Number(v).toFixed(2)}`,'P&L']} />
              <Bar dataKey="pnl" radius={[4,4,0,0]}>
                {dayData.map((d,i) => (
                  <Cell key={i} fill={d.pnl>=0?'#22c55e':'#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset type breakdown */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Trades by Asset Type</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={assetPie} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                  {assetPie.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {assetPie.map((a,i) => (
                <div key={a.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}} />
                  <span className="text-text-dim">{a.name}</span>
                  <span className="text-white font-medium ml-auto pl-4">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Win rate by emotion */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Win Rate by Emotion</h3>
          {emotionData.length === 0 ? (
            <p className="text-text-dim text-sm">No emotion data yet</p>
          ) : (
            <div className="space-y-2">
              {emotionData.map(e => (
                <div key={e.name} className="flex items-center gap-3">
                  <span className="text-sm text-text-dim w-24 truncate">{e.name}</span>
                  <div className="flex-1 bg-surface-2 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${e.winRate>=50?'bg-accent':'bg-danger'}`}
                      style={{width:`${e.winRate}%`}}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${e.winRate>=50?'stat-positive':'stat-negative'}`}>
                    {e.winRate.toFixed(0)}%
                  </span>
                  <span className="text-text-dim text-xs w-8 text-right">{e.count}t</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
