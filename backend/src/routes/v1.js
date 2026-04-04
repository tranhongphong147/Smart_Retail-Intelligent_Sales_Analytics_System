import { Router } from 'express';
import multer from 'multer';
import { uploadDataController } from '../controllers/uploadController.js';
import { inventoryAnalyticsController, revenueAnalyticsController } from '../controllers/analyticsController.js';
import { chatbotController, forecastController, recommendationsController } from '../controllers/aiController.js';
import { dashboardSummaryController } from '../controllers/dashboardController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/data/upload', upload.single('file'), uploadDataController);
router.get('/analytics/revenue', revenueAnalyticsController);
router.get('/analytics/inventory', inventoryAnalyticsController);
router.get('/ai/forecast', forecastController);
router.get('/ai/recommendations', recommendationsController);
router.post('/chatbot/ask', chatbotController);
router.get('/dashboard/summary', dashboardSummaryController);

export default router;
