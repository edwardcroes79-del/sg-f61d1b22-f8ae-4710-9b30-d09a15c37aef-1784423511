-- Replace all service_records RLS policies with SECURITY DEFINER based policies
DROP POLICY IF EXISTS "delete_own_service_records" ON service_records;
DROP POLICY IF EXISTS "delete_workshop_service_records" ON service_records;
DROP POLICY IF EXISTS "insert_own_service_records" ON service_records;
DROP POLICY IF EXISTS "insert_workshop_service_records" ON service_records;
DROP POLICY IF EXISTS "select_workshop_service_records" ON service_records;
DROP POLICY IF EXISTS "update_own_service_records" ON service_records;
DROP POLICY IF EXISTS "update_workshop_service_records" ON service_records;

-- Recreate ownership helper as SECURITY DEFINER
CREATE OR REPLACE FUNCTION user_owns_vehicle(vehicle_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
BEGIN
  SELECT workshops.user_id INTO owner_id
  FROM vehicles
  JOIN workshops ON workshops.id = vehicles.workshop_id
  WHERE vehicles.id = vehicle_uuid;
  
  RETURN owner_id = auth.uid();
END;
$$;

ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_service_records" ON service_records
FOR SELECT USING (user_owns_vehicle(vehicle_id));

CREATE POLICY "insert_service_records" ON service_records
FOR INSERT WITH CHECK (user_owns_vehicle(vehicle_id));

CREATE POLICY "update_service_records" ON service_records
FOR UPDATE USING (user_owns_vehicle(vehicle_id));

CREATE POLICY "delete_service_records" ON service_records
FOR DELETE USING (user_owns_vehicle(vehicle_id));