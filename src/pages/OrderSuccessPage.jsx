// webfrontend/src/pages/OrderSuccessPage.jsx - FIXED VERSION
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { 
  CheckCircleIcon,
  TruckIcon,
  PhoneIcon,
  ClockIcon,
  HomeIcon,
  ShoppingBagIcon,
  PrinterIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { GET_MY_ORDER } from '../graphql/orders';
import { useCart } from '../contexts/CartContext';
import { SmartImage } from '../utils/imageHelper';
const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  // GraphQL query với error handling cải thiện
  const { data, loading, error, refetch } = useQuery(GET_MY_ORDER, {
    variables: { orderNumber },
    errorPolicy: 'all',
    skip: !orderNumber,
    notifyOnNetworkStatusChange: true
  });

  const order = data?.getMyOrder;

  // Refresh cart when component mounts
  useEffect(() => {
    if (refreshCart) {
      refreshCart();
    }
  }, [refreshCart]);

  // Redirect if no order number
  useEffect(() => {
    if (!orderNumber) {
      console.log('No order number provided, redirecting to home');
      navigate('/');
    }
  }, [orderNumber, navigate]);

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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Đang tải thông tin đơn hàng...
                </h2>
                <p className="text-gray-600">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
              <LoadingSkeleton className="h-96" />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Error state với retry option
  if (error && !order) {
    console.error('OrderSuccessPage error:', error);
    
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Không thể tải thông tin đơn hàng
              </h2>
              <p className="text-gray-600 mb-6">
                {error.message === 'Order not found' 
                  ? 'Không tìm thấy đơn hàng này.'
                  : 'Có lỗi xảy ra khi tải thông tin đơn hàng.'
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

  // Order not found state (different from error)
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
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors block text-center"
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

  // Success state - order found
  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Đặt hàng thành công!
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Cảm ơn bạn đã tin tường và mua sắm tại SmartShop
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">
                  Mã đơn hàng: <strong>#{order.orderNumber}</strong>
                </span>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin đơn hàng
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Chi tiết đơn hàng</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày đặt:</span>
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {order.status === 'pending' ? 'Chờ xác nhận' : 
                           order.status === 'confirmed' ? 'Đã xác nhận' :
                           order.status === 'processing' ? 'Đang xử lý' :
                           order.status === 'shipping' ? 'Đang giao hàng' :
                           order.status === 'delivered' ? 'Đã giao hàng' : 'Đã hủy'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thanh toán:</span>
                        <span>{order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền:</span>
                        <span className="font-semibold text-lg text-blue-600">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin giao hàng</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Người nhận:</span>
                        <span className="ml-2 font-medium">{order.customerInfo.fullName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Điện thoại:</span>
                        <span className="ml-2">{order.customerInfo.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Địa chỉ:</span>
                        <span className="ml-2">{order.customerInfo.address}, {order.customerInfo.city}</span>
                      </div>
                      {order.customerInfo.notes && (
                        <div>
                          <span className="text-gray-600">Ghi chú:</span>
                          <span className="ml-2">{order.customerInfo.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sản phẩm đã đặt ({order.items.length} sản phẩm)
                  </h3>
                  
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={item._id || index} className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-0">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <SmartImage
                            src={item.productSnapshot?.images?.[0] || item.product?.images?.[0]}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            fallback="/placeholder-product.jpg"
                          />
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </h4>
                          <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </span>
                            <div className="text-right">
                              <span className="text-sm text-gray-500">
                                {formatPrice(item.unitPrice)} x {item.quantity}
                              </span>
                              <div className="font-medium text-gray-900">
                                {formatPrice(item.totalPrice)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Bước tiếp theo
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <strong>Xác nhận đơn hàng:</strong> Chúng tôi sẽ liên hệ xác nhận trong vòng 2-4 giờ
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <strong>Chuẩn bị hàng:</strong> Đóng gói và chuẩn bị giao hàng trong 1-2 ngày
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <strong>Giao hàng:</strong> Nhận hàng và thanh toán (nếu chọn COD)
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                Liên hệ hỗ trợ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Hotline:</strong> 
                  <a href="tel:1900xxxx" className="text-blue-600 hover:text-blue-800 ml-1">
                    1900.xxxx
                  </a>
                </div>
                <div>
                  <strong>Email:</strong> 
                  <a href="mailto:support@smartshop.com" className="text-blue-600 hover:text-blue-800 ml-1">
                    support@smartshop.com
                  </a>
                </div>
                <div>
                  <strong>Giờ hoạt động:</strong> 8:00 - 22:00 (Thứ 2 - CN)
                </div>
                <div>
                  <strong>Chat hỗ trợ:</strong> Có sẵn trên website
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to={`/orders/${order.orderNumber}`}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <TruckIcon className="h-5 w-5 mr-2" />
                Theo dõi đơn hàng
              </Link>

              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <PrinterIcon className="h-5 w-5 mr-2" />
                In đơn hàng
              </button>

              <Link
                to="/products"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Tiếp tục mua sắm
              </Link>

              <Link
                to="/"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Về trang chủ
              </Link>
            </div>

            {/* Thank you message */}
            <div className="text-center mt-8 py-6 border-t border-gray-200">
              <p className="text-gray-600">
                Cảm ơn bạn đã lựa chọn SmartShop! 🛒✨
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Chúng tôi sẽ cố gắng mang đến trải nghiệm mua sắm tốt nhất cho bạn.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default OrderSuccessPage;