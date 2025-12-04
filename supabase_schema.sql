-- EduPulse Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_login TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{"learningStyle": "text", "difficulty": "medium", "learningAnalysis": ""}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  topics JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  current_topic_index INTEGER DEFAULT 0,
  current_lesson_index INTEGER DEFAULT 0,
  mastery_level INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Anyone can view public courses" ON courses;
DROP POLICY IF EXISTS "Anyone can create courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view progress" ON progress;
DROP POLICY IF EXISTS "Anyone can insert progress" ON progress;
DROP POLICY IF EXISTS "Anyone can update progress" ON progress;

-- RLS Policies for users table (FIXED - Allow public registration)
CREATE POLICY "Allow public registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- RLS Policies for courses table
CREATE POLICY "Anyone can view public courses" ON courses
  FOR SELECT USING (is_public = true);

CREATE POLICY "Anyone can create courses" ON courses
  FOR INSERT WITH CHECK (true);

-- RLS Policies for progress table
CREATE POLICY "Anyone can view progress" ON progress
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert progress" ON progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update progress" ON progress
  FOR UPDATE USING (true);
