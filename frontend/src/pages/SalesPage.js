import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ErrorBlock, LoadingBlock } from '../components/ui/StateBlock';
import { getInventoryAnalytics, getRevenueAnalytics } from '../lib/api';
import { formatCompactMoney, formatCurrency, formatNumber, formatShortDate } from '../lib/format';

const filters = [
  { key: 'daily', granularity: 'day' },
  { key: 'weekly', granularity: 'week' },
  { key: 'monthly', granularity: 'month' }
];

const iconMap = {
  revenue: DollarSign,
  orders: ShoppingCart,
  aov: TrendingUp
};

const colorMap = {
  indigo: { panel: '#eef2ff', icon: '#6366f1' },
  purple: { panel: '#f3e8ff', icon: '#a855f7' },
  emerald: { panel: '#ecfdf5', icon: '#10b981' }
};

function pctChange(current, previous) {
  const safeCurrent = Number(current || 0);
  const safePrevious = Number(previous || 0);

  if (safePrevious === 0) {
    return safeCurrent === 0 ? 0 : 100;
  }

  return ((safeCurrent - safePrevious) / safePrevious) * 100;
}

function periodLabel(period, granularity) {
  if (!period) return '-';

  if (granularity === 'week') {
    const value = String(period);
    if (/^\d{6}$/.test(value)) {
      const year = value.slice(0, 4);
      const week = value.slice(4);
      return `W${week}/${year.slice(-2)}`;
    }
    return value;
  }

  if (granularity === 'month') {
    const value = String(period);
    if (/^\d{4}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-');
      return `${month}/${year.slice(-2)}`;
    }
  }

  return formatShortDate(period);
}

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, boxShadow: '0 12px 28px rgba(15,23,42,0.08)', padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ fontSize: 12, fontWeight: 600, color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </div>
      ))}
    </div>
  );
}

function SalesKpiCard({ item }) {
  const Icon = iconMap[item.iconKey];
  const colors = colorMap[item.color] || colorMap.indigo;
  const isUp = Number(item.change) >= 0;

  return (
    <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.panel, display: 'grid', placeItems: 'center' }}>
          <Icon size={18} color={colors.icon} />
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 999,
            padding: '4px 8px',
            background: isUp ? '#ecfdf5' : '#fef2f2',
            color: isUp ? '#059669' : '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {isUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(Number(item.change || 0)).toFixed(1)}%
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#1f2937' }}>{item.value}</div>
      <div style={{ marginTop: 3, fontSize: 13, color: '#6b7280' }}>{item.label}</div>
    </div>
  );
}

export default function SalesPage() {
  const [filter, setFilter] = useState('monthly');
  const [revenue, setRevenue] = useState({ items: [] });
  const [inventory, setInventory] = useState({ categorySales: [], productPerformance: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const activeGranularity = useMemo(
    () => filters.find((item) => item.key === filter)?.granularity || 'month',
    [filter]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError('');

        const [revenueData, inventoryData] = await Promise.all([
          getRevenueAnalytics({ granularity: activeGranularity }),
          getInventoryAnalytics()
        ]);

        if (!active) return;

        setRevenue(revenueData || { items: [] });
        setInventory(inventoryData || { categorySales: [], productPerformance: [] });
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load sales analytics.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [activeGranularity]);

  const kpis = useMemo(() => {
    const items = revenue.items || [];
    const totalRevenue = items.reduce((sum, item) => sum + Number(item.totalRevenue || 0), 0);
    const totalOrders = items.reduce((sum, item) => sum + Number(item.totalOrders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const current = items[items.length - 1] || {};
    const previous = items[items.length - 2] || {};

    const currentRevenue = Number(current.totalRevenue || 0);
    const previousRevenue = Number(previous.totalRevenue || 0);
    const currentOrders = Number(current.totalOrders || 0);
    const previousOrders = Number(previous.totalOrders || 0);
    const currentAov = currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const previousAov = previousOrders > 0 ? previousRevenue / previousOrders : 0;

    return [
      {
        label: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: pctChange(currentRevenue, previousRevenue),
        iconKey: 'revenue',
        color: 'indigo'
      },
      {
        label: 'Total Orders',
        value: formatNumber(totalOrders),
        change: pctChange(currentOrders, previousOrders),
        iconKey: 'orders',
        color: 'purple'
      },
      {
        label: 'Avg. Order Value',
        value: formatCurrency(avgOrderValue),
        change: pctChange(currentAov, previousAov),
        iconKey: 'aov',
        color: 'emerald'
      }
    ];
  }, [revenue.items]);

  const trendData = useMemo(
    () =>
      (revenue.items || []).map((item) => ({
        label: periodLabel(item.period, activeGranularity),
        revenue: Number(item.totalRevenue || 0)
      })),
    [activeGranularity, revenue.items]
  );

  const productPerformance = useMemo(
    () =>
      (inventory.productPerformance || [])
        .slice(0, 8)
        .map((item) => ({ ...item, revenue: Number(item.revenue || 0) })),
    [inventory.productPerformance]
  );

  const maxCategoryRevenue = useMemo(
    () => (inventory.categorySales || []).reduce((max, item) => Math.max(max, Number(item.totalRevenue || 0)), 0),
    [inventory.categorySales]
  );

  return (
    <div style={{ padding: '16px 24px 24px', display: 'grid', gap: 24, maxWidth: 1600, margin: '0 auto' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Sales Analytics</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>Detailed breakdown of your sales performance and trends.</p>
      </div>

      {error && <ErrorBlock message={error} />}

      {isLoading ? (
        <LoadingBlock height={110} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {kpis.map((item) => (
            <SalesKpiCard key={item.label} item={item} />
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Revenue Trend</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Track your revenue performance over time</p>
          </div>

          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 4 }}>
            {filters.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                style={{
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  background: filter === item.key ? '#fff' : 'transparent',
                  color: filter === item.key ? '#1f2937' : '#6b7280',
                  textTransform: 'capitalize',
                  fontSize: 13,
                  fontWeight: filter === item.key ? 500 : 400,
                  cursor: 'pointer'
                }}
              >
                {item.key}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingBlock height={280} />
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCompactMoney(v)}
                />
                <Tooltip content={<SalesTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
          <h2 style={{ margin: 0, marginBottom: 14, fontSize: 15, fontWeight: 600 }}>Revenue by Product</h2>
          {isLoading ? (
            <LoadingBlock height={240} />
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactMoney(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<SalesTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
          <h2 style={{ margin: 0, marginBottom: 14, fontSize: 15, fontWeight: 600 }}>Sales by Category</h2>
          {isLoading ? (
            <LoadingBlock height={240} />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {(inventory.categorySales || []).map((cat) => (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{cat.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{formatCurrency(cat.totalRevenue)}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: Number(cat.growth) >= 0 ? '#10b981' : '#ef4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <ArrowUpRight size={12} style={{ transform: Number(cat.growth) >= 0 ? 'none' : 'rotate(90deg)' }} />
                        {Math.abs(Number(cat.growth || 0)).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 999, background: '#f3f4f6' }}>
                    <div
                      style={{
                        width: `${maxCategoryRevenue > 0 ? (Number(cat.totalRevenue || 0) / maxCategoryRevenue) * 100 : 0}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: Number(cat.growth) >= 0 ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : '#f87171'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: '#9ca3af' }}>{formatNumber(cat.orderCount || 0)} orders</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
