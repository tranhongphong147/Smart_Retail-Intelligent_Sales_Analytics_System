import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  dbHost: process.env.DB_HOST || 'mysql',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbName: process.env.DB_NAME || 'smart_retail',
  dbUser: process.env.DB_USER || 'sr_user',
  dbPassword: process.env.DB_PASSWORD || 'sr_password',
  useMockData: process.env.USE_MOCK_DATA === 'true'
};
