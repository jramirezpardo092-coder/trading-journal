import { useState, useCallback } from 'react'
import { Trade, Account, BalanceEntry, JournalEntry, Template, TradeResult } from '../types'

function computeTrade(trade: Trade): Trade {
  const totalEntry = trade.entries.reduce((s, l) => s + l.qty * l.price, 0)
  const totalEntryQty = trade.entries.reduce((s, l) => s + l.qty, 0)
  const totalExit = trade.exits.reduce((s, l) => s + l.qty * l.price, 0)
  const totalExitQty = trade.exits.reduce((s, l) => s + l.qty, 0)

  let grossPnl = 0
  let points = 0

  if (totalEntryQty > 0 && totalExitQty > 0) {
    const avgEntry = totalEntry / totalEntryQty
    const avgExit = totalExit / totalExitQty
    points = trade.side === 'LONG' ? avgExit - avgEntry : avgEntry - avgExit
    grossPnl = points * Math.min(totalEntryQty, totalExitQty)
  }

  const netPnl = grossPnl - (trade.fees || 0)
  const result: TradeResult = netPnl > 0 ? 'WIN' : netPnl < 0 ? 'LOSS' : 'BREAKEVEN'

  return { ...trade, grossPnl, netPnl, points, result }
}

const STORAGE_KEY = 'twi_journal'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveState(state: {
  trades: Trade[]
  accounts: Account[]
  balanceEntries: BalanceEntry[]
  journalEntries: JournalEntry[]
  templates: Template[]
  activeAccountId: string | null
}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

const initial = loadState() || {
  trades: [],
  accounts: [],
  balanceEntries: [],
  journalEntries: [],
  templates: [],
  activeAccountId: null,
}

// Singleton state (module-level so it persists across component re-renders)
let _trades: Trade[] = initial.trades
let _accounts: Account[] = initial.accounts
let _balanceEntries: BalanceEntry[] = initial.balanceEntries
let _journalEntries: JournalEntry[] = initial.journalEntries
let _templates: Template[] = initial.templates
let _activeAccountId: string | null = initial.activeAccountId

const listeners = new Set<() => void>()

function notify() {
  saveState({
    trades: _trades,
    accounts: _accounts,
    balanceEntries: _balanceEntries,
    journalEntries: _journalEntries,
    templates: _templates,
    activeAccountId: _activeAccountId,
  })
  listeners.forEach(fn => fn())
}

export function useStore() {
  const [, forceUpdate] = useState(0)

  const subscribe = useCallback(() => {
    const fn = () => forceUpdate(n => n + 1)
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])

  // Subscribe on mount
  useState(() => {
    const fn = () => forceUpdate(n => n + 1)
    listeners.add(fn)
    return () => listeners.delete(fn)
  })

  const addTrade = (trade: Omit<Trade, 'id'>) => {
    const computed = computeTrade({ ...trade, id: crypto.randomUUID() })
    _trades = [computed, ..._trades]
    notify()
  }

  const updateTrade = (id: string, updates: Partial<Trade>) => {
    _trades = _trades.map(t => t.id === id ? computeTrade({ ...t, ...updates }) : t)
    notify()
  }

  const deleteTrade = (id: string) => {
    _trades = _trades.filter(t => t.id !== id)
    notify()
  }

  const addAccount = (account: Omit<Account, 'id'>) => {
    _accounts = [..._accounts, { ...account, id: crypto.randomUUID() }]
    notify()
  }

  const deleteAccount = (id: string) => {
    _accounts = _accounts.filter(a => a.id !== id)
    notify()
  }

  const addBalanceEntry = (entry: Omit<BalanceEntry, 'id'>) => {
    _balanceEntries = [..._balanceEntries, { ...entry, id: crypto.randomUUID() }]
    notify()
  }

  const saveJournalEntry = (entry: JournalEntry) => {
    const idx = _journalEntries.findIndex(e => e.date === entry.date)
    if (idx >= 0) {
      _journalEntries = _journalEntries.map((e, i) => i === idx ? entry : e)
    } else {
      _journalEntries = [..._journalEntries, entry]
    }
    notify()
  }

  const addTemplate = (tpl: Omit<Template, 'id'>) => {
    _templates = [..._templates, { ...tpl, id: crypto.randomUUID() }]
    notify()
  }

  const deleteTemplate = (id: string) => {
    _templates = _templates.filter(t => t.id !== id)
    notify()
  }

  const setActiveAccount = (id: string | null) => {
    _activeAccountId = id
    notify()
  }

  return {
    trades: _trades,
    accounts: _accounts,
    balanceEntries: _balanceEntries,
    journalEntries: _journalEntries,
    templates: _templates,
    activeAccountId: _activeAccountId,
    addTrade,
    updateTrade,
    deleteTrade,
    addAccount,
    deleteAccount,
    addBalanceEntry,
    saveJournalEntry,
    addTemplate,
    deleteTemplate,
    setActiveAccount,
    subscribe,
  }
}
