import mysql from 'mysql2/promise';
import { env } from './config/env';

const ssl = env.dbSsl
  ? {
      ca: env.dbCa,
      rejectUnauthorized: true,
    }
  : undefined;

export const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl,
});
