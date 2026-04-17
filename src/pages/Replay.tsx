import { Play, Clock, SkipBack, SkipForward } from 'lucide-react'
import { Trade } from '../types'

interface Props { trades: Trade[] }

export default function ReplayPage({ trades }: Props) {
  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-1">Session Replay</h2>
      <p className="text-text-dim text-sm mb-6">Replay your trading sessions trade by trade</p>

      {trades.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-6">
            <Play size={36} className="text-accent"/>
          </div>
          <h3 className="text-white font-semibold text-xl mb-2">No trades to replay</h3>
          <p className="text-text-dim text-sm max-w-sm">Add trades to your journal and then replay your sessions to review your decision-making process.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Player controls */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <button className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-dim hover:text-white transition-colors">
                <SkipBack size={16}/>
              </button>
              <button className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-black hover:bg-accent-dim transition-colors">
                <Play size={18}/>
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-dim hover:text-white transition-colors">
                <SkipForward size={16}/>
              </button>
              <div className="flex items-center gap-2 text-text-dim text-sm">
                <Clock size={14}/>
                <span>Speed: 1x</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-surface-2 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{width:'0%'}}/>
            </div>
          </div>

          {/* Trade list for replay */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-white font-semibold">Trades</h3>
            </div>
            <div className="divide-y divide-border">
              {trades.slice(0,10).map((trade,i) => (
                <div key={trade.id} className={`px-5 py-3 flex items-center gap-4 cursor-pointer hover:bg-surface-2 transition-colors ${i===0?'bg-accent/5':''}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'bg-accent text-black':'bg-surface-2 text-text-dim'}`}>
                    {i+1}
                  </span>
                  <span className="text-white font-medium">{trade.symbol||'—'}</span>
                  <span className="text-text-dim text-xs">{trade.time}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${trade.side==='LONG'?'bg-accent/15 text-accent':'bg-danger/15 text-danger'}`}>{trade.side}</span>
                  <span className={`ml-auto font-semibold text-sm ${(trade.netPnl||0)>=0?'stat-positive':'stat-negative'}`}>
                    {(trade.netPnl||0)>=0?'+':''}{(trade.netPnl||0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
