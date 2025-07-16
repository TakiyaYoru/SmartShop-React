// src/components/admin/products/ImageUpload.jsx
import React, { useState, useRef } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useUploadProductImage, useRemoveProductImage } from '../../../hooks/useUpload';
import { getImageUrl } from '../../../lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableImage = ({ image, index, onRemove, isMain, onSetMain }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group cursor-move"
      {...attributes}
      {...listeners}
    >
      <img
        src={getImageUrl(image)}
        alt={`Product ${index + 1}`}
        className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-blue-400 transition-colors"
        onError={(e) => {
          e.target.src = '/placeholder-product.jpg';
        }}
      />
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
        {!isMain && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSetMain(index);
            }}
            className="bg-yellow-500 text-white rounded-full p-1 hover:bg-yellow-600"
            title="Đặt làm ảnh chính"
          >
            <StarIcon className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
              onRemove(image, index);
            }
          }}
          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          title="Xóa ảnh"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      </div>
      {isMain && (
        <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center space-x-1">
          <StarIcon className="h-3 w-3" />
          <span>Chính</span>
        </div>
      )}
    </div>
  );
};

const ImageUpload = ({ 
  productId, 
  images = [], 
  onImagesChange, 
  maxImages = 5 
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { uploadImage, loading: uploadLoading } = useUploadProductImage();
  const { removeImage, loading: removeLoading } = useRemoveProductImage();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = images.indexOf(active.id);
      const newIndex = images.indexOf(over.id);
      
      const newImages = arrayMove(images, oldIndex, newIndex);
      onImagesChange(newImages);
    }
  };

  const handleFileSelect = (files) => {
    if (!productId) {
      alert('Vui lòng tạo sản phẩm trước khi upload ảnh');
      return;
    }

    if (images.length + files.length > maxImages) {
      alert(`Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const newImages = [...images];

    for (let file of files) {
      try {
        const result = await uploadImage(productId, file);
        if (result.success && result.filename) {
          newImages.push(result.filename);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    onImagesChange(newImages);
    setUploading(false);
  };

  const handleRemoveImage = async (filename, index) => {
    if (!productId) {
      // Nếu chưa có productId, chỉ remove khỏi state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      return;
    }

    try {
      await removeImage(productId, filename);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Remove image error:', error);
    }
  };

  const handleSetMainImage = (index) => {
    if (index === 0) return;
    
    const newImages = [...images];
    const [imageToMove] = newImages.splice(index, 1);
    newImages.unshift(imageToMove);
    onImagesChange(newImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Hình ảnh sản phẩm ({images.length}/{maxImages})
      </label>

      {/* Current Images */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <SortableImage
                  key={image}
                  image={image}
                  index={index}
                  onRemove={handleRemoveImage}
                  isMain={index === 0}
                  onSetMain={handleSetMainImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {uploading || uploadLoading ? (
            <div className="space-y-2">
              <CloudArrowUpIcon className="h-12 w-12 text-blue-500 mx-auto animate-bounce" />
              <p className="text-sm text-blue-600 font-medium">Đang upload...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Kéo thả ảnh vào đây hoặc click để chọn
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Chọn ảnh
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500">
        <p>• Kéo thả để sắp xếp lại thứ tự ảnh</p>
        <p>• Ảnh đầu tiên sẽ được làm ảnh chính</p>
        <p>• Kích thước tối ưu: 800x800px</p>
        <p>• Định dạng: JPG, PNG, GIF</p>
      </div>
    </div>
  );
};

export default ImageUpload;