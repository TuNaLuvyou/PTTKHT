/**
 * EmployerService — Prisma/PostgreSQL port of
 * backend/src/employer/employer.service.ts
 *
 * Dashboard stats, job listing, candidate applications, status updates,
 * archiving and candidate profiles. Query logic preserved 1:1.
 */
const { prisma } = require('../config/prisma');
const { populateRef } = require('../utils/populate');
const { HttpError } = require('../utils/httpError');
const { AppLogger } = require('../utils/logger');

const logger = AppLogger.forContext('EmployerService');

function mapJobToFrontend(job) {
  return {
    id: job.id,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    job_type: (job.type || 'full-time').toLowerCase(),
    level: (job.level || 'junior').toLowerCase(),
    salary_min: job.salaryMin || 0,
    salary_max: job.salaryMax || 0,
    required_skills: job.tags || [],
    status: job.status || 'active',
    view_count: job.views || 0,
    application_count: job.applied || 0,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

async function getDashboardStats(employerId) {
  logger.log('Xem thống kê dashboard', {
    userId: employerId,
    action: 'view_dashboard',
  });
  const filter = employerId ? { employerId: String(employerId) } : {};
  const totalJobs = await prisma.job.count({ where: filter });

  const employerJobs = await prisma.job.findMany({
    where: filter,
    select: { id: true, views: true },
  });
  const jobIds = employerJobs.map((j) => j.id);
  const totalViews = employerJobs.reduce((sum, j) => sum + (j.views || 0), 0);

  const appFilter = {
    jobId: { in: jobIds },
    isArchivedByEmployer: { not: true },
  };
  const totalApps = await prisma.application.count({ where: appFilter });
  const pendingApps = await prisma.application.count({
    where: { ...appFilter, status: 'pending' },
  });
  const reviewingApps = await prisma.application.count({
    where: { ...appFilter, status: 'reviewing' },
  });
  const interviewApps = await prisma.application.count({
    where: { ...appFilter, status: 'interview' },
  });
  const offeredApps = await prisma.application.count({
    where: { ...appFilter, status: 'offered' },
  });
  const rejectedApps = await prisma.application.count({
    where: { ...appFilter, status: 'rejected' },
  });

  const applicationsChart = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const start = new Date(d);
    const end = new Date(d);
    end.setDate(d.getDate() + 1);

    const count = await prisma.application.count({
      where: {
        jobId: { in: jobIds },
        createdAt: { gte: start, lt: end },
        isArchivedByEmployer: { not: true },
      },
    });

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    applicationsChart.push({
      date: `${day}/${month}`,
      count: count,
    });
  }

  return {
    total_jobs: totalJobs,
    active_jobs: await prisma.job.count({
      where: { ...filter, status: 'active' },
    }),
    total_applications: totalApps,
    pending_applications: pendingApps,
    total_views: totalViews,
    applications_chart: applicationsChart,
    status_breakdown: {
      pending: pendingApps,
      reviewing: reviewingApps,
      interview: interviewApps,
      offered: offeredApps,
      rejected: rejectedApps,
    },
  };
}

async function getJobs(employerId) {
  const filter = employerId ? { employerId: String(employerId) } : {};
  // No explicit sort in the original code (MongoDB natural/insertion order);
  // createdAt ascending is the closest deterministic equivalent.
  const jobs = await prisma.job.findMany({
    where: filter,
    orderBy: { createdAt: 'asc' },
  });
  const jobIds = jobs.map((j) => j.id);

  // Count visible (non-archived) applications per job
  const counts = await prisma.application.groupBy({
    by: ['jobId'],
    where: { jobId: { in: jobIds }, isArchivedByEmployer: { not: true } },
    _count: { _all: true },
  });
  const countMap = {};
  for (const c of counts) countMap[String(c.jobId)] = c._count._all;

  return {
    data: jobs.map((j) => ({
      ...mapJobToFrontend(j),
      application_count: countMap[j.id] ?? 0,
    })),
  };
}

async function getJob(id) {
  const job = await prisma.job.findUnique({ where: { id: String(id) } });
  if (!job) throw new HttpError(404, 'Không tìm thấy công việc');
  return mapJobToFrontend(job);
}

async function getApplications(jobId) {
  const rawApps = await prisma.application.findMany({
    where: { jobId: String(jobId), isArchivedByEmployer: { not: true } },
    orderBy: { createdAt: 'desc' },
  });

  // `.populate('candidateId').populate('aiScoreId')`
  const withCandidate = await populateRef(rawApps, {
    refField: 'candidateId',
    fetchByIds: (ids) => prisma.user.findMany({ where: { id: { in: ids } } }),
  });
  const apps = await populateRef(withCandidate, {
    refField: 'aiScoreId',
    fetchByIds: (ids) => prisma.cvScore.findMany({ where: { id: { in: ids } } }),
  });

  const data = apps.map((app) => {
    const seeker = app.candidateId;
    const aiScore = app.aiScoreId;

    const breakdown = { skills: 0, experience: 0, education: 0, keywords: 0 };
    if (aiScore?.analysis?.categories) {
      const cats = aiScore.analysis.categories;
      const skillsCat = cats.find(
        (c) => c.key === 'skills_match' || c.key === 'skills',
      );
      const expCat = cats.find((c) => c.key === 'experience');
      const eduCat = cats.find((c) => c.key === 'education');
      const kwCat = cats.find((c) => c.key === 'keywords');

      breakdown.skills = skillsCat ? skillsCat.score : aiScore.score || 0;
      breakdown.experience = expCat ? expCat.score : aiScore.score || 0;
      breakdown.education = eduCat ? eduCat.score : aiScore.score || 0;
      breakdown.keywords = kwCat ? kwCat.score : aiScore.score || 0;
    } else if (aiScore) {
      // Fallback for simple scores
      const scoreVal = (aiScore.score || 0) * 10; // Convert 1-10 to 1-100
      breakdown.skills = scoreVal;
      breakdown.experience = scoreVal;
      breakdown.education = scoreVal;
      breakdown.keywords = scoreVal;
    }

    return {
      id: app._id,
      job_id: app.jobId,
      seeker_id: seeker?._id,
      resume_id: app.cvId,
      status: app.status,
      cover_letter: app.coverLetter,
      applied_at: app.createdAt,
      updated_at: app.updatedAt,
      seeker: {
        id: seeker?._id,
        full_name: seeker?.name || 'Ứng viên ẩn danh',
        email: seeker?.email || 'no-email@email.com',
        avatar_url: null,
      },
      resume: {
        title: app.cvId || 'CV_Ung_Vien.pdf',
        pdf_url: app.cvId ? `/api/cv-scoring/view/${app.cvId}` : '#',
      },
      ai_score:
        aiScore &&
        (aiScore.score > 0 ||
          aiScore.overall > 0 ||
          aiScore.analysis?.overall > 0)
          ? {
              overall_score:
                aiScore.analysis?.overall || aiScore.score * 10 || 0,
              breakdown,
              analysis: aiScore.analysis || {},
              review:
                aiScore.analysis?.review || aiScore.analysis?.feedback || '',
            }
          : null,
    };
  });

  return { data };
}

async function updateApplicationStatus(appId, status) {
  const app = await prisma.application.findUnique({
    where: { id: String(appId) },
  });
  if (!app) {
    logger.fail('Cập nhật trạng thái hồ sơ thất bại - không tìm thấy', {
      action: 'update_status',
      applicationId: appId,
      status,
    });
    throw new HttpError(404, 'Không tìm thấy hồ sơ');
  }
  const oldStatus = app.status;
  await prisma.application.update({
    where: { id: String(appId) },
    data: { status },
  });
  logger.success('Cập nhật trạng thái hồ sơ', {
    action: 'update_status',
    applicationId: appId,
    from: oldStatus,
    to: status,
    candidateId: app.candidateId ? String(app.candidateId) : undefined,
  });
  return { success: true };
}

async function deleteApplication(appId) {
  const app = await prisma.application.findUnique({
    where: { id: String(appId) },
  });
  if (!app) {
    logger.fail('Xóa hồ sơ thất bại - không tìm thấy', {
      action: 'delete_application',
      applicationId: appId,
    });
    throw new HttpError(404, 'Không tìm thấy hồ sơ');
  }

  // Nếu chưa archive, ta sẽ archive và giảm số lượng applied của job đi 1
  if (!app.isArchivedByEmployer) {
    // updateMany → silently does nothing when the job no longer exists
    // (exactly like MongoDB's findByIdAndUpdate on a dangling ref).
    await prisma.job.updateMany({
      where: { id: String(app.jobId) },
      data: { applied: { increment: -1 } },
    });
    await prisma.application.update({
      where: { id: String(appId) },
      data: { isArchivedByEmployer: true, status: 'rejected' },
    });
  }

  logger.success('Xóa (lưu trữ) hồ sơ ứng tuyển', {
    action: 'delete_application',
    applicationId: appId,
    candidateId: app.candidateId ? String(app.candidateId) : undefined,
  });
  return { success: true };
}

async function getCandidateProfile(candidateId) {
  // `.select('-password')` — only the fields below are returned anyway.
  const user = await prisma.user.findUnique({
    where: { id: String(candidateId) },
  });
  if (!user) throw new HttpError(404, 'Không tìm thấy ứng viên');
  return {
    full_name: user.name || 'Ứng viên ẩn danh',
    email: user.email || '',
    phone: user.phone || '',
    location: user.location || '',
    title: user.title || '',
    bio: user.bio || '',
    skills: user.skills || [],
    avatar_url: user.avatar || null,
  };
}

async function bulkDeleteApplications(ids) {
  const list = (ids || []).map(String);

  // Tìm các hồ sơ chưa bị archive để tính toán trừ số lượng cho các job
  const appsToArchive = await prisma.application.findMany({
    where: { id: { in: list }, isArchivedByEmployer: { not: true } },
  });

  // Tính số lượng cần trừ cho mỗi job
  const jobCounts = {};
  for (const app of appsToArchive) {
    const jid = String(app.jobId);
    jobCounts[jid] = (jobCounts[jid] || 0) + 1;
  }

  const result = await prisma.application.updateMany({
    where: { id: { in: list } },
    data: { status: 'rejected', isArchivedByEmployer: true },
  });

  // Giảm số lượng applied của các job tương ứng
  for (const [jid, count] of Object.entries(jobCounts)) {
    await prisma.job.updateMany({
      where: { id: jid },
      data: { applied: { increment: -count } },
    });
  }

  logger.success('Xóa (lưu trữ) hàng loạt hồ sơ', {
    action: 'bulk_delete_applications',
    count: result.count,
    ids,
  });
  return { success: true };
}

module.exports = {
  getDashboardStats,
  getJobs,
  getJob,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  getCandidateProfile,
  bulkDeleteApplications,
};
