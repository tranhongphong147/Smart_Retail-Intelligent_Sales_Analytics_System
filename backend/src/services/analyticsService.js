import { query } from '../db/pool.js';

const groupByMap = {
  day: 'DATE(o.order_date)',
  week: 'YEARWEEK(o.order_date, 1)',
  month: "DATE_FORMAT(o.order_date, '%Y-%m')"
};

export async function getRevenueAnalytics({ granularity = 'day', from, to }) {
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
  const fastMoving = await query(
    `SELECT p.id AS productId, p.sku, p.name, p.category, COALESCE(SUM(oi.quantity),0) AS soldQuantity
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
     GROUP BY p.id, p.sku, p.name, p.category
     ORDER BY soldQuantity DESC
     LIMIT 10`
  );

  const slowMoving = await query(
    `SELECT p.id AS productId, p.sku, p.name, p.category, COALESCE(SUM(oi.quantity),0) AS soldQuantity
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
     GROUP BY p.id, p.sku, p.name, p.category
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

  const categorySales = await query(
    `SELECT p.category AS category,
            COALESCE(SUM(CASE WHEN o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                              THEN oi.quantity * oi.price_at_purchase ELSE 0 END),0) AS totalRevenue,
            COALESCE(SUM(CASE WHEN o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                              THEN oi.quantity ELSE 0 END),0) AS soldQuantity,
            COUNT(DISTINCT CASE WHEN o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                                THEN o.id ELSE NULL END) AS orderCount,
            COALESCE(SUM(CASE WHEN o.order_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                               AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                              THEN oi.quantity * oi.price_at_purchase ELSE 0 END),0) AS previousRevenue
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
     GROUP BY p.category
     ORDER BY totalRevenue DESC`
  );

  const productPerformanceRows = await query(
    `SELECT p.id AS productId,
            p.name,
            COALESCE(SUM(CASE WHEN o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                              THEN oi.quantity * oi.price_at_purchase ELSE 0 END),0) AS revenue,
            COALESCE(SUM(CASE WHEN o.order_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                               AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                              THEN oi.quantity * oi.price_at_purchase ELSE 0 END),0) AS previousRevenue
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
     GROUP BY p.id, p.name
     ORDER BY revenue DESC
     LIMIT 8`
  );

  const movementTrendRows = await query(
    `SELECT DATE(o.order_date) AS period, COALESCE(SUM(oi.quantity),0) AS soldUnits
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.status = 'completed'
       AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
     GROUP BY DATE(o.order_date)
     ORDER BY period ASC`
  );

  return {
    fastMoving: fastMoving.map((item) => ({
      ...item,
      soldQuantity: Number(item.soldQuantity || 0)
    })),
    slowMoving: slowMoving.map((item) => ({
      ...item,
      soldQuantity: Number(item.soldQuantity || 0)
    })),
    lowStockWarnings: lowStockWarnings.map((item) => ({
      ...item,
      currentQuantity: Number(item.currentQuantity || 0),
      minStockLevel: Number(item.minStockLevel || 0)
    })),
    categorySales: categorySales.map((item) => ({
      category: item.category || 'Uncategorized',
      totalRevenue: Number(item.totalRevenue || 0),
      soldQuantity: Number(item.soldQuantity || 0),
      orderCount: Number(item.orderCount || 0),
      growth:
        Number(item.previousRevenue || 0) === 0
          ? (Number(item.totalRevenue || 0) === 0 ? 0 : 100)
          : ((Number(item.totalRevenue || 0) - Number(item.previousRevenue || 0)) / Number(item.previousRevenue || 0)) * 100
    })),
    productPerformance: productPerformanceRows.map((item) => ({
      productId: Number(item.productId),
      name: item.name,
      revenue: Number(item.revenue || 0),
      previousRevenue: Number(item.previousRevenue || 0),
      growth:
        Number(item.previousRevenue || 0) === 0
          ? (Number(item.revenue || 0) === 0 ? 0 : 100)
          : ((Number(item.revenue || 0) - Number(item.previousRevenue || 0)) / Number(item.previousRevenue || 0)) * 100
    })),
    movementTrend: movementTrendRows.map((item) => ({
      period: String(item.period),
      soldUnits: Number(item.soldUnits || 0)
    }))
  };
}
