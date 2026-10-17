/**
 * Small validation primitives — plain-JS equivalents of the class-validator
 * decorators used in the old DTOs (files under backend/src/auth/dto, etc.).
 *
 * Each helper returns a boolean; callers collect the matching error message
 * so the API can return the same `{ statusCode, message: [...], error }`
 * payload that Nest's ValidationPipe produced.
 */

/**
 * Equivalent of @IsNotEmpty(): value must not be '', null or undefined.
 * @param {*} value
 * @returns {boolean}
 */
function isNotEmpty(value) {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Equivalent of @IsEmail() (pragmatic subset of validator.js isEmail).
 * @param {*} value
 * @returns {boolean}
 */
function isEmail(value) {
  if (typeof value !== 'string') return false;
  // simple but strict-enough check: local@domain.tld with no whitespace
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Equivalent of @MinLength(n).
 * @param {*} value
 * @param {number} n
 * @returns {boolean}
 */
function minLength(value, n) {
  return typeof value === 'string' && value.length >= n;
}

/**
 * Equivalent of @IsEnum([...]).
 * @param {*} value
 * @param {ReadonlyArray<*>} allowed
 * @returns {boolean}
 */
function isEnum(value, allowed) {
  return allowed.includes(value);
}

/**
 * Equivalent of @Matches(regex).
 * @param {*} value
 * @param {RegExp} regex
 * @returns {boolean}
 */
function matches(value, regex) {
  return typeof value === 'string' && regex.test(value);
}

/**
 * Equivalent of @IsUrl({ protocols, require_protocol:false }).
 * @param {*} value
 * @param {string[]} [protocols]
 * @returns {boolean}
 */
function isUrl(value, protocols = ['http', 'https']) {
  if (typeof value !== 'string' || value.length === 0) return false;

  let url;
  try {
    url = new URL(value);
  } catch {
    // require_protocol: false → allow values without a scheme
    try {
      url = new URL(`http://${value}`);
    } catch {
      return false;
    }
  }

  const proto = url.protocol.replace(':', '');
  if (protocols.length && !protocols.includes(proto)) return false;
  if (!url.hostname) return false;
  // require_tld: true → hostname must have a dot (localhost excepted)
  if (url.hostname !== 'localhost' && !url.hostname.includes('.')) return false;

  return true;
}

/**
 * Equivalent of @IsOptional(): skip validation when value is undefined/null.
 * @param {*} value
 * @returns {boolean}
 */
function isOptional(value) {
  return value === undefined || value === null;
}

/**
 * Equivalent of @IsString().
 * @param {*} value
 * @returns {boolean}
 */
function isString(value) {
  return typeof value === 'string';
}

/**
 * Equivalent of @IsNumber() (class-validator accepts only real numbers).
 * @param {*} value
 * @returns {boolean}
 */
function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Equivalent of @Min(n) for numbers.
 * @param {*} value
 * @param {number} n
 * @returns {boolean}
 */
function minNumber(value, n) {
  return typeof value === 'number' && value >= n;
}

/**
 * Equivalent of @IsArray().
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
  return Array.isArray(value);
}

/**
 * Equivalent of @IsArray() + @IsString({ each: true }).
 * @param {*} value
 * @returns {boolean}
 */
function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * Equivalent of @IsDateString() (ISO 8601).
 * @param {*} value
 * @returns {boolean}
 */
function isDateString(value) {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(
    value,
  );
}

// Primary keys used by this API: legacy MongoDB ObjectIds (24 hex chars) and
// the cuid strings Prisma now generates (`c` + 24 base36 chars).
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const CUID_RE = /^c[a-z0-9]{24}$/;

/**
 * Equivalent of @IsMongoId() — relaxed for the Postgres/Prisma migration.
 *
 * The NestJS DTOs validated 24-hex ObjectIds. After the migration primary keys
 * are cuid strings, so both shapes are accepted: ids issued by this API always
 * validate, and any legacy ObjectId-shaped value still passes.
 * @param {*} value
 * @returns {boolean}
 */
function isMongoId(value) {
  return (
    typeof value === 'string' &&
    (OBJECT_ID_RE.test(value) || CUID_RE.test(value))
  );
}

module.exports = {
  isNotEmpty,
  isEmail,
  minLength,
  isEnum,
  matches,
  isUrl,
  isOptional,
  isString,
  isNumber,
  minNumber,
  isArray,
  isStringArray,
  isDateString,
  isMongoId,
};
