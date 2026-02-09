
import React, { useState, useEffect } from 'react';
import { Trade } from './types';
import { getTrades, saveTrade, deleteTrade } from './services/storageService';
import Header from './components/Header';
import TradeForm from './components/TradeForm';
import TradeHistory from './components/TradeHistory';
import StatsDashboard from './components/StatsDashboard';
import { PlusIcon, HistoryIcon, ChartIcon } from './components/Icons';

type Tab = 'history' | 'add' | 'stats';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);

  useEffect(() => {
    setTrades(getTrades());
  }, []);

  const handleSaveTrade = (trade: Trade) => {
    saveTrade(trade);
    setTrades(getTrades());
    setActiveTab('history');
    setEditingTrade(undefined);
  };

  const handleDeleteTrade = (id: string) => {
    deleteTrade(id);
    setTrades(getTrades());
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setActiveTab('add');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative pb-20 overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bitácora</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Trading Diario</p>
          </div>
          <div className="bg-slate-100 px-3 py-1.5 rounded-full">
            <p className="text-[10px] font-bold text-slate-500">{trades.length} OPERACIONES</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-6">
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Historial Reciente</h2>
            </div>
            <TradeHistory 
              trades={trades} 
              onDelete={handleDeleteTrade} 
              onEdit={handleEditTrade} 
            />
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6">
              {editingTrade ? 'Editar Operación' : 'Registrar Operación'}
            </h2>
            <TradeForm 
              onSave={handleSaveTrade} 
              onCancel={() => { setActiveTab('history'); setEditingTrade(undefined); }} 
              initialData={editingTrade}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6">Métricas de Rendimiento</h2>
            <StatsDashboard trades={trades} />
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-8 py-3 flex justify-between items-center z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <HistoryIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Historial</span>
        </button>

        <button 
          onClick={() => { setEditingTrade(undefined); setActiveTab('add'); }}
          className={`relative -top-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-all ${activeTab === 'add' ? 'rotate-45 bg-slate-800' : ''}`}
        >
          <PlusIcon className="w-8 h-8" />
        </button>

        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <ChartIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Métricas</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
