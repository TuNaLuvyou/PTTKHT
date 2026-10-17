/**
 * Job request validators — plain-JS equivalents of
 * backend/src/jobs/dto/job.dto.ts (CreateJobDto / UpdateJobDto).
 *
 * Throws HttpError.badRequest([...]) on failure so the response matches Nest's
 * ValidationPipe: { statusCode: 400, message: [...], error: 'Bad Request' }.
 */
const { HttpError } = require('../utils/httpError');
const {
  isNotEmpty,
  minLength,
  isOptional,
  isString,
  isNumber,
  minNumber,
  isStringArray,
  isDateString,
} = require('../utils/validation');

const MESSAGES = {
  titleRequired: 'Tiêu đề công việc không được để trống',
  titleMin: 'Tiêu đề phải có ít nhất 3 ký tự',
  companyRequired: 'Tên công ty không được để trống',
  locationRequired: 'Địa điểm không được để trống',
  categoryRequired: 'Danh mục không được để trống',
  typeRequired: 'Loại công việc không được để trống',
  levelRequired: 'Cấp bậc không được để trống',
  descriptionRequired: 'Mô tả công việc không được để trống',
  descriptionMin: 'Mô tả phải có ít nhất 10 ký tự',
};

// class-validator default (English) messages for the typed/optional fields
const DEFAULT_MSG = {
  isString: (prop) => `${prop} must be a string`,
  isNumber: (prop) =>
    `${prop} must be a number conforming to the specified constraints`,
  min: (prop) => `${prop} must not be less than 0`,
  isArray: (prop) => `${prop} must be an array`,
  eachString: (prop) => `each value in ${prop} must be a string`,
  isDateString: (prop) => `${prop} must be a valid ISO 8601 date string`,
};

const FIELDS = [
  'title',
  'companyName',
  'location',
  'category',
  'type',
  'level',
  'description',
  'companyLogo',
  'salary',
  'salaryMin',
  'salaryMax',
  'tags',
  'requirements',
  'benefits',
  'deadline',
  'status',
];

function pick(source, keys) {
  const out = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

/**
 * Shared body of CreateJobDto / UpdateJobDto.
 * @param {object} body
 * @param {boolean} isUpdate when true every field is optional
 * @returns {string[]} list of error messages
 */
function collectErrors(body, isUpdate) {
  const errors = [];

  // ── Required-style fields (always "not empty" when present; required for create)
  const notEmptyField = (key, message) => {
    const value = body[key];
    if (isUpdate && isOptional(value)) return;
    if (!isNotEmpty(value)) errors.push(message);
  };
  const minLenField = (key, len, message) => {
    const value = body[key];
    if (isUpdate && isOptional(value)) return;
    if (!minLength(value, len)) errors.push(message);
  };

  // NOTE: message order mirrors class-validator exactly (decorators run
  // bottom-up, so @MinLength's message is emitted BEFORE @IsNotEmpty's).
  minLenField('title', 3, MESSAGES.titleMin);
  notEmptyField('title', MESSAGES.titleRequired);
  notEmptyField('companyName', MESSAGES.companyRequired);
  notEmptyField('location', MESSAGES.locationRequired);
  notEmptyField('category', MESSAGES.categoryRequired);
  notEmptyField('type', MESSAGES.typeRequired);
  notEmptyField('level', MESSAGES.levelRequired);
  minLenField('description', 10, MESSAGES.descriptionMin);
  notEmptyField('description', MESSAGES.descriptionRequired);

  // ── Optional typed fields
  const optString = (key) => {
    if (!isOptional(body[key])) {
      if (!isString(body[key])) errors.push(DEFAULT_MSG.isString(key));
    }
  };
  const optNumber = (key) => {
    if (!isOptional(body[key])) {
      const value = body[key];
      if (!isNumber(value)) {
        // @IsNumber then @Min(0): both fail for a non-number, and class-validator
        // emits @Min's message first (decorators run bottom-up).
        errors.push(DEFAULT_MSG.min(key));
        errors.push(DEFAULT_MSG.isNumber(key));
      } else if (!minNumber(value, 0)) {
        errors.push(DEFAULT_MSG.min(key));
      }
    }
  };
  const optStringArray = (key) => {
    if (!isOptional(body[key])) {
      if (!isStringArray(body[key])) {
        // @IsArray then @IsString({each:true})
        if (!Array.isArray(body[key])) errors.push(DEFAULT_MSG.isArray(key));
        else errors.push(DEFAULT_MSG.eachString(key));
      }
    }
  };
  const optDate = (key) => {
    if (!isOptional(body[key])) {
      if (!isDateString(body[key])) errors.push(DEFAULT_MSG.isDateString(key));
    }
  };

  optString('companyLogo');
  optString('salary');
  optNumber('salaryMin');
  optNumber('salaryMax');
  optStringArray('tags');
  optStringArray('requirements');
  optStringArray('benefits');
  optDate('deadline');
  optString('status');

  return errors;
}

/** @see CreateJobDto */
function validateCreateJob(body = {}) {
  const errors = collectErrors(body, false);
  if (errors.length) throw HttpError.badRequest(errors);
  return pick(body, FIELDS);
}

/** @see UpdateJobDto */
function validateUpdateJob(body = {}) {
  const errors = collectErrors(body, true);
  if (errors.length) throw HttpError.badRequest(errors);
  return pick(body, FIELDS);
}

module.exports = { validateCreateJob, validateUpdateJob };
