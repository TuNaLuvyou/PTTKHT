// AdminService — Prisma/PostgreSQL port of
// backend/src/admin/admin.service.ts
//
// All queries, aggregations, enrichment logic, notification side-effects and
// response shapes are kept identical to the NestJS implementation.
//
// Two Mongo-isms are emulated on purpose:
//   • `.populate()` → src/utils/populate.js (refs are plain string columns)
//   • `$regex: kw, $options: 'i'` → `contains` + `mode: 'insensitive'`
//     (equivalent for ordinary search terms; a regex-only pattern such as
//      `a.b` no longer matches `axb`, which only ever produced extra rows)

const { prisma } = require('../config/prisma');
const { toDoc, normalizeJson } = require('../utils/serialize');
const { populateRef } = require('../utils/populate');

const notificationsGateway = require('../sockets/notifications.gateway');
const { AppLogger } = require('../utils/logger');
const { HttpError } = require('../utils/httpError');

const logger = AppLogger.forContext('AdminService');

// ─── Dashboard ────────────────────────────────────────────────────────

async function getDashboardStats() {
  logger.log('Xem thống kê dashboard admin', {
    action: 'admin_dashboard',
  });
  const totalUsers = await prisma.user.count();
  const totalEmployers = await prisma.user.count({ where: { role: 'employer' } });
  const totalCandidates = await prisma.user.count({
    where: { role: 'candidate' },
  });

  const totalJobs = await prisma.job.count();
  const activeJobs = await prisma.job.count({ where: { status: 'active' } });
  const pendingJobsCount = await prisma.job.count({
    where: { status: 'pending' },
  });
  const reportedJobs = await prisma.job.count({ where: { status: 'reported' } });

  const totalApplications = await prisma.application.count();
  const totalCvScores = await prisma.cvScore.count();
  const pendingEmployers = await prisma.user.count({
    where: { role: 'employer', status: 'pending' },
  });

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsersThisMonth = await prisma.user.count({
    where: { createdAt: { gte: firstOfMonth } },
  });

  // User growth (last 6 months)
  const userGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const candidates = await prisma.user.count({
      where: { role: 'candidate', createdAt: { gte: start, lt: end } },
    });
    const employers = await prisma.user.count({
      where: { role: 'employer', createdAt: { gte: start, lt: end } },
    });
    const monthNames = [
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
      'T8',
      'T9',
      'T10',
      'T11',
      'T12',
    ];
    userGrowth.push({
      month: `${monthNames[start.getMonth()]}/${start.getFullYear()}`,
      candidates,
      employers,
    });
  }

  // Jobs by category
  const categoryGroups = await prisma.job.groupBy({
    by: ['category'],
    where: { status: 'active' },
    _count: { _all: true },
  });
  const jobsByCategory = categoryGroups
    .map((g) => ({ category: g.category, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  // CV score distribution
  const scoreDistribution = [
    {
      grade: 'A (85-100)',
      count: await prisma.cvScore.count({ where: { score: { gte: 85 } } }),
    },
    {
      grade: 'B (70-84)',
      count: await prisma.cvScore.count({
        where: { score: { gte: 70, lt: 85 } },
      }),
    },
    {
      grade: 'C (55-69)',
      count: await prisma.cvScore.count({
        where: { score: { gte: 55, lt: 70 } },
      }),
    },
    {
      grade: 'D (<55)',
      count: await prisma.cvScore.count({ where: { score: { lt: 55 } } }),
    },
  ];

  // Average CV score (MongoDB's $avg ignores null/missing values too)
  const avgScoreAgg = await prisma.cvScore.aggregate({ _avg: { score: true } });
  const avgCVScore =
    avgScoreAgg._avg.score !== null && avgScoreAgg._avg.score !== undefined
      ? Math.round(avgScoreAgg._avg.score)
      : 0;

  // Top locations
  const locationGroups = await prisma.job.groupBy({
    by: ['location'],
    where: { status: 'active' },
    _count: { _all: true },
  });
  const locationAgg = locationGroups
    .map((g) => ({ _id: g.location, count: g._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topLocations = await Promise.all(
    (locationAgg || []).map(async (loc) => {
      const users = await prisma.user.count({
        where: { role: 'employer', location: loc._id },
      });
      return { city: loc._id, jobs: loc.count, users };
    }),
  );

  // Recent activities
  const recentActivities = await getRecentActivities(6);

  return {
    overview: {
      totalUsers,
      newUsersThisMonth,
      totalEmployers,
      totalJobs,
      activeJobs,
      pendingJobs: pendingJobsCount,
      reportedJobs,
      pendingEmployers,
      totalApplications,
      totalCvScores,
      avgCVScore,
    },
    userGrowth,
    jobsByCategory: jobsByCategory.map((j) => ({
      ...j,
      pct: activeJobs > 0 ? Math.round((j.count / activeJobs) * 100) : 0,
    })),
    cvScoreDistribution: scoreDistribution.map((s) => ({
      ...s,
      pct: totalCvScores > 0 ? Math.round((s.count / totalCvScores) * 100) : 0,
    })),
    topLocations,
    recentActivities,
  };
}

async function getRecentActivities(limit = 10) {
  const recent = [];

  // Recent user registrations
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  for (const u of recentUsers) {
    const roleLabel =
      u.role === 'employer'
        ? 'NTD'
        : u.role === 'admin'
          ? 'Quản trị viên'
          : 'Ứng viên';
    const typeLabel =
      u.role === 'employer'
        ? 'new_employer'
        : u.role === 'admin'
          ? 'new_admin'
          : 'new_user';
    const icon = u.role === 'employer' ? '🏢' : u.role === 'admin' ? '⚙️' : '👤';
    recent.push({
      type: typeLabel,
      message: `${roleLabel} mới: ${u.name}`,
      time: timeAgo(u.createdAt),
      icon,
      role: u.role,
    });
  }

  // Recent job posts
  const recentJobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  for (const j of recentJobs) {
    recent.push({
      type: 'new_job',
      message: `Tin tuyển dụng mới: ${j.title}${j.status === 'pending' ? ' (chờ duyệt)' : ''}`,
      time: timeAgo(j.createdAt),
      icon: '📋',
    });
  }

  // Recent CV scores
  const recentScores = await prisma.cvScore.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  for (const s of recentScores) {
    recent.push({
      type: 'cv_score',
      message: `CV được chấm điểm: ${s.overall || s.score || 0}/100`,
      time: timeAgo(s.createdAt),
      icon: '✨',
    });
  }

  // Sort by time (newest first), then limit
  recent.sort((a, b) => {
    const timeA = parseTimeAgo(a.time);
    const timeB = parseTimeAgo(b.time);
    return timeB - timeA;
  });

  return recent.slice(0, limit).map((r, i) => ({ id: i + 1, ...r }));
}

// ─── Users ────────────────────────────────────────────────────────────

async function getUsers(params) {
  logger.log('Xem danh sách người dùng', {
    action: 'admin_get_users',
    ...params,
  });
  const filter = {};
  if (params.role) filter.role = params.role;
  if (params.status) filter.status = params.status;
  if (params.keyword) {
    const kw = params.keyword;
    filter.OR = [
      { name: { contains: kw, mode: 'insensitive' } },
      { email: { contains: kw, mode: 'insensitive' } },
    ];
  }

  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where: filter }),
  ]);

  // Enrich with additional stats
  const enriched = await Promise.all(
    data.map(async (u) => {
      const { password, ...safeUser } = toDoc(u);

      if (u.role === 'candidate') {
        const cvCount = await prisma.cvScore.count({ where: { userId: u.id } });
        const appliedJobs = await prisma.application.count({
          where: { candidateId: u.id },
        });
        return { id: String(u.id), ...safeUser, cvCount, appliedJobs };
      }

      if (u.role === 'employer') {
        const postedJobs = await prisma.job.count({
          where: { employerId: u.id },
        });
        const employerJobs = await prisma.job.findMany({
          where: { employerId: u.id },
          select: { id: true },
        });
        const jobIds = employerJobs.map((j) => j.id);
        const totalApplicants = await prisma.application.count({
          where: { jobId: { in: jobIds } },
        });
        return { id: String(u.id), ...safeUser, postedJobs, totalApplicants };
      }

      return { id: String(u.id), ...safeUser };
    }),
  );

  return { data: enriched, total, page, limit };
}

async function getUser(id) {
  logger.log('Xem chi tiết người dùng', {
    action: 'admin_get_user',
    targetUserId: id,
  });
  const user = await prisma.user.findUnique({ where: { id: String(id) } });
  if (!user) throw HttpError.notFound('Không tìm thấy người dùng');
  const { password, ...safeUser } = toDoc(user);

  // Enrich with real-time stats from other collections
  if (user.role === 'candidate') {
    const cvCount = await prisma.cvScore.count({ where: { userId: user.id } });
    const appliedJobs = await prisma.application.count({
      where: { candidateId: user.id },
    });
    const savedJobs = (user.savedJobs || []).length;
    return {
      id: String(user.id),
      ...safeUser,
      cvCount,
      appliedJobs,
      savedJobs,
    };
  }

  if (user.role === 'employer') {
    const postedJobs = await prisma.job.count({ where: { employerId: user.id } });
    const employerJobs = await prisma.job.findMany({
      where: { employerId: user.id },
      select: { id: true },
    });
    const jobIds = employerJobs.map((j) => j.id);
    const totalApplicants = await prisma.application.count({
      where: { jobId: { in: jobIds } },
    });
    return { id: String(user.id), ...safeUser, postedJobs, totalApplicants };
  }

  return { id: String(user.id), ...safeUser };
}

async function updateUserStatus(id, status, reason = '') {
  let user = null;
  try {
    user = await prisma.user.update({
      where: { id: String(id) },
      data: { status },
    });
  } catch (err) {
    if (err.code !== 'P2025') throw err; // only swallow "record not found"
  }
  if (!user) {
    logger.fail('Cập nhật trạng thái user thất bại - không tìm thấy', {
      action: 'admin_update_user_status',
      targetUserId: id,
      status,
    });
    throw HttpError.notFound('Không tìm thấy người dùng');
  }
  logger.success('Cập nhật trạng thái user', {
    action: 'admin_update_user_status',
    targetUserId: id,
    status,
    reason: reason || 'none',
  });
  // Create notification for user status change
  const notif = await prisma.notification.create({
    data: {
      userId: String(id),
      title: 'Cập nhật trạng thái tài khoản',
      message: `Tài khoản của bạn đã được chuyển sang trạng thái: ${status}${reason ? `. Lý do: ${reason}` : ''}`,
      type: status === 'banned' ? 'warning' : 'info',
    },
  });
  notificationsGateway.emitNotificationCreated({
    id: String(notif.id),
    title: notif.title,
    message: notif.message,
    type: notif.type,
    time: 'Vừa xong',
    unread: true,
  });
  return { success: true };
}

async function deleteUser(id) {
  let user = null;
  try {
    user = await prisma.user.delete({ where: { id: String(id) } });
  } catch (err) {
    if (err.code !== 'P2025') throw err; // only swallow "record not found"
  }
  if (!user) {
    logger.fail('Xóa user thất bại - không tìm thấy', {
      action: 'admin_delete_user',
      targetUserId: id,
    });
    throw HttpError.notFound('Không tìm thấy người dùng');
  }
  logger.success('Xóa user', {
    action: 'admin_delete_user',
    targetUserId: id,
    name: user.name,
    email: user.email,
  });
  return { message: 'Đã xóa người dùng thành công' };
}

// ─── Jobs ─────────────────────────────────────────────────────────────

async function getAdminJobs(params) {
  const filter = {};
  if (params.status) filter.status = params.status;
  if (params.keyword) {
    const kw = params.keyword;
    filter.OR = [
      { title: { contains: kw, mode: 'insensitive' } },
      { companyName: { contains: kw, mode: 'insensitive' } },
    ];
  }

  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.job.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.job.count({ where: filter }),
  ]);

  // `.populate('employerId', 'name email')`
  const data = await populateRef(rows, {
    refField: 'employerId',
    fetchByIds: (ids) =>
      prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, email: true },
      }),
  });

  const enriched = data.map((job) => {
    const employer = job.employerId;
    return {
      id: job._id,
      title: job.title,
      company: job.companyName,
      companyId: employer?._id,
      location: job.location,
      salary:
        job.salary ||
        (job.salaryMin
          ? `${job.salaryMin / 1000000} - ${job.salaryMax / 1000000} triệu`
          : 'Thỏa thuận'),
      level: job.level,
      type: job.type,
      category: job.category,
      status: job.status,
      featured: job.featured || false,
      views: job.views || 0,
      applied: job.applied || 0,
      postedAt: job.createdAt,
      deadline: job.deadline,
      tags: job.tags || [],
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
    };
  });

  return { data: enriched, total, page, limit };
}

