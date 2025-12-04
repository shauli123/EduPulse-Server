import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, xp, level, role')
            .order('xp', { ascending: false })
            .limit(10);

        if (error) {
            res.status(500).json({ message: 'Server Error', error });
            return;
        }

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
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user?.id)
            .single();

        if (fetchError || !user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const newXp = user.xp + xpToAdd;

        // Simple level up logic: Level = floor(sqrt(XP / 100)) + 1
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
                xp: newXp,
                level: newLevel,
            })
            .eq('id', req.user?.id)
            .select('xp, level')
            .single();

        if (updateError || !updatedUser) {
            res.status(500).json({ message: 'Server Error', error: updateError });
            return;
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updateUserPreferences = async (req: AuthRequest, res: Response) => {
    const { learningStyle, difficulty, learningAnalysis } = req.body;

    try {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('preferences')
            .eq('id', req.user?.id)
            .single();

        if (fetchError || !user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Merge new preferences with existing ones
        const updatedPreferences = {
            ...user.preferences,
            ...(learningStyle && { learningStyle }),
            ...(difficulty && { difficulty }),
            ...(learningAnalysis !== undefined && { learningAnalysis }),
        };

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ preferences: updatedPreferences })
            .eq('id', req.user?.id)
            .select('preferences')
            .single();

        if (updateError || !updatedUser) {
            res.status(500).json({ message: 'Server Error', error: updateError });
            return;
        }

        res.json(updatedUser.preferences);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
