
import { Trade, Coin } from '../types';
import { STORAGE_KEY, ASSETS_KEY } from '../constants';

export const getTrades = (): Trade[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveTrade = (trade: Trade) => {
  const trades = getTrades();
  const existingIndex = trades.findIndex(t => t.id === trade.id);
  if (existingIndex > -1) {
    trades[existingIndex] = trade;
  } else {
    trades.unshift(trade);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
};

export const deleteTrade = (id: string) => {
  const trades = getTrades();
  const filtered = trades.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getCustomAssets = (): Coin[] => {
  const data = localStorage.getItem(ASSETS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveCustomAsset = (asset: Coin) => {
  const assets = getCustomAssets();
  if (!assets.find(a => a.id === asset.id || a.symbol === asset.symbol)) {
    assets.push(asset);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  }
};
