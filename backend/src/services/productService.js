import { query } from '../db/pool.js';

/**
 * Lấy danh sách sản phẩm với hỗ trợ tìm kiếm và lọc
 */
export async function getAllProducts({ search, category }) {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY id DESC';

  return await query(sql, params);
}

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export async function getProductById(id) {
  const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

/**
 * Tạo sản phẩm mới và khởi tạo bản ghi trong kho (inventory)
 */
export async function createProduct(data) {
  const { sku, name, category, cost_price, selling_price, min_stock_level, initial_quantity = 0 } = data;

  // 1. Thêm vào bảng products
  const result = await query(
    `INSERT INTO products (sku, name, category, cost_price, selling_price, min_stock_level)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sku, name, category, cost_price, selling_price, min_stock_level]
  );

  const productId = result.insertId;

  // 2. Khởi tạo bản ghi trong kho hàng (inventory) với số lượng ban đầu
  await query(
    'INSERT INTO inventory (product_id, current_quantity, last_restocked_date) VALUES (?, ?, CURDATE())',
    [productId, initial_quantity]
  );

  return { id: productId, ...data };
}

/**
 * Cập nhật thông tin sản phẩm
 */
export async function updateProduct(id, data) {
  const { sku, name, category, cost_price, selling_price, min_stock_level } = data;

  await query(
    `UPDATE products 
     SET sku = ?, name = ?, category = ?, cost_price = ?, selling_price = ?, min_stock_level = ?
     WHERE id = ?`,
    [sku, name, category, cost_price, selling_price, min_stock_level, id]
  );

  return { id, ...data };
}

/**
 * Xóa sản phẩm
 * Lưu ý: Các bản ghi liên quan trong bảng inventory sẽ tự động bị xóa nhờ ON DELETE CASCADE
 */
export async function deleteProduct(id) {
  const result = await query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
