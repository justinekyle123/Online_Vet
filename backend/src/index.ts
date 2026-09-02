import express from 'express';
import cors from 'cors';
import type { RowDataPacket } from 'mysql2/promise';
import { env } from './config/env';
import { pool } from './db';
import { usersRouter } from './routes/users';
import { petsRouter } from './routes/pets';
import { authRouter } from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'Veterinary API',
    endpoints: ['GET /api/health', 'GET /api/health/db', 'GET /api/landing', '/api/auth/*', '/api/users', '/api/pets'],
  });
});

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

app.get('/api/health/db', async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT VERSION() AS version, DATABASE() AS database_name',
    );
    const [connRows] = await pool.query<RowDataPacket[]>('SHOW STATUS LIKE \'Threads_connected\'');
    res.json({
      status: 'ok',
      database: 'connected',
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      tls: env.dbSsl,
      version: rows[0]?.version,
      databaseName: rows[0]?.database_name,
      poolConnections: connRows[0]?.Value,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Database check failed:', message);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      tls: env.dbSsl,
      error: message,
    });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);

// Central error handler — unexpected errors become JSON 500s
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err instanceof Error ? err.message : err);
  res.status(500).json({ error: 'Internal server error' });
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
