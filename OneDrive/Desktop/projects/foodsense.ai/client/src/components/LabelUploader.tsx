'use client';

import { useRef, useState } from 'react';
import { Camera, Upload, X, ImageIcon } from 'lucide-react';

interface LabelUploaderProps {
  onAnalyze: (file: File) => void;
  onClose: () => void;
  loading: boolean;
}

export default function LabelUploader({ onAnalyze, onClose, loading }: LabelUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedSize, setCompressedSize] = useState<string>('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Compress image client-side
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8,
      });

      const previewUrl = URL.createObjectURL(compressed);
      setPreview(previewUrl);
      setSelectedFile(compressed as File);
      setCompressedSize(`${(compressed.size / 1024).toFixed(0)}KB`);
    } catch {
      // Fallback: use original file
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setSelectedFile(file);
      setCompressedSize(`${(file.size / 1024).toFixed(0)}KB`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Scan Label</h2>
            <p className="text-sm text-gray-500 mt-0.5">Take or upload a photo of the ingredients</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!preview ? (
            <>
              {/* Camera capture */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                  <Camera className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Take Photo</div>
                  <div className="text-sm text-gray-500">Use your camera</div>
                </div>
              </button>

              {/* File upload */}
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                  <Upload className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Upload Image</div>
                  <div className="text-sm text-gray-500">From your gallery</div>
                </div>
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-50">
                <img src={preview} alt="Label preview" className="w-full max-h-64 object-contain" />
                <button
                  onClick={() => { setPreview(null); setSelectedFile(null); }}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {compressedSize && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded-full text-white text-xs">
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    {compressedSize}
                  </div>
                )}
              </div>

              <button
                onClick={() => selectedFile && onAnalyze(selectedFile)}
                disabled={loading || !selectedFile}
                className="w-full py-4 bg-black text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                    Analyzing label...
                  </>
                ) : (
                  'Analyse Label'
                )}
              </button>
            </div>
          )}

          <p className="text-xs text-center text-gray-400">
            Works with any language • AI-powered label reading
          </p>
        </div>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
