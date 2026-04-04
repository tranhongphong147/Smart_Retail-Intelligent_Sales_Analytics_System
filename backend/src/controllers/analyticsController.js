import { getInventoryAnalytics, getRevenueAnalytics } from '../services/analyticsService.js';

export async function revenueAnalyticsController(req, res, next) {
  try {
    const data = await getRevenueAnalytics({
      granularity: req.query.granularity,
      from: req.query.from,
      to: req.query.to
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function inventoryAnalyticsController(_req, res, next) {
  try {
    const data = await getInventoryAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
}
