// src/components/products/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ 
  products = [], 
  loading = false, 
  viewMode = 'grid',
  showLoadMore = false,
  onLoadMore,
  hasNextPage = false,
  loadingMore = false 
}) => {
  
  // Filter out null/undefined products and validate data
  const validProducts = products.filter(product => {
    return product && 
           product._id && 
           product.name && 
           typeof product.price === 'number';
  });

  if (loading && validProducts.length === 0) {
    return (
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {[...Array(6)].map((_, index) => (
          <ProductCardSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (validProducts.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">📦</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-gray-600 mb-6">
          {products.length > validProducts.length 
            ? `Có ${products.length - validProducts.length} sản phẩm bị lỗi dữ liệu. Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.`
            : 'Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác'
          }
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Làm mới trang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Quality Warning */}
      {products.length > validProducts.length && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Cảnh báo dữ liệu
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {products.length - validProducts.length} sản phẩm có dữ liệu không hợp lệ và đã được ẩn.
                Có thể do thiếu thông tin brand hoặc category.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {validProducts.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasNextPage && (
        <div className="text-center py-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="btn btn-secondary px-8 py-3"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Đang tải...
              </>
            ) : (
              'Xem thêm sản phẩm'
            )}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {[...Array(3)].map((_, index) => (
            <ProductCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

// Skeleton Loading Component
const ProductCardSkeleton = ({ viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        {/* Image Skeleton */}
        <div className="aspect-square bg-gray-200"></div>
        
        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          {/* Category & Brand */}
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
            <div className="h-3 bg-gray-200 rounded w-8 ml-2"></div>
          </div>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <div className="h-5 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          
          {/* Stock */}
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  // List view skeleton
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="flex">
        {/* Image Skeleton */}
        <div className="w-48 aspect-square bg-gray-200 flex-shrink-0"></div>
        
        {/* Content Skeleton */}
        <div className="flex-1 p-6 space-y-4">
          {/* Category & Brand */}
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
            <div className="h-3 bg-gray-200 rounded w-20 ml-2"></div>
          </div>
          
          {/* Bottom section */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-3">
              <div className="h-7 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-9 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;