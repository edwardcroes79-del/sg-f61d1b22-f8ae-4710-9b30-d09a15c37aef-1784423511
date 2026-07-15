DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'workshop_assets_select') THEN
    CREATE POLICY "workshop_assets_select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'workshop-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'workshop_assets_insert') THEN
    CREATE POLICY "workshop_assets_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'workshop-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'workshop_assets_update') THEN
    CREATE POLICY "workshop_assets_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'workshop-assets') WITH CHECK (bucket_id = 'workshop-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'workshop_assets_delete') THEN
    CREATE POLICY "workshop_assets_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'workshop-assets');
  END IF;
END $$;