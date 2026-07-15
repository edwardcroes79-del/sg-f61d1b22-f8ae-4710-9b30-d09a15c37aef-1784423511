-- Create SECURITY DEFINER function for vehicle ownership
CREATE OR REPLACE FUNCTION user_owns_vehicle_by_id(vehicle_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicles v
    JOIN workshops w ON w.id = v.workshop_id
    WHERE v.id = vehicle_id AND w.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace vehicles RLS policies with SECURITY DEFINER based policies
DROP POLICY IF EXISTS "select_workshop_vehicles" ON vehicles;
DROP POLICY IF EXISTS "insert_workshop_vehicles" ON vehicles;
DROP POLICY IF EXISTS "update_workshop_vehicles" ON vehicles;
DROP POLICY IF EXISTS "delete_workshop_vehicles" ON vehicles;

CREATE POLICY "select_vehicles" ON vehicles FOR SELECT USING (user_owns_vehicle_by_id(id) OR true);
CREATE POLICY "insert_vehicles" ON vehicles FOR INSERT WITH CHECK (user_owns_vehicle_by_id(id));
CREATE POLICY "update_vehicles" ON vehicles FOR UPDATE USING (user_owns_vehicle_by_id(id));
CREATE POLICY "delete_vehicles" ON vehicles FOR DELETE USING (user_owns_vehicle_by_id(id));