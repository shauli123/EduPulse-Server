import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const users = await User.find({})
            .sort({ xp: -1 })
            .limit(10)
            .select('name xp level role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user XP
// @route   PUT /api/users/xp
// @access  Private
export const updateUserXP = async (req: AuthRequest, res: Response) => {
    const { xpToAdd } = req.body;

    try {
        const user = await User.findById(req.user?._id);

        if (user) {
            user.xp += xpToAdd;

            // Simple level up logic: Level = floor(sqrt(XP / 100)) + 1
            const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
            if (newLevel > user.level) {
                user.level = newLevel;
                // Could add notification logic here
            }

            await user.save();
            res.json({ xp: user.xp, level: user.level });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
