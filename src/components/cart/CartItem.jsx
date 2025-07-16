// webfrontend/src/components/cart/CartItem.jsx - Updated với Firebase Support
import React, { useState } from 'react';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../lib/utils';
import { SmartImage } from '../../utils/imageHelper'; // ✅ UPDATED IMPORT

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart, isLoading } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity <= 0) return;
    
    setIsUpdating(true);
    try {
      await updateCartItem(item.product._id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      await removeFromCart(item.product._id);
    }
  };

  const isItemLoading = isLoading || isUpdating;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${isItemLoading ? 'opacity-50' : ''}`}>
      <div className="flex items-center space-x-4">
        {/* ✅ UPDATED: Product Image với Firebase support */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
            <SmartImage
              src={item.product.images?.[0]}
              alt={item.product.name}
              className="w-full h-full object-cover"
              fallback="/placeholder-product.jpg"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {item.product.name}
          </h3>
          <p className="text-sm text-gray-500">
            SKU: {item.product.sku}
          </p>
          <div className="flex items-center mt-1">
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(item.unitPrice)}
            </span>
            {item.product.originalPrice && item.product.originalPrice > item.unitPrice && (
              <span className="ml-2 text-xs text-gray-400 line-through">
                {formatPrice(item.product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isItemLoading || item.quantity <= 1}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          
          <span className="min-w-[40px] text-center text-sm font-medium">
            {item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isItemLoading || item.quantity >= item.product.stock}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Total Price */}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(item.totalPrice)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isItemLoading}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          title="Xóa khỏi giỏ hàng"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Stock Warning */}
      {item.quantity >= item.product.stock && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          ⚠️ Đã đạt giới hạn tồn kho ({item.product.stock} sản phẩm)
        </div>
      )}
    </div>
  );
};

export default CartItem;