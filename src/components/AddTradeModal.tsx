import { useState } from 'react'
import { X, Plus, ChevronDown, ChevronRight, Info, Trash2, BookOpen } from 'lucide-react'
import { AssetType, OptionType, Side, Emotion, Trade, TradeLeg, Template } from '../types'

const EMOTIONS: Emotion[] = [
  'Confident', 'Calm', 'Focused', 'Anxious', 'FOMO',
  'Revenge', 'Bored', 'Greedy', 'Fearful', 'Frustrated', 'Impulsive', 'Disciplined'
]

const EXIT_REASONS = [
  'Target Hit', 'Stop Loss', 'Time Stop', 'Manual Exit',
  'Trailing Stop', 'News/Event', 'Breakeven Stop', 'Partial Exit'
]

const ASSET_TYPES: AssetType[] = ['OPTIONS', 'FUTURES', 'STOCKS', 'CRYPTO', 'BETS']
const OPTION_TYPES: OptionType[] = ['CALL', 'PUT', 'SPREAD']

interface Props {
  onClose: () => void
  onSave: (trade: Omit<Trade, 'id'>) => void
  templates: Template[]
  onSaveTemplate: (tpl: Omit<Template, 'id'>) => void
  editTrade?: Trade | null
}

function today() { return new Date().toISOString().split('T')[0] }
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Compute P&L preview
function computePreview(entries: TradeLeg[], exits: TradeLeg[], side: Side, fees: number) {
  if (!entries.length || !exits.length) return null
  const totalQty = entries.reduce((s, l) => s + l.qty, 0)
  const avgEntry = entries.reduce((s, l) => s + l.price * l.qty, 0) / Math.max(totalQty, 0.0001)
  const avgExit = exits.reduce((s, l) => s + l.price * l.qty, 0) / Math.max(totalQty, 0.0001)
  const points = side === 'LONG' ? avgExit - avgEntry : avgEntry - avgExit
  const gross = points * totalQty
  const net = gross - fees
  return { points, gross, net, avgEntry, avgExit }
}

