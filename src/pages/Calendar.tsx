import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { Trade } from '../types'

interface Props { trades: Trade[] }

type CalendarView = 'YEAR' | 'MONTH' | 'WEEK'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']

function fmtPnl(v: number) {
  return (v >= 0 ? '+' : '') + '$' + Math.abs(v).toFixed(2)
}

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
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  function monthStats(y: number, m: number) {
    const prefix = `${y}-${String(m+1).padStart(2,'0')}`
    const monthTrades = trades.filter(t => t.date.startsWith(prefix))
    return calcStats(monthTrades)
  }

  function calcStats(ts: Trade[]) {
    const netPnl = ts.reduce((s,t) => s+(t.netPnl||0),0)
    const grossPnl = ts.reduce((s,t) => s+(t.grossPnl||0),0)
    const fees = ts.reduce((s,t) => s+(t.fees||0),0)
    const points = ts.reduce((s,t) => s+(t.points||0),0)
    const wins = ts.filter(t=>t.result==='WIN').length
    const winRate = ts.length>0 ? (wins/ts.length)*100 : 0
    return { netPnl, grossPnl, fees, points, wins, count: ts.length, winRate }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year-1) }
    else setMonth(month-1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year+1) }
    else setMonth(month+1)
  }

  // Month view
  function renderMonth() {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month+1, 0).getDate()
    const stats = monthStats(year, month)
    const todayStr = today.toISOString().split('T')[0]

    const cells: JSX.Element[] = []
    // blanks
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`blank-${i}`} />)
    // days
    for (let d = 1; d <= daysInMonth; d++) {
      const key = getDayKey(year, month, d)
      const dayTrades = tradesByDate[key] || []
      const pnl = dayTrades.reduce((s,t) => s+(t.netPnl||0),0)
      const isToday = key === todayStr
      cells.push(
        <div key={d} className={`min-h-[80px] rounded-lg p-2 border transition-colors cursor-pointer hover:border-accent/40 ${
          isToday ? 'border-accent/60 bg-accent/5' : 'border-border/30 bg-surface/40 hover:bg-surface'
        }`}>
          <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-accent' : 'text-text-dim'}`}>{d}</div>
          {dayTrades.length > 0 && (
            <>
              <div className={`text-xs font-bold ${pnl >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                {fmtPnl(pnl)}
              </div>
              <div className="text-[10px] text-text-dim">{dayTrades.length} trade{dayTrades.length>1?'s':''}</div>
            </>
          )}
        </div>
      )
    }

    return (
      <div>
        {/* Stats row */}
        <div className="grid grid-cols-6 gap-px bg-border rounded-xl overflow-hidden mb-5">
          {[
            { label:'NET P&L', value: fmtPnl(stats.netPnl), cls: stats.netPnl>=0?'stat-positive':'stat-negative' },
            { label:'GROSS P&L', value: fmtPnl(stats.grossPnl), cls: stats.grossPnl>=0?'stat-positive':'stat-negative' },
            { label:'FEES', value: `-$${stats.fees.toFixed(2)}`, cls: 'stat-negative' },
            { label:'POINTS', value: (stats.points>=0?'+':'')+stats.points.toFixed(2), cls: stats.points>=0?'stat-positive':'stat-negative' },
            { label:'TRADES', value: stats.count.toString(), cls: 'text-white' },
            { label:'WIN RATE', value: stats.winRate.toFixed(0)+'%', cls: stats.winRate>=50?'stat-positive':'stat-negative' },
          ].map(s => (
            <div key={s.label} className="bg-surface px-4 py-3 text-center">
              <p className="text-text-dim text-[10px] font-semibold uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`font-bold text-base ${s.cls}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-text-dim uppercase tracking-widest py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    )
  }

  // Year view
  function renderYear() {
    return (
      <div className="grid grid-cols-4 gap-4">
        {MONTHS.map((m, mi) => {
          const s = monthStats(year, mi)
          const isCurrentMonth = mi === today.getMonth() && year === today.getFullYear()
          return (
            <div
              key={m}
              onClick={() => { setMonth(mi); setView('MONTH') }}
              className={`bg-surface border rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-colors ${
                isCurrentMonth ? 'border-accent/50' : 'border-border'
              }`}
            >
              <p className={`text-sm font-semibold mb-2 ${isCurrentMonth ? 'text-accent' : 'text-white'}`}>{m}</p>
              <p className={`text-base font-bold ${s.netPnl>=0?'stat-positive':'stat-negative'}`}>{fmtPnl(s.netPnl)}</p>
              <p className="text-text-dim text-xs mt-1">{s.count} trades · {s.winRate.toFixed(0)}% WR</p>
            </div>
          )
        })}
      </div>
    )
  }

  // Week view
  function renderWeek() {
    const d = new Date(year, month)
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
          const pnl = dayTrades.reduce((s,t)=>s+(t.netPnl||0),0)
          const isToday = key === today.toISOString().split('T')[0]
          return (
            <div key={key} className={`min-h-48 rounded-xl p-3 border ${isToday?'border-accent/50 bg-accent/5':'border-border bg-surface'}`}>
              <div className={`text-xs font-semibold mb-1 ${isToday?'text-accent':'text-text-dim'}`}>
                {DAYS[day.getDay()]} {day.getDate()}
              </div>
              {dayTrades.length > 0 ? (
                <>
                  <div className={`text-sm font-bold ${pnl>=0?'stat-positive':'stat-negative'}`}>{fmtPnl(pnl)}</div>
                  {dayTrades.map(t => (
                    <div key={t.id} className="mt-2 p-2 bg-surface-2 rounded-lg text-xs">
                      <span className="text-white font-medium">{t.symbol}</span>
                      <span className={`ml-2 ${(t.netPnl||0)>=0?'stat-positive':'stat-negative'}`}>{fmtPnl(t.netPnl||0)}</span>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-text-dim text-xs mt-2">No trades</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      {/* View tabs + nav */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-2 border border-border rounded-xl p-1 gap-1">
            {(['YEAR','MONTH','WEEK'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view===v ? 'bg-accent text-black' : 'text-text-dim hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {view !== 'YEAR' && (
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-text-dim hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-white font-semibold min-w-32 text-center">
                {MONTHS[month]} {year}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-text-dim hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          {view === 'YEAR' && (
            <div className="flex items-center gap-2">
              <button onClick={() => setYear(year-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-text-dim hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-white font-semibold">{year}</span>
              <button onClick={() => setYear(year+1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-text-dim hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {view !== 'YEAR' && (
            <button onClick={() => setView('YEAR')} className="px-3 py-1.5 text-sm text-text-dim hover:text-white border border-border bg-surface-2 rounded-lg transition-colors">
              Back to Year
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-dim hover:text-white border border-border bg-surface-2 rounded-lg transition-colors">
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>

      {view === 'MONTH' && renderMonth()}
      {view === 'YEAR' && renderYear()}
      {view === 'WEEK' && renderWeek()}
    </div>
  )
}
