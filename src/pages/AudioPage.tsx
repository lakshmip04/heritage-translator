import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Download, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Translation, generateAudio } from '../services/api';
import { useToast } from '../components/Toast';

export const AudioPage: React.FC = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<string>('');
  const [playing, setPlaying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadTranslations();
  }, []);

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const loadTranslations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTranslations(data);
      if (data.length > 0) {
        setSelectedTranslation(data[0].id);
      }
    }
  };

  const selectedData = translations.find((t) => t.id === selectedTranslation);

  const handleGenerateAudio = async () => {
    if (!selectedData) return;

    setGenerating(true);
    setError('');

    try {
      showToast('Generating audio with Google TTS...', 'info');
      const audioUrl = await generateAudio(
        selectedData.translation,
        selectedData.language,
        selectedData.id
      );

      const audio = new Audio(audioUrl);
      audio.onplay = () => setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        setPlaying(false);
        setError('Audio playback failed');
        showToast('Audio playback failed', 'error');
      };

      setAudioElement(audio);
      audio.play();

      await loadTranslations();
      showToast('Audio generated successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err.message || 'Audio generation failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');

      const utterance = new SpeechSynthesisUtterance(selectedData.translation);
      utterance.rate = 0.9;
      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
      showToast('Using browser TTS as fallback', 'info');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (playing) {
      if (audioElement) {
        audioElement.pause();
        setPlaying(false);
      } else {
        window.speechSynthesis.cancel();
        setPlaying(false);
      }
    } else {
      if (selectedData?.audio_url) {
        const audio = new Audio(selectedData.audio_url);
        audio.onplay = () => setPlaying(true);
        audio.onended = () => setPlaying(false);
        setAudioElement(audio);
        audio.play();
      } else {
        handleGenerateAudio();
      }
    }
  };

  const handleDownload = () => {
    if (!selectedData) return;

    if (selectedData.audio_url) {
      const link = document.createElement('a');
      link.href = selectedData.audio_url;
      link.download = `audio-${Date.now()}.mp3`;
      link.click();
      showToast('Audio download started', 'success');
    } else {
      const dataStr = JSON.stringify(
        {
          text: selectedData.translation,
          language: selectedData.language,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `translation-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Translation downloaded as JSON', 'success');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Audio Narration</h1>
          <p className="text-gray-600">Generate and play audio for translated text</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Translation
            </label>
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            >
              <option value="">Choose a translation...</option>
              {translations.map((translation) => (
                <option key={translation.id} value={translation.id}>
                  {translation.ocr_text.substring(0, 50)}... -{' '}
                  {new Date(translation.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedData && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Volume2 className="w-5 h-5 mr-2 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Translated Text</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{selectedData.translation}</p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  disabled={generating}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center"
                >
                  {generating ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : playing ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause Audio
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Play Audio
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition shadow-md flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </button>
              </div>

              {selectedData.audio_generated && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                  Audio has been generated for this translation
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
