import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

app.get('/api/v1/analytics/revenue', (_req, res) => {
  res.json({
    message: 'Revenue analytics endpoint is running',
    data: []
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
