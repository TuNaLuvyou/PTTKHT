/**
 * EmployerController — plain-JS port of backend/src/employer/employer.controller.ts
 *
 * The whole controller is protected by `verifyToken` + `authorizeRoles(
 * 'employer', 'admin')` (mirrors the class-level guards in Nest).
 *
 * Status codes: POST → 201, GET/PATCH/DELETE → 200.
 */
const employerService = require('../services/employer.service');
const {
  validateUpdateApplicationStatus,
  validateBulkDeleteApplications,
} = require('../validators/employer.validator');

// GET /api/employer/dashboard/stats
async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    res.json(await employerService.getDashboardStats(userId));
  } catch (err) {
    next(err);
  }
}

// GET /api/employer/jobs
async function getJobs(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    res.json(await employerService.getJobs(userId));
  } catch (err) {
    next(err);
  }
}

// GET /api/employer/jobs/:id
async function getJob(req, res, next) {
  try {
    res.json(await employerService.getJob(req.params.id));
  } catch (err) {
    next(err);
  }
}

// GET /api/employer/jobs/:id/applications
async function getApplications(req, res, next) {
  try {
    res.json(await employerService.getApplications(req.params.id));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/employer/applications/:id/status
async function updateStatus(req, res, next) {
  try {
    const dto = validateUpdateApplicationStatus(req.body);
    res.json(await employerService.updateApplicationStatus(req.params.id, dto.status));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/employer/applications/:id
async function deleteApplication(req, res, next) {
  try {
    res.json(await employerService.deleteApplication(req.params.id));
  } catch (err) {
    next(err);
  }
}

// POST /api/employer/applications/bulk-delete
async function bulkDeleteApplications(req, res, next) {
  try {
    const dto = validateBulkDeleteApplications(req.body);
    res.status(201).json(await employerService.bulkDeleteApplications(dto.ids));
  } catch (err) {
    next(err);
  }
}

// GET /api/employer/candidates/:id/profile
async function getCandidateProfile(req, res, next) {
  try {
    res.json(await employerService.getCandidateProfile(req.params.id));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getJobs,
  getJob,
  getApplications,
  updateStatus,
  deleteApplication,
  bulkDeleteApplications,
  getCandidateProfile,
};
