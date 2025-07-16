import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  StarIcon, 
  ChatBubbleLeftIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  GET_ALL_REVIEWS_FOR_ADMIN, 
  GET_PENDING_ADMIN_REVIEWS,
  ADMIN_REPLY_TO_REVIEW,
  DELETE_ADMIN_REPLY 
} from '../../graphql/reviews';

const AdminReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [filter, setFilter] = useState({ first: 20, offset: 0 });

  // Queries
  const { data: allReviewsData, loading: allLoading, refetch: refetchAll } = useQuery(
    GET_ALL_REVIEWS_FOR_ADMIN, 
    { variables: { filter } }
  );

  const { data: pendingReviewsData, loading: pendingLoading, refetch: refetchPending } = useQuery(
    GET_PENDING_ADMIN_REVIEWS, 
    { variables: { filter } }
  );

  // Mutations
  const [addReply] = useMutation(ADMIN_REPLY_TO_REVIEW);
  const [deleteReply] = useMutation(DELETE_ADMIN_REPLY);

  // Auto refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'all') {
        refetchAll();
      } else {
        refetchPending();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab, refetchAll, refetchPending]);

  const reviews = activeTab === 'all' 
    ? allReviewsData?.getAllReviewsForAdmin?.items || []
    : pendingReviewsData?.getPendingAdminReviews?.items || [];

  const totalCount = activeTab === 'all'
    ? allReviewsData?.getAllReviewsForAdmin?.totalCount || 0
    : pendingReviewsData?.getPendingAdminReviews?.totalCount || 0;

  // Calculate statistics
  const calculateStats = () => {
    const allReviews = allReviewsData?.getAllReviewsForAdmin?.items || [];
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach(review => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
    });

    const pendingReviews = pendingReviewsData?.getPendingAdminReviews?.items || [];
    const pendingCount = pendingReviews.length;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      pendingCount
    };
  };

  const stats = calculateStats();

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    setIsReplying(true);
    try {
      await addReply({
        variables: {
          reviewId: selectedReview._id,
          reply: replyText.trim()
        }
      });
      
      setReplyText('');
      setSelectedReview(null);
      setIsReplying(false);
      
      // Refetch data
      if (activeTab === 'all') {
        refetchAll();
      } else {
        refetchPending();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      setIsReplying(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phản hồi này?')) return;

    try {
      await deleteReply({
        variables: { reviewId }
      });
      
      // Refetch data
      if (activeTab === 'all') {
        refetchAll();
      } else {
        refetchPending();
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-600">Quản lý và phản hồi đánh giá sản phẩm từ khách hàng</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>Tự động cập nhật mỗi 10 giây</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ phản hồi</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đánh giá 5 sao</p>
              <p className="text-2xl font-bold text-green-600">{stats.ratingDistribution[5] || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} className="h-3 w-3 text-white fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Phân bố đánh giá</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.ratingDistribution[rating] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium text-gray-600">{rating}</span>
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tất cả đánh giá ({stats.totalReviews})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chờ phản hồi ({stats.pendingCount})
            </button>
          </nav>
        </div>

        {/* Reviews List */}
        <div className="p-6">
          {allLoading || pendingLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === 'all' ? 'Chưa có đánh giá nào' : 'Không có đánh giá nào chờ phản hồi'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {review.user?.firstName?.charAt(0)}{review.user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user?.firstName} {review.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">@{review.user?.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-gray-900">
                      Sản phẩm: {review.product?.name || 'Không xác định'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Đơn hàng: {review.order?.orderNumber || 'Không có đơn hàng'}
                    </p>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <p className="text-gray-700">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Phản hồi từ Admin
                          </p>
                          <p className="text-blue-800">{review.adminReply}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {formatDate(review.adminReplyUpdatedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteReply(review._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reply Actions */}
                  <div className="flex items-center space-x-3">
                    {!review.adminReply ? (
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span>Phản hồi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Sửa phản hồi</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Phản hồi đánh giá
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Đánh giá từ {selectedReview.user?.firstName} {selectedReview.user?.lastName}:</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                {selectedReview.comment}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phản hồi của bạn
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập phản hồi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReply}
                disabled={isReplying || !replyText.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isReplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Gửi phản hồi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage; 