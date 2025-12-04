import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateContent = async (prompt: string): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

// ============ AI Course Generation Functions ============

interface CourseOutline {
    title: string;
    description: string;
    lessons: {
        title: string;
        topics: string[];
    }[];
}

interface Lesson {
    title: string;
    content: string;
    durationMinutes: number;
}

interface Quiz {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

/**
 * Generate a comprehensive course outline based on a subject
 */
export const generateCourseOutline = async (
    subject: string,
    numLessons: number = 5,
    language: string = 'English'
): Promise<CourseOutline> => {
    const prompt = `
You are an expert educational content creator. Generate a comprehensive course outline for the subject: "${subject}".

Requirements:
- Create exactly ${numLessons} lessons
- Each lesson should cover distinct topics that build upon each other
- The course should be suitable for beginners to intermediate learners
- Language: ${language}
- Include a course title and description

Return ONLY a JSON object with this exact structure (no markdown code blocks):
{
  "title": "Course Title",
  "description": "Brief course description (2-3 sentences)",
  "lessons": [
    {
      "title": "Lesson 1 Title",
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    }
  ]
}
`;

    try {
        const text = await generateContent(prompt);
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error('Error generating course outline:', error);
        throw new Error('Failed to generate course outline');
    }
};

/**
 * Generate detailed lesson content
 */
export const generateLesson = async (
    lessonTitle: string,
    topics: string[],
    courseContext: string,
    language: string = 'English'
): Promise<Lesson> => {
    const prompt = `
You are an expert educator creating bite-sized, engaging lesson content.

Course Context: ${courseContext}
Lesson Title: ${lessonTitle}
Topics to Cover: ${topics.join(', ')}
Language: ${language}

Create comprehensive lesson content that:
1. Introduces the topic clearly
2. Explains key concepts with examples
3. Uses analogies and real-world applications
4. Breaks down complex ideas into digestible parts
5. Is engaging and educational
6. Is approximately 500-800 words

IMPORTANT: Return the content in the following strict format:

TITLE: ${lessonTitle}
DURATION: 10
CONTENT:
[Start of content]
... content goes here ...
[End of content]
`;

    try {
        const text = await generateContent(prompt);

        // Parse the custom text format
        const titleMatch = text.match(/TITLE:\s*(.+)/);
        const durationMatch = text.match(/DURATION:\s*(\d+)/);
        const contentMatch = text.match(/CONTENT:\s*\[Start of content\]([\s\S]*)\[End of content\]/);

        if (!contentMatch) {
            throw new Error('Failed to parse lesson content format');
        }

        return {
            title: titleMatch ? titleMatch[1].trim() : lessonTitle,
            durationMinutes: durationMatch ? parseInt(durationMatch[1]) : 10,
            content: contentMatch[1].trim()
        };
    } catch (error) {
        console.error('Error generating lesson:', error);
        throw new Error('Failed to generate lesson');
    }
};

/**
 * Generate quiz questions for a specific lesson
 */
export const generateLessonQuiz = async (
    lessonTitle: string,
    lessonContent: string,
    numQuestions: number = 3,
    language: string = 'English'
): Promise<Quiz[]> => {
    const prompt = `
You are an expert at creating educational quiz questions.

Lesson Title: ${lessonTitle}
Lesson Content: ${lessonContent.substring(0, 1000)}...

Create ${numQuestions} multiple-choice quiz questions that:
1. Test understanding of key concepts from the lesson
2. Have 4 answer options each
3. Include clear explanations for the correct answer
4. Range from easy to moderate difficulty
5. Language: ${language}

IMPORTANT: Return ONLY a valid JSON array. Properly escape all special characters (use \\n for newlines, \\" for quotes).

Return this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Explanation of why this answer is correct"
  }
]
`;

    try {
        const text = await generateContent(prompt);
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error('Error generating lesson quiz:', error);
        throw new Error('Failed to generate lesson quiz');
    }
};

/**
 * Generate a complete course with lessons and quizzes
 */
export const generateCompleteCourse = async (
    subject: string,
    numLessons: number = 5,
    questionsPerLesson: number = 3,
    language: string = 'English'
): Promise<{
    outline: CourseOutline;
    lessons: Array<{ lesson: Lesson; quizzes: Quiz[] }>;
}> => {
    try {
        console.log(`Generating course outline for: ${subject}`);
        const outline = await generateCourseOutline(subject, numLessons, language);

        console.log(`Generating ${numLessons} lessons with quizzes...`);
        const lessons = [];

        for (let i = 0; i < outline.lessons.length; i++) {
            const lessonOutline = outline.lessons[i];
            console.log(`Generating lesson ${i + 1}: ${lessonOutline.title}`);

            // Generate lesson content
            const lesson = await generateLesson(
                lessonOutline.title,
                lessonOutline.topics,
                outline.description,
                language
            );

            // Generate quiz for the lesson
            const quizzes = await generateLessonQuiz(
                lesson.title,
                lesson.content,
                questionsPerLesson,
                language
            );

            lessons.push({ lesson, quizzes });

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('Course generation completed successfully');
        return { outline, lessons };
    } catch (error) {
        console.error('Error generating complete course:', error);
        throw new Error('Failed to generate complete course');
    }
};
