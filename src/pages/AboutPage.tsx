import React from 'react';
import { Info, Globe, FileText, Volume2, History } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'OCR Text Extraction',
      description: 'Advanced optical character recognition to extract text from heritage documents and inscriptions.',
    },
    {
      icon: Globe,
      title: 'Real-Time Translation',
      description: 'Powered by LibreTranslate API for accurate translations across multiple languages.',
    },
    {
      icon: Volume2,
      title: 'Audio Narration',
      description: 'Text-to-speech synthesis to hear translations in natural-sounding voices.',
    },
    {
      icon: History,
      title: 'Translation History',
      description: 'Keep track of all your translations and easily revisit past work.',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">About Heritage Translator</h1>
          <p className="text-gray-600">Preserving history through modern technology</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-2xl mr-4">
                <Info className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Heritage Translator is dedicated to making historical texts and inscriptions accessible
              to everyone. By combining optical character recognition, machine translation, and
              text-to-speech technology, we help preserve and share cultural heritage across
              language barriers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6"
                >
                  <div className="bg-white p-3 rounded-xl inline-block mb-3">
                    <feature.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Technology Stack</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Frontend:</strong> React, TypeScript, Tailwind CSS</p>
              <p><strong>Backend:</strong> Supabase (PostgreSQL, Storage, Auth)</p>
              <p><strong>Translation:</strong> LibreTranslate API</p>
              <p><strong>Text-to-Speech:</strong> Web Speech API</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">How It Works</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                <span><strong>Upload:</strong> Select an image containing heritage text or inscriptions</span>
              </li>
              <li className="flex items-start">
                <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                <span><strong>Process:</strong> OCR extracts text and detects the script type</span>
              </li>
              <li className="flex items-start">
                <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                <span><strong>Translate:</strong> Real-time translation to your target language</span>
              </li>
              <li className="flex items-start">
                <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                <span><strong>Listen:</strong> Generate audio narration of the translated text</span>
              </li>
              <li className="flex items-start">
                <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">5</span>
                <span><strong>Save:</strong> Access your complete translation history anytime</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
