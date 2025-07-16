// webfrontend/src/pages/admin/AdminOrderDetailPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { SmartImage } from '../../utils/imageHelper';
import { 
  GET_ORDER_ADMIN as GET_ORDER,
  UPDATE_ORDER_STATUS,
  UPDATE_PAYMENT_STATUS,
  CANCEL_ORDER,
  getOrderStatusInfo,
  getPaymentStatusInfo,
  getPaymentMethodLabel,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS
} from '../../graphql/orders';

const AdminOrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    paymentStatus: '',
    adminNotes: ''
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // GraphQL operations
  const { data, loading, error, refetch } = useQuery(GET_ORDER, {
    variables: { orderNumber },
    errorPolicy: 'all'
  });
  
  const [updateOrderStatus, { loading: updatingStatus }] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  });
  
  const [updatePaymentStatus, { loading: updatingPayment }] = useMutation(UPDATE_PAYMENT_STATUS, {
    onCompleted: () => {
      toast.success('Cập nhật trạng thái thanh toán thành công!');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  });
  
  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER, {
    onCompleted: () => {
      toast.success('Đã hủy đơn hàng thành công!');
      setShowCancelModal(false);
      setCancelReason('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    }
  });
  
  const order = data?.getOrder;
  
  // Initialize edit form when order loads
  React.useEffect(() => {
    if (order && !isEditing) {
      setEditForm({
        status: order.status,
        paymentStatus: order.paymentStatus,
        adminNotes: order.adminNotes || ''
      });
    }
  }, [order, isEditing]);
  
  // Format functions
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Safe customer info access
  const getCustomerInfo = () => {
    if (order?.customerInfo) {
      return {
        fullName: order.customerInfo.fullName || 'N/A',
        phone: order.customerInfo.phone || 'N/A',
        address: order.customerInfo.address || 'N/A',
        city: order.customerInfo.city || '',
        notes: order.customerInfo.notes || ''
      };
    }
    
    if (order?.user) {
      return {
        fullName: order.user.fullName || `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'N/A',
        phone: order.user.phone || 'N/A',
        address: order.user.address || 'N/A',
        city: order.user.city || '',
        notes: ''
      };
    }
    
    return {
      fullName: 'N/A',
      phone: 'N/A',
      address: 'N/A',
      city: '',
      notes: ''
    };
  };
  
  // Handle status updates
  const handleSaveChanges = async () => {
    try {
      // Update order status if changed
      if (editForm.status !== order.status) {
        await updateOrderStatus({
          variables: {
            orderNumber,
            status: editForm.status,
            adminNotes: editForm.adminNotes
          }
        });
      }
      
      // Update payment status if changed
      if (editForm.paymentStatus !== order.paymentStatus) {
        await updatePaymentStatus({
          variables: {
            orderNumber,
            paymentStatus: editForm.paymentStatus
          }
        });
      }
      
      // If only notes changed
      if (editForm.status === order.status && 
          editForm.paymentStatus === order.paymentStatus && 
          editForm.adminNotes !== order.adminNotes) {
        await updateOrderStatus({
          variables: {
            orderNumber,
            status: order.status,
            adminNotes: editForm.adminNotes
          }
        });
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };
  
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }
    
    try {
      await cancelOrder({
        variables: {
          orderNumber,
          reason: cancelReason
        }
      });
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };
  
  // Status Badge Component
  const StatusBadge = ({ status, type = 'order', className = '' }) => {
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
      <div className="p-6">
        <LoadingSkeleton type="order-detail" />
      </div>
    );
  }
  
  // Error state
  if (error || !order) {
    return (
      <div className="p-6">
        <div className="text-center max-w-md mx-auto">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error?.message?.includes('not found') ? 'Không tìm thấy đơn hàng' : 'Có lỗi xảy ra'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message || 'Không thể tải thông tin đơn hàng'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => refetch()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
            <Link
              to="/admin/orders"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 block text-center"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const customerInfo = getCustomerInfo();
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại danh sách
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
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <PrinterIcon className="w-4 h-4 mr-1" />
              In
            </button>
            
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <XCircleIcon className="w-4 h-4 mr-1" />
                Hủy đơn
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sản phẩm ({order.items?.length || 0} món)
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={item._id || index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-16 h-16">
                      <SmartImage
                        src={item.product?.images?.[0] || item.productSnapshot?.images?.[0]}
                        alt={item.productName || 'Product'}
                        className="w-full h-full object-cover rounded-lg"
                        fallback="/placeholder-product.jpg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>SKU: {item.productSku}</p>
                        {item.productSnapshot?.brand && (
                          <p>Thương hiệu: {item.productSnapshot.brand}</p>
                        )}
                        {item.productSnapshot?.category && (
                          <p>Danh mục: {item.productSnapshot.category}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.unitPrice)} x {item.quantity}
                      </p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
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
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử đơn hàng</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Order Created */}
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Đơn hàng được tạo</p>
                    <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                  </div>
                </div>
                
                {/* Confirmed */}
                {order.confirmedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Đã xác nhận</p>
                      <p className="text-sm text-gray-600">{formatDate(order.confirmedAt)}</p>
                    </div>
                  </div>
                )}
                
                {/* Processed */}
                {order.processedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Đang xử lý</p>
                      <p className="text-sm text-gray-600">{formatDate(order.processedAt)}</p>
                    </div>
                  </div>
                )}
                
                {/* Shipped */}
                {order.shippedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Đã giao cho vận chuyển</p>
                      <p className="text-sm text-gray-600">{formatDate(order.shippedAt)}</p>
                    </div>
                  </div>
                )}
                
                {/* Delivered */}
                {order.deliveredAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-green-700 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Đã giao hàng thành công</p>
                      <p className="text-sm text-gray-600">{formatDate(order.deliveredAt)}</p>
                    </div>
                  </div>
                )}
                
                {/* Cancelled */}
                {order.cancelledAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Đã hủy đơn hàng</p>
                      <p className="text-sm text-gray-600">{formatDate(order.cancelledAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Edit Panel */}
          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-4">Chỉnh sửa đơn hàng</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái đơn hàng
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {ORDER_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái thanh toán
                  </label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {PAYMENT_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú admin
                  </label>
                  <textarea
                    value={editForm.adminNotes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Ghi chú nội bộ..."
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveChanges}
                    disabled={updatingStatus || updatingPayment}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingStatus || updatingPayment ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-md text-sm hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h3>
            </div>
            
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thuế VAT:</span>
                <span className="font-medium">{formatPrice((order.totalAmount - order.subtotal) || 0)}</span>
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
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thanh toán</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
                  <StatusBadge status={order.paymentStatus} type="payment" className="mt-1" />
                </div>
              </div>
              
              {order.paymentDate && (
                <div className="text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Thanh toán: {formatDate(order.paymentDate)}
                </div>
              )}
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin khách hàng</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <UserIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{customerInfo.fullName}</p>
                  <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                  {order.user?.email && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <EnvelopeIcon className="w-4 h-4 mr-1" />
                      {order.user.email}
                    </p>
                  )}
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
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Ghi chú khách hàng:</strong> {customerInfo.notes}
                  </p>
                </div>
              )}
              
              {order.adminNotes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Ghi chú admin:</strong> {order.adminNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
            </div>
            
            <div className="p-6 space-y-3">
              <Link
                to={`/orders/${order.orderNumber}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Xem góc độ khách hàng
              </Link>
              
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                In hóa đơn
              </button>
              
              <Link
                to="/admin/orders"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 text-center mb-4">
                Hủy đơn hàng #{order.orderNumber}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy đơn hàng *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Nhập lý do hủy đơn hàng..."
                />
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Cảnh báo:</p>
                    <p>Hành động này không thể hoàn tác. Đơn hàng sẽ bị hủy vĩnh viễn.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetailPage;