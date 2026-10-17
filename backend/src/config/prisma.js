/**
 * Prisma client singleton (replaces the old Mongoose connection helper
 * `src/config/db.js`).
 *
 * One PrismaClient is shared by the whole process — Prisma manages its own
 * connection pool internally, so instantiating it per request would leak
 * connections.
 *
 * `.env` is loaded here (idempotently) so every entry point — `server.js` and
 * `prisma/seed.js` — resolves DATABASE_URL no matter which module it imports
 * first.
 *
 * Usage:
 *   const { prisma } = require('../config/prisma');
 */
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['error'] });

/**
 * Verify the database is reachable. Mirrors the old `connectDB()` so the
 * bootstrap keeps the same shape: connect first, then start listening.
 * @returns {Promise<void>}
 */
async function connectDB() {
  await prisma.$connect();
  console.log('✅ PostgreSQL connected (Prisma)');
}

/**
 * Close the pool (used by the graceful shutdown handler).
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  await prisma.$disconnect();
}

module.exports = { prisma, connectDB, disconnectDB };
