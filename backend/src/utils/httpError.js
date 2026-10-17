/**
 * HttpError — a tiny equivalent of NestJS's `HttpException`, so that services
 * and controllers can throw errors that the global error handler serialises
 * into the exact NestJS response format:
 *
 *   { "statusCode": 400, "message": "...", "error": "Bad Request" }
 *
 * `message` may also be an array (like Nest's ValidationPipe does), e.g.:
 *   { "statusCode": 400, "message": ["email must be an email"], "error": "Bad Request" }
 */

const ERROR_NAMES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

/**
 * Resolve the human-readable "error" label for a status code.
 * @param {number} statusCode
 * @returns {string}
 */
function getErrorName(statusCode) {
  return ERROR_NAMES[statusCode] || 'Error';
}

class HttpError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string|string[]} [message] message (string or array, like Nest)
   * @param {string} [error] optional explicit error label
   */
  constructor(statusCode, message, error) {
    const normalized =
      message === undefined || message === null
        ? getErrorName(statusCode)
        : message;
    const printable = Array.isArray(normalized)
      ? normalized.join(', ')
      : String(normalized);

    super(printable);

    this.name = 'HttpError';
    this.statusCode = statusCode;
    // Keep the original value so arrays survive serialisation (Nest-compatible)
    this.message = normalized;
    this.error = error || getErrorName(statusCode);
    this.isHttpError = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  // ─── Convenience factories (mirror Nest's exception classes) ──────
  static badRequest(message) {
    return new HttpError(400, message);
  }
  static unauthorized(message) {
    return new HttpError(401, message);
  }
  static forbidden(message) {
    return new HttpError(403, message);
  }
  static notFound(message) {
    return new HttpError(404, message);
  }
  static conflict(message) {
    return new HttpError(409, message);
  }
  static unprocessable(message) {
    return new HttpError(422, message);
  }
  static tooManyRequests(message) {
    return new HttpError(429, message);
  }
  static internal(message) {
    return new HttpError(500, message);
  }
}

module.exports = { HttpError, getErrorName, ERROR_NAMES };
