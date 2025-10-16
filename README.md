# Heritage Translator & Narrator

A full-stack application for digitizing and translating heritage texts using AI-powered OCR, translation, and text-to-speech capabilities.

## Features

### Core Functionality
- **Image Upload**: Upload heritage text images to Supabase Storage
- **OCR Processing**: Extract text using Google Cloud Vision API (with mock fallback)
- **Translation**: Real-time translation using Google Translate API (with LibreTranslate fallback)
- **Audio Narration**: Generate MP3 audio files using Google Cloud Text-to-Speech API
- **History Tracking**: View all past translations with audio playback
- **User Authentication**: Secure email/password authentication via Supabase Auth

### Tech Stack

#### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for HTTP requests
- Lucide React for icons

#### Backend
- Supabase PostgreSQL database
- Supabase Storage for images and audio files
- Supabase Edge Functions for serverless API endpoints
- Row Level Security (RLS) for data protection

#### AI & APIs
- Google Cloud Vision API for OCR
- Google Translate API for translations
- Google Cloud Text-to-Speech API for audio generation
- LibreTranslate as fallback for translations
- Web Speech API as fallback for TTS

## Database Schema

### Tables

#### `uploads`
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- filename (text)
- file_path (text)
- upload_date (timestamptz)
- created_at (timestamptz)

#### `translations`
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- upload_id (uuid, foreign key to uploads)
- ocr_text (text)
- translation (text)
- language (text)
- detected_script (text)
- confidence (decimal)
- audio_generated (boolean)
- audio_url (text)
- created_at (timestamptz)

### Storage Buckets
- `heritage-images`: Public bucket for uploaded images
- `audio-files`: Public bucket for generated MP3 files

## Edge Functions

### `/functions/v1/process_text`
Processes uploaded images to extract and translate text.

### `/functions/v1/generate_audio`
Generates MP3 audio narration from translated text.

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Edge Functions
```
GOOGLE_API_KEY=your_google_api_key (optional, configured automatically)
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

1. **Register/Login**: Create an account or login
2. **Upload Image**: Select an image containing heritage text
3. **Process Image**: Extract and translate text using AI
4. **Generate Audio**: Create MP3 narration with Google TTS
5. **View History**: Access all past translations and audio

## Supported Languages

English, Spanish, French, German, Hindi, Chinese, Arabic, Japanese

## Security

- JWT authentication for all endpoints
- Row Level Security (RLS) on all tables
- Secure storage bucket policies
- Password hashing via Supabase Auth

## License

MIT
