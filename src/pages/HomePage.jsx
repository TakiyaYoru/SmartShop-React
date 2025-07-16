// src/pages/HomePage.jsx - Redesigned SmartShop Homepage
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useProducts';
import { useBrands } from '../hooks/useProducts';
import { useProducts } from '../hooks/useProducts';
import Layout from '../components/common/Layout';
import ProductCard from '../components/products/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { 
  CubeIcon, 
  ShoppingCartIcon, 
  TagIcon,
  BuildingStorefrontIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
  SparklesIcon,
  FireIcon,
  GiftIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const HomePage = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Fetch data
  const { featuredProducts, loading: productsLoading } = useFeaturedProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { brands, loading: brandsLoading } = useBrands();
  
  // Fallback: lấy tất cả sản phẩm nếu không có featured products
  const { products: allProducts, loading: allProductsLoading } = useProducts({
    first: 8,
    orderBy: 'CREATED_DESC'
  });

  // Debug logging
  useEffect(() => {
    console.log('Featured Products:', featuredProducts);
    console.log('All Products:', allProducts);
  }, [featuredProducts, allProducts]);

  // Use featured products if available, otherwise use all products
  const displayProducts = (featuredProducts && featuredProducts.length > 0) 
    ? featuredProducts 
    : (allProducts || []);
  
  const isLoading = productsLoading || allProductsLoading;

  // Auto-slide hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Hero slides data
  const heroSlides = [
    {
      title: "Khám phá thế giới mua sắm",
      subtitle: "Hàng nghìn sản phẩm chất lượng cao với giá tốt nhất",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Mua sắm ngay",
      ctaLink: "/products"
    },
    {
      title: "Ưu đãi đặc biệt",
      subtitle: "Giảm giá lên đến 50% cho các sản phẩm nổi bật",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Xem ưu đãi",
      ctaLink: "/products"
    },
    {
      title: "Miễn phí vận chuyển",
      subtitle: "Cho đơn hàng từ 500,000đ trở lên",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Tìm hiểu thêm",
      ctaLink: "/products"
    }
  ];

  // Features data
  const features = [
    {
      name: 'Sản phẩm đa dạng',
      description: 'Hàng nghìn sản phẩm chất lượng cao từ các thương hiệu uy tín',
      icon: CubeIcon,
      href: '/products',
      color: 'blue',
      stats: '10,000+'
    },
    {
      name: 'Danh mục phong phú',
      description: 'Duyệt theo các danh mục sản phẩm được tổ chức khoa học',
      icon: TagIcon,
      href: '/categories',
      color: 'purple',
      stats: '50+'
    },
    {
      name: 'Thương hiệu uy tín',
      description: 'Các thương hiệu hàng đầu thế giới và Việt Nam',
      icon: BuildingStorefrontIcon,
      href: '/brands',
      color: 'green',
      stats: '200+'
    },
    {
      name: 'Giỏ hàng thông minh',
      description: 'Quản lý giỏ hàng dễ dàng với tính năng lưu trữ',
      icon: ShoppingCartIcon,
      href: '/cart',
      color: 'yellow',
      stats: '24/7'
    },
    {
      name: 'Yêu thích & Đánh giá',
      description: 'Lưu sản phẩm yêu thích và đánh giá chất lượng',
      icon: HeartIcon,
      href: '/wishlist',
      color: 'pink',
      stats: '5★'
    },
    {
      name: 'Theo dõi đơn hàng',
      description: 'Theo dõi trạng thái đơn hàng real-time',
      icon: TruckIcon,
      href: '/orders',
      color: 'indigo',
      stats: '100%'
    }
  ];

  // Benefits data
  const benefits = [
    {
      title: 'Miễn phí vận chuyển',
      description: 'Cho đơn hàng trên 500,000đ',
      icon: TruckIcon,
      color: 'blue'
    },
    {
      title: 'Bảo hành chính hãng',
      description: 'Cam kết 100% hàng chính hãng',
      icon: ShieldCheckIcon,
      color: 'green'
    },
    {
      title: 'Đổi trả dễ dàng',
      description: 'Trong vòng 30 ngày',
      icon: ArrowRightIcon,
      color: 'purple'
    },
    {
      title: 'Hỗ trợ 24/7',
      description: 'Tư vấn mọi lúc mọi nơi',
      icon: ChatBubbleLeftRightIcon,
      color: 'orange'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Nguyễn Thị Anh',
      role: 'Khách hàng thân thiết',
      content: 'SmartShop thực sự là nơi mua sắm tuyệt vời! Sản phẩm chất lượng, giao hàng nhanh chóng và dịch vụ khách hàng rất tốt.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 5
    },
    {
      name: 'Trần Văn Bình',
      role: 'Doanh nhân',
      content: 'Tôi đã mua sắm tại SmartShop được 2 năm nay. Luôn hài lòng với chất lượng sản phẩm và dịch vụ.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 5
    },
    {
      name: 'Lê Thị Cẩm',
      role: 'Sinh viên',
      content: 'Giá cả hợp lý, sản phẩm đa dạng và giao hàng rất nhanh. SmartShop là lựa chọn số 1 của tôi!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 5
    }
  ];

  // Stats data
  const stats = [
    { label: 'Khách hàng', value: '100,000+', icon: UserGroupIcon },
    { label: 'Sản phẩm', value: '50,000+', icon: CubeIcon },
    { label: 'Đơn hàng', value: '500,000+', icon: ShoppingCartIcon },
    { label: 'Đánh giá', value: '4.8★', icon: StarIcon }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
      pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
    };
    return colors[color] || colors.blue;
  };

  const getGradientClasses = (color) => {
    const gradients = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return gradients[color] || gradients.blue;
  };

  return (
    <Layout>
      {/* Hero Section with Auto-slide */}
      <section className="relative h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                  {slide.title}
            </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-delay">
                  {slide.subtitle}
            </p>
              <Link
                  to={slide.ctaLink}
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 animate-fade-in-delay-2"
              >
                  {slide.cta}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* User Welcome Section */}
      {user && (
        <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Xin chào, {user.firstName}! 👋
                  </h2>
                  <p className="text-gray-600">
                    Sẵn sàng khám phá những sản phẩm mới hôm nay?
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/products"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    🛍️ Mua sắm ngay
                  </Link>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <Link
                      to="/admin"
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
                    >
                      🚀 Admin Panel
                  </Link>
                )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FireIcon className="h-8 w-8 text-red-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Sản phẩm nổi bật
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá những sản phẩm được yêu thích nhất với chất lượng cao và giá cả hợp lý
            </p>
          </div>

          {isLoading ? (
            <LoadingSkeleton type="product-card" count={8} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" />
          ) : (
            <div className="carousel-container group">
              {/* Debug Info */}
              <div className="text-sm text-gray-500 mb-4">
                Debug: {displayProducts.length} sản phẩm được tải 
                {featuredProducts && featuredProducts.length === 0 && allProducts && allProducts.length > 0 && 
                  ` (sử dụng tất cả sản phẩm thay vì featured)`
                }
              </div>

              {/* Navigation Buttons */}
              <button 
                className="carousel-nav-button carousel-nav-button-left"
                onClick={() => {
                  const container = document.getElementById('featured-products-carousel');
                  if (container) {
                    container.scrollBy({ left: -320, behavior: 'smooth' });
                  }
                }}
              >
                <ArrowRightIcon className="h-6 w-6 text-gray-600 rotate-180" />
              </button>
              
              <button 
                className="carousel-nav-button carousel-nav-button-right"
                onClick={() => {
                  const container = document.getElementById('featured-products-carousel');
                  if (container) {
                    container.scrollBy({ left: 320, behavior: 'smooth' });
                  }
                }}
              >
                <ArrowRightIcon className="h-6 w-6 text-gray-600" />
              </button>

              {/* Products Carousel */}
              <div 
                id="featured-products-carousel"
                className="carousel-track pb-4"
              >
                {displayProducts.length > 0 ? (
                  displayProducts.map((product) => (
                    <div key={product._id} className="carousel-item w-80">
                      <ProductCard product={product} />
                    </div>
                  ))
                ) : (
                  // Fallback content khi không có sản phẩm
                  <div className="flex items-center justify-center w-full py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CubeIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Chưa có sản phẩm
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Hiện tại chưa có sản phẩm nào trong hệ thống
                      </p>
                      <Link
                        to="/products"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Xem tất cả sản phẩm
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Scroll Indicators - chỉ hiển thị khi có sản phẩm */}
              {displayProducts.length > 0 && (
                <div className="carousel-indicators">
                  {[...Array(Math.ceil(displayProducts.length / 4))].map((_, index) => (
                    <button
                      key={index}
                      className="carousel-indicator"
                      onClick={() => {
                        const container = document.getElementById('featured-products-carousel');
                        if (container) {
                          container.scrollTo({ 
                            left: index * 320, 
                            behavior: 'smooth' 
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Xem tất cả sản phẩm
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <TagIcon className="h-8 w-8 text-purple-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Danh mục sản phẩm
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Duyệt theo các danh mục sản phẩm được tổ chức khoa học
            </p>
          </div>

          {categoriesLoading ? (
            <LoadingSkeleton type="category-card" count={8} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(categories || []).slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <TagIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="h-8 w-8 text-yellow-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
              Tính năng nổi bật
            </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá đầy đủ các tính năng của SmartShop để có trải nghiệm mua sắm tuyệt vời nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.name}
                to={feature.href}
                className="group bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${getColorClasses(feature.color)}`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <div className="text-2xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
                    {feature.stats}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  Khám phá ngay
                  <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <BuildingStorefrontIcon className="h-8 w-8 text-green-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Thương hiệu uy tín
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hợp tác với các thương hiệu hàng đầu thế giới và Việt Nam
            </p>
          </div>

          {brandsLoading ? (
            <LoadingSkeleton type="brand-card" count={6} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {(brands || []).slice(0, 6).map((brand) => (
                <Link
                  key={brand._id}
                  to={`/products?brand=${brand._id}`}
                  className="group bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BuildingStorefrontIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-green-600 transition-colors">
                    {brand.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn SmartShop?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với những ưu đãi đặc biệt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-r ${getGradientClasses(benefit.color)} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Khách hàng nói gì về chúng tôi?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những đánh giá chân thực từ khách hàng đã sử dụng dịch vụ của SmartShop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <GiftIcon className="h-12 w-12 text-yellow-400 mr-4" />
            <h2 className="text-4xl font-bold">
            Bắt đầu mua sắm ngay hôm nay!
          </h2>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Tham gia cùng hàng triệu khách hàng đã tin tưởng SmartShop. 
            Đăng ký ngay để nhận ưu đãi đặc biệt cho thành viên mới và miễn phí vận chuyển cho đơn hàng đầu tiên!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              🛍️ Mua sắm ngay
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105"
              >
                ✨ Đăng ký miễn phí
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-center mb-6">
              <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Đăng ký nhận thông báo
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Nhận thông báo về các ưu đãi đặc biệt, sản phẩm mới và khuyến mãi hấp dẫn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;