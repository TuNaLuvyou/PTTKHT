/**
 * Admin request validators — plain-JS equivalents of
 * backend/src/admin/dto/admin.dto.ts (UpdateUserStatusDto, UpdateJobStatusDto,
 * ToggleJobFeaturedDto, CreateNotificationDto).
 *
 * Throws HttpError.badRequest([...]) on failure so the response matches Nest's
 * ValidationPipe: { statusCode: 400, message: [...], error: 'Bad Request' }.
 *
 * Message ORDER and texts were verified against the real class-validator +
 * class-transformer pipeline (plainToInstance + validate with whitelist:true).
 * Note: class-validator applies decorators bottom-up, so a property declared as
 *   @IsEnum(...)        // source order
 *   @IsNotEmpty(...)
 * emits ["isNotEmpty message", "isEnum message"].
 */
const { HttpError } = require('../utils/httpError');
const {
  isNotEmpty,
  isEnum,
  isOptional,
  isString,
  minLength,
} = require('../utils/validation');

const USER_STATUSES = ['active', 'banned', 'pending', 'inactive'];
const JOB_STATUSES = ['active', 'pending', 'closed', 'rejected', 'draft'];
const NOTIFICATION_TYPES = ['info', 'success', 'warning'];

const MSG = {
  userStatusNotEmpty: 'Trạng thái không được để trống',
  userStatusEnum: 'Trạng thái người dùng không hợp lệ',
  userReasonString: 'Lý do phải là chuỗi ký tự',

  jobStatusNotEmpty: 'Trạng thái không được để trống',
  jobStatusEnum: 'Trạng thái công việc không hợp lệ',

  featuredBoolean: 'Giá trị featured phải là true hoặc false',

  notifUserId: 'UserId không hợp lệ',
  notifTitle: 'Tiêu đề thông báo không được để trống',
  notifMessage: 'Nội dung thông báo không được để trống',
  notifType: 'Loại thông báo không hợp lệ',
  notifJobId: 'jobId không hợp lệ',
};

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
  if (errors.length > 0) throw HttpError.badRequest(errors);
}

/** @see UpdateUserStatusDto */
function validateUpdateUserStatus(body = {}) {
  const errors = [];

  // status: @IsEnum then @IsNotEmpty  →  [notEmpty, enum]
  if (!isNotEmpty(body.status)) errors.push(MSG.userStatusNotEmpty);
  if (!isEnum(body.status, USER_STATUSES)) errors.push(MSG.userStatusEnum);

  // reason?: @IsOptional + @IsString
  if (!isOptional(body.reason) && !isString(body.reason))
    errors.push(MSG.userReasonString);

  throwIfErrors(errors);

  return pick(body, ['status', 'reason']);
}

/** @see UpdateJobStatusDto */
function validateUpdateJobStatus(body = {}) {
  const errors = [];

  if (!isNotEmpty(body.status)) errors.push(MSG.jobStatusNotEmpty);
  if (!isEnum(body.status, JOB_STATUSES)) errors.push(MSG.jobStatusEnum);

  throwIfErrors(errors);

  return pick(body, ['status']);
}

/**
 * @see ToggleJobFeaturedDto
 *
 * Faithful to `@Type(() => Boolean) + @IsBoolean()`: class-transformer only
 * coerces when the value is present and not null, so `"false"` becomes `true`
 * and `0` becomes `false`, while a missing/null value fails validation.
 */
function validateToggleJobFeatured(body = {}) {
  const raw = body.featured;

  if (raw === undefined || raw === null) {
    throw HttpError.badRequest([MSG.featuredBoolean]);
  }

  return { featured: Boolean(raw) };
}

/** @see CreateNotificationDto */
function validateCreateNotification(body = {}) {
  const errors = [];

  // userId?: @IsOptional + @IsString
  if (!isOptional(body.userId) && !isString(body.userId))
    errors.push(MSG.notifUserId);

  // title: @IsNotEmpty then @MinLength(1) → [minLength, notEmpty]
  if (!minLength(body.title, 1)) errors.push(MSG.notifTitle);
  if (!isNotEmpty(body.title)) errors.push(MSG.notifTitle);

  // message: @IsNotEmpty then @MinLength(1) → [minLength, notEmpty]
  if (!minLength(body.message, 1)) errors.push(MSG.notifMessage);
  if (!isNotEmpty(body.message)) errors.push(MSG.notifMessage);

  // type?: @IsOptional + @IsEnum
  if (!isOptional(body.type) && !isEnum(body.type, NOTIFICATION_TYPES))
    errors.push(MSG.notifType);

  // jobId?: @IsOptional + @IsString
  if (!isOptional(body.jobId) && !isString(body.jobId))
    errors.push(MSG.notifJobId);

  throwIfErrors(errors);

  return pick(body, ['userId', 'title', 'message', 'type', 'jobId']);
}

module.exports = {
  validateUpdateUserStatus,
  validateUpdateJobStatus,
  validateToggleJobFeatured,
  validateCreateNotification,
};
