/**
 * Auth request validators — plain-JS equivalents of the DTOs in
 * backend/src/auth/dto/auth.dto.ts.
 *
 * Each function validates `req.body` and either:
 *   - returns a whitelisted copy of the input (like Nest's ValidationPipe with
 *     `whitelist: true`), or
 *   - throws HttpError.badRequest([...messages]) — the exact NestJS validation
 *     error shape: { statusCode: 400, message: [...], error: 'Bad Request' }
 */
const { HttpError } = require('../utils/httpError');
const {
  isEmail,
  isNotEmpty,
  minLength,
  isEnum,
  matches,
  isUrl,
  isOptional,
} = require('../utils/validation');

const PHONE_REGEX = /^(0[3-9][0-9]{8,9}|\+84[3-9][0-9]{8,9})$/;

/**
 * Keep only the given keys that are actually present (ValidationPipe whitelist).
 * @param {object} source
 * @param {string[]} keys
 * @returns {object}
 */
function pick(source, keys) {
  const out = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

function throwIfErrors(errors) {
  if (errors.length > 0) {
    throw HttpError.badRequest(errors);
  }
}

/** @see RegisterDto */
function validateRegister(body = {}) {
  const errors = [];

  if (!isEmail(body.email)) errors.push('Email không hợp lệ');
  if (!isNotEmpty(body.email)) errors.push('Email không được để trống');

  if (!isNotEmpty(body.password)) errors.push('Mật khẩu không được để trống');
  if (!minLength(body.password, 6))
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');

  if (!isNotEmpty(body.name)) errors.push('Họ tên không được để trống');

  if (!isEnum(body.role, ['candidate', 'employer']))
    errors.push('Vai trò không hợp lệ');

  throwIfErrors(errors);

  return pick(body, [
    'email',
    'password',
    'confirmPassword',
    'name',
    'role',
    'phone',
    'companyName',
    'companyWebsite',
    'industry',
  ]);
}

/** @see LoginDto */
function validateLogin(body = {}) {
  const errors = [];

  if (!isEmail(body.email)) errors.push('Email không hợp lệ');
  if (!isNotEmpty(body.email)) errors.push('Email không được để trống');
  if (!isNotEmpty(body.password)) errors.push('Mật khẩu không được để trống');

  throwIfErrors(errors);

  return pick(body, ['email', 'password']);
}

/** @see UpdateProfileDto */
function validateUpdateProfile(body = {}) {
  const errors = [];

  if (!isOptional(body.email) && !isEmail(body.email))
    errors.push('Email không hợp lệ');

  if (!isOptional(body.phone) && !matches(body.phone, PHONE_REGEX))
    errors.push(
      'Số điện thoại không đúng định dạng (VD: 0901234567 hoặc +84901234567)',
    );

  if (!isOptional(body.companyName) && !isNotEmpty(body.companyName))
    errors.push('Tên công ty không được để trống');

  if (!isOptional(body.companyWebsite) && !isUrl(body.companyWebsite))
    errors.push('Website không đúng định dạng URL');

  throwIfErrors(errors);

  return pick(body, [
    'email',
    'phone',
    'companyName',
    'companyWebsite',
    'avatar',
    'industry',
    'description',
  ]);
}

/** @see ForgotPasswordDto */
function validateForgotPassword(body = {}) {
  const errors = [];

  if (!isEmail(body.email)) errors.push('Email không hợp lệ');
  if (!isNotEmpty(body.email)) errors.push('Email không được để trống');

  throwIfErrors(errors);

  return pick(body, ['email']);
}

/** @see ResetPasswordDto */
function validateResetPassword(body = {}) {
  const errors = [];

  if (!isNotEmpty(body.token)) errors.push('Token không được để trống');

  if (!isNotEmpty(body.password))
    errors.push('Mật khẩu mới không được để trống');
  if (!minLength(body.password, 6))
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');

  throwIfErrors(errors);

  return pick(body, ['token', 'password']);
}

/** @see ChangePasswordDto */
function validateChangePassword(body = {}) {
  const errors = [];

  if (!isNotEmpty(body.currentPassword))
    errors.push('Mật khẩu hiện tại không được để trống');

  if (!isNotEmpty(body.newPassword))
    errors.push('Mật khẩu mới không được để trống');
  if (!minLength(body.newPassword, 6))
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');

  throwIfErrors(errors);

  return pick(body, ['currentPassword', 'newPassword']);
}

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
};
