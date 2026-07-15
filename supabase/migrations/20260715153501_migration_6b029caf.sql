-- Create storage RLS policies for image/asset buckets (non-destructive DO blocks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'vehicle_images_select') THEN
    CREATE POLICY "vehicle_images_select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'vehicle-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'vehicle_images_insert') THEN
    CREATE POLICY "vehicle_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'vehicle_images_delete') THEN
    CREATE POLICY "vehicle_images_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_images_select') THEN
    CREATE POLICY "service_images_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'service-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_images_insert') THEN
    CREATE POLICY "service_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_images_delete') THEN
    CREATE POLICY "service_images_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'workshop_assets_select') THEN
    CREATE POLICY "workshop_assets_select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'workshop-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'workshop_assets_insert') THEN
    CREATE POLICY "workshop_assets_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'workshop-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'workshop_assets_delete') THEN
    CREATE POLICY "workshop_assets_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'workshop-assets');
  END IF;
END $$;