import { getReportsOverview } from '../services/reportsService.js';

export async function reportsOverviewController(_req, res, next) {
  try {
    const data = await getReportsOverview();
    res.json(data);
  } catch (error) {
    next(error);
  }
}
