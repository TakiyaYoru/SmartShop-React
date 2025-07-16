// src/pages/admin/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

import { GET_ADMIN_REVIEW_STATS } from '../../graphql/reviews';

const DashboardPage = () => {
  // Fetch real data
  const { data: reviewStats, loading: statsLoading } = useQuery(GET_ADMIN_REVIEW_STATS);

  // Calculate statistics from real data
  const calculateStats = () => {
    if (!reviewStats) return {
      totalReviews: 0,
      averageRating: 0,
      pendingReviews: 0,
      fiveStarReviews: 0
    };

    const allReviews = reviewStats.getAllReviewsForAdmin?.items || [];
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const fiveStarReviews = allReviews.filter(review => review.rating === 5).length;
    const pendingReviews = reviewStats.getPendingAdminReviews?.totalCount || 0;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      pendingReviews,
      fiveStarReviews
    };
  };

  const stats = calculateStats();

  const statsCards = [
    {
      name: 'Tổng sản phẩm',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: CubeIcon,
      color: 'blue',
      href: '/admin/products'
    },
    {
      name: 'Đơn hàng mới',
      value: '56',
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
      color: 'green',
      href: '/admin/orders'
    },
    {
      name: 'Đánh giá chờ phản hồi',
      value: statsLoading ? '...' : stats.pendingReviews.toString(),
      change: '+15%',
      changeType: 'positive',
      icon: StarIcon,
      color: 'orange',
      href: '/admin/reviews'
    },
    {
      name: 'Tổng đánh giá',
      value: statsLoading ? '...' : stats.totalReviews.toString(),
      change: stats.averageRating > 0 ? `${stats.averageRating}/5` : '0/5',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'purple',
      href: '/admin/reviews'
    }
  ];

  const getColorClasses = (color, type = 'bg') => {
    const colors = {
      blue: type === 'bg' ? 'bg-blue-500' : 'text-blue-600',
      green: type === 'bg' ? 'bg-green-500' : 'text-green-600',
      purple: type === 'bg' ? 'bg-purple-500' : 'text-purple-600',
      red: type === 'bg' ? 'bg-red-500' : 'text-red-600',
      orange: type === 'bg' ? 'bg-orange-500' : 'text-orange-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng trở lại! 👋
        </h1>
        <p className="text-blue-100">
          Đây là tổng quan về hoạt động kinh doanh của SmartShop
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.name === 'Tổng đánh giá' ? stat.change : `${stat.change} từ tháng trước`}
                </p>
              </div>
              <div className={`w-12 h-12 ${getColorClasses(stat.color)} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tính năng đang phát triển</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
          </div>
          <div className="p-6 space-y-3">
            <Link to="/admin/products/create" className="w-full btn btn-primary justify-start">
              <CubeIcon className="h-5 w-5 mr-3" />
              Thêm sản phẩm mới
            </Link>
            <Link to="/admin/reviews" className="w-full btn btn-secondary justify-start">
              <StarIcon className="h-5 w-5 mr-3" />
              Quản lý đánh giá
            </Link>
            <Link to="/admin/orders" className="w-full btn btn-secondary justify-start">
              <ShoppingCartIcon className="h-5 w-5 mr-3" />
              Xem đơn hàng
            </Link>
            <Link to="/admin/categories" className="w-full btn btn-secondary justify-start">
              <TagIcon className="h-5 w-5 mr-3" />
              Quản lý danh mục
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;