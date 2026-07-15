-- Fix RLS policies for service_records to use auth.uid() explicitly
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_service_records" ON service_records;
DROP POLICY IF EXISTS "update_own_service_records" ON service_records;
DROP POLICY IF EXISTS "delete_own_service_records" ON service_records;

CREATE POLICY "insert_own_service_records" ON service_records
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN workshops w ON w.id = v.workshop_id
    WHERE v.id = service_records.vehicle_id
    AND w.user_id = auth.uid()
  )
);

CREATE POLICY "update_own_service_records" ON service_records
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN workshops w ON w.id = v.workshop_id
    WHERE v.id = service_records.vehicle_id
    AND w.user_id = auth.uid()
  )
);

CREATE POLICY "delete_own_service_records" ON service_records
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN workshops w ON w.id = v.workshop_id
    WHERE v.id = service_records.vehicle_id
    AND w.user_id = auth.uid()
  )
);