// src/components/products/ProductSearch.jsx - Modern & Beautiful Design
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { useSearchProducts } from '../../hooks/useProducts';
import { formatPrice, getImageUrl } from '../../lib/utils';

const ProductSearch = ({ 
  placeholder = "Tìm kiếm sản phẩm...",
  className = "",
  showSuggestions = true,
  onSearchSubmit
}) => {
  const navigate = useNavigate();
  const { searchResults, isSearching, search, clearSearch } = useSearchProducts();
  
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches] = useState([
    { term: 'iPhone 15', trend: '+25%', icon: '📱' },
    { term: 'MacBook Pro', trend: '+18%', icon: '💻' },
    { term: 'Samsung Galaxy', trend: '+15%', icon: '📱' },
    { term: 'AirPods Pro', trend: '+30%', icon: '🎧' },
    { term: 'iPad Air', trend: '+12%', icon: '📱' }
  ]);

  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartshop_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(updated);
    localStorage.setItem('smartshop_recent_searches', JSON.stringify(updated));
  };

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 2) {
      search(value, { first: 5 }); // Search with limit for suggestions
      setShowResults(true);
    } else {
      clearSearch();
      setShowResults(value.length > 0);
    }
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    saveRecentSearch(searchQuery.trim());
    setShowResults(false);
    setQuery(searchQuery);
    
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const handleClear = () => {
    setQuery('');
    clearSearch();
    setShowResults(false);
  };

  // Remove recent search item
  const removeRecentSearch = (item) => {
    const updated = recentSearches.filter(search => search !== item);
    setRecentSearches(updated);
    localStorage.setItem('smartshop_recent_searches', JSON.stringify(updated));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-900 placeholder-gray-500 text-lg transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
            autoComplete="off"
          />
          
          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}

          {/* Search button overlay */}
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-500 hover:text-blue-600 transition-colors"
            style={{ display: query && !isSearching ? 'flex' : 'none' }}
          >
            <div className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
              <MagnifyingGlassIcon className="h-4 w-4" />
            </div>
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showSuggestions && showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden"
        >
          {/* Loading */}
          {isSearching && query.length > 2 && (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-gray-500">Đang tìm kiếm...</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && query.length > 2 && (
            <div>
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Sản phẩm tìm thấy
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-full px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl bg-gray-100 shadow-sm"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      {product.isFeatured && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <SparklesIcon className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate">
                          {product.brand?.name} • {product.category?.name}
                        </p>
                        <p className="text-sm font-bold text-red-600 ml-2">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* View all results */}
              <div className="border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => performSearch(query)}
                  className="w-full px-6 py-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Xem tất cả {searchResults.length}+ kết quả cho "{query}"
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults.length === 0 && query.length > 2 && !isSearching && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Không tìm thấy sản phẩm nào cho "<span className="font-medium">{query}</span>"
              </p>
              <p className="text-xs text-gray-400">
                Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {(!query || query.length <= 2) && recentSearches.length > 0 && (
            <div>
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Tìm kiếm gần đây
                </h3>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {recentSearches.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 group"
                  >
                    <button
                      onClick={() => {
                        setQuery(item);
                        performSearch(item);
                      }}
                      className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900 flex items-center"
                    >
                      <ClockIcon className="h-3 w-3 mr-3 text-gray-400" />
                      {item}
                    </button>
                    <button
                      onClick={() => removeRecentSearch(item)}
                      className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {(!query || query.length <= 2) && trendingSearches.length > 0 && (
            <div>
              <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <FireIcon className="h-4 w-4 mr-2 text-orange-500" />
                  Xu hướng tìm kiếm
                </h3>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {trendingSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item.term);
                      performSearch(item.term);
                    }}
                    className="w-full flex items-center justify-between px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 group"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{item.icon}</span>
                      <span>{item.term}</span>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {item.trend}
                      </span>
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!query || query.length <= 2) && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Bắt đầu tìm kiếm
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Nhập từ khóa để tìm kiếm hàng nghìn sản phẩm
              </p>
              
              {/* Quick search suggestions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['iPhone', 'Samsung', 'Laptop', 'Tai nghe'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      performSearch(suggestion);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;