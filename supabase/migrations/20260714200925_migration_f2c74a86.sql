-- Add public read policy for vehicles (QR code pages need anonymous access)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_vehicle_by_slug" ON vehicles FOR SELECT USING (true);

-- Create index on qr_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_qr_slug ON vehicles(qr_slug);

-- Create index on registration_number for search
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration_number);

-- Create index on customer_id for joins
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);

-- Create index on service_records vehicle_id for joins
CREATE INDEX IF NOT EXISTS idx_service_records_vehicle ON service_records(vehicle_id);