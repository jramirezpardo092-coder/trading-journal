import { useState } from 'react'
import { ChevronLeft, ChevronRight, Save, Moon, Sun, Wind } from 'lucide-react'
import { JournalEntry, Trade } from '../types'

interface Props {
  journalEntries: JournalEntry[]
  trades: Trade[]
  onSaveEntry: (entry: JournalEntry) => void
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

const MOODS = [
  { value: 1, emoji: '😞', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
]

const MARKET_CONDITIONS = ['Trending Up', 'Trending Down', 'Ranging', 'Volatile', 'Choppy', 'News-Driven', 'Gap & Go', 'Reversal Day']

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const CARD = { background: 'rgba(15,22,33,0.9)', border: '1px solid rgba(37,46,62,0.8)' }

export default function JournalPage({ journalEntries, trades, onSaveEntry }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0])

  const entry = journalEntries.find(e => e.date === selectedDate) || { date: selectedDate }
  const [mood, setMood] = useState<number | undefined>(entry.mood)
  const [sleep, setSleep] = useState(entry.sleep?.toString() || '')
  const [marketConditions, setMarketConditions] = useState(entry.marketConditions || '')
  const [notes, setNotes] = useState(entry.notes || '')
  const [saved, setSaved] = useState(false)

  function selectDate(date: string) {
    handleSave()
    setSelectedDate(date)
    const e = journalEntries.find(j => j.date === date) || { date }
    setMood(e.mood)
    setSleep(e.sleep?.toString() || '')
    setMarketConditions(e.marketConditions || '')
    setNotes(e.notes || '')
    setSaved(false)
  }

  function handleSave() {
    onSaveEntry({
      date: selectedDate,
      mood,
      sleep: sleep ? parseFloat(sleep) : undefined,
      marketConditions: marketConditions || undefined,
      notes: notes || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().split('T')[0]
  const dayTrades = trades.filter(t => t.date === selectedDate)
  const dayPnl = dayTrades.reduce((s, t) => s + (t.netPnl || 0), 0)

  return (
    <div className="grid grid-cols-[280px_1fr] gap-5 page-enter" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* LEFT: Calendar + day trades */}
      <div className="space-y-4">
        {/* Mini calendar */}
        <div className="rounded-xl p-4" style={CARD}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-bright transition-colors"
              style={{ background: 'rgba(22,29,43,0.6)' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-text-bright font-bold text-[13px]">{MONTHS[month]} {year}</span>
            <button
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-bright transition-colors"
              style={{ background: 'rgba(22,29,43,0.6)' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {SHORT_DAYS.map(d => <div key={d} className="text-center text-[9px] font-bold text-text-muted py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }, (_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1
              const key = isoDate(year, month, d)
              const isSelected = key === selectedDate
              const isToday = key === todayStr
              const hasTrades = trades.some(t => t.date === key)
              const hasEntry = journalEntries.some(e => e.date === key)
              const dayPnlQuick = trades.filter(t => t.date === key).reduce((s, t) => s + (t.netPnl || 0), 0)

              return (
                <button
                  key={d}
                  onClick={() => selectDate(key)}
                  className="w-full aspect-square rounded-lg text-[11px] font-semibold transition-all relative flex items-center justify-center"
                  style={
                    isSelected
                      ? { background: '#22c55e', color: '#000' }
                      : isToday
                        ? { border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', background: 'transparent' }
                        : { color: '#6b7588', background: 'transparent' }
                  }
                >
                  {d}
                  {(hasTrades || hasEntry) && !isSelected && (
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: hasTrades ? (dayPnlQuick >= 0 ? '#22c55e' : '#ef4444') : '#4d5566' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Trades on selected date */}
        <div className="rounded-xl p-4" style={CARD}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Trades · {selectedDate.slice(5).replace('-', '/')}
            </p>
            {dayTrades.length > 0 && (
              <span className="font-bold text-[12px] font-mono-num" style={{ color: dayPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                {dayPnl >= 0 ? '+' : ''}${Math.abs(dayPnl).toFixed(2)}
              </span>
            )}
          </div>
          {dayTrades.length === 0 ? (
            <p className="text-text-muted text-[12px]">No trades on this day.</p>
          ) : (
            <div className="space-y-1.5">
              {dayTrades.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: 'rgba(22,29,43,0.5)', border: '1px solid rgba(37,46,62,0.4)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: t.result === 'WIN' ? '#22c55e' : t.result === 'LOSS' ? '#ef4444' : '#4d5566' }}
                    />
                    <span className="text-text-bright text-[13px] font-semibold">{t.symbol}</span>
                  </div>
                  <span className="font-bold text-[12px] font-mono-num" style={{ color: (t.netPnl || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                    {(t.netPnl || 0) >= 0 ? '+' : ''}${Math.abs(t.netPnl || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Journal entry */}
      <div className="rounded-xl p-6 flex flex-col" style={CARD}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-text-bright font-bold text-[16px]">{formatDisplayDate(selectedDate)}</h3>
            {dayTrades.length > 0 && (
              <p className="text-text-muted text-[12px] mt-0.5">
                {dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''} ·{' '}
                <span style={{ color: dayPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                  {dayPnl >= 0 ? '+' : ''}${Math.abs(dayPnl).toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {/* Mood */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.5)' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Sun size={12} className="text-text-muted" />
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Mood</p>
            </div>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? undefined : m.value)}
                  title={m.label}
                  className="text-[18px] transition-all hover:scale-110 select-none"
                  style={{ opacity: mood == null || mood === m.value ? 1 : 0.3, transform: mood === m.value ? 'scale(1.3)' : undefined }}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.5)' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Moon size={12} className="text-text-muted" />
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Sleep (hrs)</p>
            </div>
            <input
              type="number"
              value={sleep}
              onChange={e => setSleep(e.target.value)}
              placeholder="—"
              min="0" max="24" step="0.5"
              className="w-full bg-transparent text-text-bright text-[22px] font-bold placeholder-text-muted focus:outline-none"
              style={{ borderBottom: '1px solid rgba(37,46,62,0.6)' }}
            />
          </div>

          {/* Market conditions */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.5)' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Wind size={12} className="text-text-muted" />
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Market</p>
            </div>
            <div className="relative">
              <select
                value={marketConditions}
                onChange={e => setMarketConditions(e.target.value)}
                className="w-full bg-transparent text-text-bright text-[13px] font-semibold appearance-none cursor-pointer focus:outline-none pr-5"
                style={{ borderBottom: '1px solid rgba(37,46,62,0.6)', paddingBottom: '2px' }}
              >
                <option value="">— Select —</option>
                {MARKET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronRight size={11} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col mb-5">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">
            Notes & Reflection
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did you learn today? Any mistakes, wins, patterns to watch?&#10;&#10;How was your focus and discipline? What would you do differently?"
            className="flex-1 w-full text-[13px] text-text-bright placeholder-text-muted focus:outline-none resize-none rounded-xl px-4 py-3 leading-relaxed"
            style={{
              background: 'rgba(22,29,43,0.5)',
              border: '1px solid rgba(37,46,62,0.5)',
              minHeight: '180px',
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 12px rgba(34,197,94,0.2)' }}
          >
            <Save size={14} />
            {saved ? '✓ Saved!' : 'Save Entry'}
          </button>
          {saved && <span className="text-accent text-[13px] font-medium">Entry saved successfully</span>}
        </div>
      </div>
    </div>
  )
}
