import React, { useState, useEffect } from 'react';
import { History, FileText, Languages, Volume2, Calendar } from 'lucide-react';
import { getHistory, Translation, Upload } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<(Translation & { upload: Upload })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xl text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Translation History</h1>
          <p className="text-gray-600">View all your past translations and uploads</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 p-4 rounded-2xl inline-block mb-4">
              <History className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No History Yet</h3>
            <p className="text-gray-600">Upload and process images to see your translation history</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.upload?.filename || 'Unknown file'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span>Script: {item.detected_script || 'Unknown'}</span>
                      <span>Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  {item.audio_generated && (
                    <button
                      onClick={() => playAudio(item.translation)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-3 rounded-xl transition"
                      title="Play audio"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Original Text</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.ocr_text.length > 150
                        ? item.ocr_text.substring(0, 150) + '...'
                        : item.ocr_text}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Languages className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Translation</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.translation.length > 150
                        ? item.translation.substring(0, 150) + '...'
                        : item.translation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
