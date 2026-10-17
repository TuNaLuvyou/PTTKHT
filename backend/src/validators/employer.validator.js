/**
 * Employer request validators — plain-JS equivalents of
 * backend/src/employer/dto/employer.dto.ts.
 */
const { HttpError } = require('../utils/httpError');
const { isEnum, isNotEmpty, isArray, isMongoId } = require('../utils/validation');

const APPLICATION_STATUSES = [
  'pending',
  'reviewing',
  'interview',
  'offered',
  'rejected',
];

/** @see UpdateApplicationStatusDto */
function validateUpdateApplicationStatus(body = {}) {
  const errors = [];

  if (!isEnum(body.status, APPLICATION_STATUSES)) {
    errors.push('Trạng thái không hợp lệ');
  }
  if (!isNotEmpty(body.status)) {
    errors.push('Trạng thái không được để trống');
  }

  if (errors.length) throw HttpError.badRequest(errors);

  return { status: body.status };
}

/** @see BulkDeleteApplicationsDto */
function validateBulkDeleteApplications(body = {}) {
  const errors = [];

  if (!isArray(body.ids)) {
    errors.push('Danh sách ID không hợp lệ');
  } else if (!body.ids.every((id) => isMongoId(id))) {
    errors.push('ID không đúng định dạng');
  }

  if (errors.length) throw HttpError.badRequest(errors);

  return { ids: body.ids };
}

module.exports = {
  validateUpdateApplicationStatus,
  validateBulkDeleteApplications,
};
