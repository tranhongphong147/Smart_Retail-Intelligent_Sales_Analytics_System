import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ErrorBlock, LoadingBlock } from '../components/ui/StateBlock';
import { getDashboardOverview } from '../lib/api';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function iconByKey(key) {
  if (key === 'dollar') return DollarSign;
  if (key === 'cart') return ShoppingCart;
  if (key === 'users') return Users;
  return TrendingUp;
}

const colorMap = {
  indigo: { panel: '#eef2ff', icon: '#6366f1' },
  purple: { panel: '#f3e8ff', icon: '#a855f7' },
  emerald: { panel: '#ecfdf5', icon: '#10b981' },
  amber: { panel: '#fffbeb', icon: '#f59e0b' }
};

function StatCard({ item }) {
  const Icon = iconByKey(item.icon);
  const colors = colorMap[item.color] || colorMap.indigo;
  const isUp = item.trend === 'up';

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

      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: '#1f2937' }}>
        {item.prefix || ''}
        {typeof item.value === 'number' ? formatMoney(item.value) : item.value}
      </div>
      <div style={{ marginTop: 3, fontSize: 13, color: '#6b7280' }}>{item.title}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError('');
        const payload = await getDashboardOverview();
        if (!active) return;
        setData(payload);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load dashboard overview.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const maxSales = useMemo(
    () => (data?.topProducts || []).reduce((max, item) => Math.max(max, Number(item.sales || 0)), 1),
    [data?.topProducts]
  );

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{data?.header?.greeting || 'Good morning, Nguyen An'} 👋</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>{data?.header?.subtitle || "Here's what's happening with your business today."}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: '#9ca3af' }}>Last updated:</span>
          <span style={{ color: '#4b5563', fontWeight: 500 }}>{data?.header?.updatedAt || 'Just now'}</span>
        </div>
      </div>

      {error && <ErrorBlock message={error} />}

      {isLoading ? (
        <LoadingBlock height={110} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {(data?.kpis || []).map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Monthly Sales Trend</h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Revenue vs Target - 2026</p>
            </div>
          </div>
          {isLoading ? (
            <LoadingBlock height={220} />
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.salesTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => `$${formatMoney(v)}`} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Inventory by Category</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Stock distribution overview</p>
          </div>
          {isLoading ? (
            <LoadingBlock height={180} />
          ) : (
            <>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.inventoryByCategory || []} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {(data?.inventoryByCategory || []).map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {(data?.inventoryByCategory || []).map((item) => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 999, background: item.color }} />
                      <span style={{ color: '#4b5563' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Top Selling Products</h2>
            <button style={{ border: 'none', background: 'transparent', color: '#6366f1', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              View all <ArrowRight size={13} />
            </button>
          </div>

          {isLoading ? (
            <LoadingBlock height={180} />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {(data?.topProducts || []).slice(0, 5).map((item, index) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f9fafb', border: '1px solid #f1f5f9', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>${formatMoney(item.revenue)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, borderRadius: 999, background: '#f3f4f6', flex: 1 }}>
                        <div style={{ height: '100%', borderRadius: 999, width: `${(Number(item.sales || 0) / maxSales) * 100}%`, background: 'linear-gradient(90deg,#818cf8,#a855f7)' }} />
                      </div>
                      <span style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 2, color: Number(item.growth) >= 0 ? '#10b981' : '#ef4444' }}>
                        {Number(item.growth) >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {Math.abs(Number(item.growth || 0)).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'grid', placeItems: 'center' }}><AlertTriangle size={15} color="#ef4444" /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Low Stock Alert</h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#f87171' }}>{(data?.lowStockItems || []).length} items need attention</p>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {(data?.lowStockItems || []).slice(0, 4).map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9fafb', paddingBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.sku}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', borderRadius: 999, padding: '2px 8px', background: item.status === 'critical' ? '#ef4444' : '#f59e0b', height: 'fit-content' }}>{item.stock} left</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', borderRadius: 16, padding: 20, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Brain size={16} color="#c7d2fe" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>AI Insight of the Day</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.92, margin: 0 }}>{data?.aiInsight?.message || 'AI insights are being generated from your live business data.'}</p>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, opacity: 0.8 }}>Confidence: {data?.aiInsight?.confidence || 0}%</span>
              <button style={{ border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Take Action →</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Recent Transactions</h2>
          <button style={{ border: 'none', background: 'transparent', color: '#6366f1', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        {isLoading ? (
          <LoadingBlock height={150} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f9fafb' }}>
                  {['Transaction ID', 'Customer', 'Product', 'Amount', 'Time', 'Status'].map((head) => (
                    <th key={head} style={{ textAlign: 'left', paddingBottom: 10, color: '#9ca3af', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentTransactions || []).map((tx) => (
                  <tr key={tx.id} style={{ borderTop: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 0', fontSize: 12, fontWeight: 500, color: '#6366f1' }}>{tx.id}</td>
                    <td style={{ padding: '10px 0', fontSize: 12, color: '#374151' }}>{tx.customer}</td>
                    <td style={{ padding: '10px 0', fontSize: 12, color: '#4b5563' }}>{tx.product}</td>
                    <td style={{ padding: '10px 0', fontSize: 12, color: '#1f2937', fontWeight: 600 }}>${formatMoney(tx.amount)}</td>
                    <td style={{ padding: '10px 0', fontSize: 11, color: '#9ca3af' }}>{tx.date}</td>
                    <td style={{ padding: '10px 0' }}>
                      <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '4px 8px', background: tx.status === 'completed' ? '#ecfdf5' : '#fef9c3', color: tx.status === 'completed' ? '#059669' : '#ca8a04' }}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
