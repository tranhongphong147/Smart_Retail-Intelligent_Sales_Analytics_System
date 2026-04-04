import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { mockForecast, mockRecommendations } from '../utils/mockData.js';

export async function getForecast({ horizonDays = 7 }) {
  const safeHorizon = Math.min(Math.max(Number(horizonDays) || 7, 7), 30);

  if (env.useMockData) {
    return { ...mockForecast, horizonDays: safeHorizon };
  }

  const [avgRevenueRow] = await query(
    `SELECT COALESCE(AVG(total_amount), 0) AS avgRevenue
     FROM orders
     WHERE status = 'completed'
       AND order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );

  const avgRevenue = Number(avgRevenueRow.avgRevenue || 0);
  const today = new Date();

  const predictions = Array.from({ length: safeHorizon }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + 1);

    return {
      date: date.toISOString().split('T')[0],
      predictedRevenue: Math.round(avgRevenue * (1 + (index % 5) * 0.01))
    };
  });

  return {
    horizonDays: safeHorizon,
    model: 'baseline-moving-average',
    predictions
  };
}

export async function getRecommendations() {
  if (env.useMockData) {
    return mockRecommendations;
  }

  const lowStock = await query(
    `SELECT p.id AS productId, p.sku, p.name, i.current_quantity AS currentQuantity, p.min_stock_level AS minStockLevel
     FROM products p
     JOIN inventory i ON i.product_id = p.id
     WHERE i.current_quantity <= p.min_stock_level
     ORDER BY i.current_quantity ASC
     LIMIT 10`
  );

  const slowMoving = await query(
    `SELECT p.id AS productId, p.sku, p.name, COALESCE(SUM(oi.quantity),0) AS soldQuantity
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id
       AND o.status = 'completed'
       AND o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY p.id, p.sku, p.name
     HAVING soldQuantity < 10
     ORDER BY soldQuantity ASC
     LIMIT 10`
  );

  const restockRecommendations = lowStock.map((item) => ({
    type: 'restock',
    productId: item.productId,
    sku: item.sku,
    action: `Restock ${Math.max(item.minStockLevel * 2 - item.currentQuantity, 10)} units`,
    reason: 'Current stock is at or below minimum threshold',
    priority: 'high'
  }));

  const discountRecommendations = slowMoving.map((item) => ({
    type: 'discount',
    productId: item.productId,
    sku: item.sku,
    action: 'Apply 5-10% discount campaign',
    reason: `Only ${item.soldQuantity} units sold in last 30 days`,
    priority: 'medium'
  }));

  return {
    items: [...restockRecommendations, ...discountRecommendations]
  };
}

export async function askChatbot({ question }) {
  const normalized = (question || '').trim();

  if (!normalized) {
    return {
      answer: 'Please provide a question.',
      context: []
    };
  }

  if (env.useMockData) {
    return {
      answer: 'Mock mode: Revenue is stable this month, but Product B has low stock risk. Consider restocking and reviewing slow-moving items for promotions.',
      context: [{ key: 'question', value: normalized }]
    };
  }

  const [revenueRow] = await query(
    `SELECT COALESCE(SUM(total_amount),0) AS monthlyRevenue
     FROM orders
     WHERE status='completed'
       AND DATE_FORMAT(order_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
  );

  return {
    answer: `Based on current store data, this month revenue is ${Number(revenueRow.monthlyRevenue).toLocaleString('vi-VN')} VND. For deeper insight, check analytics modules for trend and inventory risks.`,
    context: [
      { key: 'question', value: normalized },
      { key: 'monthlyRevenue', value: Number(revenueRow.monthlyRevenue) }
    ]
  };
}
