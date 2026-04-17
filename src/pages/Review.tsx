import { useMemo } from 'react'
import { Trade } from '../types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props { trades: Trade[] }

type ReviewPeriod = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'

function startOf(period: ReviewPeriod): string {
  const now = new Date()
  if (period === 'WEEK') {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay())
    return d.toISOString().split('T')[0]
  }
  if (period === 'MONTH') return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
  if (period === 'QUARTER') {
    const q = Math.floor(now.getMonth()/3)
    return `${now.getFullYear()}-${String(q*3+1).padStart(2,'0')}-01`
  }
  return `${now.getFullYear()}-01-01`
}

import { useState } from 'react'

export default function ReviewPage({ trades }: Props) {
  const [period, setPeriod] = useState<ReviewPeriod>('WEEK')

  const filtered = useMemo(() => {
    const from = startOf(period)
    return trades.filter(t => t.date >= from).sort((a,b)=>a.date.localeCompare(b.date))
  }, [trades, period])

  const stats = useMemo(() => {
    const netPnl = filtered.reduce((s,t)=>s+(t.netPnl||0),0)
    const grossPnl = filtered.reduce((s,t)=>s+(t.grossPnl||0),0)
    const fees = filtered.reduce((s,t)=>s+(t.fees||0),0)
    const wins = filtered.filter(t=>t.result==='WIN').length
    const losses = filtered.filter(t=>t.result==='LOSS').length
    const winRate = filtered.length>0?(wins/filtered.length)*100:0
    const avgWin = wins>0?filtered.filter(t=>t.result==='WIN').reduce((s,t)=>s+(t.netPnl||0),0)/wins:0
    const avgLoss = losses>0?Math.abs(filtered.filter(t=>t.result==='LOSS').reduce((s,t)=>s+(t.netPnl||0),0)/losses):0
    const pf = avgLoss>0?(avgWin*wins)/(avgLoss*losses):0

    // Equity
    let cum = 0
    const equity = filtered.map(t => {
      cum += t.netPnl||0
      return {date:t.date, equity:parseFloat(cum.toFixed(2))}
    })

    // By playbook
    const byPlaybook: Record<string,{wins:number,total:number,pnl:number}> = {}
    filtered.forEach(t => {
      const pb = t.playbook||'No Playbook'
      if (!byPlaybook[pb]) byPlaybook[pb] = {wins:0,total:0,pnl:0}
      byPlaybook[pb].total++
      byPlaybook[pb].pnl += t.netPnl||0
      if (t.result==='WIN') byPlaybook[pb].wins++
    })

    return { netPnl, grossPnl, fees, wins, losses, winRate, avgWin, avgLoss, pf, equity, byPlaybook }
  }, [filtered])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white text-2xl font-bold">Performance Review</h2>
        <div className="flex bg-surface-2 border border-border rounded-xl p-1 gap-1">
          {(['WEEK','MONTH','QUARTER','YEAR'] as ReviewPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${period===p?'bg-accent text-black':'text-text-dim hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center text-center">
          <h3 className="text-white font-semibold text-lg mb-2">No trades in this period</h3>
          <p className="text-text-dim text-sm">Try selecting a different time range</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label:'Net P&L', value:`${stats.netPnl>=0?'+':''}$${Math.abs(stats.netPnl).toFixed(2)}`, pos:stats.netPnl>=0 },
              { label:'Win Rate', value:`${stats.winRate.toFixed(1)}%`, pos:stats.winRate>=50 },
              { label:'Profit Factor', value:stats.pf.toFixed(2), pos:stats.pf>=1 },
              { label:'Total Trades', value:filtered.length.toString(), pos:true },
            ].map(c=>(
              <div key={c.label} className="bg-surface border border-border rounded-xl p-4 text-center">
                <p className="text-text-dim text-[11px] font-semibold uppercase tracking-widest mb-2">{c.label}</p>
                <p className={`text-2xl font-bold ${c.pos?'stat-positive':'stat-negative'}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Equity */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Cumulative P&L</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={stats.equity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d"/>
                  <XAxis dataKey="date" tick={{fill:'#8b949e',fontSize:10}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fill:'#8b949e',fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}`}/>
                  <Tooltip contentStyle={{background:'#161b22',border:'1px solid #30363d',borderRadius:8,fontSize:12}} formatter={(v:any)=>[`$${Number(v).toFixed(2)}`,'P&L']}/>
                  <Line type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* By playbook */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Performance by Playbook</h3>
              <div className="space-y-3">
                {Object.entries(stats.byPlaybook).map(([name,v]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{name}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-text-dim">{v.total} trades</span>
                        <span className={v.pnl>=0?'stat-positive':'stat-negative'}>
                          {v.pnl>=0?'+':''}${v.pnl.toFixed(2)}
                        </span>
                        <span className={v.total>0&&(v.wins/v.total)>=0.5?'stat-positive':'stat-negative'}>
                          {v.total>0?((v.wins/v.total)*100).toFixed(0):0}% WR
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-2 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${v.total>0&&(v.wins/v.total)>=0.5?'bg-accent':'bg-danger'}`}
                        style={{width:`${v.total>0?(v.wins/v.total)*100:0}%`}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trade summary */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-white font-semibold">Trades This {period.charAt(0)+period.slice(1).toLowerCase()}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-dim uppercase tracking-widest">Date</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-dim uppercase tracking-widest">Symbol</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-text-dim uppercase tracking-widest">Playbook</th>
                    <th className="px-4 py-2 text-right text-[11px] font-semibold text-text-dim uppercase tracking-widest">Net P&L</th>
                    <th className="px-4 py-2 text-center text-[11px] font-semibold text-text-dim uppercase tracking-widest">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-b border-border/40 hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-2 text-text-dim text-xs">{t.date}</td>
                      <td className="px-4 py-2 text-white font-medium">{t.symbol||'—'}</td>
                      <td className="px-4 py-2 text-text-dim text-xs">{t.playbook||'—'}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${(t.netPnl||0)>=0?'stat-positive':'stat-negative'}`}>
                        {(t.netPnl||0)>=0?'+':''}${Math.abs(t.netPnl||0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.result==='WIN'?'bg-accent/15 text-accent':t.result==='LOSS'?'bg-danger/15 text-danger':'bg-surface-2 text-text-dim'}`}>
                          {t.result||'—'}
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
