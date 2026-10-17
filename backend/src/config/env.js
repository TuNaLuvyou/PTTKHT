/**
 * Central environment configuration.
 * Loads variables from `.env` once and exposes them as a typed-ish object,
 * so the rest of the app never touches `process.env` directly.
 *
 * Migrated from NestJS ConfigModule (see backend/src/app.module.ts).
 */
require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  // CORS: comma-separated list, or '*' for wildcard.
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // PostgreSQL connection string consumed by Prisma (see prisma/schema.prisma
  // and docker-compose.yml).
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://nexcvd:nexcvd_secret@localhost:5442/nexcvd?schema=public',

  // JWT (old code: JWT_SECRET fallback 'fallback_secret';
  // token expiry read from JWT_EXPIRES_IN, default '7d' — see auth.module.ts).
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpires: process.env.JWT_EXPIRES_IN || '7d',

  // Google Gemini API (CV scoring)
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // OpenAI (kept for parity — optional provider)
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // Frontend URL (used to build password-reset links)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // SMTP / Email.
  // NOTE: keep raw values (no defaults) so the email service can detect
  // "not configured" exactly like the old NestJS ConfigService did.
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
};

module.exports = config;
