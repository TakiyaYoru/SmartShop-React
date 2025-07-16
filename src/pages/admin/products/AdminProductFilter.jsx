import React, { useState } from 'react';
import {
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AdminProductFilter = ({ filters = {}, onChange, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    const newFilters = {
      ...localFilters,
      [field]: value === '' ? undefined : value
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onClear();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Bộ lọc nâng cao</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Đặt lại
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-4 w-4" />
            Đóng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ngừng bán</option>
            <option value="DRAFT">Nháp</option>
          </select>
        </div>

        {/* Tình trạng kho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tình trạng kho
          </label>
          <select
            value={localFilters.stockStatus || ''}
            onChange={(e) => handleChange('stockStatus', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="IN_STOCK">Còn hàng</option>
            <option value="LOW_STOCK">Sắp hết</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
          </select>
        </div>

        {/* Khoảng giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá từ
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            placeholder="VD: 100000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đến
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="VD: 1000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Khoảng tồn kho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tồn kho từ
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.minStock || ''}
            onChange={(e) => handleChange('minStock', e.target.value)}
            placeholder="VD: 10"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đến
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.maxStock || ''}
            onChange={(e) => handleChange('maxStock', e.target.value)}
            placeholder="VD: 100"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Đặc biệt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đặc biệt
          </label>
          <select
            value={localFilters.featured || ''}
            onChange={(e) => handleChange('featured', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="true">Nổi bật</option>
            <option value="false">Không nổi bật</option>
          </select>
        </div>

        {/* Danh mục */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục
          </label>
          <select
            value={localFilters.categoryId || ''}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {/* TODO: Add categories from API */}
            <option value="1">Điện thoại</option>
            <option value="2">Laptop</option>
            <option value="3">Máy tính bảng</option>
          </select>
        </div>

        {/* Thương hiệu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thương hiệu
          </label>
          <select
            value={localFilters.brandId || ''}
            onChange={(e) => handleChange('brandId', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả thương hiệu</option>
            {/* TODO: Add brands from API */}
            <option value="1">Apple</option>
            <option value="2">Samsung</option>
            <option value="3">Xiaomi</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(localFilters).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">Bộ lọc đang áp dụng:</span>
          {Object.entries(localFilters).map(([key, value]) => (
            value && (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {key}: {value}
                <button
                  onClick={() => handleChange(key, '')}
                  className="hover:text-blue-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductFilter; 