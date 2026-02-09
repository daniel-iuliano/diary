
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
    { name: 'Ganancias', value: stats.profitCount, color: COLORS.accent },
    { name: 'Pérdidas', value: stats.lossCount, color: COLORS.risk },
  ];

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-sm font-bold" style={{ color: COLORS.brand }}>Aún no hay datos.</p>
        <p className="text-xs mt-2 font-bold" style={{ color: COLORS.risk + '80' }}>Registra tu primera operación para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border-2 shadow-sm" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.brand }}>
          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: COLORS.brand }}>Total Trades</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.brand }}>{stats.totalTrades}</p>
        </div>
        <div className="p-4 rounded-xl border-2 shadow-sm" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.accent }}>
          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: COLORS.brand }}>Win Rate</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{stats.winRate.toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-xl border-2 shadow-sm" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.highlight }}>
          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: COLORS.brand }}>Acertada</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.highlight }}>{stats.goodExecutionRate.toFixed(0)}%</p>
        </div>
        <div className="p-4 rounded-xl border-2 shadow-sm" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.risk }}>
          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: COLORS.brand }}>P/L Promedio</p>
          <p className="text-2xl font-bold" style={{ color: stats.avgPnl >= 0 ? COLORS.accent : COLORS.risk }}>
            ${stats.avgPnl.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border-2" style={{ borderColor: COLORS.surface }}>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-tighter" style={{ color: COLORS.brand }}>Win / Loss Ratio</h3>
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
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke={COLORS.white} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.accent }}></div>
            <span className="text-[10px] font-bold" style={{ color: COLORS.brand }}>GANANCIAS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.risk }}></div>
            <span className="text-[10px] font-bold" style={{ color: COLORS.brand }}>PÉRDIDAS</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border-2" style={{ borderColor: COLORS.surface }}>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-tighter" style={{ color: COLORS.brand }}>Distribución Activos</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topAssets} layout="vertical" margin={{ left: -20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="asset" type="category" width={60} style={{ fontSize: '10px', fontWeight: 'bold', fill: COLORS.brand }} />
              <Tooltip cursor={{ fill: COLORS.surface }} />
              <Bar dataKey="count" fill={COLORS.brand} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
