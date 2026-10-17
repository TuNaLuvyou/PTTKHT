// AdminController — plain-JS port of
// backend/src/admin/admin.controller.ts
//
// The old controller had class-level guards:
//   @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin')
// so every route requires a token + admin role (applied in routes/admin.routes.js).
//
// Status codes match NestJS defaults: POST -> 201, GET/PATCH/DELETE -> 200.

const adminService = require('../services/admin.service');
const {
  validateUpdateUserStatus,
  validateUpdateJobStatus,
  validateToggleJobFeatured,
  validateCreateNotification,
} = require('../validators/admin.validator');

// ─── Dashboard ────────────────────────────────────────────────────────

async function getDashboard(req, res, next) {
  try {
    res.json(await adminService.getDashboardStats());
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const [stats, activities] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getRecentActivities(),
    ]);
    res.json({ ...stats, recentActivities: activities });
  } catch (err) {
    next(err);
  }
}

// ─── Users ────────────────────────────────────────────────────────────

async function getUsers(req, res, next) {
  try {
    res.json(await adminService.getUsers(req.query));
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    res.json(await adminService.getUser(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const dto = validateUpdateUserStatus(req.body);
    res.json(
      await adminService.updateUserStatus(req.params.id, dto.status, dto.reason),
    );
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    res.json(await adminService.deleteUser(req.params.id));
  } catch (err) {
    next(err);
  }
}

// ─── Jobs ─────────────────────────────────────────────────────────────

async function getJobs(req, res, next) {
  try {
    res.json(await adminService.getAdminJobs(req.query));
  } catch (err) {
    next(err);
  }
}

async function updateJobStatus(req, res, next) {
  try {
    const dto = validateUpdateJobStatus(req.body);
    res.json(await adminService.updateJobStatus(req.params.id, dto.status));
  } catch (err) {
    next(err);
  }
}

async function toggleJobFeatured(req, res, next) {
  try {
    const dto = validateToggleJobFeatured(req.body);
    res.json(
      await adminService.toggleJobFeatured(req.params.id, dto.featured),
    );
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    res.json(await adminService.deleteJob(req.params.id));
  } catch (err) {
    next(err);
  }
}

// ─── CV Scores ────────────────────────────────────────────────────────

async function getCVScores(req, res, next) {
  try {
    res.json(await adminService.getCVScores(req.query));
  } catch (err) {
    next(err);
  }
}

async function deleteCVScore(req, res, next) {
  try {
    res.json(await adminService.deleteCVScore(req.params.id));
  } catch (err) {
    next(err);
  }
}

// ─── Notifications ────────────────────────────────────────────────────

async function getNotifications(req, res, next) {
  try {
    res.json(
      await adminService.getNotifications(req.user._id.toString(), req.query),
    );
  } catch (err) {
    next(err);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    res.json(await adminService.markNotificationRead(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function markAllNotificationsRead(req, res, next) {
  try {
    res
      .status(201)
      .json(await adminService.markAllNotificationsRead(req.user._id.toString()));
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    res.json(await adminService.deleteNotification(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function createNotification(req, res, next) {
  try {
    const dto = validateCreateNotification(req.body);
    res.status(201).json(await adminService.createNotification(dto));
  } catch (err) {
    next(err);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────

async function getSettings(req, res, next) {
  try {
    res.json(await adminService.getSettings());
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    res.json(await adminService.updateSettings(req.params.section, req.body));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getReports,
  getUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  getJobs,
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
