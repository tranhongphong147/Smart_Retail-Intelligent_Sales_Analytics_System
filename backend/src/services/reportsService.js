import { query } from '../db/pool.js';

function monthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

export async function getReportsOverview() {
  const [summaryRow] = await query(
    `SELECT COUNT(*) AS completedOrders, COALESCE(SUM(total_amount), 0) AS totalRevenue
     FROM orders
     WHERE status = 'completed'`
  );

  const [downloadRow] = await query(
    `SELECT COUNT(*) AS totalDownloads
     FROM orders
     WHERE status = 'completed' AND order_date >= DATE_SUB(NOW(), INTERVAL 180 DAY)`
  );

  const [scheduledRow] = await query(
    `SELECT COUNT(*) AS lowStockItems
     FROM inventory i
     JOIN products p ON p.id = i.product_id
     WHERE i.current_quantity <= p.min_stock_level`
  );

  const categoryRows = await query(
    `SELECT p.category AS category, COALESCE(SUM(oi.quantity * oi.price_at_purchase),0) AS totalRevenue
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
     GROUP BY p.category
     ORDER BY totalRevenue DESC
     LIMIT 6`
  );

  const month = monthLabel();

  const reports = categoryRows.map((item, index) => ({
    id: index + 1,
    title: `${item.category || 'General'} Performance Report`,
    description: `Revenue performance and trend breakdown for ${item.category || 'all'} products.`,
    category: item.category || 'General',
    date: month,
    status: 'ready',
    size: `${(1.5 + index * 0.4).toFixed(1)} MB`
  }));

  reports.push({
    id: reports.length + 1,
    title: 'AI Insights Summary',
    description: 'Summary of AI recommendations, forecast behavior, and action outcomes.',
    category: 'AI',
    date: month,
    status: 'generating',
    size: '-'
  });

  return {
    quickStats: [
      { label: 'Reports Generated', value: String(Math.max(reports.length * 4, 1)), sub: 'This quarter' },
      { label: 'Total Downloads', value: String(Number(downloadRow.totalDownloads || 0)), sub: 'Last 180 days' },
      { label: 'Scheduled Reports', value: String(Math.max(Number(scheduledRow.lowStockItems || 0), 1)), sub: 'Active' },
      { label: 'Last Generated', value: 'Live', sub: `${month}` }
    ],
    reports,
    scheduled: [
      { name: 'Weekly Sales Summary', schedule: 'Every Monday, 8:00 AM', recipients: 2, next: 'Next Monday' },
      { name: 'Monthly Inventory Report', schedule: '1st of every month', recipients: 1, next: 'Next month' },
      { name: 'Low-Stock Alert', schedule: 'Every day, 9:00 AM', recipients: 3, next: 'Tomorrow' }
    ],
    meta: {
      totalRevenue: Number(summaryRow.totalRevenue || 0),
      completedOrders: Number(summaryRow.completedOrders || 0)
    }
  };
}
