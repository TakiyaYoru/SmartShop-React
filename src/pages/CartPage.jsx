// webfrontend/src/pages/CartPage.jsx - FINAL PRODUCTION VERSION
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_CART } from '../graphql/cart';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCartIcon, 
  ArrowLeftIcon,
  SparklesIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  HeartIcon,
  GiftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const CartPage = () => {
  const cartData = useCart();
  const authData = useAuth();
  const location = useLocation();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Intelligent data extraction
  const possibleItems = [
    cartData?.items,
    cartData?.cart?.items, 
    cartData?.getCart?.items,
    cartData?.data?.items
  ];
  
  // Find valid items array
  let items = [];
  let totalItems = 0;
  let subtotal = 0;
  let isEmpty = true;

  for (const possibleItem of possibleItems) {
    if (Array.isArray(possibleItem)) {
      items = possibleItem;
      break;
    }
  }

  // Calculate from found items
  if (Array.isArray(items) && items.length > 0) {
    isEmpty = false;
    totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  }

  // Fallback: use direct query if context has no data
  const { data: directCartData, refetch: refetchCart } = useQuery(GET_CART, {
    skip: !authData.isAuthenticated,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // Luôn fetch từ network khi có thể
    notifyOnNetworkStatusChange: true // Thông báo khi network status thay đổi
  });

  if (isEmpty && directCartData?.getCart?.items) {
    items = directCartData.getCart.items;
    totalItems = directCartData.getCart.totalItems || items.length;
    subtotal = directCartData.getCart.subtotal || 0;
    isEmpty = items.length === 0;
  }

  const isLoading = cartData?.loading || cartData?.isLoading || false;

  // Refresh data when component mounts or when returning to this page
  useEffect(() => {
    // Refresh data when component mounts
    if (authData.isAuthenticated) {
      refetchCart();
    }
    
    // Refresh data when window gains focus (user returns to tab)
    const handleFocus = () => {
      if (authData.isAuthenticated) {
        console.log('Window focused, refreshing cart data...');
        refetchCart().then(() => {
          setLastUpdated(new Date());
          toast.success('Đã cập nhật giỏ hàng!');
        });
      }
    };

    // Refresh data when user navigates back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden && authData.isAuthenticated) {
        console.log('Page became visible, refreshing cart data...');
        refetchCart().then(() => {
          setLastUpdated(new Date());
          toast.success('Đã cập nhật giỏ hàng!');
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchCart, location.pathname, authData.isAuthenticated]); // Re-run when location changes

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const getProductImage = (product) => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      
      if (firstImage.startsWith('http')) {
        return firstImage;
      } else if (firstImage.startsWith('/')) {
        return `http://localhost:4000${firstImage}`;
      } else {
        return `http://localhost:4000/img/${firstImage}`;
      }
    }
    return '/placeholder-product.jpg';
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) return;
    if (cartData?.updateCartItem) {
      await cartData.updateCartItem(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      if (cartData?.removeFromCart) {
        await cartData.removeFromCart(productId);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa toàn bộ ${totalItems} sản phẩm khỏi giỏ hàng?`)) {
      if (cartData?.clearCart) {
        await cartData.clearCart();
      }
    }
  };

  // Calculate shipping and total
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Link
                  to="/products"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Tiếp tục mua sắm
                </Link>
                <div className="h-6 w-px bg-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <ShoppingCartIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                    Giỏ hàng
                    {!isEmpty && totalItems > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-sm sm:text-lg font-semibold px-2 sm:px-3 py-1 rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </h1>
                  {isLoading && !isEmpty && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Đang cập nhật...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Manual Refresh Button */}
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 hidden sm:block">
                    Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                  </div>
                  <button
                    onClick={() => {
                      console.log('Manual refresh triggered');
                      refetchCart().then(() => {
                        setLastUpdated(new Date());
                        toast.success('Đã cập nhật giỏ hàng!');
                      });
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Làm mới giỏ hàng"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Làm mới</span>
                  </button>
                </div>

                {/* Clear Cart Button */}
                {!isEmpty && (
                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-red-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Xóa tất cả</span>
                    <span className="sm:hidden">Xóa</span>
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && items.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                  <p className="text-gray-600 text-lg">Đang tải giỏ hàng...</p>
                </div>
              </div>
            )}

            {/* Refresh Status Indicator */}
            {isLoading && items.length > 0 && (
              <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="text-sm font-medium">Đang cập nhật giỏ hàng...</span>
              </div>
            )}

            {/* Empty Cart */}
            {!isLoading && isEmpty && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
                    <ShoppingCartIcon className="w-16 h-16 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Giỏ hàng trống
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Hãy khám phá các sản phẩm tuyệt vời và thêm chúng vào giỏ hàng!
                  </p>
                  
                  <div className="space-y-6">
                    <Link
                      to="/products"
                      className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      <SparklesIcon className="w-6 h-6 mr-3" />
                      Khám phá sản phẩm
                    </Link>
                    
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                      <Link 
                        to="/products?featured=true" 
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        <SparklesIcon className="w-4 h-4" />
                        Sản phẩm nổi bật
                      </Link>
                      <Link 
                        to="/products?sort=PRICE_ASC" 
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        <GiftIcon className="w-4 h-4" />
                        Giá tốt nhất
                      </Link>
                      <Link 
                        to="/products?sort=CREATED_DESC" 
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        ✨ Hàng mới về
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Content */}
            {!isEmpty && items.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Cart Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900">
                          Sản phẩm trong giỏ ({items.length} sản phẩm)
                        </h2>
                        <div className="text-sm text-gray-600">
                          Tạm tính: <span className="font-bold text-gray-900 text-base">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="divide-y divide-gray-100">
                      {items.map((item, index) => {
                        const product = item.product || {};
                        const productImage = getProductImage(product);
                        const originalPrice = product.originalPrice;
                        const hasDiscount = originalPrice && originalPrice > item.unitPrice;

                        return (
                          <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                <Link to={`/products/${product._id}`} className="group">
                                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
                                    <img
                                      src={productImage}
                                      alt={product.name || item.productName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-product.jpg';
                                      }}
                                    />
                                  </div>
                                </Link>
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <Link 
                                  to={`/products/${product._id}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                                    {product.name || item.productName || 'Tên sản phẩm'}
                                  </h3>
                                </Link>
                                
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    {product.category?.name || 'Danh mục'}
                                  </span>
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                    {product.brand?.name || 'Thương hiệu'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xl font-bold text-blue-600">
                                    {formatPrice(item.unitPrice)}
                                  </span>
                                  {hasDiscount && (
                                    <>
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(originalPrice)}
                                      </span>
                                      <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                                        -{Math.round(((originalPrice - item.unitPrice) / originalPrice) * 100)}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                {/* Quantity Controls */}
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-sm text-gray-600 font-medium">Số lượng</span>
                                  <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                      onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                                      disabled={isLoading || item.quantity <= 1}
                                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                                    >
                                      <MinusIcon className="w-4 h-4" />
                                    </button>
                                    
                                    <span className="px-4 py-2 text-center font-semibold bg-gray-50 min-w-[60px]">
                                      {item.quantity}
                                    </span>
                                    
                                    <button
                                      onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                                      disabled={isLoading || item.quantity >= (product.stock || 999)}
                                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                                    >
                                      <PlusIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {product.stock && (
                                    <p className="text-xs text-gray-500">
                                      Còn: {product.stock}
                                    </p>
                                  )}
                                </div>

                                {/* Total Price & Actions */}
                                <div className="flex flex-col items-center gap-3">
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Thành tiền</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                      {formatPrice(item.totalPrice || (item.quantity * item.unitPrice))}
                                    </p>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleRemoveItem(product._id)}
                                      disabled={isLoading}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      title="Xóa khỏi giỏ hàng"
                                    >
                                      <TrashIcon className="w-5 h-5" />
                                    </button>
                                    
                                    <button
                                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Thêm vào yêu thích"
                                    >
                                      <HeartIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Stock Warning */}
                            {item.quantity >= (product.stock || 999) && (
                              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-700 flex items-center gap-2">
                                  ⚠️ <span className="font-medium">Đã đạt giới hạn tồn kho ({product.stock || 'N/A'} sản phẩm)</span>
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Cart Footer */}
                    <div className="bg-gray-50 border-t border-gray-200 p-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                          💡 <span className="font-medium">Mẹo:</span> Miễn phí vận chuyển cho đơn hàng từ 500.000₫
                        </div>
                        {subtotal < 500000 && (
                          <div className="text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded-lg font-medium">
                            Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí ship! 🚚
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Products */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6 text-blue-500" />
                      Có thể bạn cũng thích
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
                      <p className="text-gray-600">
                        Tính năng gợi ý sản phẩm thông minh sẽ có trong phiên bản tiếp theo! 🎯
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4">
                  <div className="sticky top-8 space-y-6">
                    {/* Order Summary Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">
                          Tóm tắt đơn hàng
                        </h3>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">
                            Tạm tính ({totalItems} sản phẩm)
                          </span>
                          <span className="font-semibold">
                            {formatPrice(subtotal)}
                          </span>
                        </div>

                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">Phí vận chuyển</span>
                          <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                          </span>
                        </div>

                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">VAT (10%)</span>
                          <span className="font-semibold">
                            {formatPrice(tax)}
                          </span>
                        </div>

                        <hr className="my-4" />

                        <div className="flex justify-between text-xl font-bold">
                          <span>Tổng cộng</span>
                          <span className="text-blue-600">
                            {formatPrice(total)}
                          </span>
                        </div>

                        <div className="space-y-3 pt-4">
                          <Link
                            to="/checkout"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-lg"
                          >
                            🚀 Tiến hành thanh toán
                          </Link>
                          
                          <Link
                            to="/products"
                            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors block"
                          >
                            Tiếp tục mua sắm
                          </Link>
                        </div>

                        <div className="mt-6 text-xs text-gray-500 text-center">
                          🔒 Thông tin thanh toán được bảo mật 256-bit SSL
                        </div>
                      </div>
                    </div>

                    {/* Trust Signals */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        ✨ Cam kết của chúng tôi
                      </h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <span className="text-green-500 text-lg">✓</span>
                          <span>Bảo hành chính hãng toàn quốc</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-500 text-lg">✓</span>
                          <span>Đổi trả miễn phí trong 7 ngày</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-500 text-lg">✓</span>
                          <span>Hỗ trợ kỹ thuật 24/7</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-500 text-lg">✓</span>
                          <span>Thanh toán an toàn & bảo mật</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Support */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Cần hỗ trợ? 
                        <a 
                          href="tel:1900xxxx" 
                          className="text-blue-600 hover:text-blue-800 ml-1 font-semibold"
                        >
                          📞 Gọi 1900.xxxx
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CartPage;