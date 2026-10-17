/**
 * Serialisation helpers — keep the JSON payload byte-compatible with the old
 * Mongoose documents.
 *
 * Why this exists:
 *   The frontend still reads `_id` in several functional places
 *   (e.g. `jobService.js` does `id: j._id`, `AppliedTab.jsx` renders
 *   `job._id`). Prisma rows expose `id`, so every row leaving the API is
 *   converted back into a document that carries BOTH `_id` and `id`, plus the
 *   Mongoose extras (`__v`) so nothing downstream can tell the difference.
 *
 * Dates need no conversion: JSON.stringify(Date) already yields the same ISO
 * string Mongoose produced. `Bytes` columns come back as Buffers, which
 * serialise exactly like Mongoose Buffers.
 */

/**
 * Convert a Prisma row into a Mongoose-looking document.
 * The conversion is SHALLOW on purpose: nested `Json` columns must be passed
 * through untouched (they never had `_id` in MongoDB).
 *
 * @template T
 * @param {T} row
 * @returns {T}
 */
function toDoc(row) {
  if (row === null || row === undefined) return row;
  if (Array.isArray(row)) return row.map((r) => toDoc(r));

  const { id, ...rest } = row;
  return { _id: id, id, ...rest, __v: 0 };
}

/**
 * @param {Array} rows
 * @returns {Array}
 */
function toDocs(rows) {
  if (!rows) return rows;
  return rows.map((r) => toDoc(r));
}

/**
 * Same as `toDoc`, but first moves a Prisma relation object onto the field
 * name Mongoose's `populate()` used to produce.
 *
 * Example — old code did `.populate('employerId', 'name email')`, which turned
 * the `employerId` scalar into an embedded document. With Prisma we fetch it as
 * `include: { employer: {...} }`, then:
 *
 *   toPopulatedDoc(row, { employer: 'employerId' })
 *
 * @param {object} row
 * @param {Record<string, string>} mapping `{ relationField: mongoField }`
 * @returns {object}
 */
function toPopulatedDoc(row, mapping = {}) {
  if (row === null || row === undefined) return row;

  const out = { ...row };
  for (const [from, to] of Object.entries(mapping)) {
    if (out[from] !== undefined && out[from] !== null) {
      out[to] = toDoc(out[from]);
    }
    delete out[from];
  }
  return toDoc(out);
}

/**
 * @param {Array} rows
 * @param {Record<string, string>} mapping
 * @returns {Array}
 */
function toPopulatedDocs(rows, mapping = {}) {
  if (!rows) return rows;
  return rows.map((r) => toPopulatedDoc(r, mapping));
}

/**
 * Prepare a plain object for a Prisma `Json` column.
 * MongoDB's `type: Object` accepted anything; Prisma's JSON serialiser rejects
 * `undefined`, so normalise through JSON (which also turns Dates into the same
 * ISO strings Mongo would have produced).
 * @param {*} value
 * @returns {*}
 */
function normalizeJson(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

/**
 * `contains` search helper: Prisma needs `mode: 'insensitive'` explicitly to
 * match MongoDB's `$options: 'i'` regex behaviour.
 * @param {*} value
 * @returns {{ contains: string, mode: 'insensitive' }|undefined}
 */
function contains(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return { contains: String(value), mode: 'insensitive' };
}

/**
 * Pagination helper — turns the raw Express query strings into Prisma
 * `skip`/`take`, preserving the old numeric coercion.
 * @param {object} params
 * @param {number} [defaultLimit]
 * @returns {{ page: *, limit: *, skip: number, take: number }}
 */
function pagination(params = {}, defaultLimit = 20) {
  const page = params.page || 1;
  const limit = params.limit || defaultLimit;
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}

module.exports = {
  toDoc,
  toDocs,
  toPopulatedDoc,
  toPopulatedDocs,
  contains,
  normalizeJson,
  pagination,
};
