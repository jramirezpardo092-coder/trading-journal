import { useState } from 'react'
import { X, Plus, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { AssetType, OptionType, Side, Emotion, Trade, TradeLeg, Template } from '../types'

const EMOTIONS: Emotion[] = [
  'Confident','Calm','Focused','Anxious','FOMO',
  'Revenge','Bored','Greedy','Fearful','Frustrated','Impulsive','Disciplined'
]

const EXIT_REASONS = [
  'Target Hit','Stop Loss','Time Stop','Manual Exit',
  'Trailing Stop','News/Event','Breakeven Stop','Partial Exit'
]

const ASSET_TYPES: AssetType[] = ['OPTIONS','FUTURES','STOCKS','CRYPTO','BETS']
const OPTION_TYPES: OptionType[] = ['CALL','PUT','SPREAD']

interface Props {
  onClose: () => void
  onSave: (trade: Omit<Trade, 'id'>) => void
  templates: Template[]
  onSaveTemplate: (tpl: Omit<Template,'id'>) => void
  editTrade?: Trade | null
}

function today() {
  return new Date().toISOString().split('T')[0]
}
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function AddTradeModal({ onClose, onSave, templates, onSaveTemplate, editTrade }: Props) {
  const t = editTrade
  const [assetType, setAssetType] = useState<AssetType>(t?.assetType || 'OPTIONS')
  const [optionType, setOptionType] = useState<OptionType>(t?.optionType || 'CALL')
  const [date, setDate] = useState(t?.date || today())
  const [time, setTime] = useState(t?.time || nowTime())
  const [symbol, setSymbol] = useState(t?.symbol || '')
  const [strike, setStrike] = useState(t?.strike?.toString() || '')
  const [expiration, setExpiration] = useState(t?.expiration || '')
  const [side, setSide] = useState<Side>(t?.side || 'LONG')
  const [entries, setEntries] = useState<TradeLeg[]>(t?.entries || [{ qty: 1, price: 0 }])
  const [exits, setExits] = useState<TradeLeg[]>(t?.exits || [{ qty: 1, price: 0 }])
  const [fees, setFees] = useState(t?.fees?.toString() || '0')
  const [showReflect, setShowReflect] = useState(false)
  const [exitReason, setExitReason] = useState(t?.exitReason || '')
  const [playbook, setPlaybook] = useState(t?.playbook || '')
  const [plannedRisk, setPlannedRisk] = useState(t?.plannedRisk?.toString() || '')
  const [mae, setMae] = useState(t?.mae?.toString() || '')
  const [mfe, setMfe] = useState(t?.mfe?.toString() || '')
  const [emotion, setEmotion] = useState<Emotion | undefined>(t?.emotion)
  const [notes, setNotes] = useState(t?.notes || '')
  const [showPositionSizer, setShowPositionSizer] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  function loadTemplate(id: string) {
    const tpl = templates.find(t => t.id === id)
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
      const updated = [...entries]
      updated[idx] = { ...updated[idx], [field]: num }
      setEntries(updated)
    } else {
      const updated = [...exits]
      updated[idx] = { ...updated[idx], [field]: num }
      setExits(updated)
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
      symbol,
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

  const inputCls = 'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent/60 transition-colors'
  const labelCls = 'block text-[11px] font-semibold text-text-dim tracking-widest uppercase mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-white font-semibold text-lg">{editTrade ? 'Edit Trade' : 'New Trade'}</h2>
          <button onClick={onClose} className="text-text-dim hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Template row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedTemplate}
                onChange={e => loadTemplate(e.target.value)}
                className={inputCls + ' pr-8 appearance-none cursor-pointer'}
              >
                <option value="">Load Template...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
            </div>
            <button
              onClick={handleSaveTemplate}
              className="px-3 py-2 text-sm border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors whitespace-nowrap"
            >
              Save Template
            </button>
          </div>

          {/* Asset type tabs */}
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
            {ASSET_TYPES.map(at => (
              <button
                key={at}
                onClick={() => setAssetType(at)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  assetType === at ? 'bg-accent text-black' : 'text-text-dim hover:text-white'
                }`}
              >
                {at}
              </button>
            ))}
          </div>

          {/* Option type */}
          {assetType === 'OPTIONS' && (
            <div>
              <label className={labelCls}>Option Type</label>
              <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
                {OPTION_TYPES.map(ot => (
                  <button
                    key={ot}
                    onClick={() => setOptionType(ot)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      optionType === ot ? 'bg-accent text-black' : 'text-text-dim hover:text-white'
                    }`}
                  >
                    {ot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contract */}
          <div>
            <label className={labelCls}>Contract</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-dim mb-1 block">DATE</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-text-dim mb-1 block">TIME</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-text-dim mb-1 block">SYMBOL</label>
                <input type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="SPY" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Strike & Expiration (options) */}
          {assetType === 'OPTIONS' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Strike</label>
                <input type="number" value={strike} onChange={e => setStrike(e.target.value)} placeholder="450" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Expiration</label>
                <input type="date" value={expiration} onChange={e => setExpiration(e.target.value)} className={inputCls} />
              </div>
            </div>
          )}

          {/* Side */}
          <div>
            <label className={labelCls}>Side</label>
            <div className="flex rounded-xl overflow-hidden border border-border">
              <button
                onClick={() => setSide('LONG')}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  side === 'LONG' ? 'bg-accent text-black' : 'bg-surface-2 text-text-dim hover:text-white'
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => setSide('SHORT')}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  side === 'SHORT' ? 'bg-accent text-black' : 'bg-surface-2 text-text-dim hover:text-white'
                }`}
              >
                SHORT
              </button>
            </div>
          </div>

          {/* Execution */}
          <div>
            <label className={labelCls}>Execution</label>

            {/* Entry legs */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim uppercase font-semibold tracking-widest">Entry</span>
                <button onClick={() => addLeg('entry')} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add Leg
                </button>
              </div>
              {entries.map((leg, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 items-center">
                  <div>
                    <label className="text-xs text-text-dim mb-1 block">QTY</label>
                    <input
                      type="number"
                      value={leg.qty}
                      onChange={e => updateLeg('entry', i, 'qty', e.target.value)}
                      className={inputCls}
                      min="0"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs text-text-dim mb-1 block">PRICE</label>
                    <input
                      type="number"
                      value={leg.price || ''}
                      onChange={e => updateLeg('entry', i, 'price', e.target.value)}
                      placeholder="0.00"
                      className={inputCls}
                      step="0.01"
                    />
                    {entries.length > 1 && (
                      <button onClick={() => removeLeg('entry', i)} className="absolute -top-0.5 right-0 text-danger text-xs">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Exit legs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim uppercase font-semibold tracking-widest">Exit</span>
                <button onClick={() => addLeg('exit')} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add Leg
                </button>
              </div>
              {exits.map((leg, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 items-center">
                  <div>
                    <label className="text-xs text-text-dim mb-1 block">QTY</label>
                    <input
                      type="number"
                      value={leg.qty}
                      onChange={e => updateLeg('exit', i, 'qty', e.target.value)}
                      className={inputCls}
                      min="0"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs text-text-dim mb-1 block">PRICE</label>
                    <input
                      type="number"
                      value={leg.price || ''}
                      onChange={e => updateLeg('exit', i, 'price', e.target.value)}
                      placeholder="0.00"
                      className={inputCls}
                      step="0.01"
                    />
                    {exits.length > 1 && (
                      <button onClick={() => removeLeg('exit', i)} className="absolute -top-0.5 right-0 text-danger text-xs">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fees */}
          <div>
            <label className={labelCls + ' flex items-center gap-1'}>
              Fees <Info size={12} className="text-text-dim" />
            </label>
            <input
              type="number"
              value={fees}
              onChange={e => setFees(e.target.value)}
              placeholder="0.00"
              className={inputCls}
              step="0.01"
            />
          </div>

          {/* Reflect section */}
          <div>
            <button
              onClick={() => setShowReflect(!showReflect)}
              className="flex items-center gap-2 text-sm font-semibold text-text-dim hover:text-white transition-colors w-full border-t border-border pt-4"
            >
              <span className="text-xs uppercase tracking-widest">Reflect</span>
              <span className="ml-auto text-xs text-accent">{showReflect ? 'Hide' : 'Exit reason · playbook · emotion · notes'}</span>
            </button>

            {showReflect && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelCls + ' flex items-center gap-1'}>
                    Exit Reason <Info size={12} className="text-text-dim" />
                  </label>
                  <div className="relative">
                    <select value={exitReason} onChange={e => setExitReason(e.target.value)} className={inputCls + ' pr-8 appearance-none cursor-pointer'}>
                      <option value="">-- Select --</option>
                      {EXIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}>
                      Playbook <Info size={12} className="text-text-dim" />
                    </label>
                    <input type="text" value={playbook} onChange={e => setPlaybook(e.target.value)} placeholder="e.g. Breakout" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}>
                      Planned Risk ($) <Info size={12} className="text-text-dim" />
                    </label>
                    <input type="number" value={plannedRisk} onChange={e => setPlannedRisk(e.target.value)} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}>
                      MAE ($) <Info size={12} className="text-text-dim" />
                    </label>
                    <input type="number" value={mae} onChange={e => setMae(e.target.value)} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}>
                      MFE ($) <Info size={12} className="text-text-dim" />
                    </label>
                    <input type="number" value={mfe} onChange={e => setMfe(e.target.value)} placeholder="0.00" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls + ' flex items-center gap-1'}>
                    Emotion <Info size={12} className="text-text-dim" />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map(em => (
                      <button
                        key={em}
                        onClick={() => setEmotion(emotion === em ? undefined : em)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          emotion === em
                            ? 'bg-accent text-black border-accent'
                            : 'border-border text-text-dim hover:border-accent/40 hover:text-white'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Trade rationale, observations..."
                    rows={4}
                    className={inputCls + ' resize-none'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Position sizer */}
          <div className="border-t border-border pt-4">
            <button
              onClick={() => setShowPositionSizer(!showPositionSizer)}
              className="flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              {showPositionSizer ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Position Sizer
            </button>
            {showPositionSizer && (
              <div className="mt-4 p-4 bg-surface-2 rounded-xl text-text-dim text-sm">
                Position sizing calculator coming soon.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm text-text-dim hover:text-white bg-surface-2 border border-border transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent-dim transition-colors">
            Save Trade
          </button>
        </div>
      </div>
    </div>
  )
}
