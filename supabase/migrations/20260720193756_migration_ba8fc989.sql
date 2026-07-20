CREATE TABLE IF NOT EXISTS reminder_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  email text NOT NULL,
  one_day boolean NOT NULL DEFAULT true,
  one_week boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(vehicle_id, email)
);

CREATE TABLE IF NOT EXISTS reminder_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  preference_id uuid REFERENCES reminder_preferences(id) ON DELETE SET NULL,
  email text NOT NULL,
  lead_time text NOT NULL,
  status text NOT NULL,
  error_message text,
  sent_at timestamp with time zone DEFAULT now()
);

ALTER TABLE reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_preferences" ON reminder_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_preferences" ON reminder_preferences FOR SELECT USING (true);

CREATE POLICY "auth_read_deliveries" ON reminder_deliveries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_deliveries" ON reminder_deliveries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);