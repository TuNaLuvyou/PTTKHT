/**
 * UserService — Prisma/PostgreSQL port of backend/src/users/users.service.ts.
 *
 * Returns Mongoose-looking documents (see src/utils/serialize.js) so every
 * existing call site keeps working unchanged: `user._id`, `user.role`, ...
 */
const { prisma } = require('../config/prisma');
const { toDoc } = require('../utils/serialize');

// Every column of the `users` table — used to strip unknown/undefined keys
// before handing the payload to Prisma.
const USER_FIELDS = [
  'email',
  'password',
  'name',
  'role',
  'status',
  'avatar',
  'phone',
  'location',
  'title',
  'bio',
  'skills',
  'savedJobs',
  'companyName',
  'companyWebsite',
  'industry',
  'resetPasswordToken',
  'resetPasswordExpires',
  'emailVerified',
  'verified',
  'businessDocuments',
  'cvBuilderData',
];

/**
 * Keep only known fields that are actually present.
 * Mirrors Mongoose's behaviour: `undefined` values are ignored (which is also
 * what preserved the old "resetPasswordToken stays usable" quirk).
 * @param {object} data
 * @returns {object}
 */
function sanitize(data = {}) {
  const out = {};
  for (const key of USER_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
}

/**
 * Create a new user.
 * @param {object} userData
 * @returns {Promise<object>}
 */
async function create(userData) {
  const row = await prisma.user.create({ data: sanitize(userData) });
  return toDoc(row);
}

/**
 * Find a user by email.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findByEmail(email) {
  const row = await prisma.user.findUnique({ where: { email } });
  return toDoc(row);
}

/**
 * Find a user by id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  if (!id) return null;
  const row = await prisma.user.findUnique({ where: { id: String(id) } });
  return toDoc(row);
}

/**
 * Update a user by id and return the updated document.
 * Returns null when the user does not exist (the old findByIdAndUpdate did).
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object|null>}
 */
async function update(id, updateData) {
  try {
    const row = await prisma.user.update({
      where: { id: String(id) },
      data: sanitize(updateData),
    });
    return toDoc(row);
  } catch (err) {
    if (err.code === 'P2025') return null; // record not found
    throw err;
  }
}

module.exports = {
  create,
  findByEmail,
  findById,
  update,
};
