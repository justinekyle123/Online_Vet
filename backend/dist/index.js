"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
        await db_1.pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        console.error('Database health check failed:', error instanceof Error ? error.message : error);
        res.status(503).json({ status: 'error', database: 'disconnected' });
    }
});
const server = app.listen(env_1.env.port, () => {
    console.log(`Backend listening on http://localhost:${env_1.env.port}`);
});
const shutdown = async () => {
    server.close();
    await db_1.pool.end();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
