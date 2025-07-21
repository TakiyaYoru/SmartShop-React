// Enhanced LoginForm với layout 2 cột như CellphoneS - CHỈ THÊM GOOGLE BUTTON
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  GiftIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  PercentBadgeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useLogin } from '../../hooks/useAuth';
import GoogleSignInButton from './GoogleSignInButton'; // ← THÊM IMPORT

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login, loading } = useLogin();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await login(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Benefits & Promotions */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-20 text-white">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  Chào mừng trở lại!
                </h1>
                <p className="text-xl text-blue-100">
                  Đăng nhập để trải nghiệm mua sắm tuyệt vời
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <GiftIcon className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <p className="text-sm font-semibold">Ưu đãi độc quyền</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <TruckIcon className="h-8 w-8 mx-auto mb-2 text-green-300" />
                  <p className="text-sm font-semibold">Miễn phí vận chuyển</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <CreditCardIcon className="h-8 w-8 mx-auto mb-2 text-purple-300" />
                  <p className="text-sm font-semibold">Thanh toán an toàn</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <StarIcon className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                  <p className="text-sm font-semibold">Tích điểm thưởng</p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm italic text-blue-100 mb-3">
                  "Sản phẩm chất lượng, giao hàng nhanh, dịch vụ tuyệt vời!"
                </p>
                <p className="text-xs font-semibold text-blue-200">
                  - Nguyễn Văn A, Khách hàng thân thiết
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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
                Đăng nhập <span className="text-blue-600">SMEMBER</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Hãy đăng nhập để mua sắp thôi
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
              <div className="space-y-6">
                
                {/* ===== THÊM GOOGLE BUTTON Ở ĐÂY ===== */}
                <div className="mb-6">
                  <GoogleSignInButton text="Đăng nhập với Google" />
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      Hoặc đăng nhập bằng tài khoản
                    </span>
                  </div>
                </div>
                {/* ===== HẾT PHẦN THÊM ===== */}

                {/* Username Field - GIỮ NGUYÊN CODE CŨ */}
                <div className="space-y-3">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                    User Name
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
                      placeholder="Nhập user name của bạn"
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

                {/* Password Field - GIỮ NGUYÊN CODE CŨ */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Mật khẩu
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
                      autoComplete="current-password"
                      required
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                        errors.password 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : focusedField === 'password'
                            ? 'border-blue-500 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none placeholder-gray-400`}
                      placeholder="Nhập mật khẩu của bạn"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
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

                {/* Remember & Forgot - GIỮ NGUYÊN */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Nhớ mật khẩu
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>

                {/* Submit Button - GIỮ NGUYÊN */}
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transform hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>ĐĂNG NHẬP</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </button>

                {/* Register Link - GIỮ NGUYÊN */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </div>
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

export default LoginForm;