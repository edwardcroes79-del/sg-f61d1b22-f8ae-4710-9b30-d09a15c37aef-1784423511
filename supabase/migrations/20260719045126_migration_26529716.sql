CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_slug text NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  FOREIGN KEY (vehicle_slug) REFERENCES vehicles(slug) ON DELETE CASCADE
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete_own" ON push_subscriptions FOR DELETE USING (true);
CREATE POLICY "public_read" ON push_subscriptions FOR SELECT USING (true);