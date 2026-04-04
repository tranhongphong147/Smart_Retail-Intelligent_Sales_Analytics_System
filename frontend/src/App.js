import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import AIPredictionsPage from './pages/AIPredictionsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function AppShell() {
  const location = useLocation();

  const pageMeta = {
    '/': { title: 'Dashboard', subtitle: "Here's what's happening with your business today." },
    '/sales': { title: 'Sales Analytics', subtitle: 'Detailed breakdown of your sales performance and trends.' },
    '/inventory': { title: 'Inventory Analysis', subtitle: 'Track stock movements, risks, and replenishment needs.' },
    '/ai-predictions': { title: 'AI Predictions', subtitle: 'Forecast demand and revenue using AI models.' },
    '/recommendations': { title: 'Smart Recommendations', subtitle: 'Actionable suggestions for restocking and pricing strategy.' },
    '/reports': { title: 'Reports', subtitle: 'Generate and review periodic performance reports.' },
    '/settings': { title: 'Settings', subtitle: 'Configure account and workspace preferences.' }
  };

  const currentMeta = pageMeta[location.pathname] || pageMeta['/'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fb' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <TopNav title={currentMeta.title} subtitle={currentMeta.subtitle} />
        <main style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/ai-predictions" element={<AIPredictionsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<SettingsPage defaultTab="profile" />} />
            <Route path="/settings" element={<SettingsPage defaultTab="business" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
