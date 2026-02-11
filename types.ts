
export type TradeOutcome = 'good' | 'bad';
export type TradeType = 'long' | 'short';

export interface Trade {
  id: string;
  asset: string;
  type: TradeType;
  entryPrice: number;
  exitPrice?: number;
  pnl: number; // Profit or Loss amount
  leverage: number;
  usedStopLoss: boolean;
  usedTakeProfit: boolean;
  outcome: TradeOutcome;
  startDate: string; // ISO format
  endDate: string; // ISO format
  notes?: string;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
}

export interface Statistics {
  totalTrades: number;
  winRate: number;
  profitCount: number;
  lossCount: number;
  goodExecutionRate: number;
  topAssets: { asset: string; count: number }[];
  avgPnl: number;
  grossProfit: number;
  grossLoss: number;
  netResult: number;
  slUsageRate: number;
  tpUsageRate: number;
}
