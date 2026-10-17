/**
 * Admin routes — mounted at `/api/admin`.
 *
 * The old controller had class-level guards:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 * so EVERY route here requires a token + the `admin` role.
 *
 * Order of the notification routes mirrors the controller declaration order
 * (`POST /notifications/read-all` is declared before `POST /notifications`,
 * although the paths don't collide anyway).
 */
const express = require('express');
const {
  verifyToken,
  authorizeRoles,
} = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Class-level guards
router.use(verifyToken, authorizeRoles('admin'));

// ── Dashboard ─────────────────────────────────────────────────────────
router.get('/dashboard', adminController.getDashboard);
router.get('/reports', adminController.getReports);

// ── Users ─────────────────────────────────────────────────────────────
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ── Jobs ──────────────────────────────────────────────────────────────
router.get('/jobs', adminController.getJobs);
router.patch('/jobs/:id/status', adminController.updateJobStatus);
router.patch('/jobs/:id/featured', adminController.toggleJobFeatured);
router.delete('/jobs/:id', adminController.deleteJob);

// ── CV Scores ─────────────────────────────────────────────────────────
router.get('/cv-scores', adminController.getCVScores);
router.delete('/cv-scores/:id', adminController.deleteCVScore);

// ── Notifications ─────────────────────────────────────────────────────
router.get('/notifications', adminController.getNotifications);
router.post('/notifications/read-all', adminController.markAllNotificationsRead);
router.post('/notifications', adminController.createNotification);
router.patch('/notifications/:id/read', adminController.markNotificationRead);
router.delete('/notifications/:id', adminController.deleteNotification);

// ── Settings ──────────────────────────────────────────────────────────
router.get('/settings', adminController.getSettings);
router.patch('/settings/:section', adminController.updateSettings);

module.exports = router;
