-- Add slug column to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Backfill existing vehicles with unique slugs
UPDATE vehicles 
SET slug = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE slug IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE vehicles ALTER COLUMN slug SET NOT NULL;