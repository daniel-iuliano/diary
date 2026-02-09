
import React, { useState } from 'react';
import { Trade } from '../types';
import { ChevronDown, TrashIcon, CheckCircle, XCircle } from './Icons';

interface Props {
  trades: Trade[];
  onDelete: (id: string) => void;
  onEdit: (trade: Trade) => void;
}

const TradeCard: React.FC<{ trade: Trade; onDelete: (id: string) => void; onEdit: (trade: Trade) => void }> = ({ trade, onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isProfit = trade.pnl >= 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-3 transition-all ${isOpen ? 'ring-1 ring-slate-200' : ''}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-10 rounded-full ${isProfit ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 text-base">{trade.asset}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trade.type === 'long' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {trade.type.toUpperCase()}
              </span>
              <span className="text-[10px] font-medium text-slate-400">{trade.leverage}x</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(trade.startDate)}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-3">
          <div>
            <p className={`font-bold text-base ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{trade.pnl.toFixed(2)} USD
            </p>
            <div className="flex justify-end mt-0.5">
              {trade.outcome === 'good' ? (
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Entrada</p>
              <p className="text-xs font-semibold text-slate-700">${trade.entryPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Cierre</p>
              <p className="text-xs font-semibold text-slate-700">{formatDate(trade.endDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Gestión</p>
              <div className="flex gap-2 mt-1">
                {trade.usedStopLoss && <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-bold">SL</span>}
                {trade.usedTakeProfit && <span className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-bold">TP</span>}
                {!trade.usedStopLoss && !trade.usedTakeProfit && <span className="text-slate-400 text-[9px]">Sin SL/TP</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Disciplina</p>
              <p className={`text-[10px] font-bold mt-1 ${trade.outcome === 'good' ? 'text-indigo-600' : 'text-amber-600'}`}>
                {trade.outcome === 'good' ? 'ESTRATEGIA OK' : 'MAL EJECUTADO'}
              </p>
            </div>
          </div>

          {trade.notes && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notas</p>
              <p className="text-xs text-slate-600 italic leading-relaxed bg-white p-2 rounded-lg border border-slate-100">"{trade.notes}"</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button 
              onClick={() => onEdit(trade)}
              className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-50"
            >
              Editar
            </button>
            <button 
              onClick={() => { if(confirm('¿Seguro?')) onDelete(trade.id); }}
              className="px-3 py-2 text-red-500 bg-white border border-red-100 rounded-lg hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TradeHistory: React.FC<Props> = ({ trades, onDelete, onEdit }) => {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 px-6 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <TrashIcon className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-600">Historial vacío</h3>
        <p className="text-xs mt-1">Tus operaciones cerradas aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {trades.map(trade => (
        <TradeCard key={trade.id} trade={trade} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default TradeHistory;
