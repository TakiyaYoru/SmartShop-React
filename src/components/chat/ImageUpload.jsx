import React, { useState, useRef, useCallback } from 'react';
import { 
  PhotoIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const ImageUpload = ({ onImageUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file: file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle paste from clipboard
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          handleFileSelect(file);
          break;
        }
      }
    }
  }, [handleFileSelect]);

  // Add paste event listener
  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    try {
      await onImageUpload(selectedImage);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm bằng ảnh</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {!selectedImage ? (
          /* Upload Area */
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Kéo thả ảnh vào đây hoặc
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Chọn ảnh
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Hoặc paste ảnh từ clipboard (Ctrl+V)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          /* Preview Area */
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Tên file:</strong> {selectedImage.name}</p>
              <p><strong>Kích thước:</strong> {(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRemoveImage}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Chọn lại
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    Tìm kiếm
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload; 