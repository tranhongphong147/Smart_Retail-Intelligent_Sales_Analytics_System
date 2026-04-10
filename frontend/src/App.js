import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import DashboardPage from './pages/DashboardPage';

function AppShell() {
  const location = useLocation();

  const pageMeta = {
    '/': { title: 'Dashboard', subtitle: "Here's what's happening with your business today." }
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
