import express from 'express';
import { getLeaderboard, updateUserXP } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);
router.put('/xp', protect, updateUserXP);

export default router;
