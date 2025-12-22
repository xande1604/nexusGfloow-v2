-- Create storage bucket for training certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificados', 'certificados', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload certificates
CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificados');

-- Allow authenticated users to update their own certificates
CREATE POLICY "Authenticated users can update certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certificados');

-- Allow public read access to certificates
CREATE POLICY "Public can view certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificados');

-- Allow authenticated users to delete certificates
CREATE POLICY "Authenticated users can delete certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'certificados');