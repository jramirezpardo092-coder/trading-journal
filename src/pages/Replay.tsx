import { useState } from 'react'
import { Play, Pause, Clock, SkipBack, SkipForward, ChevronRight } from 'lucide-react'
import { Trade } from '../types'

interface Props { trades: Trade[] }

const CARD = { background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }

export default function ReplayPage({ trades }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speed, setSpeed] = useState(1)

  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 20)
  const progress = sorted.length > 0 ? (currentIndex / (sorted.length - 1)) * 100 : 0
  const currentTrade = sorted[currentIndex]

  function handleBack() { setCurrentIndex(i => Math.max(0, i - 1)) }
  function handleForward() { setCurrentIndex(i => Math.min(sorted.length - 1, i + 1)) }
  function cycleSpeed() { setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1) }

  if (trades.length === 0) {
    return (
      <div className="page-enter">
        <h2 className="text-text-bright text-[22px] font-bold mb-1">Session Replay</h2>
        <p className="text-text-muted text-[12px] mb-6">Replay your trading sessions trade by trade</p>
        <div className="rounded-xl p-16 flex flex-col items-center text-center" style={CARD}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <Play size={32} className="text-accent ml-1" />
          </div>
          <h3 className="text-text-bright font-bold text-[17px] mb-2">No trades to replay</h3>
          <p className="text-text-muted text-[13px] max-w-sm">
            Add trades to your journal to replay your sessions and review your decision-making process.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-text-bright text-[22px] font-bold">Session Replay</h2>
          <p className="text-text-muted text-[12px] mt-0.5">Review trades one by one to analyze your decisions</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Main replay area */}
        <div className="space-y-4">
          {/* Current trade card */}
          {currentTrade && (
            <div className="rounded-xl p-5" style={CARD}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-text-muted text-[11px] font-bold uppercase tracking-widest">Trade #{currentIndex + 1}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={currentTrade.result === 'WIN'
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                        : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                      {currentTrade.result}
                    </span>
                  </div>
                  <h3 className="text-text-bright text-[24px] font-bold">{currentTrade.symbol}</h3>
                  <p className="text-text-muted text-[12px]">{currentTrade.date} · {currentTrade.assetType}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[28px] font-mono-num"
                    style={{ color: (currentTrade.netPnl || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                    {(currentTrade.netPnl || 0) >= 0 ? '+' : '-'}${Math.abs(currentTrade.netPnl || 0).toFixed(2)}
                  </p>
                  <p className="text-text-muted text-[12px]">Net P&L</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Side', value: currentTrade.side, color: currentTrade.side === 'LONG' ? '#22c55e' : '#ef4444' },
                  { label: 'Points', value: `${(currentTrade.points || 0) >= 0 ? '+' : ''}${(currentTrade.points || 0).toFixed(2)}`, color: (currentTrade.points || 0) >= 0 ? '#22c55e' : '#ef4444' },
                  { label: 'Emotion', value: currentTrade.emotion || '—', color: '#8b949e' },
                  { label: 'Playbook', value: currentTrade.playbook || '—', color: '#8b949e' },
                ].map(item => (
                  <div key={item.label} className="rounded-lg p-3"
                    style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.5)' }}>
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-[14px]" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {currentTrade.notes && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(22,29,43,0.5)', border: '1px solid rgba(37,46,62,0.4)' }}>
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-text-dim text-[13px] leading-relaxed">{currentTrade.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Player controls */}
          <div className="rounded-xl p-5" style={CARD}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={handleBack}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-text-bright transition-colors"
                  style={{ background: 'rgba(22,29,43,0.8)', border: '1px solid rgba(37,46,62,0.8)' }}>
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-black transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 16px rgba(34,197,94,0.3)' }}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
                <button onClick={handleForward}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-text-bright transition-colors"
                  style={{ background: 'rgba(22,29,43,0.8)', border: '1px solid rgba(37,46,62,0.8)' }}>
                  <SkipForward size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={cycleSpeed}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-text-dim hover:text-text-bright transition-colors"
                  style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}>
                  <Clock size={12} /> {speed}x speed
                </button>
                <span className="text-text-muted text-[12px]">
                  {currentIndex + 1} / {sorted.length}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="w-full rounded-full h-2 cursor-pointer relative"
              style={{ background: 'rgba(37,46,62,0.8)' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width
                setCurrentIndex(Math.round(x * (sorted.length - 1)))
              }}
            >
              <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent border-2 border-bg transition-all"
                style={{ left: `calc(${progress}% - 7px)`, boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
            </div>
          </div>
        </div>

        {/* Right: Trade list */}
        <div className="rounded-xl overflow-hidden" style={CARD}>
          <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(37,46,62,0.5)' }}>
            <h3 className="text-text-bright font-bold text-[14px]">Trade List</h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            {sorted.map((trade, i) => (
              <button
                key={trade.id}
                onClick={() => setCurrentIndex(i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left trade-row transition-all"
                style={{
                  borderBottom: i < sorted.length - 1 ? '1px solid rgba(37,46,62,0.3)' : 'none',
                  background: i === currentIndex ? 'rgba(34,197,94,0.05)' : 'transparent',
                  borderLeft: i === currentIndex ? '2px solid #22c55e' : '2px solid transparent',
                }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={i === currentIndex
                    ? { background: '#22c55e', color: '#000' }
                    : { background: 'rgba(37,46,62,0.8)', color: '#6b7588' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-text-bright text-[13px] font-semibold">{trade.symbol}</p>
                  <p className="text-text-muted text-[11px]">{trade.date}</p>
                </div>
                <span className="font-bold text-[12px] font-mono-num flex-shrink-0"
                  style={{ color: (trade.netPnl || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                  {(trade.netPnl || 0) >= 0 ? '+' : ''}${Math.abs(trade.netPnl || 0).toFixed(0)}
                </span>
                {i === currentIndex && <ChevronRight size={12} className="text-accent flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
