import express from 'express';
import { getCourses, getCourseById, createCourse, updateProgress, generateAICourse, getCourseWithLessons, submitQuizAnswer } from '../controllers/courseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getCourses).post(protect, createCourse);
router.route('/:id').get(protect, getCourseById);
router.route('/:id/progress').post(protect, updateProgress);

// AI Course Generation Routes
router.post('/generate', protect, generateAICourse);
router.get('/:id/lessons', protect, getCourseWithLessons);
router.post('/:courseId/lessons/:lessonId/quiz', protect, submitQuizAnswer);

export default router;
