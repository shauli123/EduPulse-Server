import express from 'express';
import { getCourses, getCourseById, createCourse, updateProgress } from '../controllers/courseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getCourses).post(protect, createCourse);
router.route('/:id').get(protect, getCourseById);
router.route('/:id/progress').post(protect, updateProgress);

export default router;
