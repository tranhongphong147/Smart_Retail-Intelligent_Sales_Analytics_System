import request from 'supertest';
import app from '../src/app.js';

describe('SR-IAS Backend API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/v1/dashboard/summary returns summary payload', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('project');
    expect(res.body).toHaveProperty('kpis');
  });

  test('GET /api/v1/analytics/revenue returns analytics payload', async () => {
    const res = await request(app).get('/api/v1/analytics/revenue?granularity=day');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test('GET /api/v1/analytics/inventory returns inventory analytics payload', async () => {
    const res = await request(app).get('/api/v1/analytics/inventory');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('fastMoving');
    expect(res.body).toHaveProperty('slowMoving');
    expect(res.body).toHaveProperty('lowStockWarnings');
  });

  test('GET /api/v1/ai/forecast returns forecast payload', async () => {
    const res = await request(app).get('/api/v1/ai/forecast?horizonDays=14');
    expect(res.statusCode).toBe(200);
    expect(res.body.horizonDays).toBe(14);
    expect(Array.isArray(res.body.predictions)).toBe(true);
  });

  test('GET /api/v1/ai/recommendations returns recommendation list', async () => {
    const res = await request(app).get('/api/v1/ai/recommendations');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test('POST /api/v1/chatbot/ask returns answer', async () => {
    const res = await request(app)
      .post('/api/v1/chatbot/ask')
      .send({ question: 'Why did revenue drop?' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('answer');
  });

  test('POST /api/v1/data/upload returns 400 without file', async () => {
    const res = await request(app).post('/api/v1/data/upload');
    expect(res.statusCode).toBe(400);
  });
});
