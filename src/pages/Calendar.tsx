import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { Trade } from '../types'

interface Props { trades: Trade[] }
type CalendarView = 'YEAR' | 'MONTH' | 'WEEK'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function fmtPnl(v: number) { return (v >= 0 ? '+' : '') + '$' + Math.abs(v).toFixed(0) }

export default function CalendarPage({ trades }: Props) {
  const today = new Date()
  const [view, setView] = useState<CalendarView>('MONTH')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const tradesByDate = useMemo(() => {
    const map: Record<string, Trade[]> = {}
    trades.forEach(t => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    return map
  }, [trades])

  function getDayKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function calcStats(ts: Trade[]) {
    const netPnl = ts.reduce((s, t) => s + (t.netPnl || 0), 0)
    const grossPnl = ts.reduce((s, t) => s + (t.grossPnl || 0), 0)
    const fees = ts.reduce((s, t) => s + (t.fees || 0), 0)
    const points = ts.reduce((s, t) => s + (t.points || 0), 0)
    const wins = ts.filter(t => t.result === 'WIN').length
    const winRate = ts.length > 0 ? (wins / ts.length) * 100 : 0
    return { netPnl, grossPnl, fees, points, wins, count: ts.length, winRate }
  }

  function monthStats(y: number, m: number) {
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}`
    return calcStats(trades.filter(t => t.date.startsWith(prefix)))
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }

  const CARD = { background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }
  const todayStr = today.toISOString().split('T')[0]

  function renderMonth() {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const stats = monthStats(year, month)

    return (
      <div>
        {/* Stats bar */}
        <div className="grid grid-cols-6 rounded-xl overflow-hidden mb-5" style={{ border: '1px solid rgba(37,46,62,0.8)' }}>
          {[
            { label: 'NET P&L',   value: fmtPnl(stats.netPnl),   color: stats.netPnl >= 0 ? '#22c55e' : '#ef4444' },
            { label: 'GROSS P&L', value: fmtPnl(stats.grossPnl), color: stats.grossPnl >= 0 ? '#22c55e' : '#ef4444' },
            { label: 'FEES',      value: `-$${stats.fees.toFixed(2)}`, color: '#ef4444' },
            { label: 'POINTS',    value: (stats.points >= 0 ? '+' : '') + stats.points.toFixed(1), color: stats.points >= 0 ? '#22c55e' : '#ef4444' },
            { label: 'TRADES',    value: stats.count.toString(),  color: '#f0f6fc' },
            { label: 'WIN RATE',  value: stats.winRate.toFixed(0) + '%', color: stats.winRate >= 50 ? '#22c55e' : '#ef4444' },
          ].map((s, i) => (
            <div key={s.label} className="px-4 py-3 text-center"
              style={{ background: 'rgba(15,22,33,0.9)', borderRight: i < 5 ? '1px solid rgba(37,46,62,0.5)' : 'none' }}>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
              <p className="font-extrabold text-[15px] font-mono-num" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-text-muted uppercase tracking-widest py-1.5">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            const key = getDayKey(year, month, d)
            const dayTrades = tradesByDate[key] || []
            const pnl = dayTrades.reduce((s, t) => s + (t.netPnl || 0), 0)
            const isToday = key === todayStr
            const hasWin = pnl > 0
            const hasLoss = pnl < 0

            return (
              <div
                key={d}
                className="min-h-[72px] rounded-xl p-2 cursor-pointer transition-all"
                style={{
                  background: isToday
                    ? 'rgba(34,197,94,0.06)'
                    : dayTrades.length > 0 ? 'rgba(22,29,43,0.7)' : 'rgba(15,22,33,0.5)',
                  border: isToday
                    ? '1px solid rgba(34,197,94,0.3)'
                    : dayTrades.length > 0 ? '1px solid rgba(37,46,62,0.8)' : '1px solid rgba(37,46,62,0.3)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[12px] font-bold"
                    style={{ color: isToday ? '#22c55e' : '#6b7588' }}
                  >
                    {d}
                  </span>
                  {dayTrades.length > 0 && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: hasWin ? '#22c55e' : hasLoss ? '#ef4444' : '#4d5566' }}
                    />
                  )}
                </div>
                {dayTrades.length > 0 && (
                  <>
                    <div className="font-bold text-[12px] font-mono-num" style={{ color: hasWin ? '#22c55e' : '#ef4444' }}>
                      {fmtPnl(pnl)}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{dayTrades.length}t</div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderYear() {
    return (
      <div className="grid grid-cols-4 gap-3">
        {MONTHS.map((m, mi) => {
          const s = monthStats(year, mi)
          const isCurrent = mi === today.getMonth() && year === today.getFullYear()
          return (
            <div
              key={m}
              onClick={() => { setMonth(mi); setView('MONTH') }}
              className="card-hover rounded-xl p-4 cursor-pointer"
              style={{
                background: isCurrent ? 'rgba(34,197,94,0.05)' : 'rgba(15,22,33,0.9)',
                border: isCurrent ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(37,46,62,0.8)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-xl"
                style={isCurrent ? { background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)' } : {}} />
              <p className="font-bold text-[13px] mb-2" style={{ color: isCurrent ? '#22c55e' : '#8b949e' }}>{m}</p>
              {s.count > 0 ? (
                <>
                  <p className="font-extrabold text-[18px] font-mono-num" style={{ color: s.netPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {fmtPnl(s.netPnl)}
                  </p>
                  <p className="text-text-muted text-[11px] mt-1">{s.count} trades · {s.winRate.toFixed(0)}% WR</p>
                </>
              ) : (
                <p className="text-text-muted text-[13px]">No trades</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  function renderWeek() {
    const d = new Date(year, month, 1)
    const startOfWeek = new Date(d)
    startOfWeek.setDate(d.getDate() - d.getDay())
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const key = day.toISOString().split('T')[0]
          const dayTrades = tradesByDate[key] || []
          const pnl = dayTrades.reduce((s, t) => s + (t.netPnl || 0), 0)
          const isToday = key === todayStr

          return (
            <div
              key={key}
              className="min-h-48 rounded-xl p-3"
              style={{
                background: isToday ? 'rgba(34,197,94,0.04)' : 'rgba(15,22,33,0.9)',
                border: isToday ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(37,46,62,0.8)',
              }}
            >
              <div className="font-bold text-[12px] mb-2" style={{ color: isToday ? '#22c55e' : '#8b949e' }}>
                {DAYS[day.getDay()]} {day.getDate()}
              </div>
              {dayTrades.length > 0 ? (
                <>
                  <p className="font-bold text-[14px] font-mono-num mb-2" style={{ color: pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {fmtPnl(pnl)}
                  </p>
                  {dayTrades.map(t => (
                    <div
                      key={t.id}
                      className="mt-1.5 p-2 rounded-lg text-[12px]"
                      style={{ background: 'rgba(22,29,43,0.8)', border: '1px solid rgba(37,46,62,0.5)' }}
                    >
                      <span className="text-text-bright font-semibold">{t.symbol}</span>
                      <span className="ml-2 font-bold" style={{ color: (t.netPnl || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                        {fmtPnl(t.netPnl || 0)}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-text-muted text-[12px]">No trades</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const navBtnCls = 'w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-bright transition-colors'
  const navBtnStyle = { background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }

  return (
    <div className="page-enter">
      {/* Controls */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div
            className="flex rounded-lg overflow-hidden p-0.5"
            style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
          >
            {(['YEAR', 'MONTH', 'WEEK'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all"
                style={view === v
                  ? { background: '#22c55e', color: '#000' }
                  : { color: '#6b7588' }
                }
              >
                {v}
              </button>
            ))}
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={view === 'YEAR' ? () => setYear(year - 1) : prevMonth}
              className={navBtnCls}
              style={navBtnStyle}
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-text-bright font-bold text-[14px] min-w-[140px] text-center">
              {view === 'YEAR' ? year : `${MONTHS[month]} ${year}`}
            </span>
            <button
              onClick={view === 'YEAR' ? () => setYear(year + 1) : nextMonth}
              className={navBtnCls}
              style={navBtnStyle}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view !== 'YEAR' && (
            <button
              onClick={() => setView('YEAR')}
              className="px-3 py-1.5 text-[12px] font-medium text-text-dim hover:text-text-bright transition-colors rounded-lg"
              style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
            >
              Year View
            </button>
          )}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-text-dim hover:text-text-bright transition-colors rounded-lg"
            style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
          >
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      {view === 'MONTH' && renderMonth()}
      {view === 'YEAR'  && renderYear()}
      {view === 'WEEK'  && renderWeek()}
    </div>
  )
}
