import { Router, Request, Response } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Get user settings
router.get('/settings', userController.getUserSettings);

// Update user settings
router.put('/settings', userController.updateUserSettings);

// Get user profile
router.get('/profile', userController.getUserProfile);

// Update user profile
router.put('/profile', userController.updateUserProfile);

export default router;
