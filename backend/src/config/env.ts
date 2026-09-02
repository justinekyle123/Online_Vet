import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3000),
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'veterinary_app',
  dbSsl: process.env.DB_SSL === 'true',
  dbCa: process.env.DB_CA,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}

if (!Number.isInteger(env.dbPort) || env.dbPort < 1 || env.dbPort > 65535) {
  throw new Error('DB_PORT must be a valid TCP port');
}