async function updateJobStatus(id, status) {
  let job = null;
  try {
    job = await prisma.job.update({
      where: { id: String(id) },
      data: { status },
    });
  } catch (err) {
    if (err.code !== 'P2025') throw err; // only swallow "record not found"
  }
  if (!job) {
    logger.fail('Cập nhật trạng thái job thất bại', {
      action: 'admin_update_job_status',
      jobId: id,
      status,
    });
    throw HttpError.notFound('Không tìm thấy công việc');
  }
  logger.success('Cập nhật trạng thái job', {
    action: 'admin_update_job_status',
    jobId: id,
    status,
    title: job.title,
  });

  // Notify employer about status change
  const notif = await prisma.notification.create({
    data: {
      userId: job.employerId ? String(job.employerId) : undefined,
      title: 'Cập nhật trạng thái tin tuyển dụng',
      message: `Tin tuyển dụng "${job.title}" đã được chuyển sang trạng thái: ${status}`,
      type:
        status === 'active'
          ? 'success'
          : status === 'rejected'
            ? 'warning'
            : 'info',
      jobId: String(job.id),
    },
  });
  notificationsGateway.emitNotificationCreated({
    id: String(notif.id),
    title: notif.title,
    message: notif.message,
    type: notif.type,
    time: 'Vừa xong',
    unread: true,
    jobId: notif.jobId,
  });

  return { success: true };
}

