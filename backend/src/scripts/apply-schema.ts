import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function splitStatements(sql: string): string[] {
  return sql
    .split(/^\s*DELIMITER .*$/gm) // safety in case DELIMITER ever appears
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
}

async function main() {
  const ssl = env.dbSsl
    ? {
        ca: env.dbCa,
        rejectUnauthorized: true,
      }
    : undefined;

  // Connect WITHOUT database selected so CREATE DATABASE/USE work.
  const connection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    ssl,
    multipleStatements: true,
  });

  const sqlPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  let sql = readFileSync(sqlPath, 'utf8');
  // schema.sql hardcodes `veterinary_app`; target the database configured in .env instead
  sql = sql.replaceAll('veterinary_app', env.dbName);

  const statements = splitStatements(sql);
  console.log(`Applying ${statements.length} statements from db/schema.sql to ${env.dbHost}:${env.dbPort}...`);

  try {
    for (const [i, statement] of statements.entries()) {
      const label = statement.split('\n')[0].slice(0, 60);
      try {
        await connection.query(statement);
        console.log(`  [${i + 1}/${statements.length}] OK: ${label}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (/^CREATE DATABASE|^USE\b/i.test(statement) && /denied|exists/i.test(message)) {
          console.warn(`  [${i + 1}/${statements.length}] SKIPPED: ${label} (${message})`);
          continue;
        }
        throw err;
      }
    }
    console.log('Schema applied successfully.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