export default function AddTradeModal({ onClose, onSave, templates, onSaveTemplate, editTrade }: Props) {
  const t = editTrade
  const [assetType, setAssetType] = useState<AssetType>(t?.assetType || 'FUTURES')
  const [optionType, setOptionType] = useState<OptionType>(t?.optionType || 'CALL')
  const [date, setDate] = useState(t?.date || today())
  const [time, setTime] = useState(t?.time || nowTime())
  const [symbol, setSymbol] = useState(t?.symbol || '')
  const [strike, setStrike] = useState(t?.strike?.toString() || '')
  const [expiration, setExpiration] = useState(t?.expiration || '')
  const [side, setSide] = useState<Side>(t?.side || 'LONG')
  const [entries, setEntries] = useState<TradeLeg[]>(t?.entries?.length ? t.entries : [{ qty: 1, price: 0 }])
  const [exits, setExits] = useState<TradeLeg[]>(t?.exits?.length ? t.exits : [{ qty: 1, price: 0 }])
  const [fees, setFees] = useState(t?.fees?.toString() || '0')
  const [showReflect, setShowReflect] = useState(false)
  const [exitReason, setExitReason] = useState(t?.exitReason || '')
  const [playbook, setPlaybook] = useState(t?.playbook || '')
  const [plannedRisk, setPlannedRisk] = useState(t?.plannedRisk?.toString() || '')
  const [mae, setMae] = useState(t?.mae?.toString() || '')
  const [mfe, setMfe] = useState(t?.mfe?.toString() || '')
  const [emotion, setEmotion] = useState<Emotion | undefined>(t?.emotion)
  const [notes, setNotes] = useState(t?.notes || '')
  const [templateName, setTemplateName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  function loadTemplate(id: string) {
    const tpl = templates.find(x => x.id === id)
    if (!tpl) return
    setAssetType(tpl.assetType)
    if (tpl.optionType) setOptionType(tpl.optionType)
    if (tpl.symbol) setSymbol(tpl.symbol)
    if (tpl.side) setSide(tpl.side)
    if (tpl.fees != null) setFees(tpl.fees.toString())
    setSelectedTemplate(id)
  }

  function handleSaveTemplate() {
    if (!templateName.trim()) return
    onSaveTemplate({ name: templateName, assetType, optionType, symbol, side, fees: parseFloat(fees) || 0 })
    setTemplateName('')
  }

  function addLeg(type: 'entry' | 'exit') {
    if (type === 'entry') setEntries([...entries, { qty: 1, price: 0 }])
    else setExits([...exits, { qty: 1, price: 0 }])
  }

  function updateLeg(type: 'entry' | 'exit', idx: number, field: keyof TradeLeg, value: string) {
    const num = parseFloat(value) || 0
    if (type === 'entry') {
      const updated = [...entries]; updated[idx] = { ...updated[idx], [field]: num }; setEntries(updated)
    } else {
      const updated = [...exits]; updated[idx] = { ...updated[idx], [field]: num }; setExits(updated)
    }
  }

  function removeLeg(type: 'entry' | 'exit', idx: number) {
    if (type === 'entry') setEntries(entries.filter((_, i) => i !== idx))
    else setExits(exits.filter((_, i) => i !== idx))
  }

  function handleSave() {
    const trade: Omit<Trade, 'id'> = {
      date, time, assetType,
      optionType: assetType === 'OPTIONS' ? optionType : undefined,
      symbol: symbol.trim().toUpperCase(),
      strike: strike ? parseFloat(strike) : undefined,
      expiration: assetType === 'OPTIONS' ? expiration : undefined,
      side, entries, exits,
      fees: parseFloat(fees) || 0,
      exitReason: exitReason || undefined,
      playbook: playbook || undefined,
      plannedRisk: plannedRisk ? parseFloat(plannedRisk) : undefined,
      mae: mae ? parseFloat(mae) : undefined,
      mfe: mfe ? parseFloat(mfe) : undefined,
      emotion,
      notes: notes || undefined,
    }
    onSave(trade)
    onClose()
  }

  const preview = computePreview(entries, exits, side, parseFloat(fees) || 0)

  const inputCls = 'w-full rounded-lg px-3 py-2 text-[13px] text-text-bright placeholder-text-muted focus:outline-none transition-colors'
  const inputStyle = { background: 'rgba(22,29,43,0.8)', border: '1px solid rgba(37,46,62,0.8)' }
  const labelCls = 'block text-[10px] font-bold text-text-muted tracking-widest uppercase mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl animate-slide-up"
        style={{ background: '#0a0f18', border: '1px solid rgba(37,46,62,0.9)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: '#0a0f18', borderBottom: '1px solid rgba(37,46,62,0.6)' }}
        >
          <div>
            <h2 className="text-text-bright font-bold text-[16px]">{editTrade ? 'Edit Trade' : 'New Trade'}</h2>
            <p className="text-text-muted text-[11px] mt-0.5">
              {editTrade ? `Editing ${editTrade.symbol}` : 'Log a new trade to your journal'}
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-bright p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Template row */}
          {templates.length > 0 && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedTemplate}
                  onChange={e => loadTemplate(e.target.value)}
                  className={`${inputCls} pr-8 appearance-none cursor-pointer`}
                  style={inputStyle}
                >
                  <option value="">Load Template...</option>
                  {templates.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
          )}

          {/* Asset type */}
          <div>
            <label className={labelCls}>Asset Type</label>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.6)' }}>
              {ASSET_TYPES.map(at => (
                <button
                  key={at}
                  onClick={() => setAssetType(at)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  style={assetType === at
                    ? { background: '#22c55e', color: '#000' }
                    : { color: '#6b7588' }
                  }
                >
                  {at}
                </button>
              ))}
            </div>
          </div>

          {/* Option type */}
          {assetType === 'OPTIONS' && (
            <div>
              <label className={labelCls}>Option Type</label>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.6)' }}>
                {OPTION_TYPES.map(ot => (
                  <button
                    key={ot}
                    onClick={() => setOptionType(ot)}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                    style={optionType === ot
                      ? { background: '#22c55e', color: '#000' }
                      : { color: '#6b7588' }
                    }
                  >
                    {ot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date / Time / Symbol */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls}>Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={e => setSymbol(e.target.value.toUpperCase())}
                placeholder="SPY"
                className={inputCls}
                style={inputStyle}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Strike & Expiration for options */}
          {assetType === 'OPTIONS' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Strike</label>
                <input type="number" value={strike} onChange={e => setStrike(e.target.value)} placeholder="450" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls}>Expiration</label>
                <input type="date" value={expiration} onChange={e => setExpiration(e.target.value)} className={inputCls} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Side toggle */}
          <div>
            <label className={labelCls}>Side</label>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(37,46,62,0.8)' }}>
              <button
                onClick={() => setSide('LONG')}
                className="flex-1 py-2.5 text-[13px] font-bold transition-all"
                style={side === 'LONG'
                  ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRight: '1px solid rgba(34,197,94,0.2)' }
                  : { background: 'rgba(22,29,43,0.4)', color: '#6b7588', borderRight: '1px solid rgba(37,46,62,0.5)' }
                }
              >
                LONG
              </button>
              <button
                onClick={() => setSide('SHORT')}
                className="flex-1 py-2.5 text-[13px] font-bold transition-all"
                style={side === 'SHORT'
                  ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
                  : { background: 'rgba(22,29,43,0.4)', color: '#6b7588' }
                }
              >
                SHORT
              </button>
            </div>
          </div>

          {/* Execution */}
          <div className="space-y-3">
            {/* Entry legs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls + ' mb-0'}>Entry Legs</label>
                <button onClick={() => addLeg('entry')} className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors">
                  <Plus size={11} strokeWidth={2.5} /> Add Leg
                </button>
              </div>
              <div className="space-y-2">
                {entries.map((leg, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {i === 0 && <label className="text-[10px] text-text-muted mb-1 block">QTY</label>}
                      <input
                        type="number"
                        value={leg.qty || ''}
                        onChange={e => updateLeg('entry', i, 'qty', e.target.value)}
                        placeholder="1"
                        className={inputCls}
                        style={inputStyle}
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      {i === 0 && <label className="text-[10px] text-text-muted mb-1 block">PRICE</label>}
                      <input
                        type="number"
                        value={leg.price || ''}
                        onChange={e => updateLeg('entry', i, 'price', e.target.value)}
                        placeholder="0.00"
                        className={inputCls}
                        style={inputStyle}
                        step="0.01"
                      />
                    </div>
                    {entries.length > 1 && (
                      <button onClick={() => removeLeg('entry', i)}
                        className="p-2 rounded-lg text-text-muted hover:text-danger transition-colors flex-shrink-0"
                        style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.6)', marginBottom: '0' }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Exit legs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls + ' mb-0'}>Exit Legs</label>
                <button onClick={() => addLeg('exit')} className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors">
                  <Plus size={11} strokeWidth={2.5} /> Add Leg
                </button>
              </div>
              <div className="space-y-2">
                {exits.map((leg, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {i === 0 && <label className="text-[10px] text-text-muted mb-1 block">QTY</label>}
                      <input
                        type="number"
                        value={leg.qty || ''}
                        onChange={e => updateLeg('exit', i, 'qty', e.target.value)}
                        placeholder="1"
                        className={inputCls}
                        style={inputStyle}
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      {i === 0 && <label className="text-[10px] text-text-muted mb-1 block">PRICE</label>}
                      <input
                        type="number"
                        value={leg.price || ''}
                        onChange={e => updateLeg('exit', i, 'price', e.target.value)}
                        placeholder="0.00"
                        className={inputCls}
                        style={inputStyle}
                        step="0.01"
                      />
                    </div>
                    {exits.length > 1 && (
                      <button onClick={() => removeLeg('exit', i)}
                        className="p-2 rounded-lg text-text-muted hover:text-danger transition-colors flex-shrink-0"
                        style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.6)' }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* P&L Preview */}
          {preview && preview.gross !== 0 && (
            <div
              className="rounded-xl p-3 grid grid-cols-3 gap-3"
              style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}
            >
              {[
                { label: 'Points', value: `${preview.points >= 0 ? '+' : ''}${preview.points.toFixed(2)}`, color: preview.points >= 0 ? '#22c55e' : '#ef4444' },
                { label: 'Gross P&L', value: `${preview.gross >= 0 ? '+' : '-'}$${Math.abs(preview.gross).toFixed(2)}`, color: preview.gross >= 0 ? '#22c55e' : '#ef4444' },
                { label: 'Net P&L', value: `${preview.net >= 0 ? '+' : '-'}$${Math.abs(preview.net).toFixed(2)}`, color: preview.net >= 0 ? '#22c55e' : '#ef4444' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-text-muted text-[9px] font-bold uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="font-extrabold text-[14px] font-mono-num" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Fees */}
          <div>
            <label className={labelCls}>Fees / Commission</label>
            <input
              type="number"
              value={fees}
              onChange={e => setFees(e.target.value)}
              placeholder="0.00"
              className={inputCls}
              style={inputStyle}
              step="0.01"
            />
          </div>

          {/* Reflect section */}
          <div style={{ borderTop: '1px solid rgba(37,46,62,0.5)', paddingTop: '16px' }}>
            <button
              onClick={() => setShowReflect(!showReflect)}
              className="flex items-center gap-2 text-[13px] font-semibold text-text-dim hover:text-text-bright transition-colors w-full"
            >
              <BookOpen size={14} className="text-accent" />
              <span>Reflect</span>
              <span className="ml-auto text-[11px] text-text-muted">
                {showReflect ? '↑ Hide' : 'Exit reason · playbook · emotion · notes →'}
              </span>
            </button>

            {showReflect && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelCls}>Exit Reason</label>
                  <div className="relative">
                    <select value={exitReason} onChange={e => setExitReason(e.target.value)}
                      className={`${inputCls} pr-8 appearance-none cursor-pointer`} style={inputStyle}>
                      <option value="">— Select —</option>
                      {EXIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className={labelCls}>Playbook / Strategy</label>
                    <input type="text" value={playbook} onChange={e => setPlaybook(e.target.value)} placeholder="Breakout, Momentum..." className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls}>Planned Risk</label>
                    <input type="number" value={plannedRisk} onChange={e => setPlannedRisk(e.target.value)} placeholder="$200" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls}>MAE ($)</label>
                    <input type="number" value={mae} onChange={e => setMae(e.target.value)} placeholder="0" className={inputCls} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Emotion</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOTIONS.map(em => (
                      <button
                        key={em}
                        onClick={() => setEmotion(emotion === em ? undefined : em)}
                        className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                        style={emotion === em
                          ? { background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.4)' }
                          : { background: 'rgba(22,29,43,0.6)', color: '#6b7588', border: '1px solid rgba(37,46,62,0.6)' }
                        }
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes / Observations</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Trade rationale, what you noticed, what you'd do differently..."
                    rows={4}
                    className={`${inputCls} resize-none leading-relaxed`}
                    style={inputStyle}
                  />
                </div>

                {/* Save template */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    placeholder="Template name..."
                    className={`${inputCls} flex-1`}
                    style={inputStyle}
                  />
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim()}
                    className="px-3 py-2 rounded-lg text-[12px] font-semibold text-accent transition-colors disabled:opacity-40"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    Save Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 px-6 py-4 flex items-center gap-3"
          style={{ background: '#0a0f18', borderTop: '1px solid rgba(37,46,62,0.6)' }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-[13px] font-medium text-text-dim hover:text-text-bright transition-colors"
            style={{ background: 'rgba(22,29,43,0.6)', border: '1px solid rgba(37,46,62,0.8)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-black transition-all hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 0 14px rgba(34,197,94,0.2)',
            }}
          >
            {editTrade ? 'Update Trade' : 'Save Trade'}
          </button>
        </div>
      </div>
    </div>
  )
}
