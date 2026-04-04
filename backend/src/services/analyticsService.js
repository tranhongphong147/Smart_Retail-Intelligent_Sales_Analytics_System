import { query } from '../db/pool.js';
import { env } from '../config/env.js';
import { mockInventoryAnalytics, mockRevenue } from '../utils/mockData.js';

const groupByMap = {
  day: 'DATE(o.order_date)',
  week: 'YEARWEEK(o.order_date, 1)',
  month: "DATE_FORMAT(o.order_date, '%Y-%m')"
};

export async function getRevenueAnalytics({ granularity = 'day', from, to }) {
  if (env.useMockData) {
    return mockRevenue;
  }

  const safeGranularity = groupByMap[granularity] ? granularity : 'day';
  const groupExpr = groupByMap[safeGranularity];

  const rows = await query(
    `SELECT ${groupExpr} AS period, COALESCE(SUM(o.total_amount),0) AS totalRevenue, COUNT(*) AS totalOrders
     FROM orders o
     WHERE (? IS NULL OR DATE(o.order_date) >= ?) AND (? IS NULL OR DATE(o.order_date) <= ?)
       AND o.status = 'completed'
     GROUP BY period
     ORDER BY period ASC`,
    [from || null, from || null, to || null, to || null]
  );

  return {
    granularity: safeGranularity,
    from: from || null,
    to: to || null,
    items: rows.map((r) => ({
      period: String(r.period),
      totalRevenue: Number(r.totalRevenue),
      totalOrders: Number(r.totalOrders)
    }))
  };
}

export async function getInventoryAnalytics() {
  if (env.useMockData) {
    return mockInventoryAnalytics;
  }

  const fastMoving = await query(
    `SELECT p.id AS productId, p.sku, p.name, COALESCE(SUM(oi.quantity),0) AS soldQuantity
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
     GROUP BY p.id, p.sku, p.name
     ORDER BY soldQuantity DESC
     LIMIT 10`
  );

  const slowMoving = await query(
    `SELECT p.id AS productId, p.sku, p.name, COALESCE(SUM(oi.quantity),0) AS soldQuantity
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
     GROUP BY p.id, p.sku, p.name
     ORDER BY soldQuantity ASC
     LIMIT 10`
  );

  const lowStockWarnings = await query(
    `SELECT p.id AS productId, p.sku, p.name, i.current_quantity AS currentQuantity, p.min_stock_level AS minStockLevel
     FROM products p
     JOIN inventory i ON i.product_id = p.id
     WHERE i.current_quantity <= p.min_stock_level
     ORDER BY i.current_quantity ASC`
  );

  return { fastMoving, slowMoving, lowStockWarnings };
}
