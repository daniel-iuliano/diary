
import { Trade, TradeType, TradeOutcome } from '../types';

const CSV_HEADER = [
  'id', 'asset', 'type', 'entryPrice', 'exitPrice', 'pnl', 'leverage', 
  'usedStopLoss', 'usedTakeProfit', 'outcome', 'startDate', 'endDate', 'notes'
].join(',');

export const exportTradesToCSV = (trades: Trade[]) => {
  const rows = trades.map(t => [
    t.id,
    t.asset,
    t.type,
    t.entryPrice,
    t.exitPrice || '',
    t.pnl,
    t.leverage,
    t.usedStopLoss ? '1' : '0',
    t.usedTakeProfit ? '1' : '0',
    t.outcome,
    t.startDate,
    t.endDate,
    `"${(t.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
  ].join(','));

  const csvContent = [CSV_HEADER, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `bitacora_trading_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSVToTrades = async (file: File): Promise<Trade[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) return resolve([]);

        const headers = lines[0].split(',').map(h => h.trim());
        const trades: Trade[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Basic CSV parser that handles quoted strings for notes
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            let val = values[index]?.trim() || '';
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.substring(1, val.length - 1).replace(/""/g, '"');
            }
            row[header] = val;
          });

          // Validation and Type Casting
          if (!row.asset || !row.entryPrice) continue;

          trades.push({
            id: row.id || crypto.randomUUID(),
            asset: row.asset.toUpperCase(),
            type: (row.type === 'short' ? 'short' : 'long') as TradeType,
            entryPrice: parseFloat(row.entryPrice) || 0,
            exitPrice: row.exitPrice ? parseFloat(row.exitPrice) : undefined,
            pnl: parseFloat(row.pnl) || 0,
            leverage: parseInt(row.leverage) || 1,
            usedStopLoss: row.usedStopLoss === '1' || row.usedStopLoss === 'true',
            usedTakeProfit: row.usedTakeProfit === '1' || row.usedTakeProfit === 'true',
            outcome: (row.outcome === 'bad' ? 'bad' : 'good') as TradeOutcome,
            startDate: row.startDate || new Date().toISOString(),
            endDate: row.endDate || new Date().toISOString(),
            notes: row.notes || ''
          });
        }
        resolve(trades);
      } catch (err) {
        reject(new Error('Error al procesar el archivo CSV. Revisa el formato.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsText(file);
  });
};
