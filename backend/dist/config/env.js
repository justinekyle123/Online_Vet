"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
exports.env = {
    port: Number(process.env.PORT || 3000),
    dbHost: process.env.DB_HOST || '127.0.0.1',
    dbPort: Number(process.env.DB_PORT || 3306),
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || 'veterinary_app',
    dbSsl: process.env.DB_SSL === 'true',
    dbCa: process.env.DB_CA,
};
if (!Number.isInteger(exports.env.port) || exports.env.port < 1 || exports.env.port > 65535) {
    throw new Error('PORT must be a valid TCP port');
}
if (!Number.isInteger(exports.env.dbPort) || exports.env.dbPort < 1 || exports.env.dbPort > 65535) {
    throw new Error('DB_PORT must be a valid TCP port');
}
