
import React, { useState, useEffect } from 'react';
import { Trade, Coin, TradeType, TradeOutcome } from '../types';
import { INITIAL_COINS } from '../constants';
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
    alert(`Activo ${newCoin.symbol} añadido correctamente.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset || !formData.entryPrice || !formData.pnl) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const trade: Trade = {
      id: initialData?.id || crypto.randomUUID(),
      asset: formData.asset!,
      type: (formData.type as TradeType) || 'long',
      entryPrice: Number(formData.entryPrice),
      exitPrice: Number(formData.exitPrice) || undefined,
      pnl: Number(formData.pnl),
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
    <form onSubmit={handleSubmit} className="space-y-5 pb-24">
      {/* Activo / Par */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Activo (ej: BTC, ETH)</label>
        <input
          type="text"
          value={assetSearch}
          onChange={(e) => { setAssetSearch(e.target.value); setShowAssetResults(true); }}
          onFocus={() => setShowAssetResults(true)}
          placeholder="Buscar o añadir..."
          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          required
        />
        {showAssetResults && assetSearch && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredCoins.map(coin => (
              <button
                key={coin.id}
                type="button"
                onClick={() => handleAssetSelect(coin)}
                className="w-full text-left p-3 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0"
              >
                <span className="font-bold">{coin.symbol}</span> - {coin.name}
              </button>
            ))}
            {filteredCoins.length === 0 && (
              <button
                type="button"
                onClick={handleAddCustomAsset}
                className="w-full text-left p-3 text-sm text-indigo-600 font-medium hover:bg-slate-50"
              >
                + Añadir "{assetSearch.toUpperCase()}" manualmente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tipo de Operación y Apalancamiento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'long' })}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.type === 'long' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              LONG
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'short' })}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.type === 'short' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
            >
              SHORT
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apalancamiento</label>
          <input
            type="number"
            value={formData.leverage}
            onChange={(e) => setFormData({ ...formData, leverage: Number(e.target.value) })}
            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            min="1"
            max="125"
          />
        </div>
      </div>

      {/* Precios y P/L */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Entrada</label>
          <input
            type="number"
            step="any"
            value={formData.entryPrice || ''}
            onChange={(e) => setFormData({ ...formData, entryPrice: Number(e.target.value) })}
            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pérdida / Ganancia ($)</label>
          <input
            type="number"
            step="any"
            value={formData.pnl || ''}
            onChange={(e) => setFormData({ ...formData, pnl: Number(e.target.value) })}
            className={`w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none font-bold ${formData.pnl && formData.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
            placeholder="Ej: 50 o -20"
            required
          />
        </div>
      </div>

      {/* Switches para SL/TP */}
      <div className="grid grid-cols-2 gap-3">
        <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.usedStopLoss ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
          <span className="text-xs font-bold text-slate-600">Usé SL</span>
          <input
            type="checkbox"
            checked={formData.usedStopLoss}
            onChange={(e) => setFormData({ ...formData, usedStopLoss: e.target.checked })}
            className="sr-only"
          />
          <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.usedStopLoss ? 'bg-indigo-500' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 left-1 w-2 h-2 bg-white rounded-full transition-transform ${formData.usedStopLoss ? 'translate-x-4' : ''}`}></div>
          </div>
        </label>
        <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.usedTakeProfit ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
          <span className="text-xs font-bold text-slate-600">Usé TP</span>
          <input
            type="checkbox"
            checked={formData.usedTakeProfit}
            onChange={(e) => setFormData({ ...formData, usedTakeProfit: e.target.checked })}
            className="sr-only"
          />
          <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.usedTakeProfit ? 'bg-indigo-500' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 left-1 w-2 h-2 bg-white rounded-full transition-transform ${formData.usedTakeProfit ? 'translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>

      {/* Evaluación de Estrategia */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">¿Seguiste tu estrategia?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, outcome: 'good' })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${formData.outcome === 'good' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-100 text-slate-500'}`}
          >
            <CheckCircle className="w-5 h-5" />
            Bien ejecutada
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, outcome: 'bad' })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${formData.outcome === 'bad' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-100 text-slate-500'}`}
          >
            <XCircle className="w-5 h-5" />
            Mal ejecutada
          </button>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apertura</label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cierre</label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas (opcional)</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="¿Qué sentiste? ¿Por qué entraste?"
          rows={3}
          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="p-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-transform"
        >
          Guardar Registro
        </button>
      </div>
    </form>
  );
};

export default TradeForm;
