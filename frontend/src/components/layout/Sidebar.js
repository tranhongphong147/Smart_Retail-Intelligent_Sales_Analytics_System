import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Brain, ChevronRight, FileBarChart2, LayoutDashboard, Lightbulb, Package, Settings, TrendingUp, Zap } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard }
];

function LinkItem({ item }) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

  return (
    <NavLink
      to={item.path}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        textDecoration: 'none',
        color: isActive ? '#4f46e5' : '#4b5563',
        background: isActive ? '#eef2ff' : 'transparent',
        transition: 'all .15s ease'
      }}
    >
      <Icon size={18} color={isActive ? '#4f46e5' : '#9ca3af'} />
      <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
      {isActive && <ChevronRight size={14} color="#a5b4fc" style={{ marginLeft: 'auto' }} />}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside style={{ width: 256, background: '#fff', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>BizAI</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Decision Support</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gap: 3, marginBottom: 16 }}>
          {navItems.map((item) => (
            <LinkItem key={item.path} item={item} />
          ))}
        </div>
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ borderRadius: 12, border: '1px solid #e0e7ff', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Brain size={14} color="#6366f1" />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#4338ca' }}>AI Status</div>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4, marginBottom: 8 }}>AI engine is active and analyzing your data in real-time.</div>
          <div style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>● Online & Learning</div>
        </div>
      </div>
    </aside>
  );
}
