import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { JournalEntry, Trade } from '../types'

interface Props {
  journalEntries: JournalEntry[]
  trades: Trade[]
  onSaveEntry: (entry: JournalEntry) => void
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_DAYS = ['SU','MO','TU','WE','TH','FR','SA']

const MOODS = [
  { value: 1, emoji: '😞', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
]

const MARKET_CONDITIONS = ['Trending', 'Ranging', 'Volatile', 'Choppy', 'News-Driven', 'Gap & Go', 'Reversal']

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

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

  function selectDate(date: string) {
    // Save current before switching
    handleSave()
    setSelectedDate(date)
    const e = journalEntries.find(j => j.date === date) || { date }
    setMood(e.mood)
    setSleep(e.sleep?.toString() || '')
    setMarketConditions(e.marketConditions || '')
    setNotes(e.notes || '')
  }

  function handleSave() {
    onSaveEntry({
      date: selectedDate,
      mood,
      sleep: sleep ? parseFloat(sleep) : undefined,
      marketConditions: marketConditions || undefined,
      notes: notes || undefined,
    })
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year-1) }
    else setMonth(month-1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year+1) }
    else setMonth(month+1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const todayStr = today.toISOString().split('T')[0]

  const dayTrades = trades.filter(t => t.date === selectedDate)

  return (
    <div className="grid grid-cols-[320px_1fr] gap-6 h-full">
      {/* Left: Mini calendar + trades */}
      <div className="space-y-4">
        {/* Mini calendar */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-2 text-text-dim hover:text-white transition-colors">
              <ChevronLeft size={15}/>
            </button>
            <span className="text-white font-semibold text-sm">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-2 text-text-dim hover:text-white transition-colors">
              <ChevronRight size={15}/>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {SHORT_DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-text-dim py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: firstDay}, (_,i) => <div key={`b${i}`}/>)}
            {Array.from({length: daysInMonth}, (_,i) => {
              const d = i+1
              const key = isoDate(year, month, d)
              const isSelected = key === selectedDate
              const isToday = key === todayStr
              const hasEntry = journalEntries.some(e => e.date === key)
              const hasTrades = trades.some(t => t.date === key)
              return (
                <button
                  key={d}
                  onClick={() => selectDate(key)}
                  className={`w-full aspect-square rounded-lg text-xs font-medium transition-all relative ${
                    isSelected ? 'bg-accent text-black font-bold' :
                    isToday ? 'border border-accent text-accent' :
                    'text-text-dim hover:bg-surface-2 hover:text-white'
                  }`}
                >
                  {d}
                  {(hasEntry || hasTrades) && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent opacity-60"/>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Trades on selected date */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-[11px] font-semibold text-text-dim uppercase tracking-widest mb-3">
            Trades on {selectedDate.slice(5).replace('-','/')}
          </h3>
          {dayTrades.length === 0 ? (
            <p className="text-text-dim text-xs italic">No trades this day.</p>
          ) : (
            <div className="space-y-2">
              {dayTrades.map(t => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.result==='WIN'?'bg-accent':t.result==='LOSS'?'bg-danger':'bg-text-dim'}`}/>
                    <span className="text-white text-sm font-medium">{t.symbol||'—'}</span>
                  </div>
                  <span className={`text-xs font-semibold ${(t.netPnl||0)>=0?'stat-positive':'stat-negative'}`}>
                    {(t.netPnl||0)>=0?'+':''}${Math.abs(t.netPnl||0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Journal entry */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-5">{formatDisplayDate(selectedDate)}</h3>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Mood */}
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-text-dim uppercase tracking-widest mb-3">Mood</p>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? undefined : m.value)}
                  title={m.label}
                  className={`text-xl transition-all hover:scale-110 ${mood === m.value ? 'scale-125' : 'opacity-50 hover:opacity-80'}`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-text-dim uppercase tracking-widest mb-3">Sleep (hrs)</p>
            <input
              type="number"
              value={sleep}
              onChange={e => setSleep(e.target.value)}
              placeholder="--"
              min="0" max="24" step="0.5"
              className="w-full bg-transparent text-white text-sm placeholder-text-dim focus:outline-none border-b border-border pb-1"
            />
          </div>

          {/* Market conditions */}
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-text-dim uppercase tracking-widest mb-3">Market Conditions</p>
            <div className="relative">
              <select
                value={marketConditions}
                onChange={e => setMarketConditions(e.target.value)}
                className="w-full bg-transparent text-white text-sm appearance-none cursor-pointer focus:outline-none border-b border-border pb-1 pr-5"
              >
                <option value=""></option>
                {MARKET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronRight size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-dim rotate-90 pointer-events-none"/>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-text-dim uppercase tracking-widest mb-2">Notes / Reflection</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did you learn today? Any mistakes, wins, patterns to watch?"
            rows={8}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent/60 resize-none transition-colors"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors"
        >
          Save Entry
        </button>
      </div>
    </div>
  )
}
