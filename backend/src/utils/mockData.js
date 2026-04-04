export const mockSummary = {
  project: 'SR-IAS',
  status: 'milestone-1-in-progress',
  kpis: {
    totalRevenueToday: 12500000,
    totalOrdersToday: 48,
    lowStockAlerts: 3
  },
  highlights: [
    'Product A is trending up this week',
    'Product B inventory is below minimum threshold',
    'Forecast service will be connected in next phase'
  ]
};

export const mockRevenue = {
  granularity: 'day',
  from: '2026-04-01',
  to: '2026-04-30',
  items: [
    { period: '2026-04-01', totalRevenue: 2400000, totalOrders: 12 },
    { period: '2026-04-02', totalRevenue: 3150000, totalOrders: 15 }
  ]
};

export const mockInventoryAnalytics = {
  fastMoving: [{ productId: 1, sku: 'SKU-A', name: 'Product A', soldQuantity: 80 }],
  slowMoving: [{ productId: 2, sku: 'SKU-B', name: 'Product B', soldQuantity: 5 }],
  lowStockWarnings: [{ productId: 2, sku: 'SKU-B', name: 'Product B', currentQuantity: 3, minStockLevel: 10 }]
};

export const mockForecast = {
  horizonDays: 14,
  predictions: [
    { date: '2026-04-05', predictedRevenue: 3200000 },
    { date: '2026-04-06', predictedRevenue: 3400000 }
  ],
  model: 'baseline-regression'
};

export const mockRecommendations = {
  items: [
    {
      type: 'restock',
      productId: 2,
      sku: 'SKU-B',
      action: 'Restock 50 units',
      reason: 'Projected stockout within 7 days',
      priority: 'high'
    },
    {
      type: 'discount',
      productId: 3,
      sku: 'SKU-C',
      action: 'Apply 10% discount',
      reason: 'Slow-moving inventory in last 30 days',
      priority: 'medium'
    }
  ]
};
