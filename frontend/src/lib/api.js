const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');

async function request(path, params = {}, options = {}) {
  const url = new URL(`${API_BASE_URL}/api/v1${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

export function getDashboardSummary() {
  return request('/dashboard/summary');
}

export function getDashboardOverview() {
  return request('/dashboard/overview');
}

export function getRevenueAnalytics({ granularity = 'day', from, to } = {}) {
  return request('/analytics/revenue', { granularity, from, to });
}

export function getInventoryAnalytics() {
  return request('/analytics/inventory');
}

export function getForecast({ horizonDays = 14 } = {}) {
  return request('/ai/forecast', { horizonDays });
}

export function getRecommendations() {
  return request('/ai/recommendations');
}

export function getReportsOverview() {
  return request('/reports/overview');
}

export function getSettingsOverview() {
  return request('/settings/overview');
}

export function saveProfileSettings(payload) {
  return request('/settings/profile', {}, { method: 'POST', body: payload });
}

export function saveBusinessSettings(payload) {
  return request('/settings/business', {}, { method: 'POST', body: payload });
}

export function saveNotificationsSettings(payload) {
  return request('/settings/notifications', {}, { method: 'POST', body: payload });
}

export function saveAiSettings(payload) {
  return request('/settings/ai', {}, { method: 'POST', body: payload });
}

export function saveSecuritySettings(payload) {
  return request('/settings/security', {}, { method: 'POST', body: payload });
}

export function getGlobalSearch({ q, limit = 8 } = {}) {
  return request('/search/global', { q, limit });
}

export function askChatbot({ question }) {
  return request('/chatbot/ask', {}, { method: 'POST', body: { question } });
}
