/**
 * AuthService — plain-JS port of backend/src/auth/auth.service.ts
 * (register, login, password reset, change password, JWT issuing).
 *
 * Behaviour preserved 1:1:
 *   - settings-driven password policy / verification flags (Settings collection)
 *   - conflict on existing email (409), 401 on bad credentials / banned users
 *   - JWT payload { email, sub, role }, expiry = JWT_EXPIRES_IN || '7d'
 *   - password-reset token valid 1h, stored hashed (bcrypt rounds 6)
 *   - `sanitizeUser` strips password and adds `id`
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config/env');
const { prisma } = require('../config/prisma');
const userService = require('./user.service');
const emailService = require('./email.service');
const notificationsGateway = require('../sockets/notifications.gateway');
const { HttpError } = require('../utils/httpError');
const { AppLogger } = require('../utils/logger');

const logger = AppLogger.forContext('AuthService');

/**
 * Read the security/user settings from the Settings collection, falling back
 * to defaults (mirrors AuthService.getSettings).
 */
async function getSettings() {
  const defaults = {
    users: {
      emailVerificationRequired: false,
      employerVerificationRequired: true,
      maxSavedJobs: 50,
    },
    security: {
      passwordMinLength: 6,
      maxLoginAttempts: 5,
      sessionTimeoutMin: 60,
      mfaEnabled: false,
      rbacEnabled: false,
      auditLogEnabled: true,
    },
  };

  try {
    const doc = await prisma.settings.findUnique({ where: { key: 'global' } });
    if (!doc) return defaults;
    return {
      users: { ...defaults.users, ...(doc.users || {}) },
      security: { ...defaults.security, ...(doc.security || {}) },
    };
  } catch {
    return defaults;
  }
}

/**
 * Sign a JWT for a user (payload identical to the old AuthService.generateToken).
 * @param {any} user
 * @returns {string}
 */
function generateToken(user) {
  const payload = { email: user.email, sub: user._id, role: user.role };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpires });
}

/**
 * Strip the password and expose `id` (mirrors AuthService.sanitizeUser).
 * @param {any} user
 * @returns {object}
 */
function sanitizeUser(user) {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  // toObject() strips virtuals — add id explicitly from _id
  userObj.id = user._id.toString();
  return userObj;
}

/**
 * Register a new user.
 * @param {object} registerDto validated body (see validators/auth.validator.js)
 */
