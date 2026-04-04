import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ErrorBlock, LoadingBlock } from '../components/ui/StateBlock';
import { getInventoryAnalytics } from '../lib/api';
import { formatNumber, formatShortDate } from '../lib/format';

const cardStyle = {
  background: '#fff',
  border: '1px solid #edf2f7',
  borderRadius: 16,
  padding: 18
};

export default function InventoryPage() {
  const [data, setData] = useState({
    movementTrend: [],
    lowStockWarnings: [],
    fastMoving: [],
    slowMoving: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError('');
        const result = await getInventoryAnalytics();
        if (!active) return;

        setData({
          movementTrend: result?.movementTrend || [],
          lowStockWarnings: result?.lowStockWarnings || [],
          fastMoving: result?.fastMoving || [],
          slowMoving: result?.slowMoving || []
        });
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load inventory analytics.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const trendData = useMemo(
    () => data.movementTrend.map((item) => ({ period: formatShortDate(item.period), soldUnits: Number(item.soldUnits || 0) })),
    [data.movementTrend]
  );

  return (
    <div style={{ padding: 24, display: 'grid', gap: 14 }}>
      <div>
        <h1 style={{ fontSize: 24, margin: 0 }}>Inventory Analysis</h1>
        <p style={{ color: '#6b7280', marginTop: 8, fontSize: 13 }}>Monitor inventory health, movement intensity, and replenishment priorities.</p>
      </div>

      {error && <ErrorBlock message={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 650, marginBottom: 10 }}>Stock Movement Trend (Last 14 Days)</div>
          {isLoading ? (
            <LoadingBlock height={280} />
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inventoryTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => `${formatNumber(value)} units`} />
                  <Area type="monotone" dataKey="soldUnits" stroke="#0ea5e9" strokeWidth={2.2} fill="url(#inventoryTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 650, marginBottom: 8 }}>Low Stock Alert</div>
          {isLoading ? (
            <LoadingBlock height={280} />
          ) : (
            <div style={{ display: 'grid', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
              {data.lowStockWarnings.length === 0 && <div style={{ color: '#6b7280', fontSize: 13 }}>No low-stock warnings.</div>}
              {data.lowStockWarnings.map((item) => (
                <div key={item.sku} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.sku}</div>
                  <span
                    style={{
                      marginTop: 4,
                      display: 'inline-block',
                      fontSize: 11,
                      color: '#fff',
                      background: Number(item.currentQuantity) <= 7 ? '#ef4444' : '#f59e0b',
                      borderRadius: 999,
                      padding: '2px 8px'
                    }}
                  >
                    {formatNumber(item.currentQuantity)} left / min {formatNumber(item.minStockLevel)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 650, marginBottom: 10 }}>Fast Moving Products</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {(data.fastMoving || []).slice(0, 6).map((item) => (
              <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f3f4f6', paddingBottom: 7 }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: 600 }}>{formatNumber(item.soldQuantity)} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 650, marginBottom: 10 }}>Slow Moving Products</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {(data.slowMoving || []).slice(0, 6).map((item) => (
              <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f3f4f6', paddingBottom: 7 }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: 600, color: '#b45309' }}>{formatNumber(item.soldQuantity)} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
