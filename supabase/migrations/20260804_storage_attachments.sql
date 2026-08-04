-- Add issue_attachments table (for database-level metadata, if needed)
CREATE TABLE IF NOT EXISTS issue_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  size bigint NOT NULL,
  mime_type text,
  uploaded_at timestamp with time zone DEFAULT now(),
  uploader_id uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE issue_attachments ENABLE ROW LEVEL SECURITY;

-- Storage Policies for 'issue-attachments' bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-attachments', 'issue-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to issue attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issue-attachments');

CREATE POLICY "Allow authenticated users to upload issue attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'issue-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update issue attachments" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'issue-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete issue attachments" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'issue-attachments' AND auth.role() = 'authenticated');
