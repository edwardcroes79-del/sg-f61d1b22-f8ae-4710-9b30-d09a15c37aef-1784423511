-- Make mileage optional to match the UI and prevent NOT NULL failures
ALTER TABLE service_records ALTER COLUMN mileage DROP NOT NULL;