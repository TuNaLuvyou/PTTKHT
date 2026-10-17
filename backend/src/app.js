/**
 * Express application factory — port of backend/src/main.ts + AppModule.
 *
 * Mirrors the NestJS bootstrap exactly:
 *   - global prefix `api`                 → every router mounted under /api/*
 *   - CORS from CORS_ORIGIN (',' split, '*' wildcard toggles credentials)
 *   - default body parsers (express.json / urlencoded, same defaults Nest uses)
 *   - global request logging               (LogInterceptor)
 *   - ValidationPipe's `whitelist` behaviour is implemented in src/validators
 *   - 404 + error handler produce the NestJS JSON shape
 *     { statusCode, message, error }
 *
 * No static file serving was configured in the old app, so none is added here.
 */
const express = require('express');
const cors = require('cors');

const config = require('./config/env');
const {
  requestLogger,
  notFoundHandler,
  errorHandler,
} = require('./middlewares/logger.middleware');

const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const employerRoutes = require('./routes/employer.routes');
const cvScoringRoutes = require('./routes/cvScoring.routes');
const adminRoutes = require('./routes/admin.routes');

/**
 * Build the Express app (without listening), so tests can import it directly.
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // ── CORS (mirrors main.ts) ──────────────────────────────────────────
  const origins = config.corsOrigin
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const isWildcard = origins.includes('*');

  app.use(
    cors({
      origin: isWildcard ? '*' : origins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: !isWildcard,
    }),
  );

  // ── Body parsers (Nest platform-express defaults) ───────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Global request logging (LogInterceptor) ─────────────────────────
  app.use(requestLogger);

  // ── Root route (AppController → `GET /api`) ─────────────────────────
  app.get('/api', (req, res) => {
    res.send('Hello World!');
  });

  // ── Feature routers (global prefix `api`) ───────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/employer', employerRoutes);
  app.use('/api/cv-scoring', cvScoringRoutes);
  app.use('/api/admin', adminRoutes);

  // ── Fallbacks ───────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
