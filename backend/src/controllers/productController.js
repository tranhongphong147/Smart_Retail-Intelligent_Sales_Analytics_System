import * as productService from '../services/productService.js';

/**
 * GET /api/v1/products
 */
export async function listProductsController(req, res, next) {
  try {
    const { search, category } = req.query;
    const products = await productService.getAllProducts({ search, category });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/products/:id
 */
export async function getProductController(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/products
 */
export async function createProductController(req, res, next) {
  try {
    const { sku, name, cost_price, selling_price } = req.body;

    // Validation cơ bản
    if (!sku || !name || cost_price === undefined || selling_price === undefined) {
      return res.status(400).json({ message: 'Missing required fields: sku, name, cost_price, selling_price' });
    }

    const newProduct = await productService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    // Xử lý lỗi trùng SKU (Unique constraint)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }
    next(error);
  }
}

/**
 * PUT /api/v1/products/:id
 */
export async function updateProductController(req, res, next) {
  try {
    const { id } = req.params;
    
    // Kiểm tra sản phẩm tồn tại trước khi cập nhật
    const existing = await productService.getProductById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await productService.updateProduct(id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/products/:id
 */
export async function deleteProductController(req, res, next) {
  try {
    const { id } = req.params;
    const success = await productService.deleteProduct(id);

    if (!success) {
      return res.status(404).json({ message: 'Product not found or already deleted' });
    }

    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    next(error);
  }
}
