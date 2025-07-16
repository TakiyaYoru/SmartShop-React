// webfrontend/src/pages/admin/AdminOrdersPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BanknotesIcon,
  CalendarIcon,
  ShoppingBagIcon,
  PrinterIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { 
  GET_ALL_ORDERS, 
  GET_ORDER_STATS,
  UPDATE_ORDER_STATUS,
  UPDATE_PAYMENT_STATUS,
  getOrderStatusInfo,
  getPaymentStatusInfo,
  getPaymentMethodLabel,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS
} from '../../graphql/orders';

const AdminOrdersPage = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortBy, setSortBy] = useState('DATE_DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const itemsPerPage = 20;

  // Build filter condition
  const buildCondition = () => {
    const condition = {};
    if (statusFilter) condition.status = statusFilter;
    if (paymentStatusFilter) condition.paymentStatus = paymentStatusFilter;
    if (paymentMethodFilter) condition.paymentMethod = paymentMethodFilter;
    if (dateRange.from) condition.dateFrom = dateRange.from;
    if (dateRange.to) condition.dateTo = dateRange.to;
    return condition;
  };

  // GraphQL queries
  const { data: ordersData, loading, error, refetch } = useQuery(GET_ALL_ORDERS, {
    variables: {
      first: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      orderBy: sortBy,
      condition: buildCondition(),
      search: searchTerm || undefined
    },
    errorPolicy: 'all',
    pollInterval: 30000 // Refresh every 30 seconds
  });

  const { data: statsData } = useQuery(GET_ORDER_STATS, {
    errorPolicy: 'all'
  });

  // Mutations
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      setUpdatingOrder(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
      setUpdatingOrder(null);
    }
  });

  const [updatePaymentStatus] = useMutation(UPDATE_PAYMENT_STATUS, {
    onCompleted: () => {
      toast.success('Cập nhật trạng thái thanh toán thành công!');
      setUpdatingOrder(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
      setUpdatingOrder(null);
    }
  });

  const orders = ordersData?.getAllOrders?.nodes || [];
  const totalCount = ordersData?.getAllOrders?.totalCount || 0;
  const hasNextPage = ordersData?.getAllOrders?.hasNextPage || false;
  const hasPreviousPage = ordersData?.getAllOrders?.hasPreviousPage || false;
  const stats = statsData?.getOrderStats;

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle status updates
  const handleStatusUpdate = async (orderNumber, newStatus, type = 'order') => {
    if (!window.confirm(`Bạn có chắc muốn cập nhật trạng thái?`)) return;
    
    setUpdatingOrder(orderNumber);
    
    try {
      if (type === 'order') {
        await updateOrderStatus({
          variables: { 
            orderNumber, 
            status: newStatus,
            adminNotes: `Cập nhật trạng thái thành ${getOrderStatusInfo(newStatus).label} bởi admin`
          }
        });
      } else {
        await updatePaymentStatus({
          variables: { orderNumber, paymentStatus: newStatus }
        });
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setPaymentMethodFilter('');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
  };

  // Status Badge Component
  const StatusBadge = ({ status, type = 'order', className = '', orderNumber }) => {
    if (!status) return null;
    
    const statusInfo = type === 'order' ? 
      getOrderStatusInfo(status) : 
      getPaymentStatusInfo(status);
    
    const getStatusDisplay = (status, color) => {
      const iconMap = {
        'pending': ClockIcon,
        'confirmed': CheckCircleIcon,
        'processing': ClockIcon,
        'shipping': TruckIcon,
        'delivered': CheckCircleIcon,
        'cancelled': XCircleIcon,
        'paid': CheckCircleIcon,
        'failed': XCircleIcon,
        'refunded': BanknotesIcon
      };
      
      const colorMap = {
        'yellow': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        'blue': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        'purple': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        'indigo': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
        'green': 'bg-green-100 text-green-800 hover:bg-green-200',
        'red': 'bg-red-100 text-red-800 hover:bg-red-200',
        'gray': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      };
      
      const Icon = iconMap[status] || ClockIcon;
      const colorClass = colorMap[color] || 'bg-gray-100 text-gray-800';
      
      return { Icon, colorClass };
    };
    
    const { Icon, colorClass } = getStatusDisplay(status, statusInfo.color);
    
    // Create dropdown for status updates
    const getNextStatuses = () => {
      if (type === 'order') {
        const allStatuses = ORDER_STATUS_OPTIONS.filter(opt => opt.value !== status);
        return allStatuses;
      } else {
        const allStatuses = PAYMENT_STATUS_OPTIONS.filter(opt => opt.value !== status);
        return allStatuses;
      }
    };

    const nextStatuses = getNextStatuses();

    return (
      <div className="relative group">
        <button className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${colorClass} ${className}`}>
          <Icon className="w-3 h-3 mr-1" />
          {statusInfo.label}
          <ChevronDownIcon className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <div className="py-1">
            {nextStatuses.map((statusOption) => (
              <button
                key={statusOption.value}
                onClick={() => handleStatusUpdate(orderNumber, statusOption.value, type)}
                disabled={updatingOrder === orderNumber}
                className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  statusOption.color === 'yellow' ? 'bg-yellow-500' :
                  statusOption.color === 'blue' ? 'bg-blue-500' :
                  statusOption.color === 'purple' ? 'bg-purple-500' :
                  statusOption.color === 'indigo' ? 'bg-indigo-500' :
                  statusOption.color === 'green' ? 'bg-green-500' :
                  statusOption.color === 'red' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                {statusOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && !ordersData) {
    return (
      <div className="p-6">
        <LoadingSkeleton type="admin-orders" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {totalCount} đơn hàng
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          
          <Link
            to="/admin/orders/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Tạo đơn hàng
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã xác nhận</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmedOrders}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang giao</p>
                <p className="text-2xl font-bold text-purple-600">{stats.shippingOrders}</p>
              </div>
              <TruckIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <CheckCircleSolid className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã hủy</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu</p>
                <p className="text-lg font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <BanknotesIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Tìm kiếm & Lọc</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FunnelIcon className="w-4 h-4 mr-1" />
              Bộ lọc
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hàng, tên khách hàng, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái đơn hàng
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  {ORDER_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái thanh toán
                </label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  {PAYMENT_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="cod">COD</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Filter Actions */}
              <div className="md:col-span-2 lg:col-span-5 flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={() => { setCurrentPage(1); refetch(); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items?.length || 0} sản phẩm
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerInfo?.fullName || order.user?.firstName + ' ' + order.user?.lastName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerInfo?.phone || order.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} orderNumber={order.orderNumber} />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <StatusBadge 
                          status={order.paymentStatus} 
                          type="payment" 
                          orderNumber={order.orderNumber}
                        />
                        <div className="text-xs text-gray-500">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.orderDate)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/orders/${order.orderNumber}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => window.print()}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="In đơn hàng"
                        >
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || statusFilter || paymentStatusFilter ? 
                        'Không tìm thấy đơn hàng nào phù hợp' : 
                        'Chưa có đơn hàng nào'
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > itemsPerPage && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!hasPreviousPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{' '}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}
                    </span>{' '}
                    đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalCount)}
                    </span>{' '}
                    trong tổng số{' '}
                    <span className="font-medium">{totalCount}</span> đơn hàng
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!hasPreviousPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      if (pageNum > Math.ceil(totalCount / itemsPerPage)) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;