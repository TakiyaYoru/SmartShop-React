import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { 
  StarIcon, 
  ChatBubbleLeftIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { GET_USER_REVIEW } from '../../graphql/reviews';
import { useAuth } from '../../contexts/AuthContext';

const ReviewButton = ({ orderNumber, productId, productName, className = '' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Query để kiểm tra user đã review chưa
  const { data: reviewData, loading: reviewLoading } = useQuery(GET_USER_REVIEW, {
    variables: { productId },
    skip: !productId
  });

  const userReview = reviewData?.getProductReviews?.items?.find(
    review => review.user?._id === user?.id
  );

  const handleReviewClick = () => {
    if (userReview) {
      // Nếu đã review, hiển thị modal xem review
      setShowReviewModal(true);
    } else {
      // Nếu chưa review, navigate đến trang review
      navigate(`/review/${orderNumber}/${productId}`);
    }
  };

  const handleEditReview = () => {
    // Không cho phép edit, chỉ có thể xem
    // Nhưng có thể thêm logic sau này nếu cần
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index}>
        {index < rating ? (
          <StarIconSolid className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ));
  };

  if (reviewLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-9 bg-gray-200 rounded-md w-20"></div>
      </div>
    );
  }

  return (
    <>
      {/* Review Button */}
      <button
        onClick={handleReviewClick}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          userReview
            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${className}`}
      >
        {userReview ? (
          <>
            <EyeIcon className="w-4 h-4 mr-1" />
            Xem đánh giá
          </>
        ) : (
          <>
            <PencilIcon className="w-4 h-4 mr-1" />
            Đánh giá
          </>
        )}
      </button>

      {/* Review Modal */}
      {showReviewModal && userReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Đánh giá của bạn
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Product Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{productName}</h4>
                <p className="text-sm text-gray-600">Đánh giá ngày {formatDate(userReview.createdAt)}</p>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(userReview.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {userReview.rating}/5 sao
                  </span>
                </div>
              </div>

              {/* Comment */}
              {userReview.comment && (
                <div className="mb-4">
                  <div className="flex items-start space-x-2">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Bình luận:</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {userReview.comment}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              {userReview.images && userReview.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Hình ảnh đính kèm:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {userReview.images.map((image, index) => (
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

              {/* Admin Reply */}
              {userReview.adminReply && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Phản hồi từ SmartShop
                      </p>
                      <p className="text-sm text-blue-800">
                        {userReview.adminReply}
                      </p>
                      {userReview.adminReplyUpdatedAt && (
                        <p className="text-xs text-blue-600 mt-1">
                          {formatDate(userReview.adminReplyUpdatedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Đánh giá không thể chỉnh sửa hoặc xóa sau khi đã gửi.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewButton; 