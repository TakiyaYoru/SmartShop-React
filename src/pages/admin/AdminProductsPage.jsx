// src/pages/admin/AdminProductsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useProducts } from '../../hooks/useProducts';
import ProductTable from './products/ProductTable';
import AdminProductFilter from './products/AdminProductFilter';

const AdminProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [filters, setFilters] = useState({
    condition: null,
    orderBy: 'CREATED_DESC'
  });

  // Fetch products với current filters
  const { 
    products, 
    totalCount, 
    hasNextPage, 
    loading, 
    error, 
    loadMore, 
    refetch 
  } = useProducts({
    first: 20,
    orderBy: filters.orderBy,
    condition: filters.condition
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({
        ...prev,
        condition: {
          ...prev.condition,
          name: searchQuery.trim()
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        condition: prev.condition ? { ...prev.condition, name: undefined } : null
      }));
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      condition: newFilters
    }));
  };

  const handleSortChange = (orderBy) => {
    setFilters(prev => ({
      ...prev,
      orderBy
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      condition: null,
      orderBy: 'CREATED_DESC'
    });
  };

  const hasActiveFilters = () => {
    return searchQuery || filters.condition || filters.orderBy !== 'CREATED_DESC';
  };

  // Calculate stats
  const activeProducts = products.filter(p => p.isActive).length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý toàn bộ sản phẩm trong hệ thống
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Quick Actions */}
          <Link
            to="/admin/products/create"
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Link>
          
          <div className="flex items-center space-x-2">
            <button className="btn btn-secondary text-sm">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="btn btn-secondary text-sm">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Báo cáo
            </button>
            <button className="btn btn-secondary text-sm">
              <CogIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">📦</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">✅</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đang bán</p>
              <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold text-sm">⭐</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Nổi bật</p>
              <p className="text-2xl font-bold text-gray-900">{featuredProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-sm">⚠️</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sắp hết</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold text-sm">❌</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hết hàng</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên, SKU, mô tả..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort */}
              <select
                value={filters.orderBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CREATED_DESC">Mới nhất</option>
                <option value="CREATED_ASC">Cũ nhất</option>
                <option value="NAME_ASC">Tên A-Z</option>
                <option value="NAME_DESC">Tên Z-A</option>
                <option value="PRICE_ASC">Giá thấp đến cao</option>
                <option value="PRICE_DESC">Giá cao đến thấp</option>
                <option value="STOCK_ASC">Tồn kho ít nhất</option>
                <option value="STOCK_DESC">Tồn kho nhiều nhất</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-2 inline" />
                Bộ lọc
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ViewColumnsIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters() && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Bộ lọc đang áp dụng:</span>
              {filters.condition?.name && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tên: {filters.condition.name}
                </span>
              )}
              {filters.orderBy !== 'CREATED_DESC' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Sắp xếp: {
                    {
                      'CREATED_ASC': 'Cũ nhất',
                      'NAME_ASC': 'Tên A-Z',
                      'NAME_DESC': 'Tên Z-A',
                      'PRICE_ASC': 'Giá thấp đến cao',
                      'PRICE_DESC': 'Giá cao đến thấp',
                      'STOCK_ASC': 'Tồn kho ít nhất',
                      'STOCK_DESC': 'Tồn kho nhiều nhất'
                    }[filters.orderBy]
                  }
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <AdminProductFilter 
              onFilterChange={handleFilterChange}
              className="max-w-4xl"
            />
          </div>
        )}
      </div>

      {/* Products Table/Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {error ? (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-2">❌</div>
            <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
            <button
              onClick={() => refetch()}
              className="btn btn-secondary"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <ProductTable
              products={products}
              loading={loading}
              viewMode={viewMode}
              isAdmin={true}
            />

            {/* Load More */}
            {hasNextPage && (
              <div className="p-4 border-t border-gray-200 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Đang tải...
                    </>
                  ) : (
                    'Tải thêm sản phẩm'
                  )}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có sản phẩm nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Bắt đầu bằng cách thêm sản phẩm đầu tiên của bạn
                </p>
                <Link
                  to="/admin/products/create"
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm sản phẩm đầu tiên
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;