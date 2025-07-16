// File: webfrontend/src/pages/ForgotPasswordPage.jsx (SIMPLE UI - SINGLE COLUMN)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  KeyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { FORGOT_PASSWORD_MUTATION, RESET_PASSWORD_MUTATION } from '../graphql/auth';

const ForgotPasswordPage = () => {
  // States
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // GraphQL mutations
  const [sendOTP, { loading: sendingOTP }] = useMutation(FORGOT_PASSWORD_MUTATION);
  const [resetPassword, { loading: resetting }] = useMutation(RESET_PASSWORD_MUTATION);

  // Timer for OTP resend
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Vui lòng nhập email hợp lệ' });
      return;
    }

    try {
      const { data } = await sendOTP({
        variables: { input: { email } }
      });

      if (data.sendPasswordResetOTP.success) {
        toast.success('Mã OTP đã được gửi đến email của bạn!');
        setStep(2);
        setTimeLeft(600); // 10 minutes
        setErrors({});
      } else {
        toast.error(data.sendPasswordResetOTP.message);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    const newErrors = {};

    if (otpString.length !== 6) {
      newErrors.otp = 'Vui lòng nhập đầy đủ mã OTP';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: {
          input: {
            email,
            otp: otpString,
            newPassword
          }
        }
      });

      if (data.verifyOTPAndResetPassword.success) {
        toast.success('Mật khẩu đã được đặt lại thành công!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(data.verifyOTPAndResetPassword.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;

    try {
      const { data } = await sendOTP({
        variables: { input: { email } }
      });

      if (data.sendPasswordResetOTP.success) {
        toast.success('Mã OTP mới đã được gửi!');
        setTimeLeft(600);
        setOtp(['', '', '', '', '', '']);
      } else {
        toast.error(data.sendPasswordResetOTP.message);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi lại OTP!');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex items-center">
          <Link 
            to="/login" 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại đăng nhập</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              {step === 1 ? (
                <EnvelopeIcon className="w-10 h-10 text-white" />
              ) : (
                <DevicePhoneMobileIcon className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {step === 1 ? 'Quên mật khẩu?' : 'Nhập mã OTP'}
          </h1>
          <p className="text-gray-600 text-lg">
            {step === 1 
              ? 'Nhập email để nhận mã OTP đặt lại mật khẩu'
              : `Mã OTP đã được gửi đến ${email}`
            }
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
          {step === 1 ? (
            /* Step 1: Email Input */
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
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
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none placeholder-gray-400`}
                    placeholder="Nhập địa chỉ email của bạn"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span className="text-sm">{errors.email}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={sendingOTP}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
              >
                {sendingOTP ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi OTP...
                  </>
                ) : (
                  <>
                    Gửi mã OTP
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP + New Password */
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Mã OTP (6 số)
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 ${
                        errors.otp
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      } focus:outline-none`}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span className="text-sm">{errors.otp}</span>
                  </div>
                )}
                
                {/* Timer and Resend */}
                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-600">
                      Mã OTP sẽ hết hạn sau: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={sendingOTP}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors hover:underline disabled:opacity-50"
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-3">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <KeyIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                      errors.newPassword 
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none placeholder-gray-400`}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        const newErrors = { ...errors };
                        delete newErrors.newPassword;
                        setErrors(newErrors);
                      }
                    }}
                  />
                </div>
                {errors.newPassword && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span className="text-sm">{errors.newPassword}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <KeyIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-200 bg-gray-50/50 ${
                      errors.confirmPassword 
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none placeholder-gray-400`}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        const newErrors = { ...errors };
                        delete newErrors.confirmPassword;
                        setErrors(newErrors);
                      }
                    }}
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span className="text-sm">{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              {/* Show Password Toggle */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    Hiển thị mật khẩu
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={resetting}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
              >
                {resetting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đặt lại mật khẩu...
                  </>
                ) : (
                  <>
                    Đặt lại mật khẩu
                    <CheckCircleIcon className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Cần hỗ trợ?{' '}
            <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;