async function toggleJobFeatured(id, featured) {
  let job = null;
  try {
    job = await prisma.job.update({
      where: { id: String(id) },
      data: { featured },
    });
  } catch (err) {
    if (err.code !== 'P2025') throw err;
  }
  if (!job) throw HttpError.notFound('Không tìm thấy công việc');
  return { success: true, featured: job.featured };
}

async function deleteJob(id) {
  let job = null;
  try {
    job = await prisma.job.delete({ where: { id: String(id) } });
  } catch (err) {
    if (err.code !== 'P2025') throw err;
  }
  if (!job) {
    logger.fail('Xóa job thất bại - không tìm thấy', {
      action: 'admin_delete_job',
      jobId: id,
    });
    throw HttpError.notFound('Không tìm thấy công việc');
  }
  logger.success('Xóa job', {
    action: 'admin_delete_job',
    jobId: id,
    title: job.title,
  });
  return { message: 'Đã xóa tin tuyển dụng thành công' };
}

// ─── CV Scores ────────────────────────────────────────────────────────

async function getCVScores(params) {
  const filter = {};
  if (params.grade) {
    // Support both stored grade field AND score-based fallback for old records
    const scoreRanges = {
      A: { gte: 85 },
      B: { gte: 70, lt: 85 },
      C: { gte: 55, lt: 70 },
      D: { lt: 55 },
    };
    const range = scoreRanges[params.grade];
    if (range) {
      filter.OR = [{ grade: params.grade }, { score: { ...range } }];
    } else {
      filter.grade = params.grade;
    }
  }
  if (params.keyword) {
    const kwFilter = [
      { fileName: { contains: params.keyword, mode: 'insensitive' } },
      { targetPosition: { contains: params.keyword, mode: 'insensitive' } },
      {
        analysis: {
          path: ['gradeLabel'],
          string_contains: params.keyword,
          mode: 'insensitive',
        },
      },
    ];
    if (filter.OR) {
      // Already has OR from grade filter — combine with AND
      filter.AND = [{ OR: filter.OR }, { OR: kwFilter }];
      delete filter.OR;
    } else {
      filter.OR = kwFilter;
    }
  }

  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.cvScore.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.cvScore.count({ where: filter }),
  ]);

  // `.populate('userId', 'name email')`
  const data = await populateRef(rows, {
    refField: 'userId',
    fetchByIds: (ids) =>
      prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, email: true },
      }),
  });

  const enriched = data.map((score) => {
    const user = score.userId;
    const cats = score.analysis?.categories || [];
    const overallVal = score.overall || score.score || 0;
    const categories = {
      skills: 0,
      experience: 0,
      education: 0,
      format: 0,
      keywords: 0,
    };
    const catMap = {
      skills_match: 'skills',
      skills: 'skills',
      experience: 'experience',
      education: 'education',
      format: 'format',
      keywords: 'keywords',
    };
    for (const c of cats) {
      const key = catMap[c.key];
      if (key) categories[key] = c.score;
    }
    // Fallback: nếu categories vẫn là 0 (dữ liệu cũ không có analysis.categories),
    // dùng overall score để phân bổ hợp lý
    const hasRealData = Object.values(categories).some((v) => v > 0);
    if (!hasRealData && overallVal > 0) {
      categories.skills = overallVal;
      categories.experience = Math.min(100, overallVal + 5);
      categories.education = Math.min(100, overallVal + 10);
      categories.format = Math.max(0, overallVal - 5);
      categories.keywords = Math.max(0, overallVal - 10);
    }

    // Compute grade from score if not stored (for old records)
    let computedGrade = score.grade || null;
    if (!computedGrade) {
      if (overallVal >= 85) computedGrade = 'A';
      else if (overallVal >= 70) computedGrade = 'B';
      else if (overallVal >= 55) computedGrade = 'C';
      else computedGrade = 'D';
    }

    return {
      id: score._id,
      userId: user?._id,
      userName: user?.name || 'N/A',
      userEmail: user?.email || 'N/A',
      fileName: score.fileName || score.cvUrl || 'CV.pdf',
      overall: overallVal,
      grade: computedGrade,
      targetPosition: score.targetPosition || '',
      scoredAt: score.createdAt,
      categories,
    };
  });

  return { data: enriched, total, page, limit };
}

