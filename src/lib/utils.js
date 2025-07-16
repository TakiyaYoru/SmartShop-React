// webfrontend/src/lib/utils.js - Updated với Firebase Support
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format price in Vietnamese currency
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Format number with thousand separators
export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0';
  return new Intl.NumberFormat('vi-VN').format(number);
};

// ✅ DEPRECATED: Keep for backward compatibility, but recommend using imageHelper
export const getImageUrl = (filename, baseUrl = "") => {
  console.warn('getImageUrl from utils.js is deprecated. Use getImageUrl from utils/imageHelper.js instead');
  
  if (!filename) return '/placeholder-product.jpg';
  
  // Check if it's already a full URL (Firebase URL)
  if (filename.startsWith('http') || filename.includes('firebasestorage.googleapis.com')) {
    return filename;
  }
  
  // Check if it's already a relative path
  if (filename.startsWith('/img/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${apiUrl}${filename}`;
  }
  
  // If it's just a filename, create the local URL
  const apiUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:4000';
  return `${apiUrl}/img/${filename}`;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random string
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if user is on mobile
export const isMobile = () => {
  return window.innerWidth < 768;
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Date helpers
export const formatDate = (date, options = {}) => {
  // ✅ FIX: Handle invalid dates
  if (!date) return 'Chưa cập nhật';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(dateObj);
};

export const formatDateTime = (date) => {
  // ✅ FIX: Handle invalid dates
  if (!date) return 'Chưa cập nhật';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const timeAgo = (date) => {
  // ✅ FIX: Handle invalid dates
  if (!date) return 'Không xác định';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  const now = new Date();
  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} tháng trước`;
  return `${Math.ceil(diffDays / 365)} năm trước`;
};

// URL helpers
export const buildUrl = (base, params = {}) => {
  const url = new URL(base);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Array helpers
export const unique = (array, key = null) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
  return [...new Set(array)];
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Product helpers
export const getProductStock = (product) => {
  if (!product || typeof product.stock !== 'number') return 0;
  return product.stock;
};

export const isProductInStock = (product) => {
  return getProductStock(product) > 0;
};

export const getProductMainImage = (product) => {
  if (!product || !product.images || product.images.length === 0) {
    return '/placeholder-product.jpg';
  }
  return getImageUrl(product.images[0]);
};

// Cart helpers
export const calculateCartTotal = (cartItems = []) => {
  return cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

export const calculateCartItemCount = (cartItems = []) => {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
};