import { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout (requires authentication)
router.post('/logout', authMiddleware, authController.logout);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
