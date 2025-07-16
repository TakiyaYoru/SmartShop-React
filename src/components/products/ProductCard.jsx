// webfrontend/src/components/products/ProductCard.jsx - Updated với Firebase Support
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  EyeIcon,
  SparklesIcon,
  TagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { formatPrice, calculateDiscountPercentage } from '../../lib/utils';
import { getImageUrl, SmartImage } from '../../utils/imageHelper'; // ✅ UPDATED IMPORT
import AddToCartButton from '../cart/AddToCartButton';
import ProductRating from '../reviews/ProductRating';

const ProductCard = ({ 
  product, 
  viewMode = 'grid',
  showQuickActions = true,
  className = '' 
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const {
    _id,
    name,
    description,
    price,
    originalPrice,
    images = [],
    stock = 0,
    category,
    brand,
    isFeatured
  } = product;

  // Safe fallbacks for missing data
  const categoryName = category?.name || 'Chưa phân loại';
  const brandName = brand?.name || 'Không xác định';
  const productStock = typeof stock === 'number' ? stock : 0;
  const productPrice = typeof price === 'number' ? price : 0;

  const discount = originalPrice && originalPrice > productPrice 
    ? calculateDiscountPercentage(originalPrice, productPrice)
    : null;

  // ✅ Stock status với styling
  const getStockStatus = () => {
    if (productStock === 0) {
      return {
        text: 'Hết hàng',
        color: 'bg-red-100 text-red-800',
        icon: '❌'
      };
    } else if (productStock <= 5) {
      return {
        text: `Còn ${productStock}`,
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⚠️'
      };
    } else {
      return {
        text: 'Còn hàng',
        color: 'bg-green-100 text-green-800',
        icon: '✅'
      };
    }
  };

  const stockStatus = getStockStatus();

  // Toggle wishlist
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Quick view handler
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement quick view modal
    console.log('Quick view for product:', _id);
  };

  const cardClassName = `
    bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
    hover:shadow-xl hover:border-gray-300 transition-all duration-300
    ${isHovered ? 'transform -translate-y-1' : ''}
    ${className}
  `;

  return (
    <div 
      className={cardClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Link */}
      <Link to={`/products/${_id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {/* ✅ UPDATED: Sử dụng SmartImage với Firebase support */}
          <SmartImage
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            fallback="/placeholder-product.jpg"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isFeatured && (
              <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                <SparklesIcon className="w-3 h-3 mr-1" />
                HOT
              </span>
            )}
            
            {discount && (
              <span className="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                <TagIcon className="w-3 h-3 mr-1" />
                -{discount}%
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {showQuickActions && (
            <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <button
                onClick={handleWishlistToggle}
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={handleQuickView}
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <EyeIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Free Shipping Badge */}
          {productPrice >= 500000 && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                <TruckIcon className="w-3 h-3 mr-1" />
                Miễn phí ship
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="truncate">{categoryName}</span>
            <span className="truncate">{brandName}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
            {name}
          </h3>

          {/* Rating */}
          <div className="mb-3">
            <ProductRating productId={_id} />
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-red-600">
                {formatPrice(productPrice)}
              </span>
              
              {originalPrice && originalPrice > productPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${stockStatus.color}`}>
            <span className="mr-1">{stockStatus.icon}</span>
            {stockStatus.text}
          </div>

          {/* Add to Cart Button - SỬ DỤNG AddToCartButton */}
          {showQuickActions && (
            <div className="mt-3">
              <AddToCartButton 
                product={product}
                size="sm"
                variant="primary"
                disabled={productStock === 0}
                className="w-full"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;