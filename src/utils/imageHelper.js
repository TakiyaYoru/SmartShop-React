// webfrontend/src/utils/imageHelper.js
// Helper functions để xử lý image URLs từ Firebase và local

import React, { useState } from 'react';

/**
 * Kiểm tra xem string có phải là Firebase URL không
 * @param {string} url 
 * @returns {boolean}
 */
export const isFirebaseUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('firebasestorage.googleapis.com') || url.startsWith('https://');
};

/**
 * Kiểm tra xem string có phải là filename (không phải full URL) không
 * @param {string} imageString 
 * @returns {boolean}
 */
export const isFilename = (imageString) => {
  if (!imageString || typeof imageString !== 'string') return false;
  // Nếu không phải URL và có extension thì là filename
  return !imageString.startsWith('http') && 
         !imageString.startsWith('/') && 
         /\.(jpg|jpeg|png|gif|webp)$/i.test(imageString);
};

/**
 * Chuyển đổi image string thành URL có thể hiển thị
 * @param {string} imageString - Có thể là filename hoặc full Firebase URL
 * @param {string} fallback - URL fallback nếu không tìm thấy ảnh
 * @returns {string} - Full URL để hiển thị
 */
export const getImageUrl = (imageString, fallback = '/placeholder-product.jpg') => {
  // Nếu không có imageString
  if (!imageString) {
    return fallback;
  }

  // Nếu đã là Firebase URL hoặc full URL, return nguyên
  if (isFirebaseUrl(imageString)) {
    return imageString;
  }

  // Nếu là filename (legacy từ local storage), tạo local URL
  if (isFilename(imageString)) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${apiUrl}/img/${imageString}`;
  }

  // Nếu đã là relative path (/img/filename.jpg)
  if (imageString.startsWith('/img/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${apiUrl}${imageString}`;
  }

  // Default fallback
  return fallback;
};

/**
 * Lấy URL của ảnh đầu tiên từ array images
 * @param {string[]} images - Array các image strings
 * @param {string} fallback - URL fallback
 * @returns {string}
 */
export const getFirstImageUrl = (images, fallback = '/placeholder-product.jpg') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback;
  }
  
  return getImageUrl(images[0], fallback);
};

/**
 * Lấy tất cả URLs từ array images
 * @param {string[]} images - Array các image strings
 * @returns {string[]} - Array các URLs
 */
export const getAllImageUrls = (images) => {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.map(image => getImageUrl(image)).filter(url => url !== '/placeholder-product.jpg');
};

/**
 * Kiểm tra xem image có load được không
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
export const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Component để hiển thị ảnh với fallback tự động
 */
export const SmartImage = ({ 
  src, 
  alt = '', 
  className = '', 
  fallback = '/placeholder-product.jpg',
  style = {},
  onClick,
  ...props 
}) => {
  const imageUrl = getImageUrl(src, fallback);
  
  const handleError = (e) => {
    if (e.target.src !== fallback) {
      e.target.src = fallback;
    }
  };

  return React.createElement('img', {
    src: imageUrl,
    alt: alt,
    className: className,
    style: style,
    onError: handleError,
    onClick: onClick,
    ...props
  });
};

/**
 * Hook để quản lý multiple images với preview
 * @param {string[]} initialImages - Ảnh ban đầu
 * @returns {Object} - Object chứa images, previews và handlers
 */
export const useImageManager = (initialImages = []) => {
  const [images, setImages] = useState(initialImages);
  const [previews, setPreviews] = useState([]);

  const addImages = (newImages) => {
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (fromIndex, toIndex) => {
    setImages(prev => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return newImages;
    });
  };

  const clearImages = () => {
    setImages([]);
    setPreviews([]);
  };

  return {
    images,
    previews,
    setImages,
    setPreviews,
    addImages,
    removeImage,
    reorderImages,
    clearImages,
    imageUrls: getAllImageUrls(images)
  };
};

// Export default object với tất cả utilities
export default {
  isFirebaseUrl,
  isFilename,
  getImageUrl,
  getFirstImageUrl,
  getAllImageUrls,
  checkImageExists,
  SmartImage,
  useImageManager
};