import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronRight, Download, Eye, FileBarChart2, Package, TrendingUp, Users, DollarSign } from 'lucide-react';
import { ErrorBlock, LoadingBlock } from '../components/ui/StateBlock';
import { getReportsOverview } from '../lib/api';

const iconByCategory = {
  Sales: TrendingUp,
  Inventory: Package,
  Customers: Users,
  Finance: DollarSign,
  AI: FileBarChart2,
  Products: TrendingUp,
  General: FileBarChart2
};

const colorMap = {
  Sales: { panel: '#eef2ff', text: '#4f46e5', badgeBg: '#e0e7ff', badgeText: '#4338ca' },
  Inventory: { panel: '#f3e8ff', text: '#a855f7', badgeBg: '#ede9fe', badgeText: '#7c3aed' },
  Customers: { panel: '#ecfdf5', text: '#10b981', badgeBg: '#d1fae5', badgeText: '#047857' },
  Finance: { panel: '#fffbeb', text: '#f59e0b', badgeBg: '#fef3c7', badgeText: '#b45309' },
  AI: { panel: '#fdf2f8', text: '#ec4899', badgeBg: '#fce7f3', badgeText: '#be185d' },
  Products: { panel: '#eff6ff', text: '#3b82f6', badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
  General: { panel: '#f1f5f9', text: '#475569', badgeBg: '#e2e8f0', badgeText: '#334155' }
};

const cardStyle = { background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' };

export default function ReportsPage() {
  const [payload, setPayload] = useState({ quickStats: [], reports: [], scheduled: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getReportsOverview();
        if (!active) return;
        setPayload({
          quickStats: data?.quickStats || [],
          reports: data?.reports || [],
          scheduled: data?.scheduled || []
        });
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load reports overview.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => ['All', ...new Set((payload.reports || []).map((item) => item.category))], [payload.reports]);

  const filtered = useMemo(
    () => (category === 'All' ? payload.reports : payload.reports.filter((item) => item.category === category)),
    [category, payload.reports]
  );

  return (
    <div style={{ padding: 24, display: 'grid', gap: 18, maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Reports</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Download and schedule business reports generated from live API data.</p>
        </div>
        <button style={{ display: 'flex', gap: 8, alignItems: 'center', border: 'none', background: '#6366f1', color: '#fff', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Calendar size={15} />
          Schedule Report
        </button>
      </div>

      {error && <ErrorBlock message={error} />}

      {isLoading ? (
        <LoadingBlock height={120} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {payload.quickStats.map((item) => (
            <div key={item.label} style={{ ...cardStyle, padding: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{item.value}</div>
              <div style={{ fontSize: 13, color: '#374151', marginTop: 3 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 3 }}>
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            style={{
              border: category === item ? 'none' : '1px solid #e5e7eb',
              background: category === item ? '#6366f1' : '#fff',
              color: category === item ? '#fff' : '#4b5563',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: category === item ? 500 : 400,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingBlock height={280} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {filtered.map((report) => {
            const Icon = iconByCategory[report.category] || iconByCategory.General;
            const color = colorMap[report.category] || colorMap.General;

            return (
              <div key={report.id} style={{ ...cardStyle, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: color.panel, display: 'grid', placeItems: 'center' }}>
                    <Icon size={18} color={color.text} />
                  </div>
                  <span style={{ background: color.badgeBg, color: color.badgeText, borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 500 }}>{report.category}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{report.title}</div>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{report.description}</p>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{report.date}</div>
                    {report.status === 'ready' && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{report.size}</div>}
                    {report.status === 'generating' && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>Generating...</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {report.status === 'ready' ? (
                      <>
                        <button style={{ border: 'none', background: '#f9fafb', color: '#6b7280', borderRadius: 8, width: 30, height: 30, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                          <Eye size={15} />
                        </button>
                        <button style={{ border: 'none', background: '#eef2ff', color: '#4f46e5', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                          <Download size={13} />
                          Download
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Please wait...</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <LoadingBlock height={140} />
      ) : (
        <div style={{ ...cardStyle, padding: 18 }}>
          <h2 style={{ margin: 0, marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Scheduled Reports</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {payload.scheduled.map((item) => (
              <div key={item.name} style={{ background: '#f9fafb', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.schedule} - {item.recipients} recipient{item.recipients > 1 ? 's' : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Next: {item.next}</div>
                  <button style={{ marginTop: 3, border: 'none', background: 'transparent', color: '#6366f1', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                    Edit <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
