import { query } from '../db/pool.js';

export async function searchGlobal({ q = '', limit = 8 }) {
  const keyword = String(q || '').trim();
  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 20);

  if (!keyword) {
    return { query: '', products: [], orders: [] };
  }

  const pattern = `%${keyword}%`;

  const [products, orders] = await Promise.all([
    query(
      `SELECT p.id, p.sku, p.name, p.category, i.current_quantity AS stock
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.name LIKE ? OR p.sku LIKE ? OR p.category LIKE ?
       ORDER BY p.name ASC
       LIMIT ${safeLimit}`,
      [pattern, pattern, pattern]
    ),
    query(
      `SELECT o.id,
              o.total_amount AS totalAmount,
              o.status,
              o.order_date AS orderDate,
              COALESCE(op.product_name, 'Multiple items') AS product
       FROM orders o
       LEFT JOIN (
         SELECT oi.order_id, MIN(p.name) AS product_name
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         GROUP BY oi.order_id
       ) op ON op.order_id = o.id
       WHERE CAST(o.id AS CHAR) LIKE ?
          OR o.status LIKE ?
          OR op.product_name LIKE ?
       ORDER BY o.order_date DESC
       LIMIT ${safeLimit}`,
      [pattern, pattern, pattern]
    )
  ]);

  return {
    query: keyword,
    products: products.map((item) => ({
      id: Number(item.id),
      sku: item.sku,
      name: item.name,
      category: item.category || 'Uncategorized',
      stock: Number(item.stock || 0)
    })),
    orders: orders.map((item) => ({
      id: Number(item.id),
      product: item.product,
      status: item.status,
      totalAmount: Number(item.totalAmount || 0),
      orderDate: item.orderDate
    }))
  };
}
