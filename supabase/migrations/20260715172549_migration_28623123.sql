-- Allow anonymous/public read access to service records for QR scans
DROP POLICY IF EXISTS "public_read_service_records" ON service_records;
CREATE POLICY "public_read_service_records" ON service_records FOR SELECT TO anon, authenticated USING (true);