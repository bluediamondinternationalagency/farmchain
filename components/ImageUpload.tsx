import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle, X } from 'lucide-react';
import { IPFSService } from '../services/ipfsService';

interface Props {
  onUploadComplete: (imageUrl: string, ipfsCID: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export const ImageUpload: React.FC<Props> = ({ onUploadComplete, currentImageUrl, label = 'Upload Image' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to IPFS
      const cid = await IPFSService.uploadFile(file);
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Call parent callback
      onUploadComplete(ipfsUrl, cid);

      // Reset after success
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isUploading 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-600">Uploading to IPFS...</p>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-500">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex p-4 bg-white rounded-full shadow-sm">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="relative border-2 border-emerald-200 rounded-xl overflow-hidden bg-slate-50">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            {isUploading && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
                  <p className="text-sm font-medium text-blue-600">{uploadProgress}%</p>
                </div>
              </div>
            )}
            {uploadProgress === 100 && (
              <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-2">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="absolute top-3 left-3 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-full p-2 shadow-lg transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 w-full bg-white border border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            disabled={isUploading}
          >
            <ImageIcon className="w-4 h-4" />
            Change Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <X className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
