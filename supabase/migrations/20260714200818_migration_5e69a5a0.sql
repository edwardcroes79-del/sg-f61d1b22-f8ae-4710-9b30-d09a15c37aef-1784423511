-- Create workshops table for branding settings
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#D97706',
  secondary_color TEXT DEFAULT '#64748B',
  background_image_url TEXT,
  footer_info TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_address TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vehicles table with unique QR slug
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  qr_slug TEXT UNIQUE NOT NULL,
  registration_number TEXT NOT NULL,
  vin TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  engine_size TEXT,
  fuel_type TEXT,
  transmission TEXT,
  current_mileage INTEGER,
  color TEXT,
  header_image_url TEXT,
  next_service_date DATE,
  next_service_mileage INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create service_records table
CREATE TABLE IF NOT EXISTS service_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  technician TEXT,
  work_performed TEXT,
  parts_replaced TEXT,
  fluids_changed TEXT,
  labour_notes TEXT,
  recommendations TEXT,
  invoice_number TEXT,
  total_cost NUMERIC(10,2),
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create service_images table
CREATE TABLE IF NOT EXISTS service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_record_id UUID NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  image_type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;

-- Workshops: user owns their workshop
CREATE POLICY "select_own_workshop" ON workshops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_workshop" ON workshops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_workshop" ON workshops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_workshop" ON workshops FOR DELETE USING (auth.uid() = user_id);

-- Customers: admin in workshop can manage
CREATE POLICY "select_workshop_customers" ON customers FOR SELECT USING (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = customers.workshop_id AND workshops.user_id = auth.uid())
);
CREATE POLICY "insert_workshop_customers" ON customers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = customers.workshop_id AND workshops.user_id = auth.uid())
);
CREATE POLICY "update_workshop_customers" ON customers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = customers.workshop_id AND workshops.user_id = auth.uid())
);
CREATE POLICY "delete_workshop_customers" ON customers FOR DELETE USING (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = customers.workshop_id AND workshops.user_id = auth.uid())
);

-- Vehicles: admin in workshop can manage, public can read via slug
CREATE POLICY "select_workshop_vehicles" ON vehicles FOR SELECT USING (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = vehicles.workshop_id AND workshops.user_id = auth.uid())
);
CREATE POLICY "insert_workshop_vehicles" ON vehicles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = vehicles.workshop_id AND workshops.user_id = auth.uid())
);
CREATE POLICY "update_workshop_vehicles" ON vehicles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = vehicles.workshop_id AND workshops.user_id = auth.uid())
);
CREATE POLICY "delete_workshop_vehicles" ON vehicles FOR DELETE USING (
  EXISTS (SELECT 1 FROM workshops WHERE workshops.id = vehicles.workshop_id AND workshops.user_id = auth.uid())
);

-- Service records: admin in workshop can manage
CREATE POLICY "select_workshop_service_records" ON service_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM vehicles 
    JOIN workshops ON workshops.id = vehicles.workshop_id 
    WHERE vehicles.id = service_records.vehicle_id AND workshops.user_id = auth.uid()
  )
);
CREATE POLICY "insert_workshop_service_records" ON service_records FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM vehicles 
    JOIN workshops ON workshops.id = vehicles.workshop_id 
    WHERE vehicles.id = service_records.vehicle_id AND workshops.user_id = auth.uid()
  )
);
CREATE POLICY "update_workshop_service_records" ON service_records FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM vehicles 
    JOIN workshops ON workshops.id = vehicles.workshop_id 
    WHERE vehicles.id = service_records.vehicle_id AND workshops.user_id = auth.uid()
  )
);
CREATE POLICY "delete_workshop_service_records" ON service_records FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM vehicles 
    JOIN workshops ON workshops.id = vehicles.workshop_id 
    WHERE vehicles.id = service_records.vehicle_id AND workshops.user_id = auth.uid()
  )
);

-- Service images: admin in workshop can manage
CREATE POLICY "select_workshop_service_images" ON service_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM service_records
    JOIN vehicles ON vehicles.id = service_records.vehicle_id
    JOIN workshops ON workshops.id = vehicles.workshop_id
    WHERE service_records.id = service_images.service_record_id AND workshops.user_id = auth.uid()
  )
);
CREATE POLICY "insert_workshop_service_images" ON service_images FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM service_records
    JOIN vehicles ON vehicles.id = service_records.vehicle_id
    JOIN workshops ON workshops.id = vehicles.workshop_id
    WHERE service_records.id = service_images.service_record_id AND workshops.user_id = auth.uid()
  )
);
CREATE POLICY "delete_workshop_service_images" ON service_images FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM service_records
    JOIN vehicles ON vehicles.id = service_records.vehicle_id
    JOIN workshops ON workshops.id = vehicles.workshop_id
    WHERE service_records.id = service_images.service_record_id AND workshops.user_id = auth.uid()
  )
);