async function deleteCVScore(id) {
  let score = null;
  try {
    score = await prisma.cvScore.delete({ where: { id: String(id) } });
  } catch (err) {
    if (err.code !== 'P2025') throw err;
  }
  if (!score) {
    logger.fail('Xóa điểm CV thất bại - không tìm thấy', {
      action: 'admin_delete_cv_score',
      scoreId: id,
    });
    throw HttpError.notFound('Không tìm thấy điểm CV');
  }
  logger.success('Xóa điểm CV', {
    action: 'admin_delete_cv_score',
    scoreId: id,
  });
  return { message: 'Đã xóa điểm CV thành công' };
}

// ─── Notifications ────────────────────────────────────────────────────

async function getNotifications(userId, params) {
  const query = {};
  // Admin can see all notifications, or filter by userId
  if (params.filter === 'unread') query.read = false;

  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const [data, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.notification.count({ where: query }),
    prisma.notification.count({ where: { read: false } }),
  ]);

  return {
    data: data.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      time: timeAgo(n.createdAt),
      unread: !n.read,
      jobId: n.jobId,
    })),
    total,
    unreadCount,
    page,
    limit,
  };
}

async function markNotificationRead(id) {
  // `findByIdAndUpdate` never threw when the id was unknown — updateMany keeps
  // that "always succeed" behaviour.
  await prisma.notification.updateMany({
    where: { id: String(id) },
    data: { read: true },
  });
  logger.log('Đánh dấu thông báo đã đọc', {
    action: 'admin_mark_notification_read',
    notificationId: id,
  });
  notificationsGateway.emitNotificationRead(id);
  return { success: true };
}

