// webfrontend/src/pages/ProductDetailPage.jsx - Updated với Firebase Support
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  StarIcon,
  CheckCircleIcon,
  TruckIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

import Layout from '../components/common/Layout';
import { GET_PRODUCT } from '../graphql/products';
import { formatPrice, calculateDiscountPercentage } from '../lib/utils';
import { getImageUrl, SmartImage } from '../utils/imageHelper'; // ✅ UPDATED IMPORT
import { useCart } from '../contexts/CartContext';
import AddToCartButton from '../components/cart/AddToCartButton';
import ProductReviews from '../components/reviews/ProductReviews';
import ProductRating from '../components/reviews/ProductRating';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id },
    errorPolicy: 'all'
  });

  const product = data?.product;

  // Redirect if product not found
  useEffect(() => {
    if (!loading && !product && !error) {
      navigate('/products', { replace: true });
    }
  }, [loading, product, error, navigate]);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setIsWishlisted(false);
    }
  }, [product]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || null,
      quantity: quantity
    });
    
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Xem sản phẩm này trên SmartShop: ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link sản phẩm!');
    }
  };

  if (loading) return <Layout><ProductDetailSkeleton /></Layout>;

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải sản phẩm</h2>
            <p className="text-gray-600 mb-8">{error.message}</p>
            <button
              onClick={() => navigate('/products')}
              className="btn btn-primary"
            >
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 mb-8">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button
              onClick={() => navigate('/products')}
              className="btn btn-primary"
            >
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    name,
    description,
    price,
    originalPrice,
    images = [],
    stock,
    category,
    brand,
    sku,
    isFeatured
  } = product;

  const discount = originalPrice && originalPrice > price 
    ? calculateDiscountPercentage(originalPrice, price)
    : null;

  const isInStock = stock > 0;
  const maxQuantity = Math.min(stock, 10); // Limit to 10 per purchase

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center hover:text-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Quay lại
          </button>
          <span>/</span>
          <span>{category?.name || 'Sản phẩm'}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product Images */}
          <div className="flex flex-col-reverse">
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                <div className="grid grid-cols-4 gap-6">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 ${
                        index === selectedImageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <span className="sr-only">Ảnh {index + 1}</span>
                      <span className="absolute inset-0 rounded-md overflow-hidden">
                        {/* ✅ UPDATED: Sử dụng SmartImage */}
                        <SmartImage
                          src={image}
                          alt=""
                          className="w-full h-full object-center object-cover"
                          fallback="/placeholder-product.jpg"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Image */}
            <div className="aspect-w-1 aspect-h-1 w-full">
              <div className="relative">
                {/* ✅ UPDATED: Sử dụng SmartImage */}
                <SmartImage
                  src={images[selectedImageIndex] || images[0]}
                  alt={name}
                  className="w-full h-full object-center object-cover sm:rounded-lg cursor-zoom-in"
                  onClick={() => setShowImageModal(true)}
                  fallback="/placeholder-product.jpg"
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {isFeatured && (
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                      HOT
                    </span>
                  )}
                  {discount && (
                    <span className="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            {/* Title & Category */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>{category?.name || 'Chưa phân loại'}</span>
                <span>•</span>
                <span>{brand?.name || 'Không xác định'}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {name}
              </h1>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(price)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discount && (
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    Tiết kiệm {discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Stock & SKU */}
            <div className="mb-6">
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-1 ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{isInStock ? `Còn ${stock} sản phẩm` : 'Hết hàng'}</span>
                </div>
                <div className="text-gray-500">
                  SKU: {sku}
                </div>
              </div>
            </div>

            {/* Rating - Real Data */}
            <ProductRating productId={id} />

            {/* Quantity Selector */}
            {isInStock && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    (Tối đa {Math.min(stock, 10)} sản phẩm)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <AddToCartButton 
                product={product}
                quantity={quantity}
                size="lg"
                variant="primary"
                disabled={!isInStock}
                className="flex-1"
              />
              
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-lg border transition-colors ${
                  isWishlisted 
                    ? 'border-red-300 bg-red-50 text-red-600' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={handleShare}
                className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-2 text-green-800">
                <TruckIcon className="w-5 h-5" />
                <span className="font-medium">Miễn phí vận chuyển</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Đơn hàng từ 500.000₫ được miễn phí ship toàn quốc
              </p>
            </div>

            {/* Description */}
            {description && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mô tả sản phẩm</h3>
                <div className="prose prose-sm text-gray-600">
                  <p>{description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ProductReviews 
            productId={id}
            user={user}
          />
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              {/* ✅ UPDATED: Sử dụng SmartImage */}
              <SmartImage
                src={images[selectedImageIndex] || images[0]}
                alt={name}
                className="max-w-full max-h-full object-contain"
                fallback="/placeholder-product.jpg"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Loading Skeleton Component
const ProductDetailSkeleton = () => (
  <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start animate-pulse">
    <div className="flex flex-col-reverse">
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      <div className="aspect-w-1 aspect-h-1 w-full">
        <div className="w-full h-96 bg-gray-200 rounded-lg" />
      </div>
    </div>
    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-4" />
      <div className="h-10 bg-gray-200 rounded w-1/3 mt-6" />
      <div className="h-6 bg-gray-200 rounded w-1/4 mt-4" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
      <div className="flex gap-4 mt-8">
        <div className="h-10 bg-gray-200 rounded w-20" />
      </div>
      <div className="flex gap-4 mt-6">
        <div className="h-12 bg-gray-200 rounded flex-1" />
        <div className="h-12 bg-gray-200 rounded flex-1" />
        <div className="h-12 w-12 bg-gray-200 rounded" />
        <div className="h-12 w-12 bg-gray-200 rounded" />
      </div>
      <div className="h-40 bg-gray-200 rounded mt-8" />
    </div>
  </div>
);

export default ProductDetailPage;