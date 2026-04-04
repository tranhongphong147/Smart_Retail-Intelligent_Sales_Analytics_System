import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';
import { withTransaction } from '../db/pool.js';

function parseRows(buffer, originalname) {
  const lower = originalname.toLowerCase();

  if (lower.endsWith('.csv')) {
    const rows = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    return rows;
  }

  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    const firstSheet = wb.SheetNames[0];
    return xlsx.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: '' });
  }

  const err = new Error('Unsupported file type. Please upload CSV or Excel file.');
  err.status = 400;
  throw err;
}

export async function importHistoricalData(file) {
  if (!file) {
    const err = new Error('File is required.');
    err.status = 400;
    throw err;
  }

  const rows = parseRows(file.buffer, file.originalname);

  if (!rows.length) {
    return {
      message: 'No rows found in uploaded file.',
      insertedOrders: 0,
      insertedOrderItems: 0,
      skippedRows: 0,
      errors: []
    };
  }

  let insertedOrders = 0;
  let insertedOrderItems = 0;
  let skippedRows = 0;
  const errors = [];

  await withTransaction(async (connection) => {
    for (const [index, row] of rows.entries()) {
      try {
        const orderDate = row.order_date || row.orderDate;
        const totalAmount = Number(row.total_amount ?? row.totalAmount ?? 0);
        const status = (row.status || 'completed').toLowerCase();
        const sku = row.sku;
        const quantity = Number(row.quantity || 0);
        const priceAtPurchase = Number(row.price_at_purchase ?? row.priceAtPurchase ?? 0);

        if (!orderDate || !sku || Number.isNaN(totalAmount) || Number.isNaN(quantity) || Number.isNaN(priceAtPurchase)) {
          skippedRows += 1;
          errors.push({ row: index + 1, reason: 'Missing or invalid required columns' });
          continue;
        }

        const [productRows] = await connection.execute(
          'SELECT id FROM products WHERE sku = ? LIMIT 1',
          [sku]
        );

        if (!productRows.length) {
          skippedRows += 1;
          errors.push({ row: index + 1, reason: `Product with SKU ${sku} not found` });
          continue;
        }

        const productId = productRows[0].id;

        const [orderResult] = await connection.execute(
          'INSERT INTO orders (order_date, total_amount, status) VALUES (?, ?, ?)',
          [orderDate, totalAmount, ['completed', 'canceled', 'refunded'].includes(status) ? status : 'completed']
        );

        insertedOrders += 1;

        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
          [orderResult.insertId, productId, quantity, priceAtPurchase]
        );

        insertedOrderItems += 1;
      } catch (error) {
        skippedRows += 1;
        errors.push({ row: index + 1, reason: error.message });
      }
    }
  });

  return {
    message: 'Upload processed',
    insertedOrders,
    insertedOrderItems,
    skippedRows,
    errors
  };
}
