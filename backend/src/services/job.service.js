/**
 * JobService — Prisma/PostgreSQL port of backend/src/jobs/jobs.service.ts
 *
 * Behaviour preserved 1:1 (filters, lenient keyword search, pagination,
 * settings enforcement, applications, saved jobs, seed).
 *
 * NOTE on the keyword search: the old code built a MongoDB regex that matched
 * BOTH the accented and the unaccented form of the term, and applied it to
 * scalar fields AND to array fields (`tags`, `requirements`, `benefits`).
 * Prisma's typed API cannot express a substring match inside a `String[]`
 * column, so `findAll` uses parameterised raw SQL with `ILIKE` — same
 * semantics, no injection risk (all values are bound parameters).
 */
const { Prisma } = require('@prisma/client');

const { prisma } = require('../config/prisma');
const { toDoc, toDocs } = require('../utils/serialize');
const { populateRef, populateRefList } = require('../utils/populate');

const notificationsGateway = require('../sockets/notifications.gateway');
const { SEED_JOBS } = require('../utils/jobsSeedData');
const { HttpError } = require('../utils/httpError');
const { AppLogger } = require('../utils/logger');

const logger = AppLogger.forContext('JobService');

// ─── Settings from DB (defaults mirror the old private helpers) ────────

async function getAiSettings() {
  const defaults = { maxFileSizeMB: 10, supportedFormats: ['pdf', 'doc', 'docx'] };
  try {
    const doc = await prisma.settings.findUnique({ where: { key: 'global' } });
    if (!doc) return defaults;
    return { ...defaults, ...(doc.ai || {}) };
  } catch {
    return defaults;
  }
}

async function getJobsSettings() {
  const defaults = { requireApproval: true, maxJobsPerEmployer: 20, jobExpiryDays: 90 };
  try {
    const doc = await prisma.settings.findUnique({ where: { key: 'global' } });
    if (!doc) return defaults;
    return { ...defaults, ...(doc.jobs || {}) };
  } catch {
    return defaults;
  }
}

