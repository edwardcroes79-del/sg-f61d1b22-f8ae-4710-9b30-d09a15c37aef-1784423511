DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_images_select') THEN
    CREATE POLICY "service_images_select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'service-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_images_insert') THEN
    CREATE POLICY "service_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_images_update') THEN
    CREATE POLICY "service_images_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'service-images') WITH CHECK (bucket_id = 'service-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_images_delete') THEN
    CREATE POLICY "service_images_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-images');
  END IF;
END $$;