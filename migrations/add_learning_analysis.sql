-- Migration: Add learningAnalysis to existing users' preferences
-- This updates all existing users to include the learningAnalysis field

UPDATE users
SET preferences = jsonb_set(
  COALESCE(preferences, '{}'::jsonb),
  '{learningAnalysis}',
  '""'::jsonb,
  true
)
WHERE preferences IS NULL OR NOT preferences ? 'learningAnalysis';
