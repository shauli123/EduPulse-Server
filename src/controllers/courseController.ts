import { Request, Response } from 'express';
import Course from '../models/Course';
import Progress from '../models/Progress';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find({});
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
        const course = await Course.findById(req.params.id);
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
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
        const course = new Course({
            title,
            subject,
            gradeLevel,
            topics,
            createdBy: req.user?._id,
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
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
    const userId = req.user?._id;

    try {
        let progress = await Progress.findOne({ user: userId, course: courseId });

        if (!progress) {
            progress = new Progress({
                user: userId,
                course: courseId,
                completedLessons: [],
                quizScores: [],
            });
        }

        if (lessonId && !progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
        }

        if (quizScore) {
            progress.quizScores.push({
                quizId: lessonId, // Assuming quiz is tied to lesson for now
                score: quizScore,
                date: new Date(),
            });
        }

        await progress.save();
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
