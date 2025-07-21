// src/components/auth/RegisterForm.jsx - CHỈ THÊM GOOGLE BUTTON
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  GiftIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  PercentBadgeIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useRegister } from '../../hooks/useAuth';
import GoogleSignInButton from './GoogleSignInButton'; // ← THÊM IMPORT

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { register, loading } = useRegister();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Họ là bắt buộc';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Tên là bắt buộc';
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^[0-9+\-\s]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Terms agreement
    if (!agreeTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined
    };
    
    await register(registrationData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Benefits & Promotions - GIỮ NGUYÊN */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-20 text-white">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  Tham gia SmartShop!
                </h1>
                <p className="text-xl text-green-100">
                  Tạo tài khoản để nhận ưu đãi và quà tặng đặc biệt
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <GiftIcon className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <p className="text-sm font-semibold">Quà tặng chào mừng</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <PercentBadgeIcon className="h-8 w-8 mx-auto mb-2 text-red-300" />
                  <p className="text-sm font-semibold">Giảm giá 15%</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                  <p className="text-sm font-semibold">Bảo hành mở rộng</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <StarIcon className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                  <p className="text-sm font-semibold">Thành viên VIP</p>
                </div>
              </div>

              {/* Promotion */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-gray-900">
                <div className="text-2xl font-bold mb-2">🎉 KHUYẾN MÃI ĐĂNG KÝ</div>
                <p className="text-lg font-semibold mb-2">Giảm ngay 200.000đ</p>
                <p className="text-sm">Cho đơn hàng đầu tiên từ 500.000đ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Header - GIỮ NGUYÊN */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">S</span>
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                SmartShop
              </h2>
              <p className="text-gray-600 text-lg">Điện tử thông minh</p>
            </div>

            {/* Form Header - GIỮ NGUYÊN */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Tạo tài khoản <span className="text-blue-600">SMEMBER</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Tham gia cùng hàng triệu khách hàng đã tin tưởng SmartShop
              </p>
            </div>

            {/* Register Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
              
              {/* ===== THÊM GOOGLE BUTTON Ở ĐÂY ===== */}
              <div className="mb-6">
                <GoogleSignInButton text="Đăng ký với Google" />
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Hoặc đăng ký bằng email
                  </span>
                </div>
              </div>
              {/* ===== HẾT PHẦN THÊM ===== */}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field - GIỮ NGUYÊN TẤT CẢ PHẦN NÀY */}
                <div className="space-y-3">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                    Tên đăng nhập *
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                      focusedField === 'username' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.username 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : focusedField === 'username'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Nhập tên đăng nhập"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                    />
                    {formData.username && !errors.username && formData.username.length >= 3 && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span className="text-sm">{errors.username}</span>
                    </div>
                  )}
                </div>

                {/* Email Field - GIỮ NGUYÊN */}
                <div className="space-y-3">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email *
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                      focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      <EnvelopeIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.email 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : focusedField === 'email'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                    {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span className="text-sm">{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* First Name and Last Name - GIỮ NGUYÊN */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                      Họ *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      className={`w-full px-4 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.firstName 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Họ"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span className="text-sm">{errors.firstName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                      Tên *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      className={`w-full px-4 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.lastName 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Tên"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span className="text-sm">{errors.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Field - GIỮ NGUYÊN */}
                <div className="space-y-3">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Số điện thoại (tùy chọn)
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                      focusedField === 'phone' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      <PhoneIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.phone 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : focusedField === 'phone'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span className="text-sm">{errors.phone}</span>
                    </div>
                  )}
                </div>

                {/* Password Field - GIỮ NGUYÊN */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Mật khẩu *
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                      focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      <LockClosedIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.password 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : focusedField === 'password'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span className="text-sm">{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field - GIỮ NGUYÊN */}
                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    Xác nhận mật khẩu *
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                      focusedField === 'confirmPassword' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      <LockClosedIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.confirmPassword 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : focusedField === 'confirmPassword'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span className="text-sm">{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                {/* Terms Agreement - GIỮ NGUYÊN */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      id="agree-terms"
                      name="agree-terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor="agree-terms" className="text-sm text-gray-700 leading-5">
                      Tôi đồng ý với{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline">
                        Điều khoản dịch vụ
                      </Link>{' '}
                      và{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline">
                        Chính sách bảo mật
                      </Link>{' '}
                      của SmartShop
                    </label>
                  </div>
                  {errors.terms && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span className="text-sm">{errors.terms}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button - GIỮ NGUYÊN */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transform hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Đang đăng ký...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>TẠO TÀI KHOẢN SMEMBER</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </button>

                {/* Login Link - GIỮ NGUYÊN */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer - GIỮ NGUYÊN */}
            <div className="text-center text-sm text-gray-500">
              <p>
                Mua sắm, sửa chữa tại{' '}
                <span className="font-semibold text-blue-600">smartshop.com.vn</span> và{' '}
                <span className="font-semibold text-purple-600">dienthoaivui.com.vn</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;