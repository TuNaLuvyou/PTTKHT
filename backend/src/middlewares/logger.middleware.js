/**
 * Logging & centralised error handling — port of:
 *   - backend/src/common/log.interceptor.ts (requestLogger)
 *   - Nest's global exception filter        (errorHandler)
 *
 * The error response mirrors NestJS exactly:
 *   { "statusCode": <number>, "message": <string|string[]>, "error": "<label>" }
 */
const { AppLogger } = require('../utils/logger');
const { HttpError, getErrorName } = require('../utils/httpError');

const logger = AppLogger.forContext('HTTP');

/**
 * Describe the authenticated user for log lines (same emoji format as the
 * old LogInterceptor).
 * @param {any} user
 * @returns {{ id: string, role: string }}
 */
function describeUser(user) {
  const raw =
    (user && (user._id || user.id) ? String(user._id || user.id) : null) ||
    'anonymous';
  return { id: raw.slice(-6), role: (user && user.role) || 'guest' };
}

/**
 * Request logger. Measures duration and logs one line per request when the
 * response finishes. Errors are logged by `errorHandler` instead (to avoid
 * double logging), unless a route set a 4xx/5xx status manually.
 */
function requestLogger(req, res, next) {
  req._startTime = Date.now();

  res.on('finish', () => {
    if (req._errorLogged) return; // already logged by errorHandler

    const duration = Date.now() - req._startTime;
    const { id, role } = describeUser(req.user);
    const line = `${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms | 👤 ${id} 🎭 ${role}`;

    if (res.statusCode >= 400) {
      logger.warn(line);
    } else {
      logger.log(line);
    }
  });

  next();
}

/**
 * 404 handler for unmatched routes.
 * Matches Nest's default: { statusCode: 404, message: 'Cannot GET /path', error: 'Not Found' }
 */
function notFoundHandler(req, res, next) {
  next(new HttpError(404, `Cannot ${req.method} ${req.originalUrl}`));
}

/**
 * Global error handler (must be registered LAST, with 4 arguments).
 * Normalises any thrown error into the NestJS JSON shape and logs it.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number(err.statusCode || err.status) || 500;
  const isHttpError = err.isHttpError === true;

  // Mirror NestJS: unknown/unexpected errors are reported as a generic 500
  // (never leak internal messages/stack to the client).
  const error =
    !isHttpError && statusCode >= 500
      ? getErrorName(500)
      : err.error || getErrorName(statusCode);

  let message = err.message;
  if (!isHttpError && statusCode >= 500) {
    message = getErrorName(500);
  } else if (message === undefined || message === null || message === '') {
    message = error;
  }

  // ─── Log (mirrors LogInterceptor error branch) ─────────────────────
  const start = req._startTime || Date.now();
  const duration = Date.now() - start;
  const { id, role } = describeUser(req.user);
  const printableMessage = Array.isArray(message)
    ? message.join(', ')
    : message;
  const line = `${req.method} ${req.originalUrl} | ${statusCode} | ${duration}ms | 👤 ${id} 🎭 ${role} | ❌ ${printableMessage}`;
  logger.error(line, err.stack);
  req._errorLogged = true;

  res.status(statusCode).json({ statusCode, message, error });
}

module.exports = {
  requestLogger,
  notFoundHandler,
  errorHandler,
};
