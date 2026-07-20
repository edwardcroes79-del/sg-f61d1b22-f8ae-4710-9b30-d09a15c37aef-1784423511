DROP POLICY IF EXISTS insert_vehicles ON vehicles;

CREATE POLICY "insert_vehicles" ON vehicles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM workshops w
      WHERE w.id = vehicles.workshop_id
        AND w.user_id = auth.uid()
    )
  );