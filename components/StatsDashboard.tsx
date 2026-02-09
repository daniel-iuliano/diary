
import React from 'react';
import { Trade, Statistics } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { COLORS } from '../constants';

interface Props {
  trades: Trade[];
}

const StatsDashboard: React.FC<Props> = ({ trades }) => {
  const stats: Statistics = React.useMemo(() => {
    const total = trades.length;
    if (total === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitCount: 0,
        lossCount: 0,
        goodExecutionRate: 0,
        topAssets: [],
        avgPnl: 0,
        slUsageRate: 0,
        tpUsageRate: 0,
      };
    }

    const profits = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const goodExecution = trades.filter(t => t.outcome === 'good');
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const slUsage = trades.filter(t => t.usedStopLoss).length;
    const tpUsage = trades.filter(t => t.usedTakeProfit).length;

    const assetMap: Record<string, number> = {};
    trades.forEach(t => {
      assetMap[t.asset] = (assetMap[t.asset] || 0) + 1;
    });

    const topAssets = Object.entries(assetMap)
      .map(([asset, count]) => ({ asset, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTrades: total,
      winRate: (profits.length / total) * 100,
      profitCount: profits.length,
      lossCount: losses.length,
      goodExecutionRate: (goodExecution.length / total) * 100,
      topAssets,
      avgPnl: totalPnl / total,
      slUsageRate: (slUsage / total) * 100,
      tpUsageRate: (tpUsage / total) * 100,
    };
  }, [trades]);

  const winLossData = [
    { name: 'Ganancias', value: stats.profitCount, color: COLORS.profit },
    { name: 'Pérdidas', value: stats.lossCount, color: COLORS.loss },
  ];

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-sm">Aún no hay datos para mostrar estadísticas.</p>
        <p className="text-xs mt-2">Registra tu primera operación para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Trades</p>
          <p className="text-2xl font-bold text-slate-800">{stats.totalTrades}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Win Rate</p>
          <p className="text-2xl font-bold text-emerald-500">{stats.winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estrategia Ok</p>
          <p className="text-2xl font-bold text-indigo-500">{stats.goodExecutionRate.toFixed(0)}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">P/L Promedio</p>
          <p className={`text-2xl font-bold ${stats.avgPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            ${stats.avgPnl.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Ratio Ganancias / Pérdidas</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={winLossData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {winLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-600">Ganancias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-600">Pérdidas</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Activos más operados</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topAssets} layout="vertical" margin={{ left: -20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="asset" type="category" width={60} style={{ fontSize: '10px' }} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Uso de Stop Loss</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${stats.slUsageRate}%` }}></div>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">{stats.slUsageRate.toFixed(0)}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Uso de Take Profit</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${stats.tpUsageRate}%` }}></div>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">{stats.tpUsageRate.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
