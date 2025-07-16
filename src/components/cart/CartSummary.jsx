// webfrontend/src/components/cart/CartSummary.jsx
import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';

const CartSummary = ({ showCheckoutButton = true, className = '' }) => {
  const { subtotal, totalItems, isEmpty } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Tính toán các phí (có thể customize sau)
  const shippingFee = 0; // Free shipping
  const taxRate = 0.1; // 10% VAT
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  if (isEmpty) {
    return null;
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tóm tắt đơn hàng
      </h3>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Tạm tính ({totalItems} sản phẩm)
          </span>
          <span className="font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phí vận chuyển</span>
          <span className="font-medium text-green-600">
            {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">VAT (10%)</span>
          <span className="font-medium">
            {formatPrice(tax)}
          </span>
        </div>

        <hr className="my-4" />

        {/* Total */}
        <div className="flex justify-between text-lg font-semibold">
          <span>Tổng cộng</span>
          <span className="text-blue-600">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <div className="mt-6 space-y-3">
          <Link
            to="/checkout"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Tiến hành thanh toán
          </Link>
          
          <Link
            to="/products"
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-center hover:bg-gray-300 transition-colors block"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      )}

      {/* Security Note */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        🔒 Thông tin thanh toán được bảo mật
      </div>
    </div>
  );
};

export default CartSummary;