import { Router } from 'express';
import multer from 'multer';
import { uploadDataController } from '../controllers/uploadController.js';
import { inventoryAnalyticsController, revenueAnalyticsController } from '../controllers/analyticsController.js';
import { chatbotController, forecastController, recommendationsController } from '../controllers/aiController.js';
import { dashboardOverviewController, dashboardSummaryController } from '../controllers/dashboardController.js';
import { reportsOverviewController } from '../controllers/reportsController.js';
import {
  settingsOverviewController,
  settingsSaveAiController,
  settingsSaveBusinessController,
  settingsSaveNotificationsController,
  settingsSaveProfileController,
  settingsSaveSecurityController
} from '../controllers/settingsController.js';
import { searchGlobalController } from '../controllers/searchController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/data/upload', upload.single('file'), uploadDataController);
router.get('/analytics/revenue', revenueAnalyticsController);
router.get('/analytics/inventory', inventoryAnalyticsController);
router.get('/ai/forecast', forecastController);
router.get('/ai/recommendations', recommendationsController);
router.post('/chatbot/ask', chatbotController);
router.get('/dashboard/summary', dashboardSummaryController);
router.get('/dashboard/overview', dashboardOverviewController);
router.get('/reports/overview', reportsOverviewController);
router.get('/settings/overview', settingsOverviewController);
router.post('/settings/profile', settingsSaveProfileController);
router.post('/settings/business', settingsSaveBusinessController);
router.post('/settings/notifications', settingsSaveNotificationsController);
router.post('/settings/ai', settingsSaveAiController);
router.post('/settings/security', settingsSaveSecurityController);
router.get('/search/global', searchGlobalController);

export default router;
