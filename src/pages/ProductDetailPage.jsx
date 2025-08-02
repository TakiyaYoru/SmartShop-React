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
import WishlistButton from '../components/products/WishlistButton';
import ProductReviews from '../components/reviews/ProductReviews';
import ProductRating from '../components/reviews/ProductRating';
import ProductSpecifications from '../components/products/ProductSpecifications';
import ProductSpecificationsAdvanced from '../components/products/ProductSpecificationsAdvanced';
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
  const [descriptionTab, setDescriptionTab] = useState('specs'); // 'specs' or 'text'

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

  // Helper function to check if description is valid JSON
  const isJsonSpecifications = (desc) => {
    if (!desc) return false;
    try {
      const parsed = JSON.parse(desc);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
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
            <div className="mb-6">
              <div className="flex items-center gap-3 text-sm mb-3">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-full border border-blue-200">
                  {category?.name || 'Chưa phân loại'}
                </span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 font-semibold rounded-full border border-purple-200">
                  {brand?.name || 'Không xác định'}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                {name}
              </h1>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-4xl font-bold text-red-600 tracking-tight">
                  {formatPrice(price)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-xl text-gray-400 line-through font-medium">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discount && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 text-sm font-semibold rounded-full border border-red-200">
                    🔥 Tiết kiệm {discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Stock & SKU */}
            <div className="mb-6">
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${
                  isInStock 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{isInStock ? `Còn ${stock} sản phẩm` : 'Hết hàng'}</span>
                </div>
                <div className="text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                  SKU: {sku}
                </div>
              </div>
            </div>

            {/* Rating - Real Data */}
            <ProductRating productId={id} />

            {/* Quantity Selector */}
            {isInStock && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Số lượng
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-3 min-w-[60px] text-center font-semibold text-gray-900 bg-gray-50 border-x border-gray-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                      className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Tối đa {Math.min(stock, 10)} sản phẩm
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <AddToCartButton 
                product={product}
                quantity={quantity}
                size="lg"
                variant="primary"
                disabled={!isInStock}
                className="flex-1 h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              />
              
              <WishlistButton 
                productId={id}
                size="xl"
                className="h-12 w-12 shadow-md hover:shadow-lg"
              />
              
              <button
                onClick={handleShare}
                className="h-12 w-12 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                title="Chia sẻ sản phẩm"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-8 shadow-sm">
              <div className="flex items-center gap-3 text-green-800">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <TruckIcon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-base">Miễn phí vận chuyển</span>
              </div>
              <p className="text-sm text-green-700 mt-2 ml-9 font-medium">
                Đơn hàng từ 500.000₫ được miễn phí ship toàn quốc
              </p>
            </div>

            {/* Description */}
            {description && (
              <div className="mb-8">
                {isJsonSpecifications(description) ? (
                  <div className="space-y-4">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8">
                        <button
                          onClick={() => setDescriptionTab('specs')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            descriptionTab === 'specs'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Thông số kỹ thuật
                        </button>
                        <button
                          onClick={() => setDescriptionTab('text')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            descriptionTab === 'text'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Mô tả
                        </button>
                      </nav>
                    </div>

                    {/* Content */}
                    {descriptionTab === 'specs' ? (
                      <ProductSpecificationsAdvanced specifications={description} />
                    ) : (
                      <div className="prose prose-sm text-gray-600">
                        <p>{description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-sm text-gray-600">
                    <p>{description}</p>
                  </div>
                )}
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