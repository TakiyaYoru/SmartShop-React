// webfrontend/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { CREATE_ORDER } from '../graphql/orders';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cartContext = useCart();
  
  // Extract cart data from context
  const { items, subtotal, totalItems } = cartContext.cart;
  const { clearCart } = cartContext;
  const isEmpty = !items || items.length === 0;
  const isLoading = cartContext.loading;
  const error = cartContext.error;
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Customer information form
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: ''
  });

  // Order preferences
  const [orderPrefs, setOrderPrefs] = useState({
    paymentMethod: 'cod', // 'cod' or 'bank_transfer'
    invoiceRequired: false
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // GraphQL mutation
  const [createOrder] = useMutation(CREATE_ORDER, {
    onCompleted: (data) => {
      if (data.createOrderFromCart) {
        toast.success('Đặt hàng thành công!');
        clearCart();
        // Điều hướng đến trang success thay vì order detail
        navigate(`/order-success/${data.createOrderFromCart.orderNumber}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi đặt hàng');
      setLoading(false);
    }
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && isEmpty) {
      toast.error('Giỏ hàng trống!');
      navigate('/cart');
    }
  }, [isEmpty, isLoading, navigate]);

  // Calculate totals
  const shippingFee = 0; // Free shipping for home delivery
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + shippingFee + tax;

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Handle form input changes
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOrderPrefsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderPrefs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate step 1 form
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Always require address for home delivery
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    if (!customerInfo.city.trim()) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    
    try {
      const orderInput = {
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          address: `${customerInfo.address}, ${customerInfo.ward}, ${customerInfo.district}, ${customerInfo.city}`,
          city: customerInfo.city,
          notes: customerInfo.notes
        },
        paymentMethod: orderPrefs.paymentMethod
      };

      console.log('Sending order input:', JSON.stringify(orderInput, null, 2));

      await createOrder({
        variables: { input: orderInput }
      });
    } catch (error) {
      console.error('Order submission error:', error);
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Step 1 */}
        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
          }`}>
            {currentStep > 1 ? <CheckCircleIcon className="w-5 h-5" /> : '1'}
          </div>
          <span className="ml-2 font-medium hidden sm:block">Thông tin</span>
        </div>
        
        {/* Divider */}
        <div className={`w-16 h-1 rounded ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        
        {/* Step 2 */}
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
          }`}>
            {currentStep > 2 ? <CheckCircleIcon className="w-5 h-5" /> : '2'}
          </div>
          <span className="ml-2 font-medium hidden sm:block">Thanh toán</span>
        </div>
      </div>
    </div>
  );

  // Order summary component
  const OrderSummary = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <ShoppingBagIcon className="w-6 h-6 mr-2" />
          Đơn hàng của bạn
        </h3>
      </div>

      <div className="p-6">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {!isLoading && (
          <div className="space-y-4 mb-6">
            {items && items.length > 0 ? (
              items.map((item) => (
                <div key={item.product._id} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.product.images?.[0] || '/placeholder-image.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có sản phẩm trong giỏ hàng</p>
              </div>
            )}
          </div>
        )}

        {/* Price breakdown */}
        {!isLoading && (
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm)</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="font-semibold text-green-600">
                Miễn phí
              </span>
            </div>
            
            <div className="flex justify-between text-base">
              <span className="text-gray-600">VAT (10%)</span>
              <span className="font-semibold">{formatPrice(tax)}</span>
            </div>
            
            <hr className="my-4" />
            
            <div className="flex justify-between text-xl font-bold">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isLoading && isEmpty) {
    return null; // Will redirect in useEffect
  }

  // Show loading state while cart is loading
  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Đang tải thông tin giỏ hàng...</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Show error state
  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <p className="font-bold">Lỗi khi tải giỏ hàng</p>
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Thử lại
                </button>
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
              <p className="text-gray-600 mt-2">Hoàn tất đơn hàng của bạn</p>
            </div>

            {/* Step indicator */}
            <StepIndicator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2">
                {/* Step 1: Customer Information */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900">
                        1. Thông tin khách hàng
                      </h2>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Customer info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={customerInfo.fullName}
                            onChange={handleCustomerInfoChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nhập họ và tên"
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={customerInfo.phone}
                            onChange={handleCustomerInfoChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0xxxxxxxxx"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={customerInfo.email}
                            onChange={handleCustomerInfoChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="email@example.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Delivery address */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Địa chỉ giao hàng
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tỉnh/Thành phố *
                            </label>
                            <select
                              name="city"
                              value={customerInfo.city}
                              onChange={handleCustomerInfoChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.city ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Chọn tỉnh/thành phố</option>
                              <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
                              <option value="Ha Noi">Hà Nội</option>
                              <option value="Da Nang">Đà Nẵng</option>
                              <option value="Can Tho">Cần Thơ</option>
                            </select>
                            {errors.city && (
                              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quận/Huyện
                            </label>
                            <input
                              type="text"
                              name="district"
                              value={customerInfo.district}
                              onChange={handleCustomerInfoChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nhập quận/huyện"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Địa chỉ cụ thể *
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={customerInfo.address}
                              onChange={handleCustomerInfoChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Số nhà, tên đường"
                            />
                            {errors.address && (
                              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ghi chú đơn hàng
                        </label>
                        <textarea
                          name="notes"
                          value={customerInfo.notes}
                          onChange={handleCustomerInfoChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                        />
                      </div>

                      {/* Continue button */}
                      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <button
                          onClick={() => navigate('/cart')}
                          className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                          <ArrowLeftIcon className="w-4 h-4 mr-2" />
                          Quay lại giỏ hàng
                        </button>
                        
                        <button
                          onClick={handleNextStep}
                          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Tiếp tục
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900">
                        2. Thông tin thanh toán
                      </h2>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Customer info summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Thông tin đặt hàng
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Họ tên:</span> {customerInfo.fullName}</p>
                          <p><span className="font-medium">Điện thoại:</span> {customerInfo.phone}</p>
                          <p><span className="font-medium">Email:</span> {customerInfo.email}</p>
                          <p>
                            <span className="font-medium">Địa chỉ:</span>{' '}
                            {customerInfo.address}, {customerInfo.district}, {customerInfo.city}
                          </p>
                        </div>
                      </div>

                      {/* Payment method */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Phương thức thanh toán
                        </h3>
                        
                        <div className="space-y-4">
                          <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={orderPrefs.paymentMethod === 'cod'}
                              onChange={handleOrderPrefsChange}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <CreditCardIcon className="w-5 h-5 text-green-600 mr-2" />
                                <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Thanh toán bằng tiền mặt khi nhận hàng
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="bank_transfer"
                              checked={orderPrefs.paymentMethod === 'bank_transfer'}
                              onChange={handleOrderPrefsChange}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <CreditCardIcon className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="font-medium">Chuyển khoản ngân hàng</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Chuyển khoản trước khi giao hàng
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Invoice */}
                      <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="invoiceRequired"
                            checked={orderPrefs.invoiceRequired}
                            onChange={handleOrderPrefsChange}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">
                            Xuất hóa đơn công ty (Điền email để nhận hóa đơn VAT)
                          </span>
                        </label>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <button
                          onClick={handlePrevStep}
                          className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                          <ArrowLeftIcon className="w-4 h-4 mr-2" />
                          Quay lại
                        </button>
                        
                        <button
                          onClick={handleSubmitOrder}
                          disabled={loading}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-5 h-5 mr-2" />
                              Xác nhận đặt hàng
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order summary sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <OrderSummary />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CheckoutPage;