async function markAllNotificationsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  logger.log('Đánh dấu tất cả thông báo đã đọc', {
    action: 'admin_mark_all_read',
    count: result.count,
  });
  notificationsGateway.emitAllNotificationsRead();
  return { success: true };
}

async function deleteNotification(id) {
  await prisma.notification.deleteMany({ where: { id: String(id) } });
  logger.log('Xóa thông báo', {
    action: 'admin_delete_notification',
    notificationId: id,
  });
  notificationsGateway.emitNotificationDeleted(id);
  return { success: true };
}

async function createNotification(data) {
  const created = await prisma.notification.create({
    data: {
      userId: data.userId ? String(data.userId) : undefined,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      jobId: data.jobId,
    },
  });
  logger.success('Tạo thông báo mới', {
    action: 'admin_create_notification',
    notificationId: String(created.id),
    title: data.title,
  });
  notificationsGateway.emitNotificationCreated({
    id: String(created.id),
    title: created.title,
    message: created.message,
    type: created.type,
    time: 'Vừa xong',
    unread: true,
    jobId: created.jobId,
  });
  return toDoc(created);
}

// ─── Settings ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  site: {
    siteName: 'NexCV',
    siteUrl: 'https://nexcv.vn',
    contactEmail: 'support@nexcv.vn',
    contactPhone: '0901234567',
    maintenanceMode: false,
  },
  ai: {
    cvScoreEnabled: true,
    maxFileSizeMB: 10,
    supportedFormats: ['pdf', 'doc', 'docx'],
    processingTimeoutSec: 60,
    dailyScoreLimit: 5,
  },
  jobs: {
    requireApproval: true,
    maxJobsPerEmployer: 20,
    featuredJobPrice: 0,
    jobExpiryDays: 90,
    autoCloseExpired: true,
  },
  users: {
    emailVerificationRequired: false,
    employerVerificationRequired: true,
    maxSavedJobs: 50,
  },
  security: {
    passwordMinLength: 6,
    maxLoginAttempts: 5,
    sessionTimeoutMin: 60,
    mfaEnabled: false,
    rbacEnabled: false,
    auditLogEnabled: true,
  },
};

