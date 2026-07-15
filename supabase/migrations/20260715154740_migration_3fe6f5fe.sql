-- Add powered_by column to workshops
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS powered_by TEXT;