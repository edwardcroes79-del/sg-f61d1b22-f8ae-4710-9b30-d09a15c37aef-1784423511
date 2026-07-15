-- Add social_linkedin column to workshops
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS social_linkedin TEXT;