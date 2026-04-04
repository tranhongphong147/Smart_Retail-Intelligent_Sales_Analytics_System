import { query } from '../db/pool.js';

function pctChange(currentValue, previousValue) {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function buildMonthRange(totalMonths = 12) {
  const now = new Date();
  const months = [];

  for (let index = totalMonths - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('en-US', { month: 'short' });

    months.push({ key, label });
  }

  return months;
}

function formatTransactionTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatStatus(value) {
  const safe = String(value || '').toLowerCase();
  if (!safe) return 'pending';
  return safe;
}

export async function getDashboardSummary() {
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

export async function getDashboardOverview() {
  const [
    [kpiCurrent],
    [kpiPrevious],
    [newCustomersCurrent],
    [newCustomersPrevious],
    monthlyRevenueRows,
    inventoryCategoryRows,
    topProductRows,
    lowStockRows,
    recentTransactionRows
  ] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE status = 'completed'
         AND DATE_FORMAT(order_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
    ),
    query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE status = 'completed'
         AND DATE_FORMAT(order_date, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')`
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')`
    ),
    query(
      `SELECT DATE_FORMAT(order_date, '%Y-%m') AS period,
              COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE status = 'completed'
         AND order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(order_date, '%Y-%m')
       ORDER BY period ASC`
    ),
    query(
      `SELECT p.category AS category,
              COALESCE(SUM(i.current_quantity), 0) AS quantity
       FROM products p
       JOIN inventory i ON i.product_id = p.id
       GROUP BY p.category
       ORDER BY quantity DESC`
    ),
    query(
      `SELECT p.id AS productId,
              p.name,
              COALESCE(SUM(CASE WHEN o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN oi.quantity ELSE 0 END), 0) AS sales,
              COALESCE(SUM(CASE WHEN o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN oi.quantity * oi.price_at_purchase ELSE 0 END), 0) AS revenue,
              COALESCE(SUM(CASE WHEN o.order_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                                 AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                                THEN oi.quantity ELSE 0 END), 0) AS previousSales
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
       GROUP BY p.id, p.name
       ORDER BY revenue DESC
       LIMIT 8`
    ),
    query(
      `SELECT p.id,
              p.name,
              p.sku,
              i.current_quantity AS stock,
              p.min_stock_level AS minStockLevel
       FROM products p
       JOIN inventory i ON i.product_id = p.id
       WHERE i.current_quantity <= p.min_stock_level
       ORDER BY i.current_quantity ASC
       LIMIT 6`
    ),
    query(
      `SELECT o.id,
              o.total_amount AS amount,
              o.order_date,
              o.status,
              COALESCE(op.product_name, 'Multiple items') AS product
       FROM orders o
       LEFT JOIN (
         SELECT oi.order_id, MIN(p.name) AS product_name
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         GROUP BY oi.order_id
       ) op ON op.order_id = o.id
       ORDER BY o.order_date DESC
       LIMIT 8`
    )
  ]);

  const totalRevenue = Number(kpiCurrent.revenue || 0);
  const totalOrders = Number(kpiCurrent.orders || 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const previousRevenue = Number(kpiPrevious.revenue || 0);
  const previousOrders = Number(kpiPrevious.orders || 0);
  const previousAov = previousOrders > 0 ? previousRevenue / previousOrders : 0;

  const kpis = [
    {
      title: 'Total Revenue',
      value: totalRevenue,
      change: pctChange(totalRevenue, previousRevenue),
      trend: totalRevenue >= previousRevenue ? 'up' : 'down',
      icon: 'dollar',
      prefix: '$',
      color: 'indigo'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      change: pctChange(totalOrders, previousOrders),
      trend: totalOrders >= previousOrders ? 'up' : 'down',
      icon: 'cart',
      color: 'purple'
    },
    {
      title: 'New Customers',
      value: Number(newCustomersCurrent.total || 0),
      change: pctChange(Number(newCustomersCurrent.total || 0), Number(newCustomersPrevious.total || 0)),
      trend: Number(newCustomersCurrent.total || 0) >= Number(newCustomersPrevious.total || 0) ? 'up' : 'down',
      icon: 'users',
      color: 'emerald'
    },
    {
      title: 'Avg. Order Value',
      value: avgOrderValue,
      change: pctChange(avgOrderValue, previousAov),
      trend: avgOrderValue >= previousAov ? 'up' : 'down',
      icon: 'trend',
      prefix: '$',
      color: 'amber'
    }
  ];

  const monthRange = buildMonthRange(12);
  const revenueMap = new Map(monthlyRevenueRows.map((item) => [String(item.period), Number(item.revenue || 0)]));

  const salesTrend = monthRange.map((month) => {
    const revenue = revenueMap.get(month.key) || 0;
    const target = Math.round(revenue * 1.08);

    return {
      month: month.label,
      revenue,
      target
    };
  });

  const totalInventory = inventoryCategoryRows.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const palette = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#64748b'];

  const inventoryByCategory = inventoryCategoryRows.map((item, index) => ({
    name: item.category || 'Uncategorized',
    value: totalInventory > 0 ? Number(((Number(item.quantity || 0) / totalInventory) * 100).toFixed(1)) : 0,
    color: palette[index % palette.length]
  }));

  const topProducts = topProductRows.map((item) => {
    const sales = Number(item.sales || 0);
    const previousSales = Number(item.previousSales || 0);

    return {
      name: item.name,
      sales,
      revenue: Number(item.revenue || 0),
      growth: pctChange(sales, previousSales)
    };
  });

  const lowStockItems = lowStockRows.map((item) => {
    const stock = Number(item.stock || 0);
    const minStockLevel = Number(item.minStockLevel || 0);

    return {
      id: Number(item.id),
      name: item.name,
      sku: item.sku,
      stock,
      status: stock <= Math.max(1, Math.floor(minStockLevel / 2)) ? 'critical' : 'low'
    };
  });

  const bestProduct = topProducts[0];
  const bestGrowth = bestProduct ? Math.max(0, Number(bestProduct.growth || 0)).toFixed(1) : '0.0';

  const aiInsight = {
    message: bestProduct
      ? `${bestProduct.name} is leading performance with strong revenue momentum. Consider prioritizing stock and promotion this week.`
      : 'Sales are stable this week. Continue monitoring inventory and top categories for shifts.',
    confidence: Math.min(95, Math.max(72, Math.round(75 + Number(bestGrowth))))
  };

  const recentTransactions = recentTransactionRows.map((item) => ({
    id: `#ORD-${String(item.id).padStart(5, '0')}`,
    customer: 'Retail Customer',
    product: item.product,
    amount: Number(item.amount || 0),
    date: formatTransactionTime(item.order_date),
    status: formatStatus(item.status)
  }));

  return {
    header: {
      greeting: 'Good morning, Nguyen An',
      subtitle: "Here's what's happening with your business today.",
      updatedAt: 'Just now'
    },
    kpis,
    salesTrend,
    inventoryByCategory,
    topProducts,
    lowStockItems,
    aiInsight,
    recentTransactions
  };
}
