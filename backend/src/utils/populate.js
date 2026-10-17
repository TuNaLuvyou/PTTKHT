/**
 * `populate()` emulation.
 *
 * MongoDB let references dangle: `.populate('jobId')` on an Application whose
 * Job had been deleted simply produced `{ jobId: null }`. The Prisma schema
 * stores those refs as plain strings (no foreign keys, see prisma/schema.prisma),
 * so the equivalent join is done here by hand.
 *
 * The result is byte-identical to what Mongoose produced: the ref field is
 * replaced by the full referenced document (Mongoose-shaped, with `_id`), or
 * `null` when the target row no longer exists.
 */
const { toDoc } = require('./serialize');

/**
 * Replace a scalar ref field with the referenced document.
 *
 * @param {object|object[]} rows one row or an array of rows
 * @param {object} options
 * @param {string} options.refField  field holding the reference (e.g. 'jobId')
 * @param {(ids: string[]) => Promise<object[]>} options.fetchByIds loader for the refs
 * @param {string} [options.as]      field to write to (defaults to `refField`)
 * @param {string} [options.select]  unused placeholder (kept for call-site clarity)
 * @returns {Promise<object|object[]>}
 */
async function populateRef(rows, { refField, fetchByIds, as }) {
  const isArray = Array.isArray(rows);
  // `toDoc` turns each row into a Mongoose-shaped document (`_id`, `id`,
  // `__v`) — Mongoose documents always carried `_id`, and call sites rely on it.
  const list = (isArray ? rows : [rows]).map((r) => toDoc({ ...r }));

  const ids = [
    ...new Set(
      list
        .map((r) => r[refField])
        .filter((v) => v !== null && v !== undefined)
        .map(String),
    ),
  ];

  const docs = ids.length > 0 ? await fetchByIds(ids) : [];
  const byId = new Map(docs.map((d) => [String(d.id), d]));
  const target = as || refField;

  for (const row of list) {
    const key =
      row[refField] === null || row[refField] === undefined
        ? null
        : String(row[refField]);
    const found = key ? byId.get(key) : null;
    row[target] = found ? toDoc(found) : null;
  }

  return isArray ? list : list[0];
}

/**
 * Resolve a list of ids into documents, keeping the ORIGINAL id order and
 * silently dropping ids whose row is gone — exactly what Mongoose's populate
 * did for an array of refs.
 *
 * @param {string[]} ids
 * @param {(ids: string[]) => Promise<object[]>} fetchByIds
 * @returns {Promise<object[]>}
 */
async function populateRefList(ids, fetchByIds) {
  const clean = (ids || []).filter((v) => v !== null && v !== undefined).map(String);
  if (clean.length === 0) return [];

  const docs = await fetchByIds([...new Set(clean)]);
  const byId = new Map(docs.map((d) => [String(d.id), d]));

  const out = [];
  for (const id of clean) {
    const found = byId.get(id);
    if (found) out.push(toDoc(found));
  }
  return out;
}

module.exports = { populateRef, populateRefList };
