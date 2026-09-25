import { Sale } from '../types';

export interface ChartPoint {
  label: string;
  rawDate: string;
  amount: number;      // amount in this bucket
  cumulative: number;  // cumulative total up to this point
  count: number;       // number of sales in this bucket
}

export interface RevenueAggregation {
  period: 'today' | '7days' | '30days';
  totalRevenue: number;
  totalSalesCount: number;
  previousPeriodRevenue: number;
  variationPct: number | null;
  points: ChartPoint[];
  maxYCeiling: number;
  hasSales: boolean;
}

export function aggregateRevenue(
  sales: Sale[],
  period: 'today' | '7days' | '30days',
  mode: 'cumulative' | 'per_unit' = 'cumulative',
  filterSource: 'all' | 'site' | 'ecommerce' = 'all',
  minYCeiling: number = 500
): RevenueAggregation {
  // Filter confirmed sales
  const validSales = sales.filter((s) => {
    if (s.status !== 'confirmada') return false;
    if (!s.paidAt) return false;
    if (filterSource === 'site' && s.source !== 'site') return false;
    if (filterSource === 'ecommerce' && s.source !== 'ecommerce') return false;
    return true;
  });

  const now = new Date();
  
  // Get current date string in America/Sao_Paulo
  const spFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });

  const parts = spFormatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => { partMap[p.type] = p.value; });

  const currentYear = parseInt(partMap.year, 10);
  const currentMonth = parseInt(partMap.month, 10) - 1; // 0-indexed
  const currentDay = parseInt(partMap.day, 10);
  const currentHour = parseInt(partMap.hour, 10);

  // Helper to parse sale date into Sao Paulo components
  const parseSaleSP = (dateStr: string) => {
    const d = new Date(dateStr);
    const p = spFormatter.formatToParts(d);
    const m: Record<string, string> = {};
    p.forEach((pt) => { m[pt.type] = pt.value; });
    return {
      year: parseInt(m.year, 10),
      month: parseInt(m.month, 10) - 1,
      day: parseInt(m.day, 10),
      hour: parseInt(m.hour, 10),
      timestamp: d.getTime(),
    };
  };

  let points: ChartPoint[] = [];
  let currentTotal = 0;
  let salesCount = 0;
  let previousPeriodTotal = 0;

  if (period === 'today') {
    // 24 buckets for today (00h..currentHour)
    const currentDayStart = new Date(Date.UTC(currentYear, currentMonth, currentDay, 0, 0, 0)).getTime();
    const prevDayStart = currentDayStart - 86400000;

    let accum = 0;
    for (let h = 0; h <= Math.min(23, currentHour); h++) {
      const hourlySales = validSales.filter((s) => {
        const sp = parseSaleSP(s.paidAt);
        return sp.year === currentYear && sp.month === currentMonth && sp.day === currentDay && sp.hour === h;
      });

      const hourlySum = hourlySales.reduce((acc, curr) => acc + curr.amount, 0);
      accum += hourlySum;
      currentTotal += hourlySum;
      salesCount += hourlySales.length;

      points.push({
        label: `${h.toString().padStart(2, '0')}:00`,
        rawDate: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')} ${h}:00`,
        amount: hourlySum,
        cumulative: accum,
        count: hourlySales.length,
      });
    }

    // Previous period (yesterday up to same hour)
    const prevSales = validSales.filter((s) => {
      const sp = parseSaleSP(s.paidAt);
      const isYesterday = sp.year === currentYear && sp.month === currentMonth && sp.day === currentDay - 1;
      return isYesterday && sp.hour <= currentHour;
    });
    previousPeriodTotal = prevSales.reduce((acc, curr) => acc + curr.amount, 0);

  } else {
    // 7 days or 30 days
    const numDays = period === '7days' ? 7 : 30;
    let accum = 0;

    // Generate days backward from today
    const dayBuckets: { dayOffset: number; dateLabel: string; year: number; month: number; day: number }[] = [];
    
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const p = spFormatter.formatToParts(d);
      const m: Record<string, string> = {};
      p.forEach((pt) => { m[pt.type] = pt.value; });
      dayBuckets.push({
        dayOffset: i,
        dateLabel: `${m.day}/${m.month}`,
        year: parseInt(m.year, 10),
        month: parseInt(m.month, 10) - 1,
        day: parseInt(m.day, 10),
      });
    }

    dayBuckets.forEach((b) => {
      const daySales = validSales.filter((s) => {
        const sp = parseSaleSP(s.paidAt);
        return sp.year === b.year && sp.month === b.month && sp.day === b.day;
      });

      const daySum = daySales.reduce((acc, curr) => acc + curr.amount, 0);
      accum += daySum;
      currentTotal += daySum;
      salesCount += daySales.length;

      points.push({
        label: b.dateLabel,
        rawDate: `${b.year}-${(b.month + 1).toString().padStart(2, '0')}-${b.day.toString().padStart(2, '0')}`,
        amount: daySum,
        cumulative: accum,
        count: daySales.length,
      });
    });

    // Previous equivalent period
    const prevStartDay = numDays * 2 - 1;
    const prevEndDay = numDays;
    
    const prevDaySales = validSales.filter((s) => {
      const d = new Date(s.paidAt);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      return diffDays >= prevEndDay && diffDays <= prevStartDay;
    });
    previousPeriodTotal = prevDaySales.reduce((acc, curr) => acc + curr.amount, 0);
  }

  let variationPct: number | null = null;
  if (previousPeriodTotal > 0) {
    variationPct = Math.round(((currentTotal - previousPeriodTotal) / previousPeriodTotal) * 100);
  }

  const maxValInPoints = Math.max(...points.map((p) => mode === 'cumulative' ? p.cumulative : p.amount), 0);
  const maxYCeiling = Math.max(minYCeiling, Math.ceil(maxValInPoints * 1.2));

  return {
    period,
    totalRevenue: currentTotal,
    totalSalesCount: salesCount,
    previousPeriodRevenue: previousPeriodTotal,
    variationPct,
    points,
    maxYCeiling,
    hasSales: currentTotal > 0,
  };
}
