-- Allow anonymous/public read access to workshop branding for QR scans
DROP POLICY IF EXISTS "public_read_workshop" ON workshops;
CREATE POLICY "public_read_workshop" ON workshops FOR SELECT TO anon, authenticated USING (true);