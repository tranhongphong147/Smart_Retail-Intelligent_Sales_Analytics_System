import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storePath = path.resolve(__dirname, '../data/settings-store.json');

function splitName(fullName = '') {
  const tokens = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { firstName: 'Nguyen', lastName: 'An' };
  if (tokens.length === 1) return { firstName: tokens[0], lastName: '' };
  return { firstName: tokens[0], lastName: tokens.slice(1).join(' ') };
}

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
}

async function readStore() {
  try {
    const raw = await fs.readFile(storePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeStore(data) {
  await ensureStoreDir();
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), 'utf8');
}

async function getBaseSettings() {
  const [userRow] = await query(
    `SELECT username, role
     FROM users
     ORDER BY created_at ASC
     LIMIT 1`
  );

  const { firstName, lastName } = splitName(userRow?.username || 'Nguyen An');

  return {
    profile: {
      firstName,
      lastName,
      email: `${String(userRow?.username || 'owner').replace(/\s+/g, '.').toLowerCase()}@business.com`,
      phone: '+84 912 345 678'
    },
    business: {
      name: 'Nguyen General Store',
      type: 'Retail - Multi-category',
      email: 'info@nguyenstore.vn',
      currency: 'VND',
      fiscalYearStart: 'January'
    },
    notifications: {
      lowStock: true,
      aiInsights: true,
      weeklyReport: true,
      orderAlerts: false,
      priceAlerts: true
    },
    ai: {
      autoRecommend: true,
      demandForecast: true,
      priceSuggestions: false,
      weeklyDigest: true,
      confidenceThreshold: 75
    },
    security: {
      twoFactorEnabled: false,
      role: userRow?.role || 'manager'
    }
  };
}

export async function getSettingsOverview() {
  const base = await getBaseSettings();
  const saved = await readStore();

  return {
    profile: { ...base.profile, ...(saved.profile || {}) },
    business: { ...base.business, ...(saved.business || {}) },
    notifications: { ...base.notifications, ...(saved.notifications || {}) },
    ai: { ...base.ai, ...(saved.ai || {}) },
    security: { ...base.security, ...(saved.security || {}) }
  };
}

export async function saveSettingsSection(section, payload) {
  const allowed = ['profile', 'business', 'notifications', 'ai', 'security'];
  if (!allowed.includes(section)) {
    const error = new Error('Unsupported settings section');
    error.status = 400;
    throw error;
  }

  const current = await readStore();
  current[section] = { ...(current[section] || {}), ...(payload || {}) };
  await writeStore(current);

  return { ok: true, section, savedAt: new Date().toISOString() };
}
