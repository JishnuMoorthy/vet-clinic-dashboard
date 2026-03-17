-- Add photo_url to pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create pet_documents table
CREATE TABLE IF NOT EXISTS pet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes BIGINT,
  category TEXT NOT NULL DEFAULT 'other',
  notes TEXT,
  uploaded_by_id UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on pet_documents
ALTER TABLE pet_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for pet_documents
CREATE POLICY "anon_select_pet_documents" ON pet_documents FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_pet_documents" ON pet_documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_pet_documents" ON pet_documents FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_pet_documents" ON pet_documents FOR DELETE TO anon USING (true);

-- Create pet-files storage bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-files', 'pet-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pet-files bucket
CREATE POLICY "Anyone can upload pet files" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'pet-files');
CREATE POLICY "Anyone can read pet files" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'pet-files');
CREATE POLICY "Anyone can update pet files" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'pet-files') WITH CHECK (bucket_id = 'pet-files');
CREATE POLICY "Anyone can delete pet files" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'pet-files');