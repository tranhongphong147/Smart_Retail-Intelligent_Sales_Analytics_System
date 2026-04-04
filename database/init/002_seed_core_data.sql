INSERT INTO users (username, password_hash, role)
VALUES
  ('admin', 'hashed_admin_password', 'admin'),
  ('manager01', 'hashed_manager_password', 'manager'),
  ('staff01', 'hashed_staff_password', 'staff')
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO products (sku, name, category, cost_price, selling_price, min_stock_level)
VALUES
  ('SKU-A', 'Product A', 'Beverage', 12000, 18000, 20),
  ('SKU-B', 'Product B', 'Snack', 8000, 13000, 10),
  ('SKU-C', 'Product C', 'Household', 35000, 49000, 15)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO inventory (product_id, current_quantity, last_restocked_date)
SELECT p.id, d.current_quantity, d.last_restocked_date
FROM (
  SELECT 'SKU-A' AS sku, 120 AS current_quantity, '2026-03-25' AS last_restocked_date
  UNION ALL
  SELECT 'SKU-B', 6, '2026-03-20'
  UNION ALL
  SELECT 'SKU-C', 42, '2026-03-29'
) d
JOIN products p ON p.sku = d.sku
ON DUPLICATE KEY UPDATE current_quantity = VALUES(current_quantity);
