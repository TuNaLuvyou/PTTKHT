/**
 * AuthController — plain-JS port of backend/src/auth/auth.controller.ts
 *
 * Controllers only handle req/res and delegate to the services. Input is
 * validated up-front with the auth validators (equivalent of Nest's DTOs +
 * ValidationPipe).
 *
 * HTTP status codes match NestJS defaults:
 *   - POST → 201 Created
 *   - GET / PATCH → 200 OK
 */
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} = require('../validators/auth.validator');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const dto = validateRegister(req.body);
    const result = await authService.register(dto);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const dto = validateLogin(req.body);
    const result = await authService.login(dto);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getProfile(req, res, next) {
  try {
    res.json(authService.sanitizeUser(req.user));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/auth/me
async function updateProfile(req, res, next) {
  try {
    const updateData = validateUpdateProfile(req.body);
    const updatedUser = await userService.update(req.user._id, updateData);
    res.json(authService.sanitizeUser(updatedUser));
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const dto = validateForgotPassword(req.body);
    const result = await authService.forgotPassword(dto.email);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const dto = validateResetPassword(req.body);
    const result = await authService.resetPassword(dto.token, dto.password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const dto = validateChangePassword(req.body);
    const result = await authService.changePassword(
      req.user._id,
      dto.currentPassword,
      dto.newPassword,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
};
