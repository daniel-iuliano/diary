
import React, { useState } from 'react';
import { Trade } from '../types';
import { ChevronDown, TrashIcon, CheckCircle, XCircle, HistoryIcon } from './Icons';
import { COLORS } from '../constants';

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
    <div className="bg-white rounded-xl border-2 shadow-sm overflow-hidden mb-3 transition-all" style={{ borderColor: COLORS.surface }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: isProfit ? COLORS.accent : COLORS.risk }}></div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base" style={{ color: COLORS.brand }}>{trade.asset}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.surface, color: COLORS.brand }}>
                {trade.type.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold" style={{ color: COLORS.risk + '80' }}>{trade.leverage}x</span>
            </div>
            <p className="text-[10px] mt-0.5 font-bold" style={{ color: COLORS.risk + '60' }}>{formatDate(trade.startDate)}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-3">
          <div>
            <p className="font-bold text-base" style={{ color: isProfit ? COLORS.accent : COLORS.risk }}>
              {isProfit ? '+' : ''}{trade.pnl.toFixed(2)} USD
            </p>
            <div className="flex justify-end mt-0.5">
              {trade.outcome === 'good' ? (
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-bold uppercase" style={{ color: COLORS.accent }}>ESTRATEGIA OK</span>
                  <CheckCircle className="w-3 h-3" style={{ color: COLORS.accent }} />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-bold uppercase" style={{ color: COLORS.risk }}>SIN DISCIPLINA</span>
                  <XCircle className="w-3 h-3" style={{ color: COLORS.risk }} />
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform" style={{ color: COLORS.brand, transform: isOpen ? 'rotate(180deg)' : 'none' }} />
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t bg-[#ebf2fa]/40" style={{ borderColor: COLORS.surface }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase" style={{ color: COLORS.risk + '80' }}>Entrada</p>
              <p className="text-xs font-bold" style={{ color: COLORS.brand }}>${trade.entryPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase" style={{ color: COLORS.risk + '80' }}>Cierre</p>
              <p className="text-xs font-bold" style={{ color: COLORS.brand }}>{formatDate(trade.endDate)}</p>
            </div>
          </div>

          {trade.notes && (
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: COLORS.risk + '80' }}>Notas</p>
              <p className="text-xs italic leading-relaxed bg-white p-3 rounded-lg border-2" style={{ color: COLORS.brand, borderColor: COLORS.surface }}>"{trade.notes}"</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button 
              onClick={() => onEdit(trade)}
              className="flex-1 py-2 text-xs font-bold bg-white border-2 rounded-lg transition-all active:scale-95 shadow-sm"
              style={{ color: COLORS.brand, borderColor: COLORS.brand }}
            >
              Editar
            </button>
            <button 
              onClick={() => { if(confirm('¿Seguro?')) onDelete(trade.id); }}
              className="px-3 py-2 bg-white border-2 rounded-lg transition-all active:scale-95 shadow-sm"
              style={{ color: COLORS.risk, borderColor: COLORS.risk }}
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
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.surface }}>
          <HistoryIcon className="w-8 h-8" style={{ color: COLORS.brand }} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: COLORS.brand }}>Historial vacío</h3>
        <p className="text-xs mt-1 font-medium" style={{ color: COLORS.risk + '80' }}>Tus operaciones cerradas aparecerán aquí.</p>
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
