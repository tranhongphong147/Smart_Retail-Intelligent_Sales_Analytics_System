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
