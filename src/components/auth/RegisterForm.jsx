// src/components/auth/RegisterForm.jsx
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

    // Phone validation (optional)
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Terms agreement
    if (!agreeTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản dịch vụ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Remove confirmPassword before sending
    const { confirmPassword, ...registerData } = formData;
    await register(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Benefits & Promotions */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">SmartShop</h1>
                  <p className="text-blue-100 text-lg">Điện tử thông minh</p>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Tham gia <span className="text-yellow-300">SMEMBER</span> ngay hôm nay!
              </h2>
              <p className="text-blue-100 text-xl leading-relaxed">
                Tạo tài khoản để nhận những ưu đãi đặc biệt và trải nghiệm mua sắm tuyệt vời
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6 mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <GiftIcon className="w-7 h-7 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Tặng voucher 200.000đ</h3>
                    <p className="text-blue-100 text-base leading-relaxed">cho thành viên mới khi đăng ký lần đầu</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <PercentBadgeIcon className="w-7 h-7 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Chiết khấu đến 5%</h3>
                    <p className="text-blue-100 text-base leading-relaxed">khi mua các sản phẩm tại SmartShop</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <TruckIcon className="w-7 h-7 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Miễn phí giao hàng</h3>
                    <p className="text-blue-100 text-base leading-relaxed">cho đơn hàng từ 300.000đ trở lên</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="w-7 h-7 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Bảo mật thông tin</h3>
                    <p className="text-blue-100 text-base leading-relaxed">cam kết bảo vệ thông tin cá nhân của bạn</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <StarIcon className="w-7 h-7 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Tích điểm thưởng</h3>
                    <p className="text-blue-100 text-base leading-relaxed">tích lũy điểm và đổi quà hấp dẫn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button className="text-yellow-300 hover:text-yellow-200 font-semibold text-lg transition-colors hover:underline">
                Xem chi tiết chính sách thành viên →
              </button>
            </div>

            {/* Mascot/Illustration */}
            <div className="absolute bottom-8 right-8 opacity-20">
              <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-20 h-20 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Header */}
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

            {/* Form Header */}
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
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

                {/* Email Field */}
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
                      placeholder="Nhập email của bạn"
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

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
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
                          : focusedField === 'firstName'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Họ"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
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
                          : focusedField === 'lastName'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Tên"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.lastName && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        <span className="text-sm">{errors.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-3">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Số điện thoại
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
                      placeholder="Nhập số điện thoại (tùy chọn)"
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

                {/* Password Field */}
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

                {/* Confirm Password Field */}
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

                {/* Terms Agreement */}
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      Tôi đồng ý với{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
                        Điều khoản dịch vụ
                      </a>{' '}
                      và{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
                        Chính sách bảo mật
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span className="text-sm">{errors.terms}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    <>
                      Tạo tài khoản
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 text-base">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer */}
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