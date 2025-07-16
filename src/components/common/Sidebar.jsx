// src/components/common/Sidebar.jsx - Complete updated version with Orders
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlusIcon,
  ClockIcon,
  TruckIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ 
  isOpen = true, 
  onToggle, 
  type = 'admin'
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({
    products: true, // Mặc định mở sản phẩm
    orders: true    // Mặc định mở đơn hàng
  });

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // ✅ UPDATED: Admin Navigation with Orders section
  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: HomeIcon,
      current: location.pathname === '/admin'
    },
    {
      name: 'Sản phẩm',
      icon: CubeIcon,
      key: 'products',
      current: location.pathname.startsWith('/admin/products'),
      children: [
        { 
          name: 'Tất cả sản phẩm', 
          href: '/admin/products',
          current: location.pathname === '/admin/products'
        },
        { 
          name: 'Thêm sản phẩm', 
          href: '/admin/products/create',
          current: location.pathname === '/admin/products/create'
        }
      ]
    },
    {
      name: 'Đơn hàng', // 🆕 NEW ORDERS SECTION
      icon: ShoppingCartIcon,
      key: 'orders',
      current: location.pathname.startsWith('/admin/orders'),
      children: [
        { 
          name: 'Tất cả đơn hàng', 
          href: '/admin/orders',
          current: location.pathname === '/admin/orders',
          icon: DocumentTextIcon
        },
        { 
          name: 'Tạo đơn hàng', 
          href: '/admin/orders/create',
          current: location.pathname === '/admin/orders/create',
          icon: PlusIcon
        },
        { 
          name: 'Đơn chờ xử lý', 
          href: '/admin/orders?status=pending',
          current: location.pathname === '/admin/orders' && location.search.includes('status=pending'),
          icon: ClockIcon
        },
        { 
          name: 'Đơn đang giao', 
          href: '/admin/orders?status=shipping',
          current: location.pathname === '/admin/orders' && location.search.includes('status=shipping'),
          icon: TruckIcon
        }
      ]
    },
    {
      name: 'Đánh giá', // 🆕 NEW REVIEWS SECTION
      href: '/admin/reviews',
      icon: StarIcon,
      current: location.pathname === '/admin/reviews'
    },
    {
      name: 'Danh mục',
      href: '/admin/categories',
      icon: TagIcon,
      current: location.pathname === '/admin/categories'
    },
    {
      name: 'Thương hiệu',
      href: '/admin/brands',
      icon: BuildingStorefrontIcon,
      current: location.pathname === '/admin/brands'
    },
    {
      name: 'Khách hàng',
      href: '/admin/users',
      icon: UserGroupIcon,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Báo cáo',
      href: '/admin/reports',
      icon: ChartBarIcon,
      current: location.pathname === '/admin/reports'
    },
    {
      name: 'Cài đặt',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      current: location.pathname === '/admin/settings'
    }
  ];

  // Admin Sidebar Component
  const AdminSidebar = () => (
    <div className={`bg-white h-full shadow-lg transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    } relative z-50`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isOpen && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">SmartShop</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isOpen ? (
            <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Info */}
      {isOpen && user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.fullName || 'Admin User'}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? '👑 Admin' : '👨‍💼 Manager'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {adminNavigation.map((item) => {
          // Menu có submenu
          if (item.children) {
            const isExpanded = expandedMenus[item.key];
            const hasCurrentChild = item.children.some(child => child.current);
            
            return (
              <div key={item.name}>
                {/* Parent menu item */}
                <button
                  onClick={() => toggleSubmenu(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current || hasCurrentChild
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {isOpen && <span>{item.name}</span>}
                  </div>
                  {isOpen && (
                    <span className="ml-2">
                      {isExpanded ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {isOpen && isExpanded && (
                  <div className="mt-1 ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          child.current
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {child.icon && <child.icon className="h-4 w-4 mr-2" />}
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Menu đơn lẻ
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            SmartShop Admin v1.0.0
          </div>
        </div>
      )}
    </div>
  );

  // Filter Sidebar (cho trang products)
  const FilterSidebar = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Bộ lọc</h3>
      
      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Khoảng giá</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-600">Dưới 1 triệu</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-600">1 - 5 triệu</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-600">5 - 10 triệu</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-600">Trên 10 triệu</span>
          </label>
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Thương hiệu</h4>
        <div className="space-y-2">
          {['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'].map((brand) => (
            <label key={brand} className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Đánh giá</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">
                {rating} sao trở lên
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Render based on type
  switch (type) {
    case 'filter':
      return <FilterSidebar />;
    case 'admin':
      return <AdminSidebar />;
    default:
      return <AdminSidebar />;
  }
};

export default Sidebar;