async function register(registerDto) {
  const { email, password } = registerDto;

  // Check if user exists
  const existingUser = await userService.findByEmail(email);
  if (existingUser) {
    logger.fail('Đăng ký thất bại', {
      email,
      action: 'register',
      reason: 'Email đã tồn tại',
    });
    throw new HttpError(409, 'Email đã tồn tại');
  }

  // Read security & users settings
  const settings = await getSettings();

  // Enforce passwordMinLength
  if (password.length < settings.security.passwordMinLength) {
    throw new HttpError(
      400,
      `Mật khẩu phải có ít nhất ${settings.security.passwordMinLength} ký tự.`,
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const { confirmPassword, ...userData } = registerDto;
  const user = await userService.create({
    ...userData,
    password: hashedPassword,
    emailVerified: !settings.users.emailVerificationRequired, // auto-verified if setting disabled
    verified:
      userData.role === 'employer'
        ? !settings.users.employerVerificationRequired
        : true, // employers need verification only if setting enabled
  });

  // Generate token
  const token = generateToken(user);

  logger.success('Đăng ký thành công', {
    userId: user._id.toString(),
    email,
    userRole: user.role,
    action: 'register',
  });

  // Notify admin dashboard to refresh data (new user needs approval)
  try {
    notificationsGateway.emitDashboardUpdateNeeded();
  } catch (e) {
    logger.warn('Failed to emit dashboard update via WebSocket', e);
  }

  return {
    token,
    user: sanitizeUser(user),
  };
}

/**
 * Authenticate a user and return a JWT.
 * @param {object} loginDto validated body
 */
async function login(loginDto) {
  const { email, password } = loginDto;

  // Find user
  const user = await userService.findByEmail(email);
  if (!user) {
    logger.fail('Đăng nhập thất bại', {
      email,
      action: 'login',
      reason: 'Email không tồn tại',
    });
    throw new HttpError(401, 'Email hoặc mật khẩu không đúng');
  }

  // Check if user is banned
  if (user.status === 'banned') {
    logger.fail('Đăng nhập thất bại - tài khoản bị cấm', {
      userId: user._id.toString(),
      email,
      action: 'login',
      reason: 'Tài khoản bị cấm',
    });
    throw new HttpError(
      401,
      'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.',
    );
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.fail('Đăng nhập thất bại', {
      userId: user._id.toString(),
      email,
      action: 'login',
      reason: 'Sai mật khẩu',
    });
    throw new HttpError(401, 'Email hoặc mật khẩu không đúng');
  }

  // Generate token
  const token = generateToken(user);

  logger.success('Đăng nhập thành công', {
    userId: user._id.toString(),
    email,
    userRole: user.role,
    action: 'login',
  });

  return {
    token,
    user: sanitizeUser(user),
  };
}

// ─── Password reset ───────────────────────────────────────────────────

/**
 * Start the password-reset flow.
 * @param {string} email
 */
async function forgotPassword(email) {
  const user = await userService.findByEmail(email);
  if (!user) {
    logger.log('Yêu cầu reset mật khẩu cho email không tồn tại', {
      email,
      action: 'forgot_password',
    });
    return {
      found: false,
      message:
        'Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.',
    };
  }

  // Generate a short-lived reset token (valid for 1 hour)
  const resetToken = jwt.sign(
    { sub: user._id, type: 'password_reset' },
    config.jwtSecret,
    { expiresIn: '1h' },
  );

  // Store the reset token hash in the user document
  const resetTokenHash = await bcrypt.hash(resetToken, 6);
  await userService.update(user._id.toString(), {
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
  });

  logger.success('Đã tạo token reset mật khẩu', {
    userId: user._id.toString(),
    email,
    action: 'forgot_password',
  });

  // Send email with reset link
  const userName = user.name || email.split('@')[0];
  try {
    await emailService.sendPasswordResetEmail(email, resetToken, userName);
    logger.success('Email reset mật khẩu đã gửi', {
      email,
      action: 'forgot_password',
    });
  } catch (e) {
    logger.error('Gửi email reset mật khẩu thất bại', e, {
      email,
      action: 'forgot_password',
    });
  }

  return {
    found: true,
    sent: true,
    message:
      'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư (và thư mục Spam).',
    ...(config.nodeEnv !== 'production' && { resetToken }),
  };
}

/**
 * Complete the password-reset flow.
 * @param {string} token reset token from the email link
 * @param {string} newPassword
 */
async function resetPassword(token, newPassword) {
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    logger.fail('Reset mật khẩu thất bại - token không hợp lệ/hết hạn', {
      action: 'reset_password',
    });
    throw new HttpError(
      400,
      'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
    );
  }

  if (payload.type !== 'password_reset') {
    logger.fail('Reset mật khẩu thất bại - sai loại token', {
      action: 'reset_password',
      sub: payload.sub,
    });
    throw new HttpError(400, 'Token không hợp lệ');
  }

  const user = await userService.findById(payload.sub);
  if (!user || !user.resetPasswordToken) {
    logger.fail(
      'Reset mật khẩu thất bại - không tìm thấy user hoặc token đã dùng',
      { action: 'reset_password', sub: payload.sub },
    );
    throw new HttpError(
      400,
      'Token đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng',
    );
  }

  const isValid = await bcrypt.compare(token, user.resetPasswordToken);
  if (!isValid) {
    logger.fail('Reset mật khẩu thất bại - token sai', {
      action: 'reset_password',
      userId: user._id.toString(),
    });
    throw new HttpError(400, 'Token đặt lại mật khẩu không hợp lệ');
  }

  if (
    !user.resetPasswordExpires ||
    new Date() > new Date(user.resetPasswordExpires)
  ) {
    logger.fail('Reset mật khẩu thất bại - token hết hạn', {
      action: 'reset_password',
      userId: user._id.toString(),
    });
    throw new HttpError(400, 'Token đặt lại mật khẩu đã hết hạn');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userService.update(payload.sub, {
    password: hashedPassword,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  });

  logger.success('Reset mật khẩu thành công', {
    userId: user._id.toString(),
    action: 'reset_password',
  });

  return { message: 'Mật khẩu đã được đặt lại thành công' };
}

/**
 * Change the password of an authenticated user.
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await userService.findById(userId);
  if (!user) {
    logger.fail('Đổi mật khẩu thất bại - không tìm thấy user', {
      userId,
      action: 'change_password',
    });
    throw new HttpError(404, 'Không tìm thấy người dùng');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    logger.fail('Đổi mật khẩu thất bại - sai mật khẩu hiện tại', {
      userId,
      action: 'change_password',
    });
    throw new HttpError(401, 'Mật khẩu hiện tại không đúng');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userService.update(userId, { password: hashedPassword });

  logger.success('Đổi mật khẩu thành công', {
    userId,
    action: 'change_password',
  });

  return { message: 'Đổi mật khẩu thành công' };
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  sanitizeUser,
  generateToken,
  getSettings,
};
