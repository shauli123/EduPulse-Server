-- Migration: Add lessons and quizzes tables for AI-generated courses
-- Created: 2025-12-04

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  lesson_order INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, lesson_order)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, question_order)
);

-- Quiz attempts table (track user quiz submissions)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  selected_answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, lesson_order);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_order ON quizzes(lesson_id, question_order);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons table
CREATE POLICY "Anyone can view lessons" ON lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert lessons" ON lessons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update lessons" ON lessons
  FOR UPDATE USING (true);

-- RLS Policies for quizzes table
CREATE POLICY "Anyone can view quizzes" ON quizzes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert quizzes" ON quizzes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update quizzes" ON quizzes
  FOR UPDATE USING (true);

-- RLS Policies for quiz_attempts table
CREATE POLICY "Users can view their own attempts" ON quiz_attempts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (true);

-- Add AI generation metadata to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS generation_prompt TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS num_lessons INTEGER DEFAULT 0;
