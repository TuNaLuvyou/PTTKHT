/**
 * Job routes — mounted at `/api/jobs`.
 *
 * Path order matters (static routes BEFORE the `:id` param route), mirroring
 * the comment structure in the old controller.
 *
 * Guards mapping:
 *   @UseGuards(JwtAuthGuard)              → verifyToken
 *   @UseGuards(JwtAuthGuard, RolesGuard)  → verifyToken, authorizeRoles(...)
 *   @Roles('employer','admin'|'admin')    → authorizeRoles(...)
 */
const express = require('express');
const {
  verifyToken,
  authorizeRoles,
} = require('../middlewares/auth.middleware');
const { uploadSingleCv } = require('../middlewares/upload.middleware');
const jobController = require('../controllers/job.controller');

const router = express.Router();

// ── Public static routes (must be before :id) ─────────────────────────
router.get('/', jobController.findAll);
router.get('/categories', jobController.getCategories);

// ── Protected static routes (must be before :id) ──────────────────────
router.get('/my-applications', verifyToken, jobController.getMyApplications);
router.get('/my-saved-jobs', verifyToken, jobController.getSavedJobs);

// ── Admin only ────────────────────────────────────────────────────────
router.post('/seed', verifyToken, authorizeRoles('admin'), jobController.seed);

// ── Employer / admin ──────────────────────────────────────────────────
router.post(
  '/',
  verifyToken,
  authorizeRoles('employer', 'admin'),
  jobController.create,
);

// ── Parameterized routes (after all static routes) ────────────────────
router.get('/:id', jobController.findOne);

router.post('/:id/save', verifyToken, jobController.toggleSave);

router.post(
  '/:id/apply',
  verifyToken,
  uploadSingleCv,
  jobController.apply,
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('employer', 'admin'),
  jobController.update,
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('employer', 'admin'),
  jobController.remove,
);

module.exports = router;
