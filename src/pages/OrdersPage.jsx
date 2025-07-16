// webfrontend/src/pages/OrdersPage.jsx - ENHANCED WITH CANCEL & PROPER IMAGES
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ShoppingBagIcon, 
  EyeIcon, 
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  StarIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { 
  GET_MY_ORDERS, 
  CANCEL_ORDER,
  getOrderStatusInfo, 
  getPaymentStatusInfo,
  getPaymentMethodLabel
} from '../graphql/orders';

const OrdersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState('DATE_DESC');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const itemsPerPage = 10;

  // GraphQL query
  const { data, loading, error, refetch } = useQuery(GET_MY_ORDERS, {
    variables: {
      first: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      orderBy: orderBy
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true
  });

  // Cancel order mutation
  const [cancelOrderMutation] = useMutation(CANCEL_ORDER, {
    onCompleted: (data) => {
      if (data.cancelOrder) {
        toast.success('Đã hủy đơn hàng thành công!');
        refetch(); // Refresh orders list
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể hủy đơn hàng');
    },
    onSettled: () => {
      setCancellingOrder(null);
    }
  });

  const orders = data?.getMyOrders?.nodes || [];
  const totalCount = data?.getMyOrders?.totalCount || 0;
  const hasNextPage = data?.getMyOrders?.hasNextPage || false;
  const hasPreviousPage = data?.getMyOrders?.hasPreviousPage || false;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle cancel order
  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    setCancellingOrder(orderNumber);
    try {
      await cancelOrderMutation({
        variables: {
          orderNumber,
          reason: 'Khách hàng yêu cầu hủy đơn'
        }
      });
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status Timeline Component
  const StatusTimeline = ({ status, orderDate, confirmedAt, shippedAt, deliveredAt }) => {
    const steps = [
      { key: 'pending', label: 'Đặt hàng', icon: ShoppingBagIcon, date: orderDate },
      { key: 'confirmed', label: 'Xác nhận', icon: CheckCircleIcon, date: confirmedAt },
      { key: 'shipping', label: 'Vận chuyển', icon: TruckIcon, date: shippedAt },
      { key: 'delivered', label: 'Hoàn thành', icon: CheckCircleSolid, date: deliveredAt }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === status);
    
    return (
      <div className="flex items-center space-x-2 text-xs">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <React.Fragment key={step.key}>
              <div className={`flex items-center space-x-1 ${
                isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <StepIcon className="w-3 h-3" />
                </div>
                <span className={`font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  isCompleted ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Product Item Component with proper image handling
  const ProductItem = ({ item }) => {
    const product = item.product || {};
    const snapshot = item.productSnapshot || {};
    
    // ✅ FIX: Get product image with proper priority and fallback
    const getProductImage = () => {
      // Priority 1: Product images (current/live product)
      if (product.images && product.images.length > 0) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/img/${product.images[0]}`;
      }
      
      // Priority 2: Snapshot images (from order time)
      if (snapshot.images && snapshot.images.length > 0) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/img/${snapshot.images[0]}`;
      }
      
      return null;
    };

    const productImage = getProductImage();

    return (
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        {/* ✅ ENHANCED: Product Image with better styling */}
        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0 shadow-sm">
          {productImage ? (
            <img
              src={productImage}
              alt={item.productName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-lg">
            📦
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-lg truncate mb-1">
            {item.productName}
          </h4>
          
          {/* Product details */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 space-x-3">
              <span className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                {item.productSku}
              </span>
              <span className="font-medium">
                Số lượng: {item.quantity}
              </span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-gray-900">
                {formatPrice(item.totalPrice)}
              </div>
              {item.quantity > 1 && (
                <div className="text-sm text-gray-500">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </div>
              )}
            </div>
          </div>
          
          {/* Brand & Category from snapshot or product */}
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            {(snapshot.brand || product.brand?.name) && (
              <span className="inline-flex items-center">
                🏷️ {snapshot.brand || product.brand?.name}
              </span>
            )}
            {(snapshot.category || product.category?.name) && (
              <span className="inline-flex items-center">
                📂 {snapshot.category || product.category?.name}
              </span>
            )}
          </div>
        </div>
        {/* Nút Đánh giá */}
        {(item.orderStatus === 'delivered' || item.deliveredAt) && (
          <div className="ml-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              // onClick={() => ... sẽ hiện form ở task sau}
            >
              Đánh giá
            </button>
          </div>
        )}
      </div>
    );
  };

  // Main Order Card Component
  const OrderCard = ({ order }) => {
    const statusInfo = getOrderStatusInfo(order.status);
    const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
    const [showItems, setShowItems] = useState(false);
    const canCancel = ['pending', 'confirmed'].includes(order.status);
    const isCancelling = cancellingOrder === order.orderNumber;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            {/* Left side - Order info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    #{order.orderNumber}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(order.orderDate)}
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <CreditCardIcon className="h-4 w-4 mr-1" />
                      {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Timeline - Hide for cancelled orders */}
              {order.status !== 'cancelled' && (
                <div className="mb-4">
                  <StatusTimeline 
                    status={order.status}
                    orderDate={order.orderDate}
                    confirmedAt={order.confirmedAt}
                    shippedAt={order.shippedAt}
                    deliveredAt={order.deliveredAt}
                  />
                </div>
              )}

              {/* Status Badges */}
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                  statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {statusInfo.label}
                </span>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  paymentInfo.color === 'green' ? 'bg-green-50 text-green-700 border border-green-200' :
                  paymentInfo.color === 'yellow' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {paymentInfo.label}
                </span>
              </div>
            </div>

            {/* Right side - Price */}
            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatPrice(order.totalAmount)}
              </div>
              <div className="text-sm text-gray-500">
                {order.items?.length || 0} sản phẩm
              </div>
            </div>
          </div>
        </div>



        {/* Product Items */}
        {order.items && order.items.length > 0 && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 text-lg">
                Sản phẩm đã đặt ({order.items.length})
              </h4>
              {order.items.length > 1 && (
                <button
                  onClick={() => setShowItems(!showItems)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {showItems ? '↑ Ẩn bớt' : '↓ Xem tất cả'}
                </button>
              )}
            </div>

            {/* Show first item or all if expanded */}
            <div className="space-y-3">
              {(showItems ? order.items : order.items.slice(0, 1)).map((item, index) => (
                <ProductItem key={item._id || index} item={item} />
              ))}
              
              {!showItems && order.items.length > 1 && (
                <div className="text-center py-3 border border-gray-200 border-dashed rounded-lg">
                  <button
                    onClick={() => setShowItems(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Xem thêm {order.items.length - 1} sản phẩm
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Quick actions based on status */}
              {order.status === 'delivered' && (
                <>
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                    <StarIcon className="h-4 w-4" />
                    <span>Đánh giá</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <ShoppingBagIcon className="h-4 w-4" />
                    <span>Mua lại</span>
                  </button>
                </>
              )}
              
              {/* ✅ ENHANCED: Cancel button with loading state */}
              {canCancel && (
                <button
                  onClick={() => handleCancelOrder(order.orderNumber)}
                  disabled={isCancelling}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isCancelling 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-red-700 bg-red-50 hover:bg-red-100'
                  }`}
                >
                  {isCancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang hủy...</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4" />
                      <span>Hủy đơn</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* View Details */}
            <Link
              to={`/orders/${order.orderNumber}`}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Chi tiết đơn hàng</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Filters Component
  const FiltersSection = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="DATE_DESC">Mới nhất</option>
            <option value="DATE_ASC">Cũ nhất</option>
            <option value="TOTAL_DESC">Giá trị cao nhất</option>
            <option value="TOTAL_ASC">Giá trị thấp nhất</option>
          </select>

          <button
            onClick={() => refetch()}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <LoadingSkeleton className="h-10 w-64 mb-2" />
                <LoadingSkeleton className="h-6 w-96" />
              </div>
              <FiltersSection />
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <LoadingSkeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Đơn hàng của tôi
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    Theo dõi và quản lý tất cả đơn hàng của bạn
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Tổng đơn hàng</p>
                      <p className="text-3xl font-bold">{totalCount}</p>
                    </div>
                    <ShoppingBagIcon className="h-8 w-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Đã giao hàng</p>
                      <p className="text-3xl font-bold">
                        {orders.filter(o => o.status === 'delivered').length}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-8 w-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Đang xử lý</p>
                      <p className="text-3xl font-bold">
                        {orders.filter(o => ['confirmed', 'processing', 'shipping'].includes(o.status)).length}
                      </p>
                    </div>
                    <TruckIcon className="h-8 w-8 text-yellow-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Tổng chi tiêu</p>
                      <p className="text-2xl font-bold">
                        {formatPrice(orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0))}
                      </p>
                    </div>
                    <CurrencyDollarIcon className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <FiltersSection />

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy đơn hàng bạn cần.'
                    : 'Khám phá các sản phẩm tuyệt vời tại SmartShop và tạo đơn hàng đầu tiên của bạn!'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link
                    to="/products"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  >
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                    Khám phá sản phẩm
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {filteredOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalCount > itemsPerPage && (
              <div className="mt-12 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!hasPreviousPage}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Trang {currentPage} / {Math.ceil(totalCount / itemsPerPage)}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!hasNextPage}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default OrdersPage;