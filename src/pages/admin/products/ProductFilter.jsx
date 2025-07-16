// src/pages/admin/products/AdminProductFilter.jsx
import React, { useState } from 'react';
import { useCategories, useBrands } from '../../../hooks/useProducts';

const AdminProductFilter = ({ onFilterChange, className = '' }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { brands, loading: brandsLoading } = useBrands();

  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    isActive: '',
    isFeatured: '',
    stockStatus: '',
    priceRange: { min: '', max: '' },
    hasImages: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Build condition object for GraphQL
    const condition = {};
    
    if (newFilters.category) condition.category = newFilters.category;
    if (newFilters.brand) condition.brand = newFilters.brand;
    if (newFilters.isActive !== '') condition.isActive = newFilters.isActive === 'true';
    if (newFilters.isFeatured !== '') condition.isFeatured = newFilters.isFeatured === 'true';
    
    // Price range
    if (newFilters.priceRange.min || newFilters.priceRange.max) {
      condition.price = {};
      if (newFilters.priceRange.min) condition.price.min = parseFloat(newFilters.priceRange.min);
      if (newFilters.priceRange.max) condition.price.max = parseFloat(newFilters.priceRange.max);
    }
    
    // Stock status
    if (newFilters.stockStatus) {
      switch (newFilters.stockStatus) {
        case 'inStock':
          condition.stock = { min: 1 };
          break;
        case 'lowStock':
          condition.stock = { min: 1, max: 10 };
          break;
        case 'outOfStock':
          condition.stock = { min: 0, max: 0 };
          break;
      }
    }
    
    onFilterChange(Object.keys(condition).length > 0 ? condition : null);
  };

  const handlePriceChange = (field, value) => {
    const newPriceRange = { ...filters.priceRange, [field]: value };
    handleFilterChange('priceRange', newPriceRange);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      brand: '',
      isActive: '',
      isFeatured: '',
      stockStatus: '',
      priceRange: { min: '', max: '' },
      hasImages: ''
    };
    setFilters(emptyFilters);
    onFilterChange(null);
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'priceRange') {
        return value.min || value.max;
      }
      return value !== '';
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Bộ lọc nâng cao</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả danh mục</option>
            {categoriesLoading ? (
              <option disabled>Đang tải...</option>
            ) : (
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thương hiệu
          </label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả thương hiệu</option>
            {brandsLoading ? (
              <option disabled>Đang tải...</option>
            ) : (
              brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang bán</option>
            <option value="false">Tạm dừng</option>
          </select>
        </div>

        {/* Featured Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sản phẩm nổi bật
          </label>
          <select
            value={filters.isFeatured}
            onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="true">Nổi bật</option>
            <option value="false">Thường</option>
          </select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tình trạng kho
          </label>
          <select
            value={filters.stockStatus}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="inStock">Còn hàng</option>
            <option value="lowStock">Sắp hết (≤10)</option>
            <option value="outOfStock">Hết hàng</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng giá (VNĐ)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Từ"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Đến"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Stock Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bộ lọc nhanh
          </label>
          <div className="space-y-2">
            <button
              onClick={() => handleFilterChange('stockStatus', 'outOfStock')}
              className="w-full text-left px-3 py-2 text-sm border border-red-200 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              🚨 Sản phẩm hết hàng
            </button>
            <button
              onClick={() => handleFilterChange('stockStatus', 'lowStock')}
              className="w-full text-left px-3 py-2 text-sm border border-yellow-200 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              ⚠️ Sắp hết hàng
            </button>
            <button
              onClick={() => handleFilterChange('isFeatured', 'true')}
              className="w-full text-left px-3 py-2 text-sm border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              ⭐ Sản phẩm nổi bật
            </button>
          </div>
        </div>

        {/* Date Filters - Could be added later */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian tạo
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          >
            <option>Tất cả thời gian</option>
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>3 tháng qua</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Sắp có</p>
        </div>
      </div>

      {/* Summary */}
      {hasActiveFilters() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            💡 <strong>Gợi ý:</strong> Bạn đang áp dụng {Object.values(filters).filter(v => v !== '' && !(typeof v === 'object' && !v.min && !v.max)).length} bộ lọc. 
            Sử dụng "Xóa tất cả bộ lọc" để reset về trạng thái ban đầu.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminProductFilter;