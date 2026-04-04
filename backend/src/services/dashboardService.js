import { query } from '../db/pool.js';
import { env } from '../config/env.js';
import { mockSummary } from '../utils/mockData.js';

export async function getDashboardSummary() {
  if (env.useMockData) {
    return { ...mockSummary, generatedAt: new Date().toISOString() };
  }

  const [revenueRow] = await query(
    `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenueToday, COUNT(*) AS totalOrdersToday
     FROM orders
     WHERE DATE(order_date) = CURDATE() AND status = 'completed'`
  );

  const [stockRow] = await query(
    `SELECT COUNT(*) AS lowStockAlerts
     FROM inventory i
     JOIN products p ON p.id = i.product_id
     WHERE i.current_quantity <= p.min_stock_level`
  );

  return {
    project: 'SR-IAS',
    status: 'api-ready',
    kpis: {
      totalRevenueToday: Number(revenueRow.totalRevenueToday || 0),
      totalOrdersToday: Number(revenueRow.totalOrdersToday || 0),
      lowStockAlerts: Number(stockRow.lowStockAlerts || 0)
    },
    highlights: [
      'Revenue and inventory KPIs loaded from MySQL',
      'Analytics and AI endpoints are available under /api/v1',
      'Frontend integration is ready for next step'
    ],
    generatedAt: new Date().toISOString()
  };
}
