export type AssetType = 'OPTIONS' | 'FUTURES' | 'STOCKS' | 'CRYPTO' | 'BETS'
export type OptionType = 'CALL' | 'PUT' | 'SPREAD'
export type Side = 'LONG' | 'SHORT'
export type TradeResult = 'WIN' | 'LOSS' | 'BREAKEVEN'
export type Emotion =
  | 'Confident' | 'Calm' | 'Focused' | 'Anxious' | 'FOMO'
  | 'Revenge' | 'Bored' | 'Greedy' | 'Fearful' | 'Frustrated'
  | 'Impulsive' | 'Disciplined'

export type ExitReason =
  | 'Target Hit' | 'Stop Loss' | 'Time Stop' | 'Manual Exit'
  | 'Trailing Stop' | 'News/Event' | 'Breakeven Stop' | 'Partial Exit'

export interface TradeLeg {
  qty: number
  price: number
}

export interface Trade {
  id: string
  date: string        // ISO date string
  time: string
  assetType: AssetType
  optionType?: OptionType
  symbol: string
  strike?: number
  expiration?: string
  side: Side
  entries: TradeLeg[]
  exits: TradeLeg[]
  fees: number
  exitReason?: string
  playbook?: string
  plannedRisk?: number
  mae?: number
  mfe?: number
  emotion?: Emotion
  notes?: string
  accountId?: string
  // Computed
  result?: TradeResult
  grossPnl?: number
  netPnl?: number
  points?: number
}

export interface Account {
  id: string
  name: string
  broker: string
  color: string
  balance: number
  createdAt: string
}

export interface BalanceEntry {
  id: string
  accountId: string
  date: string
  balance: number
  note?: string
}

export interface JournalEntry {
  date: string // YYYY-MM-DD
  mood?: number // 1-5
  sleep?: number
  marketConditions?: string
  notes?: string
}

export interface Template {
  id: string
  name: string
  assetType: AssetType
  optionType?: OptionType
  symbol?: string
  side?: Side
  fees?: number
}

export interface AppState {
  trades: Trade[]
  accounts: Account[]
  balanceEntries: BalanceEntry[]
  journalEntries: JournalEntry[]
  templates: Template[]
  activeAccountId: string | null
}
