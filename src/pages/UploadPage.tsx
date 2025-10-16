import React, { useState } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { uploadFile } from '../services/api';

export const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setSuccess(false);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      await uploadFile(file);
      setSuccess(true);
      setTimeout(() => {
        setFile(null);
        setPreview('');
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Upload Heritage Image</h1>
          <p className="text-gray-600">Select an image containing heritage text for translation</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="border-2 border-dashed border-amber-300 rounded-2xl p-12 text-center hover:border-amber-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="bg-amber-100 p-4 rounded-2xl mb-4">
                  <UploadIcon className="w-12 h-12 text-amber-600" />
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Click to upload an image
                </p>
                <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </label>
          </div>

          {preview && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Image Preview
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-96 mx-auto rounded-lg shadow-md"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">{file?.name}</p>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Image uploaded successfully!
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
