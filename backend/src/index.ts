import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { pool } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/landing', (_req, res) => {
  res.json({
    brand: 'PawCare',
    eyebrow: 'Trusted care for every companion',
    title: 'A healthier, happier life for your best friend.',
    description: 'Compassionate veterinary care, modern medicine, and a team that treats every pet like family.',
    primaryCta: 'Book an appointment',
    secondaryCta: 'Explore our care',
    stats: [
      { value: '15+', label: 'Years of care' },
      { value: '24/7', label: 'Emergency support' },
      { value: '4.9/5', label: 'Pet parent rating' },
    ],
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error instanceof Error ? error.message : error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

const server = app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
});

const shutdown = async () => {
  server.close();
  await pool.end();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
