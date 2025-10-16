/*
  # Heritage Translator & Narrator Database Schema

  ## Overview
  This migration creates the complete database schema for the Heritage Translator app,
  including tables for uploads and translations with proper security policies.

  ## New Tables
  
  ### `uploads`
  - `id` (uuid, primary key) - Unique identifier for each upload
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `filename` (text) - Original filename of the uploaded image
  - `file_path` (text) - Storage path or URL to the uploaded file
  - `upload_date` (timestamptz) - When the file was uploaded
  - `created_at` (timestamptz) - Timestamp of record creation
  
  ### `translations`
  - `id` (uuid, primary key) - Unique identifier for each translation
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `upload_id` (uuid, foreign key) - Reference to uploads table
  - `ocr_text` (text) - Extracted text from OCR processing
  - `translation` (text) - Translated text result
  - `language` (text) - Target language code (e.g., 'en', 'es')
  - `detected_script` (text) - Script detected by OCR (e.g., 'Brahmi-Tamil')
  - `confidence` (decimal) - OCR confidence score (0-1)
  - `audio_generated` (boolean) - Whether audio has been generated
  - `created_at` (timestamptz) - Timestamp of translation

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforce authentication and ownership checks
  
  ### Policies Created
  
  #### uploads table:
  1. Users can view their own uploads
  2. Users can insert their own uploads
  3. Users can update their own uploads
  4. Users can delete their own uploads
  
  #### translations table:
  1. Users can view their own translations
  2. Users can insert their own translations
  3. Users can update their own translations
  4. Users can delete their own translations

  ## Important Notes
  - Uses Supabase's built-in auth.users for user management
  - All timestamps use timestamptz for timezone awareness
  - Foreign keys ensure referential integrity
  - Cascade deletes remove related data when user data is deleted
*/

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id uuid REFERENCES uploads(id) ON DELETE CASCADE,
  ocr_text text NOT NULL,
  translation text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  detected_script text,
  confidence decimal(3,2) DEFAULT 0.00,
  audio_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_upload_date ON uploads(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_upload_id ON translations(upload_id);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploads table
CREATE POLICY "Users can view own uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads"
  ON uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads"
  ON uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads"
  ON uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for translations table
CREATE POLICY "Users can view own translations"
  ON translations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own translations"
  ON translations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own translations"
  ON translations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own translations"
  ON translations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);