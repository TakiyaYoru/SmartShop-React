import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'product-card':
        return (
          <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-6 rounded w-1/2 mb-4"></div>
            <div className="bg-gray-200 h-8 rounded"></div>
          </div>
        );
      
      case 'category-card':
        return (
          <div className="bg-gray-50 rounded-xl p-6 animate-pulse">
            <div className="bg-gray-200 h-16 w-16 rounded-full mx-auto mb-4"></div>
            <div className="bg-gray-200 h-4 rounded"></div>
          </div>
        );
      
      case 'brand-card':
        return (
          <div className="bg-gray-50 rounded-xl p-6 animate-pulse">
            <div className="bg-gray-200 h-16 w-16 rounded-full mx-auto mb-4"></div>
            <div className="bg-gray-200 h-3 rounded w-3/4 mx-auto"></div>
          </div>
        );
      
      case 'testimonial':
        return (
          <div className="bg-gray-50 rounded-xl p-8 animate-pulse">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-5 w-5 rounded mr-1"></div>
              ))}
            </div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-6"></div>
            <div className="flex items-center">
              <div className="bg-gray-200 h-12 w-12 rounded-full mr-4"></div>
              <div>
                <div className="bg-gray-200 h-4 rounded w-24 mb-1"></div>
                <div className="bg-gray-200 h-3 rounded w-20"></div>
              </div>
            </div>
          </div>
        );
      
      case 'stats':
        return (
          <div className="text-center animate-pulse">
            <div className="bg-gray-200 h-16 w-16 rounded-full mx-auto mb-4"></div>
            <div className="bg-gray-200 h-8 rounded w-20 mx-auto mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-16 mx-auto"></div>
          </div>
        );
      
      case 'feature-card':
        return (
          <div className="bg-white rounded-xl p-8 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="bg-gray-200 h-14 w-14 rounded-xl"></div>
              <div className="bg-gray-200 h-8 w-16 rounded"></div>
            </div>
            <div className="bg-gray-200 h-6 rounded mb-3"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton; 