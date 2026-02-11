
import React, { useState, useEffect } from 'react';
import { Trade, Coin, TradeType, TradeOutcome } from '../types';
import { INITIAL_COINS, COLORS } from '../constants';
import { getCustomAssets, saveCustomAsset } from '../services/storageService';
import { CheckCircle, XCircle } from './Icons';

interface Props {
  onSave: (trade: Trade) => void;
  onCancel: () => void;
  initialData?: Trade;
}

const TradeForm: React.FC<Props> = ({ onSave, onCancel, initialData }) => {
  const [assetSearch, setAssetSearch] = useState(initialData?.asset || '');
  const [availableCoins, setAvailableCoins] = useState<Coin[]>([]);
  const [showAssetResults, setShowAssetResults] = useState(false);
  
  // Use strings for price and pnl state to maintain precision while typing (especially for leading zeros)
  const [entryPriceStr, setEntryPriceStr] = useState(initialData?.entryPrice?.toString() || '');
  const [exitPriceStr, setExitPriceStr] = useState(initialData?.exitPrice?.toString() || '');
  const [pnlStr, setPnlStr] = useState(initialData?.pnl?.toString() || '');

  const [formData, setFormData] = useState<Partial<Trade>>(initialData || {
    type: 'long',
    leverage: 1,
    usedStopLoss: false,
    usedTakeProfit: false,
    outcome: 'good',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false');
        if (!response.ok) throw new Error();
        const data = await response.json();
        const mapped = data.map((c: any) => ({ id: c.id, name: c.name, symbol: c.symbol.toUpperCase() }));
        const custom = getCustomAssets();
        setAvailableCoins([...mapped, ...custom]);
      } catch {
        const custom = getCustomAssets();
        setAvailableCoins([...INITIAL_COINS, ...custom]);
      }
    };
    fetchCoins();
  }, []);

  const handleAssetSelect = (coin: Coin) => {
    setAssetSearch(coin.symbol);
    setFormData({ ...formData, asset: coin.symbol });
    setShowAssetResults(false);
  };

  const handleAddCustomAsset = () => {
    if (!assetSearch) return;
    const newCoin: Coin = { id: assetSearch.toLowerCase(), name: assetSearch, symbol: assetSearch.toUpperCase() };
    saveCustomAsset(newCoin);
    setAvailableCoins([...availableCoins, newCoin]);
    setFormData({ ...formData, asset: newCoin.symbol });
    setShowAssetResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset || !entryPriceStr.trim() || pnlStr.trim() === '') {
      alert("Por favor completa los campos obligatorios (Activo, Entrada y P/L).");
      return;
    }

    const entryPrice = Number(entryPriceStr);
    const exitPrice = exitPriceStr.trim() ? Number(exitPriceStr) : undefined;
    const pnl = Number(pnlStr);

    if (!Number.isFinite(entryPrice)) {
      alert('El precio de entrada debe ser un número válido.');
      return;
    }

    if (exitPriceStr.trim() && !Number.isFinite(exitPrice)) {
      alert('El precio de cierre debe ser un número válido.');
      return;
    }

    if (!Number.isFinite(pnl)) {
      alert('El valor de Beneficio / Pérdida debe ser un número válido, positivo o negativo.');
      return;
    }

    const trade: Trade = {
      id: initialData?.id || crypto.randomUUID(),
      asset: formData.asset!,
      type: (formData.type as TradeType) || 'long',
      entryPrice,
      exitPrice,
      pnl,
      leverage: Number(formData.leverage) || 1,
      usedStopLoss: !!formData.usedStopLoss,
      usedTakeProfit: !!formData.usedTakeProfit,
      outcome: (formData.outcome as TradeOutcome) || 'good',
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate || new Date().toISOString(),
      notes: formData.notes || '',
    };

    onSave(trade);
  };

  const filteredCoins = availableCoins.filter(c => 
    c.name.toLowerCase().includes(assetSearch.toLowerCase()) || 
    c.symbol.toLowerCase().includes(assetSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* SECCIÓN 1: CONFIGURACIÓN */}
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Activo (ej: BTC, ETH)</label>
          <input
            type="text"
            value={assetSearch}
            onChange={(e) => { setAssetSearch(e.target.value); setShowAssetResults(true); }}
            onFocus={() => setShowAssetResults(true)}
            placeholder="Buscar..."
            className="w-full bg-[#ebf2fa] border-2 rounded-lg p-3 text-sm outline-none transition-all focus:border-[#76c6ff]"
            style={{ color: COLORS.brand, borderColor: COLORS.surface }}
            required
          />
          {showAssetResults && assetSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto" style={{ borderColor: COLORS.brand }}>
              {filteredCoins.map(coin => (
                <button
                  key={coin.id}
                  type="button"
                  onClick={() => handleAssetSelect(coin)}
                  className="w-full text-left p-3 text-sm hover:bg-[#ebf2fa] border-b last:border-0"
                  style={{ color: COLORS.brand, borderColor: COLORS.surface }}
                >
                  <span className="font-bold">{coin.symbol}</span> - {coin.name}
                </button>
              ))}
              {filteredCoins.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddCustomAsset}
                  className="w-full text-left p-3 text-sm font-bold hover:bg-[#ebf2fa]"
                  style={{ color: COLORS.highlight }}
                >
                  + Añadir "{assetSearch.toUpperCase()}"
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Tipo</label>
            <div className="flex bg-[#ebf2fa] p-1 rounded-lg border-2" style={{ borderColor: COLORS.surface }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'long' })}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.type === 'long' ? 'bg-white shadow-sm' : ''}`}
                style={{ color: formData.type === 'long' ? COLORS.accent : COLORS.brand }}
              >
                LONG
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'short' })}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.type === 'short' ? 'bg-white shadow-sm' : ''}`}
                style={{ color: formData.type === 'short' ? COLORS.risk : COLORS.brand }}
              >
                SHORT
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Apalancamiento</label>
            <input
              type="number"
              value={formData.leverage}
              onChange={(e) => setFormData({ ...formData, leverage: Number(e.target.value) })}
              className="w-full bg-[#ebf2fa] border-2 rounded-lg p-2.5 text-sm outline-none transition-all focus:border-[#76c6ff]"
              style={{ color: COLORS.brand, borderColor: COLORS.surface }}
              min="1"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: EJECUCIÓN (PRECIOS Y FECHAS) */}
      <div className="p-4 rounded-xl border-2 space-y-4" style={{ borderColor: COLORS.surface }}>
        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: COLORS.risk }}>Detalles de Ejecución</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Precio Entrada</label>
            <input
              type="number"
              step="any"
              value={entryPriceStr}
              onChange={(e) => setEntryPriceStr(e.target.value)}
              className="w-full bg-white border-2 rounded-lg p-2.5 text-sm outline-none focus:border-[#76c6ff]"
              style={{ color: COLORS.brand, borderColor: COLORS.surface }}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Precio Cierre</label>
            <input
              type="number"
              step="any"
              value={exitPriceStr}
              onChange={(e) => setExitPriceStr(e.target.value)}
              className="w-full bg-white border-2 rounded-lg p-2.5 text-sm outline-none focus:border-[#76c6ff]"
              style={{ color: COLORS.brand, borderColor: COLORS.surface }}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Fecha Entrada</label>
            <input
              type="datetime-local"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-white border-2 rounded-lg p-2.5 text-[10px] outline-none font-bold"
              style={{ color: COLORS.brand, borderColor: COLORS.surface }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Fecha Cierre</label>
            <input
              type="datetime-local"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full bg-white border-2 rounded-lg p-2.5 text-[10px] outline-none font-bold"
              style={{ color: COLORS.brand, borderColor: COLORS.surface }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Beneficio / Pérdida Final ($)</label>
          <input
            type="number"
            step="any"
            value={pnlStr}
            onChange={(e) => setPnlStr(e.target.value)}
            className="w-full bg-[#ebf2fa] border-2 rounded-lg p-3 text-base outline-none font-black transition-all focus:border-[#76c6ff]"
            style={{ 
              color: Number(pnlStr) >= 0 ? COLORS.accent : COLORS.risk,
              borderColor: COLORS.surface 
            }}
            placeholder="Ej: 150.50 o -50.00"
            required
          />
        </div>
      </div>

      {/* SECCIÓN 3: ESTRATEGIA Y GESTIÓN */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.usedStopLoss ? 'bg-[#ebf2fa]' : 'bg-white'}`} style={{ borderColor: formData.usedStopLoss ? COLORS.brand : COLORS.surface }}>
            <span className="text-xs font-bold" style={{ color: COLORS.brand }}>Usé SL</span>
            <input
              type="checkbox"
              checked={formData.usedStopLoss}
              onChange={(e) => setFormData({ ...formData, usedStopLoss: e.target.checked })}
              className="sr-only"
            />
            <div className="w-8 h-4 rounded-full relative transition-colors" style={{ backgroundColor: formData.usedStopLoss ? COLORS.highlight : COLORS.surface }}>
              <div className={`absolute top-1 left-1 w-2 h-2 bg-white rounded-full transition-transform ${formData.usedStopLoss ? 'translate-x-4' : ''}`}></div>
            </div>
          </label>
          <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.usedTakeProfit ? 'bg-[#ebf2fa]' : 'bg-white'}`} style={{ borderColor: formData.usedTakeProfit ? COLORS.brand : COLORS.surface }}>
            <span className="text-xs font-bold" style={{ color: COLORS.brand }}>Usé TP</span>
            <input
              type="checkbox"
              checked={formData.usedTakeProfit}
              onChange={(e) => setFormData({ ...formData, usedTakeProfit: e.target.checked })}
              className="sr-only"
            />
            <div className="w-8 h-4 rounded-full relative transition-colors" style={{ backgroundColor: formData.usedTakeProfit ? COLORS.highlight : COLORS.surface }}>
              <div className={`absolute top-1 left-1 w-2 h-2 bg-white rounded-full transition-transform ${formData.usedTakeProfit ? 'translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.brand }}>¿Seguiste tu estrategia?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, outcome: 'good' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.outcome === 'good' ? 'bg-[#ebf2fa]' : 'bg-white'}`}
              style={{ 
                color: formData.outcome === 'good' ? COLORS.brand : COLORS.brand + '80',
                borderColor: formData.outcome === 'good' ? COLORS.brand : COLORS.surface
              }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: COLORS.accent }} />
              Acertada
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, outcome: 'bad' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.outcome === 'bad' ? 'bg-[#ebf2fa]' : 'bg-white'}`}
              style={{ 
                color: formData.outcome === 'bad' ? COLORS.brand : COLORS.brand + '80',
                borderColor: formData.outcome === 'bad' ? COLORS.brand : COLORS.surface
              }}
            >
              <XCircle className="w-5 h-5" style={{ color: COLORS.risk }} />
              Fallo
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: COLORS.brand }}>Notas de la sesión</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Psicología, errores cometidos o aciertos..."
            rows={3}
            className="w-full bg-[#ebf2fa] border-2 rounded-lg p-3 text-sm outline-none resize-none transition-all focus:border-[#76c6ff]"
            style={{ color: COLORS.brand, borderColor: COLORS.surface }}
          ></textarea>
        </div>
      </div>

      {/* ACCIONES FINALES */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="p-4 bg-[#ebf2fa] rounded-2xl font-bold text-sm"
          style={{ color: COLORS.brand }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="p-4 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-transform"
          style={{ backgroundColor: COLORS.brand }}
        >
          Guardar Trade
        </button>
      </div>
    </form>
  );
};

export default TradeForm;
