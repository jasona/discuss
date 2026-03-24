-- ═══════════════════════════════════════════════════════════
-- Storage bucket for document images
-- ═══════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Upload policy: authenticated users can upload to their org folder ──

CREATE POLICY "Org members can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'org_id')::text
  );

-- ─── Read policy: public read for all files in the documents bucket ──
-- (bucket is public — images need to be viewable in shared docs)

CREATE POLICY "Anyone can read document files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- ─── Update policy: org members can update their own org's files ──

CREATE POLICY "Org members can update their files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'org_id')::text
  );

-- ─── Delete policy: org admins can delete files ──

CREATE POLICY "Org admins can delete files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'org_id')::text
  );
