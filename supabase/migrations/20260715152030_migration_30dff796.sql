-- Create storage RLS policies for vehicle-images bucket
DROP POLICY IF EXISTS "vehicle_images_select" ON storage.objects;
DROP POLICY IF EXISTS "vehicle_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "vehicle_images_update" ON storage.objects;
DROP POLICY IF EXISTS "vehicle_images_delete" ON storage.objects;

CREATE POLICY "vehicle_images_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'vehicle-images');
CREATE POLICY "vehicle_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images');
CREATE POLICY "vehicle_images_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-images');
CREATE POLICY "vehicle_images_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-images');