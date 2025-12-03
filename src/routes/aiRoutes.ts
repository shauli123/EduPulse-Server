import express from 'express';
import { chatWithAI, createQuiz, getExplanation } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/chat', protect, chatWithAI);
router.post('/quiz', protect, createQuiz);
router.post('/explain', protect, getExplanation);

export default router;
