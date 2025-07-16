// src/components/cart/CartIcon.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartIcon = ({ className = "", showText = false }) => {
  const { cart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Nếu chưa đăng nhập thì hiển thị icon trống
  const itemCount = isAuthenticated ? cart.totalItems : 0;

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', { state: { from: '/cart' } });
    }
  };

  return (
    <Link 
      to="/cart" 
      onClick={handleCartClick}
      className={`relative inline-flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}
    >
      {/* Cart Icon */}
      <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
      
      {/* Badge hiển thị số lượng items */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {/* Loading indicator nhỏ */}
      {loading && (
        <span className="absolute -top-1 -right-1 bg-blue-500 rounded-full h-3 w-3 animate-spin">
          <span className="sr-only">Đang tải...</span>
        </span>
      )}

      {/* Text (optional) */}
      {showText && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          Giỏ hàng
          {itemCount > 0 && (
            <span className="ml-1 text-gray-500">({itemCount})</span>
          )}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;