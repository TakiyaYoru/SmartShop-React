// src/pages/ProductsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import ProductSearch from '../components/products/ProductSearch';
import { useProducts, useSearchProducts } from '../hooks/useProducts';

import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'CREATED_DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Get initial filters from URL
  const getInitialFilters = () => {
    return {
      price: { 
        min: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')) : '', 
        max: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')) : '' 
      },
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      stock: searchParams.get('stock') || 'all',
      isFeatured: searchParams.get('featured') === 'true',
      hasDiscount: searchParams.get('discount') === 'true'
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());

  // Re-sync filters when URL changes
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
  }, [searchParams]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Get initial search from URL
  const initialSearch = searchParams.get('q') || '';
  const isSearchMode = !!initialSearch;

  // ✅ FIXED: Sử dụng search hook khi có search query
  const searchHook = useSearchProducts();
  const {
    searchResults,
    isSearching,
    search,
    clearSearch
  } = searchHook;

  // ✅ FIXED: Sử dụng products hook khi không search
  const productsHook = useProducts({
    first: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    orderBy: sortBy,
    skip: isSearchMode // Skip products query khi đang search
  });

  // ✅ FIXED: Logic để lấy data đúng
  const getDisplayData = () => {
    console.log('getDisplayData - isSearchMode:', isSearchMode);
    console.log('getDisplayData - searchResults:', searchResults);
    console.log('getDisplayData - productsHook:', productsHook);
    
    if (isSearchMode) {
      return {
        products: searchResults || [],
        totalCount: searchResults?.length || 0,
        loading: isSearching,
        error: null,
        hasNextPage: false,
        hasPreviousPage: false
      };
    } else {
      return {
        products: productsHook.products || [],
        totalCount: productsHook.totalCount || 0,
        loading: productsHook.loading,
        error: productsHook.error,
        hasNextPage: productsHook.hasNextPage,
        hasPreviousPage: productsHook.hasPreviousPage
      };
    }
  };

  const { products: rawProducts, totalCount: rawTotalCount, loading, error } = getDisplayData();
  
  console.log('ProductsPage - rawProducts:', rawProducts);
  console.log('ProductsPage - loading:', loading);
  console.log('ProductsPage - error:', error);

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    if (!rawProducts) return [];
    
    return rawProducts.filter(product => {
      // Price range
      if (filters.price.min && product.price < filters.price.min) return false;
      if (filters.price.max && product.price > filters.price.max) return false;

      // Category
      if (filters.category && product.category?._id !== filters.category) return false;

      // Brand
      if (filters.brand && product.brand?._id !== filters.brand) return false;

      // Stock status
      if (filters.stock === 'inStock' && product.stock <= 0) return false;
      if (filters.stock === 'outOfStock' && product.stock > 0) return false;
      if (filters.stock === 'lowStock' && (product.stock <= 0 || product.stock > 10)) return false;

      // Featured products
      if (filters.isFeatured && !product.isFeatured) return false;

      // Discounted products
      if (filters.hasDiscount && (!product.originalPrice || product.originalPrice <= product.price)) return false;

      return true;
    });
  }, [rawProducts, filters]);

  // ✅ FIXED: Thêm các biến còn thiếu
  const totalFilteredCount = filteredProducts.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalFilteredCount);

  // Get current page products
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sort options
  const sortOptions = [
    { value: 'CREATED_DESC', label: 'Mới nhất', icon: '✨' },
    { value: 'CREATED_ASC', label: 'Cũ nhất', icon: '📅' },
    { value: 'PRICE_ASC', label: 'Giá thấp đến cao', icon: '💰' },
    { value: 'PRICE_DESC', label: 'Giá cao đến thấp', icon: '💎' },
    { value: 'NAME_ASC', label: 'Tên A-Z', icon: '🔤' },
    { value: 'NAME_DESC', label: 'Tên Z-A', icon: '🔤' },
  ];

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    
    // ✅ FIXED: Re-trigger search with new sort nếu đang search
    if (isSearchMode && initialSearch) {
      search(initialSearch, {
        first: itemsPerPage,
        offset: 0,
        orderBy: newSort
      });
    }
  };

  // ✅ FIXED: Handle search from search component
  const handleSearchSubmit = (query) => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setCurrentPage(1);
      
      // Trigger search
      search(query.trim(), {
        first: itemsPerPage,
        offset: 0,
        orderBy: sortBy
      });
    } else {
      setSearchParams({});
      clearSearch();
    }
    setShowMobileSearch(false);
  };

  // ✅ FIXED: Trigger search when URL changes
  useEffect(() => {
    if (initialSearch) {
      search(initialSearch, {
        first: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        orderBy: sortBy
      });
    } else {
      clearSearch();
    }
  }, [initialSearch, currentPage, sortBy]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    
    // Price range
    if (newFilters.price.min) {
      newParams.set('priceMin', newFilters.price.min.toString());
    } else {
      newParams.delete('priceMin');
    }
    
    if (newFilters.price.max) {
      newParams.set('priceMax', newFilters.price.max.toString());
    } else {
      newParams.delete('priceMax');
    }
    
    // Category
    if (newFilters.category) {
      newParams.set('category', newFilters.category);
    } else {
      newParams.delete('category');
    }
    
    // Brand
    if (newFilters.brand) {
      newParams.set('brand', newFilters.brand);
    } else {
      newParams.delete('brand');
    }
    
    // Stock
    if (newFilters.stock && newFilters.stock !== 'all') {
      newParams.set('stock', newFilters.stock);
    } else {
      newParams.delete('stock');
    }
    
    // Featured
    if (newFilters.isFeatured) {
      newParams.set('featured', 'true');
    } else {
      newParams.delete('featured');
    }
    
    // Discount
    if (newFilters.hasDiscount) {
      newParams.set('discount', 'true');
    } else {
      newParams.delete('discount');
    }
    
    setSearchParams(newParams, { replace: true });
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // ✅ FIXED: Handle pagination for search
      if (isSearchMode && initialSearch) {
        search(initialSearch, {
          first: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          orderBy: sortBy
        });
      }
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      price: { min: '', max: '' },
      category: '',
      brand: '',
      stock: 'all',
      isFeatured: false,
      hasDiscount: false
    });
    
    // Clear filter params from URL
    const newParams = new URLSearchParams(searchParams);
    ['priceMin', 'priceMax', 'category', 'brand', 'stock', 'featured', 'discount'].forEach(param => {
      newParams.delete(param);
    });
    setSearchParams(newParams, { replace: true });
    
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {initialSearch ? (
                  <>
                    Kết quả tìm kiếm
                    <span className="block text-2xl md:text-3xl font-normal mt-2 text-blue-100">
                      "{initialSearch}"
                    </span>
                  </>
                ) : (
                  <>
                    Khám phá
                    <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      {" "}Sản phẩm{" "}
                    </span>
                    tuyệt vời
                  </>
                )}
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                {loading ? 'Đang tải...' : `${totalFilteredCount.toLocaleString()} sản phẩm đang chờ bạn khám phá`}
              </p>
              
              {/* Desktop Search */}
              <div className="hidden md:block max-w-2xl mx-auto">
                <ProductSearch 
                  placeholder="Tìm kiếm sản phẩm mơ ước của bạn..."
                  onSearchSubmit={handleSearchSubmit}
                  className="transform scale-110"
                />
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-300/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-300/10 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Search */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="w-full btn bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 justify-center transition-all duration-200"
            >
              <span className="text-lg mr-2">🔍</span>
              Tìm kiếm sản phẩm
            </button>
            
            {showMobileSearch && (
              <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                <ProductSearch 
                  placeholder="Tìm kiếm sản phẩm..."
                  onSearchSubmit={handleSearchSubmit}
                />
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left side - Results info & filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Results Info */}
                {totalFilteredCount > 0 && (
                  <div className="text-sm text-gray-600 font-medium">
                    <span className="hidden sm:inline">Hiển thị </span>
                    <span className="text-blue-600 font-bold">
                      {startItem.toLocaleString()}-{endItem.toLocaleString()}
                    </span>
                    <span className="hidden sm:inline"> trong số </span>
                    <span className="sm:hidden"> / </span>
                    <span className="text-blue-600 font-bold">
                      {totalFilteredCount.toLocaleString()}
                    </span>
                    <span className="hidden sm:inline"> sản phẩm</span>
                  </div>
                )}

                {/* Clear Filters */}
                {(Object.values(filters).some(val => 
                  val !== '' && val !== false && val !== 'all'
                ) || initialSearch) && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    {isSearchMode ? 'Xóa tìm kiếm' : 'Xóa bộ lọc'}
                  </button>
                )}
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Lưới"
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Danh sách"
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    showFilters
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Bộ lọc</span>
                  {Object.values(filters).some(val => 
                    val !== '' && val !== false && val !== 'all'
                  ) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-8">
                <ProductFilter 
                  onFilterChange={handleFilterChange}
                  initialFilters={filters}
                  className="bg-white rounded-xl shadow-sm border border-gray-100"
                />
              </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex">
                <div className="bg-white w-full max-w-sm h-full overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">🎯 Bộ lọc sản phẩm</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-white hover:text-gray-200 p-1"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <ProductFilter 
                      onFilterChange={handleFilterChange}
                      initialFilters={filters}
                    />
                  </div>
                </div>
                <div 
                  className="flex-1" 
                  onClick={() => setShowFilters(false)} 
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Error State */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-6">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-3 text-2xl">⚠️</div>
                    <div>
                      <h3 className="text-lg font-medium text-red-800">
                        Oops! Có lỗi xảy ra
                      </h3>
                      <p className="text-red-700 mt-1">
                        {error.message || 'Không thể tải sản phẩm. Vui lòng thử lại sau.'}
                      </p>
                      <button
                        onClick={() => {
                          if (isSearchMode) {
                            search(initialSearch);
                          } else {
                            productsHook.refetch();
                          }
                        }}
                        className="mt-3 btn bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                      >
                        🔄 Thử lại
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Results */}
              {!loading && totalFilteredCount === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Xóa bộ lọc
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Làm mới trang
                    </button>
                  </div>
                </div>
              )}

              {/* Products List */}
              <ProductList
                products={currentProducts}
                loading={loading}
                viewMode={viewMode}
                showLoadMore={false}
                hasNextPage={currentPage < totalPages}
                loadingMore={false}
              />

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Trước
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau →
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;