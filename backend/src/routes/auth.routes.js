/**
 * Auth routes — mounted at `/api/auth` (global prefix `api` + `auth` path).
 *
 * Paths match backend/src/auth/auth.controller.ts 1:1.
 * `verifyToken` replaces `@UseGuards(JwtAuthGuard)`.
 */
const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', verifyToken, authController.getProfile);
router.patch('/me', verifyToken, authController.updateProfile);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
