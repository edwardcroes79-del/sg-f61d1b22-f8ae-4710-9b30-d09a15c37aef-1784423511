-- Allow anonymous/public read access to customer names for QR scans
DROP POLICY IF EXISTS "public_read_customers" ON customers;
CREATE POLICY "public_read_customers" ON customers FOR SELECT TO anon, authenticated USING (true);