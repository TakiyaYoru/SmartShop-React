// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/' : '/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl">🔍</div>
          <h1 className="mt-4 text-6xl font-bold text-gray-900">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Trang không tồn tại
          </h2>
          <p className="text-gray-600 mb-6">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="btn btn-primary w-full"
          >
            🏠 Về trang chủ
          </button>
          
          <button
            onClick={handleGoBack}
            className="btn btn-secondary w-full"
          >
            ← Quay lại trang trước
          </button>
        </div>

        {/* Additional Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Hoặc bạn có thể:
          </p>
          
          <div className="space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="block text-blue-600 hover:text-blue-500 text-sm"
                >
                  📱 Trang chủ SmartShop
                </Link>
                <Link
                  to="/products"
                  className="block text-blue-600 hover:text-blue-500 text-sm"
                >
                  🛍️ Xem sản phẩm
                </Link>
                <Link
                  to="/cart"
                  className="block text-blue-600 hover:text-blue-500 text-sm"
                >
                  🛒 Giỏ hàng của tôi
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-blue-600 hover:text-blue-500 text-sm"
                >
                  🔐 Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block text-blue-600 hover:text-blue-500 text-sm"
                >
                  📝 Tạo tài khoản mới
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Mẹo:</strong> Kiểm tra lại URL hoặc liên hệ với chúng tôi nếu bạn nghĩ đây là lỗi hệ thống.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;