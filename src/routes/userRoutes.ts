import express from 'express';
import { getLeaderboard, updateUserXP, updateUserPreferences } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);
router.put('/xp', protect, updateUserXP);
router.put('/preferences', protect, updateUserPreferences);

export default router;
