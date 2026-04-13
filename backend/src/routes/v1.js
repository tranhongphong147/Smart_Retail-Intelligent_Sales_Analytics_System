import { Router } from 'express';
import { dashboardOverviewController, dashboardSummaryController } from '../controllers/dashboardController.js';
import {
  createProductController,
  deleteProductController,
  getProductController,
  listProductsController,
  updateProductController
} from '../controllers/productController.js';

const router = Router();

router.get('/dashboard/summary', dashboardSummaryController);
router.get('/dashboard/overview', dashboardOverviewController);

// Product Management Routes
router.get('/products', listProductsController);
router.get('/products/:id', getProductController);
router.post('/products', createProductController);
router.put('/products/:id', updateProductController);
router.delete('/products/:id', deleteProductController);

export default router;
