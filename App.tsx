
import React, { useState, useEffect, useRef } from 'react';
import { Trade } from './types';
import { getTrades, saveTrade, deleteTrade } from './services/storageService';
import { exportTradesToCSV, parseCSVToTrades } from './services/exportService';
import TradeForm from './components/TradeForm';
import TradeHistory from './components/TradeHistory';
import StatsDashboard from './components/StatsDashboard';
import { PlusIcon, HistoryIcon, ChartIcon, CogIcon, ExportIcon, ImportIcon } from './components/Icons';
import { COLORS } from './constants';

type Tab = 'history' | 'add' | 'stats' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTrades(getTrades());
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSaveTrade = (trade: Trade) => {
    saveTrade(trade);
    setTrades(getTrades());
    setActiveTab('history');
    setEditingTrade(undefined);
    setFeedback({ msg: 'Operación guardada con éxito', type: 'success' });
  };

  const handleDeleteTrade = (id: string) => {
    deleteTrade(id);
    setTrades(getTrades());
    setFeedback({ msg: 'Operación eliminada', type: 'success' });
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setActiveTab('add');
  };

  const handleExport = () => {
    if (trades.length === 0) {
      setFeedback({ msg: 'No hay operaciones para exportar', type: 'error' });
      return;
    }
    exportTradesToCSV(trades);
    setFeedback({ msg: 'Archivo exportado correctamente', type: 'success' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedTrades = await parseCSVToTrades(file);
      if (importedTrades.length === 0) {
        setFeedback({ msg: 'El archivo no contiene operaciones válidas', type: 'error' });
        return;
      }

      const currentTrades = getTrades();
      const currentIds = new Set(currentTrades.map(t => t.id));
      
      let newCount = 0;
      importedTrades.forEach(t => {
        if (!currentIds.has(t.id)) {
          saveTrade(t);
          newCount++;
        }
      });

      setTrades(getTrades());
      setFeedback({ msg: `Importación exitosa: ${newCount} nuevas operaciones`, type: 'success' });
      setActiveTab('history');
    } catch (err: any) {
      setFeedback({ msg: err.message, type: 'error' });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Helper to toggle the settings tab
  const toggleSettings = () => {
    setActiveTab((current) => (current === 'settings' ? 'history' : 'settings'));
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col relative pb-20 overflow-x-hidden border-x" style={{ borderColor: COLORS.surface }}>
      {/* Feedback Toast */}
      {feedback && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg shadow-lg text-white font-bold text-xs transition-all border"
          style={{ 
            backgroundColor: feedback.type === 'success' ? COLORS.accent : COLORS.risk,
            borderColor: COLORS.brand
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b px-6 py-4" style={{ borderColor: COLORS.surface }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: COLORS.brand }}>Bitácora</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80" style={{ color: COLORS.risk }}>Trading Diario</p>
          </div>
          <button 
            onClick={toggleSettings}
            className={`p-2 rounded-full transition-colors ${activeTab === 'settings' ? 'bg-[#ebf2fa]' : 'hover:bg-[#ebf2fa]'}`}
            style={{ color: activeTab === 'settings' ? COLORS.brand : COLORS.risk }}
            aria-label="Configuración"
          >
            <CogIcon />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-6">
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-tight" style={{ color: COLORS.brand }}>Historial Reciente</h2>
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
            <h2 className="text-sm font-bold uppercase tracking-tight mb-6" style={{ color: COLORS.brand }}>
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
            <h2 className="text-sm font-bold uppercase tracking-tight mb-6" style={{ color: COLORS.brand }}>Métricas de Rendimiento</h2>
            <StatsDashboard trades={trades} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 pb-12">
            <h2 className="text-sm font-bold uppercase tracking-tight mb-6" style={{ color: COLORS.brand }}>Configuración y Datos</h2>
            
            <div className="bg-[#ebf2fa] p-5 rounded-2xl border space-y-4" style={{ borderColor: COLORS.brand }}>
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: COLORS.brand }}>Gestión de Archivos</h3>
              <p className="text-xs leading-relaxed" style={{ color: COLORS.brand }}>
                Exporta tus operaciones a un archivo CSV compatible con Excel o importa registros externos.
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button 
                  onClick={handleExport}
                  className="flex items-center justify-center gap-3 w-full p-4 bg-white rounded-xl border-2 font-bold text-sm shadow-sm transition-all active:scale-95"
                  style={{ color: COLORS.brand, borderColor: COLORS.brand }}
                >
                  <ExportIcon className="w-5 h-5" />
                  Exportar a CSV
                </button>
                
                <button 
                  onClick={handleImportClick}
                  className="flex items-center justify-center gap-3 w-full p-4 bg-white rounded-xl border-2 font-bold text-sm shadow-sm transition-all active:scale-95"
                  style={{ color: COLORS.risk, borderColor: COLORS.risk }}
                >
                  <ImportIcon className="w-5 h-5" />
                  Importar desde CSV
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border" style={{ borderColor: COLORS.surface }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: COLORS.risk }}>Sobre la App</h3>
              <p className="text-xs leading-relaxed" style={{ color: COLORS.brand }}>
                CriptoBitácora es una herramienta de diario local. Tus datos nunca salen de este navegador. 
                Recuerda exportar regularmente para tener copias de seguridad.
              </p>
            </div>
            
            <div className="flex justify-center pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: COLORS.brand }}>Versión 1.3.0 • Optimized Roles</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-8 py-3 flex justify-between items-center z-40" style={{ borderColor: COLORS.surface }}>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'scale-110' : ''}`}
          style={{ color: activeTab === 'history' ? COLORS.brand : COLORS.risk + '80' }}
        >
          <HistoryIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Historial</span>
        </button>

        <button 
          onClick={() => { setEditingTrade(undefined); setActiveTab('add'); }}
          className={`relative -top-6 w-14 h-14 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all ${activeTab === 'add' ? 'rotate-45' : ''}`}
          style={{ backgroundColor: activeTab === 'add' ? COLORS.brand : COLORS.highlight }}
        >
          <PlusIcon className="w-8 h-8" />
        </button>

        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'scale-110' : ''}`}
          style={{ color: activeTab === 'stats' ? COLORS.brand : COLORS.risk + '80' }}
        >
          <ChartIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Métricas</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
