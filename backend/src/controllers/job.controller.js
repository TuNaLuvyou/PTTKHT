/**
 * JobController — plain-JS port of backend/src/jobs/jobs.controller.ts
 *
 * Route protection (verifyToken / authorizeRoles) is applied in
 * routes/job.routes.js. The candidate-only checks that lived inside the
 * controller are kept here, since they are business rules.
 *
 * Status codes match NestJS: POST → 201, GET/PATCH/DELETE → 200.
 */
const jobService = require('../services/job.service');
const { HttpError } = require('../utils/httpError');
const { validateCreateJob, validateUpdateJob } = require('../validators/job.validator');

// GET /api/jobs
async function findAll(req, res, next) {
  try {
    res.json(await jobService.findAll(req.query));
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/categories
async function getCategories(req, res, next) {
  try {
    res.json(await jobService.getCategories());
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/my-applications
async function getMyApplications(req, res, next) {
  try {
    res.json(await jobService.getMyApplications(req.user._id));
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/my-saved-jobs
async function getSavedJobs(req, res, next) {
  try {
    res.json(await jobService.getSavedJobs(req.user._id));
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/:id
async function findOne(req, res, next) {
  try {
    res.json(await jobService.findOne(req.params.id));
  } catch (err) {
    next(err);
  }
}

// POST /api/jobs/:id/save
async function toggleSave(req, res, next) {
  try {
    if (req.user.role !== 'candidate') {
      throw HttpError.forbidden('Chỉ ứng viên mới có thể lưu công việc');
    }
    const result = await jobService.toggleSaveJob(req.params.id, req.user._id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/jobs/:id/apply   (multipart/form-data, field `cv`)
async function apply(req, res, next) {
  try {
    if (req.user.role !== 'candidate') {
      throw HttpError.forbidden('Chỉ ứng viên mới được ứng tuyển vào công việc');
    }
    const result = await jobService.apply(
      req.params.id,
      req.user._id,
      req.body,
      req.file,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/jobs
async function create(req, res, next) {
  try {
    const dto = validateCreateJob(req.body);
    const result = await jobService.create(dto, req.user._id.toString());
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/jobs/:id
async function update(req, res, next) {
  try {
    const dto = validateUpdateJob(req.body);
    const result = await jobService.update(
      req.params.id,
      dto,
      req.user._id.toString(),
      req.user.role,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/jobs/:id
async function remove(req, res, next) {
  try {
    const result = await jobService.remove(
      req.params.id,
      req.user._id.toString(),
      req.user.role,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/jobs/seed   (admin only)
async function seed(req, res, next) {
  try {
    res.status(201).json(await jobService.seedData());
  } catch (err) {
    next(err);
  }
}

module.exports = {
  findAll,
  getCategories,
  getMyApplications,
  getSavedJobs,
  findOne,
  toggleSave,
  apply,
  create,
  update,
  remove,
  seed,
};
