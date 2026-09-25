import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChartPoint, aggregateRevenue } from '../../utils/revenue';
import { formatBRL } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Sale } from '../../types';

interface RevenueChartProps {
  sales: Sale[];
  selectedPeriod: 'today' | '7days' | '30days';
  minYCeiling?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  sales,
  selectedPeriod,
  minYCeiling = 500,
}) => {
  const [mode, setMode] = useState<'cumulative' | 'per_unit'>('cumulative');
  const [filterSource, setFilterSource] = useState<'all' | 'site' | 'ecommerce'>('all');
  const [displayValue, setDisplayValue] = useState(0);

  const aggregation = aggregateRevenue(sales, selectedPeriod, mode, filterSource, minYCeiling);

  // Animated count-up effect
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600;
    const startVal = displayValue;
    const endVal = aggregation.totalRevenue;

    if (startVal === endVal) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = startVal + (endVal - startVal) * progress;
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [aggregation.totalRevenue]);

  const periodLabels = {
    today: 'faturado — Hoje',
    '7days': 'faturado — Últimos 7 dias',
    '30days': 'faturado — Últimos 30 dias',
  };

  const modeLabels = {
    today: mode === 'cumulative' ? 'Acumulado' : 'Por hora',
    '7days': mode === 'cumulative' ? 'Acumulado' : 'Por dia',
    '30days': mode === 'cumulative' ? 'Acumulado' : 'Por dia',
  };

  return (
    <div className="card-surface p-6 sm:p-8 rounded-2xl relative overflow-hidden flex flex-col min-h-[380px]">
      {/* Decorative subtle blue radial glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#1769FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 z-10">
        <div>
          <span className="text-xs font-medium text-[#8B8B95] tracking-wide uppercase">
            {periodLabels[selectedPeriod]}
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h2
              className={`font-sora text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums transition-all ${
                displayValue > 0
                  ? 'text-white drop-shadow-[0_0_20px_rgba(61,139,255,0.4)]'
                  : 'text-[#C9C9CF]'
              }`}
            >
              {formatBRL(displayValue)}
            </h2>

            {/* Variation chip */}
            {aggregation.variationPct !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  aggregation.variationPct > 0
                    ? 'bg-[#2FBF71]/15 text-[#2FBF71] border border-[#2FBF71]/30'
                    : aggregation.variationPct < 0
                    ? 'bg-[#FF6B57]/15 text-[#FF6B57] border border-[#FF6B57]/30'
                    : 'bg-[#26262B] text-[#8B8B95]'
                }`}
              >
                {aggregation.variationPct > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : aggregation.variationPct < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                {aggregation.variationPct > 0 ? '+' : ''}
                {aggregation.variationPct}%
              </span>
            )}
          </div>
        </div>

        {/* Right Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="bg-[#18181B] p-1 rounded-xl border border-[#26262B] flex items-center">
            <button
              onClick={() => setMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'cumulative'
                  ? 'bg-[#1769FF] text-white shadow-[0_0_12px_rgba(23,105,255,0.4)]'
                  : 'text-[#8B8B95] hover:text-white'
              }`}
            >
              Acumulado
            </button>
            <button
              onClick={() => setMode('per_unit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'per_unit'
                  ? 'bg-[#1769FF] text-white shadow-[0_0_12px_rgba(23,105,255,0.4)]'
                  : 'text-[#8B8B95] hover:text-white'
              }`}
            >
              {modeLabels[selectedPeriod]}
            </button>
          </div>

          {/* Source filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as any)}
            className="bg-[#18181B] border border-[#26262B] text-[#C9C9CF] text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-[#3D8BFF]"
          >
            <option value="all">Tudo</option>
            <option value="site">Sites</option>
            <option value="ecommerce">E-commerce</option>
          </select>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full flex-1 min-h-[260px] relative z-10 flex flex-col justify-center">
        {!aggregation.hasSales && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <p className="text-xs sm:text-sm text-[#8B8B95] bg-[#111113]/90 border border-[#26262B] px-4 py-2 rounded-xl text-center max-w-md shadow-lg">
              Nenhuma venda neste período. Quando você registrar ou receber vendas, o gráfico sobe automaticamente.
            </p>
          </div>
        )}

        <ResponsiveContainer width="100%" height={280}>
          {mode === 'cumulative' ? (
            <AreaChart data={aggregation.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D8BFF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3D8BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262B" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#5E5E68"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#5E5E68"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, aggregation.maxYCeiling]}
                tickFormatter={(val) => `R$ ${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data: ChartPoint = payload[0].payload;
                    return (
                      <div className="bg-[#18181B] border border-[#3D8BFF]/40 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-white font-sora">{data.label}</p>
                        <p className="text-[#3D8BFF] font-semibold">
                          Acumulado: {formatBRL(data.cumulative)}
                        </p>
                        <p className="text-[#2FBF71]">
                          No ponto: {formatBRL(data.amount)} ({data.count} vendas)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#3D8BFF"
                strokeWidth={3}
                fill="url(#blueGradient)"
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          ) : (
            <BarChart data={aggregation.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262B" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#5E5E68"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#5E5E68"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, aggregation.maxYCeiling]}
                tickFormatter={(val) => `R$ ${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data: ChartPoint = payload[0].payload;
                    return (
                      <div className="bg-[#18181B] border border-[#3D8BFF]/40 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-white font-sora">{data.label}</p>
                        <p className="text-[#3D8BFF] font-semibold">
                          Valor: {formatBRL(data.amount)}
                        </p>
                        <p className="text-[#8B8B95]">{data.count} vendas registradas</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="amount"
                fill="#1769FF"
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
                animationDuration={600}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
