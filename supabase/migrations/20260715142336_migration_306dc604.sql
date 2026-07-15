-- Create SECURITY DEFINER helper function for vehicle ownership checks
CREATE OR REPLACE FUNCTION user_owns_vehicle(vehicle_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicles v
    JOIN workshops w ON w.id = v.workshop_id
    WHERE v.id = vehicle_uuid
    AND w.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate service_records policies using the helper
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_service_records" ON service_records;
DROP POLICY IF EXISTS "update_own_service_records" ON service_records;
DROP POLICY IF EXISTS "delete_own_service_records" ON service_records;

CREATE POLICY "insert_own_service_records" ON service_records
FOR INSERT WITH CHECK (user_owns_vehicle(vehicle_id));

CREATE POLICY "update_own_service_records" ON service_records
FOR UPDATE USING (user_owns_vehicle(vehicle_id));

CREATE POLICY "delete_own_service_records" ON service_records
FOR DELETE USING (user_owns_vehicle(vehicle_id));