import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Brain, ChevronRight, Eye, EyeOff, Lock, Mail, Save, Store, User, Globe } from 'lucide-react';
import { ErrorBlock, LoadingBlock } from '../components/ui/StateBlock';
import {
  getSettingsOverview,
  saveAiSettings,
  saveBusinessSettings,
  saveNotificationsSettings,
  saveProfileSettings,
  saveSecuritySettings
} from '../lib/api';

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'business', label: 'Business', icon: Store },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'ai', label: 'AI Settings', icon: Brain },
  { key: 'security', label: 'Security', icon: Lock }
];

const panelStyle = { background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' };

function Toggle({ enabled, onChange }) {
  return (
    <button onClick={() => onChange(!enabled)} style={{ width: 36, height: 20, border: 'none', borderRadius: 999, background: enabled ? '#6366f1' : '#e5e7eb', position: 'relative', cursor: 'pointer' }}>
      <span style={{ position: 'absolute', top: 3, left: enabled ? 19 : 3, width: 14, height: 14, borderRadius: 999, background: '#fff', transition: 'left .2s ease' }} />
    </button>
  );
}

export default function SettingsPage({ defaultTab = 'profile' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const allowedTabs = useMemo(() => new Set(tabs.map((t) => t.key)), []);
  const queryTab = searchParams.get('tab');
  const initialTab = queryTab && allowedTabs.has(queryTab) ? queryTab : defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [business, setBusiness] = useState({ name: '', type: '', email: '', currency: 'VND', fiscalYearStart: 'January' });
  const [notifications, setNotifications] = useState({ lowStock: true, aiInsights: true, weeklyReport: true, orderAlerts: false, priceAlerts: true });
  const [aiSettings, setAiSettings] = useState({ autoRecommend: true, demandForecast: true, priceSuggestions: false, weeklyDigest: true, confidenceThreshold: 75 });
  const [security, setSecurity] = useState({ role: 'manager', twoFactorEnabled: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && allowedTabs.has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      return;
    }

    setActiveTab(defaultTab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', defaultTab);
      return next;
    }, { replace: true });
  }, [defaultTab, searchParams, setSearchParams, allowedTabs]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getSettingsOverview();
        if (!active) return;

        setProfile(data?.profile || profile);
        setBusiness(data?.business || business);
        setNotifications(data?.notifications || notifications);
        setAiSettings(data?.ai || aiSettings);
        setSecurity(data?.security || security);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load settings data.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  async function saveSection(key) {
    try {
      setSavingKey(key);
      setError('');
      setSuccessMessage('');

      if (key === 'profile') await saveProfileSettings(profile);
      if (key === 'business') await saveBusinessSettings(business);
      if (key === 'notifications') await saveNotificationsSettings(notifications);
      if (key === 'ai') await saveAiSettings(aiSettings);
      if (key === 'security') await saveSecuritySettings(security);

      setSuccessMessage('Settings saved successfully.');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSavingKey('');
    }
  }

  return (
    <div style={{ padding: 24, display: 'grid', gap: 18, maxWidth: 1100, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Settings</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Manage your account, business preferences, and AI configuration.</p>
      </div>

      {error && <ErrorBlock message={error} />}
      {successMessage && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 12, padding: '10px 12px', fontSize: 13 }}>{successMessage}</div>}

      {isLoading ? (
        <LoadingBlock height={260} />
      ) : (
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ width: 224, ...panelStyle, overflow: 'hidden' }}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('tab', key);
                    return next;
                  }, { replace: true });
                }}
                style={{ width: '100%', border: 'none', borderBottom: '1px solid #f8fafc', background: activeTab === key ? '#eef2ff' : '#fff', color: activeTab === key ? '#4f46e5' : '#4b5563', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: activeTab === key ? 600 : 400 }}>
                  <Icon size={16} />
                  {label}
                </span>
                <ChevronRight size={14} color={activeTab === key ? '#818cf8' : '#cbd5e1'} />
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            {activeTab === 'profile' && (
              <div style={{ ...panelStyle, padding: 22, display: 'grid', gap: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Profile Information</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#818cf8,#a855f7)', color: '#fff', fontSize: 20, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{(profile.firstName?.[0] || 'N').toUpperCase()}{(profile.lastName?.[0] || 'A').toUpperCase()}</div>
                  <div>
                    <button style={{ border: 'none', background: '#eef2ff', color: '#4f46e5', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Change Avatar</button>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>JPG, PNG up to 2MB</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'First Name', key: 'firstName' },
                    { label: 'Last Name', key: 'lastName' },
                    { label: 'Email Address', key: 'email', full: true, icon: Mail },
                    { label: 'Phone Number', key: 'phone', full: true }
                  ].map((field) => (
                    <div key={field.key} style={{ gridColumn: field.full ? '1 / -1' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6 }}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        {field.icon && <field.icon size={15} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />}
                        <input value={profile[field.key] || ''} onChange={(e) => setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 12, padding: field.icon ? '10px 12px 10px 34px' : '10px 12px', fontSize: 13, outline: 'none' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => saveSection('profile')} disabled={savingKey === 'profile'} style={{ border: 'none', width: 'fit-content', background: '#6366f1', color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: savingKey === 'profile' ? 0.7 : 1 }}>
                  <Save size={15} /> {savingKey === 'profile' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'business' && (
              <div style={{ ...panelStyle, padding: 22, display: 'grid', gap: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Business Information</h2>
                {[
                  { label: 'Business Name', key: 'name', icon: Store },
                  { label: 'Business Type', key: 'type', icon: Globe },
                  { label: 'Business Email', key: 'email', icon: Mail }
                ].map((item) => (
                  <div key={item.key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{item.label}</label>
                    <div style={{ position: 'relative' }}>
                      <item.icon size={15} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                      <input value={business[item.key] || ''} onChange={(e) => setBusiness((prev) => ({ ...prev, [item.key]: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 12, padding: '10px 12px 10px 34px', fontSize: 13, outline: 'none' }} />
                    </div>
                  </div>
                ))}
                <button onClick={() => saveSection('business')} disabled={savingKey === 'business'} style={{ border: 'none', width: 'fit-content', background: '#6366f1', color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: savingKey === 'business' ? 0.7 : 1 }}>
                  <Save size={15} /> {savingKey === 'business' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={{ ...panelStyle, padding: 22, display: 'grid', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 4 }}>Notification Preferences</h2>
                {[
                  { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when products fall below reorder levels' },
                  { key: 'aiInsights', label: 'AI Insights', desc: 'Receive AI-generated recommendations and predictions' },
                  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Auto-generated weekly business summary every Monday' },
                  { key: 'orderAlerts', label: 'Order Alerts', desc: 'Real-time notifications for new orders and cancellations' },
                  { key: 'priceAlerts', label: 'Price Change Alerts', desc: 'Get notified when AI suggests price adjustments' }
                ].map((item) => (
                  <div key={item.key} style={{ background: '#f9fafb', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <Toggle enabled={notifications[item.key]} onChange={(v) => setNotifications((prev) => ({ ...prev, [item.key]: v }))} />
                  </div>
                ))}
                <button onClick={() => saveSection('notifications')} disabled={savingKey === 'notifications'} style={{ border: 'none', width: 'fit-content', background: '#6366f1', color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: savingKey === 'notifications' ? 0.7 : 1 }}>
                  <Save size={15} /> {savingKey === 'notifications' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'ai' && (
              <div style={{ ...panelStyle, padding: 22, display: 'grid', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>AI Configuration</h2>
                {[
                  { key: 'autoRecommend', label: 'Auto Recommendations', desc: 'AI automatically generates business recommendations daily' },
                  { key: 'demandForecast', label: 'Demand Forecasting', desc: 'Predict product demand based on trends and seasonality' },
                  { key: 'priceSuggestions', label: 'Price Optimization', desc: 'AI suggests optimal pricing based on market analysis' },
                  { key: 'weeklyDigest', label: 'Weekly AI Digest', desc: 'Receive a summary of AI insights every week' }
                ].map((item) => (
                  <div key={item.key} style={{ background: '#f9fafb', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <Toggle enabled={aiSettings[item.key]} onChange={(v) => setAiSettings((prev) => ({ ...prev, [item.key]: v }))} />
                  </div>
                ))}
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>Minimum Confidence Threshold</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Only show recommendations above this confidence level</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>{aiSettings.confidenceThreshold}%</span>
                  </div>
                  <input type="range" min={50} max={95} step={5} value={aiSettings.confidenceThreshold} onChange={(e) => setAiSettings((prev) => ({ ...prev, confidenceThreshold: Number(e.target.value) }))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: '#9ca3af', fontSize: 10 }}>
                    <span>50% (More suggestions)</span>
                    <span>95% (High precision only)</span>
                  </div>
                </div>
                <button onClick={() => saveSection('ai')} disabled={savingKey === 'ai'} style={{ border: 'none', width: 'fit-content', background: '#6366f1', color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: savingKey === 'ai' ? 0.7 : 1 }}>
                  <Save size={15} /> {savingKey === 'ai' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ ...panelStyle, padding: 22, display: 'grid', gap: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Security Settings</h2>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Current role: {security.role}</div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" style={{ width: '100%', border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 12, padding: '10px 40px 10px 12px', fontSize: 13, outline: 'none' }} />
                    <button onClick={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button onClick={() => saveSection('security')} disabled={savingKey === 'security'} style={{ border: 'none', width: 'fit-content', background: '#6366f1', color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: savingKey === 'security' ? 0.7 : 1 }}>
                  <Lock size={15} /> {savingKey === 'security' ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
