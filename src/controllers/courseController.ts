import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateCompleteCourse } from '../services/geminiService';

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

// ============ AI Course Generation Endpoints ============

// @desc    Generate AI course with lessons and quizzes
// @route   POST /api/courses/generate
// @access  Private
export const generateAICourse = async (req: AuthRequest, res: Response) => {
    try {
        const { subject, numLessons = 5, questionsPerLesson = 3, language = 'English' } = req.body;

        if (!subject) {
            res.status(400).json({ message: 'Subject is required' });
            return;
        }

        console.log(`Starting AI course generation for: ${subject}`);

        // Generate course content using Gemini
        const { outline, lessons } = await generateCompleteCourse(
            subject,
            numLessons,
            questionsPerLesson,
            language
        );

        // Create course in database
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert([{
                title: outline.title,
                description: outline.description,
                subject: subject,
                grade_level: 1, // Default grade level
                is_ai_generated: true,
                generation_prompt: subject,
                num_lessons: numLessons,
                created_by: req.user?.id,
            }])
            .select()
            .single();

        if (courseError || !course) {
            console.error('Error creating course:', courseError);
            res.status(500).json({ message: 'Failed to create course', error: courseError });
            return;
        }

        console.log(`Course created with ID: ${course.id}`);

        // Insert lessons and quizzes
        for (let i = 0; i < lessons.length; i++) {
            const { lesson, quizzes } = lessons[i];

            // Insert lesson
            const { data: lessonData, error: lessonError } = await supabase
                .from('lessons')
                .insert([{
                    course_id: course.id,
                    title: lesson.title,
                    content: lesson.content,
                    lesson_order: i + 1,
                    duration_minutes: lesson.durationMinutes,
                }])
                .select()
                .single();

            if (lessonError || !lessonData) {
                console.error('Error creating lesson:', lessonError);
                continue;
            }

            // Insert quizzes for this lesson
            const quizInserts = quizzes.map((quiz, qIndex) => ({
                lesson_id: lessonData.id,
                question: quiz.question,
                options: quiz.options,
                correct_answer_index: quiz.correctAnswerIndex,
                explanation: quiz.explanation,
                question_order: qIndex + 1,
            }));

            const { error: quizError } = await supabase
                .from('quizzes')
                .insert(quizInserts);

            if (quizError) {
                console.error('Error creating quizzes:', quizError);
            }
        }

        console.log('Course generation completed successfully');
        res.status(201).json({
            message: 'Course generated successfully',
            course,
        });
    } catch (error) {
        console.error('Error generating AI course:', error);
        res.status(500).json({ message: 'Failed to generate course', error: String(error) });
    }
};

// @desc    Get course with all lessons and quizzes
// @route   GET /api/courses/:id/lessons
// @access  Private
export const getCourseWithLessons = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id;

        // Get course
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (courseError || !course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        // Get lessons
        const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('lesson_order', { ascending: true });

        if (lessonsError) {
            res.status(500).json({ message: 'Error fetching lessons', error: lessonsError });
            return;
        }

        // Get quizzes for all lessons
        const lessonsWithQuizzes = await Promise.all(
            (lessons || []).map(async (lesson) => {
                const { data: quizzes, error: quizzesError } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('lesson_id', lesson.id)
                    .order('question_order', { ascending: true });

                if (quizzesError) {
                    console.error('Error fetching quizzes:', quizzesError);
                    return { ...lesson, quizzes: [] };
                }

                return { ...lesson, quizzes: quizzes || [] };
            })
        );

        res.json({
            ...course,
            lessons: lessonsWithQuizzes,
        });
    } catch (error) {
        console.error('Error fetching course with lessons:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit quiz answer
// @route   POST /api/courses/:courseId/lessons/:lessonId/quiz
// @access  Private
export const submitQuizAnswer = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, lessonId } = req.params;
        const { quizId, selectedAnswerIndex } = req.body;
        const userId = req.user?.id;

        if (!quizId || selectedAnswerIndex === undefined) {
            res.status(400).json({ message: 'Quiz ID and selected answer are required' });
            return;
        }

        // Get the quiz to check correct answer
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

        if (quizError || !quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        const isCorrect = quiz.correct_answer_index === selectedAnswerIndex;

        // Record the attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('quiz_attempts')
            .insert([{
                user_id: userId,
                quiz_id: quizId,
                selected_answer_index: selectedAnswerIndex,
                is_correct: isCorrect,
            }])
            .select()
            .single();

        if (attemptError) {
            console.error('Error recording quiz attempt:', attemptError);
            res.status(500).json({ message: 'Error recording attempt' });
            return;
        }

        res.json({
            isCorrect,
            correctAnswerIndex: quiz.correct_answer_index,
            explanation: quiz.explanation,
            attempt,
        });
    } catch (error) {
        console.error('Error submitting quiz answer:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

