import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedersDir = path.resolve(__dirname, '../../../database/seeders');

async function run() {
  const connection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    multipleStatements: true
  });

  try {
    const files = (await fs.readdir(seedersDir)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = await fs.readFile(path.join(seedersDir, file), 'utf8');
      await connection.query(sql);
      console.log(`Applied seeder: ${file}`);
    }

    console.log('Seeding completed successfully.');
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