async function getSettings() {
  const doc = await prisma.settings.findUnique({ where: { key: 'global' } });
  if (!doc) return { ...DEFAULT_SETTINGS };

  // Merge DB values over defaults so new sections always have defaults
  return {
    site: { ...DEFAULT_SETTINGS.site, ...doc.site },
    ai: { ...DEFAULT_SETTINGS.ai, ...doc.ai },
    jobs: { ...DEFAULT_SETTINGS.jobs, ...doc.jobs },
    users: { ...DEFAULT_SETTINGS.users, ...doc.users },
    security: { ...DEFAULT_SETTINGS.security, ...doc.security },
  };
}

async function updateSettings(section, data) {
  logger.success('Cập nhật cài đặt hệ thống', {
    action: 'admin_update_settings',
    section,
  });

  // Upsert — replace the specific section of the global document
  const normalized = normalizeJson(data);
  await prisma.settings.upsert({
    where: { key: 'global' },
    create: { key: 'global', [section]: normalized },
    update: { [section]: normalized },
  });

  // Return full updated settings
  return getSettings();
}

// ─── Helpers ──────────────────────────────────────────────────────────

function timeAgo(date) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return `${Math.floor(diffDay / 30)} tháng trước`;
}

function parseTimeAgo(timeStr) {
  const now = Date.now();
  if (timeStr === 'Vừa xong') return now;
  const min = timeStr.match(/(\d+) phút/);
  if (min) return now - parseInt(min[1]) * 60000;
  const hour = timeStr.match(/(\d+) giờ/);
  if (hour) return now - parseInt(hour[1]) * 3600000;
  const day = timeStr.match(/(\d+) ngày/);
  if (day) return now - parseInt(day[1]) * 86400000;
  return now;
}

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  getAdminJobs,
  updateJobStatus,
  toggleJobFeatured,
  deleteJob,
  getCVScores,
  deleteCVScore,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
  getSettings,
  updateSettings,
};
