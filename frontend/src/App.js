import React, { useEffect, useState } from 'react';

function App() {
  const [health, setHealth] = useState('checking...');
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8081/health')
      .then((res) => res.json())
      .then((data) => setHealth(`${data.status} (${data.service})`))
      .catch(() => setHealth('backend unreachable'));

    fetch('http://localhost:8081/api/v1/dashboard/summary')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Cannot load dashboard summary');
        }
        return res.json();
      })
      .then((data) => setSummary(data))
      .catch((err) => setSummaryError(err.message));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Smart Retail - Intelligent Sales Analytics System</h1>
      <p>Frontend container is running.</p>
      <p>Backend health: <strong>{health}</strong></p>

      <section style={{ marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Dashboard Summary (Milestone 1 Output)</h2>

        {summaryError && <p style={{ color: '#b00020' }}>{summaryError}</p>}

        {!summary && !summaryError && <p>Loading summary...</p>}

        {summary && (
          <>
            <p><strong>Project:</strong> {summary.project}</p>
            <p><strong>Status:</strong> {summary.status}</p>
            <p><strong>Generated at:</strong> {summary.generatedAt}</p>

            <h3>KPIs</h3>
            <ul>
              <li>Total Revenue Today: {summary.kpis.totalRevenueToday.toLocaleString('vi-VN')} VND</li>
              <li>Total Orders Today: {summary.kpis.totalOrdersToday}</li>
              <li>Low Stock Alerts: {summary.kpis.lowStockAlerts}</li>
            </ul>

            <h3>Highlights</h3>
            <ul>
              {summary.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
