import React, { useState, useEffect } from 'react';
import { FileText, Loader, Languages } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { processImage, Upload } from '../services/api';
import { useToast } from '../components/Toast';

export const ProcessPage: React.FC = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<string>('');
  const [targetLang, setTargetLang] = useState('en');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUploads(data);
      if (data.length > 0) {
        setSelectedUpload(data[0].id);
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedUpload) return;

    setProcessing(true);
    setError('');
    setResult(null);

    try {
      showToast('Processing image...', 'info');
      const translation = await processImage(selectedUpload, targetLang);
      setResult(translation);
      showToast('Translation completed successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err.message || 'Processing failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ja', name: 'Japanese' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Process Heritage Text</h1>
          <p className="text-gray-600">Extract and translate text from uploaded images</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <select
              value={selectedUpload}
              onChange={(e) => setSelectedUpload(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            >
              <option value="">Choose an uploaded image...</option>
              {uploads.map((upload) => (
                <option key={upload.id} value={upload.id}>
                  {upload.filename} - {new Date(upload.upload_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleProcess}
            disabled={!selectedUpload || processing}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center"
          >
            {processing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Process Image
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Extracted Text (OCR)</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{result.ocr_text}</p>
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                  <span>Script: {result.detected_script}</span>
                  <span>Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Languages className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Translation</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{result.translation}</p>
                <div className="mt-3 text-sm text-gray-600">
                  Language: {languages.find((l) => l.code === result.language)?.name}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
