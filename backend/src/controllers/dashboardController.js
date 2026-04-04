import { getDashboardSummary } from '../services/dashboardService.js';

export async function dashboardSummaryController(_req, res, next) {
  try {
    const data = await getDashboardSummary();
    res.json(data);
  } catch (error) {
    next(error);
  }
}
