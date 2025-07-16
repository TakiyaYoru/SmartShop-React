// webfrontend/src/pages/OrderDetailPage.jsx - FIXED VERSION
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { 
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PrinterIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ReviewButton from '../components/reviews/ReviewButton';
import { SmartImage } from '../utils/imageHelper';
import { 
  GET_MY_ORDER, 
  getOrderStatusInfo, 
  getPaymentStatusInfo,
  getPaymentMethodLabel 
} from '../graphql/orders';

const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  // GraphQL query
  const { data, loading, error, refetch } = useQuery(GET_MY_ORDER, {
    variables: { orderNumber },
    errorPolicy: 'all',
    skip: !orderNumber // Skip query if no orderNumber
  });

  const order = data?.getMyOrder;

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  // Safe access for customer info
  const getCustomerInfo = () => {
    // Kiểm tra order.customerInfo trước
    if (order?.customerInfo) {
      return {
        fullName: order.customerInfo.fullName || 'Chưa có thông tin',
        phone: order.customerInfo.phone || 'Chưa có SĐT',
        address: order.customerInfo.address || 'Chưa có địa chỉ',
        city: order.customerInfo.city || '',
        notes: order.customerInfo.notes || ''
      };
    }
    
    // Fallback về order.user nếu customerInfo không có
    if (order?.user) {
      return {
        fullName: order.user.fullName || `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Chưa có tên',
        phone: order.user.phone || 'Chưa có SĐT',
        address: order.user.address || 'Chưa có địa chỉ',
        city: order.user.city || '',
        notes: ''
      };
    }
    
    // Default values nếu không có thông tin gì
    return {
      fullName: 'Chưa có thông tin',
      phone: 'Chưa có SĐT',
      address: 'Chưa có địa chỉ',
      city: '',
      notes: ''
    };
  };

  // Get status badge
  const StatusBadge = ({ status, type = 'order', className = '' }) => {
    if (!status) return null;
    
    const statusInfo = type === 'order' ? 
      getOrderStatusInfo(status) : 
      getPaymentStatusInfo(status);
    
    // Map status to appropriate icon and color classes
    const getStatusDisplay = (status, color) => {
      const iconMap = {
        // Order status icons
        'pending': ClockIcon,
        'confirmed': CheckCircleIcon,
        'processing': ClockIcon,
        'shipping': TruckIcon,
        'delivered': CheckCircleIcon,
        'cancelled': XCircleIcon,
        // Payment status icons
        'paid': CheckCircleIcon,
        'failed': XCircleIcon,
        'refunded': ArrowLeftIcon
      };
      
      const colorMap = {
        'yellow': 'bg-yellow-100 text-yellow-800',
        'blue': 'bg-blue-100 text-blue-800',
        'purple': 'bg-purple-100 text-purple-800',
        'indigo': 'bg-indigo-100 text-indigo-800',
        'green': 'bg-green-100 text-green-800',
        'red': 'bg-red-100 text-red-800',
        'gray': 'bg-gray-100 text-gray-800'
      };
      
      const Icon = iconMap[status] || ClockIcon;
      const colorClass = colorMap[color] || 'bg-gray-100 text-gray-800';
      
      return { Icon, colorClass };
    };
    
    const { Icon, colorClass } = getStatusDisplay(status, statusInfo.color);
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass} ${className}`}>
        <Icon className="w-4 h-4 mr-1" />
        {statusInfo.label}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingSkeleton type="order-detail" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error.message?.includes('not found') 
                  ? 'Không tìm thấy đơn hàng'
                  : 'Có lỗi xảy ra'
                }
              </h2>
              <p className="text-gray-600 mb-6">
                {error.message?.includes('not found') 
                  ? 'Đơn hàng này không tồn tại hoặc bạn không có quyền xem.'
                  : `Lỗi: ${error.message}`
                }
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => refetch()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
                
                <Link
                  to="/orders"
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors block text-center"
                >
                  Xem tất cả đơn hàng
                </Link>
                
                <Link
                  to="/"
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors block text-center"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Order not found state (khác với error)
  if (!loading && !error && !order) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy đơn hàng
              </h2>
              <p className="text-gray-600 mb-6">
                Đơn hàng #{orderNumber} không tồn tại hoặc không thuộc về bạn.
              </p>
              
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block text-center"
                >
                  Xem tất cả đơn hàng
                </Link>
                
                <Link
                  to="/"
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors block text-center"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Safe access customer info
  const customerInfo = getCustomerInfo();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Quay lại
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Đơn hàng #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  Đặt ngày {formatDate(order.orderDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sản phẩm đã đặt ({order.items?.length || 0} sản phẩm)
                </h3>
                
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={item._id || index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16">
                          <SmartImage
                            src={item.product?.images?.[0] || item.productSnapshot?.images?.[0]}
                            alt={item.productName || 'Product'}
                            className="w-full h-full object-cover rounded-lg"
                            fallback="/placeholder-product.jpg"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.productName || 'Sản phẩm không có tên'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            SKU: {item.productSku || 'N/A'}
                          </p>
                          {item.productSnapshot?.brand && (
                            <p className="text-sm text-gray-600">
                              Thương hiệu: {item.productSnapshot.brand}
                            </p>
                          )}
                        </div>
                        
                        {/* Quantity & Price */}
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.unitPrice)} x {item.quantity}
                          </p>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                        {/* Review Button */}
                        {(order.status === 'delivered' || order.deliveredAt) && (
                          <div className="ml-4">
                            <ReviewButton
                              orderNumber={orderNumber}
                              productId={item.productId}
                              productName={item.productName}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Không có sản phẩm trong đơn hàng
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch sử đơn hàng
                </h3>
                
                <div className="space-y-4">
                  {/* Order Created */}
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Đơn hàng được tạo</p>
                      <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  
                  {/* Confirmed */}
                  {order.confirmedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Đã xác nhận</p>
                        <p className="text-sm text-gray-600">{formatDate(order.confirmedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Processed */}
                  {order.processedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Đang xử lý</p>
                        <p className="text-sm text-gray-600">{formatDate(order.processedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Shipped */}
                  {order.shippedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Đã giao cho vận chuyển</p>
                        <p className="text-sm text-gray-600">{formatDate(order.shippedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivered */}
                  {order.deliveredAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-700 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Đã giao hàng</p>
                        <p className="text-sm text-gray-600">{formatDate(order.deliveredAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Cancelled */}
                  {order.cancelledAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Đã hủy</p>
                        <p className="text-sm text-gray-600">{formatDate(order.cancelledAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tóm tắt đơn hàng
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin thanh toán
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CreditCardIcon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </p>
                      <StatusBadge status={order.paymentStatus} type="payment" className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin khách hàng
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{customerInfo.fullName}</p>
                      <p className="text-gray-600">{customerInfo.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{customerInfo.address}</p>
                      {customerInfo.city && (
                        <p className="text-gray-600">{customerInfo.city}</p>
                      )}
                    </div>
                  </div>
                  
                  {customerInfo.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Ghi chú:</strong> {customerInfo.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thao tác
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    In đơn hàng
                  </button>
                  
                  <Link
                    to="/orders"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Về danh sách đơn hàng
                  </Link>
                  
                  <Link
                    to="/products"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default OrderDetailPage;