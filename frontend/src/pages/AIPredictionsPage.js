import React, { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ErrorBlock, LoadingBlock } from '../components/ui/StateBlock';
import { getForecast } from '../lib/api';
import { formatCurrency, formatFullDate, formatNumber, formatShortDate } from '../lib/format';

const horizonOptions = [7, 14, 30];

const cardStyle = {
  background: '#fff',
  border: '1px solid #edf2f7',
  borderRadius: 16,
  padding: 18
};

export default function AIPredictionsPage() {
  const [horizonDays, setHorizonDays] = useState(14);
  const [forecast, setForecast] = useState({ model: '', predictions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getForecast({ horizonDays });
        if (!active) return;

        setForecast({
          model: data?.model || 'unknown-model',
          predictions: data?.predictions || []
        });
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load forecast data.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [horizonDays]);

  const chartData = useMemo(
    () =>
      forecast.predictions.map((item) => ({
        date: formatShortDate(item.date),
        predictedRevenue: Number(item.predictedRevenue || 0)
      })),
    [forecast.predictions]
  );

  const insight = useMemo(() => {
    if (!forecast.predictions.length) {
      return {
        title: 'No forecast data yet',
        detail: 'No prediction rows returned by API.',
        confidence: '-'
      };
    }

    const first = Number(forecast.predictions[0].predictedRevenue || 0);
    const last = Number(forecast.predictions[forecast.predictions.length - 1].predictedRevenue || 0);
    const delta = first > 0 ? ((last - first) / first) * 100 : 0;
    const peak = [...forecast.predictions].sort((a, b) => Number(b.predictedRevenue || 0) - Number(a.predictedRevenue || 0))[0];

    return {
      title: `Peak forecast: ${formatCurrency(peak.predictedRevenue)} on ${formatFullDate(peak.date)}`,
      detail: `Expected trend across ${forecast.predictions.length} days: ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%.`,
      confidence: delta >= 0 ? 'Medium-High' : 'Medium'
    };
  }, [forecast.predictions]);

  return (
    <div style={{ padding: 24, display: 'grid', gap: 14 }}>
      <div>
        <h1 style={{ fontSize: 24, margin: 0 }}>AI Predictions</h1>
        <p style={{ color: '#6b7280', marginTop: 8, fontSize: 13 }}>Forecast demand and revenue using AI model output from backend API.</p>
      </div>

      {error && <ErrorBlock message={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 650 }}>Revenue Forecast</div>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 3 }}>
              {horizonOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setHorizonDays(option)}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 10px',
                    background: horizonDays === option ? '#fff' : 'transparent',
                    color: horizonDays === option ? '#111827' : '#6b7280',
                    fontSize: 12,
                    fontWeight: horizonDays === option ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {option}d
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <LoadingBlock height={280} />
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="predictedRevenue" stroke="#4f46e5" strokeWidth={2.4} dot={{ r: 2.8, fill: '#4f46e5' }} activeDot={{ r: 4.4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{ background: 'linear-gradient(135deg,#2563eb,#4338ca)', color: '#fff', borderRadius: 16, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>AI Insight</div>
          <div style={{ fontSize: 13, lineHeight: 1.55 }}>{insight.title}</div>
          <p style={{ fontSize: 12, lineHeight: 1.55, opacity: 0.9, marginTop: 10 }}>{insight.detail}</p>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>Model: {forecast.model}</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>Confidence: {insight.confidence}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 16, fontWeight: 650, marginBottom: 10 }}>Prediction Table</div>
        {isLoading ? (
          <LoadingBlock height={220} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>
                <th style={{ paddingBottom: 10 }}>Date</th>
                <th style={{ paddingBottom: 10 }}>Predicted Revenue</th>
                <th style={{ paddingBottom: 10 }}>Day Index</th>
              </tr>
            </thead>
            <tbody>
              {forecast.predictions.map((row, index) => (
                <tr key={row.date} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 0', fontSize: 13 }}>{formatFullDate(row.date)}</td>
                  <td style={{ padding: '10px 0', fontSize: 13, fontWeight: 600 }}>{formatCurrency(row.predictedRevenue)}</td>
                  <td style={{ padding: '10px 0', fontSize: 12 }}>D+{index + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
