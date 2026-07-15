-- Update workshops RLS to use auth.uid() to match the ownership functions
ALTER TABLE workshops DISABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_workshop" ON workshops;
DROP POLICY IF EXISTS "insert_own_workshop" ON workshops;
DROP POLICY IF EXISTS "update_own_workshop" ON workshops;
DROP POLICY IF EXISTS "delete_own_workshop" ON workshops;

CREATE POLICY "select_own_workshop" ON workshops FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_workshop" ON workshops FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_workshop" ON workshops FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "delete_own_workshop" ON workshops FOR DELETE TO authenticated USING (user_id = auth.uid());