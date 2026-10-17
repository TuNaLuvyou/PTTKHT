/**
 * Employer routes — mounted at `/api/employer`.
 *
 * The old controller had class-level guards:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('employer', 'admin')
 * so EVERY route here requires a token + employer/admin role.
 */
const express = require('express');
const {
  verifyToken,
  authorizeRoles,
} = require('../middlewares/auth.middleware');
const employerController = require('../controllers/employer.controller');

const router = express.Router();

// Class-level guards
router.use(verifyToken, authorizeRoles('employer', 'admin'));

router.get('/dashboard/stats', employerController.getDashboardStats);
router.get('/jobs', employerController.getJobs);
router.get('/jobs/:id', employerController.getJob);
router.get('/jobs/:id/applications', employerController.getApplications);

router.patch('/applications/:id/status', employerController.updateStatus);
router.delete('/applications/:id', employerController.deleteApplication);
router.post(
  '/applications/bulk-delete',
  employerController.bulkDeleteApplications,
);

router.get('/candidates/:id/profile', employerController.getCandidateProfile);

module.exports = router;
