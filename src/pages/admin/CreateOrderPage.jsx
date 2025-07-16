// webfrontend/src/pages/admin/AdminCreateOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { SmartImage } from '../../utils/imageHelper';
import { GET_PRODUCTS } from '../../graphql/products';
import { CREATE_ORDER, PAYMENT_METHOD_OPTIONS } from '../../graphql/orders';

const AdminCreateOrderPage = () => {
  const navigate = useNavigate();
  
  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });
  
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [adminNotes, setAdminNotes] = useState('');
  
  // UI states
  const [currentStep, setCurrentStep] = useState(1); // 1: Customer Info, 2: Products, 3: Review
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [errors, setErrors] = useState({});
  
  // GraphQL queries and mutations
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 50,
      condition: {
        isActive: true,
        name: searchTerm || undefined,
        category: selectedCategory || undefined
      }
    },
    skip: !showProductSearch
  });
  
  const [createOrder, { loading: creating }] = useMutation(CREATE_ORDER, {
    onCompleted: (data) => {
      if (data.createOrderFromCart) {
        toast.success('Tạo đơn hàng thành công!');
        navigate(`/admin/orders/${data.createOrderFromCart.orderNumber}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
  });
  
  const products = productsData?.products?.nodes || [];
  
  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 0; // Free shipping for admin orders
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + shippingFee + tax;
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  
  // Validation functions
  const validateCustomerInfo = () => {
    const newErrors = {};
    
    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên khách hàng';
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    }
    
    if (!customerInfo.city.trim()) {
      newErrors.city = 'Vui lòng nhập thành phố';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateOrderItems = () => {
    if (orderItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
      return false;
    }
    
    const invalidItems = orderItems.filter(item => item.quantity <= 0 || item.quantity > item.stock);
    if (invalidItems.length > 0) {
      toast.error('Có sản phẩm với số lượng không hợp lệ');
      return false;
    }
    
    return true;
  };
  
  // Handle form changes
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle product operations
  const addProductToOrder = (product) => {
    const existingItem = orderItems.find(item => item.productId === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Không thể thêm, vượt quá số lượng tồn kho');
        return;
      }
      setOrderItems(prev => 
        prev.map(item => 
          item.productId === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem = {
        productId: product._id,
        productName: product.name,
        productSku: product.sku,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        image: product.images?.[0]
      };
      setOrderItems(prev => [...prev, newItem]);
    }
    
    toast.success(`Đã thêm ${product.name} vào đơn hàng`);
  };
  
  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const item = orderItems.find(item => item.productId === productId);
    if (newQuantity > item.stock) {
      toast.error('Số lượng vượt quá tồn kho');
      return;
    }
    
    setOrderItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };
  
  const removeItem = (productId) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };
  
  // Handle step navigation
  const nextStep = () => {
    if (currentStep === 1 && validateCustomerInfo()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateOrderItems()) {
      setCurrentStep(3);
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  // Handle order creation
  const handleCreateOrder = async () => {
    if (!validateCustomerInfo() || !validateOrderItems()) {
      return;
    }
    
    try {
      // Transform order items to match backend expectations
      const orderInput = {
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          address: `${customerInfo.address}, ${customerInfo.city}`,
          city: customerInfo.city,
          notes: customerInfo.notes
        },
        paymentMethod,
        customerNotes: adminNotes,
        // Note: Backend needs to be updated to accept direct order items for admin orders
        // For now, we'll create through cart system
      };
      
      await createOrder({
        variables: { input: orderInput }
      });
    } catch (error) {
      console.error('Create order error:', error);
    }
  };
  
  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[
          { num: 1, label: 'Thông tin khách hàng' },
          { num: 2, label: 'Chọn sản phẩm' },
          { num: 3, label: 'Xác nhận đơn hàng' }
        ].map((step, index) => (
          <React.Fragment key={step.num}>
            <div className={`flex items-center ${currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.num ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
              }`}>
                {currentStep > step.num ? <CheckCircleIcon className="w-5 h-5" /> : step.num}
              </div>
              <span className="ml-2 font-medium hidden sm:block">{step.label}</span>
            </div>
            {index < 2 && (
              <div className={`w-16 h-1 rounded ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo đơn hàng mới</h1>
            <p className="text-gray-600">Tạo đơn hàng thay mặt khách hàng</p>
          </div>
        </div>
      </div>
      
      <StepIndicator />
      
      {/* Step 1: Customer Information */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Thông tin khách hàng</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ tên khách hàng *
              </label>
              <input
                type="text"
                name="fullName"
                value={customerInfo.fullName}
                onChange={handleCustomerChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập họ tên đầy đủ"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="phone"
                value={customerInfo.phone}
                onChange={handleCustomerChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0xxx xxx xxx"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={customerInfo.email}
                onChange={handleCustomerChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="customer@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thành phố *
              </label>
              <input
                type="text"
                name="city"
                value={customerInfo.city}
                onChange={handleCustomerChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Hồ Chí Minh, Hà Nội..."
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ giao hàng *
              </label>
              <textarea
                name="address"
                value={customerInfo.address}
                onChange={handleCustomerChange}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={customerInfo.notes}
                onChange={handleCustomerChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ghi chú thêm cho khách hàng"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Product Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Current Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Sản phẩm đã chọn ({orderItems.length})
              </h2>
              <button
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </button>
            </div>
            
            {orderItems.length > 0 ? (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-16 h-16">
                      <SmartImage
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                        fallback="/placeholder-product.jpg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                      <p className="text-sm text-gray-600">Tồn kho: {item.stock}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                          className="w-16 text-center border border-gray-300 rounded-md py-1"
                          min="1"
                          max={item.stock}
                        />
                        <button
                          onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Order Summary */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Phí vận chuyển:</span>
                        <span className="text-green-600">Miễn phí</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Thuế (10%):</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Chưa có sản phẩm nào trong đơn hàng</p>
                <button
                  onClick={() => setShowProductSearch(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Thêm sản phẩm đầu tiên
                </button>
              </div>
            )}
          </div>
          
          {/* Product Search */}
          {showProductSearch && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm sản phẩm</h3>
                <button
                  onClick={() => setShowProductSearch(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {productsLoading ? (
                <LoadingSkeleton type="products" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          <SmartImage
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            fallback="/placeholder-product.jpg"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          <p className="text-sm text-blue-600 font-medium">{formatPrice(product.price)}</p>
                          <p className="text-xs text-gray-500">Tồn: {product.stock}</p>
                        </div>
                        
                        <button
                          onClick={() => addProductToOrder(product)}
                          disabled={product.stock <= 0}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {product.stock <= 0 ? 'Hết hàng' : 'Thêm'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Quay lại
            </button>
            <button
              onClick={nextStep}
              disabled={orderItems.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Review & Confirm */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Xác nhận đơn hàng</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
              
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Họ tên:</span> {customerInfo.fullName}</p>
                  <p><span className="font-medium">Điện thoại:</span> {customerInfo.phone}</p>
                  {customerInfo.email && <p><span className="font-medium">Email:</span> {customerInfo.email}</p>}
                  <p><span className="font-medium">Địa chỉ:</span> {customerInfo.address}, {customerInfo.city}</p>
                  {customerInfo.notes && <p><span className="font-medium">Ghi chú:</span> {customerInfo.notes}</p>}
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PAYMENT_METHOD_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Admin Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú của admin
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ghi chú nội bộ cho đơn hàng này..."
                />
              </div>
            </div>
            
            {/* Products & Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm đặt hàng</h3>
              
              <div className="space-y-3 mb-6">
                {orderItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12">
                      <SmartImage
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                        fallback="/placeholder-product.jpg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.productName}</h4>
                      <p className="text-xs text-gray-600">{formatPrice(item.price)} x {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pricing Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính ({orderItems.length} sản phẩm):</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Thuế VAT (10%):</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng thanh toán:</span>
                      <span className="text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Warning */}
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Lưu ý quan trọng:</p>
                    <p className="text-yellow-700">
                      Đây là đơn hàng được tạo bởi admin. Vui lòng kiểm tra kỹ thông tin trước khi tạo đơn hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Quay lại
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(total)}</p>
              </div>
              
              <button
                onClick={handleCreateOrder}
                disabled={creating || orderItems.length === 0}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Tạo đơn hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreateOrderPage;