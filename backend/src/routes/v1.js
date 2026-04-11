import { Router } from 'express';
import { dashboardOverviewController, dashboardSummaryController } from '../controllers/dashboardController.js';

const router = Router();

router.get('/dashboard/summary', dashboardSummaryController);
router.get('/dashboard/overview', dashboardOverviewController);

export default router;
