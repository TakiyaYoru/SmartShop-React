// webfrontend/src/components/cart/AddToCartButton.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const AddToCartButton = ({ 
  product, 
  quantity = 1, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '' 
}) => {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!product || disabled) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product._id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Variant styles
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const isButtonDisabled = disabled || isLoading || isAdding || !product || product.stock <= 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isButtonDisabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg font-semibold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        ${className}
      `}
    >
      {(isLoading || isAdding) ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>Đang thêm...</span>
        </>
      ) : (
        <>
          <ShoppingCartIcon className="w-4 h-4" />
          <span>
            {!isAuthenticated 
              ? 'Đăng nhập để mua' 
              : product?.stock <= 0 
                ? 'Hết hàng' 
                : 'Thêm vào giỏ'
            }
          </span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;