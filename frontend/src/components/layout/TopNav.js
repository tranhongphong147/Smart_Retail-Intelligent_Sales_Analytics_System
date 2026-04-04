import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Bot, ChevronDown, LogIn, LogOut, Search, Settings, Sparkles, User, X } from 'lucide-react';
import { askChatbot, getDashboardOverview, getGlobalSearch, getSettingsOverview } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

function initials(firstName, lastName) {
  return `${firstName?.[0] || 'N'}${lastName?.[0] || 'A'}`.toUpperCase();
}

export default function TopNav({ title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState({ products: [], orders: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [auth, setAuth] = useState(() => localStorage.getItem('sr_ias_auth') !== 'logged_out');
  const [profile, setProfile] = useState({ firstName: 'Nguyen', lastName: 'An', email: 'owner@business.com' });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadHeaderData() {
      try {
        const [dashboardData, settingsData] = await Promise.all([getDashboardOverview(), getSettingsOverview()]);
        if (!active) return;

        const lowStock = (dashboardData?.lowStockItems || []).slice(0, 2).map((item) => ({
          id: `stock-${item.id}`,
          message: `${item.name} low stock (${item.stock} left)`,
          time: 'Now',
          unread: true
        }));

        const orders = (dashboardData?.recentTransactions || []).slice(0, 2).map((item) => ({
          id: item.id,
          message: `New order ${item.id} • ${formatCurrency(item.amount)}`,
          time: item.date,
          unread: true
        }));

        const aiInsight = dashboardData?.aiInsight?.message
          ? [{ id: 'ai-insight', message: dashboardData.aiInsight.message, time: 'AI Insight', unread: false }]
          : [];

        setProfile(settingsData?.profile || profile);
        setNotifications([...lowStock, ...orders, ...aiInsight].slice(0, 6));
      } catch (error) {
        setNotifications([]);
      }
    }

    loadHeaderData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const keyword = searchTerm.trim();
      if (keyword.length < 2 || !auth) {
        setSearchResult({ products: [], orders: [] });
        return;
      }

      try {
        const data = await getGlobalSearch({ q: keyword, limit: 6 });
        setSearchResult({
          products: data?.products || [],
          orders: data?.orders || []
        });
      } catch (error) {
        setSearchResult({ products: [], orders: [] });
      }
    }, 260);

    return () => clearTimeout(handler);
  }, [searchTerm, auth]);

  useEffect(() => {
    function onClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setProfileOpen(false);
        setNotifOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setNotifOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const unreadCount = notifications.filter((item) => item.unread).length;
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const showSearchPanel = auth && searchOpen && searchTerm.trim().length >= 2;

  async function handleAskAssistant(event) {
    event.preventDefault();
    const question = aiQuestion.trim();
    if (!question) return;

    try {
      setAiLoading(true);
      const data = await askChatbot({ question });
      setAiAnswer(data?.answer || 'No response from assistant.');
    } catch (error) {
      setAiAnswer(error.message || 'Failed to ask assistant.');
    } finally {
      setAiLoading(false);
    }
  }

  function handleLogin() {
    localStorage.setItem('sr_ias_auth', 'logged_in');
    setAuth(true);
  }

  function handleLogout() {
    localStorage.setItem('sr_ias_auth', 'logged_out');
    setAuth(false);
    setProfileOpen(false);
    setSearchTerm('');
    setSearchResult({ products: [], orders: [] });
    navigate('/');
  }

  return (
    <header ref={containerRef} style={{ position: 'sticky', top: 0, zIndex: 20, height: 64, background: '#fff', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', gap: 12 }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 10px' }}>
          <Search size={15} color="#9ca3af" />
          <input
            placeholder={auth ? 'Search products, orders...' : 'Please login to search'}
            value={searchTerm}
            disabled={!auth}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 13, color: '#374151' }}
          />
        </div>

        {showSearchPanel && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 44, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, boxShadow: '0 12px 30px rgba(15,23,42,.08)', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Products</div>
            {(searchResult.products || []).length > 0 ? (
              searchResult.products.map((item) => (
                <button
                  key={`product-${item.id}`}
                  onClick={() => navigate('/inventory')}
                  style={{ width: '100%', border: 'none', background: '#fff', padding: '9px 12px', textAlign: 'left', borderTop: '1px solid #f8fafc', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.sku} • {item.category} • Stock {item.stock}</div>
                </button>
              ))
            ) : (
              <div style={{ padding: '0 12px 10px', fontSize: 12, color: '#9ca3af' }}>No products found</div>
            )}

            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', borderTop: '1px solid #f3f4f6' }}>Orders</div>
            {(searchResult.orders || []).length > 0 ? (
              searchResult.orders.map((item) => (
                <button
                  key={`order-${item.id}`}
                  onClick={() => navigate('/sales')}
                  style={{ width: '100%', border: 'none', background: '#fff', padding: '9px 12px', textAlign: 'left', borderTop: '1px solid #f8fafc', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>#ORD-{String(item.id).padStart(5, '0')}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.product} • {formatCurrency(item.totalAmount)} • {item.status}</div>
                </button>
              ))
            ) : (
              <div style={{ padding: '0 12px 12px', fontSize: 12, color: '#9ca3af' }}>No orders found</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {auth ? (
          <>
            <button onClick={() => setAiOpen(true)} style={{ border: 'none', borderRadius: 10, padding: '8px 12px', color: '#fff', background: 'linear-gradient(90deg,#6366f1,#7c3aed)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} />
              AI Assistant
            </button>

            <div style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen((value) => !value); setProfileOpen(false); }} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: '#f9fafb', color: '#6b7280', cursor: 'pointer', position: 'relative' }}>
                <Bell size={17} style={{ marginTop: 2 }} />
                {unreadCount > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 15, height: 15, borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 320, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, boxShadow: '0 12px 30px rgba(15,23,42,.08)' }}>
                  <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6', fontSize: 14, fontWeight: 600 }}>Notifications</div>
                  <div>
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div key={item.id} style={{ padding: '10px 12px', borderBottom: '1px solid #f8fafc', background: item.unread ? '#eef2ff55' : '#fff' }}>
                          <div style={{ fontSize: 12, color: '#374151' }}>{item.message}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.time}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: 12, fontSize: 12, color: '#9ca3af' }}>No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen((value) => !value); setNotifOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 10, padding: '5px 6px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg,#818cf8,#8b5cf6)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>
                  {initials(profile.firstName, profile.lastName)}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937', lineHeight: 1.1 }}>{fullName || 'Business Owner'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.1 }}>Business Owner</div>
                </div>
                <ChevronDown size={14} color="#9ca3af" />
              </button>

              {profileOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 220, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, boxShadow: '0 12px 30px rgba(15,23,42,.08)', overflow: 'hidden' }}>
                  <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fullName || 'Owner'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{profile.email || 'owner@business.com'}</div>
                  </div>
                  <button onClick={() => navigate('/settings?tab=profile')} style={{ width: '100%', border: 'none', background: '#fff', padding: '9px 12px', textAlign: 'left', fontSize: 13, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <User size={14} /> My Profile
                  </button>
                  <button onClick={() => navigate('/settings?tab=business')} style={{ width: '100%', border: 'none', background: '#fff', padding: '9px 12px', textAlign: 'left', fontSize: 13, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Settings size={14} /> Settings
                  </button>
                  <button onClick={handleLogout} style={{ width: '100%', border: 'none', background: '#fff5f5', padding: '9px 12px', textAlign: 'left', fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button onClick={handleLogin} style={{ border: 'none', borderRadius: 10, padding: '8px 12px', color: '#fff', background: 'linear-gradient(90deg,#2563eb,#4f46e5)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogIn size={14} />
            Login
          </button>
        )}
      </div>

      {aiOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.28)', zIndex: 40, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 'min(560px, 92vw)', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 24px 60px rgba(15,23,42,0.2)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                <Bot size={16} color="#6366f1" />
                AI Assistant
              </div>
              <button onClick={() => setAiOpen(false)} style={{ border: 'none', background: '#f3f4f6', color: '#6b7280', borderRadius: 8, width: 28, height: 28, cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAskAssistant} style={{ display: 'grid', gap: 10 }}>
              <textarea
                value={aiQuestion}
                onChange={(event) => setAiQuestion(event.target.value)}
                placeholder="Ask about sales trend, stock risk, or business actions..."
                style={{ width: '100%', minHeight: 88, border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, fontSize: 13, outline: 'none', resize: 'vertical' }}
              />
              <button type="submit" disabled={aiLoading} style={{ justifySelf: 'flex-end', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', background: '#4f46e5', fontSize: 13, fontWeight: 500, cursor: aiLoading ? 'default' : 'pointer', opacity: aiLoading ? 0.8 : 1 }}>
                {aiLoading ? 'Thinking...' : 'Ask'}
              </button>
            </form>

            <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              {aiAnswer || 'Assistant response will appear here.'}
            </div>
          </div>
        </div>
      )}

      {(title || subtitle) && <div style={{ display: 'none' }}>{title}{subtitle}</div>}
    </header>
  );
}
