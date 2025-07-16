import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

// GraphQL Queries
const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    allCategories {
      _id
      name
      description
      isActive
    }
  }
`;

const GET_ALL_BRANDS = gql`
  query GetAllBrands {
    allBrands {
      _id
      name
      description
      isActive
    }
  }
`;

const ProductFilter = ({ onFilterChange, initialFilters, className = '' }) => {
  // States for filter values
  const [filters, setFilters] = useState({
    price: { min: '', max: '' },
    category: '',
    brand: '',
    stock: 'all', // 'all', 'inStock', 'outOfStock'
    isFeatured: false,
    hasDiscount: false,
    sections: {
      price: true,
      category: true,
      brand: true,
      stock: true,
      features: true
    }
  });

  // Fetch categories & brands
  const { data: categoriesData, loading: loadingCategories } = useQuery(GET_ALL_CATEGORIES);
  const { data: brandsData, loading: loadingBrands } = useQuery(GET_ALL_BRANDS);

  // Sync with initial filters
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
    }
  }, [initialFilters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    let newFilters;
    
    if (key === 'price') {
      newFilters = {
        ...filters,
        price: {
          ...filters.price,
          ...value
        }
      };
    } else if (key === 'sections') {
      newFilters = {
        ...filters,
        sections: {
          ...filters.sections,
          [value]: !filters.sections[value]
        }
      };
    } else {
      newFilters = {
        ...filters,
        [key]: value
      };
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    handleFilterChange('sections', section);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      price: { min: '', max: '' },
      category: '',
      brand: '',
      stock: 'all',
      isFeatured: false,
      hasDiscount: false,
      sections: filters.sections
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.price.min ||
      filters.price.max ||
      filters.category ||
      filters.brand ||
      filters.stock !== 'all' ||
      filters.isFeatured ||
      filters.hasDiscount
    );
  };

  // Predefined price ranges
  const priceRanges = [
    { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
    { label: '1 - 5 triệu', min: 1000000, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: 'Trên 20 triệu', min: 20000000, max: '' }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
            Bộ lọc sản phẩm
          </h2>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Price Range Section */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-medium text-gray-900">💰 Khoảng giá</span>
            {filters.sections.price ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {filters.sections.price && (
            <>
              {/* Predefined ranges */}
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('price', { min: range.min, max: range.max })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.price.min === range.min && filters.price.max === range.max
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Custom range inputs */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Hoặc nhập khoảng giá</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Từ</label>
                    <input
                      type="number"
                      value={filters.price.min}
                      onChange={(e) => handleFilterChange('price', { min: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Đến</label>
                    <input
                      type="number"
                      value={filters.price.max}
                      onChange={(e) => handleFilterChange('price', { max: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                {filters.price.min && filters.price.max && (
                  <div className="mt-2 text-xs text-gray-500">
                    Khoảng giá: {formatPrice(filters.price.min)} - {formatPrice(filters.price.max)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Category Section */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-medium text-gray-900">📁 Danh mục</span>
            {filters.sections.category ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {filters.sections.category && (
            <div className="space-y-2">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả danh mục</option>
                {categoriesData?.allCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Brand Section */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-medium text-gray-900">🏢 Thương hiệu</span>
            {filters.sections.brand ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {filters.sections.brand && (
            <div className="space-y-2">
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả thương hiệu</option>
                {brandsData?.allBrands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stock Section */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('stock')}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-medium text-gray-900">📦 Tình trạng kho</span>
            {filters.sections.stock ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {filters.sections.stock && (
            <div className="space-y-2">
              <select
                value={filters.stock}
                onChange={(e) => handleFilterChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="inStock">Còn hàng</option>
                <option value="outOfStock">Hết hàng</option>
                <option value="lowStock">Sắp hết hàng</option>
              </select>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('features')}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-medium text-gray-900">⭐ Tính năng</span>
            {filters.sections.features ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {filters.sections.features && (
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isFeatured}
                  onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Sản phẩm nổi bật</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasDiscount}
                  onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Đang giảm giá</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter; 