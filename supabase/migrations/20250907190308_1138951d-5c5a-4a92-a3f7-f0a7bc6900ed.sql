-- Create avatars storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create RLS policies for avatar uploads
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add avatar_url column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;