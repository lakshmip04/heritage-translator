/*
  # Add audio_url column to translations table

  ## Changes
  1. Add `audio_url` column to translations table
    - Stores the URL to the generated audio file in Supabase Storage
    - Nullable field, as audio may not be generated for all translations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'translations' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE translations ADD COLUMN audio_url text;
  END IF;
END $$;