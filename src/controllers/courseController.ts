import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req: Request, res: Response) => {
    try {
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_public', true);

        if (error) {
            res.status(500).json({ message: 'Server Error', error });
            return;
        }

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { data: course, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Teacher
export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { title, subject, gradeLevel, topics } = req.body;

        const { data: course, error } = await supabase
            .from('courses')
            .insert([{
                title,
                subject,
                grade_level: gradeLevel,
                topics,
                created_by: req.user?.id,
            }])
            .select()
            .single();

        if (error || !course) {
            res.status(400).json({ message: 'Invalid course data', error });
            return;
        }

        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: 'Invalid course data' });
    }
};

// @desc    Update progress
// @route   POST /api/courses/:id/progress
// @access  Private
export const updateProgress = async (req: AuthRequest, res: Response) => {
    const { lessonId, quizScore } = req.body;
    const courseId = req.params.id;
    const userId = req.user?.id;

    try {
        // Check if progress exists
        const { data: existingProgress } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (existingProgress) {
            // Update existing progress
            const completedLessons = existingProgress.completed_lessons || [];
            const quizScores = existingProgress.quiz_scores || [];

            if (lessonId && !completedLessons.includes(lessonId)) {
                completedLessons.push(lessonId);
            }

            if (quizScore) {
                quizScores.push({
                    quizId: lessonId,
                    score: quizScore,
                    date: new Date().toISOString(),
                });
            }

            const { data: updatedProgress, error } = await supabase
                .from('progress')
                .update({
                    completed_lessons: completedLessons,
                    quiz_scores: quizScores,
                })
                .eq('id', existingProgress.id)
                .select()
                .single();

            if (error) {
                res.status(500).json({ message: 'Server Error', error });
                return;
            }

            res.json(updatedProgress);
        } else {
            // Create new progress
            const { data: newProgress, error } = await supabase
                .from('progress')
                .insert([{
                    user_id: userId,
                    course_id: courseId,
                    completed_lessons: lessonId ? [lessonId] : [],
                    quiz_scores: quizScore ? [{
                        quizId: lessonId,
                        score: quizScore,
                        date: new Date().toISOString(),
                    }] : [],
                }])
                .select()
                .single();

            if (error) {
                res.status(500).json({ message: 'Server Error', error });
                return;
            }

            res.json(newProgress);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