async function getUsersSettings() {
  const defaults = { employerVerificationRequired: true, maxSavedJobs: 50 };
  try {
    const doc = await prisma.settings.findUnique({ where: { key: 'global' } });
    if (!doc) return defaults;
    return { ...defaults, ...(doc.users || {}) };
  } catch {
    return defaults;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * MongoDB `$regex: 'accented|unaccented', $options: 'i'` → two ILIKE patterns.
 * @param {string} val
 * @returns {{ original: string, unaccented: string }}
 */
function lenientPatterns(val) {
  const unaccented = String(val)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'va');
  return { original: `%${val}%`, unaccented: `%${unaccented}%` };
}

/**
 * `field ILIKE a OR field ILIKE b` for a scalar (text) column.
 * @param {string} field hardcoded column name
 * @param {{original: string, unaccented: string}} p
 */
function ilikeScalar(field, p) {
  const col = Prisma.raw(`"${field}"`);
  return Prisma.sql`(${col} ILIKE ${p.original} OR ${col} ILIKE ${p.unaccented})`;
}

/**
 * Same, but for a `text[]` column (matches if ANY element contains the term,
 * like a MongoDB regex applied to an array field).
 * @param {string} field hardcoded column name
 * @param {{original: string, unaccented: string}} p
 */
function ilikeArray(field, p) {
  const col = Prisma.raw(`array_to_string("${field}", ' ')`);
  return Prisma.sql`(${col} ILIKE ${p.original} OR ${col} ILIKE ${p.unaccented})`;
}

/**
 * Convert the ISO string coming from the DTO into a Date (Mongoose used to
 * cast this automatically).
 * @param {*} value
 * @returns {*}
 */
function castDeadline(value) {
  if (value === undefined || value === null || value instanceof Date) return value;
  return new Date(value);
}

/** Fields of the `jobs` table that a request may write. */
const JOB_WRITE_FIELDS = [
  'title',
  'companyName',
  'companyLogo',
  'location',
  'salary',
  'salaryMin',
  'salaryMax',
  'category',
  'type',
  'level',
  'tags',
  'description',
  'requirements',
  'benefits',
  'deadline',
  'status',
  'featured',
];

/**
 * Keep only writable fields that are present (Mongoose silently ignored
 * unknown keys; Prisma would throw).
 * @param {object} data
 * @returns {object}
 */
function sanitizeJobData(data = {}) {
  const out = {};
  for (const key of JOB_WRITE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  if (out.deadline !== undefined) out.deadline = castDeadline(out.deadline);
  return out;
}

// ─── Queries ──────────────────────────────────────────────────────────

async function findAll(query = {}) {
  const jobsSettings = await getJobsSettings();
  const { keyword, location, category, level, type, page = 1, limit = 20 } = query;

  // Exclude expired jobs based on jobExpiryDays (by createdAt — original quirk)
  const expiryDate = new Date(
    Date.now() - jobsSettings.jobExpiryDays * 24 * 60 * 60 * 1000,
  );

  const conditions = [
    Prisma.sql`"status" = 'active'`,
    Prisma.sql`"createdAt" >= ${expiryDate}`,
  ];

  if (keyword) {
    const p = lenientPatterns(keyword);
    const parts = [
      ...['title', 'companyName', 'description', 'category', 'location', 'level', 'type'].map(
        (f) => ilikeScalar(f, p),
      ),
      ...['tags', 'requirements', 'benefits'].map((f) => ilikeArray(f, p)),
    ];
    conditions.push(Prisma.sql`(${Prisma.join(parts, ' OR ')})`);
  }

  if (category) conditions.push(ilikeScalar('category', lenientPatterns(category)));
  if (location) conditions.push(ilikeScalar('location', lenientPatterns(location)));
  if (level) conditions.push(Prisma.sql`"level" = ${level}`);
  if (type) conditions.push(ilikeScalar('type', lenientPatterns(type)));

  const where = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
  const skip = (page - 1) * limit;
  const take = Number(limit);

  const data = await prisma.$queryRaw`
    SELECT * FROM "jobs"
    ${where}
    ORDER BY "featured" DESC, "createdAt" DESC
    LIMIT ${take} OFFSET ${skip}
  `;

  const counted = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count FROM "jobs" ${where}
  `;

  return {
    data: toDocs(data),
    total: counted.length > 0 ? counted[0].count : 0,
    page: Number(page),
    limit: Number(limit),
  };
}

async function findOne(id) {
  const job = await prisma.job.findUnique({ where: { id: String(id) } });
  if (!job) {
    throw new HttpError(404, 'Không tìm thấy công việc');
  }

  // Check if job is expired
  const jobsSettings = await getJobsSettings();
  const expiryDate = new Date(
    Date.now() - jobsSettings.jobExpiryDays * 24 * 60 * 60 * 1000,
  );
  if (job.createdAt < expiryDate) {
    throw new HttpError(404, 'Tin tuyển dụng đã hết hạn');
  }

  // Increment views
  const updated = await prisma.job.update({
    where: { id: String(id) },
    data: { views: { increment: 1 } },
  });

  // Emit realtime update for admin
  try {
    notificationsGateway.emitJobViewsUpdated(id, updated.views);
  } catch (e) {
    logger.warn('Failed to emit job views update via WebSocket', e);
  }

  return toDoc(updated);
}

async function create(jobData, employerId) {
  const jobsSettings = await getJobsSettings();
  const usersSettings = await getUsersSettings();

  // Enforce employerVerificationRequired
  if (usersSettings.employerVerificationRequired) {
    const employer = await prisma.user.findUnique({
      where: { id: String(employerId) },
    });
    if (employer && !employer.verified) {
      throw new HttpError(
        400,
        'Tài khoản của bạn chưa được xác minh. Vui lòng hoàn tất xác minh pháp nhân trước khi đăng tin tuyển dụng.',
      );
    }
  }

  // Enforce maxJobsPerEmployer
  const activeJobCount = await prisma.job.count({
    where: {
      employerId: String(employerId),
      status: { in: ['active', 'pending'] },
    },
  });
  if (activeJobCount >= jobsSettings.maxJobsPerEmployer) {
    throw new HttpError(
      400,
      `Bạn đã đạt giới hạn ${jobsSettings.maxJobsPerEmployer} tin tuyển dụng. Vui lòng xóa bớt tin cũ trước khi đăng tin mới.`,
    );
  }

  const data = { ...sanitizeJobData(jobData), employerId: String(employerId) };

  // Enforce requireApproval — `status` defaults to 'active' when absent, just
  // like the Mongoose schema default applied at document instantiation.
  let status = data.status !== undefined ? data.status : 'active';
  if (jobsSettings.requireApproval) {
    if (status !== 'draft') {
      status = 'pending';
    }
  } else {
    if (!status || status === 'pending') {
      status = 'active';
    }
  }
  data.status = status;

  const saved = await prisma.job.create({ data });
  logger.success('Tạo tin tuyển dụng mới', {
    userId: employerId,
    action: 'create_job',
    jobId: saved.id,
    title: jobData.title,
  });

  // Tạo thông báo cho admin nếu tin cần duyệt
  if (saved.status === 'pending' || saved.status === 'draft') {
    try {
      const notif = await prisma.notification.create({
        data: {
          title: 'Tin tuyển dụng mới chờ duyệt',
          message: `Nhà tuyển dụng vừa đăng tin "${saved.title}" — trạng thái: ${saved.status === 'pending' ? 'chờ duyệt' : 'bản nháp'}. Vui lòng kiểm tra và phê duyệt.`,
          type: 'info',
          jobId: String(saved.id),
        },
      });
      logger.log('Đã tạo thông báo cho admin về tin mới', {
        action: 'notify_admin_new_job',
        jobId: saved.id,
      });
      notificationsGateway.emitNotificationCreated({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        time: 'Vừa xong',
        unread: true,
        jobId: notif.jobId,
      });
    } catch (notifErr) {
      logger.error('Không thể tạo thông báo admin', notifErr);
    }
  }

  // Emit realtime update for admin dashboard
  try {
    notificationsGateway.emitDashboardUpdateNeeded();
  } catch (e) {
    logger.warn('Failed to emit dashboard update via WebSocket', e);
  }

  return toDoc(saved);
}

async function update(id, jobData, requesterId, requesterRole) {
  const job = await prisma.job.findUnique({ where: { id: String(id) } });
  if (!job) {
    throw new HttpError(404, 'Không tìm thấy công việc để cập nhật');
  }
  if (
    requesterRole !== 'admin' &&
    String(job.employerId) !== String(requesterId)
  ) {
    logger.fail('Cập nhật job thất bại - không có quyền', {
      userId: requesterId,
      action: 'update_job',
      jobId: id,
    });
    throw new HttpError(403, 'Bạn không có quyền chỉnh sửa tin tuyển dụng này');
  }

  const patch = sanitizeJobData(jobData);

  // Non-admins cannot publish directly — mirrors the original (including the
  // quirk that an update WITHOUT a status field resets it to 'pending').
  const jobsSettings = await getJobsSettings();
  if (requesterRole !== 'admin') {
    if (jobsSettings.requireApproval) {
      if (patch.status !== 'draft') {
        patch.status = 'pending';
      }
    } else {
      if (patch.status === 'pending') {
        patch.status = 'active';
      }
    }
  }

  const updated = await prisma.job.update({
    where: { id: String(id) },
    data: patch,
  });
  logger.success('Cập nhật tin tuyển dụng', {
    userId: requesterId,
    action: 'update_job',
    jobId: id,
    title: jobData.title,
  });
  return toDoc(updated);
}

async function remove(id, requesterId, requesterRole) {
  const job = await prisma.job.findUnique({ where: { id: String(id) } });
  if (!job) {
    throw new HttpError(404, 'Không tìm thấy công việc để xóa');
  }
  if (
    requesterRole !== 'admin' &&
    String(job.employerId) !== String(requesterId)
  ) {
    logger.fail('Xóa job thất bại - không có quyền', {
      userId: requesterId,
      action: 'delete_job',
      jobId: id,
    });
    throw new HttpError(403, 'Bạn không có quyền xóa tin tuyển dụng này');
  }

  // Tự động từ chối tất cả đơn ứng tuyển chưa được xử lý khi xóa job
  const rejectResult = await prisma.application.updateMany({
    where: {
      jobId: String(id),
      status: { in: ['pending', 'reviewing', 'interview'] },
    },
    data: { status: 'rejected' },
  });
  logger.log(
    `Đã từ chối ${rejectResult.count} đơn ứng tuyển do job bị xóa`,
    { action: 'auto_reject_applications', jobId: id },
  );

  await prisma.job.delete({ where: { id: String(id) } });
  logger.success('Xóa tin tuyển dụng', {
    userId: requesterId,
    action: 'delete_job',
    jobId: id,
    title: job.title,
  });
  return { message: 'Đã xóa công việc thành công' };
}

async function apply(jobId, candidateId, data, file) {
  const job = await prisma.job.findUnique({ where: { id: String(jobId) } });
  if (!job) {
    logger.fail('Ứng tuyển thất bại - job không tồn tại', {
      userId: candidateId,
      action: 'apply_job',
      jobId,
    });
    throw new HttpError(404, 'Không tìm thấy công việc');
  }

  // Check if job is expired
  const jobsSettings = await getJobsSettings();
  const expiryDate = new Date(
    Date.now() - jobsSettings.jobExpiryDays * 24 * 60 * 60 * 1000,
  );
  if (job.createdAt < expiryDate) {
    throw new HttpError(
      400,
      'Tin tuyển dụng này đã hết hạn, không thể ứng tuyển.',
    );
  }

  // SPAM PREVENTION: Check if already applied
  const existingApp = await prisma.application.findFirst({
    where: { jobId: String(jobId), candidateId: String(candidateId) },
  });
  if (existingApp) {
    logger.fail('Ứng tuyển thất bại - đã ứng tuyển', {
      userId: candidateId,
      action: 'apply_job',
      jobId,
    });
    throw new HttpError(400, 'Bạn đã từng ứng tuyển vị trí này rồi.');
  }

  // Check AI settings for file validation
  const aiSettings = await getAiSettings();

  let cvId = data.cvId || 'uploaded_cv.pdf';
  let aiScoreId;
  let pdfBufferForApp;

  if (file) {
    // Normalize Vietnamese filename before validation
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const maxBytes = aiSettings.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new HttpError(
        400,
        `Dung lượng file vượt quá giới hạn ${aiSettings.maxFileSizeMB}MB.`,
      );
    }
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ext || !aiSettings.supportedFormats.includes(ext)) {
      throw new HttpError(
        400,
        `Định dạng file không được hỗ trợ. Các định dạng: ${aiSettings.supportedFormats.join(', ')}`,
      );
    }
    const originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    // Store the file buffer directly on the Application, NOT as a CvScore record.
    cvId = originalname;
    pdfBufferForApp = file.buffer;
  } else {
    const specificScore = await prisma.cvScore.findFirst({
      where: { userId: String(candidateId), jobId: String(jobId) },
      orderBy: { createdAt: 'desc' },
    });

    if (specificScore) {
      cvId = specificScore.cvUrl || cvId;
      aiScoreId = specificScore.id;
    } else {
      // Must have specific match or upload a CV.
      throw new HttpError(
        400,
        'Bạn chưa đính kèm CV. Vui lòng đính kèm CV để ứng tuyển.',
      );
    }
  }

  const application = await prisma.application.create({
    data: {
      jobId: String(jobId),
      candidateId: String(candidateId),
      coverLetter: data.coverLetter,
      cvId,
      aiScoreId,
      pdfBuffer: pdfBufferForApp,
    },
  });

  const updatedJob = await prisma.job.update({
    where: { id: String(jobId) },
    data: { applied: { increment: 1 } },
  });

  // Emit realtime update for admin
  try {
    notificationsGateway.emitJobApplicationsUpdated(jobId, updatedJob.applied);
  } catch (e) {
    logger.warn('Failed to emit job applications update via WebSocket', e);
  }

  // Emit realtime update for admin dashboard
  try {
    notificationsGateway.emitDashboardUpdateNeeded();
  } catch (e) {
    logger.warn('Failed to emit dashboard update via WebSocket', e);
  }

  logger.success('Ứng tuyển thành công', {
    userId: candidateId,
    action: 'apply_job',
    jobId,
    title: job.title,
  });

  return { message: 'Ứng tuyển thành công', applicationId: application.id };
}

async function getMyApplications(candidateId) {
  const rows = await prisma.application.findMany({
    where: { candidateId: String(candidateId) },
    orderBy: { createdAt: 'desc' },
  });

  // `.populate('jobId')` — the ref becomes the full job document (or null).
  return populateRef(rows, {
    refField: 'jobId',
    fetchByIds: (ids) => prisma.job.findMany({ where: { id: { in: ids } } }),
  });
}

async function getCategories() {
  const grouped = await prisma.job.groupBy({
    by: ['category'],
    where: { status: 'active' },
    _count: { _all: true },
  });

  return grouped
    .map((g) => ({ name: g.category, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
}

async function seedData() {
  await prisma.job.deleteMany({});
  const result = await prisma.job.createMany({
    data: SEED_JOBS().map((j) => sanitizeJobData(j)),
  });
  return {
    message: `Da seed ${result.count} jobs vao database`,
    count: result.count,
  };
}

async function toggleSaveJob(jobId, userId) {
  const job = await prisma.job.findUnique({ where: { id: String(jobId) } });
  if (!job) throw new HttpError(404, 'Không tìm thấy công việc');

  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) throw new HttpError(404, 'Không tìm thấy người dùng');

  const savedJobs = user.savedJobs || [];
  const idx = savedJobs.findIndex((id) => String(id) === String(jobId));

  if (idx === -1) {
    // Enforce maxSavedJobs: check limit before saving
    const usersSettings = await getUsersSettings();
    if (savedJobs.length >= usersSettings.maxSavedJobs) {
      throw new HttpError(
        400,
        `Bạn chỉ có thể lưu tối đa ${usersSettings.maxSavedJobs} công việc. Vui lòng bỏ lưu công việc cũ trước khi lưu công việc mới.`,
      );
    }

    await prisma.user.update({
      where: { id: String(userId) },
      data: { savedJobs: { push: String(jobId) } },
    });
    logger.log('Lưu việc làm', { userId, jobId, action: 'save_job' });
    return { saved: true };
  } else {
    // Already saved → unsave
    await prisma.user.update({
      where: { id: String(userId) },
      data: {
        savedJobs: {
          set: savedJobs.filter((id) => String(id) !== String(jobId)),
        },
      },
    });
    logger.log('Bỏ lưu việc làm', { userId, jobId, action: 'unsave_job' });
    return { saved: false };
  }
}

async function getSavedJobs(userId) {
  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) throw new HttpError(404, 'Không tìm thấy người dùng');

  // `.populate('savedJobs')` — full job documents, in the saved order,
  // silently dropping ids whose job no longer exists.
  return populateRefList(user.savedJobs || [], (ids) =>
    prisma.job.findMany({ where: { id: { in: ids } } }),
  );
}

module.exports = {
  findAll,
  findOne,
  create,
  update,
  remove,
  apply,
  getMyApplications,
  getCategories,
  seedData,
  toggleSaveJob,
  getSavedJobs,
};
