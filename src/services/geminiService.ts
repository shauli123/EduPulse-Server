import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateContent = async (prompt: string): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating content with Gemini:', error);
        throw new Error('Failed to generate content');
    }
};

export const generateQuiz = async (topic: string, difficulty: string, language: string = 'Hebrew'): Promise<any> => {
    const prompt = `
    Generate a quiz about "${topic}" with difficulty "${difficulty}".
    Language: ${language}.
    Format: JSON array of objects with fields: question, options (array of 4 strings), correctOptionIndex (number), explanation.
    Do not include markdown code blocks, just the raw JSON.
  `;

    try {
        const text = await generateContent(prompt);
        // Clean up if markdown code blocks are present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error('Error generating quiz:', error);
        throw new Error('Failed to generate quiz');
    }
};

export const explainConcept = async (concept: string, level: string, language: string = 'Hebrew'): Promise<string> => {
    const prompt = `
    Explain the concept "${concept}" for a student at level "${level}".
    Language: ${language}.
    Provide a clear, concise explanation with an example.
  `;
    return await generateContent(prompt);
};
