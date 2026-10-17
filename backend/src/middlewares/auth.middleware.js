/**
 * Auth middlewares — port of:
 *   - backend/src/auth/strategies/jwt.strategy.ts   (verifyToken)
 *   - backend/src/auth/guards/jwt-auth.guard.ts     (verifyToken)
 *   - backend/src/auth/guards/roles.guard.ts        (authorizeRoles)
 *
 * `req.user` is set to the *full Mongoose User document* (exactly what the old
 * JwtStrategy.validate() returned), so controllers can keep using:
 *   req.user._id, req.user.id, req.user.role, req.user.email, req.user.name, ...
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { HttpError } = require('../utils/httpError');
const userService = require('../services/user.service');

/**
 * Extract a JWT from either the `Authorization: Bearer <token>` header
 * or the `?token=` query parameter (same extractors as the old JwtStrategy).
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }
  if (req.query && req.query.token) {
    return String(req.query.token);
  }
  return null;
}

/**
 * Required authentication.
 * Mirrors JwtAuthGuard + JwtStrategy.validate():
 *   1. token must exist and be valid (else 401 "Unauthorized")
 *   2. the user must still exist (else 401 "Unauthorized")
 *   3. banned users are rejected (401 with the custom Vietnamese message)
 * On success sets `req.user` and calls next().
 */
async function verifyToken(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      throw HttpError.unauthorized();
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      // invalid signature / expired / malformed — passport also gives 401 here
      throw HttpError.unauthorized();
    }

    const user = await userService.findById(payload.sub);
    if (!user) {
      throw HttpError.unauthorized();
    }

    // Block banned users from accessing any authenticated endpoint
    if (user.status === 'banned') {
      throw HttpError.unauthorized(
        'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.',
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication.
 * If a valid (non-banned) token is present it sets `req.user`; otherwise it
 * simply continues without error. Useful for endpoints that behave
 * differently for logged-in users (the old code used `if (req.user) { ... }`).
 */
async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await userService.findById(payload.sub);
    if (user && user.status !== 'banned') {
      req.user = user;
    }
  } catch (err) {
    // ignore invalid tokens for optional auth
  }

  return next();
}

/**
 * Role-based authorization. Must run AFTER verifyToken.
 * Mirrors RolesGuard:
 *   - no roles required → allow
 *   - no `req.user`       → 403 "Bạn cần đăng nhập để thực hiện thao tác này"
 *   - wrong role          → 403 "Bạn không có quyền truy cập..."
 *
 * Usage: router.post('/', verifyToken, authorizeRoles('employer', 'admin'), handler)
 *
 * @param {...string} roles allowed roles (e.g. 'admin', 'employer', 'candidate')
 * @returns {import('express').RequestHandler}
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles || roles.length === 0) {
      return next();
    }

    if (!req.user) {
      return next(
        HttpError.forbidden('Bạn cần đăng nhập để thực hiện thao tác này'),
      );
    }

    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      return next(
        HttpError.forbidden(
          `Bạn không có quyền truy cập. Yêu cầu quyền: [${roles.join(', ')}]`,
        ),
      );
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  optionalAuth,
  authorizeRoles,
  extractToken,
};
