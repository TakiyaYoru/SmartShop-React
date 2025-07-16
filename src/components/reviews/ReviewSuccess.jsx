import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  ArrowLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ReviewSuccess = ({ orderNumber, productId, productName, review, onViewReview }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index}>
        {index < rating ? (
          <StarIconSolid className="w-5 h-5 text-yellow-400" />
        ) : (
          <StarIcon className="w-5 h-5 text-gray-300" />
        )}
      </span>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Đánh giá đã được gửi thành công!
        </h1>
        <p className="text-gray-600">
          Cảm ơn bạn đã chia sẻ trải nghiệm với chúng tôi
        </p>
      </div>

      {/* Review Summary Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Product Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <PhotoIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {productName}
              </h2>
              <p className="text-gray-600">
                Đánh giá ngày {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="p-6">
          {/* Rating */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              {renderStars(review.rating)}
              <span className="text-lg font-medium text-gray-900">
                {review.rating}/5 sao
              </span>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="mb-4">
              <div className="flex items-start space-x-2">
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Bình luận của bạn:</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Hình ảnh đính kèm:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Đánh giá của bạn sẽ được hiển thị công khai và không thể chỉnh sửa sau khi đã gửi.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate(`/orders/${orderNumber}`)}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Quay lại đơn hàng
        </button>
        
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Xem tất cả đơn hàng
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Bạn có thể xem lại đánh giá của mình bất cứ lúc nào từ trang chi tiết đơn hàng
        </p>
        <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
          <EyeIcon className="w-4 h-4 mr-1" />
          Nút "Xem đánh giá" sẽ xuất hiện thay vì "Đánh giá"
        </div>
      </div>
    </div>
  );
};

export default ReviewSuccess; 