import { Request, Response } from 'express';
import { generateContent, generateQuiz, explainConcept } from '../services/geminiService';

export const chatWithAI = async (req: Request, res: Response) => {
    const { message } = req.body;
    try {
        const response = await generateContent(message);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ message: 'AI Chat failed' });
    }
};

export const createQuiz = async (req: Request, res: Response) => {
    const { topic, difficulty } = req.body;
    try {
        const quiz = await generateQuiz(topic, difficulty);
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Quiz generation failed' });
    }
};

export const getExplanation = async (req: Request, res: Response) => {
    const { concept, level } = req.body;
    try {
        const explanation = await explainConcept(concept, level);
        res.json({ explanation });
    } catch (error) {
        res.status(500).json({ message: 'Explanation failed' });
    }
};
