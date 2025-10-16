import axios from 'axios';
import { supabase } from '../lib/supabase';

const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';

export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  upload_date: string;
  created_at: string;
}

export interface Translation {
  id: string;
  user_id: string;
  upload_id: string | null;
  ocr_text: string;
  translation: string;
  language: string;
  detected_script: string | null;
  confidence: number;
  audio_generated: boolean;
  created_at: string;
}

export interface OCRResult {
  ocr_text: string;
  detected_script: string;
  confidence: number;
}

export const mockOCR = (filename: string): OCRResult => {
  const scripts = [
    { text: 'வாழ்க தமிழ் மொழி வாழ்க அறிவுடைமை', script: 'Tamil', confidence: 0.94 },
    { text: 'ಭಾರತ ದೇಶದ ಪ್ರಾಚೀನ ಲಿಪಿ', script: 'Kannada', confidence: 0.89 },
    { text: 'प्राचीन भारतीय लिपि संस्कृत', script: 'Devanagari', confidence: 0.92 },
    { text: 'ಬ್ರಾಹ್ಮೀ ಲಿಪಿಯ ಪ್ರಾಚೀನ ಗ್ರಂಥ', script: 'Brahmi-Kannada', confidence: 0.87 },
    { text: 'Ancient Tamil inscription from heritage site', script: 'Brahmi-Tamil', confidence: 0.95 },
  ];

  const selected = scripts[Math.floor(Math.random() * scripts.length)];
  return {
    ocr_text: selected.text,
    detected_script: selected.script,
    confidence: selected.confidence,
  };
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    const response = await axios.post(LIBRE_TRANSLATE_URL, {
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text',
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed. Please try again.');
  }
};

export const uploadFile = async (file: File): Promise<Upload> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('heritage-images')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error('File upload failed');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('heritage-images')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('uploads')
    .insert({
      user_id: user.id,
      filename: file.name,
      file_path: publicUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const processImage = async (uploadId: string, targetLang: string): Promise<Translation> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: upload } = await supabase
    .from('uploads')
    .select('*')
    .eq('id', uploadId)
    .maybeSingle();

  if (!upload) throw new Error('Upload not found');

  const ocrResult = mockOCR(upload.filename);
  const translatedText = await translateText(ocrResult.ocr_text, targetLang);

  const { data, error } = await supabase
    .from('translations')
    .insert({
      user_id: user.id,
      upload_id: uploadId,
      ocr_text: ocrResult.ocr_text,
      translation: translatedText,
      language: targetLang,
      detected_script: ocrResult.detected_script,
      confidence: ocrResult.confidence,
      audio_generated: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getHistory = async (): Promise<(Translation & { upload: Upload })[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('translations')
    .select(`
      *,
      upload:uploads(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as any;
};

export const updateAudioGenerated = async (translationId: string): Promise<void> => {
  const { error } = await supabase
    .from('translations')
    .update({ audio_generated: true })
    .eq('id', translationId);

  if (error) throw error